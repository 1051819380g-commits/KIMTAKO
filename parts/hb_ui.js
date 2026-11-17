/* ======================================================================
   호봉 획정·정산 — 경남 기준으로 다시 만든 화면 (호봉책정 + 호봉정정 급여정산을 하나로)
   한 사람 = 장부 한 줄. 서류 → 경력 → 호봉 → 정정 → 정산을 좌→우로 따라간다.
   계산은 길잡이 원본 엔진을 그대로 쓴다(make_hb.py가 앞에 끼워 넣음)
   - window.TKHB_H : HOBONG(초임호봉 계산), READER(서류 글 읽기), RATETABLE(경력 환산율표)
   - window.TKHB_E : ENGINE(나이스 급여 파일 읽기·정당 호봉 줄·월별 정산), 봉급표 2010~2026 내장
   기준: 공무원보수규정 별표 22(교원 초임호봉 획정), 별표 11(교원 봉급표), 별표 3(일반직 봉급표),
        교육공무원 호봉획정시 경력환산율표의 적용 등에 관한 예규
   저장: hb.cases (이 브라우저 안). 주민등록번호·생년월일·주소는 읽으면서 지운다.
   ====================================================================== */
(function(){ "use strict";
var H=window.TKHB_H||{}, E=window.TKHB_E||{}, HOBONG=H.HOBONG, READER=H.READER, RATES=H.RATETABLE;
/* 공무원보수규정 별표22(2025. 1. 3. 개정)·호봉획정 예규 제97호에 있는데 원본 표에 없던 경력 */
(function(){ var L=RATES&&RATES.목록; if(!L||L.__add) return; L.__add=1; function has(t){ return L.some(function(x){ return x.t===t; }); }
  [{g:"교원경력",t:"장애영유아 어린이집 보육교직원 (특수학교 교원 자격, 유치원 과정 제외)",r:80,b:"별표22 1-바",k:"장애영유아 어린이집 장애아 특수 보육교직원 보육교사"},
   {g:"유사경력 · 강사",t:"대학 시간강사 (고등교육법 제17조)",r:30,b:"별표22 3-가-3)",k:"대학 시간강사 대학강사 전문대학 강의",w:"주당 강의시간에 비례해 30~100%예요(예규 별표1 3-가, 최소 30%). 시간에 맞춰 조정하세요."},
   {g:"유사경력 · 그 밖의 경력",t:"병역법 대체복무 (산업기능요원·전문연구요원·예술체육요원·승선근무예비역)",r:100,b:"별표22 3-라-1)",k:"산업기능요원 전문연구요원 예술체육요원 승선근무예비역 병역특례 대체복무"},
   {g:"유사경력 · 그 밖의 경력",t:"장애인복지관 근무 (특수학교 교원 자격)",r:80,b:"별표22 3-라-2)",k:"장애인복지관 장애인 재활시설 지역사회재활시설 복지관"}].forEach(function(x){ if(!has(x.t)) L.push(x); });
  L.forEach(function(x){ if(/^강사 \(주 20시간\)/.test(x.t)) x.w="2012. 3. 1. 이후 기준(주 40시간)이에요. 주당 시간을 넣으면 기간별 기준시간(44·43·42·40시간)으로 계산해요."; else if(/^강사 \(전일제/.test(x.t)) x.w="1일 8시간 이상 전일제는 10할이에요."; }); })();
function el(t,c,x){ var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e; }
function lsGet(k,d){ try{ var v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } }
function lsSet(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function pad(n){ return (n<10?"0":"")+n; }
function iso(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function today(){ return iso(new Date()); }
function kd(s){ return s?String(s).replace(/^(\d{4})-(\d{2})-(\d{2})$/,function(_,y,m,d){ return y+". "+(+m)+". "+(+d)+"."; }):""; }
function won(n){ n=Math.round(n||0); return (n<0?"−":"")+Math.abs(n).toLocaleString("ko-KR")+"원"; }
function wonS(n){ n=Math.round(n||0); return (n>0?"+":n<0?"−":"")+Math.abs(n).toLocaleString("ko-KR"); }
function ymd(o){ return o?(HOBONG&&HOBONG.ymd?HOBONG.ymd(o):(o.y||0)+"년 "+(o.m||0)+"월 "+(o.d||0)+"일"):""; }
function ymK(s){ var m=/^(\d{4})-(\d{2})/.exec(s||""); return m?E.ymKey(+m[1],+m[2]):null; }
function kToMonth(k){ return Math.floor(k/100)+"-"+pad(k%100); }
var TK=function(){ return window.TKCV||{}; };
function saveFile(b,n){ var f=TK().saveFile; return f?f(b,n):Promise.resolve(); }

/* ---------- 바깥 도구(필요할 때만 불러옴) ---------- */
var LIB={};
function loadJs(urls){ return urls.reduce(function(p,u){ return p.catch(function(){ return new Promise(function(ok,no){ var s=document.createElement("script"); s.src=u; s.onload=ok; s.onerror=function(){ s.remove(); no(new Error("불러오기 실패")); }; document.head.appendChild(s); }); }); },Promise.reject()); }
function needXLSX(){ if(window.XLSX) return Promise.resolve(); return LIB.x||(LIB.x=loadJs(["https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js","https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"]).catch(function(){ LIB.x=null; throw new Error("엑셀 읽기 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."); })); }
function needPDF(){ if(window.pdfjsLib) return Promise.resolve(); return LIB.p||(LIB.p=loadJs(["https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js","https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"])
  .then(function(){ return loadJs(["https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js","https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js"]).catch(function(){}); })
  .then(function(){ try{ pdfjsLib.GlobalWorkerOptions.workerSrc=""; }catch(e){} }).catch(function(){ LIB.p=null; throw new Error("PDF 읽기 도구를 불러오지 못했어요."); })); }
var OCRW=null;
function ocr(canvas,say){ var p=window.Tesseract?Promise.resolve():(LIB.t||(LIB.t=loadJs(["https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js","https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js"])));
  return p.then(function(){ if(OCRW) return OCRW; say&&say("글자 인식 준비 중… (처음 한 번은 20~30초 걸려요)"); return OCRW=Tesseract.createWorker("kor+eng").then(function(w){ return w.setParameters({tessedit_pageseg_mode:"6"}).then(function(){ return w; }); }); })
    .then(function(w){ return w.recognize(binar(canvas,150)); }).then(function(r){ return r.data.text||""; })
    .catch(function(e){ OCRW=null; var m=String(e&&e.message||e); throw new Error(/Worker|blob|origin|Security/i.test(m)?"이 창에서는 글자 인식이 막혀 있어요. 주소를 크롬·엣지에서 직접 열어 주세요.":"글자 인식을 하지 못했어요: "+m); }); }
function binar(src,th){ var c=document.createElement("canvas"); c.width=src.width; c.height=src.height; var x=c.getContext("2d"); x.drawImage(src,0,0); var d=x.getImageData(0,0,c.width,c.height), a=d.data;
  for(var i=0;i<a.length;i+=4){ var v=.3*a[i]+.59*a[i+1]+.11*a[i+2]<th?0:255; a[i]=a[i+1]=a[i+2]=v; a[i+3]=255; } x.putImageData(d,0,0); return c; }
/* 파일 한 개 → 쪽마다 글(필요하면 글자 인식) */
function filePages(f,each,say){
  if(/\.xlsx?$/i.test(f.name)) return needXLSX().then(function(){ return f.arrayBuffer(); }).then(function(b){ var wb=XLSX.read(b,{type:"array"}); return each(wb.SheetNames.map(function(n){ return XLSX.utils.sheet_to_csv(wb.Sheets[n],{FS:" "}); }).join("\n"),1,1); });
  if(/\.pdf$/i.test(f.name)) return needPDF().then(function(){ return f.arrayBuffer(); }).then(function(b){ try{ pdfjsLib.PDFWorkerUtil.isWorkerDisabled=true; }catch(e){}
    return pdfjsLib.getDocument({data:b,isEvalSupported:false}).promise; }).then(function(doc){ var n=Math.min(doc.numPages,40), i=0;
      function next(){ if(++i>n) return; return doc.getPage(i).then(function(pg){ return pg.getTextContent().then(function(tc){ var t=tc.items.map(function(x){ return x.str+(x.hasEOL?"\n":" "); }).join("");
        if(t.replace(/\s/g,"").length>=40) return each(t,i,n);
        var v=pg.getViewport({scale:1}), vp=pg.getViewport({scale:Math.min(2900/v.width,3.6)}), c=document.createElement("canvas"); c.width=vp.width; c.height=vp.height;
        return pg.render({canvasContext:c.getContext("2d"),viewport:vp}).promise.then(function(){ say&&say(f.name+" "+i+"/"+n+"쪽 글자 인식 중…"); return ocr(c,say); }).then(function(o){ c.width=c.height=0; return each(t+"\n"+o,i,n); }); }); }).then(next); }
      return next(); });
  return new Promise(function(ok,no){ var u=URL.createObjectURL(f), im=new Image(); im.onload=function(){ ok(im); }; im.onerror=function(){ no(new Error("그림을 열 수 없어요.")); }; im.src=u; }).then(function(im){
    var s=Math.max(1,Math.min(2900/im.width,4)), c=document.createElement("canvas"); c.width=im.width*s; c.height=im.height*s; c.getContext("2d").drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(im.src);
    say&&say(f.name+" 글자 인식 중…"); return ocr(c,say).then(function(o){ c.width=c.height=0; return each(o,1,1); }); });
}

var STG=[["doc","서류","서류 올리기"],["car","경력","자격·학력·경력"],["hob","호봉","호봉 확정"],["fix","정정","급여 파일·정당 호봉"],["pay","정산","월별 정산"]];
var KIND={T:"교원",K:"기간제 교원",G:"지방 일반직"};
var CASES=null;
function loadCases(){ CASES=lsGet("hb.cases",null); if(!Array.isArray(CASES)) CASES=[]; }
function newCase(){ return {id:Date.now(),name:"",q:"",edu:"",add:"0",asof:"",rows:[],warn:[],dec:null,done:{},
  pay:{files:{},kind:"T",grade:"9",start:"",end:"",mode:"A",h:"",rm:"",rd:"",auto:true,shift:"",addH:"",tl:[],tlEdited:false,ov:{}}}; }
function curIdx(c){ for(var i=0;i<STG.length;i++) if(!c.done[STG[i][0]]) return i; return STG.length; }
function calc0(c){ if(!HOBONG||!c.q) return null; try{ return HOBONG.계산({경력:c.rows.map(function(r){ return {시작:r.s,종료:r.e,환산율:r.r===""||r.r==null?NaN:+r.r,제외:!!r.x}; }),자격:c.q,학력:c.edu,가산연수:+c.add||0,획정일:c.asof,양편넣기:true}); }catch(e){ return null; } }
/* 엔진 결과 바로잡기(엔진 글자는 그대로 두고 여기서 다시 셈):
   ① 월력 계산: 기산일 전날에 해당하는 날이 없으면 그 달 말일까지를 1월(예: 1.31~2.28 = 1월) — 2026 중등교감업무도움자료(경남) 경력기간 계산
   ② 경력과 경력이 겹치면 유리한 경력 하나만 — 공무원보수규정 제8조②, 호봉획정 예규(제97호) Ⅱ.1. 같은 기간 여러 학교 시간강사는 겹침이 아니라 강의시간 합산 */
function hbD(s){ var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||""); return m?Date.UTC(+m[1],+m[2]-1,+m[3])/864e5:null; }
function hbS(n){ var d=new Date(n*864e5); return d.getUTCFullYear()+"-"+pad(d.getUTCMonth()+1)+"-"+pad(d.getUTCDate()); }
function hbSpan(a,b){   /* a~b(양편넣기) → 30일 단위 일수 */
  var s=new Date(a*864e5), y=s.getUTCFullYear(), mo=s.getUTCMonth(), dd=s.getUTCDate(), k=0;
  function endK(k){ var t=mo+k, Y=y+Math.floor(t/12), M=((t%12)+12)%12, last=new Date(Date.UTC(Y,M+1,0)).getUTCDate();
    return dd>last?Date.UTC(Y,M,last)/864e5:Date.UTC(Y,M,dd)/864e5-1; }
  while(endK(k+1)<=b) k++;
  return k*30+(b-(k?endK(k):a-1)); }
function hbU(u){ return {y:Math.floor(u/360),m:Math.floor(u%360/30),d:u%30}; }
/* 강사 기준시간(예규 별표1 3.가): ~2005. 2. 28. 44시간, ~2006. 2. 28. 43시간, ~2012. 2. 29. 42시간, 2012. 3. 1.부터 40시간 */
var HB_KB=[[hbD("2005-03-01"),44],[hbD("2006-03-01"),43],[hbD("2012-03-01"),42],[1e9,40]];
function hbBase(n){ for(var i=0;i<HB_KB.length;i++) if(n<HB_KB[i][0]) return HB_KB[i][1]; return 40; }
function hbKr(h,n){ h=+h; if(!(h>0)) return 30; var b=hbBase(n); return h<=12?30:h>=b?100:Math.floor(h/b*1000)/10; }   /* 12시간 이하·불명확 3할, 전일제 10할 */
function hbKang(w){ return /강사/.test(w.t||""); }
function hbHas(w){ return hbKang(w)&&+w.h>0; }
function calc(c){ var r=calc0(c); if(!r||!r.rows) return r;
  var ok=[], kh=[], changed=false;
  r.rows.forEach(function(q,i){ var w=c.rows[i]||{}, a=hbD(w.s), b=hbD(w.e), rt=w.r===""||w.r==null?NaN:+w.r;
    if(w.x||q.오류||a==null||b==null||b<a) return;
    if(hbHas(w)){ kh.push({i:i,a:a,b:b,h:+w.h}); return; }
    if(!isNaN(rt)) ok.push({i:i,a:a,b:b,rt:rt,kang:hbKang(w)}); });
  /* 주당 시간을 넣은 강사 경력: 같은 기간 여러 학교 강의시간은 합산해 기준시간으로 나눔(예규 제97호 예시 6+10+6=22시간 ÷ 42시간). 기준시간이 바뀌는 날에서도 나눔 */
  var hsum=[];
  if(kh.length){ var cut={}; kh.forEach(function(k){ cut[k.a]=1; cut[k.b+1]=1; }); HB_KB.forEach(function(x){ if(x[0]<1e9) cut[x[0]]=1; });
    var pts=Object.keys(cut).map(Number).sort(function(x,y){ return x-y; });
    for(var z=0;z<pts.length-1;z++){ var a=pts[z], b=pts[z+1]-1, cov=kh.filter(function(k){ return k.a<=a&&k.b>=b; }); if(!cov.length) continue;
      var H=cov.reduce(function(t,k){ return t+k.h; },0), rt=hbKr(H,a);
      if(cov.length>1||rt!==hbKr(cov[0].h,kh.filter(function(k){ return k.i===cov[0].i; })[0].a)) changed=true;
      if(cov.length>1) hsum.push({a:a,b:b,H:H,base:hbBase(a),rt:rt,rows:cov.map(function(k){ return k.i; })});
      var last=ok[ok.length-1]; if(last&&last.kh&&last.i===cov[0].i&&last.rt===rt&&last.b===a-1) last.b=b; else ok.push({i:cov[0].i,a:a,b:b,rt:rt,kang:true,kh:true}); } }
  /* 경력과 경력이 겹치면 유리한 경력 하나만(공무원보수규정 제8조②): 겹친 구간은 인정 기간(기간 × 환산율 — 시간제는 시간 비율이 환산율에 들어감)이 긴 쪽 */
  var order=ok.slice().sort(function(x,y){ return y.rt-x.rt||x.i-y.i; }), done=[];
  order.forEach(function(o){ var segs=[[o.a,o.b]];
    done.forEach(function(p){ if(o.kang&&p.kang) return; var nx=[]; segs.forEach(function(g){ if(p.b<g[0]||p.a>g[1]){ nx.push(g); return; } changed=true; if(g[0]<p.a) nx.push([g[0],p.a-1]); if(g[1]>p.b) nx.push([p.b+1,g[1]]); }); segs=nx; });
    o.u=segs.reduce(function(t,g){ return t+hbSpan(g[0],g[1]); },0); o.cv=o.u*o.rt/100; done.push(o); });
  var per={}; ok.forEach(function(o){ var x=per[o.i]=per[o.i]||{u:0,cv:0}; x.u+=o.u; x.cv+=o.cv; });
  Object.keys(per).forEach(function(i){ var x=per[i], q=r.rows[i]; x.cu=Math.floor(x.cv+1e-9); if(x.u!==(q.기간.y*360+q.기간.m*30+q.기간.d)||x.cu!==q.환산단위) changed=true; });
  kh.forEach(function(k){ if(!per[k.i]){ per[k.i]={u:0,cv:0,cu:0}; changed=true; } });
  r.강사합산=hsum;
  if(!changed) return r;
  var tot=0, raw=0; Object.keys(per).forEach(function(i){ var x=per[i], q=r.rows[i]; q.기간=hbU(x.u); q.환산=hbU(x.cu); q.환산단위=x.cu; tot+=x.cu; raw+=x.u; });
  r.rows.forEach(function(q,i){ if(!per[i]) tot+=q.환산단위||0; });
  /* 합계는 엔진에 같은 일수의 100% 경력을 넣어 호봉·잔여·차기승급일을 엔진 규칙 그대로 받는다 */
  var k=Math.floor(tot/30), d=tot%30, rows=[];
  if(k) rows.push({시작:"1900-01-01",종료:hbS(Date.UTC(1900,k,1)/864e5-1),환산율:100,제외:false});
  if(d) rows.push({시작:"1950-01-01",종료:"1950-01-"+pad(d),환산율:100,제외:false});
  try{ var t=HOBONG.계산({경력:rows,자격:c.q,학력:c.edu,가산연수:+c.add||0,획정일:c.asof,양편넣기:true});
    r.총경력=hbU(raw+r.rows.reduce(function(x,q,i){ return x+(per[i]||(c.rows[i]||{}).x||!q.기간?0:q.기간.y*360+q.기간.m*30+q.기간.d); },0)); r.환산경력=t.환산경력; r.호봉=t.호봉; r.잔여=t.잔여; r.차기승급일=t.차기승급일; r.고침=true; }catch(e){}
  return r; }
function cTitle(c){ return (c.name||"이름 없음")+(c.q?" · "+c.q.replace(/\s*등\(.*\)$/,""):""); }

var CSS=[
".hbv .hb-say{font-size:14px;color:var(--ink-2);margin:0 0 10px;line-height:1.6}",
".hb-sub{font-size:13.5px;font-weight:700;margin:18px 0 8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
".hb-sub small{font-weight:400;color:var(--muted);font-size:12.5px}",
".hb-drop{border:2px dashed var(--line-strong);border-radius:14px;padding:22px 16px;text-align:center;background:var(--surface-2);cursor:pointer;transition:border-color .15s}",
".hb-drop.over{border-color:var(--accent);background:var(--accent-soft)}",
".hb-drop b{display:block;font-size:15.5px;margin-bottom:4px}",
".hb-drop small{color:var(--muted);font-size:13px;line-height:1.5;display:block}",
".hb-prog{height:6px;background:var(--surface-2);border-radius:4px;overflow:hidden;margin:10px 0 4px}",
".hb-prog i{display:block;height:100%;width:0;background:var(--accent);transition:width .2s}",
".hb-read{font-size:13px;color:var(--ink-2);margin:6px 0;line-height:1.55}",
".hb-got{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}",
".hb-got span{font-size:13px;border-radius:999px;padding:4px 10px;background:var(--surface-2);border:1px solid var(--line)}",
".hb-got span b{font-weight:700;margin-right:4px}",
".hb-note{font-size:13px;line-height:1.55;border-left:3px solid var(--warn);padding:6px 10px;margin:6px 0;background:var(--surface-2);border-radius:0 8px 8px 0}",
".hb-rows{display:grid;gap:8px}",
".hb-row{background:var(--surface-2);border-radius:12px;padding:8px 10px;display:grid;gap:6px}",
".hb-row.off{opacity:.6}",
".hb-r1{display:grid;grid-template-columns:24px 1.3fr 1fr 140px 140px 28px;gap:6px;align-items:center}",
".hb-r2{display:grid;grid-template-columns:24px minmax(0,1fr) 100px;gap:6px;align-items:center}",
".hb-r2>.lx{grid-column:2/-1}",
".hb-row input,.hb-row select{font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box}",
".hb-row input[type=checkbox]{width:auto;margin:0}",
".hb-row .n{font-size:12.5px;color:var(--muted);text-align:center}",
".hb-row .x{font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;padding:2px 6px}",
".hb-row .x:hover{color:var(--neg)}",
".hb-row .rt{display:flex;align-items:center;gap:4px;font-size:13px;color:var(--muted)}",
".hb-row .lx{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink-2);white-space:nowrap;flex-wrap:wrap}",
".hb-row .lx b{color:var(--ink);font-weight:700}",
".hb-sug{display:flex;flex-wrap:wrap;gap:6px;padding-left:30px}",
".hb-sug button{font:inherit;font-size:12.5px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink-2);border-radius:999px;padding:3px 10px;cursor:pointer}",
".hb-sug button:hover{border-color:var(--accent);color:var(--accent-ink)}",
".hb-w{padding-left:30px;font-size:12.5px;color:var(--warn)}",
".hb-add{font:inherit;font-size:13.5px;border:1px dashed var(--line-strong);background:none;color:var(--accent-ink);border-radius:10px;padding:7px 12px;cursor:pointer}",
".hb-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}",
".hb-eq{font-size:14.5px;line-height:1.7;background:var(--surface-2);border-radius:12px;padding:12px 14px;margin:10px 0}",
".hb-eq b{font-size:16px}",
".hb-tw{overflow-x:auto;margin:8px 0;border:1px solid var(--line);border-radius:10px}",
".hb-t{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}",
".hb-t th,.hb-t td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}",
".hb-t th{background:var(--surface-2);font-weight:700;font-size:12.5px;color:var(--ink-2)}",
".hb-t td.r,.hb-t th.r{text-align:right}",
".hb-t tr.flag td{background:color-mix(in srgb,var(--warn) 10%,transparent)}",
".hb-t .p{color:var(--pos);font-weight:700}.hb-t .m{color:var(--neg);font-weight:700}.hb-t .z{color:var(--muted)}",
".hb-t small{display:block;color:var(--muted);font-size:11.5px}",
".hb-t select,.hb-t input{font:inherit;font-size:13px;padding:3px 6px;border:1px solid var(--line-strong);border-radius:6px;background:var(--surface);color:var(--ink)}",
".hb-t input[type=number]{width:70px}",
".hb-pick{display:flex;flex-wrap:wrap;gap:6px}",
"#hbPrint{display:none}",
"@media print{@page{size:A4;margin:15mm} body.hb-printing>*:not(#hbPrint){display:none!important} body.hb-printing{background:#fff!important} body.hb-printing #hbPrint{display:block;color:#000;font-size:10.5pt}",
"  #hbPrint h1{font-size:16pt;text-align:center;margin:0 0 8mm} #hbPrint table{border-collapse:collapse;width:100%;margin:0 0 5mm} #hbPrint th,#hbPrint td{border:1px solid #444;padding:1.2mm 2mm;font-size:9.5pt} #hbPrint th{background:#eee} #hbPrint .r{text-align:right} #hbPrint p{margin:2mm 0}}",
"@media (max-width:640px){.hb-r1{grid-template-columns:24px 1fr 28px}.hb-r1>.x{grid-row:1;grid-column:3}.hb-r1>:nth-child(n+3):not(.x){grid-column:1/-1}",
"  .hb-t .it{display:none}.hb-tw{overflow:visible}.hb-t th,.hb-t td{white-space:normal}.hbv .cv-calc{grid-template-columns:1fr 1fr}",
"  .hb-r2{grid-template-columns:1fr 90px}.hb-r2>.n{display:none}.hb-r2>.lx{grid-column:1/-1}.hb-sug,.hb-w{padding-left:0}}"
].join("\n");

function build(root){
  if(!document.getElementById("cv-css")&&TK().CSS){ var a=el("style"); a.id="cv-css"; a.textContent=TK().CSS; document.head.appendChild(a); }
  if(!document.getElementById("hb-css")){ var b=el("style"); b.id="hb-css"; b.textContent=CSS; document.head.appendChild(b); }
  loadCases();
  var view={v:"list"}, C=null;
  root.textContent=""; var app=el("div","cv hbv"); root.appendChild(app);
  function btn(t,cls,fn){ var x=el("button",cls||"btn",t); x.type="button"; if(fn) x.onclick=fn; return x; }
  function msg(box,t,kind){ box.textContent=t||""; box.className="tkmsg"+(t?" on "+(kind||"ok"):""); }
  function save(){ if(C){ C.at=today(); } if(!lsSet("hb.cases",CASES)) toast("브라우저 저장 공간이 부족해요. 끝난 사람은 목록에서 지워 주세요."); }
  var toastEl=el("div","hk-toast"); toastEl.style.cssText="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:var(--surface);padding:10px 16px;border-radius:10px;font-size:14px;z-index:9999;max-width:min(560px,calc(100vw - 32px));opacity:0;pointer-events:none;transition:opacity .2s";
  document.body.appendChild(toastEl); var tT; function toast(m){ toastEl.textContent=m; toastEl.style.opacity="1"; clearTimeout(tT); tT=setTimeout(function(){ toastEl.style.opacity="0"; },3200); }
  function go(v){ view=v; draw(); top(); }
  function top(){ var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function draw(){ app.textContent=""; if(view.v==="c"&&C) drawCase(); else drawList(); }
  function tiles(box,items){ box.textContent=""; items.forEach(function(x){ if(!x) return; var d=el("div","cv-num "+(x.c||"")); d.appendChild(el("span",null,x.l)); d.appendChild(el("b",null,x.v)); if(x.s) d.appendChild(el("small",null,x.s)); box.appendChild(d); }); }
  function sub(pn,t,s){ var h=el("div","hb-sub",t); if(s) h.appendChild(el("small",null,s)); pn.appendChild(h); return h; }
  function law(pn,t){ pn.appendChild(el("p","cv-law",t)); }
  function grid(pn){ var g=el("div","tkgridf"); pn.appendChild(g); return g; }
  function fld(g,label,val,on,o){ o=o||{}; var f=el("label","tkf"+(o.wide?" wide":"")); f.appendChild(el("span","tkfl",label)); var i;
    if(o.sel){ i=el("select"); o.sel.forEach(function(v){ var op=el("option",null,Array.isArray(v)?v[1]:v); op.value=Array.isArray(v)?v[0]:v; i.appendChild(op); }); }
    else { i=el("input"); i.type=o.type||"text"; if(o.ph) i.placeholder=o.ph; if(o.min!=null) i.min=o.min; if(o.max!=null) i.max=o.max; }
    i.value=val==null?"":val; f.appendChild(i); if(o.hint) f.appendChild(el("small",null,o.hint)); g.appendChild(f);
    i.addEventListener(o.sel||/^(date|month)$/.test(o.type||"")?"change":"input",function(){ on(i.value.trim()); save(); if(o.redraw) draw(); });
    return i; }

  /* ================= 장부 ================= */
  function drawList(){
    var hero=el("div","cv-hero"), h=el("div"); h.appendChild(el("h3",null,"호봉 획정·정산")); hero.appendChild(h);
    var bs=el("div","cv-btns"); bs.appendChild(btn("+ 새 사람","btn",function(){ C=newCase(); CASES.unshift(C); save(); go({v:"c"}); })); hero.appendChild(bs); app.appendChild(hero);
    var open=CASES.filter(function(c){ return curIdx(c)<STG.length; });
    var sm=el("div","cv-sum"); [["진행 중",open.length+"명"],["끝남",(CASES.length-open.length)+"명"],["정산 중",CASES.filter(function(c){ return Object.keys(c.pay.files).length&&!c.done.pay; }).length+"명"]].forEach(function(p){ var d=el("div"); d.appendChild(el("span",null,p[0])); d.appendChild(el("b",null,p[1])); sm.appendChild(d); }); app.appendChild(sm);
    if(!CASES.length){ var e=el("div","cv-empty"); e.appendChild(el("p",null,"아직 올린 사람이 없어요."));
      e.appendChild(el("p",null,"'+ 새 사람'을 누르고 자격증·졸업증명서·경력증명서를 한꺼번에 올리면 경력을 채우고 초임 호봉을 계산해요. 호봉이 바뀌어 이미 준 급여를 맞춰야 하면 나이스 급여 파일로 달마다 정산까지 이어 가요."));
      e.appendChild(btn("+ 새 사람","btn",function(){ C=newCase(); CASES.unshift(C); save(); go({v:"c"}); })); e.appendChild(el("p","cv-law","이름·경력·급여는 이 PC 브라우저에만 저장돼요. 공용 PC에서는 다 쓴 뒤 지우세요.")); app.appendChild(e); return; }
    function kill(b,c){ if(TK().delX) TK().delX(b,cTitle(c),function(){ CASES=CASES.filter(function(x){ return x!==c; }); lsSet("hb.cases",CASES); if(C===c) C=null; draw(); }); }
    function cards(list,title){ if(!list.length) return; app.appendChild(el("div","cv-h",title)); var g=el("div","cv-cases"); app.appendChild(g);
      list.forEach(function(c){ var b=btn("","cv-case",function(){ C=c; go({v:"c"}); }), i=curIdx(c), r=calc(c);
        b.appendChild(el("h4",null,cTitle(c))); b.appendChild(el("p",null,[r&&r.유효?r.호봉+"호봉":"",c.asof?"확정일 "+kd(c.asof):"",c.res?"정산 "+wonS(c.res.net)+"원":""].filter(Boolean).join(" · ")||"서류 올리기 전"));
        var tr=el("div","cv-track"); STG.forEach(function(_,j){ tr.appendChild(el("i",j<i?"on":j===i?"cur":"")); }); b.appendChild(tr);
        b.appendChild(el("p",null,i<STG.length?"지금: "+STG[i][2]:"끝났어요")); kill(b,c); g.appendChild(b); }); }
    cards(open,"진행 중"); var fin=CASES.filter(function(c){ return open.indexOf(c)<0; });
    if(fin.length){ var dt=el("details","cv-more"); dt.appendChild(el("summary",null,"끝난 사람 "+fin.length+"명")); var g=el("div","cv-cases"); g.style.marginTop="8px"; dt.appendChild(g); app.appendChild(dt);
      fin.forEach(function(c){ var b=btn("","cv-case",function(){ C=c; go({v:"c"}); }), r=calc(c); b.appendChild(el("h4",null,cTitle(c))); b.appendChild(el("p",null,(r&&r.유효?r.호봉+"호봉 · ":"")+(c.asof?kd(c.asof):""))); kill(b,c); g.appendChild(b); }); }    var pv=el("div","cv-next"); pv.style.marginTop="24px"; app.appendChild(pv);
    pv.appendChild(el("small","cv-law","이름·경력·급여는 이 PC 브라우저에만 저장돼요. 공용 PC에서는 다 쓴 뒤 지우세요."));
    pv.appendChild(btn("이 PC 기록 모두 지우기","cv-x",function(){ if(!confirm("이 PC에 저장된 호봉 기록 "+CASES.length+"명을 모두 지울까요? 되돌릴 수 없어요.")) return; CASES=[]; C=null; try{ localStorage.removeItem("hb.cases"); }catch(e){} draw(); }));
  }

  /* ================= 한 사람 ================= */
  function drawCase(){
    var c=C; app.appendChild(btn("← 목록","cv-back",function(){ C=null; go({v:"list"}); }));
    var tp=el("div","cv-top"); tp.appendChild(el("h3",null,cTitle(c))); app.appendChild(tp);
    var r=calc(c), mt=el("div","cv-meta"); [r&&r.유효?r.호봉+"호봉 · 잔여 "+r.잔여.m+"개월 "+r.잔여.d+"일":"",c.asof?"확정일 "+kd(c.asof):"",r&&r.차기승급일?"다음 승급 "+kd(r.차기승급일):"",c.res?"정산 "+wonS(c.res.net)+"원":""].filter(Boolean).forEach(function(t){ mt.appendChild(el("span",null,t)); }); if(mt.firstChild) app.appendChild(mt);
    var cur=curIdx(c), sel=-1; STG.forEach(function(s,i){ if(s[0]===view.open) sel=i; }); if(sel<0) sel=Math.min(cur,STG.length-1);
    var nv=el("nav","cv-idx"); nv.style.setProperty("--n",STG.length);
    STG.forEach(function(s,i){ var st=c.done[s[0]]?"done":i===cur?"cur":"todo", b=btn("","cv-ix "+st+(i===sel?" sel":""),function(){ view.open=s[0]; draw(); });
      if(i===sel) b.setAttribute("aria-current","step"); b.appendChild(el("span","n",st==="done"?(c.done[s[0]]==="skip"?"–":"✓"):String(i+1))); b.appendChild(el("span","t",s[1])); nv.appendChild(b); });
    app.appendChild(nv); var pn=el("section","cv-pane"); app.appendChild(pn);
    var s=STG[sel], hd=el("div","cv-ph"); hd.appendChild(el("h4",null,s[2])); pn.appendChild(hd);
    if(cur>=STG.length&&sel===STG.length-1) pn.appendChild(el("div","tkmsg on ok","이 사람은 모두 끝났어요."));
    ST[s[0]](pn,c);
    var nb=el("div","cv-next"); pn.appendChild(nb);
    if(c.done[s[0]]) nb.appendChild(btn("이 단계 다시 열기","btn ghost",function(){ delete c.done[s[0]]; save(); draw(); }));
    else { nb.appendChild(btn(sel<STG.length-1?"이 단계 마쳤어요 · "+STG[sel+1][1]+"(으)로":"모두 마쳤어요","btn",function(){ c.done[s[0]]=today(); view.open=sel<STG.length-1?STG[sel+1][0]:s[0]; save(); draw(); top(); }));
      if(s[0]==="hob") nb.appendChild(btn("급여 정산 없이 끝내기","btn ghost",function(){ c.done.hob=today(); c.done.fix="skip"; c.done.pay="skip"; view.open="hob"; save(); draw(); })); }
    var pr=el("div","cv-pn"); pn.appendChild(pr);
    pr.appendChild(sel>0?btn("← "+STG[sel-1][1],"cv-back",function(){ view.open=STG[sel-1][0]; draw(); top(); }):el("span"));
    if(sel<STG.length-1) pr.appendChild(btn(STG[sel+1][1]+" →","cv-back",function(){ view.open=STG[sel+1][0]; draw(); top(); }));
    var dz=el("div","cv-next"); dz.style.marginTop="24px"; app.appendChild(dz);
    dz.appendChild(btn("이 사람 지우기","cv-x",function(){ if(!confirm("'"+cTitle(c)+"'를 목록에서 지울까요?")) return; CASES=CASES.filter(function(x){ return x!==c; }); lsSet("hb.cases",CASES); C=null; go({v:"list"}); }));
  }

  /* ---------- 서류 읽은 결과 넣기 ---------- */
  function addRow(c,o){ var dup=c.rows.some(function(r){ return r.s===o.s&&r.e===o.e; }); if(dup) return false;
    var t=RATES&&RATES.검색?RATES.검색([o.org,o.job].join(" ")):[], hit=t[0]&&t[0].score>=20?t[0]:null;
    c.rows.push({org:o.org||"",job:o.job||"",s:o.s||"",e:o.e||"",r:o.r!=null&&o.r!==""?String(o.r):hit?String(hit.r):"",t:o.t||(hit&&(o.r==null||o.r==="")?hit.t:""),b:hit?hit.b:"",x:false}); return true; }
  function warnOnce(c,t){ if(c.warn.indexOf(t)<0) c.warn.push(t); }
  function apply(c,x){ var got=[];
    if(x.자격&&!c.q&&HOBONG.기산호봉[x.자격]!=null){ c.q=x.자격; got.push(["자격",x.자격]); }
    if(x.학력){ if(/석사|박사/.test(x.학력)){ if(!c.edu) c.edu="일반대학(4년) 졸업"; warnOnce(c,"석사·박사가 보여요. 학력(학령)으로 올리거나 수학연한을 경력으로 넣거나 둘 중 하나만 반영해요. 지금은 경력으로 넣었어요."); }
      else if(!c.edu||(HOBONG.학령[x.학력]||0)>(HOBONG.학령[c.edu]||0)){ c.edu=x.학력; got.push(["학력",x.학력]); } }
    if(x.사범계&&c.add==="0"){ c.add="1"; got.push(["가산연수","사범계 +1년"]); warnOnce(c,"사범계 졸업으로 보여 가산연수 +1년을 넣었어요. 아니면 고쳐 주세요."); }
    if(x.대학원&&x.대학원.시작&&x.대학원.종료&&addRow(c,{org:x.대학원.기관||"대학원",job:"석사 수학연한",s:x.대학원.시작,e:x.대학원.종료,r:100,t:"대학원 수학연한 (석사·박사)"})) got.push(["경력","대학원 수학연한"]);
    if(x.획정표){ var d=x.획정표; if(d.확정일후보&&!c.asof) c.asof=d.확정일후보; c.dec={h:d.호봉||null,rm:d.잔여?d.잔여.m:null,rd:d.잔여?d.잔여.d:null,date:d.확정일후보||""}; got.push(["호봉획정표",(d.호봉?d.호봉+"호봉":"")+(d.잔여?" 잔여 "+d.잔여.m+"개월 "+d.잔여.d+"일":"")]); }
    (x.경력||[]).forEach(function(k){ if(addRow(c,{org:k.기관,job:[k.직종,k.근무시간].filter(Boolean).join(" · "),s:k.시작,e:k.종료,r:k.환산율})) got.push(["경력",(k.기관||"")+" "+(k.시작||"")+"~"+(k.종료||"")]); });
    return got; }

  var ST={};
  /* 1. 서류 */
  ST.doc=function(pn,c){
    pn.appendChild(el("p","hb-say","교원자격증·졸업증명서·경력증명서(전력조회 회보서)·직전 호봉획정표를 한꺼번에 올려요. 무슨 서류인지는 알아서 가려 읽고, 주민등록번호·생년월일·주소는 읽으면서 지워요. 파일은 이 컴퓨터 밖으로 나가지 않아요."));
    var g=grid(pn); fld(g,"성명 (목록에만 표시)",c.name,function(v){ c.name=v; },{ph:"안 써도 돼요"});
    var dr=el("div","hb-drop"), fi=el("input"); fi.type="file"; fi.multiple=true; fi.accept=".pdf,image/*,.xlsx,.xls"; fi.hidden=true;
    dr.appendChild(el("b",null,"서류 올리기")); dr.appendChild(el("small",null,"PDF·사진·엑셀 여러 개를 한 번에 · 끌어다 놓아도 돼요")); pn.appendChild(dr); pn.appendChild(fi);
    var pg=el("div","hb-prog"), bar=el("i"); pg.appendChild(bar); pg.hidden=true; pn.appendChild(pg); var rd=el("div","hb-read"); pn.appendChild(rd); var gotBox=el("div","hb-got"); pn.appendChild(gotBox);
    dr.onclick=function(){ fi.click(); }; fi.onchange=function(){ run([].slice.call(fi.files)); fi.value=""; };
    ["dragenter","dragover"].forEach(function(t){ dr.addEventListener(t,function(e){ e.preventDefault(); dr.classList.add("over"); }); });
    ["dragleave","drop"].forEach(function(t){ dr.addEventListener(t,function(e){ e.preventDefault(); dr.classList.remove("over"); }); });
    dr.addEventListener("drop",function(e){ run([].slice.call(e.dataTransfer.files)); });
    function run(fs){ if(!fs.length) return; if(!READER){ rd.textContent="서류 읽기 엔진을 불러오지 못했어요."; return; }
      pg.hidden=false; bar.style.width="0"; var pages=0, found=0, errs=[], skip=[], all=[];
      function say(t){ rd.textContent=t; }
      fs.reduce(function(p,f,fi0){ return p.then(function(){ return filePages(f,function(t,i,n){ pages++; bar.style.width=Math.round((fi0+i/n)/fs.length*100)+"%"; say(f.name+" · "+i+"/"+n+"쪽 읽는 중…");
          var x=READER.읽기(READER.개인정보제거(t||"")); if(x.자격||x.학력||(x.경력||[]).length||x.획정표) found++; if(x.건너뜀&&skip.indexOf(x.건너뜀)<0) skip.push(x.건너뜀);
          all=all.concat(apply(c,x)); save(); },say).catch(function(e){ errs.push(f.name+": "+(e.message||e)); }); }); },Promise.resolve())
      .then(function(){ bar.style.width="100%"; setTimeout(function(){ pg.hidden=true; },600);
        var t=pages+"쪽을 읽어 "+found+"쪽에서 내용을 찾았어요."; if(skip.length) t+=" 경력이 아닌 서류("+skip.join(", ")+")는 넘겼어요."; if(!found&&!errs.length) t="읽을 내용을 찾지 못했어요. 스캔이 흐리면 그럴 수 있어요. 다음 단계에서 직접 넣어 주세요.";
        if(errs.length) t+=" "+errs.join(" / "); say(t); paintGot(all); save(); }); }
    function paintGot(list){ gotBox.textContent=""; list.forEach(function(g0){ var s0=el("span"); s0.appendChild(el("b",null,g0[0])); s0.appendChild(document.createTextNode(g0[1])); gotBox.appendChild(s0); }); }
    var have=[c.q?["자격",c.q]:null,c.edu?["학력",c.edu]:null,c.rows.length?["경력",c.rows.length+"건"]:null,c.dec&&c.dec.h?["호봉획정표",c.dec.h+"호봉"]:null].filter(Boolean); if(have.length){ sub(pn,"지금까지 읽은 것"); var hv=el("div","hb-got"); pn.appendChild(hv); have.forEach(function(g0){ var s0=el("span"); s0.appendChild(el("b",null,g0[0])); s0.appendChild(document.createTextNode(g0[1])); hv.appendChild(s0); }); }
    c.warn.forEach(function(w){ pn.appendChild(el("div","hb-note",w)); });
    law(pn,"서류가 없으면 이 단계는 건너뛰고 다음 단계에서 직접 넣어도 돼요. 스캔한 서류는 글자 인식에 쪽당 몇 초씩 걸려요.");
  };
  /* 2. 경력 */
  ST.car=function(pn,c){
    pn.appendChild(el("p","hb-say","자격으로 기산호봉, 학력으로 학령을 정하고 경력마다 환산율을 골라요. 환산율은 경력 종류를 고르면 예규 [별표 1] 비율이 들어가요."));
    var g=grid(pn);
    fld(g,"자격",c.q,function(v){ c.q=v; },{sel:[["","선택하세요"]].concat(Object.keys(HOBONG.기산호봉).map(function(k){ return [k,k+" · "+HOBONG.기산호봉[k]+"호봉"]; })),redraw:true});
    fld(g,"학력",c.edu,function(v){ c.edu=v; },{sel:[["","선택하세요"]].concat(Object.keys(HOBONG.학령).map(function(k){ return [k,k+" · "+HOBONG.학령[k]+"년"]; })),redraw:true});
    fld(g,"가산연수",c.add,function(v){ c.add=v; },{sel:[["0","없음 (0년)"],["1","사범계 졸업 등 (+1년)"],["2","특수학교 자격·특수학급 담당·사범계 (+2년)"]],redraw:true});
    fld(g,"호봉 확정일",c.asof,function(v){ c.asof=v; },{type:"date",hint:"이 호봉을 처음 적용할 날",redraw:true});
    sub(pn,"경력",c.rows.length+"건");
    var rows=el("div","hb-rows"); pn.appendChild(rows); var r=calc(c), rr=r?r.rows:[];
    var opts=[["","경력 종류 고르기"]], groups={}; (RATES.목록||[]).forEach(function(x,i){ (groups[x.g]=groups[x.g]||[]).push([i,x]); });
    c.rows.forEach(function(row,i){ var box=el("div","hb-row"+(row.x?" off":"")), a=el("div","hb-r1"); box.appendChild(a);
      a.appendChild(el("span","n",String(i+1)));
      function inp(k,ph,type){ var x=el("input"); if(type) x.type=type; x.placeholder=ph; x.value=row[k]||""; x.addEventListener(type?"change":"input",function(){ row[k]=x.value.trim(); save(); if(type) draw(); }); a.appendChild(x); return x; }
      inp("org","근무기관"); inp("job","직종·내용"); inp("s","시작","date"); inp("e","종료","date");
      a.appendChild(btn("×","x",function(){ c.rows.splice(i,1); save(); draw(); }));
      var b2=el("div","hb-r2"); box.appendChild(b2); b2.appendChild(el("span","n"));
      var sl=el("select"), o0=el("option",null,"경력 종류 고르기"); o0.value=""; sl.appendChild(o0);
      Object.keys(groups).forEach(function(gk){ var og=el("optgroup"); og.label=gk; groups[gk].forEach(function(p){ var o=el("option",null,p[1].t+" · "+p[1].r+"%"); o.value=p[1].t; og.appendChild(o); }); sl.appendChild(og); });
      var oc=el("option",null,"직접 정하기"); oc.value="*"; sl.appendChild(oc); sl.value=row.t||(row.r!==""?"*":"");
      sl.onchange=function(){ if(sl.value==="*"||!sl.value){ row.t=sl.value==="*"?"":""; row.b=""; } else { var x=(RATES.목록||[]).filter(function(y){ return y.t===sl.value; })[0]; row.t=x.t; row.r=String(x.r); row.b=x.b; if(hbHas(row)) row.r=String(hbKr(row.h,hbD(row.s))); } save(); draw(); };
      b2.appendChild(sl);
      var rt=el("label","rt"), ri=el("input"); ri.type="number"; ri.min=0; ri.max=100; ri.value=row.r; ri.oninput=function(){ row.r=ri.value; save(); }; ri.onchange=function(){ draw(); }; rt.appendChild(ri); rt.appendChild(document.createTextNode("%")); b2.appendChild(rt);
      if(hbKang(row)){ var hw=el("div","hb-w"), hl=el("label","rt"), hi=el("input"); hi.type="number"; hi.min=0; hi.max=60; hi.step="0.5"; hi.style.width="70px"; hi.value=row.h||""; hi.placeholder="시간";
        hi.onchange=function(){ row.h=hi.value.trim(); if(+row.h>0) row.r=String(hbKr(row.h,hbD(row.s))); save(); draw(); };
        hl.appendChild(document.createTextNode("주당 강의시간 ")); hl.appendChild(hi); hw.appendChild(hl);
        var bs0=hbD(row.s), bs1=hbD(row.e); if(bs0!=null) hw.appendChild(document.createTextNode(" · 기준 "+hbBase(bs0)+"시간"+(bs1!=null&&hbBase(bs1)!==hbBase(bs0)?"~"+hbBase(bs1)+"시간(바뀌는 날에서 나눠 셈)":"")+" · 12시간 이하·불명확은 30%"));
        box.appendChild(hw); }
      var lx=el("div","lx"), q=rr[i]; if(q&&q.기간) lx.appendChild(document.createTextNode("기간 "+ymd(q.기간))); if(q&&q.환산){ lx.appendChild(document.createTextNode(" → 환산 ")); lx.appendChild(el("b",null,ymd(q.환산))); }
      if(q&&q.오류) lx.appendChild(el("span",null,q.오류)); var xl=el("label"), xc=el("input"); xc.type="checkbox"; xc.checked=!!row.x; xc.onchange=function(){ row.x=xc.checked; save(); draw(); }; xl.appendChild(xc); xl.appendChild(document.createTextNode(" 제외")); lx.appendChild(xl); b2.appendChild(lx);
      if(!row.t&&row.r===""&&RATES.검색){ var sg=RATES.검색([row.org,row.job].join(" ")).slice(0,3); if(sg.length){ var sw=el("div","hb-sug"); sg.forEach(function(x){ sw.appendChild(btn(x.t+" "+x.r+"%",null,function(){ row.t=x.t; row.r=String(x.r); row.b=x.b; save(); draw(); })); }); box.appendChild(sw); } }
      var tw=(RATES.목록||[]).filter(function(y){ return y.t===row.t; })[0]; if(tw&&(tw.w||tw.b)) box.appendChild(el("div","hb-w",[tw.b,tw.w].filter(Boolean).join(" · ")));
      rows.appendChild(box); });
    var bar=el("div","hb-bar"); pn.appendChild(bar);
    bar.appendChild(btn("+ 경력","hb-add",function(){ c.rows.push({org:"",job:"",s:"",e:"",r:"",t:"",b:"",x:false}); save(); draw(); }));
    if(r&&r.중복&&r.중복.length) r.중복.forEach(function(o){ pn.appendChild(el("div","hb-note",(o.a+1)+"번과 "+(o.b+1)+"번 경력이 "+kd(o.시작)+"~"+kd(o.종료)+"("+ymd(o.기간)+") 겹쳐요. "+(/강사/.test((c.rows[o.a]||{}).t||"")&&/강사/.test((c.rows[o.b]||{}).t||"")?(hbHas(c.rows[o.a]||{})&&hbHas(c.rows[o.b]||{})?"같은 기간 여러 학교 시간강사는 겹침이 아니라 강의시간을 합쳐 계산했어요.":"같은 기간 여러 학교 시간강사는 겹침이 아니라 강의시간을 합쳐요. 두 경력에 주당 강의시간을 넣으면 합산해 계산해요."):"유리한 경력 하나만 인정해요. 겹친 기간은 인정 기간이 더 긴(환산율이 높은) 쪽에만 넣고 다른 쪽에서 뺐어요."))); });
    if(r&&r.강사합산&&r.강사합산.length) r.강사합산.forEach(function(o){ pn.appendChild(el("div","hb-note",kd(hbS(o.a))+"~"+kd(hbS(o.b))+" 강의시간 합계 "+o.H+"시간 ÷ 기준 "+o.base+"시간 → "+o.rt+"% ("+o.rows.map(function(i){ return (i+1)+"번"; }).join("·")+" 합산, "+(o.rows[0]+1)+"번에 넣음)")); });
    law(pn,"근거: 공무원보수규정 제8조②(경력끼리 겹치면 유리한 경력 하나만), 별표 22, 교육공무원 호봉획정시 경력환산율표의 적용 등에 관한 예규(교육부 예규 제97호) Ⅱ.1·[별표 1] 3.가(강사 기준시간). 시작일·종료일을 모두 넣어 기간을 셉니다(양편넣기).");
  };
  /* 3. 호봉 */
  ST.hob=function(pn,c){
    var r=calc(c);
    if(!c.q){ pn.appendChild(el("p","hb-say","경력 단계에서 자격을 먼저 골라 주세요.")); return; }
    var box=el("div","cv-calc"); pn.appendChild(box);
    var unset=c.rows.filter(function(x){ return !x.x&&(x.r===""||x.r==null); }).length;
    tiles(box,[{l:"호봉",v:r&&r.유효?r.호봉+"호봉":"-",c:r&&r.유효?"ok":"warn",s:unset?"환산율 안 정한 경력 "+unset+"건":""},{l:"잔여 기간",v:r?r.잔여.m+"개월 "+r.잔여.d+"일":"-",s:"다음 승급에 이어서 셈"},{l:"다음 승급일",v:r&&r.차기승급일?kd(r.차기승급일):"-",s:c.asof?"":"호봉 확정일을 넣으면 나와요"},{l:"환산 경력",v:r?ymd(r.환산경력):"-",s:r?"실제 경력 "+ymd(r.총경력):""}]);
    if(r){ var eq=el("div","hb-eq"); eq.innerHTML=""; var t="기산 "+r.기산+"호봉 "+(r.학령가감>=0?"+ ":"− ")+Math.abs(r.학령가감)+" (학령 "+r.학령값+"년, 기준 16년) + 가산 "+r.가산연수+" + 환산경력 "+r.환산경력.y+"년 = ";
      eq.appendChild(document.createTextNode(t)); eq.appendChild(el("b",null,r.호봉+"호봉")); eq.appendChild(el("div",null,"환산경력 중 1년이 안 되는 "+r.잔여.m+"개월 "+r.잔여.d+"일은 버리지 않고 다음 승급일 계산에 써요.")); pn.appendChild(eq); }
    if(c.dec&&c.dec.h&&r){ var same=+c.dec.h===r.호봉&&(c.dec.rm==null||+c.dec.rm===r.잔여.m); pn.appendChild(el("div",same?"tkmsg on ok":"hb-note","직전 호봉획정표: "+c.dec.h+"호봉"+(c.dec.rm!=null?" 잔여 "+c.dec.rm+"개월 "+(c.dec.rd||0)+"일":"")+(same?" — 계산과 같아요.":" — 계산과 달라요. 정정이 필요하면 다음 단계에서 급여를 정산해요."))); }
    if(r&&r.rows.length){ sub(pn,"경력 환산 내역"); var tw=el("div","hb-tw"), tb=el("table","hb-t"); tw.appendChild(tb); pn.appendChild(tw);
      tb.innerHTML="<thead><tr><th>#</th><th>근무기관 · 내용</th><th>기간</th><th>경력 기간</th><th class=r>환산율</th><th>환산 기간</th></tr></thead>"; var bd=el("tbody"); tb.appendChild(bd);
      r.rows.forEach(function(q,i){ var row=c.rows[i], tr=el("tr"); [String(i+1),(row.org||"")+(row.job?" · "+row.job:"")+(row.t?"\n"+row.t:""),kd(row.s)+" ~ "+kd(row.e),q.기간?ymd(q.기간):"-",row.x?"제외":(row.r===""?"-":row.r+"%"),row.x?"-":q.환산?ymd(q.환산):q.오류||"-"].forEach(function(v,j){ var td=el("td",j===4?"r":null); var p=v.split("\n"); td.textContent=p[0]; if(p[1]) td.appendChild(el("small",null,p[1])); tr.appendChild(td); }); bd.appendChild(tr); }); }
    var bar=el("div","hb-bar"); pn.appendChild(bar); bar.appendChild(btn("호봉 획정 내역 인쇄·PDF","btn ghost",function(){ printDec(c,r); }));
    law(pn,"호봉 확정 전에 학교 호봉경력평가심의회(경남)를 거쳐요. 근거: 공무원보수규정 별표 22, 교육공무원 호봉획정시 경력환산율표의 적용 등에 관한 예규");
  };
  function printDec(c,r){ if(!r) return; var P=document.getElementById("hbPrint"); if(!P){ P=el("div"); P.id="hbPrint"; document.body.appendChild(P); }
    var e=function(s){ return String(s==null?"":s).replace(/[&<>]/g,function(x){ return {"&":"&amp;","<":"&lt;",">":"&gt;"}[x]; }); };
    var h="<h1>호봉 획정 내역</h1><table><tr><th>성명</th><td>"+e(c.name)+"</td><th>호봉 확정일</th><td>"+e(kd(c.asof))+"</td></tr><tr><th>자격</th><td>"+e(c.q)+" (기산 "+r.기산+"호봉)</td><th>학력</th><td>"+e(c.edu)+" (학령 "+r.학령값+"년)</td></tr><tr><th>가산연수</th><td>"+r.가산연수+"년</td><th>환산 경력</th><td>"+e(ymd(r.환산경력))+"</td></tr><tr><th>획정 호봉</th><td><b>"+r.호봉+"호봉</b></td><th>잔여 기간</th><td>"+r.잔여.m+"개월 "+r.잔여.d+"일 (다음 승급 "+e(kd(r.차기승급일))+")</td></tr></table>";
    h+="<table><tr><th>#</th><th>근무기관</th><th>직종·내용</th><th>기간</th><th>경력</th><th>경력 종류</th><th>환산율</th><th>환산</th></tr>"+r.rows.map(function(q,i){ var w=c.rows[i]; return "<tr><td>"+(i+1)+"</td><td>"+e(w.org)+"</td><td>"+e(w.job)+"</td><td>"+e(kd(w.s))+" ~ "+e(kd(w.e))+"</td><td>"+e(q.기간?ymd(q.기간):"")+"</td><td>"+e(w.t)+"</td><td class=r>"+(w.x?"제외":e(w.r)+"%")+"</td><td>"+e(w.x?"":q.환산?ymd(q.환산):"")+"</td></tr>"; }).join("")+"</table>";
    h+="<p>계산: 기산 "+r.기산+" + 학령 가감 "+r.학령가감+" + 가산 "+r.가산연수+" + 환산경력 "+r.환산경력.y+"년 = "+r.호봉+"호봉</p><p style='font-size:8.5pt'>근거: 공무원보수규정 별표 22, 교육공무원 호봉획정시 경력환산율표의 적용 등에 관한 예규</p>";
    P.innerHTML=h; document.body.classList.add("hb-printing"); var done=function(){ document.body.classList.remove("hb-printing"); P.innerHTML=""; window.removeEventListener("afterprint",done); }; window.addEventListener("afterprint",done); setTimeout(function(){ window.print(); },60); }

  /* ---------- 정정·정산 ---------- */
  function pargs(c){ var p=c.pay, sk=ymK(p.start), ys=Object.keys(p.files).map(Number), ek=p.end?ymK(p.end):ys.length?Math.max.apply(null,ys)*100+12:(new Date().getFullYear()+1)*100+12; return {files:Object.keys(p.files).map(function(k){ return p.files[k]; }),kind:p.kind,defG:+p.grade||9,startK:sk||0,endK:ek,overrides:p.ov}; }
  function buildTl(c){ var p=c.pay, a=pargs(c); if(!p.start) return []; var paid=Object.keys(p.files).length?E.paidTimelineOnly(a):[], tl;
    if(p.mode==="A"){ var h=+p.h; if(!h) return []; tl=E.buildFromDecision({startDate:p.start,h:h,remM:+p.rm||0,remD:+p.rd||0,autoStep:p.auto,endK:a.endK});
      if(p.kind==="K"&&!p.auto){ var prev=null; paid.forEach(function(x){ if(x.k<a.startK){ prev=x.h; return; } if(x.h&&prev&&x.h!==prev) tl.push({from:x.k,h:x.h,note:"재계약 재획정(기지급 기준) — 획정표 확인"}); if(x.h) prev=x.h; }); tl.sort(function(x,y){ return x.from-y.from; }); } }
    else tl=E.buildFromShift(paid,{startK:a.startK,endK:a.endK,shift:+p.shift||0,add:+p.addH||0});
    return tl; }
  function runs(paid){ var o=[]; paid.forEach(function(x){ var l=o[o.length-1]; if(l&&l.h===x.h&&l.state===x.state) l.to=x.k; else o.push({from:x.k,to:x.k,h:x.h,state:x.state}); }); return o; }
  function readNice(c,fs,box,done){ needXLSX().then(function(){ return fs.reduce(function(p,f){ return p.then(function(){ return f.arrayBuffer().then(function(b){ var wb=XLSX.read(b,{type:"array"}), sh=wb.Sheets[wb.SheetNames[0]];
        var x=E.parseNice(XLSX.utils.sheet_to_json(sh,{header:1,raw:true,defval:null})); x.file=f.name; c.pay.files[x.year]=x; }).catch(function(e){ box.push(f.name+": "+(e.message||e)); }); }); },Promise.resolve()); })
      .catch(function(e){ box.push(e.message); }).then(function(){ var ys=Object.keys(c.pay.files), last=ys.length?c.pay.files[ys.sort().pop()]:null;
        if(last){ if(!c.name&&last.name) c.name=last.name; if(last.grade&&c.pay.kind==="T"&&!/교/.test(last.job||"")){ c.pay.kind="G"; c.pay.grade=String(last.grade); } }
        c.pay.tlEdited=false; save(); done(); }); }
  /* 4. 정정 */
  ST.fix=function(pn,c){ var p=c.pay, r=calc(c);
    pn.appendChild(el("p","hb-say","호봉이 정정돼 이미 준 급여를 다시 맞출 때만 해요. 나이스 › 본봉/수당 월별내역 엑셀을 소급 기간 연도마다 올리고, 정당 호봉을 정하면 다음 단계에서 달마다 차액을 계산해요."));
    if(!p.start&&c.asof) p.start=c.asof; if(p.mode==="A"&&!p.h&&r&&r.유효){ p.h=String(r.호봉); p.rm=String(r.잔여.m); p.rd=String(r.잔여.d); }
    var dr=el("div","hb-drop"), fi=el("input"); fi.type="file"; fi.multiple=true; fi.accept=".xlsx,.xls"; fi.hidden=true; dr.appendChild(el("b",null,"나이스 급여 파일 올리기")); dr.appendChild(el("small",null,"본봉/수당 월별내역 엑셀 · 연도마다 한 개씩, 여러 개를 한 번에")); pn.appendChild(dr); pn.appendChild(fi);
    var em=el("div","hb-read"); pn.appendChild(em);
    function go2(fs){ if(!fs.length) return; em.textContent="읽는 중…"; var errs=[]; readNice(c,fs,errs,function(){ draw(); if(errs.length) setTimeout(function(){ var m=app.querySelector(".hb-read"); if(m) m.textContent=errs.join(" / "); },0); }); }
    dr.onclick=function(){ fi.click(); }; fi.onchange=function(){ go2([].slice.call(fi.files)); fi.value=""; };
    ["dragenter","dragover"].forEach(function(t){ dr.addEventListener(t,function(e){ e.preventDefault(); dr.classList.add("over"); }); }); ["dragleave","drop"].forEach(function(t){ dr.addEventListener(t,function(e){ e.preventDefault(); dr.classList.remove("over"); }); });
    dr.addEventListener("drop",function(e){ go2([].slice.call(e.dataTransfer.files)); });
    var ys=Object.keys(p.files).sort();
    if(ys.length){ var gt=el("div","hb-got"); ys.forEach(function(y){ var f=p.files[y], s0=el("span"); s0.appendChild(el("b",null,y+"년")); s0.appendChild(document.createTextNode(f.file+(f.status?" · "+f.status:""))); var x=btn("×",null,function(){ delete p.files[y]; p.tlEdited=false; save(); draw(); }); x.style.cssText="border:0;background:none;color:var(--muted);cursor:pointer;margin-left:4px"; s0.appendChild(x); gt.appendChild(s0); }); pn.appendChild(gt);
      var miss=ys.filter(function(y){ return !E.PAY[y]||(p.kind==="G"?!E.PAY[y].G[+p.grade]:!E.PAY[y].T); }); if(miss.length) pn.appendChild(el("div","hb-note",miss.join(", ")+"년 봉급표가 없어요. 아래 '봉급표 더하기'에서 붙여 넣어 주세요.")); }
    sub(pn,"대상·기간");
    var g=grid(pn);
    fld(g,"대상 구분",p.kind,function(v){ p.kind=v; p.tlEdited=false; },{sel:[["T","교원"],["K","기간제 교원"],["G","지방 일반직"]],redraw:true});
    if(p.kind==="G") fld(g,"계급",p.grade,function(v){ p.grade=v; },{sel:["9","8","7","6","5","4","3","2","1"].map(function(x){ return [x,x+"급"]; }),redraw:true});
    fld(g,"정정 소급 적용일",p.start,function(v){ p.start=v; p.tlEdited=false; },{type:"date",hint:"정정된 호봉을 처음 적용하는 날",redraw:true});
    fld(g,"정산 마지막 달",p.end,function(v){ p.end=v; p.tlEdited=false; },{type:"month",hint:"비우면 올린 파일 끝까지",redraw:true});
    if(ys.length){ var paid=E.paidTimelineOnly(Object.assign(pargs(c),{startK:p.start?ymK(p.start):0})); sub(pn,"지금까지 지급된 호봉","급여에서 거꾸로 셈");
      var tw=el("div","hb-tw"), tb=el("table","hb-t"); tw.appendChild(tb); pn.appendChild(tw); var bd=el("tbody"); tb.appendChild(bd);
      runs(paid).forEach(function(x){ var tr=el("tr"); tr.appendChild(el("td",null,E.ymStr(x.from)+(x.to!==x.from?" ~ "+E.ymStr(x.to):""))); tr.appendChild(el("td","r",x.h?x.h+"호봉":x.state==="zero"?"본봉 없음":x.state==="nopay"?"봉급표 없음":"거꾸로 셀 수 없음")); bd.appendChild(tr); }); }
    sub(pn,"정당 호봉");
    var mp=el("div","cv-chips"); pn.appendChild(mp); [["A","호봉획정표 기준"],["B","승급월 옮기기"]].forEach(function(m){ var b=btn(m[1],"pill",function(){ p.mode=m[0]; p.tlEdited=false; save(); draw(); }); b.setAttribute("aria-pressed",p.mode===m[0]?"true":"false"); mp.appendChild(b); });
    var g2=grid(pn);
    if(p.mode==="A"){ fld(g2,"정정 후 호봉",p.h,function(v){ p.h=v; p.tlEdited=false; },{type:"number",min:1,max:40,hint:r&&r.유효?"호봉 단계 계산: "+r.호봉+"호봉":"",redraw:true}); fld(g2,"잔여 개월",p.rm,function(v){ p.rm=v; p.tlEdited=false; },{type:"number",min:0,max:11,redraw:true}); fld(g2,"잔여 일",p.rd,function(v){ p.rd=v; p.tlEdited=false; },{type:"number",min:0,max:29,redraw:true});
      var al=el("label","tkf wide"), ac=el("input"); ac.type="checkbox"; ac.checked=p.auto; ac.onchange=function(){ p.auto=ac.checked; p.tlEdited=false; save(); draw(); }; var row=el("span"); row.style.cssText="display:flex;gap:8px;align-items:center;font-size:14px"; row.appendChild(ac); row.appendChild(document.createTextNode("정기승급 반영(12개월마다 1호봉)")); al.appendChild(row); g2.appendChild(al); }
    else { fld(g2,"승급월 옮기기(개월)",p.shift,function(v){ p.shift=v; p.tlEdited=false; },{type:"number",hint:"−3은 3개월 빨라짐(추가지급), +3은 늦어짐(환수)",redraw:true}); fld(g2,"호봉 더하기·빼기",p.addH,function(v){ p.addH=v; p.tlEdited=false; },{type:"number",hint:"경력이 더해져 호봉 자체가 달라지면",redraw:true}); }
    if(!p.tlEdited) p.tl=buildTl(c);
    sub(pn,"정당 호봉 줄",p.tlEdited?"직접 고침":"자동");
    var tw2=el("div","hb-tw"), t2=el("table","hb-t"); tw2.appendChild(t2); pn.appendChild(tw2); t2.innerHTML="<thead><tr><th>적용 시작 월</th><th>정당 호봉</th><th>비고</th><th></th></tr></thead>"; var b2=el("tbody"); t2.appendChild(b2);
    p.tl.forEach(function(x,i){ var tr=el("tr"), m=el("input"); m.type="month"; m.value=kToMonth(x.from); m.onchange=function(){ var k=ymK(m.value); if(k){ x.from=k; x.note="직접 수정"; p.tl.sort(function(a,b){ return a.from-b.from; }); p.tlEdited=true; save(); draw(); } };
      var hh=el("input"); hh.type="number"; hh.min=1; hh.max=40; hh.value=x.h; hh.onchange=function(){ x.h=+hh.value; x.note="직접 수정"; p.tlEdited=true; save(); draw(); };
      var td1=el("td"); td1.appendChild(m); var td2=el("td"); td2.appendChild(hh); tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(el("td",null,x.note||""));
      var td3=el("td"), xb=btn("×",null,function(){ p.tl.splice(i,1); p.tlEdited=true; save(); draw(); }); xb.style.cssText="border:0;background:none;color:var(--muted);cursor:pointer;font-size:16px"; td3.appendChild(xb); tr.appendChild(td3); b2.appendChild(tr); });
    if(!p.tl.length){ var tr0=el("tr"), td0=el("td",null,p.start?"정당 호봉을 넣으면 채워져요.":"정정 소급 적용일을 넣어 주세요."); td0.colSpan=4; tr0.appendChild(td0); b2.appendChild(tr0); }
    var bar=el("div","hb-bar"); pn.appendChild(bar);
    bar.appendChild(btn("+ 줄","hb-add",function(){ var l=p.tl[p.tl.length-1]; p.tl.push({from:l?E.addMonths(l.from,12):ymK(p.start)||ymK(today()),h:l?l.h+1:+p.h||1,note:"직접 추가"}); p.tlEdited=true; save(); draw(); }));
    if(p.tlEdited) bar.appendChild(btn("자동으로 다시 채우기","btn ghost",function(){ p.tlEdited=false; save(); draw(); }));
    pn.appendChild(el("p","cv-law","휴직 등으로 승급이 늦춰진 기간이 있으면 적용 시작 월을 고쳐 주세요. 잔여기간을 채우는 달의 다음 달 1일부터 승급해요."));
    var pd=el("details","cv-more"); pd.appendChild(el("summary",null,"봉급표 더하기 (내장: 2010~2026년)")); pn.appendChild(pd); var pg=grid(pd); var py="", pk="T", pt="";
    fld(pg,"연도",py,function(v){ py=v; },{type:"number",ph:"2027"}); fld(pg,"구분",pk,function(v){ pk=v; },{sel:[["T","교원(별표 11)"],["G","일반직(별표 3)"]]});
    var ta=el("textarea"); ta.rows=5; ta.placeholder="인사혁신처 누리집 › 공무원 봉급표에서 표를 드래그해 복사한 뒤 붙여 넣으세요."; ta.style.cssText="font:inherit;font-size:13.5px;width:100%;box-sizing:border-box;padding:8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink)"; ta.oninput=function(){ pt=ta.value; }; pd.appendChild(ta);
    var pm=el("div","tkmsg"); pd.appendChild(btn("봉급표 더하기","btn ghost",function(){ try{ if(!+py) throw new Error("연도를 넣어 주세요."); var o={}; o[+py]=E.parsePaste(pt,pk); E.loadPay(o,"붙여넣기"); var ex=lsGet("hb.pay",{}); ex[py+pk]={y:+py,k:pk,t:pt}; lsSet("hb.pay",ex); msg(pm,py+"년 "+(pk==="T"?"교원":"일반직")+" 봉급표를 더했어요.","ok"); }catch(e){ msg(pm,e.message||String(e),"bad"); } })); pd.appendChild(pm);
    law(pn,"근거: 공무원보수규정 별표 11(교원 봉급표)·별표 3(일반직 봉급표), 지방공무원 보수규정");
  };
  /* 5. 정산 */
  ST.pay=function(pn,c){ var p=c.pay;
    if(!Object.keys(p.files).length||!p.tl.length){ pn.appendChild(el("p","hb-say","정정 단계에서 급여 파일을 올리고 정당 호봉을 정하면 여기서 달마다 차액이 나와요.")); return; }
    var R; try{ R=E.compute(Object.assign(pargs(c),{timeline:p.tl})); }catch(e){ pn.appendChild(el("div","tkmsg on bad","계산하지 못했어요: "+(e.message||e))); return; }
    c.res={net:R.net,plus:R.plus,minus:R.minus}; save();
    var box=el("div","cv-calc"); pn.appendChild(box); var first=R.rows.length?R.rows[0].k:null, last=R.rows.length?R.rows[R.rows.length-1].k:null;
    var age=first?((new Date().getFullYear()*12+new Date().getMonth()+1)-(Math.floor(first/100)*12+first%100))/12:0;
    tiles(box,[{l:"추가 지급",v:won(R.plus),c:R.plus?"ok":""},{l:"환수",v:won(Math.abs(R.minus)),c:R.minus?"bad":""},{l:"차감 정산액",v:wonS(R.net)+"원",c:R.net>0?"ok":R.net<0?"bad":"",s:R.net>0?"더 줄 돈":R.net<0?"돌려받을 돈":"차이 없음"},
      {l:"정산 기간",v:first?E.ymStr(first)+" ~ "+E.ymStr(last):"-",s:first?Math.floor(age)+"년 "+Math.round((age%1)*12)+"개월 전부터":"",c:""}]);
    if(R.missingYears.length) pn.appendChild(el("div","hb-note",R.missingYears.join(", ")+"년 봉급표가 없어 그 해는 계산하지 못했어요. 정정 단계 '봉급표 더하기'에서 넣어 주세요."));
    if(R.flagged) pn.appendChild(el("div","hb-note","자동으로 셀 수 없는 달이 "+R.flagged+"개 있어요. 아래 표에서 노란 줄의 기지급 호봉을 골라 주세요."));
    if(R.plus||R.minus) pn.appendChild(el("div","hb-note","덜 준 봉급은 기간과 관계없이 잘못 발령한 달부터 모두 소급해 정산해요. 교원이 청구할 수 있는 기간은 호봉정정 발령일부터 3년, 더 준 봉급의 환수는 정정 발령일부터 5년이에요(국가재정법 제96조·지방재정법 제82조). 달마다 5년을 따로 세지 않아요."));
    var bar=el("div","hb-bar"); pn.appendChild(bar);
    bar.appendChild(btn("엑셀로 저장","btn",function(){ needXLSX().then(function(){ xlsxOut(c,R); }).catch(function(e){ toast(e.message); }); }));
    bar.appendChild(btn("인쇄·PDF","btn ghost",function(){ printPay(c,R); }));
    var items=Object.keys(R.byItem).filter(function(n){ return R.rows.some(function(r){ return r.items.some(function(x){ return x.name===n&&(x.diff||x.flag); }); }); });
    sub(pn,"항목별"); var tw=el("div","hb-tw"), tb=el("table","hb-t"); tw.appendChild(tb); pn.appendChild(tw);
    tb.innerHTML="<thead><tr><th>항목</th><th class='r it'>기지급</th><th class='r it'>정당 지급</th><th class=r>차액</th></tr></thead>"; var bd=el("tbody"); tb.appendChild(bd);
    Object.keys(R.byItem).forEach(function(n){ var x=R.byItem[n], tr=el("tr"); tr.appendChild(el("td",null,n)); tr.appendChild(el("td","r it",won(x.paid))); tr.appendChild(el("td","r it",won(x.due))); var d=el("td","r "+(x.diff>0?"p":x.diff<0?"m":"z"),wonS(x.diff)); tr.appendChild(d); bd.appendChild(tr); });
    Object.keys(R.byYear).forEach(function(y){ var tr=el("tr"); tr.appendChild(el("td",null,y+"년 합계")); tr.appendChild(el("td","it")); tr.appendChild(el("td","it")); tr.appendChild(el("td","r "+(R.byYear[y]>0?"p":R.byYear[y]<0?"m":"z"),wonS(R.byYear[y]))); bd.appendChild(tr); });
    if(R.excluded&&R.excluded.length) pn.appendChild(el("p","cv-law","계산에서 뺀 항목: "+R.excluded.map(function(x){ return x.name+"("+x.why+")"; }).join(", ")));
    sub(pn,"달마다",innerWidth<=640?"합계 차액 · 항목별은 엑셀에":"차액 · 기지급 → 정당");
    var tw2=el("div","hb-tw"), t2=el("table","hb-t"); tw2.appendChild(t2); pn.appendChild(tw2);
    var hd="<thead><tr><th>월</th><th class=r>기지급 호봉</th><th class=r>정당 호봉</th>"+items.map(function(n){ return "<th class='r it'>"+n.replace(/[<&]/g,"")+"</th>"; }).join("")+"<th class=r>합계</th><th class=it>비고</th></tr></thead>"; t2.innerHTML=hd; var b2=el("tbody"); t2.appendChild(b2);
    var maxH=p.kind==="G"?32:40;
    R.rows.forEach(function(r){ var tr=el("tr",r.flag?"flag":""), sum=0; tr.appendChild(el("td",null,E.ymStr(r.k)));
      var pc=el("td","r"); if(/fail|ambig|manual/.test(r.state)){ var s0=el("select"), o0=el("option",null,"고르기"); o0.value=""; s0.appendChild(o0); for(var h=1;h<=maxH;h++){ var o=el("option",null,h+"호봉"); o.value=h; s0.appendChild(o); } s0.value=r.paidH||""; s0.onchange=function(){ if(s0.value) p.ov[r.k]=+s0.value; else delete p.ov[r.k]; save(); draw(); }; pc.appendChild(s0); } else pc.textContent=r.paidH||"-"; tr.appendChild(pc);
      tr.appendChild(el("td","r",r.trueH==null?"?":String(r.trueH)));
      items.forEach(function(n){ var x=r.items.filter(function(y){ return y.name===n; })[0], td=el("td","r it"); if(!x){ td.textContent="-"; td.className="r z it"; } else if(x.diff||x.flag){ sum+=x.diff; td.appendChild(el("span",x.diff>0?"p":x.diff<0?"m":"z",wonS(x.diff))); td.appendChild(el("small",null,(x.paid||0).toLocaleString()+" → "+(x.due||0).toLocaleString())); } else { td.textContent="0"; td.className="r z it"; } tr.appendChild(td); });
      tr.appendChild(el("td","r "+(sum>0?"p":sum<0?"m":"z"),wonS(sum)));
      tr.appendChild(el("td","it",[].concat(r.notes||[],r.items.filter(function(x){ return x.note; }).map(function(x){ return x.name+": "+x.note; })).join(" · "))); b2.appendChild(tr); });
    law(pn,"정근수당 등 봉급에 비례하는 수당은 봉급 차이만큼 다시 셈하고, 정액급식비 같은 정액·실적 수당은 빼요. 실제 지급·환수는 나이스 소급 처리로 해요.");
  };
  function xlsxOut(c,R){ var items=Object.keys(R.byItem), wb=XLSX.utils.book_new();
    var s1=[["호봉정정 급여정산"],["성명",c.name],["대상",KIND[c.pay.kind]+(c.pay.kind==="G"?" "+c.pay.grade+"급":"")],["정정 소급 적용일",c.pay.start],["정당 호봉",c.pay.tl.map(function(x){ return E.ymStr(x.from)+"부터 "+x.h+"호봉"; }).join(", ")],[],["추가 지급",R.plus],["환수",R.minus],["차감 정산액",R.net],[],["연도","차액"]];
    Object.keys(R.byYear).forEach(function(y){ s1.push([y+"년",R.byYear[y]]); }); s1.push([]); s1.push(["항목","기지급","정당 지급","차액"]); items.forEach(function(n){ var x=R.byItem[n]; s1.push([n,x.paid,x.due,x.diff]); });
    var s2=[["월","기지급 호봉","정당 호봉"].concat([].concat.apply([],items.map(function(n){ return [n+" 기지급",n+" 정당",n+" 차액"]; }))).concat(["합계","비고"])];
    R.rows.forEach(function(r){ var row=[E.ymStr(r.k),r.paidH||"",r.trueH||""], sum=0; items.forEach(function(n){ var x=r.items.filter(function(y){ return y.name===n; })[0]; if(x){ row.push(x.paid,x.due,x.diff); sum+=x.diff; } else row.push("","",""); }); row.push(sum,[].concat(r.notes||[]).join(" ")); s2.push(row); });
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(s1),"요약"); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(s2),"월별");
    var out=XLSX.write(wb,{bookType:"xlsx",type:"array"}); saveFile(new Blob([out],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),"호봉정정정산_"+(c.name||"이름없음")+"_"+today()+".xlsx").then(function(){ toast("엑셀로 저장했어요."); },function(e){ toast(e.message); }); }
  function printPay(c,R){ var P=document.getElementById("hbPrint"); if(!P){ P=el("div"); P.id="hbPrint"; document.body.appendChild(P); }
    var e=function(s){ return String(s==null?"":s).replace(/[&<>]/g,function(x){ return {"&":"&amp;","<":"&lt;",">":"&gt;"}[x]; }); }, n=function(v){ return (Math.round(v||0)).toLocaleString("ko-KR"); };
    var h="<h1>호봉정정 급여 정산</h1><table><tr><th>성명</th><td>"+e(c.name)+"</td><th>대상</th><td>"+e(KIND[c.pay.kind])+"</td></tr><tr><th>소급 적용일</th><td>"+e(kd(c.pay.start))+"</td><th>정당 호봉</th><td>"+e(c.pay.tl.map(function(x){ return E.ymStr(x.from)+"부터 "+x.h+"호봉"; }).join(", "))+"</td></tr><tr><th>추가 지급</th><td class=r>"+n(R.plus)+"</td><th>환수</th><td class=r>"+n(R.minus)+"</td></tr><tr><th>차감 정산액</th><td class=r colspan=3><b>"+n(R.net)+"원</b></td></tr></table>";
    h+="<table><tr><th>월</th><th>기지급 호봉</th><th>정당 호봉</th><th>차액</th></tr>"+R.rows.map(function(r){ var s=r.items.reduce(function(a,x){ return a+(x.diff||0); },0); return "<tr><td>"+E.ymStr(r.k)+"</td><td class=r>"+(r.paidH||"")+"</td><td class=r>"+(r.trueH||"")+"</td><td class=r>"+n(s)+"</td></tr>"; }).join("")+"</table><p style='font-size:8.5pt'>근거: 공무원보수규정 별표 11·3</p>";
    P.innerHTML=h; document.body.classList.add("hb-printing"); var done=function(){ document.body.classList.remove("hb-printing"); P.innerHTML=""; window.removeEventListener("afterprint",done); }; window.addEventListener("afterprint",done); setTimeout(function(){ window.print(); },60); }

  /* 붙여 넣어 더한 봉급표 다시 싣기 */
  try{ var ex=lsGet("hb.pay",{}); Object.keys(ex).forEach(function(k){ var o={}; o[ex[k].y]=E.parsePaste(ex[k].t,ex[k].k); E.loadPay(o,"붙여넣기"); }); }catch(e){}
  if(!HOBONG||!E.compute){ app.appendChild(el("div","tkmsg on bad","계산 엔진을 불러오지 못했어요.")); return; }
  draw();
}
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.hb=build;
})();
