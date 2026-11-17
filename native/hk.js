/* ======================================================================
   학운위 회의 장부 — 경남 기준으로 다시 만든 화면
   회의 한 번 = 장부 한 줄. 회의마다 위원 → 안건 → 소집(7일 전) → 회의 → 결과(학교장 이송)를
   좌→우로 따라가며, 그 단계에 필요한 문서(11종)를 바로 보고·한글(hwpx)로 받고·인쇄한다.
   문서 내용과 한글 저장은 길잡이 '학운위 문서 도구'의 엔진을 그대로 쓴다(make_hk.py가 끼워 넣음).
   기준
   - 경상남도립학교 운영위원회 운영 조례(제5815호, 2025. 1. 31.) 회의 소집 등
   - 초·중등교육법 시행령 제58조(위원 구성 비율)
   저장: hk.meetings (회의 장부), 안건 원문은 브라우저 IndexedDB(kbg-hakunwi)
   ====================================================================== */
(function(){ "use strict";
var HK={};
/* 엔진이 부르는 원래 화면 함수 자리 — 새 화면에서는 필요 없음 */
function renderAgendas(){} function renderAttach(){} function refresh(){} function renderPreview(){}
function onChange(){ if(HK.persist) HK.persist(); }

/* ===== 문서 엔진(원본 학운위 문서 도구에서 가져옴) ===== */
const APP_NAME='학운위 문서 도구', APP_VER='1.1', STORE_KEY='sowi_pro_v1';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const xesc=s=>String(s??'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const xun=s=>String(s??'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#x([0-9a-fA-F]+);/g,(m,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(m,d)=>String.fromCodePoint(+d)).replace(/&amp;/g,'&');
const trim=s=>String(s??'').trim();
const debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};};

/* ---------- 날짜 ---------- */
const WD=['일','월','화','수','목','금','토'];
function pd(s){ if(!s) return null; if(s instanceof Date) return s; const m=/^(\d{4})[.\-\/]\s*(\d{1,2})[.\-\/]\s*(\d{1,2})/.exec(String(s).trim()); if(!m) return null; const d=new Date(+m[1],+m[2]-1,+m[3]); return isNaN(d)?null:d; }
function iso(d){ if(!d) return ''; return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function fmtDot(s){ const d=pd(s); return d?`${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.`:'    .   .   .'; }
function fmtDotW(s){ const d=pd(s); return d?`${fmtDot(s)}(${WD[d.getDay()]})`:'    .   .   .(   )'; }
function fmtKo(s){ const d=pd(s); return d?`${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`:'    년   월   일'; }
function wd(s){ const d=pd(s); return d?WD[d.getDay()]:''; }
function daysBetween(a,b){ const da=pd(a),db=pd(b); if(!da||!db) return null; return Math.round((db-da)/864e5); }
function addDays(s,n){ const d=pd(s); if(!d) return ''; const x=new Date(d); x.setDate(x.getDate()+n); return iso(x); }
function excelSerialToISO(n){ if(typeof n!=='number'||!isFinite(n)) return ''; const ms=Math.round((n-25569)*864e5); const d=new Date(ms); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }
function isoToExcelSerial(s){ const d=pd(s); if(!d) return null; return Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(1899,11,30))/864e5); }
function fmtTime(t){ t=trim(t); if(!t) return ''; const m=/^(\d{1,2}):(\d{2})/.exec(t); return m?`${m[1].padStart(2,'0')}:${m[2]}`:t; }

/* ---------- 토스트 / 팝업 ---------- */
function toast(m){ if(HK.toast) HK.toast(String(m)); }
function popup(title,bodyHtml){ if(HK.toast) HK.toast(title+' — '+String(bodyHtml).replace(/<br>/g,' / ').replace(/<[^>]+>/g,'')); }
function confirmPop(title,bodyHtml,okText,fn){ if(confirm(String(bodyHtml).replace(/<br>/g,' ').replace(/<[^>]+>/g,''))) fn&&fn(); }

/* ---------- 파일 다운로드 ---------- */
function download(blob,name){ return HK.save(blob,name); }
function safeName(s){ return String(s).replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,' ').trim(); }

/* ---------- CRC32 / ZIP(저장 방식, 무압축) ---------- */
const CRC_T=(()=>{const t=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c;}return t;})();
function crc32(u8){let c=-1;for(let i=0;i<u8.length;i++)c=CRC_T[(c^u8[i])&255]^(c>>>8);return (c^-1)>>>0;}
function zipStore(files,mime){
  const enc=new TextEncoder(); const parts=[]; const cd=[]; let off=0; const now=new Date();
  const dt=((now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1))&0xffff, dd=(((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate())&0xffff;
  for(const f of files){
    const name=enc.encode(f.name); const data=typeof f.data==='string'?enc.encode(f.data):f.data; const crc=crc32(data);
    const lh=new Uint8Array(30+name.length); const v=new DataView(lh.buffer);
    v.setUint32(0,0x04034b50,true); v.setUint16(4,20,true); v.setUint16(6,0x0800,true); v.setUint16(8,0,true); v.setUint16(10,dt,true); v.setUint16(12,dd,true); v.setUint32(14,crc,true); v.setUint32(18,data.length,true); v.setUint32(22,data.length,true); v.setUint16(26,name.length,true); v.setUint16(28,0,true); lh.set(name,30);
    parts.push(lh,data);
    const ch=new Uint8Array(46+name.length); const c=new DataView(ch.buffer);
    c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x0800,true); c.setUint16(10,0,true); c.setUint16(12,dt,true); c.setUint16(14,dd,true); c.setUint32(16,crc,true); c.setUint32(20,data.length,true); c.setUint32(24,data.length,true); c.setUint16(28,name.length,true); c.setUint16(30,0,true); c.setUint16(32,0,true); c.setUint16(34,0,true); c.setUint16(36,0,true); c.setUint32(38,0,true); c.setUint32(42,off,true); ch.set(name,46);
    cd.push(ch); off+=lh.length+data.length;
  }
  const cdLen=cd.reduce((a,b)=>a+b.length,0); const eocd=new Uint8Array(22); const e=new DataView(eocd.buffer);
  e.setUint32(0,0x06054b50,true); e.setUint16(4,0,true); e.setUint16(6,0,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true); e.setUint32(12,cdLen,true); e.setUint32(16,off,true); e.setUint16(20,0,true);
  return new Blob([...parts,...cd,eocd],{type:mime||'application/zip'});
}

/* ---------- INFLATE (DEFLATE 해제, tinf 알고리즘) ---------- */
const inflateRaw=(()=>{
  const LB=new Uint16Array(30),LE=new Uint8Array(30),DB=new Uint16Array(30),DE=new Uint8Array(30);
  const CL=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
  function bb(bits,base,delta,first){ let i,sum; for(i=0;i<delta;i++) bits[i]=0; for(i=0;i<30-delta;i++) bits[i+delta]=(i/delta)|0; for(sum=first,i=0;i<30;i++){ base[i]=sum; sum+=1<<bits[i]; } }
  bb(LE,LB,4,3); bb(DE,DB,2,1); LE[28]=0; LB[28]=258;
  function Tree(){ this.table=new Uint16Array(16); this.trans=new Uint16Array(288); }
  const SLT=new Tree(),SDT=new Tree();
  (function(lt,dt){ let i; for(i=0;i<7;i++) lt.table[i]=0; lt.table[7]=24; lt.table[8]=152; lt.table[9]=112; for(i=0;i<24;i++) lt.trans[i]=256+i; for(i=0;i<144;i++) lt.trans[24+i]=i; for(i=0;i<8;i++) lt.trans[24+144+i]=280+i; for(i=0;i<112;i++) lt.trans[24+144+8+i]=144+i; for(i=0;i<5;i++) dt.table[i]=0; dt.table[5]=32; for(i=0;i<32;i++) dt.trans[i]=i; })(SLT,SDT);
  function build(t,len,off,num){ const offs=new Uint16Array(16); let i,sum; for(i=0;i<16;i++) t.table[i]=0; for(i=0;i<num;i++) t.table[len[off+i]]++; t.table[0]=0; for(sum=0,i=0;i<16;i++){ offs[i]=sum; sum+=t.table[i]; } for(i=0;i<num;i++) if(len[off+i]) t.trans[offs[len[off+i]]++]=i; }
  function St(src,size){ this.s=src; this.i=0; this.bit=0; this.tag=0; this.out=new Uint8Array(Math.max(1024,size||src.length*4)); this.o=0; this.lt=new Tree(); this.dt=new Tree(); }
  function put(d,b){ if(d.o>=d.out.length){ const n=new Uint8Array(d.out.length*2); n.set(d.out); d.out=n; } d.out[d.o++]=b; }
  function gb(d){ if(!d.bit){ if(d.i>=d.s.length) throw new Error('inflate: 데이터 끝'); d.tag=d.s[d.i++]; d.bit=8; } const b=d.tag&1; d.tag>>>=1; d.bit--; return b; }
  function rb(d,n,base){ let v=0; for(let i=0;i<n;i++) v|=gb(d)<<i; return v+base; }
  function sym(d,t){ let sum=0,cur=0,len=0; do{ cur=2*cur+gb(d); len++; sum+=t.table[len]; cur-=t.table[len]; } while(cur>=0); return t.trans[sum+cur]; }
  function trees(d,lt,dt){ const len=new Uint8Array(320); const hlit=rb(d,5,257),hdist=rb(d,5,1),hclen=rb(d,4,4); for(let i=0;i<hclen;i++) len[CL[i]]=rb(d,3,0); const ct=new Tree(); build(ct,len,0,19); for(let n=0;n<hlit+hdist;){ const s=sym(d,ct); if(s===16){ const p=len[n-1]; for(let l=rb(d,2,3);l;l--) len[n++]=p; } else if(s===17){ for(let l=rb(d,3,3);l;l--) len[n++]=0; } else if(s===18){ for(let l=rb(d,7,11);l;l--) len[n++]=0; } else len[n++]=s; } build(lt,len,0,hlit); build(dt,len,hlit,hdist); }
  function block(d,lt,dt){ for(;;){ let s=sym(d,lt); if(s===256) return; if(s<256){ put(d,s); continue; } s-=257; const l=rb(d,LE[s],LB[s]); const ds=sym(d,dt); const off=d.o-rb(d,DE[ds],DB[ds]); for(let i=0;i<l;i++) put(d,d.out[off+i]); } }
  function stored(d){ d.bit=0; d.tag=0; const l=d.s[d.i]|(d.s[d.i+1]<<8); d.i+=4; for(let i=0;i<l;i++) put(d,d.s[d.i++]); }
  return function(src,size){ const d=new St(src,size); let fin; do{ fin=gb(d); const t=rb(d,2,0); if(t===0) stored(d); else if(t===1) block(d,SLT,SDT); else if(t===2){ trees(d,d.lt,d.dt); block(d,d.lt,d.dt); } else throw new Error('inflate: 잘못된 블록'); } while(!fin); return d.out.subarray(0,d.o); };
})();

/* ---------- ZIP 읽기 ---------- */
function unzip(u8){
  const v=new DataView(u8.buffer,u8.byteOffset,u8.byteLength); let e=-1;
  for(let i=u8.length-22;i>=Math.max(0,u8.length-70000);i--){ if(v.getUint32(i,true)===0x06054b50){ e=i; break; } }
  if(e<0) throw new Error('ZIP(엑셀) 형식이 아닙니다');
  const n=v.getUint16(e+10,true); let p=v.getUint32(e+16,true); const files={}; const dec=new TextDecoder();
  for(let i=0;i<n;i++){ if(v.getUint32(p,true)!==0x02014b50) throw new Error('ZIP 목록 손상'); const method=v.getUint16(p+10,true),csz=v.getUint32(p+20,true),usz=v.getUint32(p+24,true),nl=v.getUint16(p+28,true),el=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true); const name=dec.decode(u8.subarray(p+46,p+46+nl)); files[name]={method,csz,usz,lo}; p+=46+nl+el+cl; }
  return { names:Object.keys(files), has(n){ return !!files[n]; },
    get(name){ const f=files[name]; if(!f) return null; const nl=v.getUint16(f.lo+26,true),el=v.getUint16(f.lo+28,true); const st=f.lo+30+nl+el; const data=u8.subarray(st,st+f.csz); if(f.method===0) return data; if(f.method===8) return inflateRaw(data,f.usz); throw new Error('지원하지 않는 압축 방식: '+f.method); },
    text(name){ const d=this.get(name); return d?dec.decode(d):null; } };
}

/* =====================================================================
   상태(state) — 입력 자료 전체
   ===================================================================== */
const DEF_OPTS=()=>({
  ordinance:'경상남도립학교 운영위원회 운영 조례',
  article:'제19조(회의소집 등)',
  article2:'제19조 제3항',
  etcLine:'홈페이지 게시판 안내 실시(안내공고문 및 안내장 탑재)',
  refLine:'학부모, 교직원, 지역인사 방청가능',
  signer:'운영위원회위원장',
  listAll:true, resultTable:true, agendaPage:true
});
const DEF=()=>({
  v:1,
  school:{name:'',zip:'',addr:'',tel:'',fax:'',web:''},
  meet:{year:String(new Date().getFullYear()),term:'',no:'',kind:'정기회',date:'',time:'',place:'',pdate:''},
  staff:{manager:'',secretary:'',secTitle:'행정실장',principal:'',chair:'',vice:'',recorderTitle:''},
  members:{parent:[],teacher:[],local:[]},
  docs:{noticeNo:'',submitNo:'',no1:'',no2:'',no3:'',no4:'',noticeDate:'',proposeDate:'',resultDate:''},
  agendas:[],
  attach:[],
  minutes:{staffAttend:'',openRemark:'',principalRemark:'',others:'',attConfirmed:false},
  opts:DEF_OPTS(),
  done:{s4:false,s5:false,s6:false},
  sample:false
});
let S=DEF();
const newAgenda=(o={})=>({no:'',title:'',dept:'',result:'원안가결',vote:'전원찬성',presenter:'',summary:'',qna:'',...o});
const newMember=(name)=>({name:trim(name),attend:true});

/* 깊은 병합(불러오기용) — 기본 구조를 유지하면서 값만 덮어씀 */
function mergeState(src){
  const d=DEF();
  if(!src||typeof src!=='object') return d;
  for(const k of ['school','meet','staff','docs','minutes','opts','done']){ if(src[k]&&typeof src[k]==='object') Object.assign(d[k],src[k]); }
  for(const g of ['parent','teacher','local']){ const arr=src.members&&src.members[g]; if(Array.isArray(arr)) d.members[g]=arr.map(m=>typeof m==='string'?newMember(m):({name:trim(m.name),attend:m.attend!==false})).filter(m=>m.name); }
  if(Array.isArray(src.agendas)) d.agendas=src.agendas.map(a=>newAgenda(a));
  if(Array.isArray(src.attach)) d.attach=src.attach.filter(a=>a&&Array.isArray(a.blocks)).map(a=>({name:String(a.name||''),title:String(a.title||''),dept:String(a.dept||''),no:String(a.no||''),agIdx:Number.isInteger(a.agIdx)?a.agIdx:-1,blocks:a.blocks,stats:a.stats||{},...(a.kind==='att'?{kind:'att'}:{})}));
  d.sample=src.sample===true;
  for(const k of Object.keys(d.meet)) d.meet[k]=d.meet[k]==null?'':String(d.meet[k]);
  for(const k of Object.keys(d.docs)) d.docs[k]=d.docs[k]==null?'':String(d.docs[k]);
  for(const k of Object.keys(d.school)) d.school[k]=d.school[k]==null?'':String(d.school[k]);
  if(d.meet.date) d.meet.date=iso(pd(d.meet.date))||'';
  for(const k of ['noticeDate','proposeDate','resultDate']) if(d.docs[k]) d.docs[k]=iso(pd(d.docs[k]))||'';
  return d;
}

/* ---------- 파생값 ---------- */
function allMembers(){ return [...S.members.parent,...S.members.teacher,...S.members.local]; }
function memberCount(){ return allMembers().length; }
function attendCount(){ return allMembers().filter(m=>m.attend).length; }
function attKnown(){ return !!(S.minutes&&S.minutes.attConfirmed)||allMembers().some(m=>!m.attend); }
function agendaList(){ return S.agendas.filter(a=>trim(a.title)); }
function committee(){ return (trim(S.school.name)||'○○학교')+'운영위원회'; }
function meetTitle(){ return `${S.meet.year||'    '}학년도 제${S.meet.no||'  '}회 ${committee()} ${S.meet.kind||'정기회'}`; }
function meetShort(){ return `제${S.meet.no||'  '}회 ${committee()} ${S.meet.kind||'정기회'}`; }
function whenStr(){ return `${fmtDotW(S.meet.date)} ${fmtTime(S.meet.time)}~`; }
function placeStr(){ return `우리학교 ${trim(S.meet.place)}`; }
function targetStr(){ return `제${S.meet.term||'  '}기 ${committee()} 위원 ${memberCount()}명`; }
function firstAgenda(){ const l=agendaList(); return l.length?trim(l[0].title):'(안건명)'; }
function restCount(){ return Math.max(0,agendaList().length-1); }
function agendaSummary(q1,q2){ const l=agendaList(); const f=firstAgenda(); return l.length<=1?`${q1||''}${f}${q2||''}`:`${q1||''}${f}${q2||''} 외 ${l.length-1}건`; }
function docNo(n){ return `${committee()}-${trim(n)||'    '}`; }

/* ---------- 자동 저장 ---------- */
function _persist0(){ idbSaveAttach(); const {attach,...rest}=S; try{ localStorage.setItem(STORE_KEY,JSON.stringify(rest)); }catch(e){}
  try{ if(attach&&attach.length) localStorage.setItem(STORE_KEY+'_at',JSON.stringify(attach.filter(a=>!(a.blocks||[]).some(x=>x.t==='img')))); else localStorage.removeItem(STORE_KEY+'_at'); }catch(e){ if(!persist._warned){ persist._warned=true; setTimeout(()=>toast('취합한 안건 파일이 커서 브라우저 자동 저장에서는 빠집니다. 심의자료를 한글 파일로 먼저 저장해 두세요',6000),0); } } }
const persistLater=debounce(()=>HK.persist&&HK.persist(),300);
function _restore0(){ try{ const raw=localStorage.getItem(STORE_KEY); if(!raw) return false; const o=JSON.parse(raw); try{ const at=localStorage.getItem(STORE_KEY+'_at'); if(at) o.attach=JSON.parse(at); }catch(e){} S=mergeState(o); return true; }catch(e){ return false; } }

/* ---------- 경로 접근 ---------- */
function getPath(p){ return p.split('.').reduce((o,k)=>o==null?undefined:o[k],S); }
function setPath(p,v){ const ks=p.split('.'); let o=S; for(let i=0;i<ks.length-1;i++){ if(o[ks[i]]==null) o[ks[i]]={}; o=o[ks[i]]; } o[ks[ks.length-1]]=v; }

/* ---------- 예시 자료 ---------- */
function sampleState(){
  const y=new Date().getFullYear();
  const d=new Date(); d.setDate(d.getDate()+10); const meet=iso(d);
  const s=DEF();
  s.school={name:'○○고등학교',zip:'51000',addr:'경상남도 ○○시 ○○로 00',tel:'055-000-0000',fax:'055-000-0001',web:''};
  s.meet={year:String(y),term:'19',no:'120',kind:'정기회',date:meet,time:'15:30',place:'1층 교장실'};
  s.staff={manager:'정행정',secretary:'정행정',secTitle:'행정실장',principal:'김교장',chair:'박학부',vice:'이지역',recorderTitle:'행정실장'};
  s.members={parent:['박학부','최은희','정민수','오수진','김한별'].map(newMember),teacher:['김교장','이교사','윤선생','한교사'].map(newMember),local:['이지역','장인사'].map(newMember)};
  s.docs={noticeNo:'10',submitNo:'교무-1234',no1:'113-1',no2:'113-2',no3:'113-3',no4:'113-4',noticeDate:addDays(meet,-8),proposeDate:addDays(meet,-8),resultDate:meet};
  s.agendas=[
    newAgenda({no:'730',title:`제19기 학교운영위원회 위원장 및 부위원장 선출`,dept:'학교운영위원회'}),
    newAgenda({no:'731',title:`${y}학년도 학생건강검진 기관 선정안`,dept:'보건실'}),
    newAgenda({no:'732',title:`${y}학년도 방과후학교 프로그램 개인위탁 외부강사 계약안`,dept:'교육과정부'}),
    newAgenda({no:'733',title:`${y}학년도 현장체험학습(수학여행) 운영 계획안`,dept:'3학년부'}),
    newAgenda({no:'734',title:`${y-1}학년도 학교회계 세입·세출 결산안`,dept:'행정실'}),
    newAgenda({no:'735',title:`${y-1}학년도 학교발전기금 결산안`,dept:'학교운영위원회'})
  ];
  return s;
}

/* =====================================================================
   문서 정의 — 입력 자료 → 문서 블록(DSL)
   블록: P(문단) / T(표) / PB(쪽나눔)
   글꼴키: g 굴림체 · m 휴먼명조 · h HY헤드라인M · b 한컴바탕 · d 한컴돋움 · y 휴먼옛체
   ===================================================================== */
const FONT={
  g:{ko:'굴림체',css:"'굴림체','Gulim','굴림','맑은 고딕','Malgun Gothic',sans-serif"},
  m:{ko:'휴먼명조',css:"'휴먼명조','HCR Batang','함초롬바탕','바탕','Batang',serif"},
  h:{ko:'HY헤드라인M',css:"'HY헤드라인M','HYHeadLine-Medium','맑은 고딕','Malgun Gothic',sans-serif"},
  b:{ko:'한컴바탕',css:"'한컴바탕','HCR Batang','함초롬바탕','바탕','Batang',serif"},
  d:{ko:'한컴돋움',css:"'한컴돋움','HCR Dotum','함초롬돋움','돋움','Dotum',sans-serif"},
  y:{ko:'휴먼옛체',css:"'휴먼옛체','HY견명조','HCR Batang','바탕',serif"}
};
const P=(text,o={})=>({t:'p',text,...o});
const T=(rows,o={})=>({t:'tbl',rows,...o});
const PB=()=>({t:'pb'});
const BL=(n=1,size=12,font)=>({t:'p',text:'',size,rep:n,font,lh:1.15});
const G=(text,o={})=>P(text,{size:12,lh:1.42,...o}); // 기안문 본문(굴림 12)
/* 조사 */
function josa(w,type){ w=trim(w); const c=w.charCodeAt(w.length-1); let jong=-1; if(c>=0xAC00&&c<=0xD7A3) jong=(c-0xAC00)%28; else if(/[0-9]$/.test(w)) jong=[8,0,0,8,0,0,0,8,8,0][+w[w.length-1]]; if(jong<0) return type==='은는'?'는':type==='을를'?'를':type==='이가'?'가':'로';
  const has=jong>0; if(type==='은는') return has?'은':'는'; if(type==='을를') return has?'을':'를'; if(type==='이가') return has?'이':'가'; return (has&&jong!==8)?'으로':'로'; }
const q=s=>`「${trim(s)}」`;

/* ---------- 공문 공통: 두문 / 결문 ---------- */
function gianHead(recipient,title){
  const cm=committee();
  return T([
    [{t:cm,cs:2,size:20,b:true,al:'center',h:13}],
    [{t:'수신자',size:13},{t:recipient,size:13}],
    [{t:'(경유)',size:13},{t:'',size:13}],
    [{t:'제목',size:13,bd:{b:'b'}},{t:title,size:13,bd:{b:'b'}}]
  ],{w:[22,148],border:false,font:'g',h:7,pad:0.8});
}
function gianFoot(no,dateISO){
  const s=S,cm=committee();
  const lab=t=>({t,size:8,al:'center'}), nm=t=>({t,size:10,b:true,al:'center'}), tx=(t,o={})=>({t,size:10,...o});
  return T([
    [{t:'',cs:8,bg:'D9D9D9',h:1.2}],
    [lab('담당자'),nm(s.staff.manager),lab('간사'),nm(s.staff.secretary),lab('위원장'),nm(s.staff.chair),{t:''},{t:''}],
    [{t:'',cs:8,h:2}],
    [tx('협조자',{cs:8})],
    [{t:'',cs:8,h:2}],
    [tx('시행'),tx(`${cm}-${trim(no)||'      '} (${fmtDot(dateISO)})`,{cs:3}),tx('접수'),{t:'',cs:3}],
    [tx('우'),tx(`${trim(s.school.zip)} ${trim(s.school.addr)}`,{cs:4}),tx(`/ ${trim(s.school.web)}`,{cs:3})],
    [tx('전화'),tx(trim(s.school.tel)),tx('전송'),tx(trim(s.school.fax)),{t:'',cs:3},tx('/공개')]
  ],{w:[12,26,12,26,14,26,26,28],border:false,font:'g',h:4,pad:0.3});
}
function signer(size=20,font='g'){ return P(committee()+(trim(S.opts.signer)||'위원장').replace(/^운영위원회/,''),{size,b:true,al:'center',font}); }
function signerName(){ return committee()+(trim(S.opts.signer)||'운영위원회위원장').replace(/^운영위원회/,''); }
function agendaLines(prefix='  ',size=15,font='m'){ return agendaList().map((a,i)=>P(`${prefix}${i+1}. ${a.no?`제${trim(a.no)}호 `:''}${trim(a.title)}`,{size,font,ind:8,hang:8})); }
function relLine(){ const n=trim(S.docs.submitNo); return `제${S.meet.no||'  '}회 학교운영위원회 ${S.meet.kind} 소집요구 및 심의안건 제출(${trim(S.school.name)||'○○학교'}-${n||'      '}(${fmtDot(S.docs.proposeDate)}))`; }

/* ======================= A. 회의 소집 ======================= */
function docA1(){ // 소집 내부기안문
  const s=S,o=s.opts,n=agendaList().length;
  return {blocks:[
    gianHead('내부결재',`${s.meet.year}학년도 제${s.meet.no}회 ${committee()} ${s.meet.kind} 소집`),
    BL(1,8),
    G('1. 관   련'),
    G(`  가.${q(o.ordinance)}${o.article}`,{ind:6,hang:6}),
    G(`  나. ${relLine()}`,{ind:6,hang:6}),
    BL(1,5),
    G(`2. 학교장이 심의요청한${q(firstAgenda())}${n>1?`외 ${n-1}건의 안건`:'안건'}을 심의하기 위하여 ${s.meet.year}학년도 제${s.meet.term}기 ${committee()} 제${s.meet.no}회 ${s.meet.kind}를 아래와 같이 소집하고자 합니다.`,{align:'justify',ind:0,hang:6}),
    G(`  가. 일    시: ${whenStr()}`),
    G(`  나. 참석대상: ${targetStr()}`),
    G(`  다. 장    소: ${placeStr()}`),
    G(`  라. 심의안건: ${agendaSummary('「','」')}`,{ind:0,hang:24}),
    G(`  마. 기타사항: ${o.etcLine}`,{ind:0,hang:24}),
    BL(1,10),
    G('붙임  1. 심의자료 1부'),
    G('      2. 안내공고문안 1부'),
    G('      3. 안내장안 1부.  끝.'),
    BL(1,10),
    signer(),
    BL(1,6),
    gianFoot(s.docs.no1,s.docs.noticeDate)
  ]};
}
function docA2(){ // 참석요청(안내) 기안문
  const s=S,o=s.opts,n=agendaList().length;
  return {blocks:[
    gianHead(targetStr(),`${s.meet.year}학년도 제${s.meet.no}회 ${committee()} ${s.meet.kind} 참석 안내`),
    BL(1,8),
    G('1. 관   련'),
    G(`  가.${q(o.ordinance)}${o.article}`,{ind:6,hang:6}),
    G(`  나. ${relLine()}`,{ind:6,hang:6}),
    BL(1,5),
    G(`2. 학교장이 심의요청한${q(firstAgenda())}${n>1?`외 ${n-1}건의 안건`:'안건'}을 심의하기 위하여 ${s.meet.year}학년도 제${s.meet.term}기 ${committee()} 제${s.meet.no}회 ${s.meet.kind}를 아래와 같이 실시하오니 참석하여 주시기 바랍니다.`,{align:'justify',ind:0,hang:6}),
    G(`  가. 일    시: ${whenStr()}`),
    G(`  나. 참석대상: ${targetStr()}`),
    G(`  다. 장    소: ${placeStr()}`),
    G(`  라. 심의안건: ${agendaSummary()}`,{ind:0,hang:24}),
    BL(1,10),
    G('붙임  심의자료 1부.  끝.'),
    BL(3,10),
    signer(),
    BL(1,6),
    gianFoot(s.docs.no2,s.docs.noticeDate)
  ]};
}
function docA3(){ // 소집 공고문
  const s=S,o=s.opts; const y=pd(s.docs.noticeDate)?pd(s.docs.noticeDate).getFullYear():new Date().getFullYear();
  const cnt=agendaList().length, many=cnt>4, lots=cnt>8, sz=lots?12.5:many?13.5:14, lh=lots?1.4:many?1.5:1.6, listAll=o.listAll&&cnt<=12;
  const b=[
    P(`【공고 제${y} - ${trim(s.docs.noticeNo)||'  '}】`,{size:15,b:true,font:'m'}),
    BL(1,12,'m'),
    P(`제${s.meet.no}회 ${committee()} ${s.meet.kind} 소집 공고`,{size:20,b:true,al:'center',font:'m'}),
    BL(1,10,'m'),
    P(`${q(o.ordinance)}${o.article2}의 규정에 의하여 아래와 같이 ${s.meet.year}학년도 제${s.meet.no}회 ${committee()} ${s.meet.kind}를 소집하였기에 공고합니다.`,{size:sz,font:'m',align:'justify',lh:1.7}),
    BL(1,12,'m'),
    P(`□ 일    시: ${whenStr()}`,{size:sz,font:'m',lh}),
    P(`□ 참석대상: ${targetStr()}`,{size:sz,font:'m',lh}),
    P(`□ 장    소: ${placeStr()}`,{size:sz,font:'m',lh})
  ];
  if(listAll&&cnt){ b.push(P('□ 안    건: ',{size:sz,font:'m',lh})); b.push(...agendaLines('   ',lots?11.5:many?12.5:13,'m').map(x=>({...x,lh}))); }
  else b.push(P(`□ 안    건: ${agendaSummary()}`,{size:sz,font:'m',ind:0,hang:26,lh}));
  b.push(P(`□ 참고사항: ${o.refLine}`,{size:sz,font:'m',lh}), BL(2,14,'m'), P(fmtKo(s.docs.noticeDate),{size:17,b:true,al:'center',font:'m'}), BL(1,16,'m'), signer(20,'m'));
  return {blocks:b};
}
function docA4(){ // 안내장
  const s=S,o=s.opts; const cnt=agendaList().length, many=cnt>4, lots=cnt>8, sz=lots?11.5:many?12:12.5, lh=lots?1.4:many?1.45:1.55, listAll=o.listAll&&cnt<=12;
  const B=t=>P(t,{size:sz,font:'m',align:'justify',ind:4,lh});
  const b=[
    P('안   내   장',{size:27,b:true,al:'center',font:'m'}),
    BL(1,8,'m'),
    P(`□ 제${s.meet.no}회 ${committee()} ${s.meet.kind} 방청 안내`,{size:18,b:true,font:'m'}),
    BL(1,8,'m'),
    B('그간 안녕하십니까?'),
    B('교육개혁의 일환으로 열린교육, 수요자 중심의 교육을 표방하여 학교운영위원회의가 열리고 있습니다.'),
    B('교육의 주민자치 정신을 구현하고 단위학교의 자율성을 확대하여 교육효과를 극대화하기 위하여 운영 중인 학교운영위원회가 활기찬 모습으로 성장하고 있습니다. 앞으로 미흡한 점은 보완 개선하여 운영위원회 활성화에 온 힘을 다하겠습니다.'),
    B(`아울러, 제${s.meet.no}회 ${committee()} ${s.meet.kind}가 아래와 같이 개최되니 참관을 희망하시는 학부모님께서는 참관하시길 바랍니다.`),
    B('또한, 좋은 의견이 있으신 분께서는 운영위원에게 연락하여 주시고 많은 관심과 참여로 학교발전에 다 함께 동참하여 주시기 바랍니다.'),
    BL(1,10,'m'),
    P(`□ 일    시: ${whenStr()}`,{size:sz+1,font:'m',lh}),
    P(`□ 참석대상: ${targetStr()}`,{size:sz+1,font:'m',lh}),
    P(`□ 장    소: ${placeStr()}`,{size:sz+1,font:'m',lh})
  ];
  if(listAll&&cnt){ b.push(P('□ 안    건: ',{size:sz+1,font:'m',lh})); b.push(...agendaLines('   ',lots?11:sz,'m').map(x=>({...x,lh}))); }
  else b.push(P(`□ 안    건: ${agendaSummary()}`,{size:sz+1,font:'m',ind:0,hang:24,lh}));
  b.push(P(`□ 참고사항: ${o.refLine}`,{size:sz+1,font:'m',lh}), BL(2,10,'m'), P(fmtKo(s.docs.noticeDate),{size:16,b:true,al:'center',font:'m'}), BL(1,12,'m'), signer(20,'m'));
  return {blocks:b};
}
function docA5(){ // 소집공고 기안문(내부결재)
  const s=S,o=s.opts;
  return {blocks:[
    gianHead('내부결재',`${s.meet.year}학년도 제${s.meet.no}회 ${committee()} ${s.meet.kind} 소집 공고`),
    BL(1,8),
    G(`1. 관련: ${q(o.ordinance)}${o.article}`,{ind:0,hang:6}),
    BL(1,5),
    G(`2. ${s.meet.year}학년도 제${s.meet.term}기 ${committee()} 제${s.meet.no}회 ${s.meet.kind} 소집 공고를 아래와 같이 실시하고자 합니다.`,{align:'justify',ind:0,hang:6}),
    G(`  가. 일    시: ${whenStr()}`),
    G(`  나. 참석대상: ${targetStr()}`),
    G(`  다. 장    소: ${placeStr()}`),
    G(`  라. 심의안건: ${agendaSummary()}`,{ind:0,hang:24}),
    G('  마. 공고방법: 우리학교 홈페이지 게시'),
    BL(1,10),
    G(`붙임  1. 제${s.meet.no}회 ${committee()} ${s.meet.kind} 소집 공고안 1부`,{ind:0,hang:12}),
    G('      2. 심의자료 1부.  끝.'),
    BL(3,10),
    signer(),
    BL(1,6),
    gianFoot(s.docs.no4||s.docs.no1,s.docs.noticeDate)
  ]};
}

/* ======================= B. 회의 진행 ======================= */
function docB1(){ // 등록부
  const s=S; const ch=trim(s.staff.chair), vc=trim(s.staff.vice);
  const row=(k,n)=>[{t:k,al:'center'},{t:n,al:'center'},{t:''},{t:''}];
  const rows=[[{t:'구   분',b:true,al:'center'},{t:'성   명',b:true,al:'center'},{t:'서   명',b:true,al:'center'},{t:'비   고',b:true,al:'center'}],row('위 원 장',ch),row('부위원장',vc)];
  const skip=n=>n===ch||n===vc;
  s.members.parent.forEach(m=>{ if(!skip(m.name)) rows.push(row('학부모위원',m.name)); });
  s.members.teacher.forEach(m=>{ if(!skip(m.name)) rows.push(row('교직원위원',m.name)); });
  s.members.local.forEach(m=>{ if(!skip(m.name)) rows.push(row('지역위원',m.name)); });
  return {blocks:[
    P(`${committee()} 등록부`,{size:27,b:true,al:'center',font:'m'}),
    BL(1,20,'m'),
    P(`□ 회    기: ${meetShort()}`,{size:15,font:'m'}),
    P(`□ 일    시: ${whenStr()}`,{size:15,font:'m'}),
    BL(1,8,'m'),
    T(rows,{w:[34,44,52,40],border:true,font:'m',size:14,h:13,pad:1,hdr:true}),
    BL(1,10,'m'),
    P(`※ 재적 위원 ${memberCount()}명 / 출석 위원      명`,{size:12,font:'m',al:'right'})
  ]};
}
function docB2(){ // 회의 시나리오 — 사립고 임시회 회의록 양식(결재란·회의 개요·발언 대본). hobong_pack.hk()가 원본 docB2와 바꿔 끼운다
  const s=S, ag=agendaList();
  const sch=trim(s.school.name)||'○○학교';
  const chair=trim(s.staff.chair), vice=trim(s.staff.vice), prin=trim(s.staff.principal);
  const sec=trim(s.staff.secretary), secT=trim(s.staff.secTitle)||'행정실장';
  const tot=memberCount(), att=attendCount(), known=attKnown();
  const mem=allMembers().filter(m=>trim(m.name));
  const isHaeng=a=>/행정/.test(trim(a.dept));
  const who=a=>trim(a.presenter)||(isHaeng(a)?secT:'교감');
  // 날짜: 2026년 9월 4일(금) 11:00
  const dt=(()=>{ const m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trim(s.meet.date)); if(!m) return '    년   월   일(  )   :  ';
    const d=new Date(+m[1],+m[2]-1,+m[3]); return `${+m[1]}년 ${+m[2]}월 ${+m[3]}일(${'일월화수목금토'[d.getDay()]})`; })();
  const tm=trim(s.meet.time)||'  :  ';
  const kind=trim(s.meet.kind)||'임시회';
  const title=`제${trim(s.meet.no)||'  '}차 학교운영위원회 ${kind} 회의록`;
  // 참석자 명단
  const others=mem.filter(m=>m.name!==chair&&m.name!==vice&&m.name!==prin&&(m.attend||!known)).map(m=>trim(m.name));
  const absent=known?mem.filter(m=>!m.attend).map(m=>trim(m.name)):[];
  const gyoP=[...new Set(ag.filter(a=>!isHaeng(a)).map(who))].join(', ');
  const depts=[...new Set(ag.map(a=>isHaeng(a)?'행정실':'교무실'))].sort().join(', ')||'교무실, 행정실';
  const L=(t,o={})=>({t,size:11,...o});
  const K=t=>L(t,{b:true,al:'center'});
  const attend=[`[위원장] ${chair}`,`[부위원장] ${vice}`,'',`[학교장] ${prin}`,'',`[위원] ${others.join(' ')}`,'',
    `[교무실안건 설명] ${gyoP||'교감'}`,'',`[행정실안건 설명 및 간사] ${secT} ${sec}`,'','[참관] 없음','',`[불참] ${absent.length?absent.join(' '):(known?'없음':'')}`].join('\n');
  const order=['1. 개회','2. 국민의례','3. 학교장말씀','4. 회의안건 상정 및 토의','5. 기타토의','6. 폐회'].join('\n\n');
  const head=T([
    [{t:`${sch}\n\n운영위원회`,size:13,b:true,al:'center',rs:2},{t:title,size:16,b:true,al:'center',rs:2},K('위원장'),K('학교장')],
    [{t:'',h:16},{t:'',h:16}],
  ],{w:[38,92,20,20],border:true,font:'h',pad:2});
  const info=T([
    [K('회의주관부서'),L(depts)],
    [K('회의개최일시'),L(`${dt} ${tm}`)],
    [K('회의장소'),L(`본교 ${trim(s.meet.place)}`)],
    [K('참석자명단'),L(attend)],
    [K('회의진행순서'),L(order)],
    [K('상정안건'),L(ag.length?ag.map((a,i)=>`${trim(a.no)||String(i+1)}    ${trim(a.title)}`).join('\n'):'(안건 없음)')],
  ],{w:[30,140],border:true,font:'h',pad:2});
  // 발언 대본: 같은 사람이 이어서 말하면 한 칸에 잇는다
  const rows=[];
  const R=(sp,t)=>{ const last=rows[rows.length-1]; if(last&&!last.tbl&&last.sp===sp) last.t+='\n\n'+t; else rows.push({sp,t}); };
  // 요지의 '[표 N]' 자리에 안건 원문(주요내용)의 표를 그대로 끼운다 — 표는 발언 칸(146mm) 너비로
  const say=(sp,t,tbls)=>{ t.split(/\n?\[표\s*(\d+)\]\n?/).forEach((part,k)=>{ if(k%2){ const tb=tbls[+part-1]; if(tb) rows.push({tbl:tb}); else R(sp,`[표 ${part}]`); } else if(k===0) R(sp,part); else if(part.trim()) rows.push({sp,t:part,cont:1}); }); };
  R('간사',`안녕하십니까? 운영위원 ${tot}명 중 ${known?att:'  '}명이 참석하여 성원이 되었으므로 지금부터 제${trim(s.meet.no)}차 ${sch}운영위원회 ${kind}의를 개회하겠습니다. 먼저 국기에 대한 경례가 있겠습니다. \n\n모두 자리에서 일어나 국기를 향해 주시기 바랍니다. \n\n국기에 대하여 경례!  - (일동경례) -  바로.\n\n자리에 앉아주시기 바랍니다. 다른 의례는 생략하겠습니다. 의사일정은 오늘 하루로 하기로 하겠습니다. (위원들 이의 없다고 하다.) 운영위원님들 소개해 드리겠습니다. 다음은 학교장 인사 말씀이 있겠습니다.`);
  R('학교장','인사 말씀하다. ');
  ag.forEach((a,i)=>{
    const no=trim(a.no)||String(i+1), t=trim(a.title), sum=trim(a.summary), qna=trim(a.qna);
    R('위원장',`안건 ${no}) ${t}. 제안설명 부탁`);
    const at=(s.attach||[]).find(x=>x.agIdx===s.agendas.indexOf(a)&&x.kind!=='att');
    say(who(a),'유인물 참고하여 제안설명'+(sum?'\n'+sum:''),at?gistTables(at.blocks):[]);
    R('위원전원',qna||'다른 질문, 반대 의견 없고, 동의한다 함');
    R('위원장',`위원들의 동의. 재청, 삼청이 있음\n\n안건 ${no}) ${t} ${trim(a.result)||'원안가결'}`);
  });
  R('위원장','기타토의 할 내용이 있으면 말씀해 주시기 바랍니다.');
  R('위원전원',trim(s.minutes&&s.minutes.others)||'');
  R('위원장','다른 의견 있으십니까? 없으면 본회는 폐회를 선언합니다.(의사봉 3타 하다.) \n\n수고하셨습니다.');
  R('위원전원','전원 박수하다.');
  const talk=[]; let seg=[];
  const flush=()=>{ if(seg.length) talk.push(T(seg.map(r=>[K(r.cont?'':r.sp),L(r.t,{align:'justify'})]),{w:[24,146],border:true,font:'h',pad:2})); seg=[]; };
  const fit=c=>({...c,p:(c.p||[]).map(p=>({...p,size:10,font:'h',runs:(p.runs||[]).map(x=>({...x,size:10,font:'h'}))}))});
  rows.forEach(r=>{ if(!r.tbl){ seg.push(r); return; } flush(); const tb=r.tbl, tot=tb.w.reduce((x,y)=>x+y,0)||146;
    talk.push({...tb,flow:true,font:'h',size:10,pad:1,hdr:false,w:[24,...tb.w.map(x=>Math.round(x*1460/tot)/10)],
      rows:tb.rows.map((row,k)=>(k?[]:[{t:'',rs:tb.rows.length}]).concat(row.map(fit)))}); });
  flush();
  const b=[
    head, BL(1,6,'h'), info, BL(1,6,'h'), ...talk, BL(2,12,'h'),
    P(`${dt.replace(/\(.*\)$/,'')}`,{size:13,al:'center',font:'h'}),
    BL(1,10,'h'),
    P(`${sch} 운영위원회`,{size:15,b:true,al:'center',font:'h'})
  ];
  return {blocks:b};
}
/* 안건 한글파일 다듬기 — hobong_pack.hk()가 docB3 앞에 끼운다
   1) 한 파일에 안건이 여럿이면(안건번호 머리표가 여러 개) 안건별로 나눈다
   2) '주요내용' 절을 뽑아 제안설명 요지로 쓴다
   3) 심의자료에 붙는 원문의 글꼴·크기·줄간격·표 너비를 한 양식으로 맞춘다 */
const _bt=b=>b.t==='p'?(b.runs||[]).map(r=>r.t).join(''):'';
const _ct=c=>(c.p||[]).map(p=>(p.runs||[]).map(r=>r.t).join('')).join(' ').replace(/\s+/g,' ').trim();
const _tt=b=>b.rows.map(r=>r.map(_ct).filter(Boolean).join(' / ')).filter(Boolean).join('\n');
const _isHead=b=>b.t==='tbl'&&b.rows.length<=4&&/안\s*건/.test(_tt(b))&&/(번\s*호|제\s*안)/.test(_tt(b));
const _blank=b=>b.t==='p'&&!_bt(b).trim();

function hwpSplitAttach(a){
  const B=a.blocks, heads=B.map((b,i)=>_isHead(b)?i:-1).filter(i=>i>=0);
  const dept=bl=>{ const h=bl.find(_isHead); const m=h&&/소\s*관\s*[:：]\s*(.+)$/.exec(_tt(h)); return m?m[1].replace(/\s+/g,''):''; };
  if(heads.length<2) return [{...a,dept:a.dept||dept(B)}];
  const starts=heads.map(k=>{ let i=k-1; while(i>0&&(_blank(B[i])||B[i].t==='pb')) i--; return (B[i]&&B[i].t==='p'&&(B[i].size||10)>=14)?i:k; });
  starts[0]=0;
  return starts.map((s,n)=>{ const part=B.slice(s,n+1<starts.length?starts[n+1]:B.length);
    while(part.length&&(part[part.length-1].t==='pb'||_blank(part[part.length-1]))) part.pop();
    while(part.length&&part[0].t==='pb') part.shift();
    const m=hwpGuessMeta(part);
    return {...a,name:`${a.name} (${n+1}/${starts.length})`,title:m.title||a.title,dept:m.dept||dept(part)||a.dept,no:m.no||'',blocks:part}; });
}

/* '주요내용' 절: 문단은 글로, 표는 '[표 N]' 자리표시로 — 회의 시나리오가 그 자리에 원문 표를 끼운다(gistTables) */
function _gistWalk(blocks){
  const H=/^\s*(?:\d+\s*\.|[□■◎▣])?\s*주\s*요\s*내\s*용\s*[:：]?\s*(.*)$/;
  const NEXT=/^\s*(?:\d+\s*\.(?!\d)|[□■◎▣])\s*\S/;
  const out=[], tbls=[]; let i=blocks.findIndex(b=>b.t==='p'&&H.test(_bt(b))); if(i<0) return {out,tbls};
  const first=H.exec(_bt(blocks[i]))[1].trim(); if(first) out.push(first);
  for(i++;i<blocks.length;i++){ const b=blocks[i]; if(b.t==='pb'||_isHead(b)) break;
    if(b.t==='tbl'){ tbls.push(b); out.push(`[표 ${tbls.length}]`); continue; }
    const s=_bt(b).replace(/\s+/g,' ').trim(); if(!s) continue; if(NEXT.test(s)||/^붙\s*임/.test(s)) break; out.push(s); }
  return {out,tbls};
}
function agendaGist(blocks){
  let t=_gistWalk(blocks).out.join('\n'); if(t.length>700) t=t.slice(0,700).replace(/\s\S*$/,'')+' …';  // ponytail: 길이만 자름, 요약은 사람이 다듬는다
  return t;
}
const gistTables=blocks=>_gistWalk(blocks||[]).tbls;
function agendaFillSummary(a){ const g=a.agIdx>=0?S.agendas[a.agIdx]:null; if(g&&!trim(g.summary)) g.summary=agendaGist(a.blocks); }

/* 안건 머리(안건번호 상자 + 제안년월일·제안자·소관)를 다시 만든다.
   원문은 테두리 없는 배치용 표 안에 작은 상자와 오른쪽 세 줄이 있는데, 읽어 오면 테두리 있는 큰 표 하나로 뭉치고
   오른쪽 칸은 양쪽 정렬로 글자가 흩어진다. 안건번호는 연결된 안건의 번호를 쓴다(원문 번호는 자동 번호라 1로 읽히기도 함). */
function agendaHeadBlock(h,ag){
  const flat=_tt(h).replace(/\s*\/\s*/g,' ').replace(/\s+/g,' ');
  const sp=s=>s.replace(/\s+/g,'');
  const g=(re)=>{ const m=re.exec(flat); return m?m[1].trim():''; };
  // 제안년월일: 안건 '상세'의 날짜(pdate) → 기본정보 회의 정보의 날짜(S.meet.pdate, 일괄) → 원문에 적힌 날짜
  const pd=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trim((ag&&ag.pdate)||(S.meet&&S.meet.pdate)||''));
  const date=pd?`${+pd[1]}. ${+pd[2]}. ${+pd[3]}.`:g(/제\s*안\s*년\s*월\s*일\s*[:：]\s*([\d.\s]*\d\.?)/);
  let who=sp(g(/제\s*안\s*자\s*[:：]\s*(.+?)(?=\s*소\s*관|$)/));
  const dept=(ag&&trim(ag.dept))||sp(g(/소\s*관\s*[:：]\s*(.+?)$/));   // 안건 표의 제안부서 우선
  const no=(ag&&trim(ag.no))||g(/번\s*호\s*(\d+)/);
  if(who.length===3) who=who.split('').join(' ');   // 학교장 → 학 교 장(원문 모양)
  const N={t:'n',b:'n',l:'n',r:'n'}, F=(t,o={})=>({t,size:12,font:'m',...o});
  const L=[`제안년월일 : ${date}`,`제  안  자 : ${who}`,`소      관 : ${dept}`];
  // 오른쪽 세 줄 칸은 가장 긴 줄에 맞춘 너비로 본문 오른쪽 끝에 붙인다(12pt: 한글 약 4.3mm, 그 밖 2.2mm + 안쪽 여백 4mm)
  const len=s=>[...s].reduce((n,c)=>n+(/[가-힣]/.test(c)?4.3:2.2),0);
  const wr=Math.min(110,Math.max(50,Math.ceil(Math.max(...L.map(len))+4)));
  return {t:'tbl',flow:true,font:'m',size:12,pad:1,w:[16,24,130-wr,wr],rows:[
    [F('안건\n번호',{al:'center',rs:2}),F(no,{al:'center',rs:2}),F('',{bd:N}),F(L[0],{bd:N})],
    [F('',{bd:N}),F(L[1],{bd:N})],
    [F('',{bd:N}),F('',{bd:N}),F('',{bd:N}),F(L[2],{bd:N})]]};
}

/* 원문 양식 고정: 제목 18pt 헤드라인 가운데 · 본문 휴먼명조 12pt 줄간격 160% · 표 너비 170mm 칸 글자 11pt */
function normAttachBlocks(blocks,ag){
  const headAt=blocks.findIndex(_isHead);
  const firstTbl=blocks.findIndex(b=>b.t==='tbl'), lim=firstTbl<0?8:firstTbl;
  let ti=-1,ts=13; blocks.slice(0,lim).forEach((b,i)=>{ if(b.t==='p'&&_bt(b).trim()&&(b.size||10)>ts){ ts=b.size; ti=i; } });
  const out=[]; let blank=0;
  blocks.forEach((b,i)=>{
    if(_blank(b)){ if(++blank>1) return; out.push({...b,runs:[],size:12,font:'m',lh:1.6}); return; } blank=0;
    if(b.t==='pb'){ out.push(b); return; }
    if(i===headAt){ out.push(agendaHeadBlock(b,ag)); return; }
    if(b.t==='tbl'){ const tot=b.w.reduce((x,y)=>x+y,0)||170;
      out.push({...b,flow:true,font:'m',size:11,pad:1,w:b.w.map(x=>Math.round(x*1700/tot)/10),
        rows:b.rows.map(r=>r.map(c=>({...c,p:c.p.map(p=>({...p,size:11,font:'m',runs:p.runs.map(x=>({...x,size:11,font:'m'}))}))})))}); return; }
    if(i===ti){ const tt=ag&&trim(ag.title);   // 제목은 안건 표의 안건명으로(입력한 그대로 나오게)
      out.push({...b,al:'center',size:18,font:'h',b:true,ind:0,hang:0,lh:1.6,runs:tt?[{t:tt,size:18,font:'h',b:true}]:b.runs.map(r=>({...r,size:18,font:'h',b:true}))}); return; }
    out.push({...b,size:12,font:'m',lh:1.6,ind:Math.min(b.ind||0,20),hang:Math.min(b.hang||0,20),runs:b.runs.map(r=>({...r,size:12,font:'m'}))});
  });
  return out;
}

/* ---------- 안건별 첨부(📎) — hobong_pack.hk()가 docB2 자리에 함께 끼운다 ----------
   안건 표의 📎 단추로 고른 한글 파일은 S.attach에 kind:'att', agIdx=그 안건으로 들어간다.
   심의자료(docB3)는 2단계 안건 표 순서대로 [원문 → 그 안건의 첨부들]을 새 쪽마다 붙인다. 머리의 번호·제목·소관도 안건 표 값(agenda_norm.js). */
function agAttCount(i){ return (S.attach||[]).filter(a=>a.kind==='att'&&a.agIdx===i).length; }
function attachOrder(L){   // 2단계 안건 표 순서 그대로: 안건마다 [원문 → 첨부], 연결 안 된 파일은 맨 뒤
  const out=[], n=S.agendas.length;
  for(let k=0;k<n;k++){
    out.push(...L.filter(a=>a.agIdx===k&&a.kind!=='att'));
    const at=L.filter(a=>a.agIdx===k&&a.kind==='att'); at.forEach((a,j)=>{ a.attNo=at.length>1?j+1:0; out.push(a); });
  }
  return out.concat(L.filter(a=>!(a.agIdx>=0&&a.agIdx<n)));
}
/* 취합 원문 ↔ 안건 짝짓기 보강: 원래는 번호·같은 제목이 없으면 '아직 짝 없는 첫 안건'에 붙여 엉뚱하게 연결됐다.
   제목 글자쌍(2글자) 겹침 정도(0~1, 연도는 빼고 비교, 같은 부서면 +0.1)로 가장 비슷한 안건에 붙이고, 0.6 미만이면 연결하지 않는다
   (안건 표에 제목 빈 줄이 있으면 예전처럼 그 줄에). */
function titleSim(x,y){
  const n=s=>String(s||'').replace(/[\s·・,.()\[\]【】「」\-:：<>〈〉『』"']/g,'').replace(/(에관한|에대한)?건$|\(?안\)?$/,'').replace(/20\d\d(학년도|년도|년|학년)?/g,'');
  const bg=s=>{ const m=new Map(); for(let i=0;i<s.length-1;i++){ const k=s.slice(i,i+2); m.set(k,(m.get(k)||0)+1); } return m; };
  const a=n(x), b=n(y); if(!a||!b) return 0; if(a===b) return 1; if(a.length<2||b.length<2) return 0;
  const A=bg(a), B=bg(b); let c=0; A.forEach((v,k)=>{ c+=Math.min(v,B.get(k)||0); });
  const d=2*c/(a.length-1+b.length-1), num=s=>(s.match(/\d+/g)||[]).join(',');
  return num(a)===num(b)?d:d*0.6;   // 연도 뺀 숫자(1학년·2학년 등)가 다르면 다른 안건일 가능성이 크다
}
function attachFuzzyLink(a,used){
  let best=-1, bs=0;
  S.agendas.forEach((g,k)=>{ if(used.has(k)||!trim(g.title)) return;
    const s=titleSim(a.title,g.title)+(trim(a.dept)&&trim(g.dept)&&trim(a.dept).replace(/\s/g,'')===trim(g.dept).replace(/\s/g,'')?0.1:0);
    if(s>bs){ bs=s; best=k; } });
  if(bs>=0.6) return best;
  return S.agendas.findIndex((g,k)=>!used.has(k)&&!trim(g.title));
}
// 취합 표: 연결된 안건 제목이 원문 제목과 많이 다르면 ⚠ 표시(잘못 연결 알아보기)
const _renderAttach0=renderAttach;
renderAttach=function(){ _renderAttach0.apply(this,arguments); try{
  $$('#atTbl tbody tr[data-i]').forEach(tr=>{ const a=S.attach[+tr.dataset.i]; if(!a||a.kind==='att'||!(a.agIdx>=0)) return; const g=S.agendas[a.agIdx];
    if(!g||!trim(g.title)||titleSim(a.title,g.title)>=0.6) return; const sel=tr.querySelector('select');
    if(sel) sel.insertAdjacentHTML('afterend','<div class="atwarn" style="color:#c0392b;font-size:11px;margin-top:2px">⚠ 제목이 달라요 — 연결 안건을 확인하세요</div>'); });
}catch(e){} };

function attLabel(a){ return a.kind==='att'?' 첨부'+(a.attNo?' '+a.attNo:''):''; }

/* ---------- PDF·그림 첨부 → 그림 블록 {t:'img'} ----------
   쪽마다 그림 한 장(본문 170×235mm 안에 맞춤). 미리보기는 objectURL, 한글 저장은 BinData/imageN 으로 넣는다. */
const IMG_MAX_W=170, IMG_MAX_H=235, PDF_MAX_PAGES=40;
const ATT_RE=/\.(hwpx?|pdf|png|jpe?g|gif|webp|bmp)$/i;
function loadPdfJs(){
  if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((ok,no)=>{ const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload=()=>{ const L=window.pdfjsLib; if(!L) return no(new Error('PDF 읽기 도구를 불러오지 못했습니다'));
      L.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; ok(L); };
    s.onerror=()=>no(new Error('PDF 읽기 도구를 불러오지 못했습니다(인터넷 연결 필요)')); document.head.appendChild(s); });
}
function fitMm(pw,ph){ const r=Math.min(IMG_MAX_W/pw,IMG_MAX_H/ph); return [Math.round(pw*r*10)/10,Math.round(ph*r*10)/10]; }
function canvasBlock(cv,mime,q){ return new Promise((ok,no)=>cv.toBlob(async bl=>{ if(!bl) return no(new Error('그림으로 바꾸지 못했습니다'));
  const [w,h]=fitMm(cv.width,cv.height);
  ok({t:'img',bytes:new Uint8Array(await bl.arrayBuffer()),ext:mime==='image/png'?'png':'jpg',src:URL.createObjectURL(bl),wmm:w,hmm:h}); },mime,q)); }
async function imageFileToBlock(file){
  const url=URL.createObjectURL(file);
  const img=await new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=()=>no(new Error('그림 파일을 읽지 못했습니다')); i.src=url; });
  const keep=/\.(png|jpe?g)$/i.test(file.name);   // png·jpg는 원본 그대로, 그 밖(gif·webp·bmp)은 png로 바꾼다
  if(keep){ const [w,h]=fitMm(img.naturalWidth,img.naturalHeight);
    return {t:'img',bytes:new Uint8Array(await file.arrayBuffer()),ext:/\.png$/i.test(file.name)?'png':'jpg',src:url,wmm:w,hmm:h}; }
  const cv=document.createElement('canvas'); cv.width=img.naturalWidth; cv.height=img.naturalHeight; cv.getContext('2d').drawImage(img,0,0);
  URL.revokeObjectURL(url); return canvasBlock(cv,'image/png');
}
async function pdfFileToBlocks(file){
  const L=await loadPdfJs(); const pdf=await L.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  const n=Math.min(pdf.numPages,PDF_MAX_PAGES), out=[];
  for(let p=1;p<=n;p++){ const pg=await pdf.getPage(p); const vp=pg.getViewport({scale:2});   // 약 144dpi
    const cv=document.createElement('canvas'); cv.width=Math.ceil(vp.width); cv.height=Math.ceil(vp.height);
    const cx=cv.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0,0,cv.width,cv.height);
    await pg.render({canvasContext:cx,viewport:vp}).promise;
    if(p>1) out.push(PB()); out.push(await canvasBlock(cv,'image/jpeg',0.85)); }
  return {blocks:out,pages:pdf.numPages,cut:pdf.numPages>n};
}
async function fileToAttach(file){
  const name=file.name, title=name.replace(/\.[^.]+$/,'');
  if(/\.hwpx?$/i.test(name)){ const a=await hwpFileToAttach(file); a.title=title; return a; }
  if(/\.pdf$/i.test(name)){ const r=await pdfFileToBlocks(file);
    return {name,title,dept:'',no:'',blocks:r.blocks,stats:{pages:r.pages,cut:r.cut}}; }
  return {name,title,dept:'',no:'',blocks:[await imageFileToBlock(file)],stats:{pages:1}};
}
/* 첨부 전체(PDF·그림 포함)를 IndexedDB에 둔다 — localStorage(약 5MB)는 그림을 못 담아 다시 열면 사라졌다.
   persist()가 부를 때 첨부 목록이 바뀐 경우만 쓴다. 켤 때(restore 직후) 불러와 S.attach를 바꾼다. 실패하면 localStorage 사본(한글 첨부만)이 남는다. */
const ATT_DB='kbg-hakunwi', ATT_OS='attach'; let _attSig=null;
function _attDb(){ return new Promise((ok,no)=>{ try{ const r=indexedDB.open(ATT_DB,1); r.onupgradeneeded=()=>r.result.createObjectStore(ATT_OS); r.onsuccess=()=>ok(r.result); r.onerror=()=>no(r.error); }catch(e){ no(e); } }); }
const _sig=L=>(L||[]).map(a=>[a.name,a.agIdx,a.kind||'',a.title,a.dept,a.no,(a.blocks||[]).length].join('\u0001')).join('\u0002');
function idbSaveAttach(){
  const sig=_sig(S.attach); if(sig===_attSig) return; _attSig=sig;
  const data=(S.attach||[]).map(a=>({...a,blocks:(a.blocks||[]).map(b=>b.t==='img'?{...b,src:''}:b)}));
  _attDb().then(db=>{ const tx=db.transaction(ATT_OS,'readwrite'); tx.objectStore(ATT_OS).put(data,HK.attKey||STORE_KEY); tx.oncomplete=()=>db.close(); }).catch(()=>{});
}
function idbLoadAttach(){
  _attDb().then(db=>new Promise(ok=>{ const r=db.transaction(ATT_OS).objectStore(ATT_OS).get(HK.attKey||STORE_KEY); r.onsuccess=()=>{ db.close(); ok(r.result); }; r.onerror=()=>{ db.close(); ok(null); }; }))
  .then(L=>{ if(!Array.isArray(L)) return;
    L.forEach(a=>(a.blocks||[]).forEach(b=>{ if(b.t==='img'&&b.bytes) b.src=URL.createObjectURL(new Blob([b.bytes],{type:'image/'+(b.ext==='jpg'?'jpeg':b.ext)})); }));
    S.attach=L; _attSig=_sig(L); if(HK.onAttach) HK.onAttach(); })
  .catch(()=>{});
}
function imgHTML(b){ return `<div style="text-align:center;margin:1mm 0"><img src="${b.src}" alt="" style="width:${b.wmm}mm;height:${b.hmm}mm"></div>`; }
function hpfWithBins(hpf,bins){ return bins.length?hpf.replace('</opf:manifest>',bins.map(x=>`<opf:item id="${x.id}" href="BinData/${x.id}.${x.ext}" media-type="image/${x.ext}" isEmbeded="1"/>`).join('')+'</opf:manifest>'):hpf; }
// 한글(hwpx) 그림 문단: 글자처럼 취급(treatAsChar), 가운데. 단위 HWPUNIT(1mm = 283.465). 실제 한글 저장본의 <hp:pic>을 본보기로 함
function attImgXml(b,pbb,prefix,nid,paraId,bins){
  const id='image'+(bins.length+1); bins.push({id,ext:b.ext,bytes:b.bytes});
  const W=Math.round(b.wmm*283.465), H=Math.round(b.hmm*283.465);
  const M='e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"';
  const pic=`<hp:pic id="${nid()}" zOrder="${bins.length}" numberingType="PICTURE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" href="" groupLevel="0" instid="${nid()}" reverse="0">`
    +`<hp:offset x="0" y="0"/><hp:orgSz width="${W}" height="${H}"/><hp:curSz width="${W}" height="${H}"/><hp:flip horizontal="0" vertical="0"/><hp:rotationInfo angle="0"/>`
    +`<hp:renderingInfo><hc:transMatrix ${M}/><hc:scaMatrix ${M}/><hc:rotMatrix ${M}/></hp:renderingInfo>`
    +`<hp:imgRect><hc:pt0 x="0" y="0"/><hc:pt1 x="${W}" y="0"/><hc:pt2 x="${W}" y="${H}"/><hc:pt3 x="0" y="${H}"/></hp:imgRect>`
    +`<hp:imgClip left="0" right="${W}" top="0" bottom="${H}"/><hp:inMargin left="0" right="0" top="0" bottom="0"/>`
    +`<hc:img binaryItemIDRef="${id}" bright="0" contrast="0" effect="REAL_PIC" alpha="0"/><hp:effects/>`
    +`<hp:sz width="${W}" widthRelTo="ABSOLUTE" height="${H}" heightRelTo="ABSOLUTE" protect="0"/>`
    +`<hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="1" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>`
    +`<hp:outMargin left="0" right="0" top="0" bottom="0"/></hp:pic>`;
  return `<hp:p id="${nid()}" paraPrIDRef="${paraId('center',100,0,0,pbb)}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">${prefix||''}<hp:run charPrIDRef="0">${pic}<hp:t/></hp:run></hp:p>`;
}

(function(){
  const tbl=$('#agTbl'); if(!tbl) return;
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.hwp,.hwpx,.pdf,image/*'; inp.multiple=true; inp.style.display='none';
  document.body.appendChild(inp);
  let target=-1;
  inp.addEventListener('change',async()=>{
    const files=[...inp.files].filter(f=>ATT_RE.test(f.name)); inp.value='';
    if(target<0||!S.agendas[target]) return;
    if(!files.length){ toast('한글(.hwp·.hwpx)·PDF·그림(.png·.jpg 등) 파일만 첨부할 수 있습니다'); return; }
    let ok=0; const errs=[], cut=[];
    toast('첨부 파일을 읽는 중…',8000);
    for(const f of files){ try{ const a=await fileToAttach(f); a.kind='att'; a.agIdx=target; if(a.stats&&a.stats.cut) cut.push(`${esc(f.name)} (${a.stats.pages}쪽 중 앞 ${PDF_MAX_PAGES}쪽만)`); S.attach.push(a); ok++; }
      catch(e){ errs.push(`<b>${esc(f.name)}</b> — ${esc(e.message||String(e))}`); } }
    if(cut.length) errs.push('쪽이 많아 일부만 붙였습니다: '+cut.join(', '));
    renderAgendas(); renderAttach(); onChange('attach');
    const g=S.agendas[target], pic=files.some(f=>!/\.hwpx?$/i.test(f.name));
    if(ok) toast(`${trim(g.no)?'제'+trim(g.no)+'호 ':''}안건에 첨부 ${ok}건 — 심의자료에서 이 안건 원문 바로 뒤에 붙습니다`,pic?4000:2400);
    if(errs.length) popup('읽지 못한 파일',errs.join('<br>'));
  });
  // 📎 단추: 파일 고르기. 안건을 지우거나 옮기면 연결(agIdx)을 따라 옮긴다(지운 안건의 첨부는 함께 뺀다)
  tbl.addEventListener('click',e=>{
    const b=e.target.closest('button[data-act]'); if(!b) return; const tr=b.closest('tr[data-i]'); if(!tr) return;
    const act=b.dataset.act;
    if(act==='att'){ e.stopImmediatePropagation(); target=+tr.dataset.i; inp.click(); return; }
    if(!/^(del|up|down)$/.test(act)) return;
    const before=S.agendas.slice();
    setTimeout(()=>{ if(before.length===S.agendas.length&&before.every((g,k)=>g===S.agendas[k])) return;
      S.attach=(S.attach||[]).filter(a=>{ if(!(a.agIdx>=0)) return true; const k=S.agendas.indexOf(before[a.agIdx]); if(k<0&&a.kind==='att') return false; a.agIdx=k; return true; });
      // 연결된 원문은 바뀐 안건 순서대로 다시 줄 세운다(안 정렬은 제자리 순서 유지 — 연결 안 된 원문·첨부는 그 뒤)
      const lk=S.attach.filter(a=>a.kind!=='att'&&a.agIdx>=0).sort((x,y)=>x.agIdx-y.agIdx);
      S.attach=[...lk,...S.attach.filter(a=>!lk.includes(a))];
      renderAgendas(); renderAttach(); onChange('attach'); },0);
  },true);
})();
function docB3(){ // 심의자료 표지·안건목록(·의사일정)
  const s=S,cm=committee();
  const rows=[[{t:'안 건\n번 호',b:true,al:'center'},{t:'제   목',b:true,al:'center'},{t:'제안부서',b:true,al:'center'},{t:'쪽번호',b:true,al:'center'}]];
  agendaList().forEach(a=>rows.push([{t:trim(a.no),al:'center',size:12},{t:trim(a.title),size:12},{t:trim(a.dept),al:'center',size:12},{t:'',size:12}]));
  const b=[
    BL(4,17,'h'),
    T([[{t:`제${s.meet.no}회 ${cm} ${s.meet.kind}`,size:15,al:'center',h:26}]],{w:[170],border:true,font:'h',pad:2}),
    BL(1,10,'h'),
    P('학교운영위원회 심의 자료',{size:28,b:true,al:'center',font:'h'}),
    BL(2,17,'h'),
    P(`      ◐ 일    시: ${whenStr()}`,{size:17,font:'h'}),
    P(`      ◐ 장    소: ${placeStr()}`,{size:17,font:'h'}),
    BL(3,25,'h'),
    P(cm,{size:25,al:'center',font:'h'}),
    PB(),
    P('심의 안건 목록',{size:27,b:true,al:'center',font:'h'}),
    BL(1,20,'m'),
    T(rows,{w:[22,96,32,20],border:true,font:'m',size:14,h:11,pad:1,hdr:true})
  ];
  if(s.opts.agendaPage){
    const items=['개회 (국민의례)','위원장 개회사','학교장 인사','개의 선포 (성원 보고)','보고 사항 (간사)','회기 결정',`안건 심의 (${agendaList().length}건)`,'기타 협의','폐회'];
    b.push(PB(),P('의 사 일 정',{size:27,b:true,al:'center',font:'h'}),BL(1,20,'m'),
      P(`□ 회    기: ${meetShort()}`,{size:15,font:'m'}),P(`□ 일    시: ${whenStr()}`,{size:15,font:'m'}),P(`□ 장    소: ${placeStr()}`,{size:15,font:'m'}),BL(1,12,'m'),
      T([[{t:'순서',b:true,al:'center'},{t:'내   용',b:true,al:'center'},{t:'비   고',b:true,al:'center'}],...items.map((it,i)=>[{t:String(i+1),al:'center'},{t:it},{t:''}])],{w:[20,100,50],border:true,font:'m',size:13,h:9,pad:0.8}),
      BL(1,10,'m'),P('□ 심의 안건',{size:14,font:'m',b:true}),...agendaLines('   ',agendaList().length>8?11.5:12.5,'m').map(x=>({...x,lh:1.45})));
  }
  /* 취합한 안건 한글파일 원문 — 안건마다 새 쪽 */
  attachOrder(s.attach||[]).forEach((a,i)=>{ const ag=(a.agIdx>=0&&s.agendas[a.agIdx])?s.agendas[a.agIdx]:null; const no=ag&&trim(ag.no)?`제${trim(ag.no)}호`:(trim(a.no)?`제${trim(a.no)}호`:`${i+1}`); const dept=ag&&trim(ag.dept)?trim(ag.dept):trim(a.dept); const label=`【 안건 ${no}${attLabel(a)} 】${dept?`  ${dept}`:''}`;
    b.push(PB(),P(label,{size:11,font:'d',al:'right',lh:1.3}),...(a.kind==='att'?a.blocks.map(x=>x.t==='tbl'?{...x,flow:true}:x):normAttachBlocks(a.blocks,ag))); });
  return {blocks:b};
}

/* ======================= C. 회의 결과 ======================= */
function docC1(){ // 회의록
  const s=S,o=s.opts,cm=committee(),ag=agendaList(),n=ag.length;
  const chair=trim(s.staff.chair), sec=trim(s.staff.secretary), prin=trim(s.staff.principal);
  const tot=memberCount(), att=attendCount(), known=attKnown(); const absent=allMembers().filter(m=>!m.attend).map(m=>m.name);
  const SP=(who,name)=>({t:name?`${who}\n(${name})`:who,al:'center',size:12});
  const C=(...ps)=>({p:ps.map(x=>typeof x==='string'?{t:x}:x)});
  const HD=t=>({runs:[{t:'◇ ',b:true,font:'d'},{t,b:true,font:'d'}]});
  const GV={t:'- 의사봉 3타 -',b:true,font:'d'};
  const rows=[[{t:'발언자',b:true,al:'center'},{t:'회  의  진  행  내  용 (요 약)',b:true,al:'center'}]];
  const R=(sp,c)=>rows.push([sp,c]);
  R(SP('간  사',sec),C(HD('개회 선포'),`성원이 되었으므로 지금부터 ${s.meet.year}학년도 제${s.meet.term}기 ${cm} 제${s.meet.no}회 ${s.meet.kind}를 개회하겠습니다.`,'먼저 국민의례가 있겠습니다. 전면 국기를 향해 일어서 주시기 바랍니다.','국기에 대하여 경례 !','바로 !','이하 의식은 생략하겠습니다. 모두 자리에 앉아 주시기 바랍니다.'));
  R(SP('간  사',sec),C('다음은 위원장님의 개회사가 있겠습니다.'));
  R(SP('위원장',chair),C(HD('위원장 개회사'),trim(s.minutes.openRemark)||'(위원장 개회사...)'));
  R(SP('간  사',sec),C('다음은 교장선생님의 인사말씀이 있겠습니다.'));
  R(SP('학교장',prin),C(HD('학교장 인사'),trim(s.minutes.principalRemark)||'(학교장 인사말씀...)'));
  R(SP('간  사',sec),C(`지금부터 ${cm} 제${s.meet.no}회 ${s.meet.kind} 본회의를 시작하겠습니다. 위원장님의 개의선포가 있겠습니다.`));
  R(SP('위원장',chair),C(HD('개의 선포'),`운영위원 ${tot}명 중 ${known?att:'(  )'}명이 참석하시어 성원되었으므로 제${s.meet.no}회 ${cm} ${s.meet.kind} 개의를 선언합니다.`,GV));
  R(SP('위원장',chair),C('먼저 간사님의 보고사항을 듣도록 하겠습니다.'));
  R(SP('간  사',sec),C(HD('보고 사항'),`보고사항을 말씀드리겠습니다. 금일 개최하는 제${s.meet.no}회 ${cm} ${s.meet.kind}는${q(o.ordinance)}${o.article.replace(/\(.*\)$/,'')}에 의거 학교장으로부터 제출된 '${firstAgenda()}'${n>1?` 외 ${n-1}건`:''}의 안건심의를 갖고자 금일 ${s.meet.kind}를 갖게 되었습니다. 이상으로 보고를 마치겠습니다.`));
  R(SP('위원장',chair),C(HD('회기 결정'),`간사님 수고하셨습니다. 그럼 안건심의에 앞서 제${s.meet.no}회 ${cm} ${s.meet.kind} 회기결정의 건을 상정합니다.`,GV));
  R(SP('위원장',chair),C(`이번 ${s.meet.kind}의 회기는 금일 1일로 하고 배부해드린 의사일정과 같이 진행하고자 하는데 위원 여러분께서는 이의가 없으십니까?`));
  R(SP('전위원'),C('네, 동의합니다.'));
  R(SP('위원장',chair),C(`이의가 없으므로 제${s.meet.no}회 ${cm} ${s.meet.kind}는 금일 1일로 하기로 가결되었음을 선포합니다.`,GV));
  ag.forEach((a,i)=>{
    const t=trim(a.title), no=trim(a.no)||String(i+1), res=trim(a.result)||'원안가결', vote=trim(a.vote)||'전원찬성';
    const isOrig=/원안/.test(res);
    R(SP('위원장',chair),C(HD(`안건 상정(${no}호)`),`다음은 안건번호 제${no}호 '${t}'${josa(t,'을를')} 상정합니다.`,GV));
    R(SP('위원장',chair),C('담당자께서는 제안설명을 하여 주시기 바랍니다.'));
    R(SP('담당자',trim(a.presenter)||' '),C(HD('제안 설명'),`안건번호 제${no}호 '${t}' 제안설명`+(trim(a.summary)?`\n${trim(a.summary)}`:'')));
    R(SP('위원장',chair),C('제안설명 잘 들었습니다. 본 안건에 관하여 질의사항이나 의견이 있으신 위원님들은 말씀해 주시기 바랍니다.'));
    R(SP('위  원',' '),C(HD('질의답변 및 토론'),`안건번호 제${no}호 '${t}'건 관련 질의 답변 및 토론`+(trim(a.qna)?`\n${trim(a.qna)}`:'')));
    R(SP('위원장',chair),C('본 안건에 관하여 추가 질의 사항이나 의견이 없으신가요?'));
    R(SP('전위원'),C('없습니다.'));
    R(SP('위원장',chair),C(`더이상 질의 및 의견이 없으므로 안건번호 제${no}호 '${t}'에 대하여 ${isOrig?'원안대로 가결':`${res}${josa(res,'로')} 처리`}하고자 하는데 이의 있으신 위원님 계십니까?`));
    R(SP('전위원'),C('이의 없습니다.'));
    R(SP('위원장',chair),C(`이의가 없으므로 안건번호 제${no}호 '${t}'${josa(t,'은는')} ${vote}${josa(vote,'로')} ${res}되었음을 선포합니다.`,GV));
  });
  R(SP('위원장',chair),C(HD('기타 협의'),'다음으로 안건심의 외에 기타 협의 시간을 갖도록 하겠습니다.','의견이 있는 위원님들께서는 말씀하여 주시기 바랍니다.'));
  R(SP('전위원'),C(trim(s.minutes.others)||'없습니다.'));
  R(SP('위원장',chair),C('다른 의견이 없으므로 기타 협의시간은 종료하도록 하겠습니다.'));
  R(SP('위원장',chair),C(HD('폐  회'),`위원님 여러분! 그리고 관계 교직원 여러분! 수고 많으셨습니다. 이것으로 제${s.meet.no}회 ${cm} ${s.meet.kind} 폐회를 선포합니다.`,{...GV,al:'center'}));
  const attLine=known?(absent.length?`${att}명 (불참: ${absent.join(', ')})`:`${att}명 (전원 출석)`):'     명(          )';
  rows.push([{cs:2,p:[{t:`  ▣ 출석  위원 :  ${attLine}`},{t:''},{t:`  ▣ 출석교직원 :  ${trim(s.minutes.staffAttend)||'     명(          )'}`},{t:''},{t:`  ▣ 기  록  자 : 직급 ${trim(s.staff.recorderTitle)||'        '}   성명 ${trim(s.staff.manager)} (인)`}],size:12}]);
  const agendaText=ag.length?ag.map((a,i)=>`  ${i+1}. ${a.no?`제${trim(a.no)}호 `:''}${trim(a.title)}`).join('\n'):'  (안건 없음)';
  const head=T([
    [{rs:2,cs:4,p:[{t:`${s.meet.year}학년도 제${s.meet.no}회 ${cm} ${s.meet.kind}`,size:13,font:'h',al:'center'},{t:'',size:6},{t:'회   의   록',size:25,font:'h',al:'center'}]},{t:'작성자',b:true,al:'center',size:12,h:8},{t:'간  사',b:true,al:'center',size:12},{t:'위원장',b:true,al:'center',size:12}],
    [{t:'',h:18},{t:''},{t:''}],
    [{cs:7,p:[{t:`○ 일    시: ${whenStr()}`},{t:`○ 장    소: ${placeStr()}`}],size:12,h:14}],
    [{cs:7,p:[{t:'○ 심의 안건'},{t:agendaText}],size:12,h:14}],
    [{cs:7,p:[{t:`○ 출석 현황: 재적 ${tot}명 · 출석 ${known?att:'   '}명${known&&absent.length?` · 불참 ${absent.length}명(${absent.join(', ')})`:''}${trim(s.minutes.staffAttend)?` / 출석 교직원: ${trim(s.minutes.staffAttend)}`:''}`}],size:12,h:8}]
  ],{w:[18,40,28,28,18,19,19],border:true,font:'m',size:12,pad:1.2});
  return {blocks:[head,BL(1,8,'m'),T(rows,{w:[28,142],border:true,font:'m',size:12,h:8,pad:1.2,va:'top',hdr:true})]};
}
function docC2(){ // 안건처리결과 이송 기안문
  const s=S,o=s.opts,cm=committee(),ag=agendaList();
  const b=[
    gianHead(`${trim(s.school.name)||'○○학교'}장`,`${s.meet.year}학년도 제${s.meet.no}회 ${cm} ${s.meet.kind} 안건처리 결과 이송`),
    BL(1,8),
    G(`1. 관련: ${s.meet.year}학년도 제${s.meet.no}회 ${cm} ${s.meet.kind} 소집(${cm}-${trim(s.docs.no2)||'      '}(${fmtDot(s.docs.noticeDate)}))`,{ind:0,hang:6,align:'justify'}),
    BL(1,5),
    G(`2. ${s.meet.year}학년도 제${s.meet.term}기 ${cm} 제${s.meet.no}회 ${s.meet.kind} 실시에 따른 안건처리 결과를 붙임과 같이 이송합니다.`,{ind:0,hang:6,align:'justify'})
  ];
  if(o.resultTable&&ag.length){
    const many=ag.length>8;
    b.push(BL(1,6),T([[{t:'안건번호',b:true,al:'center'},{t:'안 건 명',b:true,al:'center'},{t:'처리결과',b:true,al:'center'},{t:'표결결과',b:true,al:'center'}],...ag.map(a=>[{t:trim(a.no),al:'center'},{t:trim(a.title)},{t:trim(a.result),al:'center'},{t:trim(a.vote),al:'center'}])],{w:[20,94,26,30],border:true,font:'g',size:many?9.5:10.5,h:many?5.5:7,pad:0.8}),BL(1,6));
  } else b.push(BL(1,10));
  b.push(G(`붙임  안건처리 상황표 ${ag.length}부.  끝.`),BL(o.resultTable&&ag.length?1:3,10),signer(),BL(1,6),gianFoot(s.docs.no3,s.docs.resultDate));
  return {blocks:b};
}
function docC3(){ // 안건처리상황표
  const s=S,cm=committee(),ag=agendaList(); const b=[];
  const L=t=>({t,b:true,al:'center'});
  (ag.length?ag:[newAgenda({title:'(안건 없음)'})]).forEach((a,i)=>{
    const res=trim(a.result)||'원안가결', vote=trim(a.vote)||'전원찬성';
    b.push(T([
      [{t:'안건 처리 상황표',cs:2,size:24,b:true,font:'h',al:'center',h:20}],
      [L('안건번호'),{t:trim(a.no)}],
      [L('안건명'),{t:trim(a.title)}],
      [L('제안자'),{t:'학교장'}],
      [L('제안년월일'),{t:fmtKo(s.docs.proposeDate)}],
      [L('심사위원회'),{t:cm}],
      [L('심의결과'),{p:[{t:`${s.meet.year}학년도 ${cm} 제${s.meet.no}회 ${s.meet.kind}`},{t:fmtKo(s.meet.date)},{t:`제1차 본회의 ${res}`,b:true}],h:32}],
      [L('이송년월일'),{t:fmtKo(s.docs.resultDate)}],
      [L('비고'),{p:[{t:`□ 표결결과: ${vote}`},{t:''},{t:`□ 주요내용: ${trim(s.school.name)||'○○학교'} 학교장이 제출한(담당부서: ${trim(a.dept)||'    '}) ${q(a.title)}에 대하여 심의결과 ${vote}${josa(vote,'로')} ${res} 처리함`}],h:44,al:'left'}]
    ],{w:[40,130],border:true,font:'m',size:14,h:14,pad:1.5}));
    if(i<ag.length-1) b.push(PB());
  });
  return {blocks:b};
}

/* ---------- 문서 목록 ---------- */
const DOCS=[
  {id:'a1',step:4,ix:'1',name:'소집 내부기안문',file:'1.운영위소집내부기안문',desc:'위원장 명의 내부결재 — 회의 소집 결정. 관련·일시·참석대상·장소·심의안건·붙임',build:docA1},
  {id:'a2',step:4,ix:'2',name:'참석요청(안내) 기안문',file:'2.운영위참석요청기안',desc:'위원 앞 참석 안내 공문 — 수신자 "제n기 운영위원회 위원 n명"',build:docA2},
  {id:'a3',step:4,ix:'1-1',name:'소집 공고문',file:'1-1.운영위소집공고문',desc:'홈페이지·게시판 게시용 공고 — 【공고 제○○ - n】',build:docA3},
  {id:'a4',step:4,ix:'1-2',name:'안내장(방청 안내)',file:'1-2.회의실시안내장',desc:'학부모·지역주민 방청 안내 가정통신문',build:docA4},
  {id:'a5',step:4,ix:'1-3',name:'소집공고 기안문',file:'1-3.운영위소집공고기안문',desc:'공고 실시 내부결재 (필요한 학교만)',build:docA5,opt:true},
  {id:'b1',step:5,ix:'3',name:'등록부(출석·서명)',file:'3.등록부',desc:'위원장·부위원장·학부모·교직원·지역위원 순 서명란',build:docB1},
  {id:'b2',step:5,ix:'4',name:'회의 시나리오',file:'4.회의시나리오',desc:'우리 학교 회의록 양식 — 결재란·일시·장소·참석자·진행순서·상정안건 + 발언자별 진행 대본',build:docB2},
  {id:'b3',step:5,ix:'0',name:'심의자료 (표지·안건목록·안건 원문)',file:'0.회의자료',desc:'심의자료 묶음 표지 + 안건 목록(쪽번호란) + 의사일정 + 2단계에서 취합한 안건 한글파일 원문(안건마다 새 쪽)',build:docB3},
  {id:'c1',step:6,ix:'5',name:'회의록',file:'5.회의록',desc:'결재란 + 일시·장소·안건 + 발언자별 회의 진행 내용(요약) + 출석·기록자',build:docC1},
  {id:'c2',step:6,ix:'6',name:'안건처리결과 이송 기안문',file:'6.안건처리결과이송기안문',desc:'학교장 앞 처리결과 이송 공문 (요약표 포함 가능)',build:docC2},
  {id:'c3',step:6,ix:'6-1',name:'안건처리상황표',file:'6-1.안건처리상황표',desc:'안건마다 1쪽 — 제안·심의결과·이송년월일·표결결과·주요내용',build:docC3}
];
const docById=id=>DOCS.find(d=>d.id===id);
const docsOfStep=st=>DOCS.filter(d=>d.step===st);
function docFileName(d){ return safeName(`${trim(S.school.name)||'학교'}_제${S.meet.no||'0'}회_${d.file}`); }

/* =====================================================================
   렌더러 — 블록(DSL) → HTML(미리보기·인쇄)
   ===================================================================== */
const PAGE_W=170; // mm (A4 210 - 좌우 20)
const mm2tw=mm=>Math.round(mm*56.6929);
const pt2tw=pt=>Math.round(pt*20);
const alignOf=o=>({left:'left',center:'center',right:'right',justify:'justify'})[o.al||o.align||'left']||'left';
const runsOf=b=>Array.isArray(b.text)?b.text:(Array.isArray(b.runs)?b.runs:[{t:b.text??b.t??''}]);

/* ---------- 표 격자 계산 (colspan/rowspan 전개) ---------- */
function tableGrid(tb){
  const ncol=tb.w.length, nrow=tb.rows.length; const occ=Array.from({length:nrow},()=>new Array(ncol).fill(null));
  for(let r=0;r<nrow;r++){ let c=0; for(const cell of tb.rows[r]){ while(c<ncol&&occ[r][c]) c++; if(c>=ncol) break; const cs=Math.min(cell.cs||1,ncol-c), rs=Math.min(cell.rs||1,nrow-r); for(let rr=r;rr<r+rs;rr++) for(let cc=c;cc<c+cs;cc++) occ[rr][cc]={cell,top:rr===r,left:cc===c,col:c,cs,rs}; c+=cs; } }
  return occ;
}
function rowHeight(tb,r){ let h=tb.h||0; for(const cell of tb.rows[r]) if(cell.h&&!(cell.rs>1)) h=Math.max(h,cell.h); return h; }
function cellParas(cell,tb){ // → [{runs,al,size,font,b}]
  if(Array.isArray(cell.p)) return cell.p.map(p=>({runs:runsOf(p),al:p.al||cell.al||tb.al||'left',size:p.size||cell.size||tb.size||12,font:p.font||cell.font||tb.font||'g',b:p.b??cell.b??false}));
  const lines=String(cell.t??'').split('\n');
  return lines.map(t=>({runs:[{t}],al:cell.al||tb.al||'left',size:cell.size||tb.size||12,font:cell.font||tb.font||'g',b:!!cell.b}));
}
function borderOf(cell,tb,side){ const v=cell.bd&&cell.bd[side]; if(v) return v; return tb.border===false?'n':'s'; }

/* ---------- HTML ---------- */
function runsHTML(runs,base){
  return runs.map(r=>{ const st=[]; if(r.font) st.push(`font-family:${FONT[r.font].css}`); if(r.size) st.push(`font-size:${r.size}pt`); if(r.b!=null) st.push(`font-weight:${r.b?700:400}`); if(r.u) st.push('text-decoration:underline'); if(r.color) st.push(`color:#${r.color}`);
    const txt=esc(r.t??'').replace(/\n/g,'<br>'); return st.length?`<span style="${st.join(';')}">${txt}</span>`:txt; }).join('');
}
function paraHTML(b){
  const runs=runsOf(b); const st=[`font-family:${FONT[b.font||'g'].css}`,`font-size:${b.size||12}pt`,`font-weight:${b.b?700:400}`,`text-align:${alignOf(b)}`,`line-height:${b.lh||1.6}`];
  const ind=b.ind||0, hang=b.hang||0; if(ind||hang){ st.push(`padding-left:${ind+hang}mm`); if(hang) st.push(`text-indent:-${hang}mm`); }
  if(b.after) st.push(`margin-bottom:${b.after}pt`);
  const inner=runsHTML(runs,b)||'&nbsp;';
  let s=''; for(let i=0;i<(b.rep||1);i++) s+=`<p style="${st.join(';')}">${inner}</p>`; return s;
}
function tableHTML(tb){
  const occ=tableGrid(tb); const total=tb.w.reduce((a,b)=>a+b,0); const pad=tb.pad??1;
  let h=`<table style="width:${total}mm;margin-left:auto;margin-right:auto"><colgroup>${tb.w.map(w=>`<col style="width:${w}mm">`).join('')}</colgroup>${tb.hdr?'<thead>':'<tbody>'}`;
  for(let r=0;r<tb.rows.length;r++){
    if(tb.hdr&&r===1) h+='</thead><tbody>';
    const rh=rowHeight(tb,r); h+=`<tr${rh?` style="height:${rh}mm"`:''}>`;
    for(let c=0;c<tb.w.length;c++){ const o=occ[r][c]; if(!o){ h+=`<td style="border:0"></td>`; continue; } if(!o.top||!o.left) continue; const cell=o.cell;
      const bd=side=>{ const v=borderOf(cell,tb,side); return v==='n'?'0':v==='b'?'2.2pt solid #000':'0.5pt solid #000'; };
      const st=[`border-top:${bd('t')}`,`border-bottom:${bd('b')}`,`border-left:${bd('l')}`,`border-right:${bd('r')}`,`padding:${pad}mm ${pad+1}mm`,`vertical-align:${cell.va||tb.va||'middle'}`];
      if(cell.bg) st.push(`background:#${cell.bg}`);
      h+=`<td${o.cs>1?` colspan="${o.cs}"`:''}${o.rs>1?` rowspan="${o.rs}"`:''} style="${st.join(';')}">`;
      for(const p of cellParas(cell,tb)) h+=`<p style="font-family:${FONT[p.font].css};font-size:${p.size}pt;font-weight:${p.b?700:400};text-align:${p.al};line-height:1.35">${runsHTML(p.runs,p)||'&nbsp;'}</p>`;
      h+='</td>'; }
    h+='</tr>';
  }
  if(tb.hdr&&tb.rows.length<2) h+='</thead><tbody>';
  return h+'</tbody></table>';
}
/* 문서 → 쪽(.sheet) 배열 HTML */
function docPagesHTML(doc){
  const pages=[[]]; for(const b of doc.blocks){ if(b.t==='pb'){ pages.push([]); continue; } pages[pages.length-1].push(b); }
  return pages.map(bs=>`<div class="sheet">${bs.map(b=>b.t==='img'?imgHTML(b):b.t==='tbl'?tableHTML(b):paraHTML(b)).join('')}</div>`).join('');
}
function docsHTML(ids){ return ids.map(id=>docPagesHTML(docById(id).build())).join(''); }

/* ---------- 인쇄 ---------- */
function printDocs(ids){
  const root=HK.printRoot(); root.innerHTML=docsHTML(ids);
  const done=()=>{ setTimeout(()=>{ root.innerHTML=''; document.body.classList.remove('hk-printing'); },500); window.removeEventListener('afterprint',done); };
  window.addEventListener('afterprint',done);
  document.body.classList.add('hk-printing'); setTimeout(()=>window.print(),60);
}

/* =====================================================================
   엑셀(xlsx) 저장 / 불러오기 — 전체 자료를 엑셀 한 파일에 담음
   · 자료입력  : 기존 '학교운영위원회 자동화' 엑셀과 같은 배치 (호환)
   · 위원명단  : 구분·성명·출석·직책
   · 안건목록  : 번호·안건명·부서·처리결과·표결결과·설명자·요지
   · 설정      : 문구 설정 · 회의록 보충 정보 · 기타
   ===================================================================== */
const XL_KEYS=[ // [키, 상태경로 또는 함수, 비고]
  ['학교명','school.name','정식학교명칭입력'],['우편번호','school.zip',''],['주소','school.addr','도로명주소입력'],['전화번호','school.tel','055-000-0000'],['팩스번호','school.fax','055-000-0000'],['홈페이지주소','school.web',''],
  ['학년도','meet.year','숫자(해당 학년도)'],['위원회기수','meet.term','숫자(위원회 구성 기수)'],['회차','meet.no','숫자(회의 회차)'],['위원수',()=>memberCount(),'자동계산/숫자(운영위원 수)'],['회의구분','meet.kind','정기회/임시회'],['회의일자','meet.date','날짜형식입력(2020-01-01)'],['회의요일',()=>wd(S.meet.date),'자동계산/요일'],['회의시간',()=>fmtTime(S.meet.time),'서식텍스트/시간형식입력(17:30)'],['회의장소','meet.place','텍스트'],
  ['담당자','staff.manager','담당자성명'],['간사','staff.secretary','간사 또는 행정실장명'],['위원장','staff.chair','위원장성명'],['부위원장','staff.vice','부위원장성명'],['학교장','staff.principal','교장성명']
];
const XL_DATE_KEYS={'회의일자':'meet.date','공고일자':'docs.noticeDate','안건제안일자':'docs.proposeDate','안건처리일자':'docs.resultDate'};
const XL_DOC_KEYS=[['소집공고(문)번호','docs.noticeNo','숫자'],['(소집내부기안)문서번호','docs.no1','숫자'],['(참석요청기안)문서번호','docs.no2','숫자'],['(처리결과이송)문서번호','docs.no3','숫자'],['(소집공고기안)문서번호','docs.no4','숫자'],['(학교장심의요청)문서번호','docs.submitNo','텍스트'],['공고일자','docs.noticeDate','날짜형식입력(2020-01-01)'],['공고요일',()=>wd(S.docs.noticeDate),'자동계산'],['안건제안일자','docs.proposeDate','날짜형식입력(2020-01-01)'],['안건제안요일',()=>wd(S.docs.proposeDate),'자동계산'],['안건처리일자','docs.resultDate','날짜형식입력(2020-01-01)'],['안건처리요일',()=>wd(S.docs.resultDate),'자동계산']];
const XL_MAX_AG=30;
/* '설정' 시트 키 ↔ 상태 경로 (b: 예/아니오) */
const XL_SET_KEYS=[
  ['간사 직위','staff.secTitle'],['기록자 직급','staff.recorderTitle'],
  ['출석 확정','minutes.attConfirmed','b'],['출석 교직원','minutes.staffAttend'],['위원장 개회사 요지','minutes.openRemark'],['학교장 인사말씀 요지','minutes.principalRemark'],['기타 협의 내용','minutes.others'],
  ['근거 조례명','opts.ordinance'],['근거 조항(소집)','opts.article'],['공고문 근거 조항','opts.article2'],['기타사항 문구','opts.etcLine'],['참고사항 문구','opts.refLine'],['발신 명의','opts.signer'],
  ['공고문·안내장 안건 전체 나열','opts.listAll','b'],['이송 기안문 결과 요약표','opts.resultTable','b'],['심의자료 의사일정 쪽','opts.agendaPage','b'],
  ['소집 문서 생성 완료','done.s4','b'],['진행 문서 생성 완료','done.s5','b'],['결과 문서 생성 완료','done.s6','b']
];
const MEM_GROUPS=[['학부모위원','parent',8],['교원위원','teacher',6],['지역위원','local',4]];

function colName(n){ let s=''; n++; while(n>0){ const m=(n-1)%26; s=String.fromCharCode(65+m)+s; n=Math.floor((n-1)/26); } return s; }
function colIndex(letters){ let n=0; for(const ch of letters) n=n*26+(ch.charCodeAt(0)-64); return n-1; }
function cellXml(ref,v,style){ if(v==null||v==='') return ''; if(typeof v==='number') return `<c r="${ref}"${style?` s="${style}"`:''}><v>${v}</v></c>`; if(v&&v.date){ const n=isoToExcelSerial(v.date); return n==null?'':`<c r="${ref}" s="1"><v>${n}</v></c>`; } return `<c r="${ref}"${style?` s="${style}"`:''} t="inlineStr"><is><t xml:space="preserve">${xesc(v)}</t></is></c>`; }
function sheetXml(rows,widths){ // rows: [[v,...],...] v: string|number|{date}|{v,s}
  let x=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols>${widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>`;
  rows.forEach((row,ri)=>{ const cells=row.map((v,ci)=>{ if(v&&typeof v==='object'&&'v' in v) return cellXml(`${colName(ci)}${ri+1}`,v.v,v.s); return cellXml(`${colName(ci)}${ri+1}`,v); }).join(''); if(cells) x+=`<row r="${ri+1}">${cells}</row>`; });
  return x+'</sheetData></worksheet>';
}
function numOrText(v){ v=trim(v); if(v==='') return ''; return /^-?\d+(\.\d+)?$/.test(v)?Number(v):v; }
function buildXlsx(){
  const H=v=>({v,s:2});
  const rows=[[H('□ 학교운영위원회 정보자료 입력')],[H('구  분'),H('자료 입력'),H('비  고')]];
  const val=(spec)=>typeof spec==='function'?spec():getPath(spec);
  for(const [k,spec,note] of XL_KEYS){ let v=val(spec); if(XL_DATE_KEYS[k]) v={date:v}; else if(k==='우편번호'||k==='학년도'||k==='위원회기수'||k==='회차'||k==='위원수') v=numOrText(v); rows.push([k,v,note]); }
  for(const [lab,g,min] of MEM_GROUPS){ const list=S.members[g]; rows.push([`${lab}수`,list.length,'자동계산']); const n=Math.max(min,list.length); for(let i=0;i<n;i++) rows.push([`${lab}${i+1}`,list[i]?list[i].name:'','텍스트']); }
  for(const [k,spec,note] of XL_DOC_KEYS){ let v=val(spec); if(XL_DATE_KEYS[k]) v={date:v}; else if(k==='소집공고(문)번호') v=numOrText(v); rows.push([k,v,note]); }
  const ag=S.agendas; const N=Math.max(XL_MAX_AG,ag.length);
  rows.push(['안건수',agendaList().length,'자동계산']);
  const label=(i,suffix)=>`안건${ag[i]&&trim(ag[i].no)?trim(ag[i].no):''}호${suffix||''}`;
  for(let i=0;i<N;i++) rows.push([label(i),ag[i]?trim(ag[i].title):'','텍스트']);
  for(let i=0;i<N;i++) rows.push([`안건${i+1}번호`,ag[i]?numOrText(ag[i].no):'','숫자']);
  for(let i=0;i<N;i++) rows.push([label(i,' 부서'),ag[i]?trim(ag[i].dept):'','텍스트']);
  for(let i=0;i<N;i++) rows.push([label(i,' 처리결과'),ag[i]?trim(ag[i].result):'','텍스트']);
  for(let i=0;i<N;i++) rows.push([label(i,' 투표결과'),ag[i]?trim(ag[i].vote):'','텍스트']);
  const s1=sheetXml(rows,[24,46,30]);
  const mrows=[[H('구분'),H('성명'),H('출석'),H('직책')]]; const role=n=>n===trim(S.staff.chair)?'위원장':n===trim(S.staff.vice)?'부위원장':'';
  for(const [lab,g] of MEM_GROUPS) S.members[g].forEach(m=>mrows.push([lab,m.name,m.attend?'출석':'불참',role(m.name)]));
  const s2=sheetXml(mrows,[14,16,8,12]);
  const arows=[[H('순번'),H('안건번호'),H('안건명'),H('제안부서'),H('처리결과'),H('표결결과'),H('설명자'),H('제안설명 요지'),H('질의·토론 요지')]];
  ag.forEach((a,i)=>arows.push([i+1,numOrText(a.no),trim(a.title),trim(a.dept),trim(a.result),trim(a.vote),trim(a.presenter),trim(a.summary),trim(a.qna)]));
  const s3=sheetXml(arows,[6,10,60,16,12,14,14,40,40]);
  const srows=[[H('항목'),H('값'),H('비고')]];
  for(const [k,p,b] of XL_SET_KEYS){ const v=getPath(p); srows.push([k,b?(v?'예':'아니오'):(v==null?'':String(v)),b?'예/아니오':'']); }
  srows.push(['저장 프로그램',`${APP_NAME} v${APP_VER}`,''],['저장 일시',new Date().toLocaleString('ko-KR'),'']);
  const s4=sheetXml(srows,[28,60,12]);
  const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const wb=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="자료입력" sheetId="1" r:id="rId1"/><sheet name="위원명단" sheetId="2" r:id="rId2"/><sheet name="안건목록" sheetId="3" r:id="rId3"/><sheet name="설정" sheetId="4" r:id="rId4"/></sheets></workbook>`;
  const wrels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="맑은 고딕"/><family val="2"/></font><font><b/><sz val="11"/><name val="맑은 고딕"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDCE6F2"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  return zipStore([{name:'[Content_Types].xml',data:ct},{name:'_rels/.rels',data:rels},{name:'xl/workbook.xml',data:wb},{name:'xl/_rels/workbook.xml.rels',data:wrels},{name:'xl/styles.xml',data:styles},{name:'xl/worksheets/sheet1.xml',data:s1},{name:'xl/worksheets/sheet2.xml',data:s2},{name:'xl/worksheets/sheet3.xml',data:s3},{name:'xl/worksheets/sheet4.xml',data:s4}],'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/* ---------- 불러오기 ---------- */
function parseSheetCells(xml,sst){ // → {A3:value,...}
  const cells={}; const re=/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g; let m;
  while((m=re.exec(xml))){ const attrs=m[1], inner=m[2]||''; const r=/\br="([A-Z]+\d+)"/.exec(attrs); if(!r) continue; const t=(/\bt="([^"]+)"/.exec(attrs)||[])[1]; let v=null;
    if(t==='inlineStr'){ v=(inner.match(/<t[^>]*>([\s\S]*?)<\/t>/g)||[]).map(x=>xun(x.replace(/<[^>]+>/g,''))).join(''); }
    else { const vm=/<v>([\s\S]*?)<\/v>/.exec(inner); if(!vm) continue; const raw=xun(vm[1]); if(t==='s') v=sst[+raw]??''; else if(t==='str'||t==='e') v=raw; else if(t==='b') v=raw==='1'; else v=Number(raw); }
    cells[r[1]]=v; }
  return cells;
}
function readWorkbook(u8){
  const z=unzip(u8);
  const sst=[]; const sx=z.text('xl/sharedStrings.xml'); if(sx){ const re=/<si>([\s\S]*?)<\/si>/g; let m; while((m=re.exec(sx))) sst.push((m[1].match(/<t[^>]*>([\s\S]*?)<\/t>/g)||[]).map(x=>xun(x.replace(/<[^>]+>/g,''))).join('')); }
  const wb=z.text('xl/workbook.xml')||''; const rels=z.text('xl/_rels/workbook.xml.rels')||'';
  const relMap={}; rels.replace(/<Relationship\b[^>]*>/g,tag=>{ const id=(/Id="([^"]+)"/.exec(tag)||[])[1], tg=(/Target="([^"]+)"/.exec(tag)||[])[1]; if(id&&tg) relMap[id]=tg.replace(/^\/?(xl\/)?/,'xl/'); return ''; });
  const sheets=[]; wb.replace(/<sheet\b[^>]*>/g,tag=>{ const name=xun((/name="([^"]*)"/.exec(tag)||[])[1]||''); const rid=(/r:id="([^"]+)"/.exec(tag)||/\bid="([^"]+)"/.exec(tag)||[])[1]; const path=relMap[rid]; if(path&&z.has(path)) sheets.push({name,path}); return ''; });
  const cache={};
  const cellsOf=name=>{ const s=sheets.find(x=>x.name===name); if(!s) return null; if(!cache[name]) cache[name]=parseSheetCells(z.text(s.path),sst); return cache[name]; };
  const rowsOf=name=>{ const cells=cellsOf(name); if(!cells) return null; const rows=[]; for(const ref of Object.keys(cells)){ const m=/^([A-Z]+)(\d+)$/.exec(ref); if(!m) continue; const r=+m[2]-1, c=colIndex(m[1]); (rows[r]=rows[r]||[])[c]=cells[ref]; } return rows; };
  return {names:sheets.map(s=>s.name),cellsOf,rowsOf};
}
function xlsxToState(u8){
  const wb=readWorkbook(u8);
  /* 1) 자료입력(구분/자료 입력) 시트 찾기 */
  const order=[...wb.names.filter(n=>n==='자료입력'),...wb.names.filter(n=>n!=='자료입력')]; let kv=null, sheetName='';
  for(const n of order){ const cells=wb.cellsOf(n); const list=[]; let found=false; for(let r=1;r<=400;r++){ const k=cells['A'+r]; if(k==null||k==='') continue; const ks=trim(k); if(ks==='학교명') found=true; list.push([ks,cells['B'+r]??'',r]); } if(found){ kv=list; sheetName=n; break; } }
  if(!kv) throw new Error("'자료입력' 시트(구분 / 자료 입력 배치)를 찾지 못했습니다. 이 프로그램이나 예전 학교운영위원회 자동화 엑셀에서 저장한 파일을 골라 주세요.");
  const st=DEF(); st.opts=Object.assign(DEF_OPTS(),S.opts);
  const toDate=v=>typeof v==='number'?excelSerialToISO(v):(iso(pd(v))||''); const toTime=v=>{ if(typeof v==='number'&&v<1){ const m=Math.round(v*1440); return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; } return fmtTime(typeof v==='number'?String(v):v); };
  const str=v=>v==null?'':(typeof v==='number'?String(v):String(v)).trim();
  const numIdx={}, byNo={}; const members={parent:[],teacher:[],local:[]};
  for(const [k,v] of kv){
    let m;
    if(XL_DATE_KEYS[k]){ setPathOn(st,XL_DATE_KEYS[k],toDate(v)); continue; }
    if(k==='회의시간'){ st.meet.time=toTime(v); continue; }
    const spec=XL_KEYS.find(x=>x[0]===k)||XL_DOC_KEYS.find(x=>x[0]===k);
    if(spec&&typeof spec[1]==='string'){ setPathOn(st,spec[1],str(v)); continue; }
    if((m=/^(학부모|교원|지역)위원(\d+)$/.exec(k))){ const g={'학부모':'parent','교원':'teacher','지역':'local'}[m[1]]; if(str(v)) members[g].push(newMember(str(v))); continue; }
    if((m=/^안건(\d+)번호$/.exec(k))){ if(str(v)) numIdx[+m[1]]=str(v); continue; }
    if((m=/^안건(\d+)호(?: (부서|처리결과|투표결과))?$/.exec(k))){ const no=m[1]; const f=m[2]; byNo[no]=byNo[no]||{}; const val=str(v); if(!f){ if(val) byNo[no].title=val; } else if(f==='부서') byNo[no].dept=val; else if(f==='처리결과') byNo[no].result=val; else byNo[no].vote=val; continue; }
  }
  st.members=members;
  /* 수식 결과값이 저장되지 않은 파일: 고정 배치(안건1번호 행 기준 ±30행)로 보완 */
  if(!Object.keys(byNo).length&&Object.keys(numIdx).length){ const r1=(kv.find(x=>x[0]==='안건1번호')||[])[2]; if(r1){ const at=r=>kv.find(x=>x[2]===r); for(let i=1;i<=XL_MAX_AG;i++){ const no=numIdx[i]; if(!no) continue; const t=at(r1-XL_MAX_AG+i-1), d=at(r1+XL_MAX_AG+i-1), rs=at(r1+2*XL_MAX_AG+i-1), vt=at(r1+3*XL_MAX_AG+i-1); const title=t?str(t[1]):''; if(title) byNo[no]={title,dept:d?str(d[1]):'',result:rs?str(rs[1]):'',vote:vt?str(vt[1]):''}; } } }
  const idxs=Object.keys(numIdx).map(Number).sort((a,b)=>a-b); const used=new Set();
  for(const i of idxs){ const no=numIdx[i]; const a=byNo[no]; if(a&&a.title){ st.agendas.push(newAgenda({no,title:a.title,dept:a.dept||'',result:a.result||'원안가결',vote:a.vote||'전원찬성'})); used.add(no); } }
  for(const no of Object.keys(byNo)){ if(!used.has(no)&&byNo[no].title) st.agendas.push(newAgenda({no,title:byNo[no].title,dept:byNo[no].dept||'',result:byNo[no].result||'원안가결',vote:byNo[no].vote||'전원찬성'})); }
  if(!st.meet.kind) st.meet.kind='정기회';
  /* 2) 위원명단 시트 — 출석·순서 포함 (있으면 우선) */
  const extras=[];
  const mrows=wb.rowsOf('위원명단');
  if(mrows){ const mm={parent:[],teacher:[],local:[]}; let cnt=0; for(let r=1;r<mrows.length;r++){ const row=mrows[r]||[]; const g={'학부모위원':'parent','교원위원':'teacher','지역위원':'local'}[str(row[0])]; const name=str(row[1]); if(!g||!name) continue; mm[g].push({name,attend:str(row[2])!=='불참'}); cnt++; if(str(row[3])==='위원장'&&!st.staff.chair) st.staff.chair=name; if(str(row[3])==='부위원장'&&!st.staff.vice) st.staff.vice=name; } if(cnt){ st.members=mm; extras.push('위원명단(출석)'); } }
  /* 3) 안건목록 시트 — 설명자·요지 포함 (있으면 우선) */
  const arows=wb.rowsOf('안건목록');
  if(arows){ const list=[]; for(let r=1;r<arows.length;r++){ const row=arows[r]||[]; const title=str(row[2]); if(!title) continue; list.push(newAgenda({no:str(row[1]),title,dept:str(row[3]),result:str(row[4])||'원안가결',vote:str(row[5])||'전원찬성',presenter:str(row[6]),summary:str(row[7]),qna:str(row[8])})); } if(list.length){ st.agendas=list; extras.push('안건목록(상세)'); } }
  /* 4) 설정 시트 */
  const srows=wb.rowsOf('설정');
  if(srows){ let cnt=0; for(let r=1;r<srows.length;r++){ const row=srows[r]||[]; const k=str(row[0]); const spec=XL_SET_KEYS.find(x=>x[0]===k); if(!spec) continue; const v=row[1]; if(spec[2]==='b') setPathOn(st,spec[1],/^(예|y|yes|true|1|o|○)$/i.test(str(v))); else setPathOn(st,spec[1],str(v)); cnt++; } if(cnt) extras.push('설정'); }
  return {state:st,sheet:sheetName,extras};
}
function setPathOn(obj,p,v){ const ks=p.split('.'); let o=obj; for(let i=0;i<ks.length-1;i++){ if(o[ks[i]]==null) o[ks[i]]={}; o=o[ks[i]]; } o[ks[ks.length-1]]=v; }

/* HWPX 골격(한글에서 저장한 빈 문서 기반) — 자동 추출 */
const HX={"HEAD_OPEN": "<hh:head xmlns:ha=\"http://www.hancom.co.kr/hwpml/2011/app\" xmlns:hp=\"http://www.hancom.co.kr/hwpml/2011/paragraph\" xmlns:hp10=\"http://www.hancom.co.kr/hwpml/2016/paragraph\" xmlns:hs=\"http://www.hancom.co.kr/hwpml/2011/section\" xmlns:hc=\"http://www.hancom.co.kr/hwpml/2011/core\" xmlns:hh=\"http://www.hancom.co.kr/hwpml/2011/head\" xmlns:hhs=\"http://www.hancom.co.kr/hwpml/2011/history\" xmlns:hm=\"http://www.hancom.co.kr/hwpml/2011/master-page\" xmlns:hpf=\"http://www.hancom.co.kr/schema/2011/hpf\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf/\" xmlns:ooxmlchart=\"http://www.hancom.co.kr/hwpml/2016/ooxmlchart\" xmlns:hwpunitchar=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xmlns:config=\"urn:oasis:names:tc:opendocument:xmlns:config:1.0\" version=\"1.5\" secCnt=\"1\">", "FONT_BASE": "<hh:font id=\"0\" face=\"함초롬돋움\" type=\"TTF\" isEmbedded=\"0\"><hh:typeInfo familyType=\"FCAT_GOTHIC\" weight=\"6\" proportion=\"4\" contrast=\"0\" strokeVariation=\"1\" armStyle=\"1\" letterform=\"1\" midline=\"1\" xHeight=\"1\"/></hh:font><hh:font id=\"1\" face=\"함초롬바탕\" type=\"TTF\" isEmbedded=\"0\"><hh:typeInfo familyType=\"FCAT_GOTHIC\" weight=\"6\" proportion=\"4\" contrast=\"0\" strokeVariation=\"1\" armStyle=\"1\" letterform=\"1\" midline=\"1\" xHeight=\"1\"/></hh:font>", "BF_BASE": "<hh:borderFill id=\"1\" threeD=\"0\" shadow=\"0\" centerLine=\"NONE\" breakCellSeparateLine=\"0\"><hh:slash type=\"NONE\" Crooked=\"0\" isCounter=\"0\"/><hh:backSlash type=\"NONE\" Crooked=\"0\" isCounter=\"0\"/><hh:leftBorder type=\"NONE\" width=\"0.1 mm\" color=\"#000000\"/><hh:rightBorder type=\"NONE\" width=\"0.1 mm\" color=\"#000000\"/><hh:topBorder type=\"NONE\" width=\"0.1 mm\" color=\"#000000\"/><hh:bottomBorder type=\"NONE\" width=\"0.1 mm\" color=\"#000000\"/><hh:diagonal type=\"SOLID\" width=\"0.1 mm\" color=\"#000000\"/></hh:borderFill><hh:borderFill id=\"2\" threeD=\"0\" shadow=\"0\" centerLine=\"NONE\" breakCellSeparateLine=\"0\"><hh:slash type=\"NONE\" Crooked=\"0\" isCounter=\"0\"/><hh:backSlash type=\"NONE\" Crooked=\"0\" isCounter=\"0\"/><hh:leftBorder type=\"NONE\" width=\"0.1 mm\" color=\"#000000\"/><hh:rightBorder type=\"NONE\" width=\"0.1 mm\" color=\"#000000\"/><hh:topBorder type=\"NONE\" width=\"0.1 mm\" color=\"#000000\"/><hh:bottomBorder type=\"NONE\" width=\"0.1 mm\" color=\"#000000\"/><hh:diagonal type=\"SOLID\" width=\"0.1 mm\" color=\"#000000\"/><hc:fillBrush><hc:winBrush faceColor=\"none\" hatchColor=\"#999999\" alpha=\"0\"/></hc:fillBrush></hh:borderFill>", "CHAR_BASE": "<hh:charPr id=\"0\" height=\"1000\" textColor=\"#000000\" shadeColor=\"none\" useFontSpace=\"0\" useKerning=\"0\" symMark=\"NONE\" borderFillIDRef=\"2\"><hh:fontRef hangul=\"1\" latin=\"1\" hanja=\"1\" japanese=\"1\" other=\"1\" symbol=\"1\" user=\"1\"/><hh:ratio hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:spacing hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:relSz hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:offset hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:underline type=\"NONE\" shape=\"SOLID\" color=\"#000000\"/><hh:strikeout shape=\"NONE\" color=\"#000000\"/><hh:outline type=\"NONE\"/><hh:shadow type=\"NONE\" color=\"#C0C0C0\" offsetX=\"10\" offsetY=\"10\"/></hh:charPr><hh:charPr id=\"1\" height=\"1000\" textColor=\"#000000\" shadeColor=\"none\" useFontSpace=\"0\" useKerning=\"0\" symMark=\"NONE\" borderFillIDRef=\"2\"><hh:fontRef hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:ratio hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:spacing hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:relSz hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:offset hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:underline type=\"NONE\" shape=\"SOLID\" color=\"#000000\"/><hh:strikeout shape=\"NONE\" color=\"#000000\"/><hh:outline type=\"NONE\"/><hh:shadow type=\"NONE\" color=\"#C0C0C0\" offsetX=\"10\" offsetY=\"10\"/></hh:charPr><hh:charPr id=\"2\" height=\"900\" textColor=\"#000000\" shadeColor=\"none\" useFontSpace=\"0\" useKerning=\"0\" symMark=\"NONE\" borderFillIDRef=\"2\"><hh:fontRef hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:ratio hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:spacing hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:relSz hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:offset hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:underline type=\"NONE\" shape=\"SOLID\" color=\"#000000\"/><hh:strikeout shape=\"NONE\" color=\"#000000\"/><hh:outline type=\"NONE\"/><hh:shadow type=\"NONE\" color=\"#C0C0C0\" offsetX=\"10\" offsetY=\"10\"/></hh:charPr><hh:charPr id=\"3\" height=\"900\" textColor=\"#000000\" shadeColor=\"none\" useFontSpace=\"0\" useKerning=\"0\" symMark=\"NONE\" borderFillIDRef=\"2\"><hh:fontRef hangul=\"1\" latin=\"1\" hanja=\"1\" japanese=\"1\" other=\"1\" symbol=\"1\" user=\"1\"/><hh:ratio hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:spacing hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:relSz hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:offset hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:underline type=\"NONE\" shape=\"SOLID\" color=\"#000000\"/><hh:strikeout shape=\"NONE\" color=\"#000000\"/><hh:outline type=\"NONE\"/><hh:shadow type=\"NONE\" color=\"#C0C0C0\" offsetX=\"10\" offsetY=\"10\"/></hh:charPr><hh:charPr id=\"4\" height=\"900\" textColor=\"#000000\" shadeColor=\"none\" useFontSpace=\"0\" useKerning=\"0\" symMark=\"NONE\" borderFillIDRef=\"2\"><hh:fontRef hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:ratio hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:spacing hangul=\"-5\" latin=\"-5\" hanja=\"-5\" japanese=\"-5\" other=\"-5\" symbol=\"-5\" user=\"-5\"/><hh:relSz hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:offset hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:underline type=\"NONE\" shape=\"SOLID\" color=\"#000000\"/><hh:strikeout shape=\"NONE\" color=\"#000000\"/><hh:outline type=\"NONE\"/><hh:shadow type=\"NONE\" color=\"#C0C0C0\" offsetX=\"10\" offsetY=\"10\"/></hh:charPr><hh:charPr id=\"5\" height=\"1600\" textColor=\"#2E74B5\" shadeColor=\"none\" useFontSpace=\"0\" useKerning=\"0\" symMark=\"NONE\" borderFillIDRef=\"2\"><hh:fontRef hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:ratio hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:spacing hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:relSz hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:offset hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:underline type=\"NONE\" shape=\"SOLID\" color=\"#000000\"/><hh:strikeout shape=\"NONE\" color=\"#000000\"/><hh:outline type=\"NONE\"/><hh:shadow type=\"NONE\" color=\"#C0C0C0\" offsetX=\"10\" offsetY=\"10\"/></hh:charPr><hh:charPr id=\"6\" height=\"1100\" textColor=\"#000000\" shadeColor=\"none\" useFontSpace=\"0\" useKerning=\"0\" symMark=\"NONE\" borderFillIDRef=\"2\"><hh:fontRef hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:ratio hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:spacing hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:relSz hangul=\"100\" latin=\"100\" hanja=\"100\" japanese=\"100\" other=\"100\" symbol=\"100\" user=\"100\"/><hh:offset hangul=\"0\" latin=\"0\" hanja=\"0\" japanese=\"0\" other=\"0\" symbol=\"0\" user=\"0\"/><hh:underline type=\"NONE\" shape=\"SOLID\" color=\"#000000\"/><hh:strikeout shape=\"NONE\" color=\"#000000\"/><hh:outline type=\"NONE\"/><hh:shadow type=\"NONE\" color=\"#C0C0C0\" offsetX=\"10\" offsetY=\"10\"/></hh:charPr>", "TAB_NUM": "<hh:tabProperties itemCnt=\"3\"><hh:tabPr id=\"0\" autoTabLeft=\"0\" autoTabRight=\"0\"/><hh:tabPr id=\"1\" autoTabLeft=\"1\" autoTabRight=\"0\"/><hh:tabPr id=\"2\" autoTabLeft=\"0\" autoTabRight=\"1\"/></hh:tabProperties><hh:numberings itemCnt=\"1\"><hh:numbering id=\"1\" start=\"0\"><hh:paraHead start=\"1\" level=\"1\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"DIGIT\" charPrIDRef=\"4294967295\" checkable=\"0\">^1.</hh:paraHead><hh:paraHead start=\"1\" level=\"2\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"HANGUL_SYLLABLE\" charPrIDRef=\"4294967295\" checkable=\"0\">^2.</hh:paraHead><hh:paraHead start=\"1\" level=\"3\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"DIGIT\" charPrIDRef=\"4294967295\" checkable=\"0\">^3)</hh:paraHead><hh:paraHead start=\"1\" level=\"4\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"HANGUL_SYLLABLE\" charPrIDRef=\"4294967295\" checkable=\"0\">^4)</hh:paraHead><hh:paraHead start=\"1\" level=\"5\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"DIGIT\" charPrIDRef=\"4294967295\" checkable=\"0\">(^5)</hh:paraHead><hh:paraHead start=\"1\" level=\"6\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"HANGUL_SYLLABLE\" charPrIDRef=\"4294967295\" checkable=\"0\">(^6)</hh:paraHead><hh:paraHead start=\"1\" level=\"7\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"CIRCLED_DIGIT\" charPrIDRef=\"4294967295\" checkable=\"1\">^7</hh:paraHead><hh:paraHead start=\"1\" level=\"8\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"CIRCLED_HANGUL_SYLLABLE\" charPrIDRef=\"4294967295\" checkable=\"1\">^8</hh:paraHead><hh:paraHead start=\"1\" level=\"9\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"HANGUL_JAMO\" charPrIDRef=\"4294967295\" checkable=\"0\"/><hh:paraHead start=\"1\" level=\"10\" align=\"LEFT\" useInstWidth=\"1\" autoIndent=\"1\" widthAdjust=\"0\" textOffsetType=\"PERCENT\" textOffset=\"50\" numFormat=\"ROMAN_SMALL\" charPrIDRef=\"4294967295\" checkable=\"1\"/></hh:numbering></hh:numberings>", "PARA_BASE": "<hh:paraPr id=\"0\" tabPrIDRef=\"0\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"BREAK_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"1\" tabPrIDRef=\"0\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"1500\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"3000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"2\" tabPrIDRef=\"1\" condense=\"20\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"1000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"2000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"3\" tabPrIDRef=\"1\" condense=\"20\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"1\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"2000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"4000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"4\" tabPrIDRef=\"1\" condense=\"20\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"2\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"3000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"6000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"5\" tabPrIDRef=\"1\" condense=\"20\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"3\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"4000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"8000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"6\" tabPrIDRef=\"1\" condense=\"20\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"4\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"5000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"10000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"7\" tabPrIDRef=\"1\" condense=\"20\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"5\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"6000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"12000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"8\" tabPrIDRef=\"1\" condense=\"20\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"6\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"7000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"14000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"9\" tabPrIDRef=\"0\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"BREAK_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"150\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"150\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"10\" tabPrIDRef=\"0\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"-1310\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"130\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"-2620\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"130\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"11\" tabPrIDRef=\"0\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"LEFT\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"BREAK_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"130\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"130\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"12\" tabPrIDRef=\"1\" condense=\"20\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"LEFT\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"BREAK_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"1200\" unit=\"HWPUNIT\"/><hc:next value=\"300\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"2400\" unit=\"HWPUNIT\"/><hc:next value=\"600\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"13\" tabPrIDRef=\"2\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"LEFT\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"BREAK_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"700\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"1400\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"14\" tabPrIDRef=\"2\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"LEFT\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"BREAK_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"1100\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"700\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"2200\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"1400\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"15\" tabPrIDRef=\"2\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"LEFT\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"BREAK_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"2200\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"700\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"4400\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"1400\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"16\" tabPrIDRef=\"1\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/paragraph\"><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"8\"/></hp:case><hp:default><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/></hp:default></hp:switch><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"9000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"18000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"17\" tabPrIDRef=\"1\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/paragraph\"><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"9\"/></hp:case><hp:default><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/></hp:default></hp:switch><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"10000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"20000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"18\" tabPrIDRef=\"1\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/paragraph\"><hh:heading type=\"OUTLINE\" idRef=\"0\" level=\"7\"/></hp:case><hp:default><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/></hp:default></hp:switch><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"8000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"16000\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"0\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"160\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr><hh:paraPr id=\"19\" tabPrIDRef=\"0\" condense=\"0\" fontLineHeight=\"0\" snapToGrid=\"1\" suppressLineNumbers=\"0\" checked=\"0\" textDir=\"LTR\"><hh:align horizontal=\"JUSTIFY\" vertical=\"BASELINE\"/><hh:heading type=\"NONE\" idRef=\"0\" level=\"0\"/><hh:breakSetting breakLatinWord=\"KEEP_WORD\" breakNonLatinWord=\"KEEP_WORD\" widowOrphan=\"0\" keepWithNext=\"0\" keepLines=\"0\" pageBreakBefore=\"0\" lineWrap=\"BREAK\"/><hh:autoSpacing eAsianEng=\"0\" eAsianNum=\"0\"/><hp:switch><hp:case hp:required-namespace=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\"><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"800\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"150\" unit=\"HWPUNIT\"/></hp:case><hp:default><hh:margin><hc:intent value=\"0\" unit=\"HWPUNIT\"/><hc:left value=\"0\" unit=\"HWPUNIT\"/><hc:right value=\"0\" unit=\"HWPUNIT\"/><hc:prev value=\"0\" unit=\"HWPUNIT\"/><hc:next value=\"1600\" unit=\"HWPUNIT\"/></hh:margin><hh:lineSpacing type=\"PERCENT\" value=\"150\" unit=\"HWPUNIT\"/></hp:default></hp:switch><hh:border borderFillIDRef=\"2\" offsetLeft=\"0\" offsetRight=\"0\" offsetTop=\"0\" offsetBottom=\"0\" connect=\"0\" ignoreMargin=\"0\"/></hh:paraPr>", "STYLES": "<hh:styles itemCnt=\"23\"><hh:style id=\"0\" type=\"PARA\" name=\"바탕글\" engName=\"Normal\" paraPrIDRef=\"0\" charPrIDRef=\"0\" nextStyleIDRef=\"0\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"1\" type=\"PARA\" name=\"본문\" engName=\"Body\" paraPrIDRef=\"1\" charPrIDRef=\"0\" nextStyleIDRef=\"1\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"2\" type=\"PARA\" name=\"개요 1\" engName=\"Outline 1\" paraPrIDRef=\"2\" charPrIDRef=\"0\" nextStyleIDRef=\"2\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"3\" type=\"PARA\" name=\"개요 2\" engName=\"Outline 2\" paraPrIDRef=\"3\" charPrIDRef=\"0\" nextStyleIDRef=\"3\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"4\" type=\"PARA\" name=\"개요 3\" engName=\"Outline 3\" paraPrIDRef=\"4\" charPrIDRef=\"0\" nextStyleIDRef=\"4\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"5\" type=\"PARA\" name=\"개요 4\" engName=\"Outline 4\" paraPrIDRef=\"5\" charPrIDRef=\"0\" nextStyleIDRef=\"5\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"6\" type=\"PARA\" name=\"개요 5\" engName=\"Outline 5\" paraPrIDRef=\"6\" charPrIDRef=\"0\" nextStyleIDRef=\"6\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"7\" type=\"PARA\" name=\"개요 6\" engName=\"Outline 6\" paraPrIDRef=\"7\" charPrIDRef=\"0\" nextStyleIDRef=\"7\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"8\" type=\"PARA\" name=\"개요 7\" engName=\"Outline 7\" paraPrIDRef=\"8\" charPrIDRef=\"0\" nextStyleIDRef=\"8\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"9\" type=\"PARA\" name=\"개요 8\" engName=\"Outline 8\" paraPrIDRef=\"18\" charPrIDRef=\"0\" nextStyleIDRef=\"9\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"10\" type=\"PARA\" name=\"개요 9\" engName=\"Outline 9\" paraPrIDRef=\"16\" charPrIDRef=\"0\" nextStyleIDRef=\"10\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"11\" type=\"PARA\" name=\"개요 10\" engName=\"Outline 10\" paraPrIDRef=\"17\" charPrIDRef=\"0\" nextStyleIDRef=\"11\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"12\" type=\"CHAR\" name=\"쪽 번호\" engName=\"Page Number\" paraPrIDRef=\"0\" charPrIDRef=\"1\" nextStyleIDRef=\"0\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"13\" type=\"CHAR\" name=\"줄 번호\" engName=\"Line Number\" paraPrIDRef=\"0\" charPrIDRef=\"0\" nextStyleIDRef=\"0\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"14\" type=\"PARA\" name=\"머리말\" engName=\"Header\" paraPrIDRef=\"9\" charPrIDRef=\"2\" nextStyleIDRef=\"14\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"15\" type=\"PARA\" name=\"각주\" engName=\"Footnote\" paraPrIDRef=\"10\" charPrIDRef=\"3\" nextStyleIDRef=\"15\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"16\" type=\"PARA\" name=\"미주\" engName=\"Endnote\" paraPrIDRef=\"10\" charPrIDRef=\"3\" nextStyleIDRef=\"16\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"17\" type=\"PARA\" name=\"메모\" engName=\"Memo\" paraPrIDRef=\"11\" charPrIDRef=\"4\" nextStyleIDRef=\"17\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"18\" type=\"PARA\" name=\"차례 제목\" engName=\"TOC Heading\" paraPrIDRef=\"12\" charPrIDRef=\"5\" nextStyleIDRef=\"18\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"19\" type=\"PARA\" name=\"차례 1\" engName=\"TOC 1\" paraPrIDRef=\"13\" charPrIDRef=\"6\" nextStyleIDRef=\"19\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"20\" type=\"PARA\" name=\"차례 2\" engName=\"TOC 2\" paraPrIDRef=\"14\" charPrIDRef=\"6\" nextStyleIDRef=\"20\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"21\" type=\"PARA\" name=\"차례 3\" engName=\"TOC 3\" paraPrIDRef=\"15\" charPrIDRef=\"6\" nextStyleIDRef=\"21\" langID=\"1042\" lockForm=\"0\"/><hh:style id=\"22\" type=\"PARA\" name=\"캡션\" engName=\"Caption\" paraPrIDRef=\"19\" charPrIDRef=\"0\" nextStyleIDRef=\"22\" langID=\"1042\" lockForm=\"0\"/></hh:styles>", "HEAD_TAIL": "</hh:refList><hh:compatibleDocument targetProgram=\"HWP201X\"><hh:layoutCompatibility/></hh:compatibleDocument><hh:docOption><hh:linkinfo path=\"\" pageInherit=\"0\" footnoteInherit=\"0\"/></hh:docOption><hh:metaTag>{\"name\":\"\"}</hh:metaTag><hh:trackchageConfig flags=\"56\"/></hh:head>", "SEC_OPEN": "<hs:sec xmlns:ha=\"http://www.hancom.co.kr/hwpml/2011/app\" xmlns:hp=\"http://www.hancom.co.kr/hwpml/2011/paragraph\" xmlns:hp10=\"http://www.hancom.co.kr/hwpml/2016/paragraph\" xmlns:hs=\"http://www.hancom.co.kr/hwpml/2011/section\" xmlns:hc=\"http://www.hancom.co.kr/hwpml/2011/core\" xmlns:hh=\"http://www.hancom.co.kr/hwpml/2011/head\" xmlns:hhs=\"http://www.hancom.co.kr/hwpml/2011/history\" xmlns:hm=\"http://www.hancom.co.kr/hwpml/2011/master-page\" xmlns:hpf=\"http://www.hancom.co.kr/schema/2011/hpf\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf/\" xmlns:ooxmlchart=\"http://www.hancom.co.kr/hwpml/2016/ooxmlchart\" xmlns:hwpunitchar=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xmlns:config=\"urn:oasis:names:tc:opendocument:xmlns:config:1.0\">", "SECPR": "<hp:run charPrIDRef=\"0\"><hp:secPr id=\"\" textDirection=\"HORIZONTAL\" spaceColumns=\"1134\" tabStop=\"8000\" tabStopVal=\"4000\" tabStopUnit=\"HWPUNIT\" outlineShapeIDRef=\"1\" memoShapeIDRef=\"0\" textVerticalWidthHead=\"0\" masterPageCnt=\"0\"><hp:grid lineGrid=\"0\" charGrid=\"0\" wonggojiFormat=\"0\"/><hp:startNum pageStartsOn=\"BOTH\" page=\"0\" pic=\"0\" tbl=\"0\" equation=\"0\"/><hp:visibility hideFirstHeader=\"0\" hideFirstFooter=\"0\" hideFirstMasterPage=\"0\" border=\"SHOW_ALL\" fill=\"SHOW_ALL\" hideFirstPageNum=\"0\" hideFirstEmptyLine=\"0\" showLineNumber=\"0\"/><hp:lineNumberShape restartType=\"0\" countBy=\"0\" distance=\"0\" startNumber=\"0\"/><hp:pagePr landscape=\"WIDELY\" width=\"59528\" height=\"84188\" gutterType=\"LEFT_ONLY\"><hp:margin header=\"2835\" footer=\"2835\" gutter=\"0\" left=\"5669\" right=\"5669\" top=\"5669\" bottom=\"4252\"/></hp:pagePr><hp:footNotePr><hp:autoNumFormat type=\"DIGIT\" userChar=\"\" prefixChar=\"\" suffixChar=\")\" supscript=\"0\"/><hp:noteLine length=\"-1\" type=\"SOLID\" width=\"0.12 mm\" color=\"#000000\"/><hp:noteSpacing betweenNotes=\"283\" belowLine=\"567\" aboveLine=\"850\"/><hp:numbering type=\"CONTINUOUS\" newNum=\"1\"/><hp:placement place=\"EACH_COLUMN\" beneathText=\"0\"/></hp:footNotePr><hp:endNotePr><hp:autoNumFormat type=\"DIGIT\" userChar=\"\" prefixChar=\"\" suffixChar=\")\" supscript=\"0\"/><hp:noteLine length=\"14692344\" type=\"SOLID\" width=\"0.12 mm\" color=\"#000000\"/><hp:noteSpacing betweenNotes=\"0\" belowLine=\"567\" aboveLine=\"850\"/><hp:numbering type=\"CONTINUOUS\" newNum=\"1\"/><hp:placement place=\"END_OF_DOCUMENT\" beneathText=\"0\"/></hp:endNotePr><hp:pageBorderFill type=\"BOTH\" borderFillIDRef=\"1\" textBorder=\"PAPER\" headerInside=\"0\" footerInside=\"0\" fillArea=\"PAPER\"><hp:offset left=\"1417\" right=\"1417\" top=\"1417\" bottom=\"1417\"/></hp:pageBorderFill><hp:pageBorderFill type=\"EVEN\" borderFillIDRef=\"1\" textBorder=\"PAPER\" headerInside=\"0\" footerInside=\"0\" fillArea=\"PAPER\"><hp:offset left=\"1417\" right=\"1417\" top=\"1417\" bottom=\"1417\"/></hp:pageBorderFill><hp:pageBorderFill type=\"ODD\" borderFillIDRef=\"1\" textBorder=\"PAPER\" headerInside=\"0\" footerInside=\"0\" fillArea=\"PAPER\"><hp:offset left=\"1417\" right=\"1417\" top=\"1417\" bottom=\"1417\"/></hp:pageBorderFill></hp:secPr><hp:ctrl><hp:colPr id=\"\" type=\"NEWSPAPER\" layout=\"LEFT\" colCount=\"1\" sameSz=\"1\" sameGap=\"0\"/></hp:ctrl></hp:run>", "VERSION": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\" ?><hv:HCFVersion xmlns:hv=\"http://www.hancom.co.kr/hwpml/2011/version\" tagetApplication=\"WORDPROCESSOR\" major=\"5\" minor=\"1\" micro=\"1\" buildNumber=\"0\" os=\"1\" xmlVersion=\"1.5\" application=\"Hancom Office Hangul\" appVersion=\"13, 0, 0, 1408 WIN32LEWindows_10\"/>", "CONTAINER": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\" ?><ocf:container xmlns:ocf=\"urn:oasis:names:tc:opendocument:xmlns:container\" xmlns:hpf=\"http://www.hancom.co.kr/schema/2011/hpf\"><ocf:rootfiles><ocf:rootfile full-path=\"Contents/content.hpf\" media-type=\"application/hwpml-package+xml\"/><ocf:rootfile full-path=\"Preview/PrvText.txt\" media-type=\"text/plain\"/><ocf:rootfile full-path=\"META-INF/container.rdf\" media-type=\"application/rdf+xml\"/></ocf:rootfiles></ocf:container>", "RDF": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\" ?><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"><rdf:Description rdf:about=\"\"><ns0:hasPart xmlns:ns0=\"http://www.hancom.co.kr/hwpml/2016/meta/pkg#\" rdf:resource=\"Contents/header.xml\"/></rdf:Description><rdf:Description rdf:about=\"Contents/header.xml\"><rdf:type rdf:resource=\"http://www.hancom.co.kr/hwpml/2016/meta/pkg#HeaderFile\"/></rdf:Description><rdf:Description rdf:about=\"\"><ns0:hasPart xmlns:ns0=\"http://www.hancom.co.kr/hwpml/2016/meta/pkg#\" rdf:resource=\"Contents/section0.xml\"/></rdf:Description><rdf:Description rdf:about=\"Contents/section0.xml\"><rdf:type rdf:resource=\"http://www.hancom.co.kr/hwpml/2016/meta/pkg#SectionFile\"/></rdf:Description><rdf:Description rdf:about=\"\"><rdf:type rdf:resource=\"http://www.hancom.co.kr/hwpml/2016/meta/pkg#Document\"/></rdf:Description></rdf:RDF>", "MANIFEST": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\" ?><odf:manifest xmlns:odf=\"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0\"/>", "SETTINGS": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\" ?><ha:HWPApplicationSetting xmlns:ha=\"http://www.hancom.co.kr/hwpml/2011/app\" xmlns:config=\"urn:oasis:names:tc:opendocument:xmlns:config:1.0\"><ha:CaretPosition listIDRef=\"0\" paraIDRef=\"0\" pos=\"0\"/></ha:HWPApplicationSetting>", "HPF": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\" ?><opf:package xmlns:ha=\"http://www.hancom.co.kr/hwpml/2011/app\" xmlns:hp=\"http://www.hancom.co.kr/hwpml/2011/paragraph\" xmlns:hp10=\"http://www.hancom.co.kr/hwpml/2016/paragraph\" xmlns:hs=\"http://www.hancom.co.kr/hwpml/2011/section\" xmlns:hc=\"http://www.hancom.co.kr/hwpml/2011/core\" xmlns:hh=\"http://www.hancom.co.kr/hwpml/2011/head\" xmlns:hhs=\"http://www.hancom.co.kr/hwpml/2011/history\" xmlns:hm=\"http://www.hancom.co.kr/hwpml/2011/master-page\" xmlns:hpf=\"http://www.hancom.co.kr/schema/2011/hpf\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf/\" xmlns:ooxmlchart=\"http://www.hancom.co.kr/hwpml/2016/ooxmlchart\" xmlns:hwpunitchar=\"http://www.hancom.co.kr/hwpml/2016/HwpUnitChar\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xmlns:config=\"urn:oasis:names:tc:opendocument:xmlns:config:1.0\" version=\"\" unique-identifier=\"\" id=\"\"><opf:metadata><opf:title>{TITLE}</opf:title><opf:language>ko</opf:language><opf:meta name=\"creator\" content=\"text\">{CREATOR}</opf:meta><opf:meta name=\"subject\" content=\"text\"/><opf:meta name=\"description\" content=\"text\"/><opf:meta name=\"lastsaveby\" content=\"text\">{CREATOR}</opf:meta><opf:meta name=\"CreatedDate\" content=\"text\">{DATE}</opf:meta><opf:meta name=\"ModifiedDate\" content=\"text\">{DATE}</opf:meta><opf:meta name=\"date\" content=\"text\">{KDATE}</opf:meta><opf:meta name=\"keyword\" content=\"text\"/></opf:metadata><opf:manifest><opf:item id=\"header\" href=\"Contents/header.xml\" media-type=\"application/xml\"/><opf:item id=\"section0\" href=\"Contents/section0.xml\" media-type=\"application/xml\"/><opf:item id=\"settings\" href=\"settings.xml\" media-type=\"application/xml\"/></opf:manifest><opf:spine><opf:itemref idref=\"header\" linear=\"yes\"/><opf:itemref idref=\"section0\" linear=\"yes\"/></opf:spine></opf:package>"};

/* =====================================================================
   한글 HWPX 저장 — 블록(DSL) → OWPML(HWPX) 패키지
   한글 2014 이상에서 바로 열림. 골격(HX)은 한글에서 저장한 빈 문서에서 추출.
   ===================================================================== */
const HX_FONTS={g:'굴림체',m:'휴먼명조',h:'HY헤드라인M',b:'한컴바탕',d:'한컴돋움',y:'휴먼옛체'};
const HX_FID={g:2,m:3,h:4,b:5,d:6,y:7};
const HX_LANGS=['HANGUL','LATIN','HANJA','JAPANESE','OTHER','SYMBOL','USER'];
const hxmm=mm=>Math.round(mm*283.465);
const HX_XMLDECL='<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';

function buildHwpx(docs,title){
  let idSeq=Math.floor(Math.random()*900000000)+1000; const nid=()=>String(idSeq++); const BINS=[]; const imgXml=(b,pbb,prefix)=>attImgXml(b,pbb,prefix,nid,paraId,BINS);
  /* ---- 스타일 등록부 ---- */
  const chars=new Map(),paras=new Map(),bfs=new Map(); const charX=[],paraX=[],bfX=[]; let charN=7,paraN=20,bfN=3;
  const charId=(font,size,bold)=>{ const k=`${font}|${size}|${bold?1:0}`; if(chars.has(k)) return chars.get(k); const id=charN++; chars.set(k,id); const f=HX_FID[font]||1;
    charX.push(`<hh:charPr id="${id}" height="${Math.round(size*100)}" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2"><hh:fontRef hangul="${f}" latin="${f}" hanja="${f}" japanese="${f}" other="${f}" symbol="${f}" user="${f}"/><hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/><hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>${bold?'<hh:bold/>':''}<hh:underline type="NONE" shape="SOLID" color="#000000"/><hh:strikeout shape="NONE" color="#000000"/><hh:outline type="NONE"/><hh:shadow type="NONE" color="#C0C0C0" offsetX="10" offsetY="10"/></hh:charPr>`);
    return id; };
  const paraId=(align,lh,left,intent,pbb)=>{ const k=`${align}|${lh}|${left}|${intent}|${pbb?1:0}`; if(paras.has(k)) return paras.get(k); const id=paraN++; paras.set(k,id);
    const A=({left:'LEFT',center:'CENTER',right:'RIGHT',justify:'JUSTIFY'})[align]||'LEFT';
    const mg=`<hh:margin><hc:intent value="${intent}" unit="HWPUNIT"/><hc:left value="${left}" unit="HWPUNIT"/><hc:right value="0" unit="HWPUNIT"/><hc:prev value="0" unit="HWPUNIT"/><hc:next value="0" unit="HWPUNIT"/></hh:margin><hh:lineSpacing type="PERCENT" value="${lh}" unit="HWPUNIT"/>`;
    paraX.push(`<hh:paraPr id="${id}" tabPrIDRef="0" condense="0" fontLineHeight="0" snapToGrid="1" suppressLineNumbers="0" checked="0" textDir="LTR"><hh:align horizontal="${A}" vertical="BASELINE"/><hh:heading type="NONE" idRef="0" level="0"/><hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="BREAK_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="${pbb?1:0}" lineWrap="BREAK"/><hh:autoSpacing eAsianEng="0" eAsianNum="0"/><hp:switch><hp:case hp:required-namespace="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar">${mg}</hp:case><hp:default>${mg}</hp:default></hp:switch><hh:border borderFillIDRef="2" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/></hh:paraPr>`);
    return id; };
  const bT=v=>v==='n'?'NONE':'SOLID', bW=v=>v==='b'?'0.5 mm':v==='n'?'0.1 mm':'0.12 mm';
  const bfId=(t,b,l,r,bg)=>{ const k=`${t}${b}${l}${r}|${bg||''}`; if(bfs.has(k)) return bfs.get(k); const id=bfN++; bfs.set(k,id);
    bfX.push(`<hh:borderFill id="${id}" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0"><hh:slash type="NONE" Crooked="0" isCounter="0"/><hh:backSlash type="NONE" Crooked="0" isCounter="0"/><hh:leftBorder type="${bT(l)}" width="${bW(l)}" color="#000000"/><hh:rightBorder type="${bT(r)}" width="${bW(r)}" color="#000000"/><hh:topBorder type="${bT(t)}" width="${bW(t)}" color="#000000"/><hh:bottomBorder type="${bT(b)}" width="${bW(b)}" color="#000000"/><hh:diagonal type="SOLID" width="0.1 mm" color="#000000"/>${bg?`<hc:fillBrush><hc:winBrush faceColor="#${bg}" hatchColor="#999999" alpha="0"/></hc:fillBrush>`:''}</hh:borderFill>`);
    return id; };
  /* ---- 문단 ---- */
  const runXml=(runs,base)=>{ const parts=[]; for(const r of runs){ const t=String(r.t??''); if(!t) continue; parts.push(`<hp:run charPrIDRef="${charId(r.font||base.font||'g',r.size||base.size||12,r.b!=null?!!r.b:!!base.b)}"><hp:t>${xesc(t)}</hp:t></hp:run>`); } return parts.join('')||`<hp:run charPrIDRef="${charId(base.font||'g',base.size||12,!!base.b)}"><hp:t/></hp:run>`; };
  const splitLines=runs=>{ const lines=[[]]; for(const r of runs){ const segs=String(r.t??'').split('\n'); segs.forEach((sg,i)=>{ if(i) lines.push([]); if(sg) lines[lines.length-1].push({...r,t:sg}); }); } return lines; };
  const pXml=(b,pbb,prefix)=>{ const runs=runsOf(b); const ind=b.ind||0,hang=b.hang||0; const lh=Math.round((b.lh||1.6)*100);
    const lines=splitLines(runs); let out=''; const rep=b.rep||1;
    for(let i=0;i<rep;i++) lines.forEach((ln,li)=>{ const first=(i===0&&li===0); const pid=paraId(alignOf(b),lh,hxmm(ind+hang),-hxmm(hang),first&&pbb); out+=`<hp:p id="${nid()}" paraPrIDRef="${pid}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">${first&&prefix?prefix:''}${runXml(ln,b)}</hp:p>`; });
    return out; };
  /* ---- 표 ---- */
  const tblXml=(tb,pbb,prefix)=>{ const occ=tableGrid(tb); const grid=tb.w.map(hxmm); const nrow=tb.rows.length,ncol=tb.w.length; const rh=[]; for(let r=0;r<nrow;r++) rh.push(hxmm(rowHeight(tb,r)||7));
    const padH=hxmm(tb.pad??1)+200, padV=Math.max(60,hxmm((tb.pad??1)*0.6)); const totalW=grid.reduce((a,b)=>a+b,0), totalH=rh.reduce((a,b)=>a+b,0);
    const dflt=tb.border===false?'n':'s'; const bfDefault=bfId(dflt,dflt,dflt,dflt,null);
    let rows='';
    for(let r=0;r<nrow;r++){ let tr='';
      for(let c=0;c<ncol;c++){ const o=occ[r][c]; if(!o||!o.top||!o.left) continue; const cell=o.cell; const cw=grid.slice(o.col,o.col+o.cs).reduce((a,b)=>a+b,0); const ch=rh.slice(r,r+o.rs).reduce((a,b)=>a+b,0);
        const bf=bfId(borderOf(cell,tb,'t'),borderOf(cell,tb,'b'),borderOf(cell,tb,'l'),borderOf(cell,tb,'r'),cell.bg||null);
        const va=({top:'TOP',middle:'CENTER',bottom:'BOTTOM'})[cell.va||tb.va||'middle'];
        let ps=''; for(const p of cellParas(cell,tb)){ const lines=splitLines(p.runs); lines.forEach(ln=>{ const pid=paraId(p.al,135,0,0,false); ps+=`<hp:p id="${nid()}" paraPrIDRef="${pid}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">${runXml(ln,{font:p.font,size:p.size,b:p.b})}</hp:p>`; }); }
        if(!ps) ps=`<hp:p id="${nid()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>`;
        tr+=`<hp:tc name="" header="${tb.hdr&&r===0?1:0}" hasMargin="0" protect="0" editable="0" dirty="0" borderFillIDRef="${bf}"><hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="${va}" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">${ps}</hp:subList><hp:cellAddr colAddr="${o.col}" rowAddr="${r}"/><hp:cellSpan colSpan="${o.cs}" rowSpan="${o.rs}"/><hp:cellSz width="${cw}" height="${ch}"/><hp:cellMargin left="${padH}" right="${padH}" top="${padV}" bottom="${padV}"/></hp:tc>`; }
      rows+=`<hp:tr>${tr}</hp:tr>`; }
    /* 여러 쪽에 걸치는 표(제목행 반복 표 · 취합한 안건 원문 표)는 '글자처럼 취급'을 끄고 본문 자리차지로 둔다.
       글자처럼 취급된 표는 한 줄(글자)로 취급돼 남은 공간에 다 안 들어가면 통째로 다음 쪽으로 밀려
       앞 쪽이 비어 버림 → 자리차지 표는 지금 위치에서 시작해 쪽 경계에서 셀 단위로 나뉘어 이어진다. */
    const flow=!!(tb.hdr||tb.flow);
    const tbl=`<hp:tbl id="${nid()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="${tb.hdr?1:0}" rowCnt="${nrow}" colCnt="${ncol}" cellSpacing="0" borderFillIDRef="${bfDefault}" noAdjust="0"><hp:sz width="${totalW}" widthRelTo="ABSOLUTE" height="${totalH}" heightRelTo="ABSOLUTE" protect="0"/><hp:pos treatAsChar="${flow?0:1}" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/><hp:outMargin left="0" right="0" top="0" bottom="0"/><hp:inMargin left="${padH}" right="${padH}" top="${padV}" bottom="${padV}"/>${rows}</hp:tbl>`;
    /* 자리차지 표를 붙든 문단은 표 아래에 빈 줄 하나가 남으므로 1pt 글자로 두어 틈을 없앤다 */
    const hostChar=flow?charId('g',1,false):0;
    return `<hp:p id="${nid()}" paraPrIDRef="${paraId('left',100,0,0,pbb)}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">${prefix||''}<hp:run charPrIDRef="${hostChar}">${tbl}<hp:t/></hp:run></hp:p>`; };
  /* ---- 본문 조립 ---- */
  let body=''; let first=true; let plain='';
  docs.forEach((doc,di)=>{ let pbb=di>0;
    doc.blocks.forEach(b=>{ if(b.t==='pb'){ pbb=true; return; } const prefix=first?HX.SECPR:''; first=false;
      if(b.t==='img'){ body+=imgXml(b,pbb,prefix); plain+='[그림]\n'; } else if(b.t==='tbl'){ body+=tblXml(b,pbb,prefix); b.rows.forEach(r=>r.forEach(c=>{ plain+=(Array.isArray(c.p)?c.p.map(p=>runsOf(p).map(x=>x.t).join('')).join(' '):(c.t||''))+' '; })); plain+='\n'; }
      else { body+=pXml(b,pbb,prefix); plain+=runsOf(b).map(x=>x.t).join('')+'\n'; }
      pbb=false; }); });
  if(first) body+=`<hp:p id="${nid()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">${HX.SECPR}<hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>`;
  /* ---- header.xml ---- */
  const myFonts=Object.keys(HX_FONTS).map(k=>`<hh:font id="${HX_FID[k]}" face="${HX_FONTS[k]}" type="TTF" isEmbedded="0"><hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/></hh:font>`).join('');
  const fontfaces=`<hh:fontfaces itemCnt="7">${HX_LANGS.map(L=>`<hh:fontface lang="${L}" fontCnt="8">${HX.FONT_BASE}${myFonts}</hh:fontface>`).join('')}</hh:fontfaces>`;
  const header=`${HX_XMLDECL}${HX.HEAD_OPEN}<hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/><hh:refList>${fontfaces}<hh:borderFills itemCnt="${2+bfX.length}">${HX.BF_BASE}${bfX.join('')}</hh:borderFills><hh:charProperties itemCnt="${7+charX.length}">${HX.CHAR_BASE}${charX.join('')}</hh:charProperties>${HX.TAB_NUM}<hh:paraProperties itemCnt="${20+paraX.length}">${HX.PARA_BASE}${paraX.join('')}</hh:paraProperties>${HX.STYLES}${HX.HEAD_TAIL}`;
  const section=`${HX_XMLDECL}${HX.SEC_OPEN}${body}</hs:sec>`;
  const now=new Date(); const isoNow=now.toISOString().replace(/\.\d+Z$/,'Z');
  const hpf=HX.HPF.replace('{TITLE}',xesc(title||'')).replace(/\{CREATOR\}/g,xesc(APP_NAME)).replace(/\{DATE\}/g,isoNow).replace('{KDATE}',xesc(now.toLocaleString('ko-KR')));
  const prv=plain.replace(/\s+/g,' ').trim().slice(0,1000);
  return zipStore([
    {name:'mimetype',data:'application/hwp+zip'},
    {name:'version.xml',data:HX.VERSION},
    {name:'META-INF/container.xml',data:HX.CONTAINER},
    {name:'META-INF/manifest.xml',data:HX.MANIFEST},
    {name:'META-INF/container.rdf',data:HX.RDF},
    {name:'Contents/content.hpf',data:hpfWithBins(hpf,BINS)},
    {name:'Contents/header.xml',data:header},
    {name:'Contents/section0.xml',data:section},...BINS.map(x=>({name:'BinData/'+x.id+'.'+x.ext,data:x.bytes})),
    {name:'settings.xml',data:HX.SETTINGS},
    {name:'Preview/PrvText.txt',data:prv}
  ],'application/hwp+zip');
}
function saveHwpx(ids,fname){ const docs=ids.map(id=>docById(id).build()); download(buildHwpx(docs,fname),fname+'.hwpx'); }

/* =====================================================================
   한글 파일 읽기 — 안건 취합용
   · .hwp  (한글 5.0 바이너리: OLE 복합문서 + 레코드)  → 글·표를 블록(DSL)으로
   · .hwpx (OWPML zip)                              → 글·표를 블록(DSL)으로
   그림·머리말·꼬리말·각주·개체 속성은 옮기지 않고, 문단(글꼴·크기·굵게·정렬·들여쓰기·줄간격)과
   표(병합·열 너비·배경색)만 가져옵니다.
   ===================================================================== */
const HWP_MM=v=>Math.round((v||0)/283.465*100)/100; // HWPUNIT → mm
const HWP_FACE_KEY=name=>{ const n=String(name||''); if(/헤드라인/.test(n)) return 'h'; if(/옛체|견명조|궁서/.test(n)) return 'y'; if(/명조|Batang|batang|바탕/.test(n)) return /한컴바탕|함초롬바탕|HCR/.test(n)?'b':'m'; if(/돋움|Dotum|dotum|고딕|Gothic|gothic|Gulim|굴림/.test(n)) return /굴림|Gulim/.test(n)?'g':'d'; return 'g'; };
/* 기호 글꼴(PUA) 글머리표 → 유니코드 */
const HWP_PUA={0xF046:'☞',0xF06C:'●',0xF09F:'•',0xF0A1:'○',0xF06E:'■',0xF0A7:'▪',0xF06F:'☐',0xF075:'◆',0xF077:'⬩',0xF076:'❖',0xF0A4:'◉',0xF0AB:'★',0xF0FC:'✓',0xF0FE:'☑',0xF0D8:'➢',0xF0A8:'▲',0xF0B7:'·',0xF0A0:'◦',0xF0BD:'◇'};
const hwpBulletChar=code=>HWP_PUA[code]||(code>=0xE000&&code<=0xF8FF?'•':(code?String.fromCharCode(code):''));
const HWP_TAG={DOCPROP:16,IDMAP:17,BINDATA:18,FACE:19,BORDERFILL:20,CHARSHAPE:21,TABDEF:22,NUMBERING:23,BULLET:24,PARASHAPE:25,STYLE:26,PARA:66,TEXT:67,PCHAR:68,LINESEG:69,RANGE:70,CTRL:71,LIST:72,PAGEDEF:73,TABLE:77};

/* ---------- OLE 복합문서(CFB) ---------- */
function cfbRead(u8){
  const v=new DataView(u8.buffer,u8.byteOffset,u8.byteLength);
  if(u8.length<512||v.getUint32(0,true)!==0xE011CFD0||v.getUint32(4,true)!==0xE11AB1A1) throw new Error('OLE 복합문서 형식이 아닙니다');
  const ssz=1<<v.getUint16(30,true), mssz=1<<v.getUint16(32,true);
  const dirStart=v.getUint32(48,true), miniCutoff=v.getUint32(56,true), miniFatStart=v.getUint32(60,true), nMiniFat=v.getUint32(64,true), difatStart=v.getUint32(68,true), nDifat=v.getUint32(72,true);
  const difat=[]; for(let i=0;i<109;i++){ const s=v.getUint32(76+i*4,true); if(s<0xFFFFFFFE) difat.push(s); }
  let ds=difatStart; for(let k=0;k<nDifat&&ds<0xFFFFFFFE;k++){ const off=(ds+1)*ssz; const per=ssz/4-1; for(let i=0;i<per;i++){ const s=v.getUint32(off+i*4,true); if(s<0xFFFFFFFE) difat.push(s); } ds=v.getUint32(off+per*4,true); }
  const fat=new Uint32Array(difat.length*(ssz/4)); let fi=0; for(const s of difat){ const off=(s+1)*ssz; if(off+ssz>u8.length) break; for(let i=0;i<ssz/4;i++) fat[fi++]=v.getUint32(off+i*4,true); }
  const chain=(src,start,table,secSize,offOf,len)=>{ const parts=[]; let s=start,total=0,guard=0; while(s<0xFFFFFFFE&&guard++<2e6){ const off=offOf(s); if(off+secSize>src.length&&off>=src.length) break; parts.push(src.subarray(off,Math.min(off+secSize,src.length))); total+=secSize; if(len!=null&&total>=len) break; s=table[s]; } const out=new Uint8Array(len!=null?len:total); let p=0; for(const part of parts){ const n=Math.min(part.length,out.length-p); if(n<=0) break; out.set(part.subarray(0,n),p); p+=n; } return out; };
  const secOff=s=>(s+1)*ssz;
  const dir=chain(u8,dirStart,fat,ssz,secOff,null); const dv=new DataView(dir.buffer,dir.byteOffset,dir.byteLength);
  const ents=[]; for(let o=0;o+128<=dir.length;o+=128){ const nl=dv.getUint16(o+64,true); if(!nl||nl>64){ ents.push(null); continue; } let name=''; for(let k=0;k<nl/2-1;k++) name+=String.fromCharCode(dv.getUint16(o+k*2,true)); ents.push({name,type:dir[o+66],left:dv.getUint32(o+68,true),right:dv.getUint32(o+72,true),child:dv.getUint32(o+76,true),start:dv.getUint32(o+116,true),size:dv.getUint32(o+120,true)}); }
  const root=ents[0]; if(!root) throw new Error('OLE 디렉터리를 읽지 못했습니다');
  const miniFatRaw=nMiniFat?chain(u8,miniFatStart,fat,ssz,secOff,null):new Uint8Array(0); const mfat=new Uint32Array(miniFatRaw.buffer,miniFatRaw.byteOffset,Math.floor(miniFatRaw.length/4));
  const mini=root.size?chain(u8,root.start,fat,ssz,secOff,root.size):new Uint8Array(0);
  const streams={}; const walk=(idx,path)=>{ if(idx>=0xFFFFFFFE||idx>=ents.length) return; const e=ents[idx]; if(!e) return; walk(e.left,path); walk(e.right,path); const full=path?path+'/'+e.name:e.name; if(e.type===1){ walk(e.child,full); } else if(e.type===2){ streams[full]=e; } };
  walk(root.child,'');
  const read=name=>{ const e=streams[name]; if(!e) return null; if(e.size===0) return new Uint8Array(0); if(e.size<miniCutoff) return chain(mini,e.start,mfat,mssz,s=>s*mssz,e.size); return chain(u8,e.start,fat,ssz,secOff,e.size); };
  return {names:Object.keys(streams),has:n=>!!streams[n],read};
}

/* ---------- 레코드 순회 ---------- */
function hwpRecords(u8,fn){
  const v=new DataView(u8.buffer,u8.byteOffset,u8.byteLength); let p=0;
  while(p+4<=u8.length){ const h=v.getUint32(p,true); p+=4; const tag=h&0x3FF, level=(h>>>10)&0x3FF; let size=(h>>>20)&0xFFF; if(size===0xFFF){ if(p+4>u8.length) break; size=v.getUint32(p,true); p+=4; } if(p+size>u8.length) size=u8.length-p; fn(tag,level,u8.subarray(p,p+size)); p+=size; }
}
const hwpBstr=(v,off)=>{ const n=v.getUint16(off,true); let s=''; for(let i=0;i<n;i++) s+=String.fromCharCode(v.getUint16(off+2+i*2,true)); return {s,next:off+2+n*2}; };
const hwpColor=(v,off)=>{ const r=v.getUint8(off),g=v.getUint8(off+1),b=v.getUint8(off+2); return (r<16?'0':'')+r.toString(16)+(g<16?'0':'')+g.toString(16)+(b<16?'0':'')+b.toString(16); };

/* ---------- DocInfo ---------- */
function hwpDocInfo(u8){
  const info={faces:[],charShapes:[],paraShapes:[],borderFills:[],bullets:[],numberings:[],koFonts:0};
  let faceIdx=0;
  hwpRecords(u8,(tag,level,d)=>{ const v=new DataView(d.buffer,d.byteOffset,d.byteLength);
    try{
      if(tag===HWP_TAG.IDMAP){ info.koFonts=v.getUint32(4,true); }
      else if(tag===HWP_TAG.FACE){ const flags=v.getUint8(0); const {s}=hwpBstr(v,1); if(faceIdx<(info.koFonts||9999)) info.faces.push(s); faceIdx++; }
      else if(tag===HWP_TAG.CHARSHAPE){ const face=v.getUint16(0,true); const size=v.getInt32(42,true)/100; const fl=v.getUint32(46,true); info.charShapes.push({face,size:Math.round(size*10)/10,bold:!!(fl&2),italic:!!(fl&1),color:d.length>=56?hwpColor(v,52):'000000'}); }
      else if(tag===HWP_TAG.PARASHAPE){ const fl=v.getUint32(0,true); const left=v.getInt32(4,true)/2, indent=v.getInt32(12,true)/2; let lsType=fl&3, ls=v.getInt32(24,true); if(d.length>=54){ lsType=v.getUint32(46,true)&0x1F; ls=v.getInt32(50,true); }
        info.paraShapes.push({align:['justify','left','right','center','justify','justify'][(fl>>>2)&7]||'left',left,indent,lsType,ls,pageBreak:!!(fl&(1<<19)),head:(fl>>>23)&3,level:(fl>>>25)&7,numId:v.getUint16(30,true)}); }
      else if(tag===HWP_TAG.BORDERFILL){ const fill=v.getUint32(32,true); let bg=null; if(fill&1&&d.length>=40){ bg=hwpColor(v,36); } info.borderFills.push({bg:bg&&bg!=='ffffff'?bg.toUpperCase():null}); }
      else if(tag===HWP_TAG.BULLET){ info.bullets.push({ch:hwpBulletChar(v.getUint16(12,true))}); }
      else if(tag===HWP_TAG.NUMBERING){ const fmts=[]; let off=0; for(let i=0;i<7;i++){ off+=12; const r=hwpBstr(v,off); fmts.push(r.s); off=r.next; } const start=off+2<=d.length?v.getUint16(off,true):1; info.numberings.push({fmts,start:start||1}); }
    }catch(e){ /* 손상된 레코드는 건너뜀 */ }
  });
  return info;
}

/* ---------- 본문 ---------- */
const HWP_CC_LEN=c=>(c===0||c===10||c===13||c>=24)?1:8;
function hwpSection(u8,info,out){
  const root={blocks:out}; const stack=[{level:-1,kind:'root',cont:root.blocks}]; const startIdx=out.length;
  let cur=null; const paraAt={};
  const numCounters={};
  const mkPara=(d,cont)=>{ const v=new DataView(d.buffer,d.byteOffset,d.byteLength); const nch=v.getUint32(0,true)&0x7FFFFFFF; const ps=v.getUint16(8,true); const split=v.getUint8(11); const p={t:'p',_raw:[],_runs:[],_ps:info.paraShapes[ps]||{},_pb:!!(split&4),cont}; cont.push(p); return p; };
  hwpRecords(u8,(tag,level,d)=>{
    while(stack.length>1&&level<=stack[stack.length-1].level) stack.pop();
    const top=stack[stack.length-1];
    const v=new DataView(d.buffer,d.byteOffset,d.byteLength);
    try{
      if(tag===HWP_TAG.PARA){ if(top.kind==='skip'){ cur=null; paraAt[level]=null; return; } const cont=top.kind==='tbl'?(top.cell?top.cell.blocks:null):top.cont; cur=cont?mkPara(d,cont):null; paraAt[level]=cur; return; }
      if(tag===HWP_TAG.TEXT){ cur=paraAt[level-1]||null; if(!cur) return; const n=Math.floor(d.length/2); const raw=[]; /* [출력문자열 index → 원본 위치] */ let s=''; const map=[]; const ctrls=[]; for(let i=0;i<n;){ const c=v.getUint16(i*2,true); if(c<32){ const len=HWP_CC_LEN(c); if(c===10){ s+='\n'; map.push(i); } else if(c===9){ s+='\t'; map.push(i); } else if(c===30||c===31){ s+=' '; map.push(i); } else if(len===8&&i+8<=n){ let id=''; for(let k=3;k>=0;k--) id+=String.fromCharCode(d[i*2+2+k]); ctrls.push({pos:s.length,id}); } i+=len; } else { s+=(c>=0xE000&&c<=0xF8FF)?(HWP_PUA[c]||'•'):String.fromCharCode(c); map.push(i); i++; } } cur._text=s; cur._map=map; cur._ctrls=ctrls; return; }
      if(tag===HWP_TAG.PCHAR){ cur=paraAt[level-1]||null; if(!cur) return; const n=Math.floor(d.length/8); const arr=[]; for(let i=0;i<n;i++) arr.push([v.getUint32(i*8,true),v.getUint32(i*8+4,true)]); cur._runs=arr; return; }
      if(tag===HWP_TAG.CTRL){ let id=''; for(let k=3;k>=0;k--) id+=String.fromCharCode(d[k]); const anchor=paraAt[level-1]||null; if(id==='tbl '&&anchor){ const tbl={t:'tblraw',rows:0,cols:0,cells:[],_ctrl:true}; anchor.cont.push(tbl); stack.push({level,kind:'tbl',tbl,cell:null}); } else if(id==='gso '&&anchor){ stack.push({level,kind:'gso',cont:anchor.cont}); } else stack.push({level,kind:'skip'}); return; }
      if(tag===HWP_TAG.TABLE){ if(top.kind==='tbl'){ top.tbl.rows=v.getUint16(4,true); top.tbl.cols=v.getUint16(6,true); } return; }
      if(tag===HWP_TAG.LIST){ if(top.kind==='tbl'&&d.length<30){ top.tbl.caption=top.tbl.caption||[]; top.cell={caption:true,blocks:top.tbl.caption}; return; } if(top.kind==='tbl'&&d.length>=30){ const cell={col:v.getUint16(8,true),row:v.getUint16(10,true),cs:v.getUint16(12,true)||1,rs:v.getUint16(14,true)||1,w:v.getInt32(16,true),h:v.getInt32(20,true),bf:v.getUint16(32,true),va:((v.getUint32(4,true)>>>5)&3),blocks:[]}; top.tbl.cells.push(cell); top.cell=cell; } return; }
    }catch(e){ /* 손상 레코드 무시 */ }
  });
  /* 문단 마무리: 런 나누기 */
  const finish=blocks=>{ for(const b of blocks){ if(b.t==='p'){ const text=b._text||''; const map=b._map||[]; const runs=[]; const rl=b._runs||[]; const csOf=pos=>{ let id=0; for(const [p,i] of rl){ if(p<=pos) id=i; else break; } return info.charShapes[id]||{size:10,bold:false,face:0}; };
        let start=0; while(start<text.length){ const cs=csOf(map[start]??0); let end=start+1; while(end<text.length){ const c2=csOf(map[end]??0); if(c2!==cs) break; end++; } runs.push({t:text.slice(start,end),font:HWP_FACE_KEY(info.faces[cs.face]),size:cs.size||10,b:!!cs.bold}); start=end; }
        b.runs=runs; if(!runs.length){ const cs=csOf(0); b.size=cs.size||10; b.font=HWP_FACE_KEY(info.faces[cs.face]); }
        const ps=b._ps||{}; b.al=ps.align||'left'; const ind=HWP_MM(ps.left||0), hang=-HWP_MM(ps.indent||0); b.ind=Math.max(0,ind-hang); b.hang=hang; b.lh=ps.lsType===0?Math.max(1,Math.min(3,(ps.ls||160)/100)):1.4; b.pbb=!!(b._pb||ps.pageBreak);
        if(ps.head===3){ const bl=info.bullets[(ps.numId||1)-1]; if(bl&&bl.ch) b.prefix=bl.ch+' '; }
        else if(ps.head===1||ps.head===2){ const key=ps.numId||0; const cnt=numCounters[key]||(numCounters[key]=[0,0,0,0,0,0,0,0]); const lv=Math.min(6,ps.level||0); cnt[lv]++; for(let k=lv+1;k<8;k++) cnt[k]=0; const nb=info.numberings[key-1]; let fmt=nb&&nb.fmts[lv]||`^${lv+1}.`; fmt=fmt.replace(/\^(\d)/g,(m,g)=>String(Math.max(1,cnt[+g-1]||1))); b.prefix=fmt+' '; }
        delete b._raw; delete b._runs; delete b._ps; delete b._pb; delete b._map; delete b._ctrls; delete b.cont; delete b._text; }
      else if(b.t==='tblraw'){ if(b.caption) finish(b.caption); for(const c of b.cells) finish(c.blocks); } } };
  finish(out.slice(startIdx));
}
function hwpParse(u8){
  const cfb=cfbRead(u8);
  const fh=cfb.read('FileHeader'); if(!fh||fh.length<256) throw new Error('한글 파일 머리 정보를 읽지 못했습니다');
  const sig=String.fromCharCode(...fh.subarray(0,17)); if(sig!=='HWP Document File') throw new Error('한글 5.0 문서(.hwp)가 아닙니다');
  const fv=new DataView(fh.buffer,fh.byteOffset,fh.byteLength); const flags=fv.getUint32(36,true); const ver=fv.getUint32(32,true);
  if(flags&2) throw new Error('암호가 걸린 문서는 읽을 수 없습니다. 한글에서 암호를 풀고 다시 저장해 주세요');
  if(flags&4) throw new Error('배포용 문서는 읽을 수 없습니다. 원본 문서(편집 가능한 파일)를 사용해 주세요');
  const compressed=!!(flags&1);
  const unpack=name=>{ const raw=cfb.read(name); if(!raw) return null; if(!compressed) return raw; try{ return inflateRaw(raw); }catch(e){ throw new Error('압축을 풀지 못했습니다 ('+name+')'); } };
  const info=hwpDocInfo(unpack('DocInfo')||new Uint8Array(0));
  const blocks=[]; let n=0; while(cfb.has('BodyText/Section'+n)){ const sec=unpack('BodyText/Section'+n); if(sec) hwpSection(sec,info,blocks); n++; }
  if(!n) throw new Error('본문(BodyText)을 찾지 못했습니다');
  return {blocks,version:ver};
}

/* ---------- HWPX ---------- */
function hwpxParse(u8){
  const z=unzip(u8); if(!z.has('Contents/header.xml')||!z.has('Contents/section0.xml')) throw new Error('한글 HWPX 문서 구조(Contents/section0.xml)가 아닙니다');
  const parser=new DOMParser(); const hx=parser.parseFromString(z.text('Contents/header.xml'),'application/xml');
  const byName=(root,name)=>[...root.getElementsByTagName('*')].filter(e=>e.localName===name);
  const fonts={}; byName(hx,'fontface').forEach(ff=>{ if((ff.getAttribute('lang')||'')!=='HANGUL') return; byName(ff,'font').forEach(f=>{ fonts[f.getAttribute('id')]=f.getAttribute('face')||''; }); });
  const charPr={}; byName(hx,'charPr').forEach(c=>{ const fr=byName(c,'fontRef')[0]; charPr[c.getAttribute('id')]={size:(+c.getAttribute('height')||1000)/100,bold:byName(c,'bold').length>0,font:HWP_FACE_KEY(fonts[fr?fr.getAttribute('hangul'):'0'])}; });
  const paraPr={}; byName(hx,'paraPr').forEach(p=>{ const al=byName(p,'align')[0]; const bs=byName(p,'breakSetting')[0]; const hd=byName(p,'heading')[0]; let left=0,intent=0; const mg=byName(p,'margin'); const m=mg.length?mg[mg.length-1]:null; if(m){ const L=byName(m,'left')[0], I=byName(m,'intent')[0]; left=L?+L.getAttribute('value')||0:0; intent=I?+I.getAttribute('value')||0:0; } const ls=byName(p,'lineSpacing')[0];
    paraPr[p.getAttribute('id')]={align:({LEFT:'left',CENTER:'center',RIGHT:'right',JUSTIFY:'justify',DISTRIBUTE:'justify',DISTRIBUTE_SPACE:'justify'})[al?al.getAttribute('horizontal'):'LEFT']||'left',left,intent,pageBreak:bs?bs.getAttribute('pageBreakBefore')==='1':false,lsType:ls&&ls.getAttribute('type')==='PERCENT'?0:1,ls:ls?+ls.getAttribute('value')||160:160,head:hd?({NONE:0,OUTLINE:1,NUMBER:2,BULLET:3})[hd.getAttribute('type')]||0:0,level:hd?+hd.getAttribute('level')||0:0,numId:hd?+hd.getAttribute('idRef')||0:0}; });
  const bfs={}; byName(hx,'borderFill').forEach(b=>{ const wb=byName(b,'winBrush')[0]; let bg=wb?(wb.getAttribute('faceColor')||'').replace('#','').toUpperCase():null; if(!bg||bg==='FFFFFF'||bg==='NONE') bg=null; bfs[b.getAttribute('id')]={bg}; });
  const bullets={}; byName(hx,'bullet').forEach(b=>{ const ch=b.getAttribute('char')||'•'; bullets[b.getAttribute('id')]=hwpBulletChar(ch.charCodeAt(0)); });
  const numberings={}; byName(hx,'numbering').forEach(nb=>{ const fm={}; byName(nb,'paraHead').forEach(ph=>{ fm[+ph.getAttribute('level')||1]=ph.textContent||''; }); numberings[nb.getAttribute('id')]=fm; });
  const numCounters={};
  const blocks=[];
  const textOf=t=>{ let s=''; for(const nd of t.childNodes){ if(nd.nodeType===3) s+=nd.nodeValue; else if(nd.nodeType===1){ const ln=nd.localName; if(ln==='lineBreak') s+='\n'; else if(ln==='tab') s+='\t'; else if(ln==='nbSpace'||ln==='fwSpace') s+=' '; else if(nd.childNodes.length) s+=textOf(nd); } } return s; };
  const doPara=(pEl,cont)=>{ const pp=paraPr[pEl.getAttribute('paraPrIDRef')]||{}; const p={t:'p',runs:[],al:pp.align||'left'}; const ind=HWP_MM(pp.left||0), hang=-HWP_MM(pp.intent||0); p.ind=Math.max(0,ind-hang); p.hang=hang; p.lh=pp.lsType===0?Math.max(1,Math.min(3,(pp.ls||160)/100)):1.4; p.pbb=pp.pageBreak||pEl.getAttribute('pageBreak')==='1'; const after=[];
    for(const run of pEl.childNodes){ if(run.nodeType!==1||run.localName!=='run') continue; const cp=charPr[run.getAttribute('charPrIDRef')]||{size:10,bold:false,font:'g'};
      for(const ch of run.childNodes){ if(ch.nodeType!==1) continue; const ln=ch.localName;
        if(ln==='t'){ const s=textOf(ch); if(s) p.runs.push({t:s,font:cp.font,size:cp.size,b:cp.bold}); }
        else if(ln==='tbl'){ after.push(doTable(ch)); }
        else if(ln==='rect'||ln==='ellipse'||ln==='polygon'||ln==='curve'||ln==='container'||ln==='arc'){ byName(ch,'drawText').forEach(dt=>{ byName(dt,'subList').forEach(sl=>{ for(const q of sl.childNodes) if(q.nodeType===1&&q.localName==='p') doPara(q,after); }); }); }
        else if(ln==='pic'){ after.push({t:'p',runs:[{t:'[그림]',font:'d',size:9,b:false}],al:'center',lh:1.3,_pic:true}); } }
      if(!p.runs.length){ p.size=cp.size; p.font=cp.font; } }
    if(pp.head===3){ const bc=bullets[String(pp.numId)]; if(bc) p.prefix=bc+' '; }
    else if(pp.head===1||pp.head===2){ const key=pp.numId||0; const cnt=numCounters[key]||(numCounters[key]=[0,0,0,0,0,0,0,0]); const lv=Math.min(6,pp.level||0); cnt[lv]++; for(let k=lv+1;k<8;k++) cnt[k]=0; const nb=numberings[String(key)]||{}; let fmt=nb[lv+1]||`^${lv+1}.`; fmt=fmt.replace(/\^(\d)/g,(m,g)=>String(Math.max(1,cnt[+g-1]||1))); p.prefix=fmt+' '; }
    const hasText=p.runs.some(r=>r.t.trim()); if(hasText||!after.length) cont.push(p); for(const a of after) cont.push(a); };
  const doTable=tb=>{ const t={t:'tblraw',rows:+tb.getAttribute('rowCnt')||0,cols:+tb.getAttribute('colCnt')||0,cells:[]};
    for(const tr of tb.childNodes){ if(tr.nodeType!==1||tr.localName!=='tr') continue; for(const tc of tr.childNodes){ if(tc.nodeType!==1||tc.localName!=='tc') continue; const ad=byName(tc,'cellAddr')[0], sp=byName(tc,'cellSpan')[0], sz=byName(tc,'cellSz')[0]; const bf=bfs[tc.getAttribute('borderFillIDRef')]||{}; const sl=byName(tc,'subList')[0]; const va=sl?({TOP:0,CENTER:1,BOTTOM:2})[sl.getAttribute('vertAlign')]||1:1;
        const cell={col:ad?+ad.getAttribute('colAddr')||0:0,row:ad?+ad.getAttribute('rowAddr')||0:0,cs:sp?+sp.getAttribute('colSpan')||1:1,rs:sp?+sp.getAttribute('rowSpan')||1:1,w:sz?+sz.getAttribute('width')||0:0,h:sz?+sz.getAttribute('height')||0:0,bg:bf.bg||null,va,blocks:[]};
        if(sl) for(const q of sl.childNodes) if(q.nodeType===1&&q.localName==='p') doPara(q,cell.blocks);
        t.cells.push(cell); } }
    return t; };
  let n=0; while(z.has('Contents/section'+n+'.xml')){ const sx=parser.parseFromString(z.text('Contents/section'+n+'.xml'),'application/xml'); const sec=sx.documentElement; for(const q of sec.childNodes) if(q.nodeType===1&&q.localName==='p') doPara(q,blocks); n++; }
  return {blocks};
}

/* ---------- 원시 블록 → 문서 블록(DSL) ---------- */
function hwpToDsl(raw,info){
  const out=[]; const stats={paras:0,tables:0,chars:0,pics:0};
  const cellText=blocks=>blocks.map(b=>b.t==='p'?(b.prefix||'')+(b.runs||[]).map(r=>r.t).join(''):b.t==='tblraw'?tblFlat(b):'').filter(Boolean).join('\n');
  const tblFlat=t=>{ const rows={}; t.cells.forEach(c=>{ (rows[c.row]=rows[c.row]||[]).push(c); }); return Object.keys(rows).sort((a,b)=>a-b).map(r=>rows[r].sort((a,b)=>a.col-b.col).map(c=>cellText(c.blocks)).join(' / ')).join('\n'); };
  const paraDsl=b=>{ stats.paras++; const runs=(b.runs||[]).map(r=>({t:String(r.t).replace(/\t/g,'    '),font:r.font||'g',size:Math.max(6,Math.min(40,r.size||10)),b:!!r.b})); if(b.prefix){ const f=runs[0]||{font:b.font||'g',size:b.size||10,b:false}; runs.unshift({t:b.prefix,font:f.font,size:f.size,b:f.b}); } runs.forEach(r=>stats.chars+=r.t.length); if(b._pic) stats.pics++;
    const first=runs[0]||{}; return {t:'p',runs,al:b.al||'left',size:first.size||b.size||10,font:first.font||b.font||'g',b:!!first.b,ind:b.ind||0,hang:b.hang||0,lh:b.lh||1.5,pbb:!!b.pbb}; };
  const tblDsl=t=>{ stats.tables++; const cells=t.cells.filter(c=>c.cs>0&&c.rs>0); if(!cells.length) return null;
    const ncol=Math.max(t.cols||0,...cells.map(c=>c.col+c.cs)), nrow=Math.max(t.rows||0,...cells.map(c=>c.row+c.rs)); if(!ncol||!nrow) return null;
    const cw=new Array(ncol).fill(0); cells.forEach(c=>{ if(c.cs===1&&c.w>0) cw[c.col]=Math.max(cw[c.col],HWP_MM(c.w)); });
    cells.forEach(c=>{ if(c.cs>1&&c.w>0){ const known=cw.slice(c.col,c.col+c.cs); const miss=known.filter(x=>!x).length; if(miss){ const rest=Math.max(0,HWP_MM(c.w)-known.reduce((a,b)=>a+b,0)); for(let k=c.col;k<c.col+c.cs;k++) if(!cw[k]) cw[k]=rest/miss; } } });
    for(let k=0;k<ncol;k++) if(!cw[k]||cw[k]<3) cw[k]=Math.max(8,170/ncol);
    let total=cw.reduce((a,b)=>a+b,0); const scale=total>170?170/total:1; const w=cw.map(x=>Math.round(x*scale*10)/10);
    const rows=[]; for(let r=0;r<nrow;r++) rows.push([]);
    cells.sort((a,b)=>a.row-b.row||a.col-b.col).forEach(c=>{ if(c.row>=nrow) return; const ps=[]; for(const b of c.blocks){ if(b.t==='p'){ const d=paraDsl(b); ps.push({runs:d.runs,al:d.al,size:d.size,font:d.font,b:d.b}); } else if(b.t==='tblraw'){ const txt=tblFlat(b); txt.split('\n').forEach(line=>ps.push({runs:[{t:line,font:'g',size:9,b:false}],al:'left',size:9,font:'g',b:false})); stats.tables++; } }
      const cell={p:ps.length?ps:[{runs:[],al:'left',size:10,font:'g',b:false}],cs:c.cs,rs:c.rs,va:['top','middle','bottom'][c.va]||'middle'}; if(c.bg) cell.bg=c.bg; if(c.rs===1&&c.h>0) cell.h=Math.max(4,Math.min(120,Math.round(HWP_MM(c.h)*10)/10)); rows[c.row].push(cell); });
    return {t:'tbl',w,rows:rows.filter(r=>r.length),border:true,pad:0.8,va:'middle',font:'g',size:10,flow:true}; };
  for(const b of raw){ if(b.t==='p'){ const d=paraDsl(b); if(d.pbb) out.push({t:'pb'}); delete d.pbb; out.push(d); } else if(b.t==='tblraw'){ if(b.caption) for(const c of b.caption){ if(c.t==='p'&&(c.runs||[]).some(r=>r.t.trim())){ const d=paraDsl(c); delete d.pbb; d.al='center'; out.push(d); } } const d=tblDsl(b); if(d) out.push(d); } }
  /* 맨 앞 쪽나눔 제거 · 연속 빈 문단 정리(4개 이상은 3개로) */
  while(out.length&&out[0].t==='pb') out.shift();
  const cleaned=[]; let blank=0; for(const b of out){ const isBlank=b.t==='p'&&!b.runs.some(r=>r.t.trim()); blank=isBlank?blank+1:0; if(blank>3) continue; cleaned.push(b); }
  return {blocks:cleaned,stats};
}

/* ---------- 제목·부서 추정 ---------- */
function hwpGuessMeta(blocks){
  const norm=s=>String(s||'').replace(/[\s:：·\-_()\[\]]/g,'');
  const TITLE_KEYS=['안건명','안건제목','제목','안건','심의안건','제안안건','안건명칭','의안명','건명'], DEPT_KEYS=['제안부서','부서','제안자','담당부서','소관부서','제출부서','담당','제안부서명'], NO_KEYS=['안건번호','의안번호','번호'];
  const cellTxt=c=>(c.p||[]).map(p=>(p.runs||[]).map(r=>r.t).join('')).join(' ').trim();
  let title='',dept='',no='';
  const isLabel=v=>{ const n=norm(v); return TITLE_KEYS.includes(n)||DEPT_KEYS.includes(n)||NO_KEYS.includes(n)||/^(쪽번호|비고|번호|순|순서|구분|내용|일시|장소)$/.test(n); };
  for(const b of blocks.slice(0,40)){ if(b.t!=='tbl') continue; for(const row of b.rows){ for(let i=0;i<row.length-1;i++){ const k=norm(cellTxt(row[i])); const val=cellTxt(row[i+1]); if(!val||isLabel(val)) continue; if(!title&&TITLE_KEYS.includes(k)) title=val; else if(!dept&&DEPT_KEYS.includes(k)) dept=val; else if(!no&&NO_KEYS.includes(k)) no=val; } } if(title&&dept) break; }
  const paras=[]; for(const b of blocks){ if(b.t==='p'){ const s=b.runs.map(r=>r.t).join('').replace(/\s+/g,' ').trim(); if(s) paras.push({s,size:b.size||10,b:!!b.b}); if(paras.length>=15) break; } else if(b.t==='tbl'&&paras.length) break; }
  const strip=s=>s.replace(/^[【\[(]?\s*(심의\s*)?안건\s*(제)?\s*\d+\s*호?\s*[】\])]?\s*[:：.\-]?\s*/,'').replace(/^제\s*\d+\s*호\s*(안건)?\s*[:：.\-]?\s*/,'').trim();
  for(const p of paras){ const m=/(?:안건|의안)\s*(?:제)?\s*(\d+)\s*호|제\s*(\d+)\s*호\s*(?:안건|의안)/.exec(p.s); if(m&&!no){ no=m[1]||m[2]; } }
  if(!title){ const cand=paras.filter(p=>{ const s=strip(p.s); return s.length>=3&&s.length<=70&&!/^(학교운영위원회|심의\s*자료|제안\s*부서|일\s*시|장\s*소)/.test(s); }); if(cand.length){ cand.sort((a,b)=>(b.size+(b.b?2:0))-(a.size+(a.b?2:0))); title=strip(cand[0].s); } }
  if(!dept){ for(const p of paras){ const m=/(?:제안\s*부서|담당\s*부서|부\s*서)\s*[:：]\s*([^\s,]+)/.exec(p.s); if(m){ dept=m[1]; break; } } }
  const noDigits=(String(no||'').match(/\d+/)||[''])[0];
  return {title:title.replace(/\s+/g,' ').trim().slice(0,120),dept:dept.replace(/\s+/g,' ').trim().slice(0,40),no:noDigits};
}

/* ---------- 파일 → 첨부 안건 ---------- */
async function hwpFileToAttach(file){
  const u8=new Uint8Array(await file.arrayBuffer()); const name=file.name; const lower=name.toLowerCase();
  let parsed;
  if(u8.length>=4&&u8[0]===0x50&&u8[1]===0x4B){ parsed=hwpxParse(u8); }
  else if(u8.length>=8&&u8[0]===0xD0&&u8[1]===0xCF&&u8[2]===0x11&&u8[3]===0xE0){ parsed=hwpParse(u8); }
  else if(String.fromCharCode(...u8.subarray(0,20)).startsWith('HWP Document File V')) throw new Error('한글 97(3.0) 형식은 지원하지 않습니다. 한글에서 다시 저장(.hwp 5.0 또는 .hwpx)해 주세요');
  else if(lower.endsWith('.hwp')||lower.endsWith('.hwpx')) throw new Error('한글 파일 구조를 읽지 못했습니다 (손상되었거나 다른 형식)');
  else throw new Error('한글 파일(.hwp / .hwpx)만 취합할 수 있습니다');
  const {blocks,stats}=hwpToDsl(parsed.blocks); if(!blocks.length) throw new Error('읽을 수 있는 글이나 표가 없습니다');
  const meta=hwpGuessMeta(blocks);
  return {name,title:meta.title||name.replace(/\.(hwpx?|HWPX?)$/,''),dept:meta.dept,no:meta.no,agIdx:-1,blocks,stats};
}

/* =====================================================================
   화면(UI) — 입력 폼, 명단, 안건, 문서 카드, 미리보기, 저장/불러오기
   ===================================================================== */
let curStep='s1'; const curDoc={s4:null,s5:null,s6:null};
const TIPS={
  s1:'<b>학교명</b>은 정식 명칭으로 넣으세요. 회의일자를 넣으면 요일이 자동으로 계산됩니다. 아래 <b>위원 명단</b>은 이름만 넣고 Enter, <b>위원장·부위원장</b>은 명단에서 고르면 등록부·회의록·결재선에 자동 반영됩니다.',
  s3:'안건 줄의 <b>📎</b>로 그 안건에 붙일 첨부(한글·PDF·그림)를 넣으면 심의자료에서 그 안건 원문 바로 뒤에 붙습니다. 안건번호는 연중 누적 번호입니다. <b>시작 번호</b>를 넣고 <b>자동 채번</b>을 누르세요. 부서에서 받은 <b>안건 한글파일</b>을 아래 취합 카드에 넣으면 제목·부서를 읽어 목록을 채우고, 4단계 심의자료에 원문이 붙습니다.',
  s4:'오른쪽 <b>문서 카드</b>를 누르면 본문에 <b>A4 미리보기</b>가 뜹니다. 공고와 통지는 <b>회의 7일 전</b>까지! <b>한글 저장</b>으로 .hwpx 파일을 만들거나 바로 <b>인쇄·PDF</b>하세요.',
  s5:'회의 당일 문서입니다. <b>등록부</b>는 서명받고, <b>시나리오</b>는 간사·위원장 진행 대본, <b>심의자료</b>는 표지·안건목록 뒤에 2단계에서 취합한 안건 원문이 안건마다 새 쪽으로 붙어 한 파일이 됩니다.',
  s6:'회의가 끝나면 <b>처리결과·표결결과</b>와 <b>출석</b>을 확정한 뒤 회의록과 이송 기안문, 안건처리상황표를 만드세요.',
  s7:'<b>엑셀 저장</b>해 두면 다음 회의 때 불러와 <b>새 회의 시작(회차+1)</b>만 누르면 됩니다. 저장한 엑셀은 예전 자동화 프로그램과도 호환됩니다.',
  help:'전체 흐름은 <b>소집 → 진행 → 결과</b> 세 단계입니다. 왼쪽 메뉴 <b>기본 정보</b>부터 차례로 채우면 됩니다. 어떻게 나오는지 먼저 보려면 <b>예시 자료</b>를 넣어 보세요.'
};

/* ---------- 이동 ---------- */

/* 다른 도구(수의·입찰 따라가기 공고문 등)가 같이 쓰는 한글 만들기 */
window.TKHX={build:buildHwpx};
/* ===== 엔진 끝 ===== */

var TK=function(){ return window.TKCV||{}; };
HK.save=function(blob,name){ var f=TK().saveFile; return f?f(blob,name).then(null,function(e){ HK.toast&&HK.toast(e.message); }):Promise.resolve(); };
HK.printRoot=function(){ var r=document.getElementById("hkPrint"); if(!r){ r=document.createElement("div"); r.id="hkPrint"; document.body.appendChild(r); } return r; };

function el(t,c,x){ var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e; }
function lsGet(k,d){ try{ var v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } }
function lsSet(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){ HK.toast&&HK.toast("브라우저 저장 공간이 부족해요. '자료 내보내기'로 보관해 주세요."); } }
function today(){ return iso(new Date()); }
function dd(s){ var n=daysBetween(today(),s); return n; }
function ddTxt(n){ return n==null?"":n===0?"오늘":n>0?"D-"+n:(-n)+"일 지남"; }
function ddCls(n){ return n==null?"":n<0?"late":n<=3?"soon":""; }
function kd(s){ return s?fmtDot(s):""; }

var STG=[["mem","위원","위원 명단·학교"],["ag","안건","심의 안건 받기"],["call","소집","회의 소집(7일 전)"],["meet","회의","회의 진행"],["res","결과","결과 확정·학교장 이송"]];
var RESULTS=["원안가결","수정가결","부결","보류","재심의","심의종결"], VOTES=["전원찬성","만장일치","찬성 다수","이의 없음"];
var DEPTS=["행정실","교무부","연구부","교육과정부","학생안전부","체육예술부","학년부","보건실","급식실","학교운영위원회"];

/* ---------- 장부 ---------- */
var MEET=null, CUR=null;
/* 공립/사립(이 PC 기준). 사립은 경남 조례가 적용되지 않음 — 초·중등교육법 제34조②, 시행령 제63조 */
function PRI(){ return lsGet("hk.kind","공립")==="사립"; }
var HK_PRIV="사립학교는 경남 조례가 적용되지 않아요. 소집 기한·정족수·회의록 공개는 학교법인 정관과 학교 운영위원회 규정을 따라요(초·중등교육법 제34조②). 심의 결과는 학교장이 최대한 존중하고(시행령 제63조③), 예산·결산은 학운위 심의를 거쳐 이사회가 의결해요(사립학교법 제29조④·제31조③). 학칙은 자문 사항이고, 공모교장·초빙교사는 심의 대상이 아니에요.";
function loadMeet(){
  MEET=lsGet("hk.meetings",null);
  if(!Array.isArray(MEET)){ MEET=[];
    try{ var raw=localStorage.getItem(STORE_KEY); if(raw){ var o=JSON.parse(raw); var ms=mergeState(o); delete ms.attach;
      if(trim(ms.school.name)||ms.agendas.length) MEET.push({id:Date.now(),attKey:STORE_KEY,legacy:true,s:ms,done:{}}); } }catch(e){}
    lsSet("hk.meetings",MEET); }
}
function strip(st){ var o={}; Object.keys(st).forEach(function(k){ if(k!=="attach") o[k]=st[k]; }); return o; }
HK.persist=function(){ if(!CUR) return; CUR.s=JSON.parse(JSON.stringify(strip(S))); lsSet("hk.meetings",MEET); idbSaveAttach(); };
function openMeeting(m){
  CUR=m; S=mergeState(JSON.parse(JSON.stringify(m.s))); S.attach=[]; HK.attKey=m.attKey; _attSig=null;
  if(m.legacy){ try{ var at=localStorage.getItem(STORE_KEY+"_at"); if(at) S.attach=mergeState({attach:JSON.parse(at)}).attach; }catch(e){} }
  idbLoadAttach();
}
/* 문서번호 이어 매기기: 공고번호는 같은 학년도면 +1, 운영위 문서번호 "113-1" 꼴은 앞 번호 +1 */
function nextNums(prev,ns){ var d=prev.docs, o={}, n=parseInt(trim(d.noticeNo),10);
  if(n>0&&String(prev.meet.year)===String(ns.meet.year)) o.noticeNo=String(n+1);
  var base=null; ["no1","no2","no3","no4"].forEach(function(k){ var m=/^(.*?)(\d+)-(\d+)$/.exec(trim(d[k])); if(m&&base==null) base={p:m[1],n:+m[2]}; });
  if(base) ["no1","no2","no3","no4"].forEach(function(k,i){ o[k]=base.p+(base.n+1)+"-"+(i+1); });
  return o; }
function prevMeeting(m){ var d=m&&m.s.meet.date||"9999"; return MEET.filter(function(x){ return x!==m&&(x.s.meet.date||"")<d; }).sort(function(a,b){ return String(b.s.meet.date||"").localeCompare(String(a.s.meet.date||"")); })[0]; }
function maskName(n){ n=trim(n); return n?n.charAt(0)+"○○":n; }
function mTitle(st){ return (st.meet.year||"")+"학년도 제"+(st.meet.no||"?")+"회 "+(st.meet.kind||"정기회"); }
function members(st){ return [].concat(st.members.parent,st.members.teacher,st.members.local); }
function curIdx(m){ m.done=m.done||{}; for(var i=0;i<STG.length;i++) if(!m.done[STG[i][0]]) return i; return STG.length; }
function hkDue(d){ var w=TK().workDays; if(!d) return ""; if(PRI()) return d; d=addDays(d,-7); if(!w) return d; for(var i=0;i<10;i++){ if(w(addDays(d,-1),1)===d) return d; d=addDays(d,-1); } return d; }
function nextTodo(m){
  var i=curIdx(m); if(i>=STG.length) return null; var d=m.s.meet.date, k=STG[i][0];
  if(k==="mem") return {t:"위원 명단 확인",due:hkDue(d)};
  if(k==="ag") return {t:"심의 안건 받기",due:hkDue(d)};
  if(k==="call") return {t:"소집 공고·위원 통지",due:hkDue(d)};
  if(k==="meet") return {t:"회의 열기",due:d};
  return {t:"처리결과 학교장 이송",due:d?(PRI()?d:addDays(d,3)):""};
}

/* ---------- 모양 ---------- */
var CSS=[
".hkv .cv-pane{padding-bottom:12px}",
".hk-say{font-size:14px;color:var(--ink-2);margin:0 0 10px;line-height:1.6}",
".hk-sub{font-size:13.5px;font-weight:700;margin:18px 0 8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
".hk-sub small{font-weight:400;color:var(--muted);font-size:12.5px}",
".hk-grp{display:grid;grid-template-columns:110px 1fr;gap:6px 12px;align-items:start;padding:8px 0;border-bottom:1px solid var(--line)}",
".hk-grp:last-child{border-bottom:0}",
".hk-grp>b{font-size:13.5px;padding-top:6px}",
".hk-grp>b small{display:block;font-weight:400;color:var(--muted);font-size:12px}",
".hk-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}",
".hk-chip{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line-strong);border-radius:999px;padding:4px 6px 4px 12px;font-size:14px;background:var(--surface)}",
".hk-chip.off{opacity:.55;text-decoration:line-through}",
".hk-chip .r{font-size:11px;font-weight:700;color:var(--accent-ink);background:var(--accent-soft);border-radius:6px;padding:1px 5px}",
".hk-chip button{font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:15px;line-height:1;padding:0 4px}",
".hk-chip button:hover{color:var(--neg)}",
".hk-chip input{margin:0 2px 0 -4px}",
".hk-addin{font:inherit;font-size:14px;padding:5px 10px;border:1px dashed var(--line-strong);border-radius:999px;background:none;color:var(--ink);width:150px}",
".hk-rows{display:grid;gap:6px}",
".hk-row{display:grid;gap:6px;align-items:center;background:var(--surface-2);border-radius:10px;padding:6px 8px}",
".hk-row input,.hk-row select{font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box}",
".hk-row .x{font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:2px 6px}",
".hk-row .x:hover{color:var(--neg)}",
".hk-row .n{font-size:12.5px;color:var(--muted);text-align:center}",
".hk-row .att{font:inherit;font-size:12.5px;border:1px solid var(--line-strong);background:var(--surface);border-radius:8px;padding:5px 8px;cursor:pointer;color:var(--ink-2);white-space:nowrap}",
".hk-ag{grid-template-columns:28px 92px 1fr 150px auto 28px}",
".hk-at{grid-template-columns:1fr 1fr 130px 1fr 28px}",
".hk-at .fn{font-size:12.5px;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
".hk-rs{grid-template-columns:1fr 130px 130px}",
".hk-rs .tt{font-size:14px;line-height:1.4}",
".hk-add{font:inherit;font-size:13.5px;border:1px dashed var(--line-strong);background:none;color:var(--accent-ink);border-radius:10px;padding:7px 12px;cursor:pointer}",
".hk-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}",
".hk-docs{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin-top:6px}",
".hk-doc{min-width:0}",
".hk-dh .bs .hk-b{font:inherit;font-size:13px}",
".hk-doc{border:1px solid var(--line);border-radius:12px;background:var(--surface)}",
".hk-dh{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 14px}",
".hk-dh .tx{flex:1 1 220px;min-width:0}",
".hk-dh b{display:block;font-size:14.5px}",
".hk-dh small{display:block;color:var(--muted);font-size:12.5px;line-height:1.45}",
".hk-dh .bs{display:flex;gap:6px}",
".hk-dh .bs button{font:inherit;font-size:13px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink-2);border-radius:8px;padding:5px 10px;cursor:pointer}",
".hk-dh .bs button:hover,.hk-dh .bs button[aria-pressed=true]{border-color:var(--accent);color:var(--accent-ink)}",
".hk-pv{border-top:1px solid var(--line);background:#e9ebef;padding:14px 8px;border-radius:0 0 12px 12px;overflow:hidden}",
".hk-pv .sheet{width:210mm;min-height:297mm;padding:20mm 20mm 15mm;background:#fff;color:#000;margin:0 auto 14px;box-shadow:0 2px 12px rgba(0,0,0,.25);font-family:'굴림체','Gulim','굴림',sans-serif;font-size:12pt;line-height:1.6;position:relative;box-sizing:border-box}",
".hk-pv .sheet:last-child{margin-bottom:0}",
".sheet p{margin:0;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;line-height:1.6}",
".sheet table{border-collapse:collapse;width:100%;table-layout:fixed;margin:0}",
".sheet td{padding:1mm 2mm;vertical-align:middle;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;color:#000}",
".sheet td p{line-height:1.45}",
"#hkPrint{display:none}",
"@media print{@page{size:A4;margin:20mm 20mm 15mm} body.hk-printing>*:not(#hkPrint){display:none!important} body.hk-printing{background:#fff!important} body.hk-printing #hkPrint{display:block} #hkPrint .sheet{width:auto;min-height:0;padding:0;margin:0;box-shadow:none;break-after:page;page-break-after:always} #hkPrint .sheet:last-child{break-after:auto;page-break-after:auto}}",
".hk-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:var(--surface);padding:10px 16px;border-radius:10px;font-size:14px;z-index:9999;max-width:min(560px,calc(100vw - 32px));box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .2s}",
".hk-toast.on{opacity:1}",
".hk-att{display:flex;flex-wrap:wrap;gap:6px}",
".hk-att label{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line-strong);border-radius:999px;padding:5px 12px;font-size:14px;cursor:pointer;background:var(--surface)}",
".hk-att label.off{opacity:.6;background:var(--surface-2)}",
"@media (max-width:640px){.hk-grp{grid-template-columns:1fr}.hk-grp>b{padding-top:0}",
"  .hk-ag{grid-template-columns:28px 1fr 28px}.hk-ag>:nth-child(2){grid-column:2}.hk-ag>.x{grid-row:1;grid-column:3}.hk-ag>:nth-child(3),.hk-ag>:nth-child(4),.hk-ag>:nth-child(5){grid-column:1/-1}",
"  .hk-at{grid-template-columns:1fr 28px}.hk-at>.x{grid-row:1;grid-column:2}.hk-at>:not(.x){grid-column:1}",
"  .hk-rs{grid-template-columns:1fr 1fr}.hk-rs .tt{grid-column:1/-1}",
"  .gbv .cv-calc,.hkv .cv-calc{grid-template-columns:1fr 1fr}}"
].join("\n");

function build(root){
  if(!document.getElementById("cv-css")&&TK().CSS){ var a=el("style"); a.id="cv-css"; a.textContent=TK().CSS; document.head.appendChild(a); }
  if(!document.getElementById("hk-css")){ var b=el("style"); b.id="hk-css"; b.textContent=CSS; document.head.appendChild(b); }
  loadMeet();
  var view={v:"list"}, OPENPV={};
  root.textContent=""; var app=el("div","cv hkv"); root.appendChild(app);
  var toastEl=el("div","hk-toast"); document.body.appendChild(toastEl); var tT;
  HK.toast=function(m){ toastEl.textContent=m; toastEl.classList.add("on"); clearTimeout(tT); tT=setTimeout(function(){ toastEl.classList.remove("on"); },3200); };
  HK.onAttach=function(){ if(view.v==="m") draw(); };
  function btn(t,cls,fn){ var x=el("button",cls||"btn",t); x.type="button"; if(fn) x.onclick=fn; return x; }
  function msg(box,t,kind){ box.textContent=t||""; box.className="tkmsg"+(t?" on "+(kind||"ok"):""); }
  function save(){ HK.persist(); }
  function go(v){ view=v; draw(); top(); }
  function top(){ var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function draw(){ app.textContent=""; if(view.v==="new") drawNew(); else if(view.v==="m"&&CUR) drawMeet(); else drawList(); }
  function tiles(box,items){ box.textContent=""; items.forEach(function(x){ if(!x) return; var d=el("div","cv-num "+(x.c||"")); d.appendChild(el("span",null,x.l)); d.appendChild(el("b",null,x.v)); if(x.s) d.appendChild(el("small",null,x.s)); box.appendChild(d); }); }
  function calc(pn){ var c=el("div","cv-calc"); pn.appendChild(c); return c; }
  function sub(pn,t,s){ var h=el("div","hk-sub",t); if(s) h.appendChild(el("small",null,s)); pn.appendChild(h); return h; }
  function law(pn,t){ pn.appendChild(el("p","cv-law",t)); }
  function grid(pn){ var g=el("div","tkgridf"); pn.appendChild(g); return g; }
  /* path: "meet.date" 같은 상태 경로 */
  function fld(g,path,label,o){ o=o||{}; var f=el("label","tkf"+(o.wide?" wide":"")); f.appendChild(el("span","tkfl",label)); var i;
    if(o.sel){ i=el("select"); o.sel.forEach(function(v){ var op=el("option",null,v); op.value=v; i.appendChild(op); }); }
    else { i=el("input"); i.type=o.type||"text"; if(o.ph) i.placeholder=o.ph; if(o.list) i.setAttribute("list",o.list); }
    i.value=getPath(path)||""; f.appendChild(i); if(o.hint) f.appendChild(el("small",null,o.hint)); g.appendChild(f);
    var on=function(){ setPath(path,i.value.trim()); save(); if(o.live) o.live(); if(o.type==="date"&&hkPrefill()){ save(); draw(); } };
    i.addEventListener(o.sel||o.type==="date"||o.type==="time"?"change":"input",on); if(o.redraw) i.addEventListener("change",function(){ draw(); });
    return i; }
  function datalist(id,arr){ if(document.getElementById(id)) return; var d=el("datalist"); d.id=id; arr.forEach(function(v){ var o=el("option"); o.value=v; d.appendChild(o); }); document.body.appendChild(d); }
  datalist("hkDept",DEPTS); datalist("hkVote",VOTES);

  /* ================= 장부 ================= */
  function drawList(){
    var hero=el("div","cv-hero"); var h=el("div"); h.appendChild(el("h3",null,MEET.length?(trim(MEET[0].s.school.name)||"우리 학교")+" 운영위원회":"학교운영위원회 회의")); hero.appendChild(h);
    var bs=el("div","cv-btns"); bs.appendChild(btn("+ 새 회의","btn",function(){ go({v:"new"}); })); var mv=btn("자료 내보내기","btn ghost"); bs.appendChild(mv); hero.appendChild(bs); app.appendChild(hero);
    var kb=el("div","cv-chips"); kb.style.margin="0 0 10px"; ["공립","사립"].forEach(function(k){ var p=btn(k,"pill",function(){ lsSet("hk.kind",k); draw(); }); p.setAttribute("aria-pressed",(PRI()?"사립":"공립")===k?"true":"false"); kb.appendChild(p); }); app.appendChild(kb);
    if(PRI()) app.appendChild(el("p","cv-law",HK_PRIV));
    var setBox=el("div"); app.appendChild(setBox); mv.onclick=function(){ if(setBox.firstChild){ setBox.textContent=""; return; } moveBox(setBox); };
    var y=String(new Date().getFullYear()), open=MEET.filter(function(m){ return curIdx(m)<STG.length; });
    var up=open.map(function(m){ return m.s.meet.date; }).filter(function(d){ return d&&d>=today(); }).sort()[0];
    var sm=el("div","cv-sum"); [["올해 회의",MEET.filter(function(m){ return m.s.meet.year===y; }).length+"번"],["진행 중",open.length+"건"],["다음 회의",up?ddTxt(dd(up)):"-"],["끝남",(MEET.length-open.length)+"건"]].forEach(function(p){ var d=el("div"); d.appendChild(el("span",null,p[0])); d.appendChild(el("b",null,p[1])); sm.appendChild(d); }); app.appendChild(sm);
    if(!MEET.length){ var e=el("div","cv-empty"); e.appendChild(el("p",null,"아직 올린 회의가 없어요.")); e.appendChild(el("p",null,"'+ 새 회의'로 회차와 날짜를 넣으면 소집 공고 기한부터 학교장 이송까지 순서대로 따라가요. 예전 학운위 문서 도구 엑셀이 있으면 '자료 내보내기' 안의 불러오기로 가져오세요."));
      e.appendChild(btn("+ 새 회의","btn",function(){ go({v:"new"}); })); app.appendChild(e); return; }
    app.appendChild(el("div","cv-h","해야 할 일")); var tl=el("div","cv-todo"); app.appendChild(tl);
    var todos=open.map(function(m){ var n=nextTodo(m); return n?{m:m,n:n,d:n.due?dd(n.due):null}:null; }).filter(Boolean).sort(function(a,b){ return (a.d==null?9e9:a.d)-(b.d==null?9e9:b.d); });
    if(!todos.length) tl.appendChild(el("p","tkempty","지금 할 일이 없어요."));
    todos.forEach(function(x){ var r=btn("","cv-row",function(){ openMeeting(x.m); go({v:"m"}); });
      r.appendChild(el("span","cv-dd "+(x.n.due?ddCls(x.d):"free"),x.n.due?ddTxt(x.d):"날짜 없음")); var tx=el("span","tx"); tx.appendChild(el("b",null,x.n.t)); tx.appendChild(el("small",null,mTitle(x.m.s)+(x.n.due?" · 기한 "+kd(x.n.due):""))); r.appendChild(tx); tl.appendChild(r); });
    function kill(b,m){ if(TK().delX) TK().delX(b,mTitle(m.s),function(){ MEET=MEET.filter(function(x){ return x!==m; }); lsSet("hk.meetings",MEET); if(CUR===m) CUR=null; draw(); }); }
    function cards(list,title){ if(!list.length) return; app.appendChild(el("div","cv-h",title)); var g=el("div","cv-cases"); app.appendChild(g);
      list.forEach(function(m){ var b=btn("","cv-case",function(){ openMeeting(m); go({v:"m"}); }), i=curIdx(m), ag=m.s.agendas.filter(function(a){ return trim(a.title); }).length;
        b.appendChild(el("h4",null,mTitle(m.s))); b.appendChild(el("p",null,[m.s.meet.date?fmtDotW(m.s.meet.date):"날짜 미정",ag?"안건 "+ag+"건":"",members(m.s).length?"위원 "+members(m.s).length+"명":""].filter(Boolean).join(" · ")));
        var tr=el("div","cv-track"); STG.forEach(function(_,j){ tr.appendChild(el("i",j<i?"on":j===i?"cur":"")); }); b.appendChild(tr);
        b.appendChild(el("p",null,i<STG.length?"지금: "+STG[i][2]:"끝났어요")); kill(b,m); g.appendChild(b); }); }
    var sorted=MEET.slice().sort(function(a,b){ return String(b.s.meet.date||"9").localeCompare(String(a.s.meet.date||"9")); });
    cards(sorted.filter(function(m){ return open.indexOf(m)>=0; }),"진행 중인 회의");
    var fin=sorted.filter(function(m){ return open.indexOf(m)<0; });
    if(fin.length){ var dt=el("details","cv-more"); dt.appendChild(el("summary",null,"끝난 회의 "+fin.length+"건")); var g=el("div","cv-cases"); g.style.marginTop="8px"; dt.appendChild(g); app.appendChild(dt);
      fin.forEach(function(m){ var b=btn("","cv-case",function(){ openMeeting(m); go({v:"m"}); }); b.appendChild(el("h4",null,mTitle(m.s))); b.appendChild(el("p",null,m.s.meet.date?fmtDotW(m.s.meet.date):"")); kill(b,m); g.appendChild(b); }); }
  }
  function moveBox(box){ box.textContent=""; var s=el("div","cv-set"); box.appendChild(s); var r=el("div","cv-btns"); s.appendChild(r); var m=el("div","tkmsg"); s.appendChild(m);
    r.appendChild(btn("파일로 내보내기","btn ghost",function(){ HK.save(new Blob([JSON.stringify({hk:1,meetings:MEET},null,1)],{type:"application/json"}),"학운위회의_"+today()+".json").then(function(){ msg(m,"내보냈어요. 안건 한글파일 원문은 이 브라우저에만 남아요.","ok"); }); }));
    var lb=el("label","btn ghost","파일 불러오기"), fi=el("input"); fi.type="file"; fi.accept=".json"; fi.hidden=true; lb.appendChild(fi); r.appendChild(lb);
    fi.onchange=function(){ var f=fi.files[0]; if(!f) return; f.text().then(function(t){ var j=JSON.parse(t), ids={}; MEET.forEach(function(x){ ids[x.id]=1; }); var n=0;
      (j.meetings||[]).forEach(function(x){ if(!ids[x.id]&&x.s){ x.attKey="hk."+x.id; delete x.legacy; MEET.push(x); n++; } }); lsSet("hk.meetings",MEET); draw(); HK.toast(n+"건을 목록에 더했어요."); }).catch(function(){ msg(m,"내보낸 파일을 읽지 못했어요.","bad"); }); };
    var lx=el("label","btn ghost","예전 엑셀 불러오기"), fx=el("input"); fx.type="file"; fx.accept=".xlsx,.xlsm"; fx.hidden=true; lx.appendChild(fx); r.appendChild(lx);
    fx.onchange=function(){ var f=fx.files[0]; if(!f) return; f.arrayBuffer().then(function(b){ var res=xlsxToState(new Uint8Array(b)), ns=res.state; delete ns.attach; var id=Date.now();
      MEET.push({id:id,attKey:"hk."+id,s:ns,done:{}}); lsSet("hk.meetings",MEET); draw(); HK.toast(mTitle(ns)+"를 목록에 올렸어요."); }).catch(function(e){ msg(m,"엑셀을 읽지 못했어요: "+(e.message||e),"bad"); }); };
    s.appendChild(el("p","cv-law","예전 엑셀 = 길잡이 학운위 문서 도구에서 저장한 엑셀, 또는 학교운영위원회 자동화 엑셀(.xlsm)"));
  }

  /* ================= 새 회의 ================= */
  function drawNew(){
    var last=MEET.slice().sort(function(a,b){ return String(b.s.meet.date||"").localeCompare(String(a.s.meet.date||"")); })[0];
    var W=view.w||(view.w=(function(){ var ns=last?mergeState(JSON.parse(JSON.stringify(last.s))):DEF();
      if(last){ ns.meet.no=/^\d+$/.test(trim(last.s.meet.no))?String(+last.s.meet.no+1):""; ns.meet.date=""; ns.agendas=[]; ns.docs=DEF().docs; var nx=nextNums(last.s,ns); Object.keys(nx).forEach(function(k){ ns.docs[k]=nx[k]; }); ns.minutes=DEF().minutes; ns.done=DEF().done; members(ns).forEach(function(x){ x.attend=true; }); }
      ns.meet.year=ns.meet.year||String(new Date().getFullYear()); delete ns.attach; return ns; })());
    app.appendChild(btn("← 회의 목록","cv-back",function(){ go({v:"list"}); }));
    var tp=el("div","cv-top"); tp.appendChild(el("h3",null,"새 회의")); app.appendChild(tp);
    var pn=el("section","cv-pane cv-one"); app.appendChild(pn);
    function row(n,label){ var r=el("div","cv-orow"), h=el("div","cv-olab"); h.appendChild(el("span","qn",String(n))); h.appendChild(document.createTextNode(label)); r.appendChild(h); var b=el("div","cv-obody"); r.appendChild(b); pn.appendChild(r); return b; }
    function inp(box,key,o){ var i=el("input"); i.type=o.type||"text"; i.value=W.meet[key]||""; if(o.ph) i.placeholder=o.ph; i.style.cssText="font:inherit;font-size:15px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);max-width:"+(o.w||"220px")+";width:100%";
      i.addEventListener(o.type?"change":"input",function(){ W.meet[key]=i.value.trim(); res(); }); box.appendChild(i); return i; }
    var b1=row(1,"학교·회차"), r1=el("div","hk-bar"); b1.appendChild(r1);
    var sn=el("input"); sn.placeholder="학교명 (예: ○○중학교)"; sn.value=W.school.name||""; sn.style.cssText="font:inherit;font-size:15px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);flex:1 1 200px;max-width:300px;min-width:0"; sn.oninput=function(){ W.school.name=sn.value.trim(); }; r1.appendChild(sn);
    inp(r1,"year",{ph:"학년도",w:"90px"}); r1.appendChild(document.createTextNode("학년도 제")); inp(r1,"term",{ph:"기수",w:"64px"}); r1.appendChild(document.createTextNode("기 · 제")); var noI=inp(r1,"no",{ph:"회차",w:"72px"}); r1.appendChild(document.createTextNode("회"));
    var b2=row(2,"회의 구분"), c2=el("div","cv-chips"); b2.appendChild(c2);
    ["정기회","임시회"].forEach(function(k){ var p=btn(k,"pill",function(){ W.meet.kind=k; c2.querySelectorAll(".pill").forEach(function(x){ x.setAttribute("aria-pressed",x===p?"true":"false"); }); }); p.setAttribute("aria-pressed",(W.meet.kind||"정기회")===k?"true":"false"); c2.appendChild(p); });
    var b3=row(3,"일시·장소"), r3=el("div","hk-bar"); b3.appendChild(r3); inp(r3,"date",{type:"date",w:"170px"}); inp(r3,"time",{type:"time",w:"130px"}); inp(r3,"place",{ph:"장소 (예: 1층 회의실)",w:"240px"});
    var b4=row(4,"기한"), rb=el("div"); b4.appendChild(rb);
    var ft=el("div","cv-ofoot"); pn.appendChild(ft); var mk=btn("목록에 올리기","btn"); ft.appendChild(mk); var mm=el("div","tkmsg"); ft.appendChild(mm);
    function res(){ rb.textContent=""; var d=W.meet.date; if(!d){ rb.appendChild(el("p","cv-law","회의 날짜를 넣으면 공고·통지 기한이 나와요.")); return; }
      var c=el("div","cv-calc"); rb.appendChild(c); var nd=hkDue(d);
      tiles(c,[PRI()?{l:"소집 공고·통지",v:"정관·학교 규정",s:"사립은 법령 기한이 없어요"}:{l:"소집 공고·통지",v:kd(nd)+"까지",s:"회의 7일 전(휴일이면 앞 근무일) · "+ddTxt(dd(nd)),c:dd(nd)<0?"bad":""},{l:"회의",v:fmtDotW(d)+(W.meet.time?" "+fmtTime(W.meet.time):""),s:ddTxt(dd(d))}]); }
    mk.onclick=function(){ if(!trim(W.meet.no)){ noI.focus(); return msg(mm,"회차를 넣어 주세요.","warn"); } if(!W.meet.date) return msg(mm,"회의 날짜를 넣어 주세요.","warn");
      W.meet.kind=W.meet.kind||"정기회"; var id=Date.now(), m={id:id,attKey:"hk."+id,s:W,done:{}}; if(members(W).length) m.done.mem=today();
      MEET.unshift(m); lsSet("hk.meetings",MEET); openMeeting(m); go({v:"m"}); };
    res();
  }

  /* ================= 회의 한 건 ================= */
  /* 회의 날짜로 정해지는 날짜 미리 채우기(직접 고친 값은 그대로) */
  function prevWork(d){ return hkDue(addDays(d,7)); }
  function hkPrefill(){ if(!CUR) return false; var A0=CUR.autoV=CUR.autoV||{}, ch=false;
    function A(path,v){ if(!v) return; var cur=getPath(path)||""; if(cur&&cur!==A0[path]) return; if(cur!==v){ setPath(path,v); ch=true; } A0[path]=v; }
    var d=S.meet.date; A("docs.noticeDate",d?prevWork(addDays(d,-7)):"");   /* 회의 7일 전까지 공고 — 토·공휴일이면 앞 근무일 */
    A("docs.proposeDate",S.docs.noticeDate); A("docs.resultDate",d); return ch; }
  function drawMeet(){
    if(hkPrefill()) save();
    var m=CUR; m.done=m.done||{};
    app.appendChild(btn("← 회의 목록","cv-back",function(){ save(); CUR=null; go({v:"list"}); }));
    var tp=el("div","cv-top"); tp.appendChild(el("h3",null,mTitle(S))); app.appendChild(tp);
    var mt=el("div","cv-meta"); [committee(),S.meet.date?fmtDotW(S.meet.date)+(S.meet.time?" "+fmtTime(S.meet.time):"")+" ("+ddTxt(dd(S.meet.date))+")":"날짜 미정",trim(S.meet.place),agendaList().length?"안건 "+agendaList().length+"건":"",memberCount()?"위원 "+memberCount()+"명":""].filter(Boolean).forEach(function(t){ mt.appendChild(el("span",null,t)); }); app.appendChild(mt);
    var cur=curIdx(m), sel=-1; STG.forEach(function(s,i){ if(s[0]===view.open) sel=i; }); if(sel<0) sel=Math.min(cur,STG.length-1);
    var nv=el("nav","cv-idx"); nv.style.setProperty("--n",STG.length);
    STG.forEach(function(s,i){ var st=m.done[s[0]]?"done":i===cur?"cur":"todo", b=btn("","cv-ix "+st+(i===sel?" sel":""),function(){ view.open=s[0]; draw(); });
      if(i===sel) b.setAttribute("aria-current","step"); b.appendChild(el("span","n",st==="done"?"✓":String(i+1))); b.appendChild(el("span","t",s[1])); nv.appendChild(b); });
    app.appendChild(nv); var pn=el("section","cv-pane"); app.appendChild(pn);
    var s=STG[sel], hd=el("div","cv-ph"); hd.appendChild(el("h4",null,s[2])); var line=headLine(s[0]); if(line) hd.appendChild(el("span",null,line)); pn.appendChild(hd);
    if(cur>=STG.length&&sel===STG.length-1) pn.appendChild(el("div","tkmsg on ok","이 회의는 모두 끝났어요."));
    ST[s[0]](pn);
    var nb=el("div","cv-next"); pn.appendChild(nb);
    if(m.done[s[0]]) nb.appendChild(btn("이 단계 다시 열기","btn ghost",function(){ delete m.done[s[0]]; save(); draw(); }));
    else nb.appendChild(btn(sel<STG.length-1?"이 단계 마쳤어요 · "+STG[sel+1][1]+"(으)로":"모두 마쳤어요","btn",function(){ m.done[s[0]]=today(); view.open=sel<STG.length-1?STG[sel+1][0]:s[0]; save(); draw(); top(); }));
    var pr=el("div","cv-pn"); pn.appendChild(pr);
    pr.appendChild(sel>0?btn("← "+STG[sel-1][1],"cv-back",function(){ view.open=STG[sel-1][0]; draw(); top(); }):el("span"));
    if(sel<STG.length-1) pr.appendChild(btn(STG[sel+1][1]+" →","cv-back",function(){ view.open=STG[sel+1][0]; draw(); top(); }));
    var dz=el("div","cv-next"); dz.style.marginTop="24px"; app.appendChild(dz);
    dz.appendChild(btn("이 회의 지우기","cv-x",function(){ if(!confirm("'"+mTitle(S)+"'를 목록에서 지울까요?")) return; MEET=MEET.filter(function(x){ return x!==m; }); lsSet("hk.meetings",MEET); CUR=null; go({v:"list"}); }));
  }
  function headLine(k){ var d=S.meet.date;
    if(k==="call") return d?(PRI()?"공고·통지 기한은 정관·학교 규정":"공고·통지 "+kd(hkDue(d))+"까지 ("+ddTxt(dd(hkDue(d)))+")"):"";
    if(k==="meet") return d?fmtDotW(d)+(S.meet.time?" "+fmtTime(S.meet.time):"")+" · "+placeStr():"";
    if(k==="res") return S.docs.resultDate?"이송 "+kd(S.docs.resultDate):d&&!PRI()?"이송 "+kd(addDays(d,3))+"까지":"회의 뒤 처리결과를 학교장에게 이송";
    if(k==="ag") return agendaList().length?"안건 "+agendaList().length+"건"+((S.attach||[]).length?" · 원문 "+S.attach.length+"건":""):"";
    if(k==="mem") return memberCount()?"재적 "+memberCount()+"명":""; return ""; }

  /* ---------- 문서 카드 ---------- */
  function docs(pn,step,title){
    var L=docsOfStep(step); sub(pn,title||"문서",L.length+"종 · 보기·한글 저장·인쇄");
    var bar=el("div","hk-bar"); pn.appendChild(bar);
    bar.appendChild(btn("이 단계 문서 한 번에 한글 저장","btn ghost",function(){ saveHwpx(L.map(function(d){ return d.id; }),safeName((trim(S.school.name)||"학교")+"_제"+(S.meet.no||"0")+"회_"+STG.filter(function(x){ return x[0]===(step===4?"call":step===5?"meet":"res"); })[0][1]+"문서")); HK.toast(L.length+"종을 한글 파일 하나로 저장했어요."); }));
    bar.appendChild(btn("한 번에 인쇄·PDF","btn ghost",function(){ printDocs(L.map(function(d){ return d.id; })); }));
    var w=el("div","hk-docs"); pn.appendChild(w);
    L.forEach(function(d){ var box=el("div","hk-doc"), h=el("div","hk-dh"), tx=el("div","tx"); tx.appendChild(el("b",null,d.name+(d.opt?" (필요한 학교만)":""))); tx.appendChild(el("small",null,d.desc)); h.appendChild(tx);
      var bs=el("div","bs"); h.appendChild(bs); box.appendChild(h); var pv=el("div","hk-pv"); pv.hidden=!OPENPV[d.id]; box.appendChild(pv);
      var vb=btn("보기","hk-b",function(){ OPENPV[d.id]=!OPENPV[d.id]; pv.hidden=!OPENPV[d.id]; vb.setAttribute("aria-pressed",OPENPV[d.id]?"true":"false"); if(OPENPV[d.id]) paint(); }); vb.setAttribute("aria-pressed",OPENPV[d.id]?"true":"false");
      function paint(){ pv.innerHTML=""; var inner=el("div"); inner.innerHTML=docPagesHTML(d.build()); pv.appendChild(inner); var wpx=pv.clientWidth-16, z=Math.min(1,wpx/810); inner.style.zoom=z; }
      bs.appendChild(vb); bs.appendChild(btn("한글","hk-b",function(){ saveHwpx([d.id],docFileName(d)); })); bs.appendChild(btn("인쇄","hk-b",function(){ printDocs([d.id]); }));
      if(OPENPV[d.id]) setTimeout(paint,0); w.appendChild(box); });
  }

  var ST={};
  /* 1. 위원 */
  ST.mem=function(pn){
    pn.appendChild(el("p","hk-say","위원 명단은 다음 회의로 그대로 넘어가요. 위원이 바뀌면 여기서만 고치면 돼요. 위원장·부위원장은 이름 옆 단추로 정해요."));
    var c=calc(pn);
    function upd(){ var n=memberCount(), p=S.members.parent.length, t=S.members.teacher.length, l=S.members.local.length, r=function(x,a,b){ return n?(x>=n*a-1e-9&&x<=n*b+1e-9?"ok":"warn"):""; };
      tiles(c,[{l:"재적 위원",v:n+"명",s:"개의 정족수 "+(n?Math.floor(n/2)+1:0)+"명(과반)"},
        {l:"학부모위원",v:p+"명",s:"40~50% ("+(n?Math.round(p/n*100):0)+"%)",c:r(p,.4,.5)},
        {l:"교원위원",v:t+"명",s:"30~40% ("+(n?Math.round(t/n*100):0)+"%)",c:r(t,.3,.4)},
        {l:"지역위원",v:l+"명",s:"10~30% ("+(n?Math.round(l/n*100):0)+"%)",c:r(l,.1,.3)},
        {l:"위원장 · 부위원장",v:(trim(S.staff.chair)||"-")+" · "+(trim(S.staff.vice)||"-"),c:trim(S.staff.chair)?"ok":"warn"}]); }
    var box=el("div"); pn.appendChild(box);
    [["parent","학부모위원"],["teacher","교원위원"],["local","지역위원"]].forEach(function(g){ var r=el("div","hk-grp"), lb=el("b",null,g[1]); r.appendChild(lb); var ch=el("div","hk-chips"); r.appendChild(ch); box.appendChild(r);
      function paint(){ ch.textContent=""; S.members[g[0]].forEach(function(mb,i){ var c0=el("span","hk-chip"); var role=mb.name===trim(S.staff.chair)?"위원장":mb.name===trim(S.staff.vice)?"부위원장":"";
          if(role) c0.appendChild(el("span","r",role)); c0.appendChild(document.createTextNode(mb.name));
          var rb=btn("★","hk-cb",function(){ if(mb.name===trim(S.staff.chair)){ S.staff.chair=""; S.staff.vice=S.staff.vice===mb.name?"":S.staff.vice; } else if(!trim(S.staff.chair)) S.staff.chair=mb.name; else if(mb.name===trim(S.staff.vice)) S.staff.vice=""; else S.staff.vice=mb.name; save(); paintAll(); upd(); });
          rb.title="누르면 위원장 → 부위원장 → 해제"; c0.appendChild(rb);
          c0.appendChild(btn("×","hk-cb",function(){ S.members[g[0]].splice(i,1); if(S.staff.chair===mb.name) S.staff.chair=""; if(S.staff.vice===mb.name) S.staff.vice=""; save(); paintAll(); upd(); })); ch.appendChild(c0); });
        var ai=el("input","hk-addin"); ai.placeholder="+ 이름 넣고 Enter"; ai.onkeydown=function(e){ if(e.key!=="Enter"||e.isComposing) return; e.preventDefault(); var names=ai.value.split(/[,\s]+/).map(trim).filter(Boolean); if(!names.length) return;
          names.forEach(function(nm){ S.members[g[0]].push(newMember(nm)); }); save(); paint(); upd(); ch.querySelector(".hk-addin").focus(); }; ch.appendChild(ai); }
      g.paint=paint; paint(); });
    function paintAll(){ box.querySelectorAll(".hk-grp").forEach(function(){}); draw(); }
    upd();
    sub(pn,"학교·담당자","문서 머리·결재란·발신 정보");
    var g1=grid(pn); fld(g1,"school.name","학교명",{ph:"정식 명칭"}); fld(g1,"school.tel","전화",{ph:"055-000-0000"}); fld(g1,"school.fax","팩스",{ph:"055-000-0000"});
    fld(g1,"school.zip","우편번호"); fld(g1,"school.addr","주소(도로명)",{wide:false}); fld(g1,"school.web","누리집");
    var g2=grid(pn); fld(g2,"staff.manager","담당자(기안자)"); fld(g2,"staff.secretary","간사"); fld(g2,"staff.secTitle","간사 직위",{ph:"행정실장"}); fld(g2,"staff.principal","학교장"); fld(g2,"staff.recorderTitle","회의록 기록자 직급",{ph:"행정실장"});
    law(pn,"근거: 초·중등교육법 시행령 제58조(국·공립학교 운영위원회 위원 구성 비율), 경상남도립학교 운영위원회 운영 조례");
  };
  /* 2. 안건 */
  ST.ag=function(pn){
    pn.appendChild(el("p","hk-say","학교장이 심의를 요청한 안건을 받아요. 부서 안건 한글파일(.hwp·.hwpx)을 불러오면 제목·부서를 읽고, 심의자료에 원문이 안건마다 새 쪽으로 붙어요."));
    var g=grid(pn); fld(g,"docs.submitNo","학교장 심의요청 문서번호",{ph:"예: 교무-1234"}); fld(g,"docs.proposeDate","안건 제안일",{type:"date"});
    sub(pn,"심의 안건",agendaList().length+"건");
    var rows=el("div","hk-rows"); pn.appendChild(rows);
    var fi=el("input"); fi.type="file"; fi.multiple=true; fi.accept=".hwp,.hwpx,.pdf,image/*"; fi.hidden=true; pn.appendChild(fi); var target=-1;
    fi.onchange=function(){ var fs=[].slice.call(fi.files); fi.value=""; if(target<0) return; var k=target, ok=0;
      fs.reduce(function(p,f){ return p.then(function(){ return fileToAttach(f).then(function(a){ a.kind="att"; a.agIdx=k; S.attach.push(a); ok++; },function(e){ HK.toast(f.name+" — "+(e.message||e)); }); }); },Promise.resolve())
        .then(function(){ save(); draw(); if(ok) HK.toast("첨부 "+ok+"건 — 심의자료에서 이 안건 원문 뒤에 붙어요."); }); };
    S.agendas.forEach(function(a,i){ var r=el("div","hk-row hk-ag"); r.appendChild(el("span","n",String(i+1)));
      var no=el("input"); no.placeholder="번호"; no.value=a.no||""; no.oninput=function(){ a.no=no.value.trim(); save(); }; r.appendChild(no);
      var t=el("input"); t.placeholder="안건명"; t.value=a.title||""; t.oninput=function(){ a.title=t.value; save(); }; r.appendChild(t);
      var d=el("input"); d.placeholder="제안부서"; d.setAttribute("list","hkDept"); d.value=a.dept||""; d.oninput=function(){ a.dept=d.value.trim(); save(); }; r.appendChild(d);
      var na=(S.attach||[]).filter(function(x){ return x.kind==="att"&&x.agIdx===i; }).length;
      r.appendChild(btn("📎 첨부"+(na?" "+na:""),"att",function(){ target=i; fi.click(); }));
      r.appendChild(btn("×","x",function(){ var gone=S.agendas[i]; S.agendas.splice(i,1); S.attach=(S.attach||[]).filter(function(x){ if(x.agIdx===i&&x.kind==="att") return false; if(x.agIdx===i) x.agIdx=-1; else if(x.agIdx>i) x.agIdx--; return true; }); save(); draw(); }));
      rows.appendChild(r); });
    var bar=el("div","hk-bar"); pn.appendChild(bar);
    bar.appendChild(btn("+ 안건","hk-add",function(){ S.agendas.push(newAgenda({})); save(); draw(); var ins=rows.parentNode.querySelectorAll(".hk-ag input:nth-child(3)"); }));
    var sn=el("input"); sn.placeholder="시작 번호"; sn.inputMode="numeric"; sn.style.cssText="font:inherit;font-size:13.5px;padding:6px 10px;border:1px solid var(--line-strong);border-radius:8px;width:96px;background:var(--surface);color:var(--ink)"; bar.appendChild(sn);
    bar.appendChild(btn("번호 이어 매기기","btn ghost",function(){ var n=parseInt(sn.value,10); if(!(n>0)){ sn.focus(); return HK.toast("시작 번호를 넣어 주세요 (안건번호는 해마다 이어 매겨요)."); } S.agendas.forEach(function(a,i){ a.no=String(n+i); }); save(); draw(); }));
    sub(pn,"안건 한글파일","부서에서 받은 원문 → 심의자료에 붙음");
    var hb=el("div","hk-bar"); pn.appendChild(hb); var hf=el("input"); hf.type="file"; hf.multiple=true; hf.accept=".hwp,.hwpx"; hf.hidden=true; pn.appendChild(hf);
    var lb=btn("한글파일 불러오기","btn",function(){ hf.click(); }); hb.appendChild(lb);
    hf.onchange=function(){ var fs=[].slice.call(hf.files).filter(function(f){ return /\.hwpx?$/i.test(f.name); }); hf.value=""; if(!fs.length) return; lb.disabled=true; lb.textContent="읽는 중…"; var ok=0;
      fs.reduce(function(p,f){ return p.then(function(){ return hwpFileToAttach(f).then(function(a0){ hwpSplitAttach(a0).forEach(function(a){ autoLink(a); agendaFillSummary(a); S.attach.push(a); ok++; }); },function(e){ HK.toast(f.name+" — "+(e.message||e)); }); }); },Promise.resolve())
        .then(function(){ save(); draw(); if(ok) HK.toast("안건 원문 "+ok+"건을 읽었어요."); }); };
    var L=(S.attach||[]).filter(function(a){ return a.kind!=="att"; });
    if(L.length){ hb.appendChild(btn("읽은 제목·부서를 안건 목록에 채우기","btn ghost",function(){ var add=0, fill=0; S.attach.forEach(function(a){ if(a.kind==="att") return; var g=a.agIdx>=0?S.agendas[a.agIdx]:null;
        if(!g){ S.agendas.push(newAgenda({title:trim(a.title),dept:trim(a.dept),no:trim(a.no),summary:agendaGist(a.blocks)})); a.agIdx=S.agendas.length-1; add++; return; }
        var ch=false; if(!trim(g.title)&&trim(a.title)){ g.title=trim(a.title); ch=true; } if(!trim(g.dept)&&trim(a.dept)){ g.dept=trim(a.dept); ch=true; } if(!trim(g.no)&&trim(a.no)){ g.no=trim(a.no); ch=true; } if(ch) fill++; });
        save(); draw(); HK.toast("새로 추가 "+add+"건 · 빈칸 채움 "+fill+"건"); }));
      var ar=el("div","hk-rows"); pn.appendChild(ar);
      S.attach.forEach(function(a,i){ if(a.kind==="att") return; var r=el("div","hk-row hk-at"); r.appendChild(el("span","fn",a.name));
        var t=el("input"); t.value=a.title||""; t.placeholder="제목"; t.oninput=function(){ a.title=t.value; save(); }; r.appendChild(t);
        var d=el("input"); d.value=a.dept||""; d.placeholder="제안부서"; d.setAttribute("list","hkDept"); d.oninput=function(){ a.dept=d.value.trim(); save(); }; r.appendChild(d);
        var s0=el("select"); var o0=el("option",null,"(안건 연결 안 함)"); o0.value="-1"; s0.appendChild(o0); S.agendas.forEach(function(g,k){ var o=el("option",null,((k+1)+". "+(trim(g.no)?"제"+trim(g.no)+"호 ":"")+(trim(g.title)||"(안건명 없음)")).slice(0,40)); o.value=String(k); s0.appendChild(o); });
        s0.value=String(a.agIdx>=0?a.agIdx:-1); s0.onchange=function(){ a.agIdx=+s0.value; save(); }; r.appendChild(s0);
        r.appendChild(btn("×","x",function(){ S.attach.splice(i,1); save(); draw(); })); ar.appendChild(r); }); }
    law(pn,"그림·머리말·각주는 옮기지 않아요(글과 표만). 그림이 든 안건은 📎 첨부로 PDF·그림을 붙이세요.");
  };
  function autoLink(a){ var used={}; S.attach.forEach(function(x){ if(x.kind!=="att"&&x.agIdx>=0) used[x.agIdx]=1; }); var idx=-1, nt=function(s){ return String(s||"").replace(/[\s·・,.()\[\]【】「」\-:：]/g,"").toLowerCase(); };
    if(trim(a.no)) S.agendas.forEach(function(g,k){ if(idx<0&&!used[k]&&trim(g.no)===trim(a.no)) idx=k; });
    if(idx<0&&trim(a.title)) S.agendas.forEach(function(g,k){ if(idx<0&&!used[k]&&nt(g.title)&&nt(g.title)===nt(a.title)) idx=k; });
    if(idx<0){ var u=new Set(Object.keys(used).map(Number)); idx=attachFuzzyLink(a,u); } a.agIdx=idx; }
  /* 3. 소집 */
  ST.call=function(pn){
    if(PRI()) pn.appendChild(el("p","hk-say","소집 기한은 학교법인 정관과 학교 운영위원회 규정을 따라요. 공고문은 학교 누리집·게시판에, 안내장은 학부모·지역주민 방청 안내로 내보내요.")); else pn.appendChild(el("p","hk-say","회의 7일 전까지 소집을 공고하고 위원에게 알려요. 공고문은 학교 누리집·게시판에, 안내장은 학부모·지역주민 방청 안내로 내보내요."));
    var c=calc(pn);
    function upd(){ var d=S.meet.date, nd=hkDue(d), g=daysBetween(S.docs.noticeDate,d);
      if(PRI()){ tiles(c,[{l:"공고·통지 기한",v:"정관·학교 규정",s:"사립은 법령 기한이 없어요"},{l:"공고일",v:S.docs.noticeDate?kd(S.docs.noticeDate):"-",s:g==null?"":"회의 "+g+"일 전"},{l:"심의 안건",v:agendaList().length+"건",c:agendaList().length?"":"warn"}]); return; }
      tiles(c,[{l:"공고·통지 기한",v:nd?kd(nd)+"까지":"-",s:nd?ddTxt(dd(nd)):"회의 날짜를 넣어 주세요",c:nd&&!S.docs.noticeDate&&dd(nd)<0?"bad":""},
        {l:"공고일",v:S.docs.noticeDate?kd(S.docs.noticeDate):"-",s:g==null?"":"회의 "+g+"일 전"+(g<7?" · 긴급이면 사유 기록":""),c:g==null?"":g>=7?"ok":"warn"},
        {l:"심의 안건",v:agendaList().length+"건",c:agendaList().length?"":"warn"}]); }
    var g0=grid(pn);
    fld(g0,"meet.date","회의 날짜",{type:"date",live:upd,redraw:true}); fld(g0,"meet.time","시간",{type:"time"}); fld(g0,"meet.place","장소",{ph:"1층 회의실 (\"우리학교\" 뒤에 붙어요)"});
    var g=grid(pn); var ndI=fld(g,"docs.noticeDate","공고일",{type:"date",live:upd});
    fld(g,"docs.noticeNo","공고번호",{ph:"예: 10"}); fld(g,"docs.no1","소집 내부기안 문서번호"); fld(g,"docs.no2","참석요청 기안 문서번호"); fld(g,"docs.no4","소집공고 기안 문서번호",{hint:"필요한 학교만"});
    var pv=prevMeeting(CUR), nb=el("div","hk-bar"); pn.appendChild(nb);
    nb.appendChild(btn("문서번호 이어 매기기","btn ghost",function(){ var o=pv?nextNums(pv.s,S):{};
      if(!pv||!Object.keys(o).length){ var b=prompt("이번 회의 운영위 문서번호의 앞 번호를 넣어 주세요 (예: 113 → 113-1, 113-2 …)",""); b=trim(b||""); if(!/^\d+$/.test(b)) return; ["no1","no2","no3","no4"].forEach(function(k,i){ o[k]=b+"-"+(i+1); }); }
      Object.keys(o).forEach(function(k){ S.docs[k]=o[k]; }); save(); draw(); HK.toast("문서번호를 "+(pv?mTitle(pv.s)+"에서 ":"")+"이어 매겼어요."); }));
    nb.appendChild(el("small","cv-law",pv?"지난 회의("+mTitle(pv.s)+") 번호 다음으로: 공고번호 +1(같은 학년도), 운영위 문서번호 앞 번호 +1":"지난 회의가 없으면 앞 번호를 물어봐요"));
    upd();
    if(!PRI()) pn.appendChild(el("p","cv-law","긴급한 사유가 있으면 7일 전을 지키지 않아도 돼요. 그래도 소집 공고와 위원 통지는 빠뜨릴 수 없어요. (초·중등교육법 시행령 제59조의2②)"));
    sub(pn,"근거 문구","소집 기안문·공고문에 들어가요");
    var g2=grid(pn); fld(g2,"opts.ordinance","근거 조례"); fld(g2,"opts.article","소집 근거 조항"); fld(g2,"opts.article2","공고문 근거 조항"); fld(g2,"opts.refLine","참고사항 (공고문·안내장)",{wide:true});
    docs(pn,4,"소집 문서");
    law(pn,PRI()?"사립학교: 초·중등교육법 제34조②, 시행령 제63조 — 소집은 학교법인 정관·학교 운영위원회 규정. 근거 문구 칸은 학교 규정에 맞게 고쳐 주세요.":"근거: 경상남도립학교 운영위원회 운영 조례(제5815호, 2025. 1. 31.) 제19조(회의소집 등), 경남 학교운영위원회 규정(예시) — 개최 7일 전 소집 공고·개별 통지");
  };
  /* 4. 회의 */
  ST.meet=function(pn){
    pn.appendChild(el("p","hk-say","회의 당일 등록부로 출석을 받고 시나리오대로 진행해요. 출석하지 않은 위원은 눌러서 빼면 시나리오·회의록의 출석 인원에 들어가요."));
    var c=calc(pn);
    function upd(){ var n=memberCount(), a=attendCount(), q=Math.floor(n/2)+1;
      tiles(c,[{l:"출석",v:a+" / "+n+"명",c:n?(a>=q?"ok":"bad"):""},{l:"개의 정족수",v:q+"명",s:"재적 과반 출석"},{l:"의결 정족수",v:(Math.floor(a/2)+1)+"명",s:"출석 과반 찬성"}]); }
    var at=el("div","hk-att"); pn.appendChild(at);
    members(S).forEach(function(mb){ var lb=el("label",mb.attend?"":"off"), cb=el("input"); cb.type="checkbox"; cb.checked=mb.attend!==false;
      cb.onchange=function(){ mb.attend=cb.checked; lb.className=cb.checked?"":"off"; S.minutes.attConfirmed=true; save(); upd(); }; lb.appendChild(cb); lb.appendChild(document.createTextNode(mb.name)); at.appendChild(lb); });
    var bar=el("div","hk-bar"); pn.appendChild(bar);
    bar.appendChild(btn("전원 출석","btn ghost",function(){ members(S).forEach(function(x){ x.attend=true; }); S.minutes.attConfirmed=true; save(); draw(); }));
    upd();
    var g=grid(pn); fld(g,"minutes.staffAttend","출석 교직원",{ph:"예: 교감 ○○○, 교무부장 ○○○",wide:true});
    docs(pn,5,"회의 문서");
    law(pn,PRI()?"사립학교: 정족수는 학교법인 정관·학교 운영위원회 규정을 따라요. 위 정족수는 과반 기준 예시예요.":"근거: 경상남도립학교 운영위원회 운영 조례 — 회의는 재적위원 과반수 출석으로 열고 출석위원 과반수 찬성으로 의결");
  };
  /* 5. 결과 */
  ST.res=function(pn){
    pn.appendChild(el("p","hk-say","안건마다 처리결과와 표결결과를 확정하면 회의록·처리상황표·이송 기안문에 그대로 들어가요. 처리결과는 학교장에게 이송하고 회의록은 누리집에 공개해요."));
    var d3=S.meet.date?addDays(S.meet.date,3):""; if(PRI()) pn.appendChild(el("p","cv-law","사립학교: 심의 결과는 학교장이 최대한 존중해요(시행령 제63조③). 이송 기한·회의록 공개는 학교 운영위원회 규정을 따라요.")); else { var rc=calc(pn); tiles(rc,[{l:"학교장 이송 기한",v:d3?kd(d3)+"까지":"-",s:d3?"의결한 날부터 3일 이내 · "+ddTxt(dd(d3)):"회의 날짜를 넣어 주세요"}]); }
    var g=grid(pn); fld(g,"docs.resultDate","처리(이송)일",{type:"date"}); fld(g,"docs.no3","처리결과 이송 문서번호");

    sub(pn,"안건별 결과");
    var rows=el("div","hk-rows"); pn.appendChild(rows);
    agendaList().forEach(function(a){ var r=el("div","hk-row hk-rs"); r.appendChild(el("span","tt",(trim(a.no)?"제"+trim(a.no)+"호 ":"")+trim(a.title)));
      var s0=el("select"); RESULTS.forEach(function(v){ var o=el("option",null,v); o.value=v; s0.appendChild(o); }); s0.value=a.result||"원안가결"; s0.onchange=function(){ a.result=s0.value; save(); }; r.appendChild(s0);
      var v0=el("input"); v0.setAttribute("list","hkVote"); v0.value=a.vote||""; v0.placeholder="표결결과"; v0.oninput=function(){ a.vote=v0.value.trim(); save(); }; r.appendChild(v0); rows.appendChild(r); });
    if(!agendaList().length) rows.appendChild(el("p","tkempty","안건 단계에서 안건을 먼저 넣어 주세요."));
    var bar=el("div","hk-bar"); pn.appendChild(bar);
    bar.appendChild(btn("전부 원안가결 · 전원찬성","btn ghost",function(){ S.agendas.forEach(function(a){ a.result="원안가결"; a.vote="전원찬성"; }); save(); draw(); }));
    sub(pn,"회의록에 넣을 말","비우면 기본 문구");
    var g2=grid(pn); fld(g2,"minutes.openRemark","위원장 개회사 요지",{wide:true}); fld(g2,"minutes.principalRemark","학교장 인사말씀 요지",{wide:true}); fld(g2,"minutes.others","기타 협의 내용",{wide:true});
    docs(pn,6,"결과 문서");
    sub(pn,"누리집 공개용 회의록","위원·교직원 이름을 김○○처럼 가려요");
    var pb=el("div","hk-bar"); pn.appendChild(pb);
    function masked(fn){ var keep={m:JSON.stringify(S.members),st:JSON.stringify(S.staff),sa:S.minutes.staffAttend};
      members(S).forEach(function(x){ x.name=maskName(x.name); }); ["chair","vice","principal","manager","secretary"].forEach(function(k){ S.staff[k]=maskName(S.staff[k]); });
      S.minutes.staffAttend=String(S.minutes.staffAttend||"").replace(/([가-힣])[가-힣]{1,3}(?=\s*(,|$))/g,"$1○○");
      try{ fn(); } finally { S.members=JSON.parse(keep.m); S.staff=JSON.parse(keep.st); S.minutes.staffAttend=keep.sa; } }
    pb.appendChild(btn("공개용 한글 저장","btn ghost",function(){ var d=docById("c1"); masked(function(){ saveHwpx(["c1"],docFileName(d)+"_공개용"); }); }));
    pb.appendChild(btn("공개용 인쇄·PDF","btn ghost",function(){ masked(function(){ printDocs(["c1"]); }); }));
    law(pn,PRI()?"사립학교: 초·중등교육법 시행령 제63조③(심의 결과 최대한 존중), 사립학교법 제29조④·제31조③(예산·결산은 학운위 심의 뒤 이사회 의결). 회의록 공개는 법령 의무가 아니고 학교 규정을 따라요.":"근거: 학교운영위원회 규정(예시) 제26조(심의결과의 통보 — 의결된 날부터 3일 이내 학교장에게 이송), 제23조②(회의록 누리집 공개)");
  };

  if(view.v==="list"&&MEET.length===1&&curIdx(MEET[0])<STG.length){ /* 장부부터 보여 준다 */ }
  draw();
}
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.hk=build;
})();
