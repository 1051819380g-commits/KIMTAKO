(function(){ "use strict";
var CSS=":host{--sub:var(--ink-2);--line2:var(--line-strong);--canvas:var(--surface-2);--navy:var(--accent);--navy-d:var(--accent);--mint:var(--accent-soft);--warn:#A8802A;--bad:var(--neg,#B23A2E);--bad-bg:rgba(178,58,46,.12);--ok:var(--pos,#1BA979);color:var(--ink)}\n:host{display:block;background:transparent;margin:0}:host{font:15px/1.6 \"Noto Sans KR\",-apple-system,\"Malgun Gothic\",sans-serif;color:var(--ink);font-synthesis:none;display:flow-root;padding:2px 2px 24px}\n.lede{color:var(--sub);font-size:14px;margin:0 0 18px}\n.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin-bottom:14px}\n.card h2{font-size:16px;font-weight:600;margin:0 0 10px;display:flex;gap:8px;align-items:baseline}\n.card h2 small{font-weight:400;color:var(--sub);font-size:13px}\n.drops{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}\n.drop{border:2px dashed #A9C3FF;background:var(--accent-soft);border-radius:10px;padding:14px;cursor:pointer;min-height:86px;display:flex;flex-direction:column;gap:4px}\n.drop:hover,.drop.over{background:var(--mint);border-color:var(--navy)}\n.drop b{font-weight:600}.drop span{font-size:13px;color:var(--sub)}\n.drop.done{border-style:solid;border-color:var(--navy);background:var(--surface)}\n.drop .fn{font-size:13px;color:var(--navy);word-break:break-all}\n.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 14px}\nlabel.f{display:flex;flex-direction:column;gap:3px;font-size:13px;color:var(--sub)}\ninput[type=text]{font:inherit;font-size:14px;padding:7px 9px;border:1px solid var(--line2);border-radius:6px;background:var(--surface);color:var(--ink);min-width:0}\ninput.num{text-align:right;font-variant-numeric:tabular-nums}\ninput.auto{background:var(--accent-soft);border-color:#A9C3FF}\n.sum{margin-top:8px;text-align:right;font-weight:600;color:var(--navy)}\n.btn{font:inherit;font-size:14px;border:1px solid var(--line2);background:var(--surface);border-radius:7px;padding:7px 14px;cursor:pointer}\n.btn:hover{background:var(--canvas)}\n.btn.pri{background:var(--navy);border-color:var(--navy);color:var(--surface);font-weight:600;padding:10px 20px;font-size:15px}\n.btn.pri:hover{background:var(--navy-d)}\n#dl{margin-left:4px;padding:10px 18px;font-size:15px}\n.btn:disabled{opacity:.45;cursor:not-allowed}\n.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}\n.msg{font-size:14px;border-radius:7px;padding:9px 12px;margin-top:10px;display:none}\n.msg.on{display:block}.msg.ok{background:var(--accent-soft);color:var(--ok)}.msg.warn{background:var(--warn-bg);color:var(--warn,#6F5418)}.msg.bad{background:var(--bad-bg);color:var(--bad)}\n.msg ul{margin:4px 0 0;padding-left:18px}\ntable{border-collapse:collapse;width:100%;font-size:13.5px}\nth,td{border-bottom:1px solid var(--line);padding:5px 6px;text-align:left;vertical-align:middle}\nth{font-weight:600;color:var(--sub);background:var(--surface-2)}\ntd input{width:100%;box-sizing:border-box;padding:5px 7px;font-size:13.5px}\ntd.k{white-space:nowrap}\n.cfgtbl td:nth-child(2) input{width:64px}\n.note{font-size:13px;color:var(--sub)}\ndetails summary{cursor:pointer;font-weight:600}\n.prev{overflow-x:auto;margin-top:10px}\n.prev table{font-size:13px;min-width:760px}\n.prev td.n{text-align:right;font-variant-numeric:tabular-nums}\n.prev tr.w td{background:var(--warn-bg);color:var(--bad);font-weight:600}\n.prev td.s{background:var(--surface-2);color:var(--sub);text-align:right}\n.chk{display:grid;grid-template-columns:auto 1fr auto auto;gap:2px 14px;font-size:14px;margin-top:6px}\n.chk .r{text-align:right;font-variant-numeric:tabular-nums}\n.badge{font-size:12px;border-radius:999px;padding:1px 8px}\n.newbox{margin-top:14px;padding:12px 14px;border:1px solid #EACF97;background:var(--warn-bg);border-radius:8px;font-size:14px}\n.newbox table{margin-top:8px;background:var(--surface)}\n.newbox td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}\n.newbox input.nb{width:56px}\n.badge.ok{background:var(--accent-soft);color:var(--ok)}.badge.bad{background:var(--bad-bg);color:var(--bad)}\n\nbutton,input{color:inherit}\n.cfgtbl td:nth-child(2) input{width:100%}\n#cfgBody td:nth-child(3),#optBody td:nth-child(4){width:72px}#cfgBody td:nth-child(3) input,#optBody td:nth-child(4) input{width:64px;text-align:center}\n#cfgBody td:nth-child(2){width:28%}#optBody td:nth-child(3){width:24%}\n.newbox input.nb{width:56px;text-align:center}\n@media (max-width:640px){.cfgtbl thead{display:none}.cfgtbl,.cfgtbl tbody{display:block}.cfgtbl tr{display:grid;grid-template-columns:72px minmax(0,1fr);gap:4px 8px;padding:8px 0;border-bottom:1px solid var(--line)}.cfgtbl td{display:block;border:0;padding:0;width:auto!important}.cfgtbl td.k{grid-column:1/-1;font-weight:600}.cfgtbl td input{width:100%!important}#cfgBody td:nth-child(2){grid-column:1/-1}#cfgBody td:nth-child(5){grid-column:1/-1}#optBody td:nth-child(3),#optBody td:nth-child(6){grid-column:1/-1}.cfgtbl td:not(.k)::before{display:block;font-size:11.5px;color:var(--sub)}#cfgBody td:nth-child(2)::before{content:'송금내역서 표시'}#cfgBody td:nth-child(3)::before{content:'은행코드'}#cfgBody td:nth-child(4)::before{content:'계좌번호'}#cfgBody td:nth-child(5)::before{content:'받는 분'}#optBody td:nth-child(3)::before{content:'송금내역서 표시'}#optBody td:nth-child(4)::before{content:'은행코드'}#optBody td:nth-child(5)::before{content:'계좌번호'}#optBody td:nth-child(6)::before{content:'받는 분'}#optBody td:nth-child(7)::before{content:none}}\n.prev table.ed td{padding:2px 4px}.prev input.pe{width:100%;box-sizing:border-box;border:1px solid transparent;background:transparent;font:inherit;padding:4px 5px;border-radius:5px;color:inherit}.prev input.pe:hover{border-color:var(--line2)}.prev input.pe:focus{border-color:var(--navy);background:var(--surface);outline:none}.prev input.pe.n{text-align:right;font-variant-numeric:tabular-nums}.prev input.pe.bk{width:52px;text-align:center}.prev tr.w input.pe{border-color:var(--line2);background:var(--surface)}.prev tr.w input.pe::placeholder{color:var(--bad);opacity:.7}", BODY="\n<p class=\"lede\">나이스 급여대장 2개와 사학연금 부담금 고지서·대여금 납부통지서를 올리면 송금내역서 엑셀을 만듭니다. 파일은 이 컴퓨터 안에서만 읽습니다.<\/p>\n\n<div class=\"card\">\n  <h2>1. 파일 올리기 <small>끌어다 놓거나 눌러서 고르기<\/small><\/h2>\n  <div class=\"drops\">\n    <label class=\"drop\" data-k=\"edu\"><b>교직원 급여대장<\/b><span>나이스 급여대장 엑셀(교원·기간제·행정직)<\/span><span class=\"fn\"><\/span><input type=\"file\" accept=\".xlsx\" hidden><\/label>\n    <label class=\"drop\" data-k=\"gong\"><b>공무직 급여대장<\/b><span>나이스 급여대장 엑셀(교육공무직)<\/span><span class=\"fn\"><\/span><input type=\"file\" accept=\".xlsx\" hidden><\/label>\n    <label class=\"drop\" data-k=\"tp\"><b>사학연금 부담금 고지서<\/b><span>공단 업무포털 PDF — 납부 뒤의 수납확인서도 됩니다<\/span><span class=\"fn\"><\/span><input type=\"file\" accept=\".pdf\" hidden><\/label>\n    <label class=\"drop\" data-k=\"loan\"><b>사학연금 대여금 납부통지서<\/b><span>공단 업무포털 PDF — 상환 계좌번호를 자동으로 채웁니다<\/span><span class=\"fn\"><\/span><input type=\"file\" accept=\".pdf\" hidden><\/label>\n    <label class=\"drop\" data-k=\"prev\"><b>지난 송금내역서 <small style=\"font-weight:400\">(처음 한 번)<\/small><\/b><span>예전 송금내역서 엑셀 — 항목별 은행코드·계좌·받는 분을 채웁니다<\/span><span class=\"fn\"><\/span><input type=\"file\" accept=\".xlsx\" hidden><\/label>\n  <\/div>\n  <div class=\"msg\" id=\"readMsg\"><\/div>\n<\/div>\n\n<div class=\"card\">\n  <h2>2. 이번 달 값 <small>사학연금 PDF를 올리면 법인부담금이 자동으로 채워집니다<\/small><\/h2>\n  <div class=\"grid\">\n    <label class=\"f\">교원 법인부담금<input type=\"text\" class=\"num\" id=\"vT\" inputmode=\"numeric\"><\/label>\n    <label class=\"f\">사무직 법인부담금<input type=\"text\" class=\"num\" id=\"vA\" inputmode=\"numeric\"><\/label>\n    <label class=\"f\">재해보상 법인부담금<input type=\"text\" class=\"num\" id=\"vD\" inputmode=\"numeric\"><\/label>\n    <label class=\"f\">대여금 상환 계좌번호 (매월 변경)<input type=\"text\" id=\"vAcct\" placeholder=\"대여금 납부통지서를 올리면 자동\"><\/label>\n  <\/div>\n  <div class=\"sum\" id=\"vSum\">법인부담금 합계: —<\/div>\n  <div id=\"chkBox\"><\/div>\n  <div id=\"newBox\"><\/div>\n<\/div>\n\n<div class=\"card\">\n  <div class=\"row\"><button class=\"btn pri\" id=\"go\" type=\"button\">송금내역서 만들기<\/button><button class=\"btn\" id=\"dl\" type=\"button\" disabled>엑셀 받기<\/button><span class=\"note\" id=\"goNote\">'만들기'로 미리보기를 확인한 뒤 엑셀을 받으세요.<\/span><\/div>\n  <div class=\"msg\" id=\"outMsg\"><\/div>\n  <div class=\"prev\" id=\"prev\"><\/div>\n<\/div>\n\n<div class=\"card\">\n  <details id=\"cfgDet\">\n    <summary>송금 항목 설정 (은행코드·계좌·받는 분) — 처음 한 번 입력하면 이 PC에 저장<\/summary>\n    <p class=\"note\">계좌와 받는 분은 길잡이 파일에 들어 있지 않고, 이 PC 브라우저에만 저장됩니다. 담당자가 바뀌면 '설정 내보내기' 파일을 넘겨주세요.\n    세금·건강보험·사학연금·공무직 기본 같은 고정 줄의 은행코드·계좌·받는 분은 <b>'기존 송금내역서로 채우기'<\/b>에 지난 송금내역서 엑셀을 넣어 채웁니다. 아래 표는 급여대장 공제 항목이고, '송금내역서 표시'는 엑셀 항목 칸에 적히는 이름입니다.<\/p>\n    <h3 style=\"display:none\">고정 항목 <small class=\"note\" style=\"font-weight:400\">— 세금·건강보험·기간제 4대보험·사학연금·대여금 상환·공무직 기본(직종별로 나뉘거나 합계 수식이 걸린 줄)<br>사학연금(개인부담) 줄의 송금액(C)은 개인부담금(G)이에요. 법인부담분은 F·H 칸, 공단 송금 총액은 F예요.<\/small><\/h3>\n    <table class=\"cfgtbl\" style=\"display:none\"><thead><tr><th>항목<\/th><th>송금내역서 표시<\/th><th>은행코드<\/th><th>계좌번호<\/th><th>받는 분<\/th><\/tr><\/thead><tbody id=\"cfgBody\"><\/tbody><\/table>\n    <h3 style=\"font-size:15px;margin:10px 0 6px\">급여대장 공제 항목 <small class=\"note\" style=\"font-weight:400\">— 급여대장을 올리면 '소득세' 뒤의 공제 열(공제회비·회비·식대·경조사비 …)이 열 이름 그대로 여기에 생깁니다. 금액이 0이 아닌 달에만 송금내역서에 들어갑니다<\/small><\/h3>\n    <table class=\"cfgtbl\"><thead><tr><th>급여대장<\/th><th>열 이름<\/th><th>송금내역서 표시<\/th><th>은행코드<\/th><th>계좌번호<\/th><th>받는 분<\/th><th><\/th><\/tr><\/thead><tbody id=\"optBody\"><\/tbody><\/table>\n    <div class=\"row\" style=\"margin-top:10px\">\n      <button class=\"btn\" type=\"button\" id=\"prevBtn\">기존 송금내역서로 채우기<\/button><input type=\"file\" id=\"prevFile\" accept=\".xlsx\" hidden>\n      <button class=\"btn\" type=\"button\" id=\"optAdd\">항목 직접 추가<\/button>\n      <button class=\"btn\" type=\"button\" id=\"cfgExp\">설정 내보내기<\/button>\n      <button class=\"btn\" type=\"button\" id=\"cfgImpBtn\">설정 불러오기<\/button><input type=\"file\" id=\"cfgImp\" accept=\".json\" hidden>\n      <button class=\"btn\" type=\"button\" id=\"cfgReset\">설정 지우기<\/button>\n      <span class=\"note\" id=\"cfgMsg\"><\/span>\n    <\/div>\n  <\/details>\n<\/div>\n\n";
function loadJs(u,sri){ return new Promise(function(ok,no){ var s=document.createElement("script"); if(sri){ s.integrity=sri; s.crossOrigin="anonymous"; } s.src=u; s.onload=ok; s.onerror=no; document.head.appendChild(s); }); }
function run(W){

"use strict";
/* ───────── 송금 항목 ─────────
   ① 고정 줄(FIXED): 직종별로 쪼개거나 수식이 걸려 급여대장 열 하나와 1:1이 아닌 것(세금·건강보험·기간제 4대보험·사학연금 법인부담·대여금 상환·공무직 기본).
   ② 급여대장 줄: 그 밖의 공제 열(공제회비·회비·식대·경조사비 …)은 올린 급여대장의 '소득세' 뒤 숫자 열을 읽어 열 이름 그대로 줄이 된다(열 순서대로, 금액 0은 뺀다).
   계좌·받는 분·표시 이름은 '송금 항목 설정'(이 PC 브라우저 저장). 급여대장 줄의 설정 열쇠 = "교직원|열이름" · "공무직|열이름" */
var FIXED=[
 ["tax","소득세"],["ltax","지방소득세"],["hT","교사건강"],["hK","기간제건강"],["hA","행정직건강"],["hR","건강보험장기요양소급"],
 ["npK","기간제국민연금"],["eiK","기간제고용"],["schP","사학연금(개인부담)"],["loan","대여금상환"],
 ["gTax","공무직소득세"],["gLtax","공무직지방소득세"],["gH","공무직건강"],["gNp","공무직국민연금"],["gEi","공무직고용"]];
/* 고정 줄이 이미 처리하는 급여대장 열 — 급여대장 줄에서 뺀다 */
var STRUCT_RE=/^(소득세|지방소득세|건강보험|노인장기요양보험|건강보험소급|장기요양소급|국민연금|고용보험)$|사학연금|군소급|연금대여|국고대여/;
var TOTAL_COLUMNS={'수당총액':1,'공제총액':1,'지급총금액':1};
var LS="kbg.songeum.cfg", LS_ACCT="kbg.songeum.loanAcct";

function store(){ try{ return window.localStorage; }catch(e){ return null; } }
function blankCfg(){ var c={fixed:{},items:{}}; FIXED.forEach(function(f){ c.fixed[f[0]]={bank:"",acct:"",label:f[1],recv:""}; }); return c; }
function itemKey(ledger,col){ return ledger+"|"+col; }
function blankItem(ledger,col){ return {bank:"",acct:"",label:(ledger==="공무직"?"공무직":"")+col,recv:""}; }
/* 예전 설정(v7 고정 줄 kTF·union… + opt[])을 급여대장 줄로 옮긴다 */
var OLD_FIXED={kTF:"교직원|교직원공제회비",union:"교직원|교원연합회비",club:"교직원|친목회비",meal:"교직원|식대",sport:"교직원|스포츠동호회",faith:"교직원|신우회회비",good:"교직원|좋은교육회비",gKTF:"공무직|교직원공제회비",gMeal:"공무직|식대"};
function mergeCfg(s){
  var c=blankCfg(); if(!s||typeof s!=="object") return c;
  Object.keys(c.fixed).forEach(function(k){ if(s.fixed&&s.fixed[k]) c.fixed[k]=Object.assign(c.fixed[k],s.fixed[k]); });
  if(c.fixed.schP&&c.fixed.schP.label==="사학연금법인부담") c.fixed.schP.label="사학연금(개인부담)";
  Object.keys(OLD_FIXED).forEach(function(k){ var o=s.fixed&&s.fixed[k]; if(o&&(o.bank||o.acct||o.recv)) c.items[OLD_FIXED[k]]=Object.assign(blankItem.apply(null,OLD_FIXED[k].split("|")),o); });
  (Array.isArray(s.opt)?s.opt:[]).forEach(function(o){ if(!o.col) return;
    c.items[itemKey("교직원",o.col)]={bank:o.bank||"",acct:o.acct||"",label:o.label||o.col,recv:o.recv||""};
    c.items[itemKey("공무직",o.col)]={bank:o.bank||"",acct:o.acct||"",label:"공무직"+(o.label||o.col),recv:o.recv||""}; });
  if(s.items&&typeof s.items==="object") Object.keys(s.items).forEach(function(k){ if(k.indexOf("|")>0) c.items[k]=Object.assign(blankItem.apply(null,k.split("|")),s.items[k]); });
  return c;
}
function loadCfg(){ var s=null; try{ s=JSON.parse(store().getItem(LS)||"null"); }catch(e){} return mergeCfg(s); }
function saveCfg(){ try{ store().setItem(LS,JSON.stringify(CFG)); }catch(e){} if(typeof invalidate==="function") invalidate(); }
var CFG=loadCfg();

/* ───────── 급여대장 xlsx 읽기 (첫 시트, 1행 = 머리글) ───────── */
function colNum(ref){ var m=/^([A-Z]+)/.exec(ref)[1], n=0; for(var i=0;i<m.length;i++) n=n*26+m.charCodeAt(i)-64; return n-1; }
function readXlsx(buf){
  return JSZip.loadAsync(buf).then(function(z){
    var P=new DOMParser(), rd=function(n){ var f=z.file(n); return f?f.async("string"):Promise.resolve(null); };
    return Promise.all([rd("xl/sharedStrings.xml"),rd("xl/workbook.xml"),rd("xl/_rels/workbook.xml.rels")]).then(function(r){
      var ss=[]; if(r[0]) [].forEach.call(P.parseFromString(r[0],"application/xml").getElementsByTagName("si"),function(si){
        ss.push([].filter.call(si.getElementsByTagName("t"),function(t){return t.parentNode.nodeName!=="rPh"}).map(function(t){return t.textContent}).join("")); });
      var target="xl/worksheets/sheet1.xml";
      try{ var rid=P.parseFromString(r[1],"application/xml").getElementsByTagName("sheet")[0].getAttribute("r:id");
        [].forEach.call(P.parseFromString(r[2],"application/xml").getElementsByTagName("Relationship"),function(x){
          if(x.getAttribute("Id")===rid){ var t=x.getAttribute("Target"); target=t.charAt(0)==="/"?t.slice(1):"xl/"+t.replace(/^\.\//,""); } }); }catch(e){}
      return rd(target).then(function(xml){
        if(!xml) throw new Error("엑셀의 첫 시트를 읽지 못했습니다.");
        var rows=[];
        [].forEach.call(P.parseFromString(xml,"application/xml").getElementsByTagName("row"),function(row){
          var cells=[];
          [].forEach.call(row.getElementsByTagName("c"),function(c){
            var t=c.getAttribute("t"), v=c.getElementsByTagName("v")[0], val=null;
            if(t==="s") val=v?ss[+v.textContent]:null;
            else if(t==="inlineStr"){ var is=c.getElementsByTagName("is")[0]; val=is?[].map.call(is.getElementsByTagName("t"),function(x){return x.textContent}).join(""):null; }
            else if(t==="str"||t==="b"||t==="e") val=v?v.textContent:null;
            else val=v&&v.textContent!==""?+v.textContent:null;
            if(val==="") val=null;
            cells[colNum(c.getAttribute("r"))]=val;
          });
          rows.push(cells);
        });
        var raw=rows.slice(), head=(rows.shift()||[]).map(function(h){ return h==null?"":String(h); });
        var data=rows.filter(function(r){ return r.some(function(v){return v!=null}); }).map(function(r){ var o={}; head.forEach(function(h,i){ if(h) o[h]=r[i]==null?null:r[i]; }); return o; });
        return {cols:head.filter(Boolean), rows:data, raw:raw};
      });
    });
  });
}

/* ───────── 기존 프로그램과 같은 계산 ───────── */
function isna(v){ return v==null||(typeof v==="number"&&isNaN(v)); }
function safeCol(row,name){ if(!row) return 0; var v=row[name]; if(isna(v)) return 0; return Math.trunc(+v)||0; }
function findColSum(T,rows,kw){ var cols=T.cols.filter(function(c){ return c.indexOf(kw)>=0&&!(kw==="사학연금"&&/대여|군소급/.test(c))&&!TOTAL_COLUMNS[c]; }); return Math.trunc(rows.reduce(function(s,r){ return s+cols.reduce(function(t,col){ return t+(isna(r[col])?0:+r[col]); },0); },0)); }
function orgs(T){ var L=[]; T.rows.forEach(function(r){ var o=r["기관분류"]; if(r["직종"]==="전체"&&typeof o==="string"&&/학교$/.test(o)&&L.indexOf(o)<0) L.push(o); }); return L; }
function ORG(T){ var L=orgs(T); return L.indexOf("고등학교")>=0?"고등학교":(L[0]||"고등학교"); }
function getSummary(T){ var g=ORG(T); return T.rows.filter(function(r){ return r["기관분류"]===g&&r["직종"]==="전체"; })[0]||null; }
function getSubtotal(T,job){ var g=ORG(T); return T.rows.filter(function(r){ return r["기관분류"]===g&&r["직종"]===job&&isna(r["직급"]); })[0]||null; }
function getEmployees(T){ var g=ORG(T); return T.rows.filter(function(r){ return r["기관분류"]===g&&r["직종"]!=="전체"&&!isna(r["성명"]); }); }
function isNumericCol(T,col){ var seen=false; for(var i=0;i<T.rows.length;i++){ var v=T.rows[i][col]; if(isna(v)) continue; if(typeof v!=="number") return false; seen=true; } return seen; }
/* 급여대장 줄이 되는 공제 열: '소득세' 뒤의 숫자 열 가운데 합계·고정 줄 열이 아닌 것 → [열, 총계 금액] (열 순서, 0은 뺌) */
function ledgerItems(T,sum){
  var i=T.cols.indexOf("소득세"); if(!sum||i<0) return [];
  return T.cols.slice(i).filter(function(c){ return !TOTAL_COLUMNS[c]&&!STRUCT_RE.test(c)&&isNumericCol(T,c); })
    .map(function(c){ return [c,safeCol(sum,c)]; }).filter(function(x){ return x[1]!==0; });
}
function ensureItems(T,ledger){ var n=0; ledgerItems(T,getSummary(T)).forEach(function(x){ var k=itemKey(ledger,x[0]); if(!CFG.items[k]){ CFG.items[k]=blankItem(ledger,x[0]); n++; } }); if(n) saveCfg(); return n; }
function hasAcct(x){ return !!(x&&x.bank&&x.acct); }

/* 행 = [은행, 계좌, C(금액 또는 수식), D(항목), E(받는 분), F, G, H] — 수식의 {r}은 그 행 번호 */
function buildRows(E,G,inp){
  var 총=getSummary(E), 교원=getSubtotal(E,"교원"), 기간=getSubtotal(E,"기간제교원"), 행직=getSubtotal(E,"행정직"), 공무=getSummary(G);
  if(!총) throw new Error("교직원 급여대장에서 '기관분류=○○학교, 직종=전체' 행을 찾을 수 없습니다.");
  if(!공무) throw new Error("공무직 급여대장에서 '기관분류=○○학교, 직종=전체' 행을 찾을 수 없습니다.");
  var emp=getEmployees(E);
  var 개인부담금=findColSum(E,emp,"사학연금")+findColSum(E,emp,"군소급");
  var 상환=findColSum(E,emp,"연금대여")+findColSum(E,emp,"국고대여");
  var 법인부담금=inp.T+inp.A+inp.D;
  /* 급여대장 줄: 계좌가 있으면 정식 줄, 없으면 맨 아래 노란 줄(신규) */
  var 신규=[], split=function(T,sum,ledger){ var ok=[]; ledgerItems(T,sum).forEach(function(x){ var it=CFG.items[itemKey(ledger,x[0])]; if(hasAcct(it)) ok.push([it.bank,it.acct,x[1],it.label||x[0],it.recv,null,null,null,{i:itemKey(ledger,x[0])}]); else 신규.push([ledger,x[0],x[1]]); }); return ok; };
  var 교줄=split(E,총,"교직원"), 공줄=split(G,공무,"공무직");
  var F=CFG.fixed, rows=[];
  function R(k,c,f,g,h,acct){ var x=F[k]; rows.push([x.bank,acct!=null?acct:x.acct,c,x.label,x.recv,f,g,h,{f:k}]); }
  function last(row,f,g,h){ row[5]=f; row[6]=g; row[7]=h; }
  R("tax",safeCol(총,"소득세"),null,null,null);
  R("ltax",safeCol(총,"지방소득세"),"건강","장기요양","합계");
  R("hT","=H{r}",safeCol(교원,"건강보험"),safeCol(교원,"노인장기요양보험"),"=F{r}+G{r}");
  R("hK","=H{r}",safeCol(기간,"건강보험"),safeCol(기간,"노인장기요양보험"),"=F{r}+G{r}");
  R("hA","=H{r}",safeCol(행직,"건강보험"),safeCol(행직,"노인장기요양보험"),"=F{r}+G{r}");
  R("hR","=H{r}",safeCol(총,"건강보험소급"),safeCol(총,"장기요양소급"),"=F{r}+G{r}");
  R("npK",safeCol(기간,"국민연금"),"=SUM(F3:F5)","=SUM(G3:G5)","=SUM(H3:H5)");
  R("eiK",safeCol(기간,"고용보험"),null,null,null);
  교줄.forEach(function(r){ rows.push(r); });
  last(rows[rows.length-1],"전체부담금","개인부담금","법인부담금");   /* 사학연금 줄 바로 위 줄이 F·G·H 머리글을 든다(v7과 같음) */
  R("schP","=G{r}","=SUM(G{r}:H{r})",개인부담금,법인부담금);
  R("loan",상환,"=SUM(C1:C{r})","공제총액",null,inp.acct);
  var g0=rows.length+1;
  R("gTax",safeCol(공무,"소득세"),null,null,null);
  R("gLtax",safeCol(공무,"지방소득세"),null,null,null);
  R("gH","=H{r}",safeCol(공무,"건강보험"),safeCol(공무,"노인장기요양보험"),"=F{r}+G{r}");
  R("gNp",safeCol(공무,"국민연금"),null,null,null);
  R("gEi",safeCol(공무,"고용보험"),null,null,null);
  공줄.forEach(function(r){ rows.push(r); });
  last(rows[rows.length-1],"=SUM(C"+g0+":C{r})","=F"+(g0-1)+"+F{r}",null);   /* 공무직 마지막 줄: 공무직 합계·전체 합계 */
  var warn={};
  if(신규.length){
    rows.push(["","",null,"⚠️ 신규 항목 발견 - 계좌정보 확인 후 직접 입력","",null,null,null]); warn[rows.length]=1;
    신규.forEach(function(x){ rows.push(["","",x[2],"["+x[0]+"] "+x[1],"",null,null,null,{n:itemKey(x[0],x[1])}]); warn[rows.length]=1; });
  }
  var 차=[], g=ORG(E); ["건강보험","노인장기요양보험"].forEach(function(k){ var d=safeCol(총,k)-safeCol(교원,k)-safeCol(기간,k)-safeCol(행직,k); if(d) 차.push([k,d]); });
  var 직=E.rows.filter(function(r){ return r["기관분류"]===g&&r["직종"]!=="전체"&&isna(r["직급"])&&["교원","기간제교원","행정직"].indexOf(r["직종"])<0&&(safeCol(r,"건강보험")||safeCol(r,"노인장기요양보험")); }).map(function(r){ return r["직종"]; });
  return {rows:rows,warn:warn,개인부담금:개인부담금,법인부담금:법인부담금,상환:상환,신규:신규,차:차,직:직,org:g,orgs:orgs(E)};
}

/* ───────── 수식 계산: 이 도구가 쓰는 꼴(셀, 셀+셀, SUM(범위))만. 글자 칸은 0(엑셀 SUM과 같음) ───────── */
function evalRows(B){
  var raw={}, val={};
  B.rows.forEach(function(row,i){ var r=i+1; for(var ci=0;ci<8;ci++){ var v=row[ci]; if(typeof v==="string") v=v.replace(/\{r\}/g,r); if(v!=null&&v!=="") raw[COLS[ci]+r]=v; } });
  function get(ref){
    if(ref in val) return val[ref];
    var v=raw[ref];
    if(typeof v==="string"&&v.charAt(0)==="="){ val[ref]=0; return (val[ref]=calc(v.slice(1))); }
    return (val[ref]=typeof v==="number"?v:0);
  }
  function rng(a,b){ var s=0; for(var c=a.charCodeAt(0);c<=b.charCodeAt(0);c++) for(var r=+a.slice(1);r<=+b.slice(1);r++) s+=get(String.fromCharCode(c)+r); return s; }
  function calc(f){ return f.split("+").reduce(function(s,t){ t=t.trim(); var m=/^SUM\(([A-H]\d+):([A-H]\d+)\)$/.exec(t);
    if(m) return s+rng(m[1],m[2]); if(/^[A-H]\d+$/.test(t)) return s+get(t); throw new Error("계산할 수 없는 수식: ="+f); },0); }
  Object.keys(raw).forEach(get);
  return {raw:raw,val:val};
}

/* ───────── xlsx 쓰기 (기존 프로그램과 같은 글꼴·테두리·채움·열 너비) ───────── */
var COLS="ABCDEFGH";
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
/* 글자는 엑셀처럼 공용 글자 목록(sharedStrings)에 넣는다 — 칸 안에 바로 쓰는(inlineStr) 꼴은 농협 인터넷뱅킹 대량이체가 읽지 못했다(2026-11) */
/* 엑셀 기본 테마(Office Theme) — 농협 인터넷뱅킹은 테마가 없는 xlsx를 읽다 멈췄다(2026-11, 엑셀 저장본엔 늘 있음) */
var THEME1="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><a:theme xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" name=\"Office Theme\"><a:themeElements><a:clrScheme name=\"Office\"><a:dk1><a:sysClr val=\"windowText\" lastClr=\"000000\"/></a:dk1><a:lt1><a:sysClr val=\"window\" lastClr=\"FFFFFF\"/></a:lt1><a:dk2><a:srgbClr val=\"1F497D\"/></a:dk2><a:lt2><a:srgbClr val=\"EEECE1\"/></a:lt2><a:accent1><a:srgbClr val=\"4F81BD\"/></a:accent1><a:accent2><a:srgbClr val=\"C0504D\"/></a:accent2><a:accent3><a:srgbClr val=\"9BBB59\"/></a:accent3><a:accent4><a:srgbClr val=\"8064A2\"/></a:accent4><a:accent5><a:srgbClr val=\"4BACC6\"/></a:accent5><a:accent6><a:srgbClr val=\"F79646\"/></a:accent6><a:hlink><a:srgbClr val=\"0000FF\"/></a:hlink><a:folHlink><a:srgbClr val=\"800080\"/></a:folHlink></a:clrScheme><a:fontScheme name=\"Office\"><a:majorFont><a:latin typeface=\"Cambria\"/><a:ea typeface=\"\"/><a:cs typeface=\"\"/><a:font script=\"Jpan\" typeface=\"ＭＳ Ｐゴシック\"/><a:font script=\"Hang\" typeface=\"맑은 고딕\"/><a:font script=\"Hans\" typeface=\"宋体\"/><a:font script=\"Hant\" typeface=\"新細明體\"/><a:font script=\"Arab\" typeface=\"Times New Roman\"/><a:font script=\"Hebr\" typeface=\"Times New Roman\"/><a:font script=\"Thai\" typeface=\"Tahoma\"/><a:font script=\"Ethi\" typeface=\"Nyala\"/><a:font script=\"Beng\" typeface=\"Vrinda\"/><a:font script=\"Gujr\" typeface=\"Shruti\"/><a:font script=\"Khmr\" typeface=\"MoolBoran\"/><a:font script=\"Knda\" typeface=\"Tunga\"/><a:font script=\"Guru\" typeface=\"Raavi\"/><a:font script=\"Cans\" typeface=\"Euphemia\"/><a:font script=\"Cher\" typeface=\"Plantagenet Cherokee\"/><a:font script=\"Yiii\" typeface=\"Microsoft Yi Baiti\"/><a:font script=\"Tibt\" typeface=\"Microsoft Himalaya\"/><a:font script=\"Thaa\" typeface=\"MV Boli\"/><a:font script=\"Deva\" typeface=\"Mangal\"/><a:font script=\"Telu\" typeface=\"Gautami\"/><a:font script=\"Taml\" typeface=\"Latha\"/><a:font script=\"Syrc\" typeface=\"Estrangelo Edessa\"/><a:font script=\"Orya\" typeface=\"Kalinga\"/><a:font script=\"Mlym\" typeface=\"Kartika\"/><a:font script=\"Laoo\" typeface=\"DokChampa\"/><a:font script=\"Sinh\" typeface=\"Iskoola Pota\"/><a:font script=\"Mong\" typeface=\"Mongolian Baiti\"/><a:font script=\"Viet\" typeface=\"Times New Roman\"/><a:font script=\"Uigh\" typeface=\"Microsoft Uighur\"/></a:majorFont><a:minorFont><a:latin typeface=\"Calibri\"/><a:ea typeface=\"\"/><a:cs typeface=\"\"/><a:font script=\"Jpan\" typeface=\"ＭＳ Ｐゴシック\"/><a:font script=\"Hang\" typeface=\"맑은 고딕\"/><a:font script=\"Hans\" typeface=\"宋体\"/><a:font script=\"Hant\" typeface=\"新細明體\"/><a:font script=\"Arab\" typeface=\"Arial\"/><a:font script=\"Hebr\" typeface=\"Arial\"/><a:font script=\"Thai\" typeface=\"Tahoma\"/><a:font script=\"Ethi\" typeface=\"Nyala\"/><a:font script=\"Beng\" typeface=\"Vrinda\"/><a:font script=\"Gujr\" typeface=\"Shruti\"/><a:font script=\"Khmr\" typeface=\"DaunPenh\"/><a:font script=\"Knda\" typeface=\"Tunga\"/><a:font script=\"Guru\" typeface=\"Raavi\"/><a:font script=\"Cans\" typeface=\"Euphemia\"/><a:font script=\"Cher\" typeface=\"Plantagenet Cherokee\"/><a:font script=\"Yiii\" typeface=\"Microsoft Yi Baiti\"/><a:font script=\"Tibt\" typeface=\"Microsoft Himalaya\"/><a:font script=\"Thaa\" typeface=\"MV Boli\"/><a:font script=\"Deva\" typeface=\"Mangal\"/><a:font script=\"Telu\" typeface=\"Gautami\"/><a:font script=\"Taml\" typeface=\"Latha\"/><a:font script=\"Syrc\" typeface=\"Estrangelo Edessa\"/><a:font script=\"Orya\" typeface=\"Kalinga\"/><a:font script=\"Mlym\" typeface=\"Kartika\"/><a:font script=\"Laoo\" typeface=\"DokChampa\"/><a:font script=\"Sinh\" typeface=\"Iskoola Pota\"/><a:font script=\"Mong\" typeface=\"Mongolian Baiti\"/><a:font script=\"Viet\" typeface=\"Arial\"/><a:font script=\"Uigh\" typeface=\"Microsoft Uighur\"/></a:minorFont></a:fontScheme><a:fmtScheme name=\"Office\"><a:fillStyleLst><a:solidFill><a:schemeClr val=\"phClr\"/></a:solidFill><a:gradFill rotWithShape=\"1\"><a:gsLst><a:gs pos=\"0\"><a:schemeClr val=\"phClr\"><a:tint val=\"50000\"/><a:satMod val=\"300000\"/></a:schemeClr></a:gs><a:gs pos=\"35000\"><a:schemeClr val=\"phClr\"><a:tint val=\"37000\"/><a:satMod val=\"300000\"/></a:schemeClr></a:gs><a:gs pos=\"100000\"><a:schemeClr val=\"phClr\"><a:tint val=\"15000\"/><a:satMod val=\"350000\"/></a:schemeClr></a:gs></a:gsLst><a:lin ang=\"16200000\" scaled=\"1\"/></a:gradFill><a:gradFill rotWithShape=\"1\"><a:gsLst><a:gs pos=\"0\"><a:schemeClr val=\"phClr\"><a:shade val=\"51000\"/><a:satMod val=\"130000\"/></a:schemeClr></a:gs><a:gs pos=\"80000\"><a:schemeClr val=\"phClr\"><a:shade val=\"93000\"/><a:satMod val=\"130000\"/></a:schemeClr></a:gs><a:gs pos=\"100000\"><a:schemeClr val=\"phClr\"><a:shade val=\"94000\"/><a:satMod val=\"135000\"/></a:schemeClr></a:gs></a:gsLst><a:lin ang=\"16200000\" scaled=\"0\"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w=\"9525\" cap=\"flat\" cmpd=\"sng\" algn=\"ctr\"><a:solidFill><a:schemeClr val=\"phClr\"><a:shade val=\"95000\"/><a:satMod val=\"105000\"/></a:schemeClr></a:solidFill><a:prstDash val=\"solid\"/></a:ln><a:ln w=\"25400\" cap=\"flat\" cmpd=\"sng\" algn=\"ctr\"><a:solidFill><a:schemeClr val=\"phClr\"/></a:solidFill><a:prstDash val=\"solid\"/></a:ln><a:ln w=\"38100\" cap=\"flat\" cmpd=\"sng\" algn=\"ctr\"><a:solidFill><a:schemeClr val=\"phClr\"/></a:solidFill><a:prstDash val=\"solid\"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst><a:outerShdw blurRad=\"40000\" dist=\"20000\" dir=\"5400000\" rotWithShape=\"0\"><a:srgbClr val=\"000000\"><a:alpha val=\"38000\"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad=\"40000\" dist=\"23000\" dir=\"5400000\" rotWithShape=\"0\"><a:srgbClr val=\"000000\"><a:alpha val=\"35000\"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad=\"40000\" dist=\"23000\" dir=\"5400000\" rotWithShape=\"0\"><a:srgbClr val=\"000000\"><a:alpha val=\"35000\"/></a:srgbClr></a:outerShdw></a:effectLst><a:scene3d><a:camera prst=\"orthographicFront\"><a:rot lat=\"0\" lon=\"0\" rev=\"0\"/></a:camera><a:lightRig rig=\"threePt\" dir=\"t\"><a:rot lat=\"0\" lon=\"0\" rev=\"1200000\"/></a:lightRig></a:scene3d><a:sp3d><a:bevelT w=\"63500\" h=\"25400\"/></a:sp3d></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val=\"phClr\"/></a:solidFill><a:gradFill rotWithShape=\"1\"><a:gsLst><a:gs pos=\"0\"><a:schemeClr val=\"phClr\"><a:tint val=\"40000\"/><a:satMod val=\"350000\"/></a:schemeClr></a:gs><a:gs pos=\"40000\"><a:schemeClr val=\"phClr\"><a:tint val=\"45000\"/><a:shade val=\"99000\"/><a:satMod val=\"350000\"/></a:schemeClr></a:gs><a:gs pos=\"100000\"><a:schemeClr val=\"phClr\"><a:shade val=\"20000\"/><a:satMod val=\"255000\"/></a:schemeClr></a:gs></a:gsLst><a:path path=\"circle\"><a:fillToRect l=\"50000\" t=\"-80000\" r=\"50000\" b=\"180000\"/></a:path></a:gradFill><a:gradFill rotWithShape=\"1\"><a:gsLst><a:gs pos=\"0\"><a:schemeClr val=\"phClr\"><a:tint val=\"80000\"/><a:satMod val=\"300000\"/></a:schemeClr></a:gs><a:gs pos=\"100000\"><a:schemeClr val=\"phClr\"><a:shade val=\"30000\"/><a:satMod val=\"200000\"/></a:schemeClr></a:gs></a:gsLst><a:path path=\"circle\"><a:fillToRect l=\"50000\" t=\"50000\" r=\"50000\" b=\"50000\"/></a:path></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>";
var SS=null;
function ssIdx(v){ if(!(v in SS.map)){ SS.map[v]=SS.list.length; SS.list.push(v); } SS.count++; return SS.map[v]; }
function cellXml(ref,v,s,cv){
  if(v==null) return '<c r="'+ref+'" s="'+s+'"/>';
  if(typeof v==="number") return '<c r="'+ref+'" s="'+s+'"><v>'+v+'</v></c>';
  if(v.charAt(0)==="=") return '<c r="'+ref+'" s="'+s+'"><f>'+esc(v.slice(1))+'</f>'+(typeof cv==="number"?'<v>'+cv+'</v>':'')+'</c>';
  return '<c r="'+ref+'" s="'+s+'" t="s"><v>'+ssIdx(v)+'</v></c>';
}
function writeXlsx(B){
  SS={map:Object.create(null),list:[],count:0};
  var n=B.rows.length, sx="", V=evalRows(B).val;
  B.rows.forEach(function(row,i){
    var r=i+1, w=!!B.warn[r], sub=function(v){ return typeof v==="string"?v.replace(/\{r\}/g,r):v; }, cs="";
    for(var ci=0;ci<5;ci++){ var v=ci===2?sub(row[2]):row[ci]; if(v==="") v=null;
      cs+=cellXml(COLS[ci]+r,v,w?(ci===0||ci===3||ci===4?5:6):(ci===0||ci===3||ci===4?1:2),V[COLS[ci]+r]); }
    for(ci=5;ci<8;ci++){ v=sub(row[ci]); if(v!=null) cs+=cellXml(COLS[ci]+r,v,(r===n&&ci===6)?4:3,V[COLS[ci]+r]); }
    sx+='<row r="'+r+'">'+cs+'</row>';
  });
  var W=[8,22,14,18,22,14,14,14];
  var sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:H'+n+'"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="16.5"/><cols>'+
    W.map(function(w,i){return '<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>'}).join("")+'</cols><sheetData>'+sx+'</sheetData><pageMargins left="0.75" right="0.75" top="1" bottom="1" header="0.5" footer="0.5"/></worksheet>';
  var font=function(sz,b,col){ return '<font>'+(b?'<b/>':'')+'<sz val="'+sz+'"/>'+(col?'<color rgb="FF'+col+'"/>':'')+'<name val="맑은 고딕"/><family val="3"/><charset val="129"/></font>'; };
  var styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
    '<fonts count="5">'+font(11)+font(12)+font(10)+font(11,1)+font(11,1,"C0392B")+'</fonts>'+
    '<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'+
    '<fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F2"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/></patternFill></fill></fills>'+
    '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/><diagonal/></border></borders>'+
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7">'+
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'+
    '<xf numFmtId="3" fontId="1" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'+
    '<xf numFmtId="3" fontId="1" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'+
    '<xf numFmtId="3" fontId="2" fillId="2" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'+
    '<xf numFmtId="3" fontId="3" fillId="2" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'+
    '<xf numFmtId="3" fontId="4" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'+
    '<xf numFmtId="3" fontId="4" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'+
    '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  var sst='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="'+SS.count+'" uniqueCount="'+SS.list.length+'">'+
    SS.list.map(function(t){ return '<si><t xml:space="preserve">'+esc(t)+'</t></si>'; }).join("")+'</sst>';
  var now=new Date().toISOString().replace(/\.\d+Z$/,"Z");
  var z=new JSZip(), put=function(p,d){ z.file(p,d,{createFolders:false}); };   /* 엑셀 저장본처럼 빈 폴더 항목 없이 */
  put("[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>');
  put("_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>');
  put("docProps/core.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dcterms:created xsi:type="dcterms:W3CDTF">'+now+'</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">'+now+'</dcterms:modified></cp:coreProperties>');
  put("docProps/app.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Microsoft Excel</Application></Properties>');
  put("xl/workbook.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="송금내역서" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029"/></workbook>');
  put("xl/_rels/workbook.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>');
  put("xl/theme/theme1.xml",THEME1);
  put("xl/styles.xml",styles);
  put("xl/sharedStrings.xml",sst);
  put("xl/worksheets/sheet1.xml",sheet);
  return z.generateAsync({type:"uint8array",compression:"DEFLATE"}).then(zipV20);
}
/* JSZip은 압축(deflate)한 항목에도 '풀 때 필요한 버전'을 1.0으로 적는다(규격은 2.0). 엑셀 저장본처럼 2.0으로 고친다 —
   엄격한 읽기 도구(은행 대량이체 등)가 여기서 멈출 수 있다. 중앙 목록을 따라가며 각 항목 머리만 고친다 */
function zipV20(u){
  var dv=new DataView(u.buffer,u.byteOffset,u.byteLength), e=u.length-22;
  while(e>=0&&dv.getUint32(e,true)!==0x06054b50) e--;
  if(e<0) return u;
  var n=dv.getUint16(e+10,true), p=dv.getUint32(e+16,true);
  for(var i=0;i<n&&dv.getUint32(p,true)===0x02014b50;i++){
    if(dv.getUint16(p+10,true)===8){ dv.setUint16(p+4,45,true); dv.setUint16(p+6,20,true); var lh=dv.getUint32(p+42,true); if(dv.getUint32(lh,true)===0x04034b50) dv.setUint16(lh+4,20,true); }
    p+=46+dv.getUint16(p+28,true)+dv.getUint16(p+30,true)+dv.getUint16(p+32,true);
  }
  return u;
}

/* ───────── 사학연금 PDF(고지서·수납확인서) 읽기 ───────── */
function pdfText(buf){
  var L=window.pdfjsLib; if(!L) return Promise.reject(new Error("PDF 읽기 도구를 불러오지 못했습니다(인터넷 연결 확인)."));
  L.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return L.getDocument({data:buf,cMapUrl:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",cMapPacked:true}).promise.then(function(doc){
    /* 공단 PDF는 한 글자씩 따로 나온다 → 같은 높이(줄)끼리 모아 x 순으로 놓고, 글자 사이가 붙어 있으면 한 단어로 잇는다.
       결과는 '단어 하나 = 한 줄'(표의 칸 하나가 한 단어) */
    var ps=[]; for(var i=1;i<=doc.numPages;i++) ps.push(doc.getPage(i).then(function(p){ return p.getTextContent().then(function(tc){
      var it=tc.items.filter(function(x){ return x.str&&x.str.trim(); }).map(function(x){ return {s:x.str,x:x.transform[4],y:x.transform[5],w:x.width||0,h:Math.abs(x.transform[3])||8}; });
      it.sort(function(a,b){ return Math.abs(a.y-b.y)>2.5?b.y-a.y:a.x-b.x; });
      var lines=[], cur=null;
      it.forEach(function(c){ if(!cur||Math.abs(cur.y-c.y)>2.5){ cur={y:c.y,c:[]}; lines.push(cur); } cur.c.push(c); });
      var out=[];
      lines.forEach(function(L){ L.c.sort(function(a,b){return a.x-b.x}); var w=null, end=0;
        L.c.forEach(function(c){ var gap=c.x-end; if(w!==null&&gap<Math.max(2.5,c.h*0.45)) w+=c.s; else { if(w!==null) out.push(w); w=c.s; } end=c.x+c.w; });
        if(w!==null) out.push(w); });
      return out.join("\n"); }); }));
    return Promise.all(ps).then(function(a){ return a.join("\n"); });
  });
}
function toN(s){ return s==null?null:+String(s).replace(/,/g,""); }
/* 글자 사이 줄바꿈·공백은 무시하고 '이름 뒤 숫자'를 찾는다(공단 PDF는 칸마다 글자가 따로 나온다) */
function parseTp(raw){
  /* raw = 단어 하나가 한 줄(pdfText). 표의 이름 칸 뒤에 이어지는 숫자 칸을 찾는다 */
  var tok=raw.split("\n").map(function(s){return s.trim()}).filter(Boolean), flat=tok.join("");
  var isNum=function(s){ return /^-?[0-9][0-9,]*$/.test(s); }, r={}, m;
  /* 이름(여러 단어로 쪼개져 있어도 됨) 뒤에서 '숫자 k개가 연달아 나오는 첫 묶음' */
  var after=function(re,k){
    for(var i=0;i<tok.length;i++) for(var len=1;len<=12&&i+len<=tok.length;len++){
      if(!re.test(tok.slice(i,i+len).join(""))) continue;
      for(var j=i+len;j+k<=tok.length;j++){ var ok=true; for(var q=0;q<k;q++) if(!isNum(tok[j+q])){ ok=false; break; } if(ok) return tok.slice(j,j+k).map(toN); }
      return null;
    }
    return null;
  };
  m=/(\d{4})년(\d{1,2})월분/.exec(flat); if(m) r.ym=m[1]+"-"+("0"+m[2]).slice(-2);
  r.kind=/수납확인서/.test(flat)?"수납확인서":/고지/.test(flat)?"고지서":"사학연금 자료";
  /* 인원 표기: 예전 '교원(12명)', 2026-11 고지서부터 '교원(12)명' — 둘 다 */
  var tch=after(/^교원\(\d+(명\)|\)명)$/,2), adm=after(/^사무직\(\d+(명\)|\)명)$/,2), d;
  if(tch){ r.tPer=tch[0]; r.tCorp=tch[1]; }
  if(adm){ r.aPer=adm[0]; r.aCorp=adm[1]; }
  m=/교원\((\d+)(명\)|\)명)/.exec(flat); if(m) r.tN=+m[1];
  m=/사무직\((\d+)(명\)|\)명)/.exec(flat); if(m) r.aN=+m[1];
  /* 재해보상부담금 '산출액'(법인부담) = 기존 프로그램의 '재해보상 법인부담금' 칸 */
  d=after(/^산출액$/,1); if(d) r.dCorp=d[0];
  /* 군소급 개인부담금(급여대장 대조용): 수납확인서는 '합산반납금 · 군소급개인부담금 · 타법인소급부담금' 머리 뒤에 숫자 3개 */
  /* 머리(합산반납금·군소급(개인)부담금·타법인소급부담금) 뒤 첫 숫자 묶음. 2026-11 고지서는 머리 줄 끝 오른쪽 칸 숫자(전월과오납)가 앞에 붙어 4개 → 끝에서 둘째가 군소급 */
  var hi=-1; tok.forEach(function(t,i){ if(hi<0&&/^타법인소급부담금$/.test(t)) hi=i; });
  if(hi>=0&&/군소급(개인)?부담금/.test(flat)){ var run=[]; for(var j=hi+1;j<tok.length;j++){ if(isNum(tok[j])) run.push(toN(tok[j])); else if(run.length>=3) break; else run=[]; } if(run.length>=3) r.army=run[run.length-2]; }
  else { d=after(/^군소급(개인)?부담금$/,1); if(d) r.army=d[0]; }
  /* 고지서에 납부 계좌(가상계좌)가 있으면 */
  m=/(가상계좌|납부계좌|입금계좌)[:：]?([0-9][0-9-]{8,})/.exec(flat); if(m) r.payAcct=m[2];
  return r;
}
/* 대여정기상환금 납부통지서: '납부은행 농협(11) · 계좌번호 … · 납부금액(A)(***1,234,567원) · 연체금(B)(***0원) · (2026년 11월)'
   통지서와 영수증 두 칸에 같은 값이 한 번씩 더 나온다 → 첫 값 */
function isLoanPdf(raw){ return /대여정기상환금/.test(raw.replace(/\s/g,"")); }
function parseLoan(raw){
  var flat=raw.replace(/\s/g,""), r={}, m;
  m=/상환금납부통지서\((\d{4})년(\d{1,2})월\)/.exec(flat); if(m) r.ym=m[1]+"-"+("0"+m[2]).slice(-2);
  m=/납부은행([가-힣A-Za-z]+)\((\d+)\)/.exec(flat); if(m){ r.bankName=m[1]; r.bankCode=m[2]; }
  m=/계좌번호(\d[\d-]{8,}\d)/.exec(flat); if(m) r.acct=m[1];
  m=/납부금액\(A\)\(\**([\d,]+)원\)/.exec(flat); if(m) r.amt=toN(m[1]);
  m=/연체금\(B\)\(\**([\d,]+)원\)/.exec(flat); if(m) r.late=toN(m[1]);
  return r;
}

/* ───────── 화면 ───────── */
var $=function(s){return W.querySelector(s)}, FILES={}, TP=null, LOAN=null;
function fmt(n){ return n==null?"—":Number(n).toLocaleString("ko-KR"); }
function num(id){ var v=$(id).value.replace(/[,\s원]/g,""); return v===""?0:(/^-?\d+$/.test(v)?+v:NaN); }
function msg(el,kind,html){ el.className="msg on "+kind; el.innerHTML=html; }
function updSum(){ var a=num("#vT"),b=num("#vA"),c=num("#vD"); $("#vSum").textContent="법인부담금 합계: "+([a,b,c].some(isNaN)?"숫자만 입력":fmt(a+b+c)+" 원"); }
["#vT","#vA","#vD"].forEach(function(id){ $(id).addEventListener("input",function(){ $(id).classList.remove("auto"); updSum(); invalidate(); }); });
$("#vAcct").addEventListener("input",function(){ $("#vAcct").classList.remove("auto"); invalidate(); });
try{ $("#vAcct").value=store().getItem(LS_ACCT)||""; }catch(e){}
$("#vAcct").addEventListener("change",function(){ try{ store().setItem(LS_ACCT,$("#vAcct").value.trim()); }catch(e){} });

function setFile(k,f){
  invalidate();
  var d=W.querySelector('.drop[data-k="'+k+'"]'); d.classList.add("done"); d.querySelector(".fn").textContent=f.name;
  f.arrayBuffer().then(function(buf){
    if(k==="tp"||k==="loan"){
      return pdfText(buf).then(function(txt){
        if(isLoanPdf(txt)){   /* 칸을 바꿔 올려도 내용을 보고 대여금 통지서로 읽는다 */
          if(k!=="loan"){ d.classList.remove("done"); d.querySelector(".fn").textContent=""; var d2=W.querySelector('.drop[data-k="loan"]'); d2.classList.add("done"); d2.querySelector(".fn").textContent=f.name; }
          LOAN=parseLoan(txt);
          if(LOAN.acct){ $("#vAcct").value=LOAN.acct; $("#vAcct").classList.add("auto"); try{ store().setItem(LS_ACCT,LOAN.acct); }catch(e){} }
          check();
          var bk=CFG.fixed.loan&&CFG.fixed.loan.bank, diff=LOAN.bankCode&&bk&&+bk!==+LOAN.bankCode;
          if(!LOAN.acct) msg($("#readMsg"),"warn","대여금 납부통지서에서 계좌번호를 찾지 못했습니다. 직접 입력하세요. (처음 보는 양식이면 파일을 알려 주시면 맞추겠습니다)");
          else msg($("#readMsg"),diff?"warn":"ok","대여금 납부통지서"+(LOAN.ym?" ("+LOAN.ym+")":"")+"에서 상환 계좌번호를 읽었습니다"+(LOAN.bankName?" — "+esc(LOAN.bankName)+"("+esc(LOAN.bankCode)+")":"")+"."+
            (diff?" ⚠️ 납부은행 코드("+esc(LOAN.bankCode)+")가 송금 항목 설정의 대여금상환 은행코드("+esc(bk)+")와 다릅니다. 설정을 확인하세요.":"")+
            (LOAN.late?" ⚠️ 연체금 "+fmt(LOAN.late)+"원이 있습니다.":""));
          return;
        }
        if(k==="loan"){ d.classList.remove("done"); d.querySelector(".fn").textContent=""; var d3=W.querySelector('.drop[data-k="tp"]'); d3.classList.add("done"); d3.querySelector(".fn").textContent=f.name; }
        TP=parseTp(txt);
        var got=[];
        if(TP.tCorp!=null){ $("#vT").value=fmt(TP.tCorp); $("#vT").classList.add("auto"); got.push("교원"); }
        if(TP.aCorp!=null){ $("#vA").value=fmt(TP.aCorp); $("#vA").classList.add("auto"); got.push("사무직"); }
        if(TP.dCorp!=null){ $("#vD").value=fmt(TP.dCorp); $("#vD").classList.add("auto"); got.push("재해보상"); }
        if(TP.payAcct&&!$("#vAcct").value) { $("#vAcct").value=TP.payAcct; }
        updSum(); check();
        if(got.length===3) msg($("#readMsg"),"ok","사학연금 "+TP.kind+(TP.ym?" ("+TP.ym+"분)":"")+"에서 법인부담금 3개를 읽었습니다.");
        else msg($("#readMsg"),"warn","사학연금 PDF에서 "+(got.length?got.join("·")+"만":"법인부담금을")+" 읽었습니다. 빠진 칸은 직접 입력하세요. (처음 보는 양식이면 파일을 알려 주시면 맞추겠습니다)");
      });
    }
    return readXlsx(buf).then(function(T){
      if(k==="prev"||(T.cols.indexOf("기관분류")<0&&looksPrev(T.raw))){
        if(k!=="prev"){ var old=FILES[k]&&FILES[k].fname; d.classList.toggle("done",!!old); d.querySelector(".fn").textContent=old||""; var dp=W.querySelector('.drop[data-k="prev"]'); dp.classList.add("done"); dp.querySelector(".fn").textContent=f.name; }
        var pr=fillFromPrev(T.raw||[]); if(!pr.f&&!pr.i) throw new Error(f.name+" — 송금내역서에서 은행코드·계좌가 있는 줄을 찾지 못했습니다(A 은행코드, B 계좌번호, D 항목, E 받는 분).");
        saveCfg(); renderCfg(); refreshNew();
        msg($("#readMsg"),"ok","지난 송금내역서에서 고정 항목 "+pr.f+"개, 급여대장 공제 항목 "+pr.i+"개의 은행코드·계좌·받는 분을 채웠습니다."); return; }
      if(!T.cols.length||T.cols.indexOf("기관분류")<0||T.cols.indexOf("직종")<0) throw new Error(f.name+" — 나이스 급여대장 형식(기관분류·직종 열)이 아닙니다.");
      T.fname=f.name; FILES[k]=T; ensureItems(T,k==="edu"?"교직원":"공무직"); renderCfg(); check(); refreshNew();
      var kinds={}; T.rows.forEach(function(r){ if(r["직종"]) kinds[r["직종"]]=1; });
      var isEdu=!!(kinds["교원"]||kinds["행정직"]);
      if(k==="edu"&&!isEdu) msg($("#readMsg"),"warn","교직원 칸에 공무직 급여대장을 올린 것 같습니다. 칸을 확인하세요.");
      else if(k==="gong"&&isEdu) msg($("#readMsg"),"warn","공무직 칸에 교직원 급여대장을 올린 것 같습니다. 칸을 확인하세요.");
      else msg($("#readMsg"),"ok",(k==="edu"?"교직원":"공무직")+" 급여대장을 읽었습니다("+T.rows.length+"행).");
    });
  }).catch(function(e){ msg($("#readMsg"),"bad",esc(e.message||e)); });
}
[].forEach.call(W.querySelectorAll(".drop"),function(d){
  var inp=d.querySelector("input"), k=d.dataset.k;
  inp.addEventListener("change",function(){ if(inp.files[0]) setFile(k,inp.files[0]); inp.value=""; });
  d.addEventListener("dragover",function(e){ e.preventDefault(); d.classList.add("over"); });
  d.addEventListener("dragleave",function(){ d.classList.remove("over"); });
  d.addEventListener("drop",function(e){ e.preventDefault(); d.classList.remove("over"); var f=e.dataTransfer.files[0]; if(f) setFile(k,f); });
});

/* 올린 급여대장의 공제 열 가운데 계좌가 아직 없는 것 → 여기서 계좌를 넣어 등록(다음 달부터 자동) */
function refreshNew(){
  var box=$("#newBox"); box.innerHTML="";
  var need=[];
  [["edu","교직원"],["gong","공무직"]].forEach(function(p){ var T=FILES[p[0]]; if(!T) return;
    ledgerItems(T,getSummary(T)).forEach(function(x){ var k=itemKey(p[1],x[0]); if(!hasAcct(CFG.items[k])) need.push([p[1],x[0],x[1],k]); }); });
  if(!need.length) return;
  var h='<div class="newbox"><b>급여대장 공제 항목 중 계좌가 없는 것 '+need.length+'개</b> — 은행코드와 계좌를 넣고 등록하면 이번 송금내역서부터 정식 줄로 들어가고, 다음 달부터는 자동입니다. 비워 두면 맨 아래 노란 줄로 나옵니다.'+
    '<table><tr><th>급여대장</th><th>열</th><th>금액</th><th>송금내역서 표시</th><th>은행코드</th><th>계좌번호</th><th>받는 분</th></tr>';
  need.forEach(function(x){ var it=CFG.items[x[3]]||blankItem(x[0],x[1]);
    h+='<tr data-key="'+esc(x[3])+'"><td class="k">'+esc(x[0])+'</td><td class="k">'+esc(x[1])+'</td><td class="n">'+fmt(x[2])+'</td><td><input type="text" class="nl" value="'+esc(it.label)+'"></td><td><input type="text" class="nb" maxlength="3" value="'+esc(it.bank)+'"></td><td><input type="text" class="na" value="'+esc(it.acct)+'"></td><td><input type="text" class="nr" value="'+esc(it.recv)+'"></td></tr>'; });
  h+='</table><div class="row" style="margin-top:8px"><button class="btn" type="button" id="newSave">등록</button><span class="note" id="newMsg"></span></div></div>';
  box.innerHTML=h;
  $("#newSave").onclick=function(){
    var n=0, skip=0;
    [].forEach.call(box.querySelectorAll("tr[data-key]"),function(tr){
      var g=function(c){ return tr.querySelector(c).value.trim(); }, k=tr.dataset.key, p=k.split("|");
      if(!g(".nb")||!g(".na")){ skip++; return; }
      CFG.items[k]={bank:g(".nb"),acct:g(".na"),label:g(".nl")||p[1],recv:g(".nr")}; n++;
    });
    if(!n){ $("#newMsg").textContent="은행코드와 계좌번호를 넣은 항목이 없습니다."; return; }
    saveCfg(); renderCfg(); refreshNew();
    msg($("#outMsg"),"ok",n+"개 항목을 등록했습니다"+(skip?"(계좌를 비운 "+skip+"개는 그대로)":"")+". '송금내역서 만들기'를 다시 누르면 반영됩니다.");
  };
}

/* 급여대장 ↔ 사학연금 개인부담금 대조 */
function check(){
  var box=$("#chkBox"); box.innerHTML="";
  if(!(TP||LOAN)||!FILES.edu) return;
  var E=FILES.edu, emp=getEmployees(E), per=findColSum(E,emp,"사학연금"), army=findColSum(E,emp,"군소급");
  var lines=[];
  if(TP&&TP.tPer!=null&&TP.aPer!=null) lines.push(["사학연금 개인부담금(교원+사무직)",per,TP.tPer+TP.aPer]);
  if(TP&&TP.army!=null) lines.push(["군소급 개인부담금",army,TP.army]);
  /* 대여금: 급여대장 '연금대여+국고대여' 공제 합계(송금내역서 대여금상환 줄 금액) ↔ 통지서 납부금액(A) */
  if(LOAN&&LOAN.amt!=null) lines.push(["대여금 상환(통지서 납부금액)",findColSum(E,emp,"연금대여")+findColSum(E,emp,"국고대여"),LOAN.amt]);
  if(!lines.length) return;
  var h='<div class="note" style="margin-top:12px">급여대장 공제액과 공단 '+esc(TP?TP.kind:"대여금 납부통지서")+(TP&&LOAN?"·대여금 납부통지서":"")+' 대조</div><div class="chk"><b>항목</b><b class="r">급여대장</b><b class="r">공단</b><b></b>';
  lines.forEach(function(l){ var ok=l[1]===l[2]; h+='<span>'+l[0]+'</span><span class="r">'+fmt(l[1])+'</span><span class="r">'+fmt(l[2])+'</span><span>'+(ok?'<span class="badge ok">일치</span>':'<span class="badge bad">차이 '+fmt(l[1]-l[2])+'</span>')+'</span>'; });
  box.innerHTML=h+'</div>';
}

/* 만들기 = 계산·미리보기·확인만. 엑셀은 '엑셀 받기'로만(확인할 때마다 파일이 받아지지 않게).
   만든 뒤 파일·값·설정이 바뀌면 받기를 잠근다(옛 결과를 받지 않게) */
var LAST=null;
function invalidate(){ OVR={}; if(!LAST) return; LAST=null; $("#dl").disabled=true; $("#goNote").textContent="파일이나 값이 바뀌었습니다. '만들기'를 다시 눌러 확인하세요."; }
$("#go").addEventListener("click",function(){
  var o=$("#outMsg");
  if(!FILES.edu||!FILES.gong){ msg(o,"warn","급여대장 2개(교직원·공무직)를 먼저 올려 주세요."); return; }
  var inp={T:num("#vT"),A:num("#vA"),D:num("#vD"),acct:$("#vAcct").value.trim()};
  if([inp.T,inp.A,inp.D].some(isNaN)){ msg(o,"bad","법인부담금은 숫자만 입력해 주세요. 예) 11,094,080"); return; }
  if(inp.T+inp.A+inp.D===0){ msg(o,"warn","법인부담금을 입력하거나 사학연금 PDF를 올려 주세요."); return; }
  if(!inp.acct){ msg(o,"warn","이번 달 대여금 상환 계좌번호를 입력해 주세요."); return; }
  try{ var B=buildRows(FILES.edu,FILES.gong,inp); }catch(e){ msg(o,"bad",esc(e.message)); return; }
  B.rows.forEach(function(row){ var k=rowKey(row[8]); if(k in OVR&&typeof row[2]==="number") row[2]=OVR[k]; });   /* 미리보기에서 고친 금액 유지 */
  preview(B); LAST=B; $("#dl").disabled=false; $("#goNote").textContent="아래 미리보기를 확인한 뒤 '엑셀 받기'를 누르세요.";
  var miss=FIXED.filter(function(f){ var x=CFG.fixed[f[0]]; return f[0]!=="loan"&&(!x.bank||!x.acct); }).map(function(f){return CFG.fixed[f[0]].label});
  var warns=[];
  if(B.신규.length) warns.push("계좌를 등록하지 않은 급여대장 공제 항목 "+B.신규.length+"건("+B.신규.map(function(x){return esc(x[1])}).join(", ")+")은 엑셀 맨 아래 노란 줄로 들어갑니다. 위 '계좌가 없는 것'에서 계좌를 넣고 등록하면 정식 줄로 들어갑니다.");
  if(B.차&&B.차.length) warns.push("교직원 급여대장 '전체' 행과 교원·기간제교원·행정직 소계 합이 다릅니다("+B.차.map(function(x){ return esc(x[0])+" "+fmt(x[1])+"원"; }).join(", ")+")"+(B.직&&B.직.length?" — "+B.직.map(esc).join(", ")+" 직종":"")+". 이 금액은 건강보험 줄에 들어가지 않았으니 해당 줄에 더해 주세요.");
  if(B.orgs&&B.orgs.length>1) warns.push("급여대장에 학교급이 여러 개("+B.orgs.map(esc).join(", ")+") 있어 "+esc(B.org)+" 행으로 만들었습니다.");
  if(miss.length) warns.push("송금 항목 설정에 계좌가 비어 있는 항목: "+miss.map(esc).join(", "));
  msg(o,warns.length?"warn":"ok","송금내역서를 만들었습니다("+B.rows.length+"줄)."+(warns.length?"<ul><li>"+warns.join("</li><li>")+"</li></ul>":""));
});
$("#dl").addEventListener("click",function(){
  if(!LAST) return;
  writeXlsx(LAST).then(function(u8){
    var ym=(TP&&TP.ym)||new Date().toISOString().slice(0,7);
    var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([u8],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
    a.download="송금내역서_"+ym+".xlsx"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500);
    $("#goNote").textContent="받았습니다 — "+a.download;
  }).catch(function(e){ msg($("#outMsg"),"bad","엑셀을 만들지 못했습니다: "+esc(e.message||e)); });
});
/* 미리보기 = 고칠 수 있는 표(11-18 Junho). 은행코드·계좌·항목·받는 분은 설정에 저장(다음 달에도), 금액은 이번 송금내역서에만(OVR).
   노란 신규 줄에 은행코드·계좌를 넣으면 등록하고 다시 만들어 제자리로 옮긴다. 줄마다 row[8]에 출처(f 고정 · i 급여대장 항목 · n 신규) */
var OVR={};
function rowKey(m){ return !m?"":m.f?"f:"+m.f:m.i?"i:"+m.i:m.n?"n:"+m.n:""; }
function keepCfg(){ try{ store().setItem(LS,JSON.stringify(CFG)); }catch(e){} }   /* 받기를 잠그지 않고 저장만 */
function preview(B){
  var V=evalRows(B), show=function(ref,v){ if(v==null||v==="") return ""; if(typeof v==="string"&&v.charAt(0)==="=") v=V.val[ref]; return typeof v==="number"?fmt(v):esc(v); };
  var h='<table class="ed"><tr><th>은행</th><th>계좌번호</th><th>금액</th><th>항목</th><th>받는 분</th><th>F</th><th>G</th><th>H</th></tr>';
  B.rows.forEach(function(row,i){ var r=i+1, w=B.warn[r], m=row[8], sub=function(v){ return typeof v==="string"?v.replace(/\{r\}/g,r):v; };
    var inp=function(c,cls,v,ph){ return '<td><input class="pe '+cls+'" data-i="'+i+'" data-c="'+c+'" value="'+esc(v==null?"":v)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></td>'; };
    if(!m){ h+='<tr'+(w?' class="w"':'')+'><td></td><td></td><td class="n">'+show("C"+r,sub(row[2]))+'</td><td>'+esc(row[3]||"")+'</td><td>'+esc(row[4]||"")+'</td><td class="s"></td><td class="s"></td><td class="s"></td></tr>'; return; }
    var lab=row[3]; if(m.n){ var it=CFG.items[m.n]; lab=(it&&it.label)||blankItem.apply(null,m.n.split("|")).label; }
    h+='<tr'+(w?' class="w"':'')+'>'+inp(0,"bk",row[0],m.n?"은행":"")+inp(1,"ac",row[1],m.n?"계좌번호 넣기":"")+
      (typeof row[2]==="number"?inp(2,"n",fmt(row[2])):'<td class="n">'+show("C"+r,sub(row[2]))+'</td>')+
      inp(3,"lb",lab)+inp(4,"rc",row[4])+
      [5,6,7].map(function(k){ return '<td class="s">'+show("FGH".charAt(k-5)+r,sub(row[k]))+'</td>'; }).join("")+'</tr>'; });
  $("#prev").innerHTML=h+'</table><p class="note">칸을 눌러 고칠 수 있습니다. 은행코드·계좌번호·항목·받는 분은 설정에 저장돼 다음 달에도 쓰이고, 금액은 이번 송금내역서에만 들어갑니다. 노란 줄에 은행코드와 계좌번호를 넣으면 등록되어 제자리로 옮겨집니다. 합계 칸은 엑셀에 수식과 계산값이 함께 들어갑니다.</p>';
  [].forEach.call($("#prev").querySelectorAll("input.pe"),function(el){ el.addEventListener("change",function(){ editCell(B,+el.dataset.i,+el.dataset.c,el.value.trim()); }); });
}
function editCell(B,i,c,v){
  var row=B.rows[i], m=row[8]; if(!m) return;
  if(c===2){ var n=+v.replace(/[,\s원]/g,""); if(v!==""&&isFinite(n)){ row[2]=Math.round(n); OVR[rowKey(m)]=row[2]; } preview(B); return; }
  var F=["bank","acct",null,"label","recv"][c];
  if(m.f==="loan"&&c===1){ row[1]=v; $("#vAcct").value=v; try{ store().setItem(LS_ACCT,v); }catch(e){} preview(B); return; }   /* 대여금 계좌는 이번 달 값 */
  if(m.n){ var p=m.n.split("|"), it=CFG.items[m.n]||(CFG.items[m.n]=blankItem(p[0],p[1])); it[F]=v||(F==="label"?blankItem(p[0],p[1]).label:"");
    keepCfg(); renderCfg();
    if(hasAcct(it)){ $("#go").click(); msg($("#outMsg"),"ok","‘"+esc(it.label)+"’ 계좌를 등록하고 송금내역서를 다시 만들었습니다. 다음 달부터는 자동으로 들어갑니다."); return; }
    if(c!==3) row[c]=v; preview(B); return; }
  var x=m.f?CFG.fixed[m.f]:CFG.items[m.i];
  if(x){ x[F]=v||(F==="label"?(m.f?FIXED.filter(function(f){ return f[0]===m.f; })[0][1]:m.i.split("|")[1]):""); keepCfg(); renderCfg(); row[c]=x[F]; }
  preview(B);
}
function looksPrev(raw){ return (raw||[]).filter(function(r){ return typeof r[3]==="string"&&r[3]&&(r[0]!=null||r[1]!=null); }).length>=3; }

/* ───────── 설정 표 ───────── */
function inpCell(v,on){ var i=document.createElement("input"); i.type="text"; i.value=v||""; i.addEventListener("change",function(){ on(i.value.trim()); saveCfg(); }); var td=document.createElement("td"); td.appendChild(i); return td; }
function renderCfg(){
  if(typeof refreshNew==="function") setTimeout(refreshNew,0);
  var b=$("#cfgBody"); b.innerHTML="";
  FIXED.forEach(function(f){ var x=CFG.fixed[f[0]], tr=document.createElement("tr"), k=document.createElement("td"); k.className="k"; k.textContent=f[1]; tr.appendChild(k);
    tr.appendChild(inpCell(x.label,function(v){x.label=v||f[1]}));
    tr.appendChild(inpCell(x.bank,function(v){x.bank=v}));
    if(f[0]==="loan"){ var td=document.createElement("td"); td.className="note"; td.textContent="위 '이번 달 값'에서 매달 입력"; tr.appendChild(td); } else tr.appendChild(inpCell(x.acct,function(v){x.acct=v}));
    tr.appendChild(inpCell(x.recv,function(v){x.recv=v})); b.appendChild(tr); });
  var ob=$("#optBody"); ob.innerHTML="";
  Object.keys(CFG.items).forEach(function(k){ var o=CFG.items[k], p=k.split("|"), tr=document.createElement("tr"), a=document.createElement("td"), c=document.createElement("td");
    a.className="k"; a.textContent=p[0]; c.className="k"; c.textContent=p[1]; tr.appendChild(a); tr.appendChild(c);
    tr.appendChild(inpCell(o.label,function(v){o.label=v||p[1]})); tr.appendChild(inpCell(o.bank,function(v){o.bank=v}));
    tr.appendChild(inpCell(o.acct,function(v){o.acct=v})); tr.appendChild(inpCell(o.recv,function(v){o.recv=v}));
    var td=document.createElement("td"), x=document.createElement("button"); x.className="btn"; x.type="button"; x.textContent="삭제"; x.onclick=function(){ delete CFG.items[k]; saveCfg(); renderCfg(); }; td.appendChild(x); tr.appendChild(td); ob.appendChild(tr); });
}
$("#optAdd").onclick=function(){ var col=prompt("급여대장 열 이름(머리글 그대로)"); if(!col) return; col=col.trim(); var led=confirm("교직원 급여대장의 열이면 [확인], 공무직 급여대장의 열이면 [취소]")?"교직원":"공무직";
  var k=itemKey(led,col); if(!CFG.items[k]) CFG.items[k]=blankItem(led,col); saveCfg(); renderCfg(); };
$("#cfgExp").onclick=function(){ var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(CFG,null,1)],{type:"application/json"})); a.download="송금항목설정.json"; document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); },500); };
$("#cfgImpBtn").onclick=function(){ $("#cfgImp").click(); };
$("#cfgImp").addEventListener("change",function(){ var f=this.files[0]; if(!f) return; f.text().then(function(t){ CFG=mergeCfg(JSON.parse(t)); saveCfg(); renderCfg(); $("#cfgMsg").textContent="설정을 불러왔습니다(예전 형식도 됩니다)."; })
  .catch(function(){ $("#cfgMsg").textContent="설정 파일을 읽지 못했습니다."; }); this.value=""; });
$("#cfgReset").onclick=function(){ if(!confirm("이 PC에 저장한 송금 항목 설정(계좌·받는 분)을 지울까요?")) return; try{ store().removeItem(LS); store().removeItem(LS_ACCT); }catch(e){} $("#vAcct").value=""; CFG=blankCfg(); renderCfg(); $("#cfgMsg").textContent="설정을 지웠습니다."; };/* 기존 송금내역서(이 도구·예전 프로그램이 만든 엑셀: A 은행코드, B 계좌번호, C 금액, D 항목, E 받는 분)로 설정 채우기
   - 고정 항목은 항목 이름(기본 이름·지금 표시 이름)으로 찾음. 대여금 계좌는 매달 바뀌어 은행코드·받는 분만
   - 나머지 줄은 급여대장 공제 항목: '공무직소득세' 줄 뒤(또는 '공무직'으로 시작)는 공무직, 앞은 교직원.
     지금 설정에 같은 표시 이름이 있으면 그 항목, 없으면 올린 급여대장의 같은 이름 열, 그것도 없으면 이름 그대로 새 항목 */
function normL(v){ return String(v==null?"":v).replace(/[\s·ㆍ()（）\[\]_\-]/g,""); }
function cellS(v){ return v==null?"":String(v).trim(); }
function fillFromPrev(raw){
  var nf=0, ni=0, gong=false, cols={"교직원":[],"공무직":[]}, byFix={};
  [["edu","교직원"],["gong","공무직"]].forEach(function(p){ if(FILES[p[0]]) cols[p[1]]=FILES[p[0]].cols; });
  FIXED.forEach(function(f){ byFix[normL(f[1])]=f[0]; byFix[normL(CFG.fixed[f[0]].label)]=f[0]; });
  byFix[normL("사학연금법인부담")]="schP"; byFix[normL("사학연금(개인부담)")]="schP";
  raw.forEach(function(row){
    var bank=cellS(row[0]), acct=cellS(row[1]), lab=cellS(row[3]), recv=cellS(row[4]);
    if(!lab||/신규 항목|^\[/.test(lab)||!(bank||acct)) return;
    if(/^\d{1,2}$/.test(bank)) bank=("00"+bank).slice(-3);   /* 숫자로 저장돼 앞 0이 빠진 은행코드 */
    var k=byFix[normL(lab)];
    if(k){ var x=CFG.fixed[k]; if(k==="gTax") gong=true; x.bank=bank; if(k!=="loan") x.acct=acct; x.recv=recv; x.label=lab; nf++; return; }
    var led=gong||/^공무직/.test(lab)?"공무직":"교직원", base=led==="공무직"?lab.replace(/^공무직\s*/,""):lab;
    var key=Object.keys(CFG.items).filter(function(q){ return q.split("|")[0]===led&&normL(CFG.items[q].label)===normL(lab); })[0];
    if(!key){ var c=cols[led].filter(function(c){ return normL(c)===normL(base)||normL(c)===normL(lab); })[0]; key=itemKey(led,c||base); }
    CFG.items[key]=Object.assign(CFG.items[key]||blankItem.apply(null,key.split("|")),{bank:bank,acct:acct,label:lab,recv:recv}); ni++; });
  return {f:nf,i:ni};
}
$("#prevBtn").onclick=function(){ $("#prevFile").click(); };
$("#prevFile").addEventListener("change",function(){ var f=this.files[0]; this.value=""; if(!f) return;
  if(!window.JSZip){ $("#cfgMsg").textContent="엑셀 읽기 도구를 불러오는 중입니다. 잠시 뒤 다시 눌러 주세요."; return; }
  f.arrayBuffer().then(readXlsx).then(function(T){ var r=fillFromPrev(T.raw||[]);
    if(!r.f&&!r.i){ $("#cfgMsg").textContent="송금내역서에서 은행코드·계좌가 있는 줄을 찾지 못했습니다(A 은행코드, B 계좌번호, D 항목, E 받는 분)."; return; }
    saveCfg(); renderCfg(); $("#cfgDet").open=true;
    $("#cfgMsg").textContent="기존 송금내역서로 고정 항목 "+r.f+"개, 급여대장 공제 항목 "+r.i+"개를 채웠습니다. 대여금 상환 계좌는 매달 바뀌어 채우지 않습니다."; })
  .catch(function(e){ $("#cfgMsg").textContent="송금내역서를 읽지 못했습니다: "+(e&&e.message||e); }); });

renderCfg();
if(FIXED.every(function(f){ return !CFG.fixed[f[0]].acct; })) $("#cfgDet").open=true;   /* 처음엔 설정 표를 펼쳐 둔다 */

/* 검증용(길잡이 개발): 파일 없이 버퍼로 바로 만들기 */


}
window.TKNATIVE=window.TKNATIVE||{};
window.TKNATIVE.sg=function(root){
  /* 사이트 CSS와 섞이지 않게 그림자 DOM 안에 원본 화면을 그대로 둔다(색 변수만 사이트 것을 이어받음) */
  root.textContent=""; var host=document.createElement("div"); host.className="sgo"; root.appendChild(host);
  var w=host.attachShadow({mode:"open"}); w.innerHTML="<style>"+CSS+"</style>"+BODY;
  if(!window.JSZip) loadJs("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js","sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==").catch(function(){});
  if(!window.pdfjsLib) loadJs("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js","sha512-q+4liFwdPC/bNdhUpZx6aXDx/h77yEQtn4I1slHydcbZK34nLaR3cAeYSJshoxIOq3mjEf7xJE8YWIUHMn+oCQ==").catch(function(){});
  run(w);
};
})();
