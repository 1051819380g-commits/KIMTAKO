/* ======================================================================
   예산 변경 — 경남 기준으로 처음부터 만든 도구 (2026-11-17)
   한 학년도 예산 변경 사안을 한 장부에 모은다. 사안마다 종류를 고르면 단계(좌→우)가 정해진다.
     성립전예산 · 추가경정예산 · 이용 · 전용 · 예비비 · 이월 · 간주처리
   맨 위에서 공립/사립을 고른다(본예산 도구와 같은 선택 bud.mode). 기록은 bc.pub·bc.pri 따로.
   기준(gn.db에서 찾음)
   - 경남 업무흐름도 「예ㆍ결산 관리」 1-2~1-5, 참고자료 기안 예시 2-6~2-10, 서식 1-3·1-4
   - 2026학년도 학교회계 예산편성 기본지침(경남), 2026학년도 사학기관 예산편성 및 결산지침(경남)
   - 경상남도 공립학교회계 규칙 제15~20조·제52조 / 사학기관 재무·회계 규칙 제18~22조, 사립학교법 시행령 제14조②
   ====================================================================== */
(function(){ "use strict";
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
function won(n){ return (Math.round(n)||0).toLocaleString("ko-KR"); }
function num(v){ if(typeof v==="number") return isFinite(v)?v:0; var n=parseFloat(String(v==null?"":v).replace(/[,원\s]/g,"")); return isFinite(n)?n:0; }
function chonUp(n){ return n<0?-Math.ceil(-n/1000):Math.ceil(n/1000); }        /* 세출은 천원 미만 절상(기본지침 Ⅴ.1) */
function chon(n){ return won(chonUp(n)); }
function sgn(n){ return n>0?"+"+won(n):won(n); }
/* 산출식 계산: "322,000원×5월" → 1,610,000 */
function evalF(s){ s=String(s||"").split("=")[0].replace(/[×xX＊]/g,"*").replace(/,/g,"").replace(/[^0-9.*+\-()\/]/g,"");
  if(!/\d/.test(s)||!/^[0-9.*+\-()\/]+$/.test(s)) return null; try{ var v=Function("return ("+s+")")(); return isFinite(v)?Math.round(v):null; }catch(e){ return null; } }
function defYear(){ var d=new Date(); return String(d.getMonth()>=2?d.getFullYear():d.getFullYear()-1); }   /* 회계연도 3. 1.~다음 해 2월 말일 */
function fyEnd(Y){ return iso(new Date(Y+1,2,0)); }
var RULE={pub:"경상남도 공립학교회계 규칙", pri:"사학기관 재무·회계 규칙"};
var LAWURL={pub:"https://www.law.go.kr/자치법규/경상남도공립학교회계규칙", pri:"https://www.law.go.kr/법령/사학기관재무·회계규칙"};

/* ---------- 종류 ---------- */
var KINDS=["sj","ch","iy","jy","yb","iw","gj"];
function TY(k,PRI){ var R=RULE[PRI?"pri":"pub"];
  return ({
  sj:{n:"성립전예산",h:"용도가 정해진 돈이 전액 교부됐어요 · 심의를 거친 수익자부담경비",stg:["교부 확인","사용 신청","확정·집행","추경 반영"],
      law:R+(PRI?" 제18조":" 제15조제2항")+" — 용도가 지정되고 소요전액이 교부된 경비, 미리 학운위 심의를 거친 수익자부담경비는 추경 성립 전에 쓰고 차기 추경에 반영해요. 집행까지 시일이 넉넉하면 차기 추경에 편성해요."},
  ch:{n:"추가경정예산",h:"여러 사업을 늘리고 줄여요 · 사업 변경 · 이월액 반영",stg:PRI?["교육·요구","조정·확정","학운위","이사회","보고·공개"]:["교육·요구","조정·확정","학운위","공개"],
      law:R+(PRI?" 제18조, 사립학교법 시행령 제14조제2항 — 학운위 심의 뒤 이사회 의결로 확정하고, 확정된 날부터 15일 안에 관할청에 보고하고 누리집에 공개해요.":" 제15조제1항·제52조 — 절차는 본예산과 같아요(요구 → 조정 → 학운위 심의 → 확정). 확정 뒤 10일 안에 공개해요.")+" 횟수·시기 제한은 없어요(학교회계 묻고 답하기 Q2)."},
  iy:{n:"이용",h:"정책사업 사이에 옮겨요 · 예산총칙 이용 범위 안",stg:["요건","신청","확정·집행","결산"],
      law:R+(PRI?" 제21조, 2026 사학기관 예산편성 및 결산지침 — 미리 학운위 심의와 이사회 의결을 거쳐 예산(예산총칙 이용 범위)으로 정해 둔 경우에만 정책사업 사이에 이용할 수 있어요. 건마다 심의·의결을 다시 받지 않고, 예산담당자가 타당성을 검토해 확정해요.":" 제17조 — 미리 학운위 심의를 거친 경우(예산총칙에 이용 범위)만 돼요. 집행잔액 반환을 위한 이용은 심의를 생략할 수 있어요.")+" 결산 때 '세출예산 이(전)용 명세서'를 붙여요."},
  jy:{n:"전용",h:"같은 정책사업 안 단위·세부사업, 목 사이 · 학교장 결정",stg:["요건","신청","확정·집행","결산"],
      law:PRI?R+" 제21조제3항·제4항 — 학교장이 전용하고 이사장에게 보고해요. 경남 사학 지침은 인건비·시설비를 전용에서 빼요.":R+" 제18조 — 인건비를 제외한 예산을 같은 정책사업 안 단위사업 간 목, 같은 단위사업 안 세부사업 간 목, 같은 세부사업 안 목 간에 전용해요(2026. 6. 4. 개정). 학운위 심의는 필요 없어요."},
  yb:{n:"예비비",h:"예측 못 한 지출 · 추경을 기다릴 수 없어요",stg:["요건","신청","승인·집행","결산"],
      law:R+(PRI?" 제19조":" 제16조")+" — 재해 복구비처럼 예측 못 한 경비, 재정 여건 변화로 예산보다 더 써야 할 때만 써요. 업무추진비에는 못 쓰고, 추경 뒤 집행할 수 있으면 쓰지 않아요. 결산 때 예비비 사용명세서로 사후 심의를 받아요."},
  iw:{n:"이월",h:"올해 안에 다 못 써요 · 명시·사고·계속비",stg:["구분","심의·결정","이월 확정","다음 연도"],
      law:R+(PRI?" 제22조 — 명시이월·계속비는 학운위 사전심의와 이사회 사전의결, 사고이월은 학교장이 결정해요.":" 제20조 — 명시이월은 학운위 사전심의, 사고이월은 지출원인행위를 한 경비를 학교장이 결정해요.")+" 이월액은 다음 연도 예산에 계상하지 않고 예산현액으로 관리해요."},
  gj:{n:"간주처리",h:"마지막 추경 뒤 목적사업비가 왔어요 · 2월 말까지",stg:["요건","성립전 편성","확정·공개","보고"],
      law:"2026 기본지침 Ⅴ.3"+(PRI?"·사학 지침":"")+" — 회계연도 말 추경 뒤 목적이 지정된 전입금·보조금·지원금이 왔고 학운위 심의를 받을 시간이 없을 때, 심의"+(PRI?"·이사회 의결":"")+"를 받은 것으로 보고 학교장이 확정해요. 그해 예산총칙에 간주처리 조항이 있어야 하고, 다음 회기 "+(PRI?"학운위·이사회":"학운위")+"에 보고해요."}
  })[k]; }

var CSS=[
".bcv .cv-pane{padding-bottom:12px}",
".bc-hero{display:flex;gap:8px 12px;align-items:center;flex-wrap:wrap;margin:2px 0 4px}",
".bc-hero select,.bc-hero input{font:inherit;font-size:15px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0}",
".bc-hero .sch{flex:1 1 180px;max-width:260px}.bc-hero .yr{width:92px}.bc-hero label{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--ink-2)}.bc-hero .sp{flex:1}",
".bc-sub{font-size:13.5px;font-weight:700;color:var(--ink);margin:18px 0 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.bc-sub small{font-weight:400;color:var(--muted);font-size:12.5px}",
".bc-say{font-size:13.5px;color:var(--ink-2);margin:10px 0;line-height:1.65}",
".bc-say a{color:var(--accent-ink);text-decoration:underline}",
".bc-rows{display:grid;gap:8px}",
".bc-row{position:relative;background:var(--surface-2);border-radius:10px;padding:8px 36px 8px 10px;display:grid;gap:6px}",
".bc-ln{display:grid;grid-template-columns:repeat(auto-fit,minmax(var(--mw,108px),1fr));gap:6px}",
".bc-c{display:grid;gap:2px;min-width:0}.bc-c>span{font-size:11px;font-weight:700;color:var(--muted)}",
".bc-c input,.bc-c select{font:inherit;font-size:13.5px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box}",
".bc-c input.r{text-align:right;font-variant-numeric:tabular-nums}",
".bc-c b{font-size:13.5px;font-weight:650;padding:6px 0;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.bc-c b.bad{color:var(--neg,#b23a2e)}",
".bc-row .x{position:absolute;top:6px;right:4px;font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:2px 6px}",
".bc-add{font:inherit;font-size:13.5px;border:1px dashed var(--line-strong);background:none;color:var(--accent-ink);border-radius:10px;padding:7px 12px;cursor:pointer;justify-self:start}",
".bc-tk{margin:0;padding:0;list-style:none;display:grid;gap:4px}",
".bc-tk li label{display:flex;gap:8px;align-items:flex-start;font-size:13.5px;line-height:1.5;cursor:pointer;color:var(--ink)}",
".bc-tk li input{margin-top:3px;flex:0 0 auto;width:auto}.bc-tk li.on span{color:var(--muted);text-decoration:line-through}",
".bc-docs{display:grid;gap:8px;margin-top:6px}",
".bc-doc{border:1px solid var(--line);border-radius:12px;background:var(--surface);overflow:hidden}",
".bc-dh{font:inherit;display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;padding:11px 14px;cursor:pointer;color:var(--ink)}",
".bc-dh .who{flex:0 0 auto;font-size:11.5px;font-weight:700;border-radius:6px;padding:2px 7px;background:var(--surface-3);color:var(--ink-2)}.bc-dh .who.out{background:var(--accent-soft);color:var(--accent-ink)}",
".bc-dh .tt{flex:1;min-width:0;font-size:14.5px;font-weight:600;line-height:1.4}.bc-dh .ar{flex:0 0 auto;color:var(--muted);transition:transform .15s}",
".bc-doc.open .bc-dh .ar{transform:rotate(90deg)}.bc-db{display:none;border-top:1px solid var(--line);padding:12px 14px}.bc-doc.open .bc-db{display:block}",
".bc-txt{white-space:pre-wrap;font-size:13.5px;line-height:1.75;background:var(--surface-2);border-radius:10px;padding:12px 14px;margin:0;color:var(--ink);word-break:keep-all;overflow-wrap:anywhere}",
".bc-txt .tl{display:block;font-weight:700;margin-bottom:6px}",
".bc-tb{width:100%;border-collapse:collapse;font-size:12.5px;margin:8px 0;white-space:normal}.bc-tb th,.bc-tb td{border:1px solid var(--line-strong);padding:4px 6px;text-align:center;word-break:keep-all}.bc-tb th{background:var(--surface-3);font-weight:700}.bc-tb td.r{text-align:right;font-variant-numeric:tabular-nums}",
".bc-dfoot{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}",
".bc-tt{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 2px}.bc-tt input{font:inherit;font-size:18px;font-weight:700;padding:4px 8px;border:1px solid transparent;border-radius:8px;background:none;color:var(--ink);flex:1 1 220px;min-width:0}.bc-tt input:hover,.bc-tt input:focus{border-color:var(--line-strong);background:var(--surface)}",
".bc-kind{font-size:12.5px;font-weight:700;border-radius:999px;padding:2px 10px;background:var(--accent-soft);color:var(--accent-ink)}",
".cv-case .bc-kind{align-self:flex-start}",
".bc-sel{display:flex;flex-wrap:wrap;gap:6px}.bc-sel button{font:inherit;font-size:13.5px;border:1.5px solid var(--line);border-radius:10px;background:var(--surface-2);padding:8px 12px;cursor:pointer;color:var(--ink);text-align:left}.bc-sel button[aria-pressed=true]{border-color:var(--accent);background:var(--accent-soft)}.bc-sel small{display:block;color:var(--muted);font-size:12px}",
".bc-acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0 0}",
"@media (max-width:640px){.bcv .cv-ix .t{font-size:10.5px;letter-spacing:-.05em;text-overflow:clip}.bcv .cv-calc{grid-template-columns:1fr 1fr}.bc-ln{--mw:120px}.bc-tb{font-size:11px}}"
].join("\n");

function build(root,ver){
  var PRI=ver==="pri", KEY="bc."+ver, T=U(), ACCT=PRI?"교비회계":"학교회계", COM=PRI?"학교운영위원회 심의 및 이사회 의결":"학교운영위원회 심의";
  if(!document.getElementById("cv-css")&&T.CSS){ var s0=el("style"); s0.id="cv-css"; s0.textContent=T.CSS; document.head.appendChild(s0); }
  if(!document.getElementById("bc-css")){ var s1=el("style"); s1.id="bc-css"; s1.textContent=CSS; document.head.appendChild(s1); }
  var P=LS.get(KEY,null); if(!P||typeof P!=="object") P={}; P.f=P.f||{}; P.cases=P.cases||[];
  if(!P.f.year) P.f.year=defYear();
  if(!P.f.school){ [PRI?"bc.pub":"bc.pri","pub.p","pri.p"].some(function(k){ var o=LS.get(k,null); if(o&&o.f&&o.f.school){ P.f.school=o.f.school; return true; } });
    if(!P.f.school){ var s=LS.get("ct.school",""); if(s) P.f.school=s; } }
  var view={c:null,open:null,pick:false}, PAINT=[]; function repaint(){ PAINT.forEach(function(f){ f(); }); }
  root.textContent=""; var app=el("div","cv bcv"); root.appendChild(app);
  function put(){ LS.set(KEY,P); }
  function Y(){ var y=parseInt(P.f.year,10); return y>=2000&&y<=2100?y:+defYear(); }
  function S(){ return String(P.f.school||"").trim()||"○○학교"; }
  function btn(t,cls,fn){ var b=el("button",cls||"btn",t); b.type="button"; if(fn) b.onclick=fn; return b; }
  function msg(box,t,kind){ box.textContent=t||""; box.className="tkmsg"+(t?" on "+(kind||"ok"):""); }
  function workDays(s,n){ return T.workDays?T.workDays(s,n):addDays(s,n); }
  function isWork(d){ return !!d&&workDays(addDays(d,-1),1)===d; }
  function prevWork(d){ for(var i=0;d&&i<10&&!isWork(d);i++) d=addDays(d,-1); return d; }
  function cases(){ return P.cases.filter(function(c){ return c.y===Y(); }); }
  function stgOf(c){ return TY(c.k,PRI).stg; }
  function curStage(c){ var n=stgOf(c).length; for(var i=0;i<n;i++) if(!c.done[i]) return i; return n; }
  function V(c,k){ return String(c.f[k]==null?"":c.f[k]).trim(); }
  function O(x,d){ return x||d; }

  /* ---- 날짜 미리 채우기(직접 고친 값·끝난 단계는 그대로) ---- */
  function prefill(c){ var ch=false; c.autoV=c.autoV||{};
    function A(k,v,st){ if(c.done[st]||!v) return; var cur=V(c,k); if(cur&&cur!==c.autoV[k]) return; if(cur!==v){ c.f[k]=v; ch=true; } c.autoV[k]=v; }
    if(c.k==="ch"){ if(PRI){ A("fix",V(c,"brd"),4); A("rep",V(c,"fix")?prevWork(addDays(V(c,"fix"),15)):"",4); }   /* 이사회 의결일 확정 → 15일 이내 관할청 보고(시행령 제14조②) */
      else { A("fix",V(c,"com"),3); A("pubd",V(c,"fix")?prevWork(addDays(V(c,"fix"),10)):"",3); } }               /* 심의 받은 날 확정 → 10일 이내 공개(규칙 제52조) */
    if(c.k==="gj"){ if(PRI) A("rep",V(c,"fix")?prevWork(addDays(V(c,"fix"),15)):"",2); else A("pubd",V(c,"fix")?prevWork(addDays(V(c,"fix"),10)):"",2); }
    return ch; }

  /* ---- 행(표) 정의 ---- */
  var COLS={
    sj:[[["biz","세부사업"],["item","세부항목"],["nm","산출내역"]],[["fm","산출식","예: 322,000원×5월",160],["amt","신청액(원)",null,0,1],["why","신청사유"]]],
    ch:[[["biz","세부사업"],["nm","산출내역"]],[["old","기정액(원)",null,0,1],["new","경정액(원)",null,0,1],["_d","증감·산출식"]]],
    ij:[[["pol","정책사업"],["unit","단위사업"],["biz","세부사업"],["item","세부항목·목"],["cost","원가통계비목"],["nm","산출내역"]],[["bud","예산액(원)",null,0,1],["sp","지출액(원)",null,0,1],["_bal","예산잔액"],["fut","향후소요액(원)",null,0,1],["up","증(원)",null,0,1],["dn","감(원)",null,0,1]]],
    yb:[[["pol","정책사업"],["unit","단위사업"],["biz","세부사업"],["item","세부항목"],["cost","원가통계비목"],["nm","산출내역"]],[["bud","예산액(원)",null,0,1],["sp","지출액(원)",null,0,1],["need","금회 소요액(원)",null,0,1],["_use","예비비 사용액"]]],
    iw:[[["biz","세부사업"],["nm","산출내역"]],[["amt","이월액(원)",null,0,1],["why","이월 사유"]]]
  };
  function rowKind(c){ return c.k==="iy"||c.k==="jy"?"ij":c.k==="gj"?"sj":c.k; }
  function amtOf(r){ var a=num(r.amt); if(a) return a; var e=evalF(r.fm); return e||0; }
  function chD(r){ return num(r.new)-num(r.old); }
  function chFm(r){ var o=num(r.old), n=num(r.new); if(!o&&n) return (r.nm||"")+" "+won(n)+"원="+chon(n)+"천원"; if(o&&!n) return (r.nm||"")+" -"+won(o)+"원=-"+chon(o)+"천원"; return "경정"+won(n)+"원-기정"+won(o)+"원="+chon(n-o)+"천원"; }
  function bal(r){ return num(r.bud)-num(r.sp); }
  function ybUse(r){ return Math.max(0,num(r.need)-Math.max(0,bal(r))); }
  function rows(c){ c.rows=c.rows||[]; if(!c.rows.length) c.rows.push({}); return c.rows; }
  function used(c){ return (c.rows||[]).filter(function(r){ return Object.keys(r).some(function(k){ return String(r[k]).trim(); }); }); }

  /* ---- 검사 ---- */
  function ijCheck(c){ var rs=used(c), up=0, dn=0, over=[], bad=[], fac=[];
    rs.forEach(function(r){ up+=num(r.up); dn+=num(r.dn); var t=(r.item||"")+" "+(r.nm||"");
      if(num(r.dn)&&num(r.dn)>bal(r)-num(r.fut)) over.push(r.biz||r.nm||"감액 줄");
      if(num(r.up)&&/업무추진비/.test(t)) bad.push("업무추진비로 옮길 수 없어요");
      if(num(r.dn)&&/인건비/.test(t)) bad.push("인건비는 다른 과목으로 옮길 수 없어요");
      if(num(r.dn)&&/시설비/.test(t)) (PRI?bad:fac).push("시설비"); });
    return {up:up,dn:dn,over:over,bad:bad.filter(function(v,i,a){ return a.indexOf(v)===i; }),fac:fac.length,n:rs.length}; }
  function sum(c){ var rs=used(c), k=rowKind(c);
    if(k==="sj") return rs.reduce(function(a,r){ return a+amtOf(r); },0);
    if(k==="ch") return rs.reduce(function(a,r){ return a+chD(r); },0);
    if(k==="ij") return ijCheck(c).up;
    if(k==="yb") return rs.reduce(function(a,r){ return a+ybUse(r); },0);
    if(k==="iw") return rs.reduce(function(a,r){ return a+num(r.amt); },0); return 0; }

  /* ---- 한글(hwpx) ---- */
  function P0(x,o){ return Object.assign({t:"p",text:x,size:12,lh:1.6,font:"m"},o||{}); }
  function cell(x,o){ return Object.assign({t:String(x==null?"":x),al:"center",size:10},o||{}); }
  function th(x){ return cell(x,{b:true,bg:"#EDEDED"}); }
  function hwpx(blocks,name,m){ var H=window.TKHX; if(!H||!H.build){ msg(m,"한글 만들기 부품을 불러오지 못했어요. 새로고침해 주세요.","warn"); return; }
    T.saveFile(H.build([{blocks:blocks}],name),(P.f.school?P.f.school+"_":"")+name.replace(/[\\/:*?"<>|]/g,"_")+".hwpx").then(function(){ msg(m,name+"을(를) 한글로 내려받았어요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }

  /* ---- 표(기안 붙임) ---- */
  function table(c){ var rs=used(c), k=rowKind(c);
    if(k==="sj"){ var t=0, b=rs.map(function(r){ var a=amtOf(r); t+=a; return [r.biz,r.item,r.nm,r.fm,chon(a),r.why]; });
      return {unit:"천원",w:[30,28,28,44,24,22],head:["세부사업","세부항목","산출내역","산출식",c.k==="gj"?"편성액":"성립전 예산 신청액","신청사유"],num:[4],rows:b,foot:["합계","","","",chon(t),""]}; }
    if(k==="ch"){ var u=0, d=0, b2=rs.map(function(r){ var x=chD(r); if(x>0) u+=x; else d-=x; return [r.biz,r.nm,chon(num(r.old)),chon(num(r.new)),(x>0?"+":"")+chon(x),chFm(r)]; });
      return {unit:"천원",w:[30,30,22,22,20,52],head:["세부사업","산출내역","기정액","경정액","증감","산출식"],num:[2,3,4],rows:b2,foot:["합계","","","","증 "+chon(u)+" / 감 "+chon(d),""]}; }
    if(k==="ij"){ var b3=rs.map(function(r){ return [r.pol,r.unit,r.biz,r.item,r.nm,chon(num(r.bud)),chon(num(r.sp)),chon(bal(r)),chon(num(r.fut)),num(r.up)?chon(num(r.up)):"",num(r.dn)?chon(num(r.dn)):""]; });
      return {unit:"천원",w:[15,15,16,16,16,14,14,14,14,13,13],head:["정책사업","단위사업","세부사업",c.k==="jy"?"목":"세부항목","산출내역","예산액","지출액","예산잔액","향후소요액",(c.k==="iy"?"이용":"전용")+" 증","감"],num:[5,6,7,8,9,10],rows:b3}; }
    if(k==="yb"){ var r=rs[0]||{}, rb=num(c.f.ybBal), u2=ybUse(r);
      return {unit:"천원",w:[16,16,18,24,16,16,16,18,15,15],head:["정책사업","단위사업","세부사업","산출내역","예산액","지출액","예산잔액","금회 소요액","예비비 증","감"],num:[4,5,6,7,8,9],
        rows:[[r.pol,r.unit,r.biz,r.nm,chon(num(r.bud)),chon(num(r.sp)),chon(bal(r)),chon(num(r.need)),chon(u2),""],["학교재무활동","예비비","예비비","예비비",chon(rb),"",chon(rb),chon(u2),"",chon(u2)]]}; }
    if(k==="iw"){ var t4=0, b4=rs.map(function(r){ t4+=num(r.amt); return [r.biz,r.nm,won(num(r.amt)),r.why]; });
      return {unit:"원",w:[40,40,30,60],head:["세부사업","산출내역","이월액","이월 사유"],num:[2],rows:b4,foot:["합계","",won(t4),""]}; }
    return null; }
  function tblBlock(tb){ var rows=[tb.head.map(th)];
    tb.rows.forEach(function(r){ rows.push(r.map(function(x,i){ return cell(x,{al:tb.num.indexOf(i)>=0?"right":"center"}); })); });
    if(tb.foot) rows.push(tb.foot.map(function(x,i){ return cell(x,{b:true,bg:"#F5F5F5",al:tb.num.indexOf(i)>=0?"right":"center"}); }));
    return [P0("(단위: "+tb.unit+")",{al:"right",size:9.5}),{t:"tbl",w:tb.w,font:"m",size:9.5,pad:1,rows:rows}]; }
  function tblText(tb){ return ["(단위: "+tb.unit+")",tb.head.join("\t")].concat(tb.rows.map(function(r){ return r.join("\t"); })).concat(tb.foot?[tb.foot.join("\t")]:[]).join("\n"); }
  function tblHTML(box,tb){ var t=el("table","bc-tb"), h=el("tr"); tb.head.forEach(function(x){ h.appendChild(el("th",null,x)); }); t.appendChild(h);
    tb.rows.concat(tb.foot?[tb.foot]:[]).forEach(function(r){ var tr=el("tr"); r.forEach(function(x,i){ tr.appendChild(el("td",tb.num.indexOf(i)>=0?"r":"",x)); }); t.appendChild(tr); });
    box.appendChild(el("span",null,"(단위: "+tb.unit+")")); box.appendChild(t); }

  /* ---- 기안문(경남 업무흐름도 참고자료 기안 예시를 바탕으로) ---- */
  function DOCS(c){ var y=Y(), f=function(k,d){ return V(c,k)||d; }, D=function(k,d){ return dot(V(c,k))||d; }, Dw=function(k,d){ return dotw(V(c,k))||d; }, n=f("no","1");
    var ref=f("org","○○교육지원청")+" "+f("gno","○○과-○○○○")+"("+D("gd","20○○. ○○. ○○.")+")호";
    var L=[];
    if(c.k==="sj") L.push({st:1,kind:"in",title:f("name","○○사업")+" 성립전 예산 사용 신청",
      body:ref+"로 교부된 "+f("name","○○사업")+"의 원활한 집행을 위하여 다음과 같이 성립전 예산 사용을 신청합니다.\n\n- 성립전 예산 사용신청 내역 -",tb:1,end:"끝.",note:"결재: 담당교사 → 담당부장 → 교감 → 교장, 협조 행정실장(기안 예시 2-6)"});
    if(c.k==="ch"){
      L.push({st:0,kind:"in",title:y+"학년도 "+ACCT+" 제"+n+"회 추경예산 편성에 따른 교직원 교육 실시 및 예산요구서 제출",
        body:" "+y+"학년도 "+ACCT+" 예산을 효율적으로 편성하기 위하여 다음과 같이 교직원 교육을 실시하고 예산요구서를 제출받고자 합니다.\n\n1. 교육일시 : "+Dw("edu","20○○. ○○. ○○.(○)")+" "+f("eduT","○○:○○")+"\n2. 장    소 : "+f("eduP","본교 ○○실")+"\n3. 참석대상 : "+f("aud","본교 교직원 전원")+"\n4. 예산요구서 제출방법 : 부서별로 제출\n5. 예산요구서 제출일시 : "+D("reqD","20○○. ○○. ○○.")+"까지\n\n붙임  1. 교육자료 1부\n      2. 예산요구서 1부.  끝."});
      L.push({st:1,kind:"in",title:y+"학년도 "+S()+" "+ACCT+" 제"+n+"회 추가경정 세입·세출 예산(안) 확정",
        body:"1. 관련 : "+S()+"-"+f("eduNo","○○○")+"("+D("edu","20○○. ○○. ○○.")+")호.\n\n2. 우리 학교 "+y+"학년도 "+ACCT+" 제"+n+"회 추가경정 세입·세출 예산(안)을 붙임과 같이 확정하고자 합니다.\n\n붙임  "+y+"학년도 "+S()+" "+ACCT+" 제"+n+"회 추가경정 세입·세출 예산(안) 1부.  끝.",tb:1,tbAfter:true});
      L.push({st:2,kind:"out",title:y+"학년도 "+S()+" "+ACCT+" 제"+n+"회 추가경정 세입·세출 예산(안) 제출",
        body:"수신  "+S()+"운영위원회위원장\n\n1. 관련 : "+(PRI?"「초·중등교육법」 제32조, 「사립학교법」 제29조제4항":"「초·중등교육법」 제30조의3 및 제32조")+", "+S()+"운영위원회 규정 제○조\n\n2. "+y+"학년도 "+ACCT+" 제"+n+"회 추가경정 세입·세출 예산(안)을 붙임과 같이 확정하였으며 학교운영위원회 심의안건으로 제출하고자 합니다.\n\n붙임  "+y+"학년도 "+ACCT+" 제"+n+"회 추가경정 세입·세출 예산(안) 1부.  끝."});
      if(PRI) L.push({st:4,kind:"out",title:y+"학년도 "+S()+" 제"+n+"회 추가경정예산서 제출",
        body:"수신  "+f("gov","관할청")+"\n\n1. 관련 : 「사립학교법 시행령」 제14조제2항\n\n2. "+y+"학년도 "+S()+" "+ACCT+" 제"+n+"회 추가경정예산이 "+D("fix","20○○. ○○. ○○.")+" 이사회 의결로 확정되어 붙임과 같이 제출합니다.\n\n붙임  1. "+y+"학년도 제"+n+"회 추가경정 세입·세출 예산서 1부\n      2. 학교운영위원회 회의록 사본 1부\n      3. 이사회 회의록 사본 1부.  끝."});
      else L.push({st:3,kind:"in",title:y+"학년도 "+ACCT+" 제"+n+"회 추가경정 세입·세출예산서 공개",
        body:"1. 관련 : 「경상남도 공립학교회계 규칙」 제52조\n\n2. "+y+"학년도 "+ACCT+" 제"+n+"회 추가경정 세입·세출예산서를 다음과 같이 공개하고자 합니다.\n\n  가. 공개일 : "+D("pubd","20○○. ○○. ○○.")+"\n  나. 공개방법 : 학교 누리집 ⇒ \"학교회계현황\"에 탑재\n\n붙임  "+y+"학년도 "+ACCT+" 제"+n+"회 추가경정 세입·세출예산서 1부.  끝."}); }
    if(c.k==="iy"||c.k==="jy"){ var iy=c.k==="iy";
      L.push({st:1,kind:"in",title:f("name","○○")+"에 따른 예산 "+(iy?"이용":"전용")+" 신청",
        body:(iy?"1. 관련 : "+S()+"-○○("+D("rd","20○○. ○○. ○○.")+")호.\n\n2. ":"")+f("why","○○○ 사유로 예산이 부족하여")+" 「"+RULE[ver]+"」 "+(PRI?"제21조":iy?"제17조":"제18조")+(iy?" 및 예산총칙 제"+f("chong","○")+"조":"")+"의 규정에 따라 다음과 같이 예산 "+(iy?"이용":"전용")+"을 신청하고자 합니다.\n\n- 예산 "+(iy?"이용":"전용")+" 신청 내역 -",tb:1,end:"끝."}); }
    if(c.k==="yb") L.push({st:1,kind:"in",title:f("name","○○")+" 예산 부족에 따른 예비비 사용 신청",
      body:"1. 관련 : "+(PRI?"「사학기관 재무·회계 규칙」 제19조":"「초·중등교육법」 제30조의2 및 「경상남도 공립학교회계 규칙」 제16조")+"\n\n2. "+f("why","○○○ 사유로 집행이 시급하나 관련 예산이 부족하여")+" 다음과 같이 예비비를 사용하고자 합니다.\n\n- 예비비 사용 내역 -",tb:1,end:"끝."});
    if(c.k==="iw"){ var kd=f("kind","명시"); L.push({st:1,kind:"in",title:y+"학년도 "+ACCT+" "+kd+"이월 "+(kd==="사고"?"결정":"사업 심의 요청"),
      body:"1. 관련 : 「"+RULE[ver]+"」 "+(PRI?"제22조":"제20조")+"\n\n2. "+(kd==="사고"?"회계연도 안에 지출원인행위를 하였으나 불가피한 사유로 지출하지 못한 경비를 다음과 같이 다음 연도로 이월하고자 합니다.":kd==="계속비"?"계속비 연도별 경비 중 지출하지 못한 금액을 사업완성 연도까지 다음과 같이 이월하고자 "+COM+"를 받고자 합니다.":"연도 안에 지출을 마치지 못할 것이 예상되는 경비를 다음과 같이 다음 연도로 이월하고자 "+COM+"를 받고자 합니다."),tb:1,end:"끝.",note:"경남 기안 예시에 이월 문안이 없어 규칙 조문으로 만든 문안이에요."}); }
    if(c.k==="gj") L.push({st:2,kind:"in",title:y+"학년도 "+ACCT+" 간주처리 예산 확정",
      body:"1. 관련 : "+ref+", "+y+"학년도 "+ACCT+" 예산총칙 제"+f("chong","○")+"조\n\n2. 회계연도 말 추가경정예산 확정 이후 목적이 지정된 "+f("name","○○사업비")+"가 교부되었으나 "+COM+"를 받을 시간적 여유가 없어, 예산총칙에 따라 다음과 같이 간주처리 예산을 확정하고 다음 회기 "+(PRI?"학교운영위원회 및 이사회":"학교운영위원회")+"에 보고하고자 합니다.",tb:1,end:"끝.",note:"경남 기안 예시에 간주처리 문안이 없어 기본지침 Ⅴ.3 문구로 만든 문안이에요."});
    return L; }

  /* ---- 명세서(결산서 붙임) ---- */
  function ijSheet(list){ var rows=[["정책","단위","세부","세부항목","원가목","증","감","이(전)용사유"].map(th)];
    list.forEach(function(c){ used(c).forEach(function(r,i){ rows.push([cell(r.pol),cell(r.unit),cell(r.biz),cell(r.item),cell(r.cost||""),cell(num(r.up)?won(num(r.up)):"",{al:"right"}),cell(num(r.dn)?won(num(r.dn)):"",{al:"right"}),cell(i===0?V(c,"why")+(c.k==="iy"?"에 따른 예산이용":"에 따른 예산전용"):"",{al:"left"})]); }); });
    return [P0("세 출 예 산 이(전) 용 명 세 서",{b:true,size:16,al:"center"}),PRI?P0("",{size:4}):P0("[별지 제2호서식]",{size:10}),P0("(단위: 원)",{al:"right",size:9.5}),{t:"tbl",w:[18,18,20,22,18,20,20,44],font:"m",size:9.5,pad:1,rows:rows}]; }
  function ybSheet(list){ var rows=[["정책사업","단위사업","세부사업","세부항목","원가통계비목","총사업비(예산현액)","예비비 지출 결정액","예비비 사용액","예비비 사용 잔액","지출 결정일","예비비 지출 결정 사유"].map(th)];
    list.forEach(function(c){ var r=used(c)[0]||{}, u=ybUse(r), us=num(c.f.spent); rows.push([cell(r.pol),cell(r.unit),cell(r.biz),cell(r.item),cell(r.cost),cell(won(num(r.bud)+u),{al:"right"}),cell(won(u),{al:"right"}),cell(won(us),{al:"right"}),cell(won(u-us),{al:"right"}),cell(dot(V(c,"fix"))),cell(V(c,"why"),{al:"left"})]); });
    return [P0("예 비 비 사 용 명 세 서",{b:true,size:16,al:"center"}),PRI?P0("",{size:4}):P0("[별지 제1호서식]",{size:10}),P0("(단위: 원)",{al:"right",size:9.5}),{t:"tbl",w:[14,14,15,15,15,18,17,15,15,15,24],font:"m",size:9,pad:1,rows:rows}]; }

  /* ---- 화면 부품 ---- */
  function grid(pn){ var g=el("div","tkgridf"); pn.appendChild(g); return g; }
  function sub(pn,t,s){ var h=el("div","bc-sub",t); if(s) h.appendChild(el("small",null,s)); pn.appendChild(h); return h; }
  function calc(pn){ var c=el("div","cv-calc"); pn.appendChild(c); return c; }
  function tiles(box,items){ box.textContent=""; items.forEach(function(x){ if(!x) return; var d=el("div","cv-num "+(x.c||"")); d.appendChild(el("span",null,x.l)); d.appendChild(el("b",null,x.v)); if(x.s) d.appendChild(el("small",null,x.s)); box.appendChild(d); }); }
  function chk(s,lim,okT,badT){ return s&&lim?(s<=lim?{s:okT,c:"ok"}:{s:badT,c:"bad"}):{s:"",c:""}; }
  function dd(s,done){ var n=dday(s); return s?{v:dot(s),s:ddTxt(n),c:done?"":ddCls(n)}:{v:"-",s:""}; }
  function fld(c,g,k,label,o){ o=o||{}; var f=el("label","tkf"); f.appendChild(el("span","tkfl",label)); var i;
    if(o.opts){ i=el("select"); o.opts.forEach(function(x){ var op=el("option",null,x); op.value=x; i.appendChild(op); }); i.value=V(c,k)||o.opts[0]; if(!V(c,k)){ c.f[k]=o.opts[0]; } }
    else { i=el("input"); i.type=o.type||"text"; if(o.ph) i.placeholder=o.ph; if(o.num) i.inputMode="numeric"; i.value=o.num&&V(c,k)?won(num(V(c,k))):V(c,k); }
    f.appendChild(i); if(o.hint) f.appendChild(el("small",null,o.hint)); g.appendChild(f);
    i.addEventListener(o.opts||o.type==="date"||o.type==="time"?"change":"input",function(){ c.f[k]=o.num?String(num(i.value)||""):i.value.trim(); put();
      if(prefill(c)){ put(); draw(); return; } if(o.redraw&&(o.opts||o.type==="date")){ draw(); return; } if(o.live) o.live(); repaint(); });
    if(o.redraw&&!o.opts&&o.type!=="date") i.addEventListener("change",function(){ draw(); });
    if(o.num) i.addEventListener("blur",function(){ i.value=V(c,k)?won(num(V(c,k))):""; });
    return i; }
  function ticks(pn,c,i,list){ if(!list||!list.length) return; sub(pn,"할 일"); var u=el("ul","bc-tk"); pn.appendChild(u); c.tk=c.tk||{};
    list.forEach(function(t,j){ var key=i+"."+j, li=el("li",c.tk[key]?"on":""), lb=el("label"), cb=el("input"); cb.type="checkbox"; cb.checked=!!c.tk[key];
      cb.onchange=function(){ c.tk[key]=cb.checked; li.className=cb.checked?"on":""; put(); }; lb.appendChild(cb); lb.appendChild(el("span",null,t)); li.appendChild(lb); u.appendChild(li); }); }
  function rowEditor(pn,c,up){ var k=rowKind(c), spec=COLS[k], box=el("div","bc-rows"); pn.appendChild(box);
    function paint(){ box.textContent=""; rows(c).forEach(function(r,ri){ var w=el("div","bc-row");
      spec.forEach(function(line){ var ln=el("div","bc-ln"); w.appendChild(ln);
        line.forEach(function(col){ var key=col[0], cc=el("label","bc-c"); cc.appendChild(el("span",null,col[1])); ln.appendChild(cc);
          if(key.charAt(0)==="_"){ var b=el("b"); cc.appendChild(b); col.out=b; return; }
          var x=el("input",col[4]?"r":""); x.value=col[4]&&r[key]?won(num(r[key])):(r[key]||""); if(col[2]) x.placeholder=col[2]; if(col[4]) x.inputMode="numeric"; cc.appendChild(x);
          if(col[3]) cc.style.gridColumn="span 2";
          x.oninput=function(){ r[key]=col[4]?String(num(x.value)||""):x.value; put(); live(w,r); if(up) up(); repaint(); };
          x.onblur=function(){ if(col[4]) x.value=r[key]?won(num(r[key])):""; }; }); });
      if(k!=="yb") w.appendChild(btn("×","x",function(){ c.rows.splice(ri,1); put(); paint(); if(up) up(); }));
      box.appendChild(w); live(w,r); }); }
    function live(w,r){ var outs=w.querySelectorAll(".bc-c b"); if(!outs.length) return; var o=outs[0];
      if(k==="ch"){ var d=chD(r); o.textContent=(num(r.old)||num(r.new))?sgn(d)+"원 · "+chFm(r):"-"; }
      if(k==="ij"){ var b=bal(r); o.textContent=won(b)+"원"; o.className=num(r.dn)&&num(r.dn)>b-num(r.fut)?"bad":""; }
      if(k==="yb"){ o.textContent=won(ybUse(r))+"원"; } }
    paint();
    if(k!=="yb") pn.appendChild(btn("+ 줄 더하기","bc-add",function(){ c.rows.push({}); put(); paint(); }));
    if(k==="sj") pn.appendChild(el("p","cv-law","신청액을 비우면 산출식으로 계산해요. 표는 천원 단위(세출 천원 미만 올림)로 만들어요."));
    if(k==="ch") pn.appendChild(el("p","cv-law","산출식은 지침 기재요령대로 '경정○원-기정○원=○천원'으로 만들어요. 확정된 성립전예산과 이·전용액·예비비 사용액·이월액은 추경에서 다시 조정하지 않아요."));
  }
  var OPEN=LS.get("bc.open",{});
  function docs(pn,c,i){ function now(){ return DOCS(c).filter(function(d){ return d.st===i; }); } var L=now(); if(!L.length) return;
    sub(pn,"기안문","넣은 값으로 채워요");
    var w=el("div","bc-docs"); pn.appendChild(w);
    L.forEach(function(d0,j){ var id=c.id+"."+i+"."+j, box=el("div","bc-doc"+(OPEN[id]?" open":"")), hd=btn("","bc-dh");
      hd.appendChild(el("span","who"+(d0.kind==="out"?" out":""),d0.kind==="out"?"시행문":"내부결재")); var tt=el("span","tt",d0.title); hd.appendChild(tt); hd.appendChild(el("span","ar","›")); box.appendChild(hd);
      var bd=el("div","bc-db"); box.appendChild(bd); var pre=el("div","bc-txt"); bd.appendChild(pre);
      function cur(){ var d=now()[j]; return {d:d,tb:d.tb?table(c):null}; }
      function full(x){ var tb=x.tb; return x.d.body+(tb&&tb.rows.length?"\n\n"+tblText(tb):"")+(x.d.end?"\n\n  "+x.d.end:""); }
      function paint(){ var x=cur(), d=x.d, tb=x.tb; pre.textContent=""; tt.textContent=d.title; pre.appendChild(el("span","tl",d.title)); pre.appendChild(document.createTextNode(d.body));
        if(tb&&tb.rows.length){ var tw=el("div"); pre.appendChild(document.createTextNode(d.tbAfter?"\n\n[붙임 요약]\n":"\n")); tblHTML(tw,tb); pre.appendChild(tw); }
        if(d.end) pre.appendChild(document.createTextNode("\n  "+d.end)); }
      paint(); PAINT.push(paint); hd.onclick=function(){ box.classList.toggle("open"); OPEN[id]=box.classList.contains("open"); LS.set("bc.open",OPEN); if(OPEN[id]) paint(); };
      if(d0.note) bd.appendChild(el("p","cv-law",d0.note));
      var ft=el("div","bc-dfoot"), m=el("div","tkmsg"); bd.appendChild(ft);
      ft.appendChild(btn("제목 복사","btn ghost",function(){ cp(cur().d.title,m); }));
      ft.appendChild(btn("본문 복사","btn ghost",function(){ cp(full(cur()),m); }));
      ft.appendChild(btn("한글로","btn ghost",function(){ var x=cur(), d=x.d, tb=x.tb, bl=[P0(d.title,{b:true,size:15}),{t:"p",text:"",size:8}];
        d.body.split("\n").forEach(function(l){ var ind=/^\s{2,}/.test(l); bl.push(P0(l.replace(/^\s+/,""),ind?{ind:4,hang:3}:{})); });
        if(tb&&tb.rows.length) bl=bl.concat(tblBlock(tb)); if(d.end) bl.push(P0("  "+d.end));
        hwpx(bl,d.title,m); paint(); }));
      bd.appendChild(m); w.appendChild(box); }); }
  function cp(t,m){ (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ msg(m,"복사했어요.","ok"); },function(){ msg(m,"복사하지 못했어요. 글을 직접 골라 복사해 주세요.","warn"); }); }
  function choose(pn,c,k,label,opts,after){ var h=sub(pn,label), w=el("div","bc-sel"); pn.appendChild(w);
    opts.forEach(function(o){ var b=btn("","bc-opt"); b.setAttribute("aria-pressed",String(V(c,k)===o[0])); b.appendChild(document.createTextNode(o[0])); if(o[1]) b.appendChild(el("small",null,o[1]));
      b.onclick=function(){ c.f[k]=o[0]; put(); draw(); }; w.appendChild(b); }); if(after) after(); return h; }

  /* ---- 단계 화면 ---- */
  function stage(pn,c,i){ var k=c.k, g, x, E=fyEnd(Y()), stg=stgOf(c), lim, m;
    var endT={l:"회계연도 끝",v:dot(E),s:"이 날 뒤에는 할 수 없어요 · "+ddTxt(dday(E)),c:ddCls(dday(E))};
    if(k==="sj"){
      if(i===0){ choose(pn,c,"fund","어떤 돈인가요?",[["목적사업비·보조금 등","용도 지정 + 전액 교부"],["학교발전기금·다른학교회계 전입금·기타지원금","용도 지정 + 전액 교부"],["수익자부담경비(심의 거침)","1인당 징수한도액 등을 학운위가 심의"],["수익자부담경비(심의 전)",""],["용도가 정해지지 않은 돈",""]]);
        g=grid(pn); fld(c,g,"name","사업명",{ph:"예: 원어민 원격 화상 강의 지원비",redraw:1}); fld(c,g,"org","교부 기관",{ph:"○○교육지원청 ○○과"}); fld(c,g,"gno","교부 공문 번호",{ph:"○○과-0000"}); fld(c,g,"gd","교부 공문 날짜",{type:"date"}); fld(c,g,"gamt","교부액(원)",{num:1,live:function(){ up(); }});
        x=calc(pn); var up=function(){ var fd=V(c,"fund"), ok=/목적|발전기금|심의 거침/.test(fd), no=/심의 전|정해지지/.test(fd);
          tiles(x,[{l:"성립전 사용",v:!fd?"-":ok?"할 수 있어요":"안 돼요",s:!fd?"돈의 종류를 골라요":ok?"차기 추경에 꼭 반영":/심의 전/.test(fd)?"증액분을 먼저 학운위 심의(묻고 답하기 Q11)":"추경으로 편성해요",c:!fd?"":ok?"ok":"bad"},
            {l:"교부액",v:V(c,"gamt")?won(num(V(c,"gamt")))+"원":"-",s:"연간 교부예정 총액이 통보됐으면 총액으로 편성 가능(Q9)"},endT]); }; up();
        if(/심의 전|정해지지/.test(V(c,"fund"))) pn.appendChild(btn("추가경정예산으로 바꾸기","btn ghost",function(){ c.k="ch"; c.done={}; c.rows=[]; put(); view.open=0; draw(); })); }
      if(i===1){ x=calc(pn); var up1=function(){ var s=sum(c), ga=num(V(c,"gamt"));
          tiles(x,[{l:"신청액",v:s?won(s)+"원":"-",s:s?chon(s)+"천원":"아래 표를 채워요"},{l:"교부액과",v:ga&&s?(s===ga?"같아요":sgn(s-ga)+"원"):"-",s:ga?"교부액 "+won(ga)+"원":"교부 확인 단계에서 넣어요",c:ga&&s?(s===ga?"ok":s>ga?"bad":""):""},{l:"결재",v:"교장",s:"사업담당자 요구 → 예산담당자 검토"}]); };
        sub(pn,"신청 내역","산출식: 원 × 명 × 월 × 회"); rowEditor(pn,c,up1); up1(); }
      if(i===2){ g=grid(pn); fld(c,g,"fix","성립전예산 확정일",{type:"date",live:function(){ up2(); }}); x=calc(pn);
        var up2=function(){ tiles(x,[{l:"확정",v:V(c,"fix")?dot(V(c,"fix")):"-",s:"에듀파인 [예산운영]→[성립전예산관리] 결재"},{l:"집행",v:"확정 뒤",s:"목적에 맞게"},{l:"주의",v:"'등록' 상태로 두지 않기",s:"미확정 건이 있으면 추경이 진행되지 않아요(Q7)"}]); }; up2(); }
      if(i===3){ var nx=cases().filter(function(o){ return o.k==="ch"&&!o.done[stgOf(o).length-1]; });
        x=calc(pn); tiles(x,[{l:"차기 추경",v:nx.length?"제"+O(V(nx[0],"no"),"○")+"회 추경":"아직 없어요",s:nx.length?"올해 추경 사안":"추경 사안을 만들면 이어져요"},{l:"반영",v:"따로 조정 안 해요",s:"확정된 성립전은 차기 추경에 들어가요"},{l:"감액",v:"성립전으로는 못 줄여요",s:"추경 때 조정(창원 멘토링 Q2)"}]); } }
    if(k==="ch"){
      if(i===0){ g=grid(pn); fld(c,g,"no","회차",{ph:"1",redraw:1}); fld(c,g,"eduNo","교육 기안 문서번호",{ph:"○○○"}); fld(c,g,"edu","교직원 교육",{type:"date"}); fld(c,g,"eduT","시각",{type:"time"}); fld(c,g,"eduP","장소",{ph:"본교 ○○실"}); fld(c,g,"aud","참석대상",{ph:"본교 교직원 전원"}); fld(c,g,"reqD","요구서 제출 기한",{type:"date",live:function(){ up0(); }});
        x=calc(pn); var sj=cases().filter(function(o){ return o.k==="sj"&&o.done[2]&&!o.done[3]; });
        var up0=function(){ var r=dd(V(c,"reqD"),c.done[0]); tiles(x,[{l:"요구서 제출",v:r.v,s:r.s,c:r.c},{l:"성립전 반영",v:sj.length+"건",s:sj.length?won(sj.reduce(function(a,o){ return a+sum(o); },0))+"원 · 이번 추경에 들어가요":"확정된 성립전예산"},endT]); }; up0();
        choose(pn,c,"last","마지막 추경인가요?",[["아니요",""],["네(정리추경)","불용액 최소화 · 명시이월 심의 함께"]]); }
      if(i===1){ g=grid(pn); fld(c,g,"adj","예산조정회의",{type:"date"}); fld(c,g,"fixA","예산(안) 확정일",{type:"date"});
        x=calc(pn); var up1c=function(){ var rs=used(c), u=0, d=0; rs.forEach(function(r){ var v=chD(r); if(v>0) u+=v; else d-=v; });
          tiles(x,[{l:"증액",v:won(u)+"원",s:chon(u)+"천원"},{l:"감액",v:won(d)+"원",s:chon(d)+"천원"},{l:"순증감",v:sgn(u-d)+"원",s:"세입 증감과 맞춰요"}]); };
        sub(pn,"증감 내역","부서 요구를 조정한 결과"); rowEditor(pn,c,up1c); up1c();
        if(V(c,"last")==="네(정리추경)") pn.appendChild(el("p","bc-say","정리추경: 예산액을 조정해 불용액을 최소화하고, 수익자부담 사업은 징수결정액에 맞춰요. 명시이월할 사업은 이번 심의 때 함께 올려요(기본지침 Ⅴ.2·Ⅴ.7).")); }
      if(i===2){ g=grid(pn); fld(c,g,"subm","학운위 제출일",{type:"date",live:function(){ up2c(); }}); fld(c,g,"com","학운위 심의일",{type:"date"});
        x=calc(pn); var up2c=function(){ var cm=V(c,"com"), nt=cm?addDays(cm,-7):"", o=V(c,"subm")&&nt&&V(c,"subm")>nt;
          tiles(x,[{l:"위원 통지",v:nt?dot(nt)+"까지":"-",s:o?"제출이 통지 기한보다 늦어요":"회의 7일 전 개별 통지",c:o?"bad":""},{l:"심의",v:cm?dot(cm):"-",s:"학운위는 학교장 동의 없이 증액·새 목 불가"},PRI?{l:"다음",v:"이사회 의결",s:"사립학교법 제29조제4항"}:{l:"다음",v:"확정·공개",s:"심의 결과 통보 뒤"}]); }; up2c();
        pn.appendChild(btn("학운위 문서 도구 열기 →","cv-back",function(){ if(window.tkShow) window.tkShow("hk"); })); }
      if(PRI&&i===3){ g=grid(pn); fld(c,g,"brd","이사회 의결일",{type:"date"});
        x=calc(pn); tiles(x,[{l:"의결",v:V(c,"brd")?dot(V(c,"brd")):"-",s:"학운위 심의 뒤"},{l:"확정",v:V(c,"brd")?dot(V(c,"brd")):"-",s:"의결로 확정"},{l:"관할청 보고",v:V(c,"brd")?dot(addDays(V(c,"brd"),15))+"까지":"확정 후 15일",s:"시행령 제14조제2항"}]); }
      if((!PRI&&i===3)||(PRI&&i===4)){ g=grid(pn); fld(c,g,"fix","확정일",{type:"date",hint:PRI?"이사회 의결일로 채워요":"학운위 심의일로 채워요"});
        if(PRI){ fld(c,g,"rep","관할청 보고·공개일",{type:"date",hint:"확정 후 15일 안쪽 근무일로 채워요"}); fld(c,g,"gov","관할청(수신)",{ph:"예: 경상남도교육감"}); }
        else fld(c,g,"pubd","누리집 공개일",{type:"date",hint:"확정 후 10일 안쪽 근무일로 채워요"});
        lim=V(c,"fix")?addDays(V(c,"fix"),PRI?15:10):""; m=chk(V(c,PRI?"rep":"pubd"),lim,"기한 안이에요",(PRI?15:10)+"일을 넘겨요");
        x=calc(pn); tiles(x,[{l:"확정",v:V(c,"fix")?dot(V(c,"fix")):"-",s:"에듀파인 '추경예산안확정'"},{l:PRI?"보고·공개 기한":"공개 기한",v:lim?dot(lim)+"까지":"확정 후 "+(PRI?15:10)+"일",s:m.s,c:m.c},{l:"공개",v:PRI?"관할청 + 누리집":"누리집 학교회계현황",s:PRI?"사학 지침":"규칙 제52조"}]); } }
    if(k==="iy"||k==="jy"){ var iy=k==="iy", ck=ijCheck(c);
      if(i===0){ g=grid(pn); fld(c,g,"name","사안",{ph:iy?"예: 교무행정원 출산휴가 대체인력":"예: 배수로 시설 보수",redraw:1}); fld(c,g,"why","사유(기안 문장)",{ph:"예: ○○ 사유로 인건비가 부족하여"});
        if(iy){ fld(c,g,"chong","예산총칙 이용 조항",{ph:"예: 5"}); }
        x=calc(pn); tiles(x,[iy?{l:"예산총칙",v:V(c,"chong")?"제"+V(c,"chong")+"조":"조항 확인",s:PRI?"이용 범위를 미리 학운위 심의·이사회 의결로 정해 뒀어야 해요":"이용 범위를 미리 심의받았어야 해요",c:V(c,"chong")?"ok":""}:{l:"범위",v:"같은 정책사업 안",s:"단위사업·세부사업·목 사이"},{l:"먼저",v:"추경 가능?",s:"시간 여유가 있으면 추경 후 집행"},endT]); }
      if(i===1){ x=calc(pn); var upi=function(){ ck=ijCheck(c); var same=ck.up===ck.dn;
          tiles(x,[{l:"증 / 감",v:won(ck.up)+" / "+won(ck.dn),s:ck.n?(same?"맞아요":"증과 감이 달라요"):"아래 표를 채워요",c:ck.n?(same?"ok":"bad"):""},{l:"감액 줄 잔액",v:ck.over.length?ck.over.length+"줄 모자라요":ck.n?"넉넉해요":"-",s:ck.over.length?ck.over.join(", "):"예산잔액 − 향후소요액 안에서",c:ck.over.length?"bad":ck.n?"ok":""},
            {l:"제한",v:ck.bad.length?"안 되는 줄 있음":ck.fac?"시설비 확인":"걸리는 것 없어요",s:ck.bad.length?ck.bad.join(" · "):ck.fac?"규칙은 인건비만 빼지만 지침은 시설비도 빼요 · 교육청 안내 확인":"업무추진비·인건비"+(PRI?"·시설비":"")+" 검사",c:ck.bad.length?"bad":ck.n?"ok":""}]); };
        sub(pn,iy?"이용 신청 내역":"전용 신청 내역","예산잔액은 예산액 − 지출액"); rowEditor(pn,c,upi); upi();
        pn.appendChild(el("p","cv-law","정산재원(목적사업비·수익자부담경비·보조금·지원금)과 신규 사업은 이·전용할 수 없어요.")); }
      var fx=2;
      if(i===fx){ g=grid(pn); fld(c,g,"fix",iy?"이용 확정일":"전용 확정일",{type:"date",live:function(){ up3(); }}); x=calc(pn);
        var up3=function(){ var kf=chk(V(c,"fix"),fyEnd(Y()),"회계연도 안","회계연도가 끝났어요"); tiles(x,[{l:"확정",v:V(c,"fix")?dot(V(c,"fix")):"-",s:kf.s||"예산담당자 타당성 검토 후",c:kf.c},{l:"관리",v:"예산현액",s:"추경에서 다시 조정할 수 없어요"},PRI&&!iy?{l:"보고",v:"이사장에게",s:"재무·회계 규칙 제21조제4항"}:{l:"집행",v:"확정 뒤",s:"사업부서"}]); }; up3(); }
      if(i===stgOf(c).length-1){ x=calc(pn); tiles(x,[{l:(iy?"이용":"전용")+"액",v:won(ck.up)+"원",s:"결산서에 붙여요"},{l:"서식",v:PRI?"결산서 붙임":"별지 제2호",s:"세출예산 이(전)용 명세서"},{l:"사유",v:V(c,"why")?"넣었어요":"요건 단계에서",s:V(c,"why")}]);
        m=el("div","tkmsg"); pn.appendChild(btn("이 사안 명세서 한글로","btn ghost",function(){ hwpx(ijSheet([c]),"세출예산 이(전)용 명세서",m); })); pn.appendChild(m); } }
    if(k==="yb"){ var r=rows(c)[0];
      if(i===0){ g=grid(pn); fld(c,g,"name","사안",{ph:"예: 방송실 UPS배터리 교체",redraw:1}); fld(c,g,"why","사유(기안 문장)",{ph:"예: ○○ 고장으로 교체가 시급하나 관련 예산이 부족하여"});
        x=calc(pn); tiles(x,[{l:"쓸 수 있을 때",v:"예측 못 한 지출",s:"또는 재정 여건 변화로 초과 지출"},{l:"안 될 때",v:"단순 예산 부족",s:"감사 지적 사례 · 추경 가능하면 추경"},endT]); }
      if(i===1){ g=grid(pn); fld(c,g,"ybBal","예비비 예산잔액(원)",{num:1,live:function(){ upy(); }}); x=calc(pn);
        var upy=function(){ var u=ybUse(r), b=num(V(c,"ybBal")), bad=/업무추진비/.test((r.item||"")+(r.cost||"")+(r.nm||""));
          tiles(x,[{l:"예비비 사용액",v:won(u)+"원",s:"금회 소요액 − 해당 과목 잔액"},{l:"예비비 잔액",v:b?won(b)+"원":"-",s:b?(u<=b?"충분해요":"모자라요"):"넣으면 비교해요",c:b?(u<=b?"ok":"bad"):""},{l:"업무추진비",v:bad?"쓸 수 없어요":"해당 없음",s:"규칙 "+(PRI?"제19조":"제16조제1항"),c:bad?"bad":"ok"}]); };
        sub(pn,"사용 내역"); rowEditor(pn,c,upy); upy(); }
      if(i===2){ g=grid(pn); fld(c,g,"fix","사용 승인일",{type:"date"}); fld(c,g,"spent","실제 집행액(원)",{num:1});
        x=calc(pn); tiles(x,[{l:"승인",v:V(c,"fix")?dot(V(c,"fix")):"-",s:"지출요건·집행요구 타당성 확인"},{l:"예산",v:"사용 결정으로 성립",s:"차기 추경에 다시 계상하지 않아요"},endT]); }
      if(i===3){ x=calc(pn); tiles(x,[{l:"사용액",v:won(ybUse(r))+"원",s:"결정액"},{l:"서식",v:PRI?"결산서 붙임":"별지 제1호",s:"예비비 사용명세서"},{l:"심의",v:"결산 때 사후 심의",s:PRI?"학운위·이사회":"학운위"}]);
        m=el("div","tkmsg"); pn.appendChild(btn("이 사안 명세서 한글로","btn ghost",function(){ hwpx(ybSheet([c]),"예비비 사용명세서",m); })); pn.appendChild(m); } }
    if(k==="iw"){ var kd=V(c,"kind");
      if(i===0){ choose(pn,c,"kind","어떤 이월인가요?",[["명시","연도 안에 못 끝낼 것이 미리 예상돼요"],["사고","계약(원인행위)을 했지만 불가피한 사유로 못 썼어요"],["계속비","여러 해 사업의 못 쓴 금액"]]);
        x=calc(pn); kd=V(c,"kind"); tiles(x,[{l:"절차",v:kd==="사고"?"학교장 결정":kd?"사전 심의":"-",s:kd==="사고"?"심의 생략":kd?COM:""},{l:"이월금액",v:kd==="사고"?"원인행위액":kd==="계속비"?"사용잔액":kd?"예산액":"-",s:kd==="사고"?"부대경비 포함":""},{l:"결정 시기",v:kd==="사고"?"회계연도 말":kd==="계속비"?"예산 성립 때":kd?"최종 추경 때":"-",s:kd&&kd!=="사고"?"사업부서 신청은 최종 추경 편성 전":""}]);
        sub(pn,"이월 사업"); rowEditor(pn,c,null); }
      if(i===1){ g=grid(pn); if(kd==="사고") fld(c,g,"dec","학교장 결정일",{type:"date"}); else { fld(c,g,"com","학운위 심의일",{type:"date"}); if(PRI) fld(c,g,"brd","이사회 의결일",{type:"date"}); }
        x=calc(pn); tiles(x,[{l:kd==="사고"?"결정":"심의",v:dot(V(c,kd==="사고"?"dec":"com"))||"-",s:kd==="사고"?"출납폐쇄기한 후 10일 안":"명시이월은 심의 금액과 확정액이 다를 수 있어요"},endT,{l:"이월 안 하면",v:"불용액",s:"결산에서 잉여금으로"}]); }
      if(i===2){ g=grid(pn); fld(c,g,"cfm","이월 확정 입력일",{type:"date"});
        x=calc(pn); tiles(x,[{l:"입력 기한",v:kd==="명시"?"출납폐쇄기한 전":"예외기간 끝 + 10일",s:kd==="명시"?"명시이월비":"사고이월비·계속비(기본지침 Ⅴ.7)"},{l:"결산 순서",v:"이월 확정 → 마감",s:"→ 불용액 처리 → 잉여금"},{l:"합계",v:won(sum(c))+"원",s:used(c).length+"개 사업"}]); }
      if(i===3){ x=calc(pn); tiles(x,[{l:"집행기간",v:kd==="계속비"?"5년":"2년",s:kd==="명시"?"사고이월 시 3년":kd==="계속비"?"사고이월 시 6년":"재이월 불가"},{l:"다음 연도",v:"예산현액으로 관리",s:"새 예산에 계상하지 않아요"},{l:"재이월",v:kd==="사고"?"안 돼요":"원인행위액만 사고이월",s:""}]); } }
    if(k==="gj"){
      if(i===0){ g=grid(pn); fld(c,g,"chong","예산총칙 간주처리 조항",{ph:"예: 7"}); x=calc(pn);
        tiles(x,[{l:"기한",v:dot(E)+"까지",s:"회계연도 안 · "+ddTxt(dday(E)),c:ddCls(dday(E))},{l:"대상",v:"목적 지정 전입금·보조금·지원금",s:"수익자부담경비·자체재원 조정·반납 감액은 안 돼요"},{l:"예산총칙",v:V(c,"chong")?"제"+V(c,"chong")+"조":"조항 확인",s:"조항이 없으면 간주처리 못 해요",c:V(c,"chong")?"ok":""}]); }
      if(i===1){ g=grid(pn); fld(c,g,"name","사업명",{ph:"예: ○○ 목적사업비",redraw:1}); fld(c,g,"org","교부 기관",{ph:"○○교육지원청 ○○과"}); fld(c,g,"gno","교부 공문 번호",{ph:"○○과-0000"}); fld(c,g,"gd","교부 공문 날짜",{type:"date"});
        x=calc(pn); var upg=function(){ tiles(x,[{l:"편성액",v:won(sum(c))+"원",s:chon(sum(c))+"천원"},{l:"순서",v:"성립전 → 간주처리",s:"집행이 급하면 성립전으로 먼저"},endT]); };
        sub(pn,"편성 내역"); rowEditor(pn,c,upg); upg(); }
      if(i===2){ g=grid(pn); fld(c,g,"fix","간주처리 확정일",{type:"date"}); if(PRI) fld(c,g,"rep","관할청 보고일",{type:"date",hint:"확정 후 15일 안쪽 근무일로 채워요"}); else fld(c,g,"pubd","누리집 공개일",{type:"date",hint:"확정 후 10일 안쪽 근무일로 채워요"});
        var kf=chk(V(c,"fix"),E,"회계연도 안","3월에 확정하면 감사 지적 사례예요"); x=calc(pn);
        tiles(x,[{l:"확정",v:V(c,"fix")?dot(V(c,"fix")):"-",s:kf.s||dot(E)+"까지",c:kf.c},{l:PRI?"관할청 보고":"공개",v:V(c,"fix")?dot(addDays(V(c,"fix"),PRI?15:10))+"까지":"-",s:PRI?"추경 절차와 같이":"규칙 제52조"},{l:"다음",v:"다음 회기 보고",s:PRI?"학운위·이사회":"학운위"}]); }
      if(i===3){ g=grid(pn); fld(c,g,"com","보고한 학운위",{type:"date"}); if(PRI) fld(c,g,"brd","보고한 이사회",{type:"date"});
        x=calc(pn); tiles(x,[{l:"학운위 보고",v:V(c,"com")?dot(V(c,"com")):"-",s:"다음 회기"},PRI?{l:"이사회 보고",v:V(c,"brd")?dot(V(c,"brd")):"-",s:"다음 회기"}:null,{l:"근거",v:"기본지침 Ⅴ.3",s:"간주처리 예산"}]); } }
  }
  var TODO={
    sj:[["교부 공문의 용도·금액 확인","돈의 종류가 성립전 대상인지 확인"],["사업담당자가 성립전 예산 편성 요구(기안)","산출식은 원×명×월×회 순서로"],["예산담당자 검토·확정(에듀파인 결재 완료)","'등록' 상태 건 남기지 않기"],["차기 추경 때 반영 확인"]],
    ch:[["교직원 교육·예산요구서 배부","부서별 요구서 회수"],["예산조정회의","예산(안) 확정 기안"],["회의 7일 전 위원에게 예산안 통지","학운위 심의","심의 결과 학교장에게 통보"],PRI?["이사회 심사·의결"]:["에듀파인 추경예산안 확정","누리집 '학교회계현황' 공개"],PRI?["에듀파인 추경예산안 확정","관할청 보고","누리집 공개"]:[]],
    iy:[["예산총칙 이용 범위 확인"+(PRI?"(미리 학운위 심의·이사회 의결)":""),"추경으로 할 시간이 있는지 확인"],["사업·예산담당자 협의","이용 신청 기안"],["예산담당자 타당성 검토·확정","예산현액 확인"],["결산서에 이(전)용 명세서 붙이기"]],
    jy:[["같은 정책사업 안인지 확인","추경으로 할 시간이 있는지 확인"],["사업·예산담당자 협의","전용 신청 기안"],PRI?["예산담당자 타당성 검토·확정","이사장에게 보고"]:["예산담당자 타당성 검토·확정","예산현액 확인"],["결산서에 이(전)용 명세서 붙이기"]],
    yb:[["예비비 요건 확인(예측 못 한 지출·초과지출)","추경 후 집행이 가능한지 확인"],["예비비 신청 기안(사업담당자)"],["지출요건·집행요구 타당성 확인 후 승인","사업부서 집행"],["결산서에 예비비 사용명세서 붙이기"]],
    iw:[["이월 종류 판단","사업부서 이월 신청(최종 추경 편성 전)"],["학운위 사전심의 또는 학교장 결정"],["에듀파인 이월 확정 입력","이월마감"],["다음 연도 예산현액 확인"]],
    gj:[["예산총칙 간주처리 조항 확인","대상 재원인지 확인"],["집행이 급하면 성립전예산 먼저 편성"],["간주처리 예산안 확정","세입·세출예산 공개"+(PRI?"·관할청 보고":"")],["다음 회기 "+(PRI?"학운위·이사회":"학운위")+" 보고"]]
  };

  /* ---- 장부 ---- */
  function hero(){ var h=el("div","bc-hero");
    var md=el("select"); md.setAttribute("aria-label","공립·사립"); [["pub","공립 학교회계"],["pri","사립 교비회계"]].forEach(function(x){ var o=el("option",null,x[1]); o.value=x[0]; md.appendChild(o); }); md.value=ver;
    md.onchange=function(){ try{ localStorage.setItem("bud.mode",md.value); }catch(e){} build(root,md.value); }; h.appendChild(md);
    var si=el("input","sch"); si.placeholder="학교명 (예: ○○고등학교)"; si.setAttribute("aria-label","학교명"); si.value=P.f.school||""; si.oninput=function(){ P.f.school=si.value.trim(); put(); }; si.onchange=function(){ draw(); }; h.appendChild(si);
    var yl=el("label"), yi=el("input","yr"); yi.type="number"; yi.min="2025"; yi.max="2035"; yi.value=String(Y()); yl.appendChild(yi); yl.appendChild(document.createTextNode("학년도")); h.appendChild(yl);
    yi.onchange=function(){ P.f.year=yi.value; put(); view.c=null; draw(); };
    h.appendChild(el("span","sp")); var mb=btn("자료 내보내기","btn ghost"); h.appendChild(mb); app.appendChild(h);
    var setBox=el("div"); app.appendChild(setBox); mb.onclick=function(){ if(setBox.firstChild){ setBox.textContent=""; return; } settings(setBox); }; }
  function home(){ var cs=cases(), live=cs.filter(function(c){ return curStage(c)<stgOf(c).length; }), ij=cs.filter(function(c){ return c.k==="iy"||c.k==="jy"; }), yb=cs.filter(function(c){ return c.k==="yb"; }),
      sjw=cs.filter(function(c){ return c.k==="sj"&&c.done[2]&&!c.done[3]; });
    var su=el("div","cv-sum"); app.appendChild(su);
    [["진행 중",live.length+"건"],["이·전용",won(ij.reduce(function(a,c){ return a+sum(c); },0))+"원"],["예비비 사용",won(yb.reduce(function(a,c){ return a+sum(c); },0))+"원"],["추경 기다리는 성립전",sjw.length+"건"]].forEach(function(x){ var d=el("div"); d.appendChild(el("span",null,x[0])); d.appendChild(el("b",null,x[1])); su.appendChild(d); });
    var ac=el("div","bc-acts"); app.appendChild(ac); ac.appendChild(btn(view.pick?"닫기":"+ 새 사안","btn",function(){ view.pick=!view.pick; draw(); }));
    var m=el("div","tkmsg");
    if(ij.length) ac.appendChild(btn("이(전)용 명세서(결산)","btn ghost",function(){ hwpx(ijSheet(ij),Y()+"학년도 세출예산 이(전)용 명세서",m); }));
    if(yb.length) ac.appendChild(btn("예비비 사용명세서(결산)","btn ghost",function(){ hwpx(ybSheet(yb),Y()+"학년도 예비비 사용명세서",m); }));
    app.appendChild(m);
    if(view.pick){ var q=el("div","cv-q"); app.appendChild(q); var h4=el("h4"); h4.textContent="어떤 일인가요?"; q.appendChild(h4); q.appendChild(el("p",null,"예산을 바꿀 일이 생기면 원칙은 추경이에요. 추경을 기다릴 수 없을 때만 나머지를 써요."));
      var tl=el("div","cv-tiles"); q.appendChild(tl);
      KINDS.forEach(function(k){ var t=TY(k,PRI), b=btn("","cv-tile"); b.appendChild(el("b",null,t.n)); b.appendChild(el("small",null,t.h));
        b.onclick=function(){ var c={id:"c"+Date.now().toString(36),k:k,y:Y(),f:{},done:{},rows:[],tk:{},made:today()};
          if(k==="ch") c.f.no=String(cs.filter(function(o){ return o.k==="ch"; }).length+1);
          P.cases.push(c); put(); view.pick=false; view.c=c.id; view.open=0; draw(); top(); }; tl.appendChild(b); }); }
    app.appendChild(el("div","cv-h",Y()+"학년도 예산 변경 사안"));
    if(!cs.length){ app.appendChild(el("div","cv-empty","아직 사안이 없어요. '+ 새 사안'을 눌러 시작해요.")); return; }
    var w=el("div","cv-cases"); app.appendChild(w);
    cs.slice().sort(function(a,b){ var x=curStage(a)>=stgOf(a).length, y=curStage(b)>=stgOf(b).length; return x===y?(a.made<b.made?1:-1):x?1:-1; }).forEach(function(c){ var t=TY(c.k,PRI), n=stgOf(c).length, cur=curStage(c), b=btn("","cv-case");
      b.appendChild(el("span","bc-kind",t.n)); b.appendChild(el("h4",null,title(c)));
      var tr=el("div","cv-track"); for(var i=0;i<n;i++) tr.appendChild(el("i",c.done[i]?"on":i===cur?"cur":"")); b.appendChild(tr);
      var s=sum(c); b.appendChild(el("p",null,(cur>=n?"마침":"지금: "+t.stg[cur])+(s?" · "+won(s)+"원":"")));
      b.onclick=function(){ view.c=c.id; view.open=null; draw(); top(); }; if(U().delX) U().delX(b,title(c),function(){ P.cases=P.cases.filter(function(o){ return o!==c; }); put(); draw(); }); w.appendChild(b); }); }
  function title(c){ var t=TY(c.k,PRI); return c.title||(c.k==="ch"?"제"+O(V(c,"no"),"1")+"회 추경":c.k==="iw"?(V(c,"kind")||"")+"이월"+(used(c)[0]&&used(c)[0].biz?" · "+used(c)[0].biz:""):(V(c,"name")||t.n)); }
  function one(c){ var t=TY(c.k,PRI), stg=t.stg; if(prefill(c)) put();
    var bk=btn("← 사안 목록","cv-back",function(){ view.c=null; draw(); top(); }); app.appendChild(bk);
    var tt=el("div","bc-tt"); app.appendChild(tt); tt.appendChild(el("span","bc-kind",t.n)); var ti=el("input"); ti.value=title(c); ti.setAttribute("aria-label","사안 이름"); ti.onchange=function(){ c.title=ti.value.trim(); put(); }; tt.appendChild(ti);
    tt.appendChild(btn("지우기","cv-x",function(){ if(!confirm("이 사안을 지울까요?")) return; P.cases=P.cases.filter(function(o){ return o!==c; }); put(); view.c=null; draw(); }));
    var cur=curStage(c), sel=view.open==null?Math.min(cur,stg.length-1):Math.min(view.open,stg.length-1);
    var nv=el("nav","cv-idx"); nv.style.setProperty("--n",stg.length); app.appendChild(nv);
    stg.forEach(function(s,i){ var stt=c.done[i]?"done":i===cur?"cur":"todo", b=btn("","cv-ix "+stt+(i===sel?" sel":""),function(){ view.open=i; draw(); });
      if(i===sel) b.setAttribute("aria-current","step"); b.appendChild(el("span","n",stt==="done"?"✓":String(i+1))); b.appendChild(el("span","t",s)); nv.appendChild(b); });
    var pn=el("section","cv-pane"); app.appendChild(pn);
    var hd=el("div","cv-ph"); hd.appendChild(el("h4",null,stg[sel])); hd.appendChild(el("span",null,c.done[sel]?dot(c.done[sel])+" 마침":"")); pn.appendChild(hd);
    stage(pn,c,sel);
    ticks(pn,c,sel,(TODO[c.k]||[])[sel]);
    if(sel===0){ var lw=el("p","bc-say"); lw.appendChild(document.createTextNode(t.law+" ")); var a=el("a",null,"규칙 원문"); a.href=LAWURL[ver]; a.target="_blank"; a.rel="noopener"; lw.appendChild(a); pn.appendChild(lw); }
    docs(pn,c,sel);
    var nb=el("div","cv-next"); pn.appendChild(nb);
    if(c.done[sel]) nb.appendChild(btn("이 단계 다시 열기","btn ghost",function(){ delete c.done[sel]; put(); draw(); }));
    else nb.appendChild(btn(sel<stg.length-1?"이 단계 마쳤어요 · "+stg[sel+1]+"(으)로":"모두 마쳤어요","btn",function(){ c.done[sel]=today(); view.open=sel<stg.length-1?sel+1:sel; put(); draw(); top(); }));
    var pr=el("div","cv-pn"); pn.appendChild(pr);
    pr.appendChild(sel>0?btn("← "+stg[sel-1],"cv-back",function(){ view.open=sel-1; draw(); top(); }):el("span"));
    if(sel<stg.length-1) pr.appendChild(btn(stg[sel+1]+" →","cv-back",function(){ view.open=sel+1; draw(); top(); })); }
  function draw(){ PAINT=[]; app.textContent=""; hero(); var c=view.c&&P.cases.filter(function(o){ return o.id===view.c; })[0]; if(c) one(c); else { view.c=null; home(); } }
  function top(){ var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function settings(box){ box.textContent=""; var s=el("div","cv-set"); box.appendChild(s);
    var r=el("div","cv-btns"); s.appendChild(r); var m=el("div","tkmsg"); s.appendChild(m);
    r.appendChild(btn("내보내기","btn ghost",function(){ T.saveFile(new Blob([JSON.stringify(P,null,1)],{type:"application/json"}),(PRI?"사립":"공립")+"예산변경_"+Y()+"_"+today()+".json").then(function(){ msg(m,"내보냈어요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }));
    var lb=el("label","btn ghost","불러오기"), fi=el("input"); fi.type="file"; fi.accept=".json"; fi.hidden=true; lb.appendChild(fi); r.appendChild(lb);
    fi.onchange=function(){ var f=fi.files[0]; if(!f) return; f.text().then(function(t){ var j=JSON.parse(t); if(!j||!j.cases) throw 0; LS.set(KEY,j); build(root,ver); }).catch(function(){ msg(m,"예산 변경 파일을 읽지 못했어요.","bad"); }); }; }
  draw();
}
function mode(){ var m=null; try{ m=localStorage.getItem("bud.mode"); }catch(e){} return m==="pri"?"pri":"pub"; }
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.bc=function(r){ return build(r,mode()); };
})();
