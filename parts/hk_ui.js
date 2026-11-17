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
/*__ENGINE__*/
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
