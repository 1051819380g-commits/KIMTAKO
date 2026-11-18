# native/sg.js = 원래 '송금내역서 생성기'(src/sg.html)를 iframe 없이 그대로 페이지 안에 그린다(Junho 2026-11-17: 기존 그대로).
#   - 화면 HTML·스크립트는 원본 그대로, CSS는 그림자 DOM 안에 가두고 사이트 색(다크 모드)에 맞춤
#   - JSZip·pdf.js는 원본과 같은 CDN에서 불러옴
# 새로 짠 월 장부판(parts/sg_ui.js)은 make_sg_native.py로 남겨 둠(지금은 안 씀)
import re, json, pathlib
H=pathlib.Path(__file__).resolve().parent
s=(H/"src/sg.html").read_text(encoding="utf-8")
css=re.findall(r"<style[^>]*>(.*?)</style>",s,re.S)[0]
body=re.search(r"<body[^>]*>(.*?)<script",s,re.S).group(1)
js=max(re.findall(r"<script>(.*?)</script>",s,re.S),key=len)
css=re.sub(r":root\{[^}]*\}","",css,count=1)
js=js.replace("document.querySelectorAll(","W.querySelectorAll(").replace("document.querySelector(","W.querySelector(")   # 화면이 아직 문서에 붙기 전에도 찾게
# 2026-11-17 공개 전 검토 반영(원본 화면·계산은 그대로, 아래만 고침)
PREVIEW_JS='/* 미리보기 = 고칠 수 있는 표(11-18 Junho). 은행코드·계좌·항목·받는 분은 설정에 저장(다음 달에도), 금액은 이번 송금내역서에만(OVR).\n   노란 신규 줄에 은행코드·계좌를 넣으면 등록하고 다시 만들어 제자리로 옮긴다. 줄마다 row[8]에 출처(f 고정 · i 급여대장 항목 · n 신규) */\nvar OVR={};\nfunction rowKey(m){ return !m?"":m.f?"f:"+m.f:m.i?"i:"+m.i:m.n?"n:"+m.n:""; }\nfunction keepCfg(){ try{ store().setItem(LS,JSON.stringify(CFG)); }catch(e){} }   /* 받기를 잠그지 않고 저장만 */\nfunction preview(B){\n  var V=evalRows(B), show=function(ref,v){ if(v==null||v==="") return ""; if(typeof v==="string"&&v.charAt(0)==="=") v=V.val[ref]; return typeof v==="number"?fmt(v):esc(v); };\n  var h=\'<table class="ed"><tr><th>은행</th><th>계좌번호</th><th>금액</th><th>항목</th><th>받는 분</th><th>F</th><th>G</th><th>H</th></tr>\';\n  B.rows.forEach(function(row,i){ var r=i+1, w=B.warn[r], m=row[8], sub=function(v){ return typeof v==="string"?v.replace(/\\{r\\}/g,r):v; };\n    var inp=function(c,cls,v,ph){ return \'<td><input class="pe \'+cls+\'" data-i="\'+i+\'" data-c="\'+c+\'" value="\'+esc(v==null?"":v)+\'"\'+(ph?\' placeholder="\'+esc(ph)+\'"\':\'\')+\'></td>\'; };\n    if(!m){ h+=\'<tr\'+(w?\' class="w"\':\'\')+\'><td></td><td></td><td class="n">\'+show("C"+r,sub(row[2]))+\'</td><td>\'+esc(row[3]||"")+\'</td><td>\'+esc(row[4]||"")+\'</td><td class="s"></td><td class="s"></td><td class="s"></td></tr>\'; return; }\n    var lab=row[3]; if(m.n){ var it=CFG.items[m.n]; lab=(it&&it.label)||blankItem.apply(null,m.n.split("|")).label; }\n    h+=\'<tr\'+(w?\' class="w"\':\'\')+\'>\'+inp(0,"bk",row[0],m.n?"은행":"")+inp(1,"ac",row[1],m.n?"계좌번호 넣기":"")+\n      (typeof row[2]==="number"?inp(2,"n",fmt(row[2])):\'<td class="n">\'+show("C"+r,sub(row[2]))+\'</td>\')+\n      inp(3,"lb",lab)+inp(4,"rc",row[4])+\n      [5,6,7].map(function(k){ return \'<td class="s">\'+show("FGH".charAt(k-5)+r,sub(row[k]))+\'</td>\'; }).join("")+\'</tr>\'; });\n  $("#prev").innerHTML=h+\'</table><p class="note">칸을 눌러 고칠 수 있습니다. 은행코드·계좌번호·항목·받는 분은 설정에 저장돼 다음 달에도 쓰이고, 금액은 이번 송금내역서에만 들어갑니다. 노란 줄에 은행코드와 계좌번호를 넣으면 등록되어 제자리로 옮겨집니다. 합계 칸은 엑셀에 수식과 계산값이 함께 들어갑니다.</p>\';\n  [].forEach.call($("#prev").querySelectorAll("input.pe"),function(el){ el.addEventListener("change",function(){ editCell(B,+el.dataset.i,+el.dataset.c,el.value.trim()); }); });\n}\nfunction editCell(B,i,c,v){\n  var row=B.rows[i], m=row[8]; if(!m) return;\n  if(c===2){ var n=+v.replace(/[,\\s원]/g,""); if(v!==""&&isFinite(n)){ row[2]=Math.round(n); OVR[rowKey(m)]=row[2]; } preview(B); return; }\n  var F=["bank","acct",null,"label","recv"][c];\n  if(m.f==="loan"&&c===1){ row[1]=v; $("#vAcct").value=v; try{ store().setItem(LS_ACCT,v); }catch(e){} preview(B); return; }   /* 대여금 계좌는 이번 달 값 */\n  if(m.n){ var p=m.n.split("|"), it=CFG.items[m.n]||(CFG.items[m.n]=blankItem(p[0],p[1])); it[F]=v||(F==="label"?blankItem(p[0],p[1]).label:"");\n    keepCfg(); renderCfg();\n    if(hasAcct(it)){ $("#go").click(); msg($("#outMsg"),"ok","‘"+esc(it.label)+"’ 계좌를 등록하고 송금내역서를 다시 만들었습니다. 다음 달부터는 자동으로 들어갑니다."); return; }\n    if(c!==3) row[c]=v; preview(B); return; }\n  var x=m.f?CFG.fixed[m.f]:CFG.items[m.i];\n  if(x){ x[F]=v||(F==="label"?(m.f?FIXED.filter(function(f){ return f[0]===m.f; })[0][1]:m.i.split("|")[1]):""); keepCfg(); renderCfg(); row[c]=x[F]; }\n  preview(B);\n}\nfunction looksPrev(raw){ return (raw||[]).filter(function(r){ return typeof r[3]==="string"&&r[3]&&(r[0]!=null||r[1]!=null); }).length>=3; }'
PREV_JS='/* 기존 송금내역서(이 도구·예전 프로그램이 만든 엑셀: A 은행코드, B 계좌번호, C 금액, D 항목, E 받는 분)로 설정 채우기\n   - 고정 항목은 항목 이름(기본 이름·지금 표시 이름)으로 찾음. 대여금 계좌는 매달 바뀌어 은행코드·받는 분만\n   - 나머지 줄은 급여대장 공제 항목: \'공무직소득세\' 줄 뒤(또는 \'공무직\'으로 시작)는 공무직, 앞은 교직원.\n     지금 설정에 같은 표시 이름이 있으면 그 항목, 없으면 올린 급여대장의 같은 이름 열, 그것도 없으면 이름 그대로 새 항목 */\nfunction normL(v){ return String(v==null?"":v).replace(/[\\s·ㆍ()（）\\[\\]_\\-]/g,""); }\nfunction cellS(v){ return v==null?"":String(v).trim(); }\nfunction fillFromPrev(raw){\n  var nf=0, ni=0, gong=false, cols={"교직원":[],"공무직":[]}, byFix={};\n  [["edu","교직원"],["gong","공무직"]].forEach(function(p){ if(FILES[p[0]]) cols[p[1]]=FILES[p[0]].cols; });\n  FIXED.forEach(function(f){ byFix[normL(f[1])]=f[0]; byFix[normL(CFG.fixed[f[0]].label)]=f[0]; });\n  byFix[normL("사학연금법인부담")]="schP"; byFix[normL("사학연금(개인부담)")]="schP";\n  raw.forEach(function(row){\n    var bank=cellS(row[0]), acct=cellS(row[1]), lab=cellS(row[3]), recv=cellS(row[4]);\n    if(!lab||/신규 항목|^\\[/.test(lab)||!(bank||acct)) return;\n    if(/^\\d{1,2}$/.test(bank)) bank=("00"+bank).slice(-3);   /* 숫자로 저장돼 앞 0이 빠진 은행코드 */\n    var k=byFix[normL(lab)];\n    if(k){ var x=CFG.fixed[k]; if(k==="gTax") gong=true; x.bank=bank; if(k!=="loan") x.acct=acct; x.recv=recv; x.label=lab; nf++; return; }\n    var led=gong||/^공무직/.test(lab)?"공무직":"교직원", base=led==="공무직"?lab.replace(/^공무직\\s*/,""):lab;\n    var key=Object.keys(CFG.items).filter(function(q){ return q.split("|")[0]===led&&normL(CFG.items[q].label)===normL(lab); })[0];\n    if(!key){ var c=cols[led].filter(function(c){ return normL(c)===normL(base)||normL(c)===normL(lab); })[0]; key=itemKey(led,c||base); }\n    CFG.items[key]=Object.assign(CFG.items[key]||blankItem.apply(null,key.split("|")),{bank:bank,acct:acct,label:lab,recv:recv}); ni++; });\n  return {f:nf,i:ni};\n}\n$("#prevBtn").onclick=function(){ $("#prevFile").click(); };\n$("#prevFile").addEventListener("change",function(){ var f=this.files[0]; this.value=""; if(!f) return;\n  if(!window.JSZip){ $("#cfgMsg").textContent="엑셀 읽기 도구를 불러오는 중입니다. 잠시 뒤 다시 눌러 주세요."; return; }\n  f.arrayBuffer().then(readXlsx).then(function(T){ var r=fillFromPrev(T.raw||[]);\n    if(!r.f&&!r.i){ $("#cfgMsg").textContent="송금내역서에서 은행코드·계좌가 있는 줄을 찾지 못했습니다(A 은행코드, B 계좌번호, D 항목, E 받는 분)."; return; }\n    saveCfg(); renderCfg(); $("#cfgDet").open=true;\n    $("#cfgMsg").textContent="기존 송금내역서로 고정 항목 "+r.f+"개, 급여대장 공제 항목 "+r.i+"개를 채웠습니다. 대여금 상환 계좌는 매달 바뀌어 채우지 않습니다."; })\n  .catch(function(e){ $("#cfgMsg").textContent="송금내역서를 읽지 못했습니다: "+(e&&e.message||e); }); });\n'
JSFIX=[
 # ① '고등학교' 행만 읽던 것 → 급여대장의 학교급(기관분류)을 찾아 씀. 여러 개면 고등학교 우선(원본과 같음), 나머지는 알려 줌
 ('function getSummary(T){ return T.rows.filter(function(r){ return r["기관분류"]==="고등학교"&&r["직종"]==="전체"; })[0]||null; }',
  'function orgs(T){ var L=[]; T.rows.forEach(function(r){ var o=r["기관분류"]; if(r["직종"]==="전체"&&typeof o==="string"&&/학교$/.test(o)&&L.indexOf(o)<0) L.push(o); }); return L; }\n'
  'function ORG(T){ var L=orgs(T); return L.indexOf("고등학교")>=0?"고등학교":(L[0]||"고등학교"); }\n'
  'function getSummary(T){ var g=ORG(T); return T.rows.filter(function(r){ return r["기관분류"]===g&&r["직종"]==="전체"; })[0]||null; }'),
 ('function getSubtotal(T,job){ return T.rows.filter(function(r){ return r["기관분류"]==="고등학교"&&','function getSubtotal(T,job){ var g=ORG(T); return T.rows.filter(function(r){ return r["기관분류"]===g&&'),
 ('function getEmployees(T){ return T.rows.filter(function(r){ return r["기관분류"]==="고등학교"&&','function getEmployees(T){ var g=ORG(T); return T.rows.filter(function(r){ return r["기관분류"]===g&&'),
 ('"교직원 급여대장에서 \'기관분류=고등학교, 직종=전체\' 행을 찾을 수 없습니다."','"교직원 급여대장에서 \'기관분류=○○학교, 직종=전체\' 행을 찾을 수 없습니다."'),
 ('"공무직 급여대장에서 \'기관분류=고등학교, 직종=전체\' 행을 찾을 수 없습니다."','"공무직 급여대장에서 \'기관분류=○○학교, 직종=전체\' 행을 찾을 수 없습니다."'),
 # ② 교원·기간제교원·행정직 말고 다른 직종의 건강보험이 빠지는지 전체 행과 대조
 ('  return {rows:rows,warn:warn,개인부담금:개인부담금,법인부담금:법인부담금,상환:상환,신규:신규};',
  '  var 차=[], g=ORG(E); ["건강보험","노인장기요양보험"].forEach(function(k){ var d=safeCol(총,k)-safeCol(교원,k)-safeCol(기간,k)-safeCol(행직,k); if(d) 차.push([k,d]); });\n'
  '  var 직=E.rows.filter(function(r){ return r["기관분류"]===g&&r["직종"]!=="전체"&&isna(r["직급"])&&["교원","기간제교원","행정직"].indexOf(r["직종"])<0&&(safeCol(r,"건강보험")||safeCol(r,"노인장기요양보험")); }).map(function(r){ return r["직종"]; });\n'
  '  return {rows:rows,warn:warn,개인부담금:개인부담금,법인부담금:법인부담금,상환:상환,신규:신규,차:차,직:직,org:g,orgs:orgs(E)};'),
 ('  if(miss.length) warns.push(',
  '  if(B.차&&B.차.length) warns.push("교직원 급여대장 \'전체\' 행과 교원·기간제교원·행정직 소계 합이 다릅니다("+B.차.map(function(x){ return esc(x[0])+" "+fmt(x[1])+"원"; }).join(", ")+")"+(B.직&&B.직.length?" — "+B.직.map(esc).join(", ")+" 직종":"")+". 이 금액은 건강보험 줄에 들어가지 않았으니 해당 줄에 더해 주세요.");\n'
  '  if(B.orgs&&B.orgs.length>1) warns.push("급여대장에 학교급이 여러 개("+B.orgs.map(esc).join(", ")+") 있어 "+esc(B.org)+" 행으로 만들었습니다.");\n'
  '  if(miss.length) warns.push('),
 # ⑤ (11-17 확인) 사학연금 줄: C=G(개인부담금)이라 항목명을 '사학연금(개인부담)'으로. 예전 설정의 옛 이름도 바꿈
 ('["schP","사학연금법인부담"]','["schP","사학연금(개인부담)"]'),
 ('  Object.keys(c.fixed).forEach(function(k){ if(s.fixed&&s.fixed[k]) c.fixed[k]=Object.assign(c.fixed[k],s.fixed[k]); });',
  '  Object.keys(c.fixed).forEach(function(k){ if(s.fixed&&s.fixed[k]) c.fixed[k]=Object.assign(c.fixed[k],s.fixed[k]); });\n  if(c.fixed.schP&&c.fixed.schP.label==="사학연금법인부담") c.fixed.schP.label="사학연금(개인부담)";'),
 # ⑥ '사학연금'이 든 열을 모두 더함(사학연금소급 등). 대여금 열은 상환 쪽이라 뺌
 ('function findColSum(T,rows,kw){ var col=T.cols.filter(function(c){return c.indexOf(kw)>=0})[0]; if(!col) return 0; return Math.trunc(rows.reduce(function(s,r){ return s+(isna(r[col])?0:+r[col]); },0)); }',
  'function findColSum(T,rows,kw){ var cols=T.cols.filter(function(c){ return c.indexOf(kw)>=0&&!(kw==="사학연금"&&/대여/.test(c))&&!TOTAL_COLUMNS[c]; }); return Math.trunc(rows.reduce(function(s,r){ return s+cols.reduce(function(t,col){ return t+(isna(r[col])?0:+r[col]); },0); },0)); }'),
 # ③ 설정 지우기에 대여금 계좌도 포함
 ('try{ store().removeItem(LS); }catch(e){} CFG=blankCfg();','try{ store().removeItem(LS); store().removeItem(LS_ACCT); }catch(e){} $("#vAcct").value=""; CFG=blankCfg();'),
 # ④ 개발용 전역 노출 제거
 ('window.__sg={readXlsx:readXlsx,parseTp:parseTp,pdfText:pdfText,buildRows:buildRows,writeXlsx:writeXlsx,setCfg:function(c){CFG=c;}};',''),
 # ⑨ (11-18 Junho) 생성된 송금내역서(미리보기)에서 바로 고치기 — 줄마다 출처를 9번째 칸에 둠(엑셀 쓰기·수식 계산은 8칸만 봄)
 ('function R(k,c,f,g,h,acct){ var x=F[k]; rows.push([x.bank,acct!=null?acct:x.acct,c,x.label,x.recv,f,g,h]); }','function R(k,c,f,g,h,acct){ var x=F[k]; rows.push([x.bank,acct!=null?acct:x.acct,c,x.label,x.recv,f,g,h,{f:k}]); }'),
 ('ok.push([it.bank,it.acct,x[1],it.label||x[0],it.recv,null,null,null]);','ok.push([it.bank,it.acct,x[1],it.label||x[0],it.recv,null,null,null,{i:itemKey(ledger,x[0])}]);'),
 ('신규.forEach(function(x){ rows.push(["","",x[2],"["+x[0]+"] "+x[1],"",null,null,null]); warn[rows.length]=1; });','신규.forEach(function(x){ rows.push(["","",x[2],"["+x[0]+"] "+x[1],"",null,null,null,{n:itemKey(x[0],x[1])}]); warn[rows.length]=1; });'),
 ('  preview(B); LAST=B; $("#dl").disabled=false;','  B.rows.forEach(function(row){ var k=rowKey(row[8]); if(k in OVR&&typeof row[2]==="number") row[2]=OVR[k]; });   /* 미리보기에서 고친 금액 유지 */\n  preview(B); LAST=B; $("#dl").disabled=false;'),
 ('function invalidate(){ if(!LAST) return;','function invalidate(){ OVR={}; if(!LAST) return;'),
 ('FILES[k]=T;','T.fname=f.name; FILES[k]=T;'),
 # ⑩ (11-18 Junho) '1. 파일 올리기'에 지난 송금내역서 칸. 급여대장 칸에 잘못 올려도 송금내역서 꼴이면 그쪽으로 읽음
 ('    return readXlsx(buf).then(function(T){',
  '    return readXlsx(buf).then(function(T){\n'
  '      if(k==="prev"||(T.cols.indexOf("기관분류")<0&&looksPrev(T.raw))){\n'
  '        if(k!=="prev"){ var old=FILES[k]&&FILES[k].fname; d.classList.toggle("done",!!old); d.querySelector(".fn").textContent=old||""; var dp=W.querySelector(\'.drop[data-k="prev"]\'); dp.classList.add("done"); dp.querySelector(".fn").textContent=f.name; }\n'
  '        var pr=fillFromPrev(T.raw||[]); if(!pr.f&&!pr.i) throw new Error(f.name+" — 송금내역서에서 은행코드·계좌가 있는 줄을 찾지 못했습니다(A 은행코드, B 계좌번호, D 항목, E 받는 분).");\n'
  '        saveCfg(); renderCfg(); refreshNew();\n'
  '        msg($("#readMsg"),"ok","지난 송금내역서에서 고정 항목 "+pr.f+"개, 급여대장 공제 항목 "+pr.i+"개의 은행코드·계좌·받는 분을 채웠습니다."); return; }'),
 # ⑦ (11-18 Junho) 급여대장 공제 항목 표: 고정 항목 표와 같은 순서(송금내역서 표시 | 은행코드 | 계좌번호 | 받는 분)
 ('    tr.appendChild(inpCell(o.bank,function(v){o.bank=v})); tr.appendChild(inpCell(o.acct,function(v){o.acct=v}));\n    tr.appendChild(inpCell(o.label,function(v){o.label=v||p[1]})); tr.appendChild(inpCell(o.recv,function(v){o.recv=v}));',
  '    tr.appendChild(inpCell(o.label,function(v){o.label=v||p[1]})); tr.appendChild(inpCell(o.bank,function(v){o.bank=v}));\n    tr.appendChild(inpCell(o.acct,function(v){o.acct=v})); tr.appendChild(inpCell(o.recv,function(v){o.recv=v}));'),
 ("<th>금액</th><th>은행코드</th><th>계좌번호</th><th>송금내역서 표시</th><th>받는 분</th></tr>';","<th>금액</th><th>송금내역서 표시</th><th>은행코드</th><th>계좌번호</th><th>받는 분</th></tr>';"),
 ("""<td><input type="text" class="nb" maxlength="3" value="'+esc(it.bank)+'"></td><td><input type="text" class="na" value="'+esc(it.acct)+'"></td><td><input type="text" class="nl" value="'+esc(it.label)+'"></td>""",
  """<td><input type="text" class="nl" value="'+esc(it.label)+'"></td><td><input type="text" class="nb" maxlength="3" value="'+esc(it.bank)+'"></td><td><input type="text" class="na" value="'+esc(it.acct)+'"></td>"""),
 # ⑧ (11-18 Junho) 기존 송금내역서(엑셀)를 넣으면 설정을 채움: 첫 줄도 읽게 readXlsx가 raw(머리글 포함 모든 줄)를 함께 돌려줌
 ('        var head=(rows.shift()||[])','        var raw=rows.slice(), head=(rows.shift()||[])'),
 ('        return {cols:head.filter(Boolean), rows:data};','        return {cols:head.filter(Boolean), rows:data, raw:raw};'),
 ('\nrenderCfg();\nif(FIXED.every(', PREV_JS + '\nrenderCfg();\nif(FIXED.every('),

]
BODYFIX=[
 ('<label class="drop" data-k="loan"><b>사학연금 대여금 납부통지서</b><span>공단 업무포털 PDF — 상환 계좌번호를 자동으로 채웁니다</span><span class="fn"></span><input type="file" accept=".pdf" hidden></label>',
  '<label class="drop" data-k="loan"><b>사학연금 대여금 납부통지서</b><span>공단 업무포털 PDF — 상환 계좌번호를 자동으로 채웁니다</span><span class="fn"></span><input type="file" accept=".pdf" hidden></label>\n    <label class="drop" data-k="prev"><b>지난 송금내역서 <small style="font-weight:400">(처음 한 번)</small></b><span>예전 송금내역서 엑셀 — 항목별 은행코드·계좌·받는 분을 채웁니다</span><span class="fn"></span><input type="file" accept=".xlsx" hidden></label>'),
 # (11-18 Junho) 고정 항목 표는 뺌: 기존 송금내역서로 채우므로. 줄은 그대로 만들고 계좌는 설정(CFG.fixed)에 남음
 ('<h3 style="font-size:15px;margin:10px 0 6px">고정 항목','<h3 style="display:none">고정 항목'),
 ('<table class="cfgtbl"><thead><tr><th>항목</th><th>송금내역서 표시</th>','<table class="cfgtbl" style="display:none"><thead><tr><th>항목</th><th>송금내역서 표시</th>'),
 ('<h3 style="font-size:15px;margin:16px 0 6px">급여대장 공제 항목','<h3 style="font-size:15px;margin:10px 0 6px">급여대장 공제 항목'),
 ('<th>급여대장</th><th>열 이름</th><th>은행코드</th><th>계좌번호</th><th>송금내역서 표시</th><th>받는 분</th><th></th>','<th>급여대장</th><th>열 이름</th><th>송금내역서 표시</th><th>은행코드</th><th>계좌번호</th><th>받는 분</th><th></th>'),
 ('      <button class="btn" type="button" id="optAdd">항목 직접 추가</button>','      <button class="btn" type="button" id="prevBtn">기존 송금내역서로 채우기</button><input type="file" id="prevFile" accept=".xlsx" hidden>\n      <button class="btn" type="button" id="optAdd">항목 직접 추가</button>'),
 ("    '송금내역서 표시'는 엑셀 항목 칸에 적히는 이름입니다(비우면 기본 이름).</p>","    세금·건강보험·사학연금·공무직 기본 같은 고정 줄의 은행코드·계좌·받는 분은 <b>'기존 송금내역서로 채우기'</b>에 지난 송금내역서 엑셀을 넣어 채웁니다. 아래 표는 급여대장 공제 항목이고, '송금내역서 표시'는 엑셀 항목 칸에 적히는 이름입니다.</p>"),
 ('— 세금·건강보험·기간제 4대보험·사학연금 법인부담·대여금 상환·공무직 기본(직종별로 나뉘거나 합계 수식이 걸린 줄)</small>',
  '— 세금·건강보험·기간제 4대보험·사학연금·대여금 상환·공무직 기본(직종별로 나뉘거나 합계 수식이 걸린 줄)<br>사학연금(개인부담) 줄의 송금액(C)은 개인부담금(G)이에요. 법인부담분은 F·H 칸, 공단 송금 총액은 F예요.</small>')]
for _a,_b in BODYFIX:
    assert body.count(_a)==1,("sg 화면 고칠 자리",_a[:40]); body=body.replace(_a,_b)
for _a,_b in JSFIX:
    assert js.count(_a)==1,("sg 고칠 자리",_a[:60],js.count(_a)); js=js.replace(_a,_b)
_i=js.index('function preview(B){'); _j=js.index('\n}\n',_i)+3; js=js[:_i]+PREVIEW_JS+'\n'+js[_j:]   # 11-18 미리보기 = 고칠 수 있는 표
css=css.replace("#fff","var(--surface)").replace("#F5F8FF","var(--accent-soft)").replace("#F7F9FB","var(--surface-2)").replace("#E6F3EF","var(--accent-soft)")
# Junho 11-17: 원본은 고정 항목 표의 '송금내역서 표시' 칸이 64px로 좁고 은행코드 칸이 넓었음 → 은행코드는 좁게(숫자 3자리), 표시는 넓게
FIX=("\n.cfgtbl td:nth-child(2) input{width:100%}"
     "\n#cfgBody td:nth-child(3),#optBody td:nth-child(4){width:72px}#cfgBody td:nth-child(3) input,#optBody td:nth-child(4) input{width:64px;text-align:center}"
     "\n#cfgBody td:nth-child(2){width:28%}#optBody td:nth-child(3){width:24%}"
     "\n.newbox input.nb{width:56px;text-align:center}"
     # 휴대폰: 표를 칸마다 이름 붙인 카드로(가로로 밀리지 않게)
     "\n@media (max-width:640px){.cfgtbl thead{display:none}.cfgtbl,.cfgtbl tbody{display:block}.cfgtbl tr{display:grid;grid-template-columns:72px minmax(0,1fr);gap:4px 8px;padding:8px 0;border-bottom:1px solid var(--line)}"
     ".cfgtbl td{display:block;border:0;padding:0;width:auto!important}.cfgtbl td.k{grid-column:1/-1;font-weight:600}.cfgtbl td input{width:100%!important}"
     "#cfgBody td:nth-child(2){grid-column:1/-1}#cfgBody td:nth-child(5){grid-column:1/-1}#optBody td:nth-child(3),#optBody td:nth-child(6){grid-column:1/-1}"
     ".cfgtbl td:not(.k)::before{display:block;font-size:11.5px;color:var(--sub)}"
     "#cfgBody td:nth-child(2)::before{content:'송금내역서 표시'}#cfgBody td:nth-child(3)::before{content:'은행코드'}#cfgBody td:nth-child(4)::before{content:'계좌번호'}#cfgBody td:nth-child(5)::before{content:'받는 분'}"
     "#optBody td:nth-child(3)::before{content:'송금내역서 표시'}#optBody td:nth-child(4)::before{content:'은행코드'}#optBody td:nth-child(5)::before{content:'계좌번호'}#optBody td:nth-child(6)::before{content:'받는 분'}#optBody td:nth-child(7)::before{content:none}}")
css=re.sub(r"(^|\n|\})\s*html,body\{","\\1:host{display:block;",css)
css=re.sub(r"(^|\n|\})\s*body\{","\\1:host{",css)
vars=(":host{--sub:var(--ink-2);--line2:var(--line-strong);--canvas:var(--surface-2);--navy:var(--accent);--navy-d:var(--accent);--mint:var(--accent-soft);"
      "--warn:#A8802A;--bad:var(--neg,#B23A2E);--bad-bg:rgba(178,58,46,.12);--ok:var(--pos,#1BA979);color:var(--ink)}")
css=vars+"\n"+css.replace("#6F5418","var(--warn,#6F5418)")+"\nbutton,input{color:inherit}"+FIX+(
  "\n.prev table.ed td{padding:2px 4px}.prev input.pe{width:100%;box-sizing:border-box;border:1px solid transparent;background:transparent;font:inherit;padding:4px 5px;border-radius:5px;color:inherit}"
  ".prev input.pe:hover{border-color:var(--line2)}.prev input.pe:focus{border-color:var(--navy);background:var(--surface);outline:none}"
  ".prev input.pe.n{text-align:right;font-variant-numeric:tabular-nums}.prev input.pe.bk{width:52px;text-align:center}.prev tr.w input.pe{border-color:var(--line2);background:var(--surface)}"
  ".prev tr.w input.pe::placeholder{color:var(--bad);opacity:.7}")

res="""(function(){ "use strict";
var CSS=%s, BODY=%s;
function loadJs(u,sri){ return new Promise(function(ok,no){ var s=document.createElement("script"); if(sri){ s.integrity=sri; s.crossOrigin="anonymous"; } s.src=u; s.onload=ok; s.onerror=no; document.head.appendChild(s); }); }
function run(W){
%s
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
""" % (json.dumps(css,ensure_ascii=False),json.dumps(body,ensure_ascii=False).replace("</","<\\/"),js)
(H/"native/sg.js").write_text(res,encoding="utf-8"); print("native/sg.js",len(res))
