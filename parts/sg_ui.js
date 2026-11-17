/* ======================================================================
   급여 송금 — 사립학교 월 급여 송금을 다섯 단계(좌→우)로 따라간다.
     급여대장 → 사학연금 → 계좌 → 송금내역서 → 납부
   한 달 = 장부 한 칸(귀속월). 급여대장·PDF는 이 브라우저 안에서만 읽는다.
   기한: 원천징수 소득세 다음 달 10일(소득세법 제128조), 지방소득세도 같은 날,
         4대 보험료 다음 달 10일(업무체크리스트 '4대 보험료') — 토·공휴일이면 다음 근무일(국세기본법 제5조).
   읽기·계산·엑셀 쓰기 엔진은 원래 '송금내역서 생성기'(src/sg.html) 그대로이고, 계좌 설정도 같은 저장소(kbg.songeum.cfg)를 쓴다.
   저장: sg.p (localStorage)
   ====================================================================== */
(function(){ "use strict";
var U=function(){ return window.TKCV||{}; };
/* 원래 엔진이 쓰는 라이브러리(JSZip·pdf.js)는 필요할 때 불러온다 */
var LIB={};
function loadJs(urls){ return urls.reduce(function(p,u){ return p.catch(function(){ return new Promise(function(ok,no){ var s=document.createElement("script"); s.src=u; s.onload=ok; s.onerror=function(){ s.remove(); no(new Error("load")); }; document.head.appendChild(s); }); }); },Promise.reject()); }
function needZip(){ if(window.JSZip) return Promise.resolve(); return LIB.z||(LIB.z=loadJs(["https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js","https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"]).catch(function(){ LIB.z=null; throw new Error("엑셀 읽기 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."); })); }
function needPDF(){ if(window.pdfjsLib) return Promise.resolve(); return LIB.p||(LIB.p=loadJs(["https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js","https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"]).catch(function(){ LIB.p=null; throw new Error("PDF 읽기 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."); })); }
function invalidate(){}

/* ---------- 원래 엔진(그대로) ---------- */
/*__ENGINE__*/

function el(t,c,x){var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e}
var LSx={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
         set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function pd(v){ var m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(v||"").trim()); return m?new Date(+m[1],+m[2]-1,+m[3]):null; }
function iso(d){ return d?d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2):""; }
function today(){ return iso(new Date()); }
function addDays(s,n){ var d=pd(s); if(!d) return ""; d.setDate(d.getDate()+n); return iso(d); }
function dot(s){ var d=pd(s); return d?d.getFullYear()+". "+(d.getMonth()+1)+". "+d.getDate()+".":""; }
function dday(s){ var d=pd(s), t=pd(today()); return d?Math.round((d-t)/864e5):null; }
function ddTxt(n){ return n==null?"":n===0?"오늘":n>0?"D-"+n:(-n)+"일 지남"; }
function ddCls(n){ return n==null?"":n<0?"late":n<=3?"soon":""; }
function won(n){ return n==null||isNaN(n)?"-":Number(n).toLocaleString("ko-KR"); }
function N(v){ var s=String(v==null?"":v).replace(/[,\s원]/g,""); return s===""?0:(/^-?\d+$/.test(s)?+s:NaN); }
function ymNow(){ var d=new Date(); return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2); }
function ymTxt(ym){ var m=/^(\d{4})-(\d{2})$/.exec(ym||""); return m?m[1]+"년 "+(+m[2])+"월":""; }

var STG=["급여대장","사학연금","계좌","송금내역서","납부"];
var CSS=[
".sgv .cv-pane{padding-bottom:12px}",
".sg-hero{display:flex;gap:8px 12px;align-items:center;flex-wrap:wrap;margin:2px 0 4px}",
".sg-hero input{font:inherit;font-size:15px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0}",
".sg-hero .sch{flex:1 1 220px;max-width:320px}.sg-hero label{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--ink-2)}.sg-hero .sp{flex:1}",
".sg-now{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:10px 0 0;font-size:14px}",
".sg-sub{font-size:13.5px;font-weight:700;color:var(--ink);margin:18px 0 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
".sg-sub small{font-weight:400;color:var(--muted);font-size:12.5px}",
".sg-drops{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
".sg-drop{display:grid;gap:4px;border:1.5px dashed var(--line-strong);border-radius:12px;padding:14px;text-align:center;cursor:pointer;font-size:14px;color:var(--ink);background:var(--surface-2);min-width:0}",
".sg-drop small{color:var(--muted);font-size:12.5px;overflow-wrap:anywhere}.sg-drop.hot{border-color:var(--accent);background:var(--accent-soft)}",
".sg-drop.on{border-style:solid;border-color:var(--accent)}.sg-drop.on small{color:var(--accent-ink);font-weight:600}",
".sg-tk{margin:0;padding:0;list-style:none;display:grid;gap:4px}",
".sg-tk li label{display:flex;gap:8px;align-items:flex-start;font-size:13.5px;line-height:1.5;cursor:pointer;color:var(--ink)}",
".sg-tk li input{margin-top:3px;flex:0 0 auto;width:auto}.sg-tk li.on span{color:var(--muted);text-decoration:line-through}",
".sg-ac{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1.1fr) 70px minmax(0,1.3fr) minmax(0,1fr) 28px;gap:6px;align-items:center;background:var(--surface-2);border-radius:10px;padding:7px 10px;font-size:13.5px}",
".sg-ac.hd{background:none;padding:0 10px;font-size:12px;font-weight:700;color:var(--muted)}",
".sg-ac.need{box-shadow:inset 3px 0 0 var(--warn)}",
".sg-ac .k{min-width:0;overflow-wrap:anywhere}.sg-ac .k small{display:block;color:var(--muted);font-size:11.5px}",
".sg-ac input{font:inherit;font-size:13.5px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box}",
".sg-ac .x{font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:2px 6px}",
".sg-rows{display:grid;gap:6px}",
".sg-pv{display:grid;grid-template-columns:minmax(0,1.4fr) auto;gap:2px 10px;background:var(--surface-2);border-radius:10px;padding:8px 12px;font-size:13.5px}",
".sg-pv b{font-weight:600;min-width:0;overflow-wrap:anywhere}.sg-pv .am{text-align:right;font-variant-numeric:tabular-nums;font-weight:650}",
".sg-pv small{grid-column:1/-1;color:var(--muted);font-size:12px;overflow-wrap:anywhere}.sg-pv.w{box-shadow:inset 3px 0 0 var(--warn)}",
".sg-cmp{display:grid;grid-template-columns:minmax(0,1.6fr) auto auto auto;gap:4px 12px;font-size:13.5px;align-items:center}",
".sg-cmp .r{text-align:right;font-variant-numeric:tabular-nums}.sg-cmp b{font-size:12px;color:var(--muted)}",
".sg-cmp .ok{color:var(--pos);font-weight:650}.sg-cmp .bad{color:var(--neg);font-weight:650}",
".sg-hist{display:flex;flex-wrap:wrap;gap:6px}",
".sg-hist button{font:inherit;font-size:12.5px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink-2);border-radius:8px;padding:4px 10px;cursor:pointer}",
".sg-hist button.on{border-color:var(--accent);color:var(--accent-ink);font-weight:650}",
"@media (max-width:640px){.sgv .cv-calc{grid-template-columns:1fr 1fr}.sg-drops{grid-template-columns:1fr}",
".sg-ac{grid-template-columns:minmax(0,1fr) 64px 28px}.sg-ac.hd{display:none}.sg-ac .k{grid-column:1/3}.sg-ac .lb{grid-column:1/-1}.sg-ac .ac{grid-column:2/-1}.sg-ac .rc{grid-column:1/-1}.sg-ac .bk{grid-column:1}",
".sg-cmp{grid-template-columns:minmax(0,1fr) auto}.sg-cmp .r2,.sg-cmp .hh{display:none}}"
].join("\n");

function build(root){
  var T=U();
  if(!document.getElementById("cv-css")&&T.CSS){ var s0=el("style"); s0.id="cv-css"; s0.textContent=T.CSS; document.head.appendChild(s0); }
  if(!document.getElementById("sg-css")){ var s1=el("style"); s1.id="sg-css"; s1.textContent=CSS; document.head.appendChild(s1); }
  var P=LSx.get("sg.p",null); if(!P||typeof P!=="object") P={}; P.m=P.m||{}; if(!P.ym) P.ym=ymNow();
  if(!P.school){ try{ var sc=JSON.parse(localStorage.getItem("ct.school")||'""'); if(sc) P.school=sc; }catch(e){} }
  var RUN={files:{},names:{},TP:null,LOAN:null,B:null}, view={open:null};
  root.textContent=""; var app=el("div","cv sgv"); root.appendChild(app);
  function put(){ LSx.set("sg.p",P); }
  function M(){ var m=P.m[P.ym]; if(!m){ m=P.m[P.ym]={v:{},done:{},tk:{},autoV:{}}; try{ var a=localStorage.getItem(LS_ACCT); if(a) m.v.acct=a; }catch(e){} } m.autoV=m.autoV||{}; return m; }
  function btn(t,cls,fn){ var b=el("button",cls||"btn",t); b.type="button"; if(fn) b.onclick=fn; return b; }
  function msg(box,t,kind){ box.textContent=t||""; box.className="tkmsg"+(t?" on "+(kind||"ok"):""); }
  function workDays(s,n){ return T.workDays?T.workDays(s,n):addDays(s,n); }
  function isWork(d){ return !!d&&workDays(addDays(d,-1),1)===d; }
  function nextWork(d){ for(var i=0;d&&i<10&&!isWork(d);i++) d=addDays(d,1); return d; }
  /* 귀속월(급여 지급 달)의 다음 달 10일, 토·공휴일이면 다음 근무일 */
  function due10(){ var m=/^(\d{4})-(\d{2})$/.exec(P.ym); if(!m) return ""; var d=new Date(+m[1],+m[2],10); return nextWork(iso(d)); }
  function prefill(){ var m=M(), ch=false;
    function A(k,v,st){ if(m.done[st]||!v) return; var cur=m.v[k]||""; if(cur&&cur!==m.autoV[k]) return; if(cur!==v){ m.v[k]=v; ch=true; } m.autoV[k]=v; }
    A("taxD",due10(),4); A("insD",due10(),4);     /* 납부 예정일 = 기한(다음 달 10일) */
    return ch; }

  /* ---- 파일 읽기(원래 setFile 흐름을 화면과 떼어 냄) ---- */
  function readFile(k,f,box){ var m=M(); RUN.B=null;
    return f.arrayBuffer().then(function(buf){
      if(k==="tp"||k==="loan") return needPDF().then(function(){ return pdfText(buf); }).then(function(txt){
        if(isLoanPdf(txt)){ RUN.LOAN=parseLoan(txt); RUN.names.loan=f.name; if(RUN.LOAN.acct){ m.v.acct=RUN.LOAN.acct; try{ localStorage.setItem(LS_ACCT,RUN.LOAN.acct); }catch(e){} }
          var bk=CFG.fixed.loan&&CFG.fixed.loan.bank, diff=RUN.LOAN.bankCode&&bk&&+bk!==+RUN.LOAN.bankCode;
          return [RUN.LOAN.acct?"대여금 납부통지서"+(RUN.LOAN.ym?"("+ymTxt(RUN.LOAN.ym)+")":"")+"에서 상환 계좌를 읽었어요."+(diff?" 통지서 은행코드("+RUN.LOAN.bankCode+")가 설정("+bk+")과 달라요.":"")+(RUN.LOAN.late?" 연체금 "+won(RUN.LOAN.late)+"원이 있어요.":""):"통지서에서 계좌번호를 찾지 못했어요. 직접 넣어 주세요.",RUN.LOAN.acct&&!diff&&!RUN.LOAN.late?"ok":"warn"]; }
        var tp=parseTp(txt), got=[]; RUN.TP=tp; RUN.names.tp=f.name;
        if(tp.tCorp!=null){ m.v.T=tp.tCorp; got.push("교원"); } if(tp.aCorp!=null){ m.v.A=tp.aCorp; got.push("사무직"); } if(tp.dCorp!=null){ m.v.D=tp.dCorp; got.push("재해보상"); }
        if(tp.payAcct&&!m.v.acct) m.v.acct=tp.payAcct;
        return [got.length===3?"사학연금 "+tp.kind+(tp.ym?"("+ymTxt(tp.ym)+"분)":"")+"에서 법인부담금 3개를 읽었어요.":"사학연금 PDF에서 "+(got.length?got.join("·")+"만":"법인부담금을")+" 읽었어요. 빈 칸은 직접 넣어 주세요.",got.length===3?"ok":"warn"]; });
      return needZip().then(function(){ return readXlsx(buf); }).then(function(Tb){
        if(!Tb.cols.length||Tb.cols.indexOf("기관분류")<0||Tb.cols.indexOf("직종")<0) throw new Error(f.name+" — 나이스 급여대장(기관분류·직종 열)이 아니에요.");
        var kinds={}; Tb.rows.forEach(function(r){ if(r["직종"]) kinds[r["직종"]]=1; }); var isEdu=!!(kinds["교원"]||kinds["행정직"]);
        if(k==="edu"&&!isEdu) throw new Error("교직원 칸에 공무직 급여대장을 올린 것 같아요.");
        if(k==="gong"&&isEdu) throw new Error("공무직 칸에 교직원 급여대장을 올린 것 같아요.");
        RUN.files[k]=Tb; RUN.names[k]=f.name; ensureItems(Tb,k==="edu"?"교직원":"공무직");
        return [(k==="edu"?"교직원":"공무직")+" 급여대장을 읽었어요("+Tb.rows.length+"행).","ok"]; });
    }).then(function(r){ put(); draw(); msg(app.querySelector("[data-rd]"),r[0],r[1]); },function(e){ msg(box,e.message||String(e),"bad"); }); }
  function drop(pn,k,title,small,accept){ var lab=el("label","sg-drop"+(RUN.names[k]?" on":"")), inp=el("input"); inp.type="file"; inp.accept=accept; inp.hidden=true;
    lab.appendChild(el("b",null,title)); lab.appendChild(el("small",null,RUN.names[k]||small)); lab.appendChild(inp); pn.appendChild(lab);
    function take(f){ var mb=app.querySelector("[data-rd]"); msg(mb,"읽는 중…","ok"); readFile(k,f,mb); }
    inp.onchange=function(){ var f=inp.files[0]; inp.value=""; if(f) take(f); };
    lab.addEventListener("dragover",function(e){ e.preventDefault(); lab.classList.add("hot"); }); lab.addEventListener("dragleave",function(){ lab.classList.remove("hot"); });
    lab.addEventListener("drop",function(e){ e.preventDefault(); lab.classList.remove("hot"); var f=e.dataTransfer.files[0]; if(f) take(f); }); }

  /* ---- 화면 부품 ---- */
  function grid(pn){ var g=el("div","tkgridf"); pn.appendChild(g); return g; }
  function sub(pn,t,s){ var h=el("div","sg-sub",t); if(s) h.appendChild(el("small",null,s)); pn.appendChild(h); return h; }
  function tiles(box,items){ box.textContent=""; items.forEach(function(x){ if(!x) return; var d=el("div","cv-num "+(x.c||"")); d.appendChild(el("span",null,x.l)); d.appendChild(el("b",null,x.v)); if(x.s) d.appendChild(el("small",null,x.s)); box.appendChild(d); }); }
  function calc(pn){ var c=el("div","cv-calc"); pn.appendChild(c); return c; }
  function vfld(g,k,label,o){ o=o||{}; var m=M(), f=el("label","tkf"); f.appendChild(el("span","tkfl",label)); var i=el("input"); i.type=o.type||"text"; if(o.ph) i.placeholder=o.ph;
    if(o.num){ i.inputMode="numeric"; i.value=m.v[k]!=null&&m.v[k]!==""?won(m.v[k]):""; } else i.value=m.v[k]||"";
    f.appendChild(i); if(o.hint) f.appendChild(el("small",null,o.hint)); g.appendChild(f);
    i.addEventListener(o.type==="date"?"change":"input",function(){ var v=i.value.trim(); m.v[k]=o.num?(v===""?"":N(v)):v; RUN.B=null; if(k==="acct"){ try{ localStorage.setItem(LS_ACCT,v); }catch(e){} } put(); if(o.live) o.live(); if(o.type==="date"&&prefill()){ put(); draw(); } });
    if(o.num) i.addEventListener("blur",function(){ if(!isNaN(m.v[k])&&m.v[k]!=="") i.value=won(m.v[k]); }); return i; }
  function ticks(pn,list){ var m=M(), u=el("ul","sg-tk"); pn.appendChild(u);
    list.forEach(function(t,j){ var key=view.sel+"."+j, li=el("li",m.tk[key]?"on":""), lb=el("label"), cb=el("input"); cb.type="checkbox"; cb.checked=!!m.tk[key];
      cb.onchange=function(){ m.tk[key]=cb.checked; li.className=cb.checked?"on":""; put(); }; lb.appendChild(cb); lb.appendChild(el("span",null,t)); li.appendChild(lb); u.appendChild(li); }); }
  function needList(){ var need=[]; [["edu","교직원"],["gong","공무직"]].forEach(function(p){ var Tb=RUN.files[p[0]]; if(!Tb) return;
      ledgerItems(Tb,getSummary(Tb)).forEach(function(x){ var k=itemKey(p[1],x[0]); if(!hasAcct(CFG.items[k])) need.push([p[1],x[0],x[1],k]); }); }); return need; }
  function inputs(){ var v=M().v; return {T:N(v.T),A:N(v.A),D:N(v.D),acct:String(v.acct||"").trim()}; }

  var TODO=[
    ["NEIS 급여 일괄작업·실적이력 생성 뒤 급여대장(교직원·공무직) 엑셀 내려받기","급여대장 공제 열이 지난달과 같은지 보기(새 공제 항목은 '계좌'에서 등록)"],
    ["사학연금공단 업무포털에서 부담금 고지서(또는 수납확인서) PDF 받기","대여금이 있으면 대여정기상환금 납부통지서 PDF 받기(상환 계좌가 매월 바뀜)"],
    ["새 공제 항목 계좌 등록","받는 분·은행코드가 바뀐 곳 고치기"],
    ["미리보기 합계를 급여대장 공제총액과 맞춰 보기","엑셀 받아 이체(대량이체) 올리기"],
    ["원천세(소득세·지방소득세) 신고·납부 — 홈택스·위택스","4대 보험료 납부(건강보험공단 통합 고지)","사학연금 부담금·대여금 상환 납부"]];
  var S=[];
  S[0]=function(pn){ var d=el("div","sg-drops"); pn.appendChild(d);
    drop(d,"edu","교직원 급여대장","나이스 급여대장 엑셀(교원·기간제·행정직)",".xlsx"); drop(d,"gong","공무직 급여대장","나이스 급여대장 엑셀(교육공무직)",".xlsx");
    var c=calc(pn), E=RUN.files.edu, G=RUN.files.gong, nE=E?getEmployees(E).length:null, nd=needList();
    var cnt=0; [["edu",E],["gong",G]].forEach(function(p){ if(p[1]) cnt+=ledgerItems(p[1],getSummary(p[1])).length; });
    tiles(c,[{l:"교직원",v:E?nE+"명":"-",s:E?"공제총액 "+won(safeCol(getSummary(E),"공제총액"))+"원":"엑셀을 올려 주세요"},{l:"공무직",v:G?getEmployees(G).length+"명":"-",s:G?"공제총액 "+won(safeCol(getSummary(G),"공제총액"))+"원":""},
      {l:"공제 항목",v:(E||G)?cnt+"개":"-",s:nd.length?"계좌 없는 항목 "+nd.length+"개":(E||G)?"모두 계좌가 있어요":"",c:nd.length?"bad":(E||G)?"ok":""}]); };
  S[1]=function(pn){ var d=el("div","sg-drops"); pn.appendChild(d);
    drop(d,"tp","사학연금 부담금 고지서","공단 업무포털 PDF(수납확인서도 돼요)",".pdf"); drop(d,"loan","대여금 납부통지서","대여정기상환금 PDF — 상환 계좌를 채워요",".pdf");
    var g=grid(pn), c; vfld(g,"T","교원 법인부담금",{num:1,live:up}); vfld(g,"A","사무직 법인부담금",{num:1,live:up}); vfld(g,"D","재해보상 법인부담금",{num:1,live:up}); vfld(g,"acct","대여금 상환 계좌(매월 바뀜)",{ph:"통지서를 올리면 채워져요"});
    c=calc(pn); function up(){ var i=inputs(), s=i.T+i.A+i.D; tiles(c,[{l:"법인부담금 합계",v:isNaN(s)?"숫자만":won(s)+"원",c:isNaN(s)?"bad":""},{l:"고지서",v:RUN.TP?RUN.TP.kind:"-",s:RUN.TP&&RUN.TP.ym?ymTxt(RUN.TP.ym)+"분":""},{l:"대여금 상환",v:RUN.LOAN&&RUN.LOAN.amt!=null?won(RUN.LOAN.amt)+"원":"-",s:RUN.LOAN&&RUN.LOAN.late?"연체금 "+won(RUN.LOAN.late)+"원":"",c:RUN.LOAN&&RUN.LOAN.late?"bad":""}]); } up();
    var E=RUN.files.edu, TP=RUN.TP, LO=RUN.LOAN; if(!E||!(TP||LO)) return;
    var emp=getEmployees(E), L=[];
    if(TP&&TP.tPer!=null&&TP.aPer!=null) L.push(["사학연금 개인부담금(교원+사무직)",findColSum(E,emp,"사학연금"),TP.tPer+TP.aPer]);
    if(TP&&TP.army!=null) L.push(["군소급 개인부담금",findColSum(E,emp,"군소급"),TP.army]);
    if(LO&&LO.amt!=null) L.push(["대여금 상환",findColSum(E,emp,"연금대여")+findColSum(E,emp,"국고대여"),LO.amt]);
    if(!L.length) return; sub(pn,"급여대장과 맞춰 보기","공제액 ↔ 공단 PDF");
    var w=el("div","sg-cmp"); pn.appendChild(w); ["항목","급여대장","공단",""].forEach(function(t,i){ w.appendChild(el("b",(i===1||i===2?"r ":"")+(i===1||i===2?"r2 hh":""),t)); });
    L.forEach(function(l){ var ok=l[1]===l[2]; w.appendChild(el("span",null,l[0])); w.appendChild(el("span","r r2",won(l[1]))); w.appendChild(el("span","r r2",won(l[2]))); w.appendChild(el("span",ok?"ok":"bad",ok?"일치":"차이 "+won(l[1]-l[2]))); }); };
  S[2]=function(pn){ var nd=needList(), keys={}; nd.forEach(function(x){ keys[x[3]]=x[2]; });
    var c=calc(pn), miss=FIXED.filter(function(f){ var x=CFG.fixed[f[0]]; return f[0]!=="loan"&&!hasAcct(x); });
    tiles(c,[{l:"고정 줄",v:(FIXED.length-1-miss.length)+"/"+(FIXED.length-1),s:miss.length?"계좌 빈 곳 "+miss.length+"개":"모두 있어요",c:miss.length?"bad":"ok"},{l:"급여대장 공제 줄",v:Object.keys(CFG.items).length+"개",s:nd.length?"이번 달 새 항목 "+nd.length+"개":"",c:nd.length?"bad":""},{l:"저장",v:"이 브라우저",s:"담당이 바뀌면 '자료 옮기기'로 넘겨요"}]);
    var w=el("div","sg-rows"); pn.appendChild(w); var hd=el("div","sg-ac hd"); ["항목","송금내역서 표시","은행코드","계좌번호","받는 분",""].forEach(function(t){ hd.appendChild(el("span",null,t)); }); w.appendChild(hd);
    function row(name,smallT,x,isLoan,del,need){ var r=el("div","sg-ac"+(need?" need":"")), k=el("div","k",name); if(smallT) k.appendChild(el("small",null,smallT)); r.appendChild(k);
      function inp(f,cls,ph){ var i=el("input",cls); i.value=x[f]||""; i.placeholder=ph; i.setAttribute("aria-label",name+" "+ph); i.onchange=function(){ x[f]=i.value.trim(); saveCfg(); RUN.B=null; if(f==="bank"||f==="acct"){ var n=needList().length; if(need&&hasAcct(x)) r.className="sg-ac"; } }; r.appendChild(i); return i; }
      inp("label","lb","표시"); inp("bank","bk","코드");
      if(isLoan){ var s=el("span","ac cv-law","'사학연금'에서 매월 넣어요"); r.appendChild(s); } else inp("acct","ac","계좌번호");
      inp("recv","rc","받는 분"); r.appendChild(del?btn("×","x",del):el("span")); w.appendChild(r); }
    var order=Object.keys(CFG.items).sort(function(a,b){ return (keys[b]!=null)-(keys[a]!=null); });
    order.forEach(function(k){ var p=k.split("|"), x=CFG.items[k]; row(p[1],p[0]+(keys[k]!=null?" · 이번 달 "+won(keys[k])+"원":""),x,false,function(){ if(!confirm(p[1]+" 줄을 지울까요?")) return; delete CFG.items[k]; saveCfg(); draw(); },keys[k]!=null); });
    FIXED.forEach(function(f){ row(f[1],"고정 줄",CFG.fixed[f[0]],f[0]==="loan",null,f[0]!=="loan"&&!hasAcct(CFG.fixed[f[0]])); });
    pn.appendChild(btn("+ 공제 열 더하기","cv-back",function(){ var col=prompt("급여대장 열 이름(머리글 그대로)"); if(!col) return; col=col.trim(); var led=confirm("교직원 급여대장의 열이면 [확인], 공무직이면 [취소]")?"교직원":"공무직"; var k=itemKey(led,col); if(!CFG.items[k]) CFG.items[k]=blankItem(led,col); saveCfg(); draw(); })); };
  S[3]=function(pn){ var m2=el("div","tkmsg"), i=inputs(), err="";
    if(!RUN.files.edu||!RUN.files.gong) err="'급여대장'에서 교직원·공무직 엑셀을 먼저 올려 주세요.";
    else if([i.T,i.A,i.D].some(isNaN)) err="'사학연금'의 법인부담금은 숫자만 넣어 주세요.";
    else if(i.T+i.A+i.D===0) err="'사학연금'에서 법인부담금을 넣거나 고지서 PDF를 올려 주세요.";
    else if(!i.acct) err="'사학연금'에서 이번 달 대여금 상환 계좌를 넣어 주세요.";
    if(!err&&!RUN.B){ try{ RUN.B=buildRows(RUN.files.edu,RUN.files.gong,i); }catch(e){ err=e.message; } }
    var c=calc(pn); if(err){ tiles(c,[{l:"송금내역서",v:"-",s:err,c:"bad"}]); return; }
    var B=RUN.B, V=evalRows(B), li=-1; B.rows.forEach(function(row,ix){ if(row[3]===CFG.fixed.loan.label&&li<0) li=ix+1; });
    var sumE=li>0?V.val["F"+li]:null, dedE=safeCol(getSummary(RUN.files.edu),"공제총액"), okE=sumE===dedE;   /* 원래 엑셀의 '공제총액' 칸(대여금상환 줄 F) = 교직원 줄 합계 */
    tiles(c,[{l:"교직원 줄 합계",v:won(sumE)+"원",s:okE?"급여대장 공제총액과 같아요":"공제총액 "+won(dedE)+"원과 "+won(sumE-dedE)+"원 차이",c:okE?"ok":"bad"},{l:"법인부담금",v:won(B.법인부담금)+"원",s:"사학연금 개인부담금 "+won(B.개인부담금)+"원"},{l:"계좌 없는 줄",v:B.신규.length+"건",s:B.신규.length?"엑셀 맨 아래 노란 줄로 들어가요":"없어요",c:B.신규.length?"bad":"ok"}]);
    var bar=el("div","pr-dfoot"); bar.style.display="flex"; bar.style.gap="8px"; bar.style.margin="10px 0"; pn.appendChild(bar);
    bar.appendChild(btn("엑셀 받기","btn",function(){ needZip().then(function(){ return writeXlsx(B); }).then(function(u8){ return T.saveFile(new Blob([u8],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),"송금내역서_"+P.ym+".xlsx"); })
      .then(function(){ msg(m2,"송금내역서_"+P.ym+".xlsx를 받았어요.","ok"); },function(e){ msg(m2,"엑셀을 만들지 못했어요: "+(e.message||e),"bad"); }); }));
    pn.appendChild(m2);
    var w=el("div","sg-rows"); pn.appendChild(w);
    B.rows.forEach(function(row,ix){ var r=ix+1, v=V.val["C"+r]; if(!row[3]) return; var d=el("div","sg-pv"+(B.warn[r]?" w":"")); d.appendChild(el("b",null,row[3]));
      d.appendChild(el("span","am",typeof v==="number"?won(v):"")); var info=[row[4],row[0]&&row[1]?row[0]+" "+row[1]:""].filter(Boolean).join(" · "); if(info) d.appendChild(el("small",null,info)); w.appendChild(d); }); };
  S[4]=function(pn){ var g=grid(pn), c, d=due10();
    vfld(g,"sent","송금(이체)일",{type:"date",live:up}); vfld(g,"taxD","원천세 납부일",{type:"date",hint:"다음 달 10일로 채워요",live:up}); vfld(g,"insD","4대 보험료 납부일",{type:"date",live:up}); vfld(g,"schD","사학연금 납부일",{type:"date",live:up});
    c=calc(pn); function up(){ var v=M().v, n=dday(d), ok=function(x){ return x?(x<=d?"ok":"bad"):""; };
      tiles(c,[{l:"원천세 신고·납부",v:dot(d)+"까지",s:v.taxD?(v.taxD<=d?"기한 안이에요":"기한을 넘겨요"):ddTxt(n),c:ok(v.taxD)||(M().done[4]?"":ddCls(n))},{l:"4대 보험료",v:dot(d)+"까지",s:v.insD?(v.insD<=d?"기한 안이에요":"기한을 넘겨요"):"건강보험공단 통합 고지",c:ok(v.insD)},{l:"근거",v:"다음 달 10일",s:"소득세법 제128조 · 지방소득세 같은 날"}]); } up(); };

  /* ---- 화면 ---- */
  function curStage(){ var m=M(); for(var i=0;i<STG.length;i++) if(!m.done[i]) return i; return STG.length; }
  function draw(){
    if(prefill()) put();
    app.textContent=""; var m=M();
    var hero=el("div","sg-hero"), si=el("input","sch"); si.placeholder="학교명 (예: ○○고등학교)"; si.value=P.school||""; si.setAttribute("aria-label","학교명"); si.oninput=function(){ P.school=si.value.trim(); put(); }; hero.appendChild(si);
    var yl=el("label"), yi=el("input"); yi.type="month"; yi.value=P.ym; yi.setAttribute("aria-label","귀속월"); yl.appendChild(yi); yl.appendChild(document.createTextNode("급여")); hero.appendChild(yl);
    yi.onchange=function(){ if(!/^\d{4}-\d{2}$/.test(yi.value)) return; P.ym=yi.value; RUN={files:{},names:{},TP:null,LOAN:null,B:null}; view.open=null; put(); draw(); };
    hero.appendChild(el("span","sp")); var mb=btn("자료 옮기기","btn ghost"); hero.appendChild(mb); app.appendChild(hero);
    var setBox=el("div"); app.appendChild(setBox); mb.onclick=function(){ if(setBox.firstChild){ setBox.textContent=""; return; } settings(setBox); };
    var cur=curStage(), sel=view.open==null?Math.min(cur,STG.length-1):view.open; view.sel=sel;
    var now=el("div","sg-now");
    if(cur>=STG.length) now.appendChild(el("b",null,ymTxt(P.ym)+" 급여 송금·납부를 모두 마쳤어요."));
    else { now.appendChild(el("span","cv-dd",ymTxt(P.ym))); var t=el("span"); t.appendChild(el("b",null,"지금: "+STG[cur])); now.appendChild(t);
      var d=due10(), n=dday(d); if(!m.done[4]) now.appendChild(el("span","cv-dd "+ddCls(n),"원천세·4대보험 "+ddTxt(n))); }
    var past=Object.keys(P.m).sort().reverse().slice(0,6); if(past.length>1){ var h=el("div","sg-hist"); past.forEach(function(k){ var b=btn(ymTxt(k)+(Object.keys(P.m[k].done||{}).length>=STG.length?" ✓":""),k===P.ym?"on":"",function(){ P.ym=k; RUN={files:{},names:{},TP:null,LOAN:null,B:null}; view.open=null; put(); draw(); }); h.appendChild(b); }); now.appendChild(h); }
    app.appendChild(now);
    var nv=el("nav","cv-idx"); nv.style.setProperty("--n",STG.length);
    STG.forEach(function(s,i){ var stt=m.done[i]?"done":i===cur?"cur":"todo", b=btn("","cv-ix "+stt+(i===sel?" sel":""),function(){ view.open=i; draw(); });
      if(i===sel) b.setAttribute("aria-current","step"); b.appendChild(el("span","n",stt==="done"?"✓":String(i+1))); b.appendChild(el("span","t",s)); nv.appendChild(b); });
    app.appendChild(nv);
    var pn=el("section","cv-pane"); app.appendChild(pn);
    var hd=el("div","cv-ph"); hd.appendChild(el("h4",null,STG[sel])); hd.appendChild(el("span",null,ymTxt(P.ym)+(m.done[sel]?" · "+dot(m.done[sel])+" 마침":""))); pn.appendChild(hd);
    var rd=el("div","tkmsg"); rd.setAttribute("data-rd","1"); pn.appendChild(rd);
    S[sel](pn);
    sub(pn,"할 일"); ticks(pn,TODO[sel]);
    var nb=el("div","cv-next"); pn.appendChild(nb);
    if(m.done[sel]) nb.appendChild(btn("이 단계 다시 열기","btn ghost",function(){ delete m.done[sel]; put(); draw(); }));
    else nb.appendChild(btn(sel<STG.length-1?"이 단계 마쳤어요 · "+STG[sel+1]+"(으)로":"이번 달 마쳤어요","btn",function(){ m.done[sel]=today(); view.open=sel<STG.length-1?sel+1:sel; put(); draw(); top(); }));
    var pr=el("div","cv-pn"); pn.appendChild(pr);
    pr.appendChild(sel>0?btn("← "+STG[sel-1],"cv-back",function(){ view.open=sel-1; draw(); top(); }):el("span"));
    if(sel<STG.length-1) pr.appendChild(btn(STG[sel+1]+" →","cv-back",function(){ view.open=sel+1; draw(); top(); }));
  }
  function top(){ var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function settings(box){ box.textContent=""; var s=el("div","cv-set"); box.appendChild(s);
    var r=el("div","cv-btns"); s.appendChild(r); var m=el("div","tkmsg"); s.appendChild(m);
    r.appendChild(btn("내보내기(계좌 설정 포함)","btn ghost",function(){ T.saveFile(new Blob([JSON.stringify({sg:P,cfg:CFG},null,1)],{type:"application/json"}),"급여송금_"+today()+".json").then(function(){ msg(m,"내보냈어요. 계좌가 들어 있으니 담당자에게만 넘겨 주세요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }));
    var lb=el("label","btn ghost","불러오기"), fi=el("input"); fi.type="file"; fi.accept=".json"; fi.hidden=true; lb.appendChild(fi); r.appendChild(lb);
    fi.onchange=function(){ var f=fi.files[0]; if(!f) return; f.text().then(function(t){ var j=JSON.parse(t);
        if(j&&j.sg){ P=j.sg; P.m=P.m||{}; CFG=mergeCfg(j.cfg); } else if(j&&(j.fixed||j.items||j.opt)) CFG=mergeCfg(j); else throw 0;   /* 원래 도구의 '송금항목설정.json'도 받는다 */
        saveCfg(); put(); draw(); }).catch(function(){ msg(m,"급여 송금 파일을 읽지 못했어요.","bad"); }); };
  }
  draw();
}
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.sg=build;
})();
