/* ======================================================================
   교과서 선정 — 경남 기준으로 처음부터 다시 만든 도구
   한 학년도에 쓸 교과용도서를 여덟 단계(좌→우)로 따라간다.
     계획 → 협의회 → 상정 → 심의 → 확정 → 주문 → 추가·반품 → 정산
   과목 표(선정 대상 과목 → 1~3순위 도서)가 중심이고, 이 표로 선정심의(안)·확정 결과를 한글(hwpx)로 만든다.
   날짜는 앞 날짜로 정해지는 것(소집 공고=회의 7일 전, 확정·공개=심의일 등)을 미리 채운다.
   기준
   - 경상남도교육청 「2026학년도 검정·인정도서 선정 매뉴얼」(2025. 9.) = 업무체크리스트 '교과용도서선정위원회'(gys_2_7)
   - 「2026학년도 1학기 교과용도서 주문 및 정산절차 안내」, 학교업무 도움자료(초등) 2-09 교과서(el_2_09)
   - 교과용도서에 관한 규정 제3조·제30조·제31조
   단계 설명·기안문·붙임 파일은 원래 '교과용도서 선정 길잡이'의 자료(SRC)를 쓴다.
   저장: tb.p (localStorage)
   ====================================================================== */
(function(){ "use strict";
var SRC=/*__SRC__*/null;
var U=function(){ return window.TKCV||{}; };
function el(t,c,x){var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e}
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
        set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var WD="일월화수목금토";
function pd(v){ var m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(v||"").trim()); return m?new Date(+m[1],+m[2]-1,+m[3]):null; }
function iso(d){ return d?d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2):""; }
function today(){ return iso(new Date()); }
function addDays(s,n){ var d=pd(s); if(!d) return ""; d.setDate(d.getDate()+n); return iso(d); }
function dot(s){ var d=pd(s); return d?d.getFullYear()+". "+(d.getMonth()+1)+". "+d.getDate()+".":""; }
function dotw(s){ var d=pd(s); return d?dot(s)+"("+WD[d.getDay()]+")":""; }
function dday(s){ var d=pd(s), t=pd(today()); return d?Math.round((d-t)/864e5):null; }
function ddTxt(n){ return n==null?"":n===0?"오늘":n>0?"D-"+n:(-n)+"일 지남"; }
function ddCls(n){ return n==null?"":n<0?"late":n<=7?"soon":""; }
function comma(n){ return n==null||n===""?"":Math.round(n).toLocaleString("ko-KR"); }
function defYear(){ var d=new Date(); return String(d.getFullYear()+1); }   /* 올가을에 고르는 책은 다음 학년도에 쓴다 */
function load(){ var p=LS.get("tb.p",null); if(!p||typeof p!=="object") p={};
  p.f=p.f||{}; p.subs=p.subs||[]; p.done=p.done||{}; p.tk=p.tk||{}; p.autoV=p.autoV||{};
  if(!p.f.year) p.f.year=defYear(); if(!p.f.dept) p.f.dept="교무부"; if(!p.f.sec) p.f.sec="행정실장";
  if(!p.f.school){ try{ var s=JSON.parse(localStorage.getItem("ct.school")||'""'); if(s) p.f.school=s; }catch(e){} }
  if(!p.f.level){ var s2=p.f.school||""; p.f.level=/초/.test(s2)?"초":/고등|고$/.test(s2)?"고":"중"; }
  return p; }

var STG=[["s1","계획"],["s2","협의회"],["s3","상정"],["s4","심의"],["s5","확정"],["s6","주문"],["s7","추가·반품"],["s8","정산"]];
var LEVEL={"초":"초등학교","중":"중학교","고":"고등학교"};

var CSS=[
".tbv .cv-pane{padding-bottom:12px}",
".tb-hero{display:flex;gap:8px 12px;align-items:center;flex-wrap:wrap;margin:2px 0 4px}",
".tb-hero input,.tb-hero select{font:inherit;font-size:15px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0}",
".tb-hero .sch{flex:1 1 220px;max-width:340px}",
".tb-hero .yr{width:92px}",
".tb-hero label{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--ink-2)}",
".tb-hero .sp{flex:1}",
".tb-now{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:10px 0 0;font-size:14px}",
".tb-now b{font-size:15px}",
".tb-say{font-size:14px;color:var(--ink-2);margin:0 0 10px;line-height:1.6}",
".tb-sub{font-size:13.5px;font-weight:700;color:var(--ink);margin:18px 0 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
".tb-sub small{font-weight:400;color:var(--muted);font-size:12.5px}",
".tb-flow{display:grid;gap:6px;margin:0;padding:0;list-style:none;counter-reset:f}",
".tb-flow li{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:start;background:var(--surface-2);border-radius:10px;padding:9px 12px;font-size:13.5px;line-height:1.55}",
".tb-flow li .who{grid-row:1/3;font-size:11.5px;font-weight:700;border-radius:6px;padding:2px 7px;background:var(--surface-3);color:var(--ink-2);white-space:nowrap}",
".tb-flow li .who.h{background:var(--accent-soft);color:var(--accent-ink)}",
".tb-flow li b{font-weight:650;color:var(--ink)}",
".tb-flow li span.d{color:var(--ink-2)}",
".tb-tk{margin:0;padding:0;list-style:none;display:grid;gap:4px}",
".tb-tk li label{display:flex;gap:8px;align-items:flex-start;font-size:13.5px;line-height:1.5;cursor:pointer;color:var(--ink)}",
".tb-tk li input{margin-top:3px;flex:0 0 auto;width:auto}",
".tb-tk li i{font-style:normal;font-size:11px;font-weight:700;border-radius:5px;padding:1px 6px;background:var(--surface-3);color:var(--ink-2);flex:0 0 auto;margin-top:1px}",
".tb-tk li i.h{background:var(--accent-soft);color:var(--accent-ink)}",
".tb-tk li.on span{color:var(--muted);text-decoration:line-through}",
".tb-rules{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:5px}",
".tb-rules li{font-size:13.5px;line-height:1.55;color:var(--ink-2);padding-left:14px;position:relative}",
".tb-rules li::before{content:\"\";position:absolute;left:2px;top:.62em;width:5px;height:5px;border-radius:50%;background:var(--accent)}",
".tb-subs{display:grid;gap:8px}",
".tb-sr{display:grid;grid-template-columns:minmax(0,1.1fr) auto 28px;gap:8px;align-items:center;background:var(--surface-2);border-radius:10px;padding:8px 10px}",
".tb-sr.pk{grid-template-columns:minmax(0,1fr)}",
".tb-sr input,.tb-sr select{font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box}",
".tb-sr .one{display:flex;gap:6px;align-items:center;font-size:13px;color:var(--ink-2);white-space:nowrap}",
".tb-sr .one input{width:auto}",
".tb-sr .x{font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:2px 6px}",
".tb-sr .x:hover{color:var(--neg)}",
".tb-pk{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:6px}",
".tb-pk label{display:grid;gap:3px;font-size:11.5px;font-weight:700;color:var(--muted);min-width:0}",
".tb-oq{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:6px}",
".tb-oq label{display:grid;gap:3px;font-size:11.5px;font-weight:700;color:var(--muted);min-width:0}",
".tb-oq input{font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box;text-align:right}",
".tb-oqv{font-size:13px;color:var(--accent-ink);font-weight:600;margin-top:6px}",
".tb-sh{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-size:14px;font-weight:650}",
".tb-sh small{font-weight:400;color:var(--muted);font-size:12.5px}",
".tb-add{font:inherit;font-size:13.5px;border:1px dashed var(--line-strong);background:none;color:var(--accent-ink);border-radius:10px;padding:7px 12px;cursor:pointer;justify-self:start}",
".tb-docs{display:grid;gap:8px;margin-top:6px}",
".tb-doc{border:1px solid var(--line);border-radius:12px;background:var(--surface);overflow:hidden}",
".tb-dh{font:inherit;display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;padding:11px 14px;cursor:pointer;color:var(--ink)}",
".tb-dh .who{flex:0 0 auto;font-size:11.5px;font-weight:700;border-radius:6px;padding:2px 7px;background:var(--surface-3);color:var(--ink-2)}",
".tb-dh .who.h{background:var(--accent-soft);color:var(--accent-ink)}",
".tb-dh .tt{flex:1;min-width:0;font-size:14.5px;font-weight:600;line-height:1.4}",
".tb-dh .ar{flex:0 0 auto;color:var(--muted);transition:transform .15s}",
".tb-doc.open .tb-dh .ar{transform:rotate(90deg)}",
".tb-db{display:none;border-top:1px solid var(--line);padding:12px 14px}",
".tb-doc.open .tb-db{display:block}",
".tb-txt{white-space:pre-wrap;font-size:13.5px;line-height:1.75;background:var(--surface-2);border-radius:10px;padding:12px 14px;margin:0;color:var(--ink);word-break:keep-all;overflow-wrap:anywhere}",
".tb-txt .tl{display:block;font-weight:700;margin-bottom:6px}",
".tb-txt mark{background:none;color:var(--accent-ink);font-weight:600}",
".tb-txt mark.ex{color:var(--warn);font-weight:400;background:var(--warn-bg);border-radius:3px}",
".tb-dfoot{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}",
".tb-files{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}",
".tb-file{font:inherit;font-size:12.5px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink-2);border-radius:8px;padding:5px 10px;cursor:pointer;display:inline-flex;gap:6px;align-items:center;text-align:left}",
".tb-file:hover{border-color:var(--accent);color:var(--accent-ink)}",
".tb-file i{font-style:normal;font-size:10.5px;font-weight:700;border-radius:4px;padding:1px 4px;background:var(--surface-3);color:var(--muted)}",
".tb-file.mk i{background:var(--accent-soft);color:var(--accent-ink)}",
"@media (max-width:640px){.tbv .cv-ix .t{font-size:10.5px;letter-spacing:-.04em;text-overflow:clip}.tbv .cv-calc{grid-template-columns:1fr 1fr}.tb-pk{grid-template-columns:minmax(0,1fr)}.tb-oq{grid-template-columns:repeat(3,minmax(0,1fr))}.tb-sr{grid-template-columns:minmax(0,1fr) 28px}.tb-sr .one{grid-column:1/-1;grid-row:2}}"
].join("\n");

function build(root){
  var T=U();
  if(!document.getElementById("cv-css")&&T.CSS){ var s0=el("style"); s0.id="cv-css"; s0.textContent=T.CSS; document.head.appendChild(s0); }
  if(!document.getElementById("tb-css")){ var s1=el("style"); s1.id="tb-css"; s1.textContent=CSS; document.head.appendChild(s1); }
  var P=load(), view={open:null}, F=P.f, BOOKS=null;
  root.textContent=""; var app=el("div","cv tbv"); root.appendChild(app);
  function put(){ LS.set("tb.p",P); }
  function btn(t,cls,fn){ var b=el("button",cls||"btn",t); b.type="button"; if(fn) b.onclick=fn; return b; }
  function msg(box,t,kind){ box.textContent=t||""; box.className="tkmsg"+(t?" on "+(kind||"ok"):""); }
  function V(k){ return String(F[k]==null?"":F[k]).trim(); }
  function Y(){ var y=parseInt(V("year"),10); return y>=2000&&y<=2100?y:null; }
  function workDays(s,n){ return T.workDays?T.workDays(s,n):addDays(s,n); }
  function isWork(d){ return !!d&&workDays(addDays(d,-1),1)===d; }
  function prevWork(d){ for(var i=0;d&&i<10&&!isWork(d);i++) d=addDays(d,-1); return d; }
  function subs(){ return P.subs.filter(function(s){ return String(s.name||"").trim(); }); }
  function step(id){ for(var i=0;i<SRC.STEPS.length;i++) if(SRC.STEPS[i].id===id) return SRC.STEPS[i]; }
  function hasAdd(){ return !!P.f.addRet; }
  /* 주문 기간을 공문으로 고치지 않았으면 추정값(예년 10월) */
  function oEst(){ var e=V("orderE"); return !!e&&P.autoV.orderE===e; }
  var O_EST="2027학년도 주문 기간은 경남교육청 공문으로 확인하세요. 예년에는 9월 말에 안내하고 10월에 주문했어요(2025학년도용 10. 7.~10. 25., 2026학년도용 10. 1.~10. 31.).";
  function oEstTxt(){ var y=Y(); return y?O_EST.replace(/^2027/,String(y)):O_EST; }

  /* ---- 날짜 미리 채우기(직접 고친 값·끝난 단계는 그대로) ---- */
  function prefill(){ var ch=false, y=Y();
    function A(k,v,st){ if(P.done[st]||!v) return; var cur=V(k); if(cur&&cur!==P.autoV[k]) return; if(cur!==v){ F[k]=v; ch=true; } P.autoV[k]=v; }
    if(y){ A("expoS",(y-1)+"-09-15","s1"); A("expoE",(y-1)+"-10-31","s1");          /* 전시·선정: 9월 중순~10월 말(2026학년도용 2025. 9. 15.~10. 31.) */
      A("orderS",(y-1)+"-10-01","s6"); A("orderE",(y-1)+"-10-31","s6");              /* NEIS 주문 10. 1.~10. 31. */
      A("settle",hasAdd()?y+"-03-31":addDays(y+"-03-01",-1),"s8"); }                  /* 정산 2월 말(추가·반품 시 3월 말) */
    var sw=V("sw"); A("notice",sw?prevWork(addDays(sw,-7)):"","s3");               /* 학운위 소집 통지: 회의 7일 전(토·공휴일이면 앞 근무일) */
    A("due",V("notice")?prevWork(addDays(V("notice"),-1)):"","s2");                /* 추천 의견서는 소집 공고 전에 모여야 안건이 된다 */
    A("fix",sw,"s5"); A("pub",V("fix"),"s5");
    return ch; }

  /* ---- 기안문 채우기 ---- */
  function rng(a,b){ return V(a)&&V(b)?dot(V(a))+" ~ "+dot(V(b)):""; }
  var FV={school:function(){ return V("school"); }, year:function(){ return Y()?String(Y()):""; }, prev:function(){ return Y()?String(Y()-1):""; },
    dept:function(){ return V("dept"); }, sec:function(){ return V("sec"); }, expo:function(){ return rng("expoS","expoE"); },
    train:function(){ return dotw(V("train")); }, due:function(){ return dotw(V("due")); },
    sw:function(){ var s=dotw(V("sw")); return s?s+(V("swTime")?" "+V("swTime"):""):""; },
    order:function(){ return rng("orderS","orderE"); }, nsub:function(){ return subs().length?String(subs().length):""; },
    subjects:function(){ return subs().map(function(s){ return s.name.trim(); }).join(", "); }};
  var PH={school:"학교명",year:"학년도",prev:"선정 연도",dept:"담당 부서",sec:"간사 직위",expo:"전시 기간",train:"연수 일시",due:"제출 기한",sw:"학운위 일시",order:"주문 기간",nsub:"과목 수",subjects:"대상 과목"};
  function parse(t){ var out=[], re=/\{\{(\w+)\}\}/g, last=0, m;
    while((m=re.exec(t))){ if(m.index>last) out.push({t:t.slice(last,m.index)}); var v=FV[m[1]]?FV[m[1]]():""; out.push({t:v||PH[m[1]]||m[1],k:1,ok:!!v}); last=re.lastIndex; }
    if(last<t.length) out.push({t:t.slice(last)}); return out; }
  function plain(t){ return parse(t).map(function(s){ return s.t; }).join(""); }
  function paint(box,t){ parse(t).forEach(function(s){ if(!s.k) box.appendChild(document.createTextNode(s.t)); else box.appendChild(el("mark",s.ok?"":"ex",s.t)); }); }

  /* ---- 한글(hwpx): 학운위 도구의 한글 만들기(window.TKHX) ---- */
  function P0(x,o){ return Object.assign({t:"p",text:x,size:12,lh:1.6,font:"m"},o||{}); }
  function hwpx(blocks,name,m){ var H=window.TKHX; if(!H||!H.build){ msg(m,"한글 만들기 부품을 불러오지 못했어요. 새로고침해 주세요.","warn"); return; }
    T.saveFile(H.build([{blocks:blocks}],name),(V("school")?V("school")+"_":"")+name.replace(/[\\/:*?"<>|]/g,"_")+".hwpx").then(function(){ msg(m,name+"을(를) 한글로 내려받았어요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }
  function draftBlocks(d){ var out=[P0(plain(d.title),{b:true,size:15}),{t:"p",text:"",size:8}];
    plain(d.body).split("\n").forEach(function(l){ var ind=/^\s{2,}/.test(l); out.push(P0(l.replace(/^\s+/,""),ind?{ind:4,hang:3}:{})); }); return out; }
  function cell(x,o){ return Object.assign({t:x,al:"left",size:10.5},o||{}); }
  function th(x){ return cell(x,{b:true,al:"center",bg:"#EDEDED"}); }
  function pickTxt(p){ return p?[p.t,p.pub,p.au].filter(Boolean).join(" · "):""; }
  function planBlocks(final){ var y=Y()?String(Y()):"○○○○", rows=[[th("과목"),th(final?"확정 도서":"순위"),th("도서명"),th("출판사"),th("저자"),th("정가(원)"),th("비고")]];
    subs().forEach(function(s){ var ps=(s.p||[]).filter(Boolean); if(final) ps=ps.slice(0,1); if(!ps.length) ps=[null];
      ps.forEach(function(p,i){ rows.push([i===0?cell(s.name.trim(),{rs:ps.length,al:"center",b:true}):null,cell(final?"확정":(i+1)+"순위",{al:"center"}),cell(p?p.t:"○○"),cell(p?p.pub:"○○"),cell(p?p.au:"○○"),cell(p&&p.pr?comma(p.pr):"",{al:"right"}),cell(i===0&&s.one?"1책 1도서":"",{al:"center"})].filter(function(c){ return c!==null; })); }); });
    var out=[P0((final?y+"학년도 교과용도서 선정 결과(확정)":y+"학년도 교과용도서(검·인정도서) 선정심의(안)"),{b:true,size:16,al:"center"}),{t:"p",text:"",size:8},
      P0(V("school")||"○○학교",{al:"right"}),{t:"p",text:"",size:6},
      {t:"tbl",w:[22,16,44,26,20,18,18],font:"m",size:10.5,pad:1,rows:rows},{t:"p",text:"",size:8}];
    if(!final){ out.push(P0("※ 발행사 운영난 등으로 재주문이 필요할 경우 학교운영위원회를 별도 개최하지 않고 차순위 도서로 자동 확정함.",{size:11}));
      out.push(P0("※ 1책 1도서 과목은 교과협의회 의견수렴을 생략하고 학교운영위원회 심의만 거침.",{size:11})); }
    else out.push(P0("※ 개인별 평가 결과·의견은 공개하지 않음. 관계 서류는 새 교과용도서 선정 시까지 "+(V("dept")||"담당 부서")+" 보관.",{size:11}));
    return out; }
  function fixMatch(rows){ /* 병합 칸(rs) 때문에 빈 칸 없이 그대로 둔다 */ return rows; }

  /* ---- 붙임 파일(tools/tb/) ---- */
  var EXT={f05:"hwp",f06:"hwpx",f02:"hwp",f04:"hwp",f01:"pdf",f09:"pdf",f10:"pdf",f11:"pdf",f12:"pdf",f07:"hwp",f08:"xlsx",f18:"pdf"};
  function fileById(id){ for(var i=0;i<SRC.FILES.length;i++) if(SRC.FILES[i][0]===id) return SRC.FILES[i]; }
  function getFile(id,b,m){ var f=fileById(id), lab=b.textContent; b.disabled=true;
    fetch("tools/tb/"+id+"."+EXT[id]).then(function(r){ if(!r.ok) throw new Error("파일을 찾지 못했어요("+r.status+")"); return r.blob(); })
      .then(function(bl){ return T.saveFile(bl,f[1]); }).then(function(){ msg(m,f[2]+"을(를) 내려받았어요.","ok"); },function(e){ msg(m,e.message||"내려받지 못했어요.","bad"); })
      .then(function(){ b.disabled=false; b.textContent=lab; }); }
  function chips(box,ids,m,make){ var w=el("div","tb-files"); box.appendChild(w);
    (make||[]).forEach(function(x){ var b=btn("","tb-file mk"); b.appendChild(el("i",null,"만들기")); b.appendChild(document.createTextNode(x[0])); b.onclick=x[1]; w.appendChild(b); });
    ids.forEach(function(id){ var f=fileById(id); if(!f) return; var b=btn("","tb-file"); b.appendChild(el("i",null,EXT[id].toUpperCase())); b.appendChild(document.createTextNode(f[2])); b.title=f[3]; b.onclick=function(){ getFile(id,b,m); }; w.appendChild(b); }); }

  /* ---- 화면 부품 ---- */
  function grid(pn){ var g=el("div","tkgridf"); pn.appendChild(g); return g; }
  function sub(pn,t,s){ var h=el("div","tb-sub",t); if(s) h.appendChild(el("small",null,s)); pn.appendChild(h); return h; }
  function fld(g,k,label,o){ o=o||{}; var f=el("label","tkf"+(o.wide?" wide":"")); f.appendChild(el("span","tkfl",label)); var i=el("input"); i.type=o.type||"text";
    if(o.ph) i.placeholder=o.ph; i.value=V(k); f.appendChild(i); if(o.hint) f.appendChild(el("small",null,o.hint)); g.appendChild(f);
    i.addEventListener(o.type==="date"||o.type==="time"?"change":"input",function(){ F[k]=i.value.trim(); put(); if(o.live) o.live(); if(o.type==="date"&&prefill()){ put(); draw(); } });
    return i; }
  function tiles(box,items){ box.textContent=""; items.forEach(function(x){ if(!x) return; var d=el("div","cv-num "+(x.c||"")); d.appendChild(el("span",null,x.l)); d.appendChild(el("b",null,x.v)); if(x.s) d.appendChild(el("small",null,x.s)); box.appendChild(d); }); }
  function calc(pn){ var c=el("div","cv-calc"); pn.appendChild(c); return c; }
  function dd(s){ var n=dday(s); return s?{v:dot(s),s:ddTxt(n),c:P.done[view.cur]?"":ddCls(n)}:{v:"-",s:""}; }
  function flow(pn,st){ var u=el("ol","tb-flow"); pn.appendChild(u);
    st.flow.forEach(function(f){ var li=el("li"); li.appendChild(el("span","who"+(/행정/.test(f[0])&&!/교무/.test(f[0])?" h":""),f[0])); li.appendChild(el("b",null,f[1])); li.appendChild(el("span","d",f[2])); u.appendChild(li); }); }
  function ticks(pn,st){ var u=el("ul","tb-tk"); pn.appendChild(u);
    var L=st.g.map(function(t,i){ return ["g"+i,"교무",t]; }).concat(st.h.filter(function(t){ return !/^\(해당 없음\)/.test(t); }).map(function(t,i){ return ["h"+i,"행정",t]; }));
    L.forEach(function(x){ var key=st.id+x[0], li=el("li",P.tk[key]?"on":""), lb=el("label"), cb=el("input"); cb.type="checkbox"; cb.checked=!!P.tk[key];
      cb.onchange=function(){ P.tk[key]=cb.checked; li.className=cb.checked?"on":""; put(); }; lb.appendChild(cb); lb.appendChild(el("i",x[1]==="행정"?"h":"",x[1]));
      lb.appendChild(el("span",null,x[2].replace(/<[^>]+>/g,""))); li.appendChild(lb); u.appendChild(li); }); }
  function rules(pn,list){ var u=el("ul","tb-rules"); pn.appendChild(u); list.forEach(function(t){ u.appendChild(el("li",null,t)); }); }
  var OPEN=LS.get("tb.open",{});
  function docs(pn,st,make){ var list=st.docs.map(function(k){ return [k,SRC.DOCS[k]]; }).filter(function(x){ return x[1]; });
    sub(pn,"기안문·붙임",list.length?"색 글자는 넣은 값, 노란 칸은 아직 비어 있는 곳":"");
    var w=el("div","tb-docs"); pn.appendChild(w); var fm=el("div","tkmsg");
    list.forEach(function(x){ var d=x[1], box=el("div","tb-doc"+(OPEN[x[0]]?" open":"")), hd=btn("","tb-dh");
      hd.appendChild(el("span","who"+(d.role==="haeng"?" h":""),d.role==="haeng"?"행정":"교무")); hd.appendChild(el("span","tt",plain(d.title))); hd.appendChild(el("span","ar","›")); box.appendChild(hd);
      var bd=el("div","tb-db"); box.appendChild(bd); hd.onclick=function(){ box.classList.toggle("open"); OPEN[x[0]]=box.classList.contains("open"); LS.set("tb.open",OPEN); };
      bd.appendChild(el("p","cv-law",d.when));
      var pre=el("div","tb-txt"); bd.appendChild(pre); var tl=el("span","tl"); paint(tl,d.title); pre.appendChild(tl); paint(pre,d.body);
      var ft=el("div","tb-dfoot"), m=el("div","tkmsg"); bd.appendChild(ft); bd.appendChild(m);
      ft.appendChild(btn("본문 복사","btn ghost",function(){ var t=plain(d.title)+"\n\n"+plain(d.body); (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ msg(m,"복사했어요.","ok"); },function(){ msg(m,"복사하지 못했어요. 글을 직접 골라 복사해 주세요.","warn"); }); }));
      ft.appendChild(btn("한글로","btn ghost",function(){ hwpx(draftBlocks(d),plain(d.title),m); }));
      w.appendChild(box); });
    var fs=[]; st.docs.forEach(function(k){ (SRC.DOCS[k]&&SRC.DOCS[k].files||[]).forEach(function(f){ if(fs.indexOf(f)<0) fs.push(f); }); });
    var no=String(SRC.STEPS.indexOf(st)+1); SRC.FILES.forEach(function(f){ if(fs.indexOf(f[0])<0&&new RegExp("(^|[^\\d])"+no+"단계|"+no+"~|~"+no+"단계").test(f[4])) fs.push(f[0]); });
    chips(pn,fs,fm,make); pn.appendChild(fm); }

  /* ---- 단계 ---- */
  var S={};
  S.s1=function(pn,st){
    var g=grid(pn), c;
    fld(g,"expoS","전시 시작",{type:"date",live:function(){ up(); }}); fld(g,"expoE","전시 끝",{type:"date",live:function(){ up(); }});
    fld(g,"train","부조리 예방 연수일",{type:"date"}); fld(g,"dept","담당 부서",{ph:"교무부"});
    c=calc(pn);
    function up(){ var a=V("expoS"), b=V("expoE"), n=a&&b?Math.round((pd(b)-pd(a))/864e5)+1:null, oe=V("orderE");
      tiles(c,[{l:"전시·선정 기간",v:n?n+"일":"-",s:"공문 날짜로 고쳐요(2026학년도용 2025. 9. 15.~10. 31.)"},
        {l:"NEIS 주문 마감",v:oe?dot(oe):"-",s:oe?(oEst()?"추정 · ":"")+ddTxt(dday(oe)):"",c:oe&&!P.done.s6?ddCls(dday(oe)):""},
        {l:"선정 대상 과목",v:subs().length+"과목",s:subs().filter(function(s){ return s.one; }).length?"1책 1도서 "+subs().filter(function(s){ return s.one; }).length+"과목":"신간본이 있는 과목"}]); }
    up();
    sub(pn,"선정 대상 과목","교육청 공문의 도서 목록에서 신간본이 있는 과목");
    var box=el("div","tb-subs"); pn.appendChild(box);
    function row(s){ var r=el("div","tb-sr"), i=el("input"); i.placeholder="과목 (예: 국어, 수학Ⅰ)"; i.value=s.name||""; i.oninput=function(){ s.name=i.value; put(); up(); }; r.appendChild(i);
      var o=el("label","one"), cb=el("input"); cb.type="checkbox"; cb.checked=!!s.one; cb.onchange=function(){ s.one=cb.checked; put(); up(); }; o.appendChild(cb); o.appendChild(document.createTextNode("1책 1도서")); o.title="후보가 한 종뿐 — 협의회 의견수렴 생략, 학운위 심의는 해요"; r.appendChild(o);
      r.appendChild(btn("×","x",function(){ P.subs.splice(P.subs.indexOf(s),1); put(); r.remove(); up(); })); box.appendChild(r); return i; }
    if(!P.subs.length) P.subs.push({name:""}); P.subs.forEach(row);
    pn.appendChild(btn("+ 과목 더하기","tb-add",function(){ var s={name:""}; P.subs.push(s); put(); row(s).focus(); }));
  };
  S.s2=function(pn,st){
    var g=grid(pn), c=null; fld(g,"due","추천 의견서 제출 기한",{type:"date",hint:"학운위 날짜를 넣으면 소집 공고 전날로 채워요",live:function(){ up(); }});
    c=calc(pn); function up(){ var x=dd(V("due")); tiles(c,[{l:"의견서 제출 기한",v:x.v,s:x.s,c:x.c},V("level")==="초"?{l:"교과협의회 등",v:"학교 실정에 따라",s:"교과·보직·경력 등을 고려해 구성 · 3인 이상 권장 · 저자 제외"}:{l:"교과협의회",v:"3인 이상 권장",s:"10학급 미만은 2인 이상 · 저자 제외"},{l:"평가표",v:"7개 영역 · 100점",s:"가격(재정) 항목을 꼭 넣어요"}]); } up();
    sub(pn,"과목별 추천 도서","도서 목록에서 1~3순위를 골라요");
    var box=el("div","tb-subs"); pn.appendChild(box); var lm=el("div","tkmsg"); pn.appendChild(lm);
    function draw2(){ box.textContent=""; var L=subs(); if(!L.length){ box.appendChild(el("p","cv-law","'계획'에서 선정 대상 과목을 먼저 넣어 주세요.")); return; }
      L.forEach(function(s){ var r=el("div","tb-sr pk"), h=el("div","tb-sh",s.name.trim()); if(s.one) h.appendChild(el("small",null,"1책 1도서 · 의견수렴 생략")); r.appendChild(h);
        var cand=cands(s.name), pk=el("div","tb-pk"); r.appendChild(pk); s.p=s.p||[];
        for(var k=0;k<(s.one?1:3);k++)(function(k){ var lb=el("label",null,(k+1)+"순위"), se=el("select"), o0=el("option",null,cand.length?"고르기":"목록에 없음"); o0.value=""; se.appendChild(o0);
          cand.forEach(function(b,j){ var o=el("option",null,b[3]+" · "+b[4]+(b[5]?" · "+b[5]:"")+(b[6]?" · "+comma(b[6])+"원":"")); o.value=String(j); se.appendChild(o); });
          var cur=s.p[k]; if(cur) cand.forEach(function(b,j){ if(b[3]===cur.t&&b[4]===cur.pub&&b[5]===cur.au) se.value=String(j); });
          if(cur&&se.value===""){ var oc=el("option",null,pickTxt(cur)); oc.value="cur"; se.appendChild(oc); se.value="cur"; }
          se.onchange=function(){ if(se.value==="cur") return; var b=cand[+se.value]; s.p[k]=se.value===""?null:{t:b[3],pub:b[4],au:b[5],pr:typeof b[6]==="number"?b[6]:null,k:b[0],cur:b[8]}; put(); };
          lb.appendChild(se); pk.appendChild(lb); })(k);
        box.appendChild(r); }); }
    function cands(name){ if(!BOOKS) return []; var q=String(name||"").replace(/\s+/g,""), lv=LEVEL[V("level")]||"";
      if(!q) return []; return BOOKS.filter(function(b){ return b[0]!=="국정"&&b[0]!=="특수"&&(!lv||b[1].indexOf(lv)===0)&&b[3].replace(/\s+/g,"").indexOf(q)>=0; })
        .sort(function(a,b){ return (b[8]==="2022")-(a[8]==="2022")||a[3].localeCompare(b[3])||a[4].localeCompare(b[4]); }).slice(0,80); }
    if(BOOKS) draw2(); else { box.appendChild(el("p","cv-law","도서 목록(5,440권)을 불러오는 중…"));
      fetch("tools/tb/books.json").then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){ BOOKS=j.books||[]; draw2(); },function(){ box.textContent=""; msg(lm,"도서 목록을 불러오지 못했어요. 누리집에서 열어 주세요.","warn"); }); }
  };
  S.s3=function(pn,st){
    var g=grid(pn), c;
    fld(g,"sw","학운위 회의 날짜",{type:"date"}); fld(g,"swTime","시각",{type:"time"}); fld(g,"notice","소집 공고·통지일",{type:"date",live:function(){ up(); }}); fld(g,"sec","간사 직위",{ph:"행정실장"});
    c=calc(pn); function up(){ var sw=V("sw"), lim=sw?addDays(sw,-7):"", n=V("notice"), ok=n&&lim?n<=lim:null;
      tiles(c,[{l:"소집 통지 기한",v:lim?dot(lim)+"까지":"-",s:"회의 7일 전 · 일시·장소·안건, 누리집 공개"},{l:"소집 공고일",v:n?dot(n):"-",s:ok==null?"":ok?"기한 안이에요":"7일이 안 돼요",c:ok==null?"":ok?"ok":"bad"},
        {l:"추천 의견서 마감",v:V("due")?dot(V("due")):"-",s:"소집 공고 전에 모여야 안건이 돼요"}]); } up();
  };
  S.s4=function(pn,st){ var c=calc(pn), x=dd(V("sw"));
    tiles(c,[{l:"학운위 심의",v:x.v,s:x.s,c:x.c},{l:"심의 대상",v:subs().length+"과목",s:"기준·절차의 타당성과 공정성"},{l:"원안과 다르면",v:"서식 4",s:"심의 의견서를 회의록에 붙여요"}]);
    pn.appendChild(el("p","cv-law","회의 문서(소집 공고·회의록)는 학운위 문서 도구에서 만들어요."));
    pn.appendChild(btn("학운위 문서 도구 열기 →","cv-back",function(){ if(window.tkShow) window.tkShow("hk"); })); };
  S.s5=function(pn,st){ var g=grid(pn), c;
    fld(g,"fix","학교장 확정일",{type:"date",live:function(){ up(); }}); fld(g,"pub","누리집 공개일",{type:"date",live:function(){ up(); }});
    c=calc(pn); function up(){ var oe=V("orderE"), f=V("fix"), late=f&&oe&&f>oe;
      tiles(c,[{l:"확정",v:f?dot(f):"-",s:late?"NEIS 주문 마감보다 늦어요":"심의 결과를 존중해 확정",c:late?"bad":""},{l:"공개 항목",v:"기준표·절차·결과",s:"개인별 평가·의견은 빼요"},{l:"보관",v:"새 교과서 선정 때까지",s:"평가표·총괄표·의견서·회의록"}]); } up(); };
  S.s6=function(pn,st){ var g=grid(pn), c;
    fld(g,"orderS","NEIS 주문 시작",{type:"date",live:function(){ up(); }}); fld(g,"orderE","NEIS 주문 마감",{type:"date",live:function(){ up(); }}); fld(g,"orderDone","제출 완료일",{type:"date",live:function(){ up(); }});
    if(oEst()) pn.appendChild(el("p","cv-law","추정값 · "+oEstTxt()));
    c=calc(pn); function up(){ var x=dd(V("orderE")), dn=V("orderDone");
      var q=qty(); tiles(c,[{l:"주문 마감",v:x.v,s:dn?(dn<=V("orderE")?"기한 안에 제출했어요":"마감을 넘겼어요"):(oEst()?"추정 · ":"")+x.s,c:dn?(dn<=V("orderE")?"ok":"bad"):x.c},
        {l:"주문 부수",v:q.n?comma(q.tb)+"부":"-",s:q.n?"교과서 "+comma(q.tb)+" · 지도서 "+comma(q.gd)+(q.self?" · 자체예산 지도서 "+q.self:""):"아래 과목별로 학생·교사 수를 넣어요"},
        {l:"추정 금액",v:q.amt?comma(q.amt)+"원":"-",s:q.miss?"정가 없는 책 "+q.miss+"종은 빠져요":"교과서 정가 × 부수",c:""}]); } up();
    if(V("level")==="초") pn.appendChild(el("p","cv-law","초등학교는 2학기 교과서·지도서를 따로 주문해요. 4월 초 교육청 안내에 따라 NEIS로 주문해 교육지원청에 내요(2026년은 4. 15.까지). 근거: 「2026학년도 2학기 교과용도서 주문 및 정산절차 안내」"));
    sub(pn,"과목별 주문 부수","교과서 = 학생 + 교사 − 재활용 · 지도서는 교과·학년당 1권");
    var box=el("div","tb-subs"); pn.appendChild(box); var L=subs().filter(function(s){ return s.p&&s.p[0]; });
    if(!L.length){ box.appendChild(el("p","cv-law","'협의회'에서 과목별 1순위 도서를 먼저 골라 주세요.")); return; }
    L.forEach(function(s){ s.o=s.o||{}; var o=s.o, b=s.p[0], r=el("div","tb-sr pk"), h=el("div","tb-sh",s.name.trim()); h.appendChild(el("small",null,pickTxt(b)+(b.pr?" · "+comma(b.pr)+"원":""))); r.appendChild(h);
      var pk=el("div","tb-oq"); r.appendChild(pk); var out=el("div","tb-oqv"); r.appendChild(out);
      function show(){ var x=line(s); out.textContent="교과서 "+comma(x.tb)+"부"+(x.amt?" · "+comma(x.amt)+"원":"")+" · 지도서 "+(x.noGd?"NEIS 주문 불가(2022개정 중학교, 자체예산)":comma(x.gd)+"권"); }
      [["gr","학년","1"],["st","학생 수",""],["te","교사 수",""],["re","재활용",""],["gd","지도서",""]].forEach(function(f){ var lb=el("label",null,f[1]), i=el("input"); i.inputMode="numeric"; i.value=o[f[0]]!=null&&o[f[0]]!==""?o[f[0]]:""; i.placeholder=f[0]==="gd"?"1":f[2]||"0";
        i.oninput=function(){ o[f[0]]=i.value.replace(/[^\d]/g,""); put(); show(); up(); }; lb.appendChild(i); pk.appendChild(lb); });
      show(); box.appendChild(r); });
  };
  function noGuide(s){ var b=s.p&&s.p[0]; return V("level")==="중"&&b&&String(b.cur||"").indexOf("2022")>=0; }
  function line(s){ var o=s.o||{}, n=function(k){ return parseInt(o[k],10)||0; }, tb=Math.max(0,n("st")+n("te")-n("re")), ng=noGuide(s), gd=ng?0:(o.gd===""||o.gd==null?1:n("gd")), pr=s.p&&s.p[0]&&s.p[0].pr;
    return {tb:tb,gd:gd,noGd:ng,amt:pr?pr*tb:0,miss:!pr&&tb?1:0}; }
  function qty(){ var r={tb:0,gd:0,amt:0,miss:0,self:0,n:0}; subs().forEach(function(s){ if(!(s.p&&s.p[0])||!s.o) return; var x=line(s); if(!x.tb&&!x.gd) return; r.n++; r.tb+=x.tb; r.gd+=x.gd; r.amt+=x.amt; r.miss+=x.miss; if(x.noGd) r.self++; }); return r; }
  function orderBlocks(){ var y=Y()?String(Y()):"○○○○", rows=[[th("과목"),th("학년"),th("도서명"),th("출판사"),th("학생"),th("교사"),th("재활용"),th("교과서"),th("지도서"),th("금액(원)")]], q=qty();
    subs().forEach(function(s){ if(!(s.p&&s.p[0])||!s.o) return; var o=s.o, b=s.p[0], x=line(s);
      rows.push([cell(s.name.trim(),{al:"center",b:true}),cell(o.gr||"",{al:"center"}),cell(b.t),cell(b.pub),cell(o.st||"0",{al:"right"}),cell(o.te||"0",{al:"right"}),cell(o.re||"0",{al:"right"}),cell(comma(x.tb),{al:"right"}),cell(x.noGd?"자체예산":comma(x.gd),{al:"center"}),cell(x.amt?comma(x.amt):"",{al:"right"})]); });
    rows.push([cell("합계",{cs:7,al:"center",b:true,bg:"#EDEDED"}),cell(comma(q.tb),{al:"right",b:true,bg:"#EDEDED"}),cell(comma(q.gd),{al:"center",b:true,bg:"#EDEDED"}),cell(q.amt?comma(q.amt):"",{al:"right",b:true,bg:"#EDEDED"})]);
    return [P0(y+"학년도 1학기 교과용도서 주문 부수",{b:true,size:16,al:"center"}),{t:"p",text:"",size:8},P0(V("school")||"○○학교",{al:"right"}),{t:"p",text:"",size:6},
      {t:"tbl",w:[20,10,36,22,12,12,13,14,14,22],font:"m",size:10,pad:1,rows:rows},{t:"p",text:"",size:6},
      P0("※ 주문 기준: 현재 재학생 및 교사 수, 지도서는 교과·학년당 최소 수량. 금액은 정가 기준 추정.",{size:11})]; }
  S.s7=function(pn,st){ var g=grid(pn); var w=el("label","tkf"), cb=el("input"); cb.type="checkbox"; cb.checked=hasAdd(); cb.style.width="auto"; w.appendChild(el("span","tkfl","추가·반품"));
    var sp=el("span"); sp.style.display="flex"; sp.style.gap="6px"; sp.style.alignItems="center"; sp.appendChild(cb); sp.appendChild(document.createTextNode("있어요 (정산 기한이 3월 말로)")); w.appendChild(sp); g.appendChild(w);
    cb.onchange=function(){ P.f.addRet=cb.checked; prefill(); put(); draw(); };
    fld(g,"addDate","추가·반품 제출일",{type:"date"});
    pn.appendChild(el("p","cv-law","추가·반품 기간은 교육청 공문으로 정해져요(보통 11월~이듬해 2월). 정산 자료를 저장한 뒤에는 넣을 수 없어요.")); };
  S.s8=function(pn,st){ var g=grid(pn), c;
    fld(g,"deliv","납품 확인일",{type:"date"}); fld(g,"settle","NEIS 정산 기한",{type:"date",live:function(){ up(); }}); fld(g,"settleDone","정산 제출일",{type:"date",live:function(){ up(); }}); fld(g,"paid","대금 지급일",{type:"date"});
    c=calc(pn); function up(){ var x=dd(V("settle")), dn=V("settleDone");
      if(V("level")==="초"&&!pn.querySelector(".tb-el2")){ var n2=el("p","cv-law tb-el2","초등학교 2학기분은 8월까지 공급받고 9월 초까지 따로 정산해요(2026년은 9. 4.까지). 근거: 「2026학년도 2학기 교과용도서 주문 및 정산절차 안내」"); pn.appendChild(n2); }
      tiles(c,[{l:"정산 기한",v:x.v,s:hasAdd()?"추가·반품이 있어 3월 말":"2월 말 (추가·반품 시 3월 말)",c:dn?(dn<=V("settle")?"ok":"bad"):x.c},{l:"가격",v:"가격결정 완료 뒤",s:"'가격결정중'이면 정산 못 해요"},{l:"정산처",v:"검정: 한국교과서협회",s:"국정은 공문으로 발행자 확인"}]); } up(); };
  var MAKE={s3:[["선정심의(안)",function(){ hwpx(planBlocks(false),(Y()||"")+"학년도 교과용도서 선정심의(안)",this.parentNode.nextSibling); }]],
            s6:[["주문 부수표",function(){ hwpx(orderBlocks(),(Y()||"")+"학년도 교과용도서 주문 부수",this.parentNode.nextSibling); }]],
            s5:[["선정 결과(확정)",function(){ hwpx(planBlocks(true),(Y()||"")+"학년도 교과용도서 선정 결과",this.parentNode.nextSibling); }]]};

  /* ---- 화면 ---- */
  function curStage(){ for(var i=0;i<STG.length;i++) if(!P.done[STG[i][0]]) return i; return STG.length; }
  function draw(){
    if(prefill()) put();
    app.textContent="";
    var hero=el("div","tb-hero"), si=el("input","sch"); si.placeholder="학교명 (예: ○○중학교)"; si.value=V("school"); si.setAttribute("aria-label","학교명");
    si.oninput=function(){ F.school=si.value.trim(); put(); }; hero.appendChild(si);
    var lv=el("select"); lv.setAttribute("aria-label","학교급"); ["초","중","고"].forEach(function(k){ var o=el("option",null,LEVEL[k]); o.value=k; lv.appendChild(o); }); lv.value=V("level")||"중";
    lv.onchange=function(){ F.level=lv.value; put(); draw(); }; hero.appendChild(lv);
    var yl=el("label"), yi=el("input","yr"); yi.type="number"; yi.min="2026"; yi.max="2035"; yi.value=V("year"); yl.appendChild(yi); yl.appendChild(document.createTextNode("학년도에 쓸 책")); hero.appendChild(yl);
    yi.onchange=function(){ F.year=yi.value; put(); draw(); };
    hero.appendChild(el("span","sp")); var mb=btn("자료 내보내기","btn ghost"); hero.appendChild(mb); app.appendChild(hero);
    var setBox=el("div"); app.appendChild(setBox); mb.onclick=function(){ if(setBox.firstChild){ setBox.textContent=""; return; } settings(setBox); };
    var cur=curStage(), sel=-1; STG.forEach(function(s,i){ if(s[0]===view.open) sel=i; }); if(sel<0) sel=Math.min(cur,STG.length-1); view.cur=STG[sel][0];
    var now=el("div","tb-now");
    if(cur>=STG.length) now.appendChild(el("b",null,"이번 학년도 교과서 선정·주문·정산을 모두 마쳤어요."));
    else { var st0=step(STG[cur][0]); now.appendChild(el("span","cv-dd",st0.when)); var t=el("span"); t.appendChild(el("b",null,"지금: "+st0.title)); now.appendChild(t);
      var oe=V("orderE"); if(!P.done.s6&&oe){ var n=dday(oe); now.appendChild(el("span","cv-dd "+ddCls(n),"NEIS 주문 마감"+(oEst()?"(추정)":"")+" "+ddTxt(n))); } }
    app.appendChild(now);
    var nv=el("nav","cv-idx"); nv.style.setProperty("--n",STG.length);
    STG.forEach(function(s,i){ var stt=P.done[s[0]]?"done":i===cur?"cur":"todo", b=btn("","cv-ix "+stt+(i===sel?" sel":""),function(){ view.open=s[0]; draw(); });
      if(i===sel) b.setAttribute("aria-current","step"); b.appendChild(el("span","n",stt==="done"?"✓":String(i+1))); b.appendChild(el("span","t",s[1])); nv.appendChild(b); });
    app.appendChild(nv);
    var pn=el("section","cv-pane"); app.appendChild(pn);
    var id=STG[sel][0], st=step(id), hd=el("div","cv-ph"); hd.appendChild(el("h4",null,st.title)); hd.appendChild(el("span",null,st.when+(P.done[id]?" · "+dot(P.done[id])+" 마침":""))); pn.appendChild(hd);
    pn.appendChild(el("p","tb-say",st.sub));
    S[id](pn,st);
    sub(pn,"흐름","누가 무엇을"); flow(pn,st);
    sub(pn,"할 일"); ticks(pn,st);
    if(st.warn&&st.warn.length){ sub(pn,"놓치기 쉬운 것"); rules(pn,st.warn); }
    docs(pn,st,MAKE[id]);
    var nb=el("div","cv-next"); pn.appendChild(nb);
    if(P.done[id]) nb.appendChild(btn("이 단계 다시 열기","btn ghost",function(){ delete P.done[id]; put(); draw(); }));
    else nb.appendChild(btn(sel<STG.length-1?"이 단계 마쳤어요 · "+STG[sel+1][1]+"(으)로":"모두 마쳤어요","btn",function(){ P.done[id]=today(); view.open=sel<STG.length-1?STG[sel+1][0]:id; put(); draw(); top(); }));
    var pr=el("div","cv-pn"); pn.appendChild(pr);
    pr.appendChild(sel>0?btn("← "+STG[sel-1][1],"cv-back",function(){ view.open=STG[sel-1][0]; draw(); top(); }):el("span"));
    if(sel<STG.length-1) pr.appendChild(btn(STG[sel+1][1]+" →","cv-back",function(){ view.open=STG[sel+1][0]; draw(); top(); }));
  }
  function top(){ var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function settings(box){ box.textContent=""; var s=el("div","cv-set"); box.appendChild(s);
    var r=el("div","cv-btns"); s.appendChild(r); var m=el("div","tkmsg"); s.appendChild(m);
    r.appendChild(btn("내보내기","btn ghost",function(){ T.saveFile(new Blob([JSON.stringify(P,null,1)],{type:"application/json"}),"교과서선정_"+(V("year")||"")+"_"+today()+".json").then(function(){ msg(m,"내보냈어요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }));
    var lb=el("label","btn ghost","불러오기"), fi=el("input"); fi.type="file"; fi.accept=".json"; fi.hidden=true; lb.appendChild(fi); r.appendChild(lb);
    fi.onchange=function(){ var f=fi.files[0]; if(!f) return; f.text().then(function(t){ var j=JSON.parse(t); if(!j||!j.f) throw 0; LS.set("tb.p",j); P=load(); F=P.f; draw(); }).catch(function(){ msg(m,"교과서 선정 파일을 읽지 못했어요.","bad"); }); };
    r.appendChild(btn("새 학년도 시작","cv-x",function(){ if(!confirm("지금 기록을 비우고 다음 학년도를 새로 시작할까요? (먼저 내보내기를 권해요)")) return;
      LS.set("tb.p",{f:{school:V("school"),level:V("level"),dept:V("dept"),sec:V("sec"),year:String((Y()||+defYear()-1)+1)}}); P=load(); F=P.f; view.open=null; draw(); }));
  }
  draw();
}
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.tb=build;
})();
