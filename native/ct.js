/* ======================================================================
   수의·입찰 따라가기 — 경남 기준으로 처음부터 다시 만든 도구
   계약 한 건을 장부 한 줄로 올리고, 경남 업무흐름도(2026. 3.) 순서대로 따라간다.
     계약방법 → 견적·업체 → 계약 → (착공·착수) → 검사 → 대금 지급 → (공사: 하자 관리)
   기준
   - 계약방법 판정: 업무체크리스트 계약방법 찾기(ckMethod)와 같은 규칙 (지방계약법 시행령 제25조·제30조, 경남 2026 계약실무편람)
   - 단계별 기한·서류·지연배상금률·인지세: 업무체크리스트 수의계약(1인 견적) 단계 = 경남 업무흐름도
   - 서류 서식: 길잡이 수의계약 서류 엑셀 서식 그대로(화면은 새로 만듦)
   저장: ct.cases(장부), ct.biz(업체), ct.school, ct.priv, ct.key — 예전 도구 기록(ct.hist)은 처음 열 때 장부로 옮긴다
   ====================================================================== */
(function(){ "use strict";
var D=window.TK_CT_DATA;   /* {DS, HJ, RP, RT} — 빌드 때 넣는다 */
function el(t,c,x){var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e}
var LS={get:function(k,d){try{var v=localStorage.getItem("ct."+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
        set:function(k,v){try{localStorage.setItem("ct."+k,JSON.stringify(v))}catch(e){}}};
function num(s){return parseInt(String(s||"").replace(/[^\d]/g,""),10)||0}
function comma(n){return n?Number(n).toLocaleString("ko-KR"):""}
function hanNum(n){var d="영일이삼사오육칠팔구",u=["","십","백","천"],big=["","만","억","조"],s="",g=0;if(!n)return"영";
  while(n>0){var part=n%10000;if(part){var p="",ds=String(part);ds="0000".slice(ds.length)+ds;for(var i=0;i<4;i++){var k=+ds[i];if(k)p+=d[k]+u[3-i];}s=p+big[g]+s;}n=Math.floor(n/10000);g++;}return s}
function hanAmt(n){return n?"일금 "+hanNum(n)+"원정":""}
function ymd(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?new Date(+m[1],+m[2]-1,+m[3]):null}
function iso(d){return d?d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2):""}
function kdate(s){var d=ymd(s);return d?d.getFullYear()+". "+(d.getMonth()+1)+". "+d.getDate()+".":""}
function bizfmt(s){var n=String(s||"").replace(/\D/g,"");return n.length===10?n.slice(0,3)+"-"+n.slice(3,5)+"-"+n.slice(5):s||""}
function won(n){ if(n>=1e8){ var e=Math.floor(n/1e8), m=Math.round((n%1e8)/1e4); return e+"억"+(m?" "+m.toLocaleString()+"만":"")+" 원"; } return n>=1e4?Math.round(n/1e4).toLocaleString()+"만 원":n.toLocaleString()+" 원"; }
/* "3500만", "1억 2천만", "15,000,000" → 숫자 */
function amount(v){ v=String(v||"").replace(/[,\s원]/g,""); if(/^\d+$/.test(v)) return +v;
  var m=v.match(/^(\d+(?:\.\d+)?)(억|천만|백만|만)?(?:(\d+)(천만|백만|만))?$/); if(!m) return NaN;
  var u={억:1e8,천만:1e7,백만:1e6,만:1e4}, n=parseFloat(m[1])*(m[2]?u[m[2]]:1); if(m[3]) n+=parseFloat(m[3])*u[m[4]]; return Math.round(n); }
/* 사업자번호 가운데 두 자리로 업체종류 추정(81·85~88 법인, 80·82 단체, 83·84 기타, 그 밖 개인) */
function officeOf(b){var n=String(b).replace(/\D/g,"");if(n.length!==10)return"";var m=+n.slice(3,5);
  if(m===81||(m>=85&&m<=88))return"법인";if(m===80||m===82)return"단체";if(m===83||m===84)return"기타";return"개인"}
/* 하자만료일 = 준공일 + 하자기간(년) − 1일 */
function hajaExpiry(done,period){var d=ymd(done),y=parseInt(String(period||""),10);if(!d||!y)return null;var e=new Date(d.getFullYear()+y,d.getMonth(),d.getDate());e.setDate(e.getDate()-1);return e}
/* 반기 정기검사 대상: 만료일 ≥ (기준일이 속한 반기 말일 − 6개월) */
function inspTarget(exp,ref){var r=ymd(ref);if(!exp||!r)return false;var end=r.getMonth()<6?new Date(r.getFullYear(),5,30):new Date(r.getFullYear(),11,31);var six=new Date(end);six.setMonth(six.getMonth()-6);return exp>=six}

/* ---------- 계약방법 판정: 업무체크리스트 ckMethod와 같은 규칙(바꿀 때 두 곳 같이) ---------- */
var KIND=[["goods","물품"],["serv","용역"],["c1","공사 — 종합공사"],["c2","공사 — 전문공사"],["c3","공사 — 전기·정보통신·소방·그 밖"]];
var ST=[
  ["y","청년창업기업","대표자 39세 이하 창업기업(중소기업창업 지원법)"],
  ["w","여성기업",""],["d","장애인기업",""],
  ["s","사회적기업·사회적협동조합·자활기업·마을기업","취약계층 고용비율 30% 이상일 때만"],
  ["k","소기업·소상공인","중소기업 확인서로 확인"],
  ["x","학술연구·원가계산 등 특수 지식·기술 계약","물품·용역"],
  ["p","중증장애인생산품 생산시설·장애인 표준사업장·국가유공자 상이단체","직접 생산하는 물품·직접 수행하는 용역"]];
var LIM={c1:4e8,c2:2e8,c3:1.6e8}, LN={c1:"4억 원",c2:"2억 원",c3:"1억 6천만 원"};
function method(kind,amt,st,priv){
  var has=function(k){ return st.indexOf(k)>=0; }, sp=has("y")||has("w")||has("d")||has("s"), out=[];
  var A30="지방계약법 시행령 제30조①", A25="지방계약법 시행령 제25조①5호", N={na:"나",k:"라",x:"마",w:"바",y:"다"};
  if(kind==="g"){
    if(has("p")) out.push({t:"ok",n:1,h:"수의계약 · 1인 견적 가능 (금액 제한 없음)",p:["중증장애인생산품 생산시설·장애인 표준사업장·국가유공자 상이단체가 직접 생산하는 물품, 직접 수행하는 용역이면 금액과 관계없이 수의계약할 수 있어요."],law:"지방계약법 시행령 제25조①7의2호 · 제30조①1호"});
    if(amt<=2e7){
      out.push({t:"ok",n:1,h:"수의계약 · 1인 견적 가능",p:["추정가격 2천만 원 이하 물품·용역은 어느 업체와도 1인 견적으로 수의계약할 수 있어요."+(amt<2e6?" 200만 원 미만이면 견적서도 생략할 수 있어요(신용카드 구매 포함).":""),"여러 곳 견적을 받으려면 2인 이상 견적 수의계약으로 해요(낙찰하한율 90%)."],law:A25+N.na+" · "+A30+"2호"});
    } else if(amt<=5e7&&sp){
      out.push({t:"ok",n:1,h:"수의계약 · 1인 견적 가능 (5천만 원 이하 특례)",p:["청년창업기업·여성기업·장애인기업·사회적기업 등과는 추정가격 5천만 원 이하까지 1인 견적으로 수의계약할 수 있어요."+(has("s")?" 사회적기업 등은 취약계층 고용비율 30% 이상일 때만이에요.":"")],law:A30+"2호 단서"});
    }
    if(amt>2e7&&amt<=1e8){
      var ok2=has("w")||has("d")||has("s")||has("k")||has("x")||(has("y")&&amt<=5e7);
      if(ok2) out.push({t:"mid",n:2,h:"수의계약 · 2인 이상 견적 ("+((has("w")||has("d")||has("s")||has("k")||has("x"))?"1억":"5천만")+" 원 이하)",p:["지정정보처리장치(나라장터·학교장터)에 견적 안내공고를 3일 이상(공휴일·토요일 제외) 내고 2인 이상 견적을 받아요. 낙찰하한율은 예정가격의 88%예요.",has("k")?"소기업·소상공인이면 중소기업 확인서를 계약체결일까지 받아 확인해요.":""].filter(Boolean),law:A25+(has("k")?N.k:has("x")?N.x:(has("w")||has("d")||has("s"))?N.w:N.y)+" · "+A30.replace("①","②")});
      else out.push({t:"mid",n:2,h:"수의계약 · 2인 이상 견적 — 견적 대상을 소기업·소상공인으로 제한",p:["2천만 원 초과 1억 원 이하 물품·용역의 2인 이상 견적 수의계약은 소기업·소상공인과 하는 계약이에요. 선택한 업체가 중기업·대기업이면 수의계약 대상이 아니에요.","지정정보처리장치에 소기업·소상공인 대상 견적 안내공고(3일 이상)를 내고, 낙찰하한율은 88%예요."+(has("y")?" 청년창업기업 특례는 5천만 원 이하까지예요.":"")],law:A25+N.k+" · 2026 계약실무편람(소기업·소상공인 확인)"});
    }
    if(amt>2e7){
      if(amt<1e8) out.push({t:"bid",h:"입찰 · 소기업·소상공인 제한경쟁",p:["1억 원 미만 물품·용역은 소기업·소상공인 간 제한경쟁입찰로 할 수 있어요(중소기업자 우선조달). 입찰공고는 7~40일이에요."],law:"판로지원법 시행령 제2조의2①1호 · 2026 계약실무편람"});
      else out.push({t:"bid",h:"입찰 · 중소기업자간 제한경쟁 또는 일반경쟁",p:["1억 원 이상 재정경제부 고시금액 미만이면 중소기업자간 제한경쟁입찰(소기업·소상공인·중기업), 고시금액 이상이면 일반경쟁입찰이에요. 고시금액은 그해 고시로 확인해요.","중소기업자간 경쟁제품은 직접생산 확인을 받은 중소기업만 참여할 수 있어요."],law:"판로지원법 제4조·시행령 제2조의2 · 지방계약법 제9조 · 2026 계약실무편람"});
    }
  } else {
    var L=LIM[kind];
    if(amt<=2e7||(amt<=5e7&&sp)) out.push({t:"ok",n:1,h:"수의계약 · 1인 견적 가능",p:[amt<=2e7?"추정가격 2천만 원 이하 공사는 1인 견적으로 수의계약할 수 있어요.":"청년창업기업·여성기업·장애인기업·사회적기업 등과는 공사도 추정가격 5천만 원 이하까지 1인 견적이 가능해요."+(has("s")?" 사회적기업 등은 취약계층 고용비율 30% 이상일 때만이에요.":"")],law:"지방계약법 시행령 제30조①2호 · 2026 계약실무편람(공사)"});
    if(amt<=L&&amt>2e7) out.push({t:"mid",n:2,h:"수의계약 · 2인 이상 견적 ("+LN[kind]+" 이하)",p:["지정정보처리장치에 수의계약 안내공고를 3일 이상(공휴일·토요일 제외) 내고, 물량내역서를 함께 올려요. 낙찰하한율은 공사 89.745%(예정가격과 견적가격에서 국민연금보험료 등 A값을 뺀 금액끼리 비교), 용역·물품 88%(2천만 원 이하 90%)예요."],law:"지방계약법 시행령 제25조①5호가 · "+A30.replace("①","②")});
    if(amt>L) out.push({t:"bid",h:"입찰",p:[(kind==="c1"?"종합공사는 추정가격 150억 원 미만":"추정가격 10억 원 미만")+"이면 지역제한(경상남도) 제한경쟁입찰, 그 이상은 일반경쟁입찰이에요. 공고는 7~40일이고 적격심사로 낙찰자를 정해요."],law:"2026 계약실무편람(공사 계약방법)"});
  }
  if(priv) out.forEach(function(x){ if(/지방계약법/.test(x.law)) x.law+=" · 사학기관 재무·회계 규칙 제35조·제40조의2"; });
  return out;
}

/* ---------- 서류 ---------- */
var BASE=[["01계약보증금지급각서","계약보증금 지급각서"],["02수의계약각서","수의계약 각서"],["03수의계약체결제한여부확인서","수의계약 체결제한 여부 확인서"],
  ["04청렴계약이행서약서","청렴계약 이행서약서"],["05청렴계약이행특수조건","청렴계약 이행 특수조건"],["06조세포탈관련서약서","조세포탈 관련 서약서"],["정보제공동의서","정보제공 동의서"]];
var OTHER=[["07안전보건유의사항","안전보건 유의사항"],["08-1안전보건점검표","안전보건 점검표"],["09안전보건관리계획서","안전보건 관리계획서"],["10노무비지급확인제","노무비 지급확인제"],["행정정보공동이용사전동의서","행정정보 공동이용 사전동의서"]];
var SAFE=[["08-2화기작업","화기작업"],["08-3전기작업","전기작업"],["08-4고소작업","고소작업"],["08-5밀폐공간작업","밀폐공간작업"]];
var OTHER_DEF={"공사":[1,1,1,1,0],"용역":[1,1,0,0,0],"물품":[0,0,0,0,0]};

/* ---------- 엑셀 서식 채우기: 라이브러리 없이(브라우저 압축 풀기) 읽고, 저장 방식 zip으로 다시 묶는다 ---------- */
function b64u8(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
var CRCT=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){var c=0xFFFFFFFF;for(var i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function inflate(u){ return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer().then(function(b){ return new Uint8Array(b); }); }
function unzip(u){
  var dv=new DataView(u.buffer,u.byteOffset,u.byteLength), e=u.length-22; while(e>=0&&dv.getUint32(e,true)!==0x06054b50) e--;
  if(e<0) return Promise.reject(new Error("서식 파일이 망가졌어요"));
  var cnt=dv.getUint16(e+10,true), p=dv.getUint32(e+16,true), td=new TextDecoder(), list=[];
  for(var i=0;i<cnt;i++){ var meth=dv.getUint16(p+10,true), csz=dv.getUint32(p+20,true), nl=dv.getUint16(p+28,true), xl=dv.getUint16(p+30,true), cl=dv.getUint16(p+32,true), off=dv.getUint32(p+42,true);
    var name=td.decode(u.subarray(p+46,p+46+nl)); var lnl=dv.getUint16(off+26,true), lxl=dv.getUint16(off+28,true), st=off+30+lnl+lxl;
    list.push({name:name,meth:meth,data:u.subarray(st,st+csz)}); p+=46+nl+xl+cl; }
  return Promise.all(list.map(function(f){ return (f.meth===8?inflate(f.data):Promise.resolve(f.data)).then(function(d){ return {name:f.name,data:d}; }); }));
}
function zipStore(files){
  var te=new TextEncoder(), parts=[], cen=[], off=0;
  files.forEach(function(f){ var nm=te.encode(f.name), d=f.data, c=crc32(d), h=new Uint8Array(30+nm.length), v=new DataView(h.buffer);
    v.setUint32(0,0x04034b50,true); v.setUint16(4,20,true); v.setUint16(6,0x0800,true); v.setUint32(14,c,true); v.setUint32(18,d.length,true); v.setUint32(22,d.length,true); v.setUint16(26,nm.length,true); h.set(nm,30);
    var ch=new Uint8Array(46+nm.length), cv=new DataView(ch.buffer);
    cv.setUint32(0,0x02014b50,true); cv.setUint16(4,20,true); cv.setUint16(6,20,true); cv.setUint16(8,0x0800,true); cv.setUint32(16,c,true); cv.setUint32(20,d.length,true); cv.setUint32(24,d.length,true); cv.setUint16(28,nm.length,true); cv.setUint32(42,off,true); ch.set(nm,46);
    parts.push(h,d); cen.push(ch); off+=h.length+d.length; });
  var cs=cen.reduce(function(a,b){return a+b.length},0), end=new Uint8Array(22), ev=new DataView(end.buffer);
  ev.setUint32(0,0x06054b50,true); ev.setUint16(8,files.length,true); ev.setUint16(10,files.length,true); ev.setUint32(12,cs,true); ev.setUint32(16,off,true);
  return new Blob(parts.concat(cen,[end]),{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}
function xesc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function setCell(xml,ref,text){var rn=+ref.replace(/\D/g,""),cell="<c r=\""+ref+"\"{S} t=\"inlineStr\"><is><t xml:space=\"preserve\">"+xesc(text)+"</t></is></c>";
  var re=new RegExp("<c r=\""+ref+"\"([^>]*?)(/>|>[\\s\\S]*?</c>)");var m=re.exec(xml);
  if(m){var s=/\ss="\d+"/.exec(m[1]);return xml.replace(m[0],cell.replace("{S}",s?s[0]:""))}
  var rr=new RegExp("<row r=\""+rn+"\"[^>]*?(/>|>[\\s\\S]*?</row>)").exec(xml);cell=cell.replace("{S}","");
  if(!rr)return xml.replace("</sheetData>","<row r=\""+rn+"\">"+cell+"</row></sheetData>").replace("<sheetData/>","<sheetData><row r=\""+rn+"\">"+cell+"</row></sheetData>");
  var col=function(r){return r.replace(/\d/g,"")},key=function(c){return c.length*100+c.charCodeAt(c.length-1)};var row=rr[0];
  if(/\/>$/.test(rr[1]))return xml.replace(row,row.replace(/\/>$/,">"+cell+"</row>"));
  var cs=row.match(/<c r="([A-Z]+)\d+"/g)||[],before=null;cs.forEach(function(c){var cc=/r="([A-Z]+)/.exec(c)[1];if(before===null&&key(cc)>key(col(ref)))before=c});
  return xml.replace(row,before?row.replace(before,cell+before):row.replace("</row>",cell+"</row>"))}
/* [자리] 글자를 바꾸고, keep에 없는 시트는 숨긴다(서식·인쇄영역은 그대로) */
function fillBook(b64,rep,cells,keep,fname){
  if(!window.DecompressionStream) return Promise.reject(new Error("이 브라우저는 엑셀 만들기를 지원하지 않아요. 크롬·엣지·웨일 최신 버전으로 열어 주세요."));
  return unzip(b64u8(b64)).then(function(files){
    var td=new TextDecoder(), te=new TextEncoder(), F={}; files.forEach(function(f){ F[f.name]=f; });
    var txt=function(n){ return td.decode(F[n].data); }, put=function(n,s){ F[n].data=te.encode(s); };
    var wb=txt("xl/workbook.xml"), rels=txt("xl/_rels/workbook.xml.rels"), rel={}, list=[];
    rels.replace(/<Relationship [^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g,function(_,id,t){rel[id]="xl/"+t.replace(/^\/?xl\//,"")});
    wb.replace(/<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g,function(_,n,id){list.push({name:n.replace(/&amp;/g,"&"),file:rel[id]})});
    Object.keys(F).filter(function(n){ return n==="xl/sharedStrings.xml"||/^xl\/worksheets\/sheet\d+\.xml$/.test(n); }).forEach(function(n){
      var x=txt(n); Object.keys(rep).forEach(function(k){ x=x.split(k).join(xesc(rep[k])); });
      list.forEach(function(s){ if(s.file===n&&cells[s.name]) Object.keys(cells[s.name]).forEach(function(r){ x=setCell(x,r,cells[s.name][r]); }); });
      if(keep&&/^xl\/worksheets/.test(n)) x=x.replace(/\stabSelected="1"/,"");
      put(n,x); });
    if(keep){ var first=-1;
      list.forEach(function(s,i){ var hide=keep.indexOf(s.name)<0; if(!hide&&first<0) first=i;
        wb=wb.replace(new RegExp("(<sheet [^>]*name=\""+s.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\"[^>]*?)(\\s*/>)"),function(_,a,b){ a=a.replace(/\sstate="[^"]*"/,""); return a+(hide?" state=\"hidden\"":"")+b; }); });
      wb=wb.replace(/activeTab="\d+"/,"activeTab=\""+first+"\"").replace(/firstSheet="\d+"/,"firstSheet=\""+first+"\"");
      put("xl/workbook.xml",wb);
      var f1=list[first].file; put(f1,txt(f1).replace(/<sheetView /,"<sheetView tabSelected=\"1\" ")); }
    return saveFile(zipStore(files.map(function(f){ return F[f.name]; })), fname.replace(/[\\/:*?"<>|]/g,"_"));
  });
}

/* 파일 내려받기: claude.ai 미리보기 안에서는 downloads 기능(확인 창), 누리집에서는 보통 내려받기 */
function saveFile(blob,name){
  if(window.claude&&window.claude.use) return window.claude.use("downloads").then(function(dl){
    if(!dl) throw new Error("이 화면에서는 파일을 내려받을 수 없어요.");
    return dl.save({filename:name,data:blob}).catch(function(e){ throw new Error(e&&e.code==="declined"?"내려받기를 취소했어요.":(e&&e.message)||"내려받지 못했어요."); }); });
  var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },2000); return Promise.resolve();
}

/* ---------- 업체 조회(조달청 나라장터 사용자정보 · 국세청 사업자 상태) — 공공데이터 인증키는 설정에 ---------- */
/* 공공데이터 인증키: Junho 님 키를 기본으로 쓴다(누리집 공개 파일이라 키가 보인다 — 사용자 결정 2026-11-17) */
var KEY0="__DATA_GO_KR_KEY__";
function getKey(){ return LS.get("key","")||(KEY0.indexOf("__")===0?"":KEY0); }
var API="https://apis.data.go.kr/1230000/ao/UsrInfoService02/";
function keyq(){ var key=getKey(); return /%[0-9A-Fa-f]{2}/.test(key)?key:encodeURIComponent(key); }
function api(op,params){ if(!getKey()) return Promise.reject(new Error("nokey"));
  var q=Object.assign({type:"json",numOfRows:"100",pageNo:"1"},params), ac=new AbortController(), t=setTimeout(function(){ac.abort()},15000);
  return fetch(API+op+"?serviceKey="+keyq()+"&"+Object.keys(q).map(function(k){return k+"="+encodeURIComponent(q[k])}).join("&"),{signal:ac.signal})
  .then(function(r){ clearTimeout(t); return r.text().then(function(x){ var j; try{ j=JSON.parse(x); }catch(e){ throw new Error(r.status===401?"인증키가 맞지 않거나 활용 신청이 안 되어 있어요.":"응답을 읽을 수 없어요(HTTP "+r.status+")."); }
    var h=(j.response&&j.response.header)||{}; if(h.resultCode&&h.resultCode!=="00") throw new Error("조달청 응답: "+(h.resultMsg||h.resultCode));
    var b=(j.response&&j.response.body)||{}, it=b.items; if(!it) return []; if(it.item) it=it.item; return [].concat(it); }); },
    function(e){ clearTimeout(t); throw new Error(e.name==="AbortError"?"나라장터 응답이 15초 넘게 없어요.":"인터넷 연결 또는 조회 주소에 문제가 있어요."); }); }
function byBiz(op,b){ var tries=["1","3","2"], i=0; function go(){ return api(op,{inqryDiv:tries[i],bizno:b}).then(function(rows){ if(rows.length||++i>=tries.length) return rows; return go(); },function(e){ if(e.message==="nokey"||++i>=tries.length) throw e; return go(); }); } return go(); }
function nts(b){ if(!getKey()) return Promise.reject(new Error("nokey")); var ac=new AbortController(), t=setTimeout(function(){ac.abort()},15000);
  return fetch("https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey="+keyq(),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({b_no:[b]}),signal:ac.signal})
  .then(function(r){ clearTimeout(t); return r.json().then(function(j){ if(!r.ok) throw new Error(r.status===401?"국세청 상태조회: 인증키가 맞지 않거나 활용 신청이 안 되어 있어요.":"국세청 상태조회: "+(j.msg||("HTTP "+r.status))); return (j.data||[])[0]||null; }); }); }

/* ======================= 화면: 수의·입찰 따라가기 =======================
   계약 한 건 = 장부의 한 줄. 판단 → 견적·업체 → 계약 → (착공·착수) → 검사 → 대가 지급 → (하자) 순서로 따라간다.
   단계와 기한은 업무체크리스트 '수의계약 (1인 견적) 계약' 단계(경남 업무흐름도 2026. 3.)와 같다. */
var CSS=[
".cv{--r:12px}",
".cv-hero{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;margin:2px 0 6px}",
".cv-hero h3{font-size:21px;font-weight:700;margin:0}",
".cv-hero p{color:var(--ink-2);font-size:14px;margin:4px 0 0;line-height:1.55}",
".cv-btns{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
".cv-sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:14px 0 4px}",
".cv-sum div{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:10px 14px}",
".cv-sum span{display:block;font-size:12px;color:var(--muted)}",
".cv-sum b{font-size:22px;font-weight:700}",
".cv-h{font-size:13px;font-weight:700;color:var(--muted);margin:22px 0 8px}",
".cv-todo{display:grid;gap:8px}",
".cv-row{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:11px 14px;cursor:pointer;color:var(--ink)}",
".cv-row:hover{border-color:var(--accent-line)}",
".cv-row .tx{flex:1;min-width:0}",
".cv-row b{display:block;font-size:15px;font-weight:600}",
".cv-row small{display:block;color:var(--muted);font-size:12.5px;line-height:1.45}",
".cv-dd{flex:0 0 auto;min-width:58px;text-align:center;font-weight:700;font-size:13px;border-radius:8px;padding:6px 8px;background:var(--surface-3);color:var(--ink-2)}",
".cv-dd.late{background:var(--neg-bg);color:var(--neg)}.cv-dd.soon{background:var(--warn-bg);color:var(--warn)}.cv-dd.free{background:var(--accent-soft);color:var(--accent-ink)}",
".cv-cases{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px}",
".cv-case{display:flex;flex-direction:column;gap:4px;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:13px 15px;cursor:pointer;color:var(--ink)}",
".cv-case:hover{border-color:var(--accent-line)}",
".cv-case{position:relative}.cv-case.hasdel h4{padding-right:22px}",
".cv-del{position:absolute;top:6px;right:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:17px;line-height:1;color:var(--ink-3,var(--ink-2));cursor:pointer}",
".cv-del:hover,.cv-del:focus-visible{background:var(--neg-bg);color:var(--neg);outline:none}",
".cv-case h4{font-size:15.5px;font-weight:700;margin:0}",
".cv-case p{margin:0;font-size:13px;color:var(--ink-2)}",
".cv-track{display:flex;gap:3px;margin:6px 0 2px}",
".cv-track i{flex:1;height:6px;border-radius:3px;background:var(--surface-3)}",
".cv-track i.on{background:var(--pos)}.cv-track i.cur{background:var(--accent)}",
".cv-empty{background:var(--surface);border:1px dashed var(--line-strong);border-radius:var(--r);padding:22px;text-align:center;color:var(--ink-2);font-size:14px;line-height:1.7}",
".cv details.cv-more{margin-top:18px}",
".cv details.cv-more summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--muted)}",
/* 새 계약 묻기 */
".cv-back{font:inherit;font-size:14px;border:0;background:none;color:var(--accent-ink);padding:4px 0;cursor:pointer}",
".cv-q{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;margin:12px 0}",
".cv-q h4{font-size:16.5px;font-weight:700;margin:0 0 4px}",
".cv-q .qn{display:inline-flex;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;font-size:13px;align-items:center;justify-content:center;margin-right:8px;vertical-align:1px}",
".cv-q>p{margin:0 0 10px;font-size:13px;color:var(--muted)}",
".cv-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}",
".cv-tile{font:inherit;text-align:left;border:1.5px solid var(--line);border-radius:12px;background:var(--surface-2);padding:12px 14px;cursor:pointer;color:var(--ink)}",
".cv-tile b{display:block;font-size:15px}",
".cv-tile small{display:block;color:var(--muted);font-size:12.5px;line-height:1.45;margin-top:2px}",
".cv-tile[aria-pressed=true]{border-color:var(--accent);background:var(--accent-soft)}",
".cv-amt{display:flex;gap:10px;align-items:center;flex-wrap:wrap}",
".cv-amt input{font:inherit;font-size:20px;font-weight:700;padding:9px 12px;border:1px solid var(--line-strong);border-radius:10px;width:100%;max-width:300px;background:var(--surface);color:var(--ink)}",
".cv-amt span{font-size:15px;color:var(--accent-ink);font-weight:700}",
".cv-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}",
".cv-v{border-radius:12px;padding:13px 15px;margin:8px 0;border:1.5px solid var(--line);background:var(--surface-2)}",
".cv-v.ok{border-color:var(--pos)}.cv-v.mid{border-color:var(--warn)}",
".cv-v b{font-size:15.5px}",
".cv-v p{margin:5px 0 0;font-size:13.5px;color:var(--ink-2);line-height:1.55}",
".cv-v .cv-law{margin-top:6px}",
".cv-v.pick{border-color:var(--accent);background:var(--accent-soft)}",
/* 계약 건 */
".cv-top h3{font-size:20px;font-weight:700;margin:4px 0 0}",
".cv-meta{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}",
".cv-meta span{font-size:12.5px;border-radius:999px;padding:1px 10px;background:var(--surface-3);color:var(--ink-2)}",
".cv-road{margin:16px 0 0}",
".cv-st{position:relative;padding-left:42px;padding-bottom:6px}",
".cv-st:not(:last-child)::before{content:\"\";position:absolute;left:14px;top:34px;bottom:-2px;width:2px;background:var(--line)}",
".cv-st.done:not(:last-child)::before{background:var(--pos)}",
".cv-dot{position:absolute;left:0;top:5px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;background:var(--surface-3);color:var(--muted)}",
".cv-st.done .cv-dot{background:var(--pos);color:#fff}.cv-st.cur .cv-dot{background:var(--accent);color:#fff}",
".cv-sh{font:inherit;display:flex;align-items:baseline;gap:4px 10px;flex-wrap:wrap;padding:8px 0;cursor:pointer;background:none;border:0;width:100%;text-align:left;color:var(--ink)}",
".cv-sh b{font-size:16px;font-weight:700}",
".cv-sh span{color:var(--muted);font-size:13px}",
".cv-st.todo .cv-sh b{color:var(--muted);font-weight:600}",
".cv-sb{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:14px 16px;margin:0 0 10px}",
".cv-st.cur .cv-sb{border-color:var(--accent-line);box-shadow:0 6px 20px -12px rgba(55,114,255,.45)}",
".cv-say{font-size:14px;color:var(--ink-2);margin:0 0 10px;line-height:1.6}",
".cv-sub{font-size:13px;font-weight:700;color:var(--ink);margin:14px 0 6px}",
".cv-list{list-style:none;margin:6px 0;padding:0;display:grid;gap:5px}",
".cv-list label{display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:1.45;cursor:pointer}",
".cv-list input{margin-top:3px;flex:0 0 auto}",
".cv-list small{display:block;color:var(--muted);font-size:12px}",
".cv-calc{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin:10px 0}",
".cv-num{background:var(--surface-2);border-radius:10px;padding:9px 12px}",
".cv-num span{display:block;font-size:12px;color:var(--muted)}",
".cv-num b{font-size:16.5px;font-weight:700}",
".cv-num small{display:block;font-size:11.5px;color:var(--muted);margin-top:2px;line-height:1.4}",
".cv-num.ok b{color:var(--pos)}.cv-num.warn b{color:var(--warn)}.cv-num.bad b{color:var(--neg)}",
".cv-next{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center}",
".cv-law{font-size:12px;color:var(--muted);line-height:1.5}",
".cv-biz{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
".cv-biz input,.cv-biz select{font:inherit;font-size:14px;padding:7px 10px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink)}",
".cv-half{display:grid;gap:6px;margin:8px 0}",
".cv-hrow{display:flex;gap:8px 12px;align-items:center;flex-wrap:wrap;background:var(--surface-2);border-radius:10px;padding:8px 12px;font-size:14px}",
".cv-hrow b{min-width:118px}",
".cv-hrow input{font:inherit;font-size:14px;padding:5px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink)}",
".cv-hrow .sp{flex:1}",
".cv-set{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:12px 16px;margin:12px 0}",
".cv-x{font:inherit;font-size:13px;border:0;background:none;color:var(--neg);cursor:pointer;padding:4px 0}",
".cv-school{display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex:1 1 320px}",
".cv-school input{font:inherit;font-size:15px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);flex:1 1 220px;max-width:340px;min-width:0}",
".cv-school .cv-chips{margin:0}",
".cv-school input.cv-tel{flex:0 1 170px;max-width:190px}",
".cv-idx{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));margin:14px 0 0;background:var(--surface);border:1px solid var(--line);border-bottom:0;border-radius:12px 12px 0 0;padding:10px 6px 0}",
".cv-ix{font:inherit;background:none;border:0;border-bottom:3px solid transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;padding:2px 2px 9px;position:relative;color:var(--muted);min-width:0}",
".cv-ix:disabled{cursor:default;opacity:.55}",
".cv-ix::before{content:\"\";position:absolute;top:16px;right:50%;width:100%;height:2px;background:var(--line)}",
".cv-ix:first-child::before{display:none}",
".cv-ix.done::before,.cv-ix.cur::before{background:var(--pos)}",
".cv-ix .n{position:relative;z-index:1;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;background:var(--surface-3);color:var(--muted);box-shadow:0 0 0 4px var(--surface)}",
".cv-ix.done .n{background:var(--pos);color:#fff}.cv-ix.cur .n{background:var(--accent);color:#fff}",
".cv-ix .t{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}",
".cv-ix.sel{border-bottom-color:var(--accent);color:var(--accent-ink)}.cv-ix.sel .t{font-weight:700}",
".cv-ix:not(:disabled):hover .t{color:var(--accent-ink)}",
".cv-pane{background:var(--surface);border:1px solid var(--line);border-radius:0 0 12px 12px;padding:16px 18px}",
".cv-ph{display:flex;gap:4px 10px;align-items:baseline;flex-wrap:wrap;margin:0 0 10px}",
".cv-ph h4,.cv-qh{font-size:17px;font-weight:700;margin:0 0 4px}",
".cv-ph span{color:var(--muted);font-size:13px}",
".cv-pane>.cv-law{margin:0 0 10px}",
".cv-pn{display:flex;justify-content:space-between;gap:8px;margin-top:16px;border-top:1px solid var(--line);padding-top:8px}",
"@media (max-width:560px){.cv-idx{padding:8px 2px 0}.cv-ix .n{width:26px;height:26px;font-size:12px}.cv-ix::before{top:14px}.cv-ix .t{font-size:11.5px}.cv-pane{padding:14px 12px}}",
".cv-one{border-radius:12px;padding:6px 18px 16px}",
".cv-orow{display:grid;grid-template-columns:120px 1fr;gap:10px 16px;padding:12px 0;border-bottom:1px solid var(--line)}",
".cv-orow:last-of-type{border-bottom:0}",
".cv-ofoot{padding:12px 0 0}",
".cv-olab{font-size:14.5px;font-weight:700;display:flex;align-items:center;align-self:start;padding-top:4px}",
".cv-olab .qn{display:inline-flex;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;align-items:center;justify-content:center;margin-right:8px}",
".cv-obody{min-width:0}",
".cv-obody .cv-chips{margin-top:0}.cv-obody .cv-chips+.cv-chips{margin-top:6px}",
".cv-obody .cv-v:first-child{margin-top:0}",
"@media (max-width:560px){.cv-orow{grid-template-columns:1fr;gap:6px}.cv-one{padding:4px 12px 12px}}",
"@media (max-width:560px){.cv-st{padding-left:36px}.cv-dot{width:26px;height:26px;font-size:12px}.cv-st:not(:last-child)::before{left:12px}.cv-sb{padding:12px}.cv-hrow b{min-width:0;width:100%}}"
].join("\n");

var TYPE={goods:"물품",serv:"용역",c1:"공사",c2:"공사",c3:"공사"};
var KINDT={goods:"물품 구매",serv:"용역",c1:"종합공사",c2:"전문공사",c3:"전기·정보통신·소방 공사"};
/* 지연배상금률(경남 업무흐름도 '준공(납품)·검사') */
var DELAY={"공사":0.5/1000,"물품":0.8/1000,"용역":1.3/1000};
/* 공휴일(토요일은 따로 뺀다). 2026~2027 — 임시공휴일은 넣지 못했다 */
var HOL=("2026-01-01 2026-02-16 2026-02-17 2026-02-18 2026-03-01 2026-03-02 2026-05-05 2026-05-24 2026-05-25 2026-06-03 2026-06-06 2026-08-15 2026-08-17 "+
  "2026-09-24 2026-09-25 2026-09-26 2026-10-03 2026-10-05 2026-10-09 2026-12-25 2027-01-01 2027-02-06 2027-02-07 2027-02-08 2027-02-09 2027-03-01 2027-05-05 "+
  "2027-05-13 2027-06-06 2027-08-15 2027-08-16 2027-09-14 2027-09-15 2027-09-16 2027-10-03 2027-10-04 2027-10-09 2027-10-11 2027-12-25 2027-12-27").split(" ");
function addDays(s,n){ var d=ymd(s); if(!d) return ""; d.setDate(d.getDate()+n); return iso(d); }
function workDays(s,n){ var d=ymd(s); if(!d) return ""; while(n>0){ d.setDate(d.getDate()+1); var k=iso(d); if(d.getDay()!==0&&d.getDay()!==6&&HOL.indexOf(k)<0) n--; } return iso(d); }
function today(){ return iso(new Date()); }
function dday(s){ var d=ymd(s), t=ymd(today()); if(!d) return null; return Math.round((d-t)/864e5); }
function ddTxt(n){ return n==null?"":n===0?"오늘":n>0?"D-"+n:(-n)+"일 지남"; }
function ddCls(n){ return n==null?"":n<0?"late":n<=3?"soon":""; }
function stamp(a){ return a<=1e7?0:a<=3e7?2e4:a<=5e7?4e4:a<=1e8?7e4:a<=1e9?15e4:35e4; }   /* 인지세법 제3조(경남 업무흐름도 '계약체결' 표) */

function cases(){ return LS.get("cases",null); }
function loadCases(){
  var c=cases(); if(c) return c;
  /* 예전 도구에서 서류를 만든 기록(ct.hist)을 장부로 옮긴다 */
  c=LS.get("hist",[]).map(function(h){ var k=h.ctype==="공사"?"c1":h.ctype==="용역"?"serv":"goods";
    var x={id:h.id,created:h.made,name:h.cname,kind:k,est:"",st:[],m:{h:"(예전 도구에서 만든 계약)",law:h.law||"",n:1},biz:{bizno:h.bizno,bizname:h.bizname},ok:{},
      amount:h.amount,guar:h.guar,d1:h.d1,d2:h.d2,d3:h.d3,gong:h.gong,sebu:h.sebu,hajaP:h.hajaP,hajaG:h.hajaG,docs:h.made,hj:{},insp:h.done||h.d3,old:1};
    x.done={}; STAGES(x).forEach(function(s){ if(s[0]!=="haja") x.done[s[0]]=h.made; }); return x; });
  LS.set("cases",c); return c;
}
function saveCases(c){ LS.set("cases",c); }
function tp(c){ return TYPE[c.kind]||"물품"; }
function STAGES(c){
  var s=isBid(c)?[["pick","계약방법 정하기"],["notice","입찰 공고하기"],["award","개찰·낙찰자 정하기"],["sign","계약 맺기"]]:[["pick","계약방법 정하기"],["vendor","견적 받고 업체 정하기"],["sign","계약 맺기"]];
  if(tp(c)!=="물품") s.push(["work",tp(c)==="공사"?"착공":"착수"]);
  s.push(["check",tp(c)==="물품"?"납품 검사":"준공 검사"],["pay","대금 지급"]);
  if(tp(c)==="공사") s.push(["haja","하자 관리"]);
  return s;
}
/* 앞 단계 날짜로 정할 수 있는 날짜는 미리 채운다. 직접 고친 값(autoV와 다름)은 건드리지 않고, 끝난 단계는 그대로 둔다.
   실제로 일어난 날(서류 받은 날·통지일·검사일·지급일 등)은 채우지 않는다 */
function prefill(c){ c.autoV=c.autoV||{}; c.done=c.done||{}; var ch=false, td=today();
  var A=function(k,v,st){ if(c.done[st]||!v) return; if(c[k]&&c[k]!==c.autoV[k]) return; if(c[k]!==v){ c[k]=v; ch=true; } c.autoV[k]=v; };
  var nextWork=function(d){ return d?workDays(addDays(d,-1),1):""; };
  if(isBid(c)){ A("nd",td,"notice"); A("od",nextWork(bidEarliest(c)),"notice"); A("req",c.od,"award"); }
  else if(c.m&&c.m.n===2){ A("qd",td,"vendor"); A("qe",quoteOpen(c),"vendor"); }
  A("d1",isBid(c)&&c.awardD&&c.awardD>td?c.awardD:td,"sign"); A("d2",c.d1,"sign");
  A("fin",c.notice,"check"); A("claim",c.insp,"pay");
  return ch; }
function isBid(c){ return !!(c.m&&c.m.n===3); }
/* 입찰 기한 (경남 업무흐름도 '견적·입찰 공고', 2026 계약실무편람 흐름도) */
function bidDays(c,urgent){ if(urgent) return 5; var a=amount(c.est)||0; return tp(c)==="공사"?(a<1e9?7:a<5e9?15:40):7; }   /* 시행령 제35조: 마감 전날부터 거꾸로 센 날수 */
function bidEarliest(c){ return c.nd?addDays(c.nd,bidDays(c,c.urg)+1):""; }
function subDays(c){ var t=tp(c), a=amount(c.est)||0; return t==="공사"?(a>=3e9&&a<1e10?15:7):t==="용역"?7:(a>=GOSI?5:3); }   /* 적격심사 서류 제출기간 */
var GOSI=2.3e8;   /* 재정경제부 고시금액(물품·용역) — 2026 계약실무편람 p.454·기간 계산표 */
function floorRate(c){ var t=tp(c), a=amount(c.est)||0;   /* 입찰 낙찰하한율(%) — 2026 계약실무편람 */
  if(t==="물품") return c.smeg?89.995:(a<GOSI?84.245:80.495);   /* p.454 물품 제조·구매 표(일반제품 적격심사 85점) · 중소기업자간 경쟁제품은 중기부 고시 제2026-80호(88점, 하한율 89.995%) */
  if(t==="용역") return a<2e8?87.745:a<5e8?86.745:a<1e9?85.495:77.995;   /* 경상남도 일반용역 등 적격심사 세부기준 · 편람 '계약금액별 낙찰하한율' */
  return a<1e9?89.745:a<5e9?88.745:a<1e10?87.495:a<3e10?81.995:null; }   /* p.89 공사 표: 종합·전문·전기 등 같은 구간, 300억 이상은 종합평가 */
function frBase(c){ return tp(c)==="공사"?"(예정가격−A) 대비 (입찰가격−A)":"예정가격 대비"; }   /* A = 국민연금·건강·노인장기요양보험료·퇴직공제부금·산업안전보건관리비·안전관리비·품질관리비 */
function frNote(c){ return tp(c)==="물품"&&c.smeg?"2026. 10. 1. 시행 중기부 고시 제2026-80호 기준(개정 전 87.995%) · 2026. 10. 이전 공고는 당시 고시 확인":""; }
function quoteOpen(c){ return c.qd?workDays(c.qd,4):""; }   /* 2인 견적: 게시일+공고기간 3일(토·공휴일 빼고)+개찰일 = 게시 5일 이상 */
function s2bOk(c){ var a=amount(c.est)||0, L={c1:4e8,c2:2e8,c3:1.6e8}[c.kind]||1e8; return a<=L; }
function curStage(c){ var s=STAGES(c); c.done=c.done||{}; for(var i=0;i<s.length;i++) if(!c.done[s[i][0]]) return i; return s.length; }
/* 하자: 준공(검사)일 + 기간 */
function hajaEnd(c){ return hajaExpiry(c.insp||c.d3,c.hajaP); }
function halves(c){ /* 준공 후 반기마다 1번(연 2회 이상), 마지막은 최종검사 */
  var s=ymd(c.insp||c.d3), e=hajaEnd(c), out=[]; if(!s||!e) return out;
  var y=s.getFullYear(), h=s.getMonth()<6?0:1; if(h){ y++; h=0; } else h=1;   /* 준공한 반기는 빼고 다음 반기부터 */
  while(true){ var hs=new Date(y,h?6:0,1), he=new Date(y,h?11:5,h?31:30); if(hs>e) break;
    out.push({k:y+"-"+(h+1),t:y+"년 "+(h?"하반기":"상반기"),from:iso(hs<s?s:hs),to:iso(he>e?e:he)}); if(h){ y++; h=0; } else h=1; }
  var fin=new Date(e.getTime()-14*864e5); out.push({k:"final",t:"최종검사",from:iso(fin),to:iso(e)});
  return out;
}
/* 다음에 할 일과 기한 */
function nextTodo(c){
  var s=STAGES(c), i=curStage(c); if(i>=s.length) return null; var id=s[i][0], t=tp(c);
  if(id==="vendor") return c.m&&c.m.n===2?{t:"견적 안내공고 내고 견적 받기",due:c.qe||""}:{t:"견적서 받고 업체 확인하기",due:""};
  if(id==="notice") return {t:"입찰 공고 올리기"+(c.od?" (마감 "+kdate(c.od)+")":""),due:c.nd||""};
  if(id==="award"){ var td=today(); if(!c.od||c.od>=td) return {t:"개찰하기",due:c.od||""}; if(!c.subm) return {t:"적격심사 서류 받기",due:c.req?addDays(c.req,subDays(c)):""};
    return {t:"적격심사하고 낙찰자 정하기",due:addDays(c.subm,7)}; }
  if(id==="sign") return isBid(c)&&c.awardD?{t:"계약 맺기 (낙찰 통지 "+kdate(c.awardD)+")",due:addDays(c.awardD,10)}:{t:"계약금액·기간 넣고 업체 서명 서류 만들기",due:""};
  if(id==="work") return {t:t==="공사"?"착공 서류 받기":"착수 서류 받기",due:c.d2||""};
  if(id==="check") return c.notice?{t:"검사하기 (이행 완료 통지 "+kdate(c.notice)+")",due:addDays(c.notice,14)}:{t:(t==="물품"?"납품":"준공")+" 기다리기 · 완료 통지 받으면 날짜 넣기",due:c.d3||""};
  if(id==="pay") return c.claim?{t:"대금 지급 (청구 "+kdate(c.claim)+")",due:workDays(c.claim,5)}:{t:"대금 청구 받기",due:""};
  if(id==="haja"){ var hs=halves(c), d=today(); c.hj=c.hj||{};
    for(var j=0;j<hs.length;j++){ if(c.hj[hs[j].k]) continue; if(hs[j].to<d) continue; return {t:hs[j].t+" 하자검사",due:hs[j].to,from:hs[j].from}; }
    return {t:"하자 기간이 끝났어요 · 정리하기",due:""}; }
  return null;
}

/* 공고 제한(입찰은 한 가지만 — 중복 제한 불가, 시행령 제20조) */
function limDefault(c,bid){ var t=tp(c), a=amount(c.est)||0;
  if(!bid) return /소기업/.test(c.m&&c.m.h||"")?"small":"gn";
  if(t==="공사") return a<(c.kind==="c1"?15e9:1e9)?"gn":"none";
  return a<1e8?"small":"sme"; }
function limOf(c,bid){ return c.lim||limDefault(c,bid); }
var LIMS=[["gn","지역제한: 경상남도"],["city","지역제한: 시·군"],["small","소기업·소상공인으로 제한"],["sme","중소기업자로 제한"],["none","제한 없음"]];
function limLine(c,bid){ var k=limOf(c,bid);   /* 공고문 참가자격 문장 */
  if(k==="gn") return bid?"입찰공고일 180일 전부터 입찰일까지 법인등기부상 본점 소재지(개인은 사업장 소재지)가 경상남도인 자":"안내공고일 전날 기준 법인등기부상 본점 소재지(개인은 사업장 소재지)가 경상남도인 자";
  if(k==="city") return "안내공고일 전날 기준 법인등기부상 본점 소재지(개인은 사업장 소재지)가 경상남도 "+(c.city||"○○시")+"인 자";
  if(k==="small") return "「중소기업제품 구매촉진 및 판로지원에 관한 법률」에 따른 소기업·소상공인(중소기업 확인서로 확인)";
  if(k==="sme") return "「중소기업기본법」에 따른 중소기업자(중소기업 확인서로 확인)";
  return ""; }
function abc(list){ var L="가나다라마바사아자차"; return list.filter(Boolean).map(function(x,i){ return L[i]+". "+x; }); }
/* 입찰공고문 초안(한글) — 시행령 제36조 공고 사항 순서. 블록은 학운위 도구의 한글 만들기(window.TKHX) 형식 */
function noticeDoc(c){
  var t=tp(c), est=amount(c.est)||0, sc=LS.get("school","")||"○○학교", re=c.fails&&c.fails.length, fr=floorRate(c), sd=subDays(c);
  var P=function(x,o){ return Object.assign({t:"p",text:x,size:12,lh:1.6,font:"m"},o||{}); }, BL={t:"p",text:"",size:8};
  var H=function(x){ return P(x,{b:true,size:13}); }, L=function(x){ return P(x,{ind:4,hang:3}); };
  var cell=function(x,o){ return Object.assign({t:x,al:"left",size:11},o||{}); }, th=function(x){ return cell(x,{b:true,al:"center",bg:"#EDEDED"}); };
  var kd=function(s){ return s?kdate(s):"○○○○. ○○. ○○."; };
  var lk=limOf(c,true), lim=lk==="none"?"일반경쟁입찰":"제한경쟁입찰 ("+{gn:"지역제한: 경상남도",city:"지역제한: 경상남도 "+(c.city||"○○시"),small:"소기업·소상공인 제한",sme:"중소기업자간 제한"}[lk]+")", ot=c.ot||"○○:○○", ind=(c.ind||"○○업")+"(업종코드 "+(c.indc||"○○○○")+")";
  var per="계약일부터 ○○일";
  var pass=t==="공사"?(est<1e10?"95점":"92점"):t==="물품"?"85점":"○○점";
  var site=s2bOk(c)?"학교장터(S2B) 또는 나라장터(G2B)":"나라장터(G2B)";
  return [
    P(sc+" 공고 제"+(c.nd?c.nd.slice(0,4):"○○○○")+"-○○호",{size:11}), BL,
    P((re?"재 ":"")+"입 찰 공 고",{al:"center",b:true,size:22}), BL,
    P("「"+c.name+"」 "+(re?"재":"")+"입찰을 다음과 같이 공고합니다.",{al:"center"}), BL,
    P(kd(c.nd),{al:"center"}), P(sc+"장",{al:"center",b:true,size:15}), BL,
    H("1. 입찰에 부치는 사항"),
    {t:"tbl",w:[38,132],font:"m",size:11,pad:1.2,rows:[
      [th("건    명"),cell(c.name)],
      [th("기초금액"),cell(est?"금 "+comma(Math.round(est*1.1))+"원 (부가가치세 포함)":"금 ○○○원 (부가가치세 포함)")],
      [th("추정가격"),cell(est?"금 "+comma(est)+"원":"금 ○○○원")],
      [th(t==="물품"?"납품기한":"계약기간"),cell(per)],
      [th(t==="물품"?"납품장소":"현    장"),cell(sc+" ○○")]]}, BL,
    H("2. 입찰 및 낙찰 방식"),
    L("가. "+lim+", 총액 입찰, "+site+" 전자입찰"),
    L("나. 예정가격: 기초금액의 ±3% 범위에서 만든 복수예비가격 15개 중 개찰 때 4개를 추첨해 산술평균"),
    L("다. 낙찰자 결정: 예정가격 이하로 입찰한 자 중 최저가격 입찰자부터 차례로 「지방자치단체 입찰시 낙찰자 결정기준」의 적격심사를 하여 종합평점 "+pass+" 이상인 자"),
    L("라. 낙찰하한율: "+(t==="공사"?"예정가격에서 국민연금보험료 등(A값: 국민건강·국민연금·노인장기요양보험료, 퇴직공제부금, 산업안전보건관리비, 안전관리비, 품질관리비)을 뺀 금액 대비 입찰가격에서 A값을 뺀 금액이 ":"예정가격 대비 ")+(fr?fr+"%":"○○%")+" 이상"),
    L("마. 적격심사 서류: 제출 요구일부터 "+sd+"일 안에 제출 (기한 안에 내지 않으면 심사에서 제외)"), BL,
    H("3. 입찰참가자격")].concat(abc(["「지방자치단체를 당사자로 하는 계약에 관한 법률 시행령」 제13조에 따른 자격을 갖추고 나라장터에 경쟁입찰참가자격을 등록한 자",
      ind+"을(를) 등록한 자", limLine(c,true), "부정당업자 제재를 받고 있는 자는 참가할 수 없음"]).map(L),[BL,
    H("4. 입찰 일정"),
    {t:"tbl",w:[60,110],font:"m",size:11,pad:1.2,rows:[
      [th("구    분"),th("일    시")],
      [cell("입찰공고",{al:"center"}),cell(kd(c.nd))],
      [cell("입찰서 제출 마감",{al:"center"}),cell(kd(c.od)+" "+ot)],
      [cell("개    찰",{al:"center"}),cell(kd(c.od)+" "+ot+" 이후 (마감 직후, 입찰집행관 PC)")]]}, BL,
    H("5. 입찰보증금 및 입찰의 무효"),
    L("가. 입찰보증금은 입찰금액의 100분의 5 이상이며, 전자입찰서의 지급각서로 갈음합니다. 낙찰자가 정당한 이유 없이 계약을 맺지 않으면 학교에 귀속합니다."),
    L("나. 「지방자치단체를 당사자로 하는 계약에 관한 법률 시행규칙」 제42조에 해당하는 입찰은 무효로 합니다."), BL,
    H("6. 계약 체결"),
    L("가. 낙찰자는 낙찰 통지를 받은 날부터 10일 안에 계약을 맺어야 합니다."),
    t!=="물품"?L("나. 국민연금·건강보험·노인장기요양보험료는 사후정산하며, 산업안전보건 관련 의무를 지켜야 합니다."):L("나. 계약 서류: 계약보증금 지급각서, 청렴계약 이행서약서 등"), BL,
    H("7. 기타"),
    L("가. 이 공고에 없는 사항은 지방계약법령, 「지방자치단체 입찰 및 계약 집행기준」, 「지방자치단체 입찰시 낙찰자 결정기준」을 따릅니다."),
    L("나. 나라장터 게시 내용과 이 공고문이 다르면 이 공고문이 우선합니다."),
    L("다. 문의: "+sc+" 행정실 ("+(LS.get("tel","")||"055-○○○-○○○○")+")")
  ]);
}

/* 2인 이상 견적: 수의 견적제출 안내공고문 초안 (공고명은 '입찰 공고'가 아니라 '수의 견적제출 안내') */
function quoteDoc(c){
  var t=tp(c), est=amount(c.est)||0, sc=LS.get("school","")||"○○학교", ot=c.ot||"○○:○○", ind=(c.ind||"○○업")+"(업종코드 "+(c.indc||"○○○○")+")";
  var P=function(x,o){ return Object.assign({t:"p",text:x,size:12,lh:1.6,font:"m"},o||{}); }, BL={t:"p",text:"",size:8};
  var H=function(x){ return P(x,{b:true,size:13}); }, L=function(x){ return P(x,{ind:4,hang:3}); };
  var cell=function(x,o){ return Object.assign({t:x,al:"left",size:11},o||{}); }, th=function(x){ return cell(x,{b:true,al:"center",bg:"#EDEDED"}); };
  var kd=function(s){ return s?kdate(s):"○○○○. ○○. ○○."; }, end=c.qd?workDays(c.qd,3):"";
  var fr=t==="공사"?"89.745%":est<=2e7?"90%":"88%", frb=t==="공사"?"예정가격에서 국민연금보험료 등(A값)을 뺀 금액 대비 견적가격에서 A값을 뺀 금액이 ":"예정가격 대비 ";
  return [
    P(sc+" 공고 제"+(c.qd?c.qd.slice(0,4):"○○○○")+"-○○호",{size:11}), BL,
    P("수의 견적제출 안내 공고",{al:"center",b:true,size:20}), BL,
    P("「"+c.name+"」 견적서 제출을 다음과 같이 안내합니다.",{al:"center"}), BL,
    P(kd(c.qd),{al:"center"}), P(sc+"장",{al:"center",b:true,size:15}), BL,
    H("1. 견적에 부치는 사항"),
    {t:"tbl",w:[38,132],font:"m",size:11,pad:1.2,rows:[
      [th("건    명"),cell(c.name)],
      [th("기초금액"),cell(est?"금 "+comma(Math.round(est*1.1))+"원 (부가가치세 포함)":"금 ○○○원 (부가가치세 포함)")],
      [th("추정가격"),cell(est?"금 "+comma(est)+"원":"금 ○○○원")],
      [th(t==="물품"?"납품기한":"계약기간"),cell("계약일부터 ○○일")],
      [th(t==="물품"?"납품장소":"현    장"),cell(sc+" ○○")]]}, BL,
    H("2. 계약 방법"),
    L("가. 「지방자치단체를 당사자로 하는 계약에 관한 법률 시행령」 "+(c.m&&c.m.law?c.m.law.replace(/^지방계약법 시행령 /,"").replace(/ · .*$/,""):"제25조")+"에 따른 2인 이상 견적 수의계약"),
    L("나. "+(s2bOk(c)?"학교장터(S2B) 또는 나라장터(G2B)":"나라장터(G2B)")+" 전자견적 · 총액"+(t==="공사"?" · 물량내역서를 함께 올림":"")), BL,
    H("3. 견적서 제출 자격")].concat(abc([ind+"을(를) 등록하고 전자조달시스템에 이용자 등록을 한 자", limLine(c,false),
      "「지방자치단체 입찰 및 계약 집행기준」 제5장에 따른 수의계약 배제사유에 해당하지 않는 자", "부정당업자 제재를 받고 있는 자는 제출할 수 없음"]).map(L),[BL,
    H("4. 견적 일정"),
    {t:"tbl",w:[60,110],font:"m",size:11,pad:1.2,rows:[
      [th("구    분"),th("일    시")],
      [cell("안내공고",{al:"center"}),cell(kd(c.qd))],
      [cell("견적서 제출",{al:"center"}),cell(kd(c.qd)+" ~ "+kd(c.qe||end)+" "+ot+" (토·공휴일 빼고 3일 이상)")],
      [cell("개    찰",{al:"center"}),cell(kd(c.qe||quoteOpen(c))+" "+ot+" 이후")]]}, BL,
    H("5. 계약상대자 결정"),
    L("가. 예정가격 이하로서 "+frb+fr+" 이상으로 견적한 자 중 최저가격 견적자부터 차례로 수의계약 배제사유를 확인하여 결정합니다."),
    L("나. 같은 가격이 2인 이상이면 추첨으로 정합니다."),
    L("다. 결정된 자는 수의계약 각서, 청렴계약 이행서약서 등 계약 서류를 내야 합니다."), BL,
    H("6. 기타"),
    L("가. 이 공고에 없는 사항은 지방계약법령과 「지방자치단체 입찰 및 계약 집행기준」을 따릅니다."),
    L("나. 문의: "+sc+" 행정실 ("+(LS.get("tel","")||"055-○○○-○○○○")+")")
  ]);
}
function build(root){
  if(!document.getElementById("cv-css")){ var st=el("style"); st.id="cv-css"; st.textContent=CSS; document.head.appendChild(st); }
  var C=loadCases(), view={v:"list"};
  root.textContent=""; var app=el("div","cv"); root.appendChild(app);
  function put(){ saveCases(C); }
  function byId(id){ for(var i=0;i<C.length;i++) if(C[i].id===id) return C[i]; return null; }
  function go(v){ view=v; draw(); var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function btn(t,cls,fn){ var b=el("button",cls||"btn",t); b.type="button"; if(fn) b.onclick=fn; return b; }
  function draw(){ app.textContent=""; if(view.v==="new") drawNew(); else if(view.v==="case") drawCase(byId(view.id)); else drawList(); }

  /* ---------------- 장부 ---------------- */
  function drawList(){
    var hero=el("div","cv-hero"), sch=el("div","cv-school");
    var si=el("input"); si.value=LS.get("school",""); si.placeholder="학교명 (예: ○○초등학교)"; si.setAttribute("aria-label","학교명"); si.oninput=function(){ LS.set("school",si.value.trim()); }; sch.appendChild(si);
    var ti=el("input"); ti.value=LS.get("tel",""); ti.placeholder="행정실 전화 (055-…)"; ti.inputMode="tel"; ti.setAttribute("aria-label","행정실 전화번호"); ti.className="cv-tel"; ti.oninput=function(){ LS.set("tel",ti.value.trim()); }; sch.appendChild(ti);
    var pv=el("div","cv-chips"); [[false,"공립"],[true,"사립"]].forEach(function(o){ var p=btn(o[1],"pill",function(){ LS.set("priv",o[0]); pv.querySelectorAll(".pill").forEach(function(x){ x.setAttribute("aria-pressed",x===p?"true":"false"); }); }); p.setAttribute("aria-pressed",!!LS.get("priv",false)===o[0]?"true":"false"); pv.appendChild(p); }); sch.appendChild(pv);
    hero.appendChild(sch); var bs=el("div","cv-btns"); bs.appendChild(btn("+ 새 계약","btn",function(){ go({v:"new"}); }));
    var sb=btn("자료 내보내기","btn ghost"); bs.appendChild(sb); hero.appendChild(bs); app.appendChild(hero);
    var setBox=el("div"); app.appendChild(setBox); sb.onclick=function(){ if(setBox.firstChild){ setBox.textContent=""; return; } drawSettings(setBox); };

    var open=C.filter(function(c){ return curStage(c)<STAGES(c).length&&!c.closed; }), haja=open.filter(function(c){ return STAGES(c)[curStage(c)][0]==="haja"; });
    var work=open.filter(function(c){ return haja.indexOf(c)<0; }), fin=C.filter(function(c){ return open.indexOf(c)<0; });
    var todos=open.map(function(c){ return {c:c,n:nextTodo(c)}; }).filter(function(x){ return x.n; });
    todos.forEach(function(x){ x.d=dday(x.n.due); x.f=x.n.from?dday(x.n.from):null; });
    var soon=todos.filter(function(x){ return x.d!=null&&x.d<=7&&(x.f==null||x.f<=7); });
    var sum=el("div","cv-sum"); [["진행 중",work.length],["7일 안 기한",soon.length],["하자 기간",haja.length],["끝남",fin.length]].forEach(function(p){ var d=el("div"); d.appendChild(el("span",null,p[0])); d.appendChild(el("b",null,String(p[1]))); sum.appendChild(d); });
    app.appendChild(sum);

    if(!C.length){ var e=el("div","cv-empty"); e.appendChild(el("p",null,"아직 올린 계약이 없어요.")); e.appendChild(el("p",null,"'+ 새 계약'을 누르면 무엇을, 얼마에 사는지 몇 가지만 묻고 쓸 수 있는 계약방법을 알려 줘요."));
      e.appendChild(btn("+ 새 계약","btn",function(){ go({v:"new"}); })); app.appendChild(e); return; }

    app.appendChild(el("div","cv-h","해야 할 일"));
    var tl=el("div","cv-todo"); app.appendChild(tl);
    todos.sort(function(a,b){ var x=a.d==null?9999:a.d, y=b.d==null?9999:b.d; return x-y; });
    if(!todos.length) tl.appendChild(el("p","tkempty","지금 할 일이 없어요."));
    todos.forEach(function(x){ var r=btn("","cv-row",function(){ go({v:"case",id:x.c.id}); });
      var dd=el("span","cv-dd "+(x.n.due?(x.f!=null&&x.f>0?"free":ddCls(x.d)):"free"),x.n.due?(x.f!=null&&x.f>0?kdate(x.n.from).slice(5)+"부터":ddTxt(x.d)):"기한 없음");
      var tx=el("span","tx"); tx.appendChild(el("b",null,x.n.t)); tx.appendChild(el("small",null,x.c.name+(x.n.due?" · 기한 "+kdate(x.n.due):"")));
      r.appendChild(dd); r.appendChild(tx); tl.appendChild(r); });

    function kill(b,c){ delX(b,c.name||"이 계약",function(){ C=C.filter(function(x){ return x!==c; }); put(); draw(); }); }
    function cards(list,title){ if(!list.length) return; app.appendChild(el("div","cv-h",title)); var g=el("div","cv-cases"); app.appendChild(g);
      list.forEach(function(c){ var b=btn("","cv-case",function(){ go({v:"case",id:c.id}); }), s=STAGES(c), i=curStage(c);
        b.appendChild(el("h4",null,c.name)); b.appendChild(el("p",null,[KINDT[c.kind],c.biz&&c.biz.bizname,c.amount?won(c.amount):(amount(c.est)?"추정 "+won(amount(c.est)):"")].filter(Boolean).join(" · ")));
        var tr=el("div","cv-track"); s.forEach(function(_,j){ tr.appendChild(el("i",j<i?"on":j===i?"cur":"")); }); b.appendChild(tr);
        b.appendChild(el("p",null,i<s.length?"지금: "+s[i][1]:"끝났어요")); kill(b,c); g.appendChild(b); }); }
    cards(work,"진행 중인 계약"); cards(haja,"하자 기간 중인 공사");
    if(fin.length){ var dt=el("details","cv-more"); dt.appendChild(el("summary",null,"끝난 계약 "+fin.length+"건")); var g=el("div","cv-cases"); g.style.marginTop="8px"; dt.appendChild(g); app.appendChild(dt);
      fin.forEach(function(c){ var b=btn("","cv-case",function(){ go({v:"case",id:c.id}); }); b.appendChild(el("h4",null,c.name)); b.appendChild(el("p",null,[KINDT[c.kind],c.biz&&c.biz.bizname,c.amount?won(c.amount):""].filter(Boolean).join(" · "))); kill(b,c); g.appendChild(b); }); }
  }

  function drawSettings(box,first){
    box.textContent=""; var s=el("div","cv-set"); box.appendChild(s);
    s.appendChild(el("div","cv-sub","다른 PC로 옮기기"));
    var r=el("div","cv-btns"); s.appendChild(r); var m=el("div","tkmsg"); s.appendChild(m);
    r.appendChild(btn("파일로 내보내기","btn ghost",function(){ saveFile(new Blob([JSON.stringify({cases:C,biz:LS.get("biz",{}),school:LS.get("school",""),tel:LS.get("tel","")},null,1)],{type:"application/json"}),"계약목록_"+today()+".json").then(function(){ msg(m,"내보냈어요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }));
    var lb=el("label","btn ghost","파일 불러오기"), fi=el("input"); fi.type="file"; fi.accept=".json"; fi.hidden=true; lb.appendChild(fi); r.appendChild(lb);
    fi.onchange=function(){ var f=fi.files[0]; if(!f) return; f.text().then(function(t){ var j=JSON.parse(t), ids={}; C.forEach(function(c){ ids[c.id]=1; });
      (j.cases||[]).forEach(function(c){ if(!ids[c.id]) C.push(c); }); if(j.biz) LS.set("biz",Object.assign(LS.get("biz",{}),j.biz)); if(j.tel&&!LS.get("tel","")) LS.set("tel",j.tel); put(); draw(); }).catch(function(){ msg(m,"내보낸 파일을 읽지 못했어요.","bad"); }); };
  }
  /* 공고문에 들어갈 업종·제한·시각 — 입찰 공고, 2인 견적 업체 단계에서 같이 씀 */
  function noticeFields(c,b,bid){ var g=el("div","tkgridf"); b.appendChild(g);
    fld(g,"업종",c.ind||"",function(v){ c.ind=v; put(); },{ph:t0(c)});
    fld(g,"업종코드",c.indc||"",function(v){ c.indc=v; put(); },{ph:"예: 0037"});
    fld(g,"마감 시각",c.ot||"",function(v){ c.ot=v; put(); },{type:"time"});
    var lw=el("label","tkf"), ls=el("select"); lw.appendChild(el("span","tkfl",bid?"참가 제한 (한 가지만)":"견적 대상 제한")); lw.appendChild(ls); g.appendChild(lw);
    LIMS.forEach(function(x){ if(bid&&x[0]==="city") return; if(!bid&&x[0]==="sme") return; var o=el("option",null,x[1]); o.value=x[0]; ls.appendChild(o); }); ls.value=limOf(c,bid);
    var cw=el("label","tkf"), ci=el("input"); cw.appendChild(el("span","tkfl","시·군")); ci.placeholder="예: 창원시"; ci.value=c.city||""; cw.appendChild(ci); g.appendChild(cw); cw.hidden=ls.value!=="city";
    ci.oninput=function(){ c.city=ci.value.trim(); put(); };
    ls.onchange=function(){ c.lim=ls.value; cw.hidden=ls.value!=="city"; put(); }; }
  function t0(c){ var t=tp(c); return t==="공사"?"예: 실내건축공사업":t==="용역"?"예: 소독업":"예: 가구 제조업"; }
  function msg(box,t,kind){ box.textContent=t||""; box.className="tkmsg"+(t?" on "+(kind||"ok"):""); }

  /* 좌→우 단계 표시(인덱스). items: [{t:짧은 이름, st:"done|cur|todo", on:고른 것, ok:누를 수 있는지, fn}] */
  function index(items){ var nv=el("nav","cv-idx"); nv.style.setProperty("--n",items.length);
    items.forEach(function(x,i){ var b=btn("","cv-ix "+x.st+(x.on?" sel":""),x.ok?x.fn:null); if(!x.ok) b.disabled=true; if(x.on) b.setAttribute("aria-current","step");
      b.appendChild(el("span","n",x.st==="done"?"✓":String(i+1))); b.appendChild(el("span","t",x.t)); nv.appendChild(b); });
    app.appendChild(nv); var pn=el("section","cv-pane"); app.appendChild(pn); return pn; }
  function pager(pn,prev,next){ var r=el("div","cv-pn"); pn.appendChild(r); r.appendChild(prev?btn("← "+prev[0],"cv-back",prev[1]):el("span")); if(next) r.appendChild(btn(next[0]+" →","cv-back",next[1])); }

  /* ---------------- 새 계약: 한 화면에서 정하기 ---------------- */
  function drawNew(){
    var W=view.w||(view.w={kind:"",est:"",st:[],pick:-1,name:""});
    app.appendChild(btn("← 계약 목록","cv-back",function(){ go({v:"list"}); }));
    var top=el("div","cv-top"); top.appendChild(el("h3",null,"새 계약")); app.appendChild(top);
    var pn=el("section","cv-pane cv-one"); app.appendChild(pn);
    function row(n,label){ var r=el("div","cv-orow"), h=el("div","cv-olab"); h.appendChild(el("span","qn",String(n))); h.appendChild(document.createTextNode(label)); r.appendChild(h); var b=el("div","cv-obody"); r.appendChild(b); pn.appendChild(r); return b; }
    /* 1 계약 이름 */
    var b0=row(1,"계약 이름"), nw=el("div","cv-amt"), ni=el("input"); ni.style.fontSize="16px"; ni.style.maxWidth="560px"; ni.value=W.name; nw.appendChild(ni); b0.appendChild(nw);
    ni.oninput=function(){ W.name=ni.value; }; setTimeout(function(){ if(!W.name) ni.focus(); },0);
    /* 2 무엇을 */
    var b1=row(2,"무엇을"), c1=el("div","cv-chips"); b1.appendChild(c1); var c1b=el("div","cv-chips"); b1.appendChild(c1b);
    var isC=function(){ return /^c/.test(W.kind)||W._c; };
    function draw1(){ c1.textContent=""; c1b.textContent="";
      [["goods","물품"],["serv","용역"],["c","공사"]].forEach(function(o){ var on=o[0]==="c"?isC():(!isC()&&W.kind===o[0]);
        var p=btn(o[1],"pill",function(){ if(o[0]==="c"){ W._c=true; if(!/^c/.test(W.kind)) W.kind=""; } else { W._c=false; W.kind=o[0]; } W.pick=-1; draw1(); res(); }); p.setAttribute("aria-pressed",on?"true":"false"); c1.appendChild(p); });
      if(isC()) [["c1","종합공사"],["c2","전문공사"],["c3","전기·정보통신·소방·그 밖"]].forEach(function(o){ var p=btn(o[1],"pill",function(){ W.kind=o[0]; W.pick=-1; draw1(); res(); }); p.setAttribute("aria-pressed",W.kind===o[0]?"true":"false"); c1b.appendChild(p); });
      c1b.hidden=!isC(); }
    /* 2 얼마에 */
    var b2=row(3,"추정가격"), aw=el("div","cv-amt"), ai=el("input"), ah=el("span"); ai.inputMode="numeric"; ai.placeholder="부가세 뺀 금액 · 예: 1800만"; ai.value=W.est; aw.appendChild(ai); aw.appendChild(ah); b2.appendChild(aw);
    ai.oninput=function(){ W.est=ai.value; W.pick=-1; res(); };
    /* 3 계약상대 */
    var b3=row(4,"계약상대"), c3=el("div","cv-chips"); b3.appendChild(c3);
    function draw3(){ c3.textContent=""; ST.forEach(function(s){ if((s[0]==="x"||s[0]==="p")&&/^c/.test(W.kind)) return;
      var p=btn(s[1],"pill",function(){ var i=W.st.indexOf(s[0]); if(i<0) W.st.push(s[0]); else W.st.splice(i,1); W.pick=-1; p.setAttribute("aria-pressed",W.st.indexOf(s[0])>=0?"true":"false"); res(); });
      p.setAttribute("aria-pressed",W.st.indexOf(s[0])>=0?"true":"false"); if(s[2]) p.title=s[2]; c3.appendChild(p); }); }
    /* 4 계약방법 */
    var b4=row(5,"계약방법"), rbox=el("div"); b4.appendChild(rbox);
    var ft=el("div","cv-ofoot"); pn.appendChild(ft); var mk=btn("목록에 올리기","btn"); ft.appendChild(mk); var mm=el("div","tkmsg"); ft.appendChild(mm);
    var R=[];
    function res(){
      var a=amount(W.est), ok=!!W.est&&!isNaN(a); ah.textContent=ok?"= "+won(a):"";
      ni.placeholder=/^c/.test(W.kind)?"예: 2026학년도 과학실 환경개선 공사":W.kind==="serv"?"예: 2026학년도 교내 방역 용역":"예: 2026학년도 교실 책걸상 구입";
      draw3(); rbox.textContent=""; R=[];
      if(!W.kind||!ok){ rbox.appendChild(el("p","cv-law",!W.kind?"무엇을 계약하는지 골라 주세요.":"추정가격을 넣으면 쓸 수 있는 방법이 나와요.")); return; }
      R=method(W.kind==="goods"||W.kind==="serv"?"g":W.kind,a,W.st,LS.get("priv",false));
      R.forEach(function(x,i){ var v=el("div","cv-v "+x.t+(W.pick===i?" pick":"")); v.appendChild(el("b",null,x.h)); x.p.forEach(function(p){ v.appendChild(el("p",null,p)); });
        v.appendChild(el("div","cv-law","근거: "+x.law));
        var b=btn(W.pick===i?"✓ 이 방법":"이 방법으로","btn"+(W.pick===i?"":" ghost"),function(){ W.pick=i; res(); if(!W.name) ni.focus(); }); b.style.marginTop="8px"; v.appendChild(b);
        rbox.appendChild(v); });
    }
    mk.onclick=function(){ var nm=(W.name||"").trim(), x=R[W.pick];
      if(!W.kind) return msg(mm,"무엇을 계약하는지 골라 주세요.","warn"); if(!R.length) return msg(mm,"추정가격을 넣어 주세요.","warn");
      if(!x) return msg(mm,"계약방법을 골라 주세요.","warn"); if(!nm){ ni.focus(); return msg(mm,"계약 이름을 넣어 주세요.","warn"); }
      var c={id:Date.now(),created:today(),name:nm,kind:W.kind,est:W.est,st:W.st.slice(),m:{h:x.h,law:x.law,n:x.t==="bid"?3:x.n},biz:{},ok:{},done:{pick:today()},hj:{}};
      C.unshift(c); put(); go({v:"case",id:c.id}); };
    ni.onkeydown=function(e){ if(e.key==="Enter") mk.onclick(); };
    draw1(); res();
  }

  /* ---------------- 계약 한 건(좌→우 단계) ---------------- */
  function drawCase(c){
    if(!c){ go({v:"list"}); return; }
    app.appendChild(btn("← 계약 목록","cv-back",function(){ go({v:"list"}); }));
    var top=el("div","cv-top"); top.appendChild(el("h3",null,c.name)); app.appendChild(top);
    var mt=el("div","cv-meta"); [KINDT[c.kind],c.m&&c.m.h,c.biz&&c.biz.bizname,c.amount?won(c.amount):(amount(c.est)?"추정 "+won(amount(c.est)):"")].filter(Boolean).forEach(function(t){ mt.appendChild(el("span",null,t)); }); app.appendChild(mt);
    CUR=c; if(prefill(c)) put();
    var S=STAGES(c), cur=curStage(c); c.done=c.done||{};
    var SH={pick:"방법",vendor:"업체",notice:"공고",award:"낙찰",sign:"계약",work:tp(c)==="공사"?"착공":"착수",check:"검사",pay:"지급",haja:"하자"};
    var sel=-1; S.forEach(function(s,i){ if(s[0]===view.open) sel=i; }); if(sel<0) sel=Math.min(cur,S.length-1);
    var st=function(i){ return c.done[S[i][0]]?"done":i===cur?"cur":"todo"; };
    var pn=index(S.map(function(s,i){ return {t:SH[s[0]],st:st(i),on:i===sel,ok:true,fn:function(){ view.open=s[0]; draw(); }}; }));
    var s=S[sel], state=st(sel), hd=el("div","cv-ph"); hd.appendChild(el("h4",null,s[1])); var line=summary(c,s[0],state); if(line) hd.appendChild(el("span",null,line)); pn.appendChild(hd);
    if(cur>=S.length&&sel===S.length-1) pn.appendChild(el("div","tkmsg on ok","이 계약은 모두 끝났어요."));
    STAGE[s[0]](c,pn,state);
    pager(pn,sel>0?[SH[S[sel-1][0]],function(){ view.open=S[sel-1][0]; draw(); }]:null,sel<S.length-1?[SH[S[sel+1][0]],function(){ view.open=S[sel+1][0]; draw(); }]:null);
    var dz=el("div","cv-next"); dz.style.marginTop="24px"; app.appendChild(dz);
    dz.appendChild(btn("이 계약 지우기","cv-x",function(){ if(!confirm("'"+c.name+"' 계약을 목록에서 지울까요?")) return; C=C.filter(function(x){ return x!==c; }); put(); go({v:"list"}); }));
  }
  function finish(c,k){ c.done[k]=today(); view.open=null; put(); draw(); var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function reopen(c,k){ var S=STAGES(c), on=false; S.forEach(function(s){ if(s[0]===k) on=true; if(on) delete c.done[s[0]]; }); view.open=null; put(); draw(); }
  function nextBar(b,c,k,state,label,ready){
    var n=el("div","cv-next"); b.appendChild(n);
    if(state==="done"){ n.appendChild(btn("이 단계 다시 열기","btn ghost",function(){ reopen(c,k); })); return n; }
    var go2=btn(label,"btn",function(){ var why=ready(); if(why){ msg(m,why,"warn"); return; } finish(c,k); }); n.appendChild(go2);
    var m=el("div","tkmsg"); b.appendChild(m); return n;
  }
  var CUR=null;
  function fld(g,label,val,on,o){ o=o||{}; var f=el("label","tkf"+(o.wide?" wide":"")); f.appendChild(el("span","tkfl",label)); var i=el("input"); i.type=o.type||"text"; if(o.num) i.inputMode="numeric";
    i.value=val==null?"":val; if(o.ph) i.placeholder=o.ph; f.appendChild(i); if(o.hint) f.appendChild(el("small",null,o.hint)); g.appendChild(f);
    i.addEventListener(o.type==="date"?"change":"input",function(){ on(i.value); if(o.type==="date"&&CUR&&prefill(CUR)){ put(); view.open=view.open||null; draw(); } }); if(o.num) i.addEventListener("blur",function(){ var n=num(i.value); i.value=n?comma(n):""; }); return i; }
  function nums(box,items){ box.textContent=""; items.forEach(function(x){ if(!x) return; var d=el("div","cv-num "+(x.c||"")); d.appendChild(el("span",null,x.l)); d.appendChild(el("b",null,x.v)); if(x.s) d.appendChild(el("small",null,x.s)); box.appendChild(d); }); }
  function ticks(box,list,store){ var u=el("ul","cv-list"); box.appendChild(u); list.forEach(function(it){ var li=el("li"), lb=el("label"), cb=el("input"); cb.type="checkbox"; cb.checked=!!store[it[0]];
    cb.onchange=function(){ store[it[0]]=cb.checked; put(); }; var t=el("span",null,it[1]); if(it[2]) t.appendChild(el("small",null,it[2])); lb.appendChild(cb); lb.appendChild(t); li.appendChild(lb); u.appendChild(li); }); return u; }

  function summary(c,k,state){
    var t=tp(c);
    if(state==="todo"){
      return {vendor:"",sign:"",work:"계약 후 서류를 받아요",check:"완료 통지를 받은 날부터 14일 안에 검사",pay:"청구받은 날부터 5일(첫날·토·공휴일 빼고) 안에 지급",haja:"하자담보책임기간 동안 연 2회 이상 검사"}[k]||"";
    }
    if(state==="cur"){ var n=nextTodo(c); return n&&n.due?"기한 "+kdate(n.due)+" ("+ddTxt(dday(n.due))+")":""; }
    if(k==="pick") return c.m?c.m.h.replace(/^(수의계약|입찰) · /,""):"";
    if(k==="notice") return c.nd?kdate(c.nd)+" 공고"+(c.od?" · 개찰 "+kdate(c.od):""):"";
    if(k==="award") return [c.biz&&c.biz.bizname,c.awardD?kdate(c.awardD)+" 통지":""].filter(Boolean).join(" · ");
    if(k==="vendor") return c.biz&&c.biz.bizname||"";
    if(k==="sign") return [c.amount?won(c.amount):"",c.d1?kdate(c.d1):""].filter(Boolean).join(" · ");
    if(k==="work") return c.d2?kdate(c.d2)+" 시작":"";
    if(k==="check") return c.insp?kdate(c.insp)+" 검사":"";
    if(k==="pay") return c.paid?kdate(c.paid)+" 지급":"";
    if(k==="haja"){ var e=hajaEnd(c); return e?iso(e)+" 만료":""; }
    return "";
  }

  /* 업체 정보·조회(부정당제재·휴폐업) — 수의계약 '업체', 입찰 '낙찰'에서 같이 씀 */
  function bizBox(c,b,key){ c.biz=c.biz||{}; c.ok=c.ok||{};
    b.appendChild(el("div","cv-sub","업체"));
    var bz=el("div","cv-biz"), bn=el("input"); bn.placeholder="사업자번호"; bn.style.width="150px"; bn.value=c.biz.bizno?bizfmt(c.biz.bizno):""; bz.appendChild(bn);
    var lk=btn("조회","btn ghost"); bz.appendChild(lk);
    var past=el("select"), pm=LS.get("biz",{}), o0=el("option",null,"전에 계약한 업체…"); o0.value=""; past.appendChild(o0);
    Object.keys(pm).forEach(function(k){ var o=el("option",null,pm[k].bizname+" ("+bizfmt(k)+")"); o.value=k; past.appendChild(o); }); if(Object.keys(pm).length) bz.appendChild(past);
    b.appendChild(bz); var bm=el("div","tkmsg"); b.appendChild(bm);
    var g=el("div","tkgridf"); b.appendChild(g); var F={};
    function fill(){ g.textContent=""; [["bizname","업체명"],["bizceo","대표자"],["biztel","전화번호"],["biztype","업태"],["bizitem","업종"],["bizaddr","주소",1]].forEach(function(f){ F[f[0]]=fld(g,f[1],c.biz[f[0]]||"",function(v){ c.biz[f[0]]=v; put(); },{wide:f[2]}); }); }
    fill();
    bn.oninput=function(){ c.biz.bizno=bn.value.replace(/\D/g,""); c.biz.officeType=officeOf(c.biz.bizno)||c.biz.officeType; put(); };
    past.onchange=function(){ var p=pm[past.value]; if(!p) return; c.biz=Object.assign({bizno:past.value},p); bn.value=bizfmt(past.value); put(); fill(); };
    lk.onclick=function(){ var n=bn.value.replace(/\D/g,""); if(n.length!==10){ msg(bm,"사업자번호 10자리를 넣어 주세요.","warn"); return; }
      if(!getKey()){ msg(bm,"조회 인증키가 없어요. 업체 정보를 직접 적어 주세요.","warn"); return; }
      lk.disabled=true; lk.textContent="조회 중…"; var notes=[]; var np=nts(n).then(function(d){return{d:d}},function(e){return{e:e}});
      byBiz("getPrcrmntCorpBasicInfo02",n).then(function(rows){ var x=rows[0]; if(!x){ notes.push("나라장터에 등록된 정보가 없어요. 직접 적어 주세요."); return; }
        Object.assign(c.biz,{bizno:n,bizname:x.corpNm||"",bizceo:x.ceoNm||"",biztel:x.telNo||"",bizaddr:[x.adrs,x.dtlAdrs].filter(Boolean).join(" "),officeType:officeOf(n)});
        return byBiz("getPrcrmntCorpIndstrytyInfo02",n).then(function(ind){ var m=ind.filter(function(y){return y.rprsntIndstrytyYn==="Y"})[0]||ind[0]; if(m) c.biz.bizitem=m.indstrytyNm; },function(){}); })
      .then(function(){ return byBiz("getUnptRsttCorpInfo02",n).then(function(r){ var now=today().replace(/-/g,""), act=(r||[]).filter(function(x){ var a=String(x.rsttBgnDate||"").replace(/\D/g,"").slice(0,8), z=String(x.rsttEndDate||"").replace(/\D/g,"").slice(0,8); return (!a||a<=now)&&(!z||z>=now); });
          if(act.length){ notes.unshift("⚠ 지금 부정당제재 중인 업체예요 ("+act[0].rsttBgnDate+" ~ "+act[0].rsttEndDate+"). 계약할 수 없어요."); c.ok.san=false; } else { notes.push("부정당제재: 없음"); c.ok.san=true; } },function(){ notes.push("부정당제재 조회 실패 — 나라장터에서 확인해요."); }); })
      .catch(function(e){ notes.push(e.message); })
      .then(function(){ return np; }).then(function(r){ if(r.e) notes.push(r.e.message); else if(r.d){ var s=r.d.b_stt_cd; if(s==="01"){ notes.push("국세청: 계속사업자"); c.ok.nts=true; } else { notes.unshift("⚠ 국세청 기준 "+(s==="02"?"휴업자":s==="03"?"폐업자":"미등록 번호")+"예요. 계약하면 안 돼요."); c.ok.nts=false; } }
        put(); view.open=key; draw(); var mm=app.querySelector(".cv-st.cur .tkmsg, .cv-sb .tkmsg"); if(mm) msg(mm,notes.join("\n"),/⚠/.test(notes.join(""))?"bad":/문제|실패|못|없어요|맞지 않/.test(notes.join(""))?"warn":"ok"); }); };

    /* 체크박스 대신: 조회로 알 수 있는 것은 결과로, 나머지는 받는 서류로 확인된다는 안내만 */
    var stx=el("div","cv-meta"); b.appendChild(stx);
    var tag=function(k,label){ var v=c.ok[k], s=el("span",null,label+(v===true?" ✓ 이상 없음":v===false?" ✕ 계약 불가":" · 조회하면 나와요")); if(v===true){ s.style.background="var(--pos-bg)"; s.style.color="var(--pos)"; } if(v===false){ s.style.background="var(--neg-bg)"; s.style.color="var(--neg)"; } stx.appendChild(s); };
    tag("san","부정당제재"); tag("nts","휴·폐업");
  }
  var STAGE={};
  /* 1. 계약방법 */
  STAGE.pick=function(c,b,state){
    var v=el("div","cv-v ok"); v.appendChild(el("b",null,c.m.h)); v.appendChild(el("div","cv-law","근거: "+c.m.law)); b.appendChild(v);
    b.appendChild(el("p","cv-law","추정가격 "+(amount(c.est)?won(amount(c.est)):"-")+" · "+KINDT[c.kind]+(c.st.length?" · "+c.st.map(function(k){ for(var i=0;i<ST.length;i++) if(ST[i][0]===k) return ST[i][1]; }).join(", "):"")));
    var n=el("div","cv-next"); b.appendChild(n);
    n.appendChild(btn("방법 다시 정하기","btn ghost",function(){ var w={kind:c.kind,est:c.est,st:c.st.slice(),pick:-1,name:c.name}; C=C.filter(function(x){ return x!==c; }); put(); view={v:"new",w:w}; draw(); }));
  };
  /* 2. 견적·업체 */
  STAGE.vendor=function(c,b,state){
    var t=tp(c), est=amount(c.est), two=c.m&&c.m.n===2; c.biz=c.biz||{}; c.ok=c.ok||{};
    var say=two?"지정정보처리장치(나라장터·학교장터)에 견적 안내공고를 3일 이상(토·공휴일 빼고) 내고 2인 이상 견적을 받아요. 예정가격 이하에서 가장 경제적인 가격을 낸 곳과 계약해요."
      :(t!=="공사"&&est<2e6?"추정가격 200만 원 미만 물품·용역이라 견적서 제출을 생략할 수 있어요(신용카드 구매 포함). 업체 확인은 그대로 해요."
      :"업체 한 곳에서 견적서를 받아요. 신용도·기술능력·경험을 보고 예정가격 이하로 금액을 협의해 정해요.");
    b.appendChild(el("p","cv-say",say));
    if(two){ var qg=el("div","tkgridf"); b.appendChild(qg); var qc=el("div","cv-calc");
      fld(qg,"안내공고 올린 날",c.qd,function(v){ c.qd=v; put(); qre(); },{type:"date"});
      fld(qg,"견적 마감·개찰일",c.qe,function(v){ c.qe=v; put(); qre(); },{type:"date",hint:"공고일을 넣으면 가장 빠른 날로 채워요"});
      b.appendChild(qc);
      var qre=function(){ var e=quoteOpen(c), bad=c.qe&&e&&c.qe<e;
        nums(qc,[{l:"공고기간",v:"3일 이상",s:"토·공휴일 빼고 · 게시부터 개찰까지 5일 이상"},
          {l:"가장 빠른 개찰일",v:e?kdate(e):"공고일을 넣으면",c:bad?"bad":c.qe?"ok":"",s:bad?"개찰일이 너무 빨라요":e?"견적 마감 "+kdate(workDays(c.qd,3))+" 이후 · 임시공휴일은 직접 빼 주세요":"게시일+3일+개찰일"},
          {l:"낙찰하한율",v:t==="공사"?"89.745%":(est<=2e7?"90%":"88%"),s:(t==="공사"?"(예정가격−A) 대비 (견적가격−A) · A=국민연금보험료 등":"예정가격 대비")+" · 시행령 제30조②"}]); };
      qre(); b.appendChild(el("div","cv-sub","안내공고문에 넣을 것")); noticeFields(c,b,false);
      var qr=el("div","cv-next"), qm=el("div","tkmsg"); b.appendChild(qr); b.appendChild(qm);
      qr.appendChild(btn("안내공고문 초안 한글로","btn ghost",function(){ var H=window.TKHX; if(!H||!H.build){ msg(qm,"한글 만들기 부품을 불러오지 못했어요. 새로고침해 주세요.","warn"); return; }
        saveFile(H.build([{blocks:quoteDoc(c)}],c.name+" 견적제출 안내공고"),c.name+"_견적제출안내공고(초안).hwpx").then(function(){ msg(qm,"안내공고문 초안을 내려받았어요. ○○ 자리를 채워 쓰세요.","ok"); },function(e){ msg(qm,e.message,"warn"); }); })); }
    else b.appendChild(el("p","cv-law","근거: 지방계약법 시행령 제30조, 시행규칙 제33조 · 경남 업무흐름도 '견적서 징구·계약상대자 결정'"));

    bizBox(c,b,"vendor");
    nextBar(b,c,"vendor",state,"업체 정했어요",function(){ if(two&&c.qe&&quoteOpen(c)&&c.qe<quoteOpen(c)) return "견적 공고기간이 모자라요. 개찰일을 "+kdate(quoteOpen(c))+" 이후로 잡아 주세요."; if(!c.biz.bizname) return "업체명을 넣어 주세요."; if(c.ok.san===false||c.ok.nts===false) return "조회 결과 계약할 수 없는 업체예요. 다른 업체를 정해 주세요."; return ""; });
  };
  /* 입찰 2. 공고 */
  STAGE.notice=function(c,b,state){
    var t=tp(c), est=amount(c.est)||0; c.nk=c.nk||{};
    if(c.fails&&c.fails.length) b.appendChild(el("p","cv-say","재공고 "+c.fails.length+"번째예요 (지난 개찰 "+c.fails.map(function(f){ return f.od?kdate(f.od):"-"; }).join(", ")+" 유찰). 예정가격·참가자격은 바꿀 수 없고, 바꾸려면 새로운 입찰로 해요."));
    b.appendChild(el("p","cv-say",(s2bOk(c)?"나라장터(G2B)나 학교장터(S2B)":"나라장터(G2B)")+"에 입찰공고를 올리고 기초금액을 넣어요. 공고일과 마감일을 넣으면 공고기간이 모자라지 않은지 바로 봐요."));
    var g=el("div","tkgridf"); b.appendChild(g); var calc=el("div","cv-calc");
    fld(g,"공고일",c.nd,function(v){ c.nd=v; put(); re(); },{type:"date"});
    fld(g,"입찰 마감·개찰일",c.od,function(v){ c.od=v; put(); re(); },{type:"date",hint:"공고일을 넣으면 가장 빠른 날로 채워요"});
    var uw=el("label","tkf"), ub=el("input"); ub.type="checkbox"; ub.checked=!!c.urg; ub.style.width="auto"; uw.appendChild(el("span","tkfl","긴급·재공고")); var us=el("span"); us.style.display="flex"; us.style.gap="6px"; us.style.alignItems="center"; us.appendChild(ub); us.appendChild(document.createTextNode("5일로 줄여요")); uw.appendChild(us); g.appendChild(uw);
    ub.onchange=function(){ c.urg=ub.checked; prefill(c); put(); view.open="notice"; draw(); };
    b.appendChild(calc); b.appendChild(el("div","cv-sub","공고문에 넣을 것")); noticeFields(c,b,true);
    function re(){ var n=bidDays(c,c.urg), e=bidEarliest(c), bad=c.od&&e&&c.od<e;
      nums(calc,[{l:"공고기간",v:n+"일 이상",s:c.urg?"긴급·재공고":t==="공사"?"공사 추정가격 "+(est<1e9?"10억 원 미만":est<5e9?"10억~50억 원":"50억 원 이상"):"물품·용역"},
        {l:"가장 빠른 마감일",v:e?kdate(e):"공고일을 넣으면",c:bad?"bad":c.od?"ok":"",s:bad?"마감일이 너무 빨라요":"마감 전날부터 거꾸로 "+n+"일 (시행령 제35조)"},
        {l:"기초금액",v:est?comma(Math.round(est*1.1))+"원":"-",s:"추정가격 + 부가세 · 관급자재비 빼고"+(c.od?" · "+kdate(addDays(c.od,-5))+"까지 공개":"")},
        {l:"공고할 곳",v:s2bOk(c)?"G2B 또는 S2B":"G2B",s:s2bOk(c)?"학교장터 한도 안이에요":"학교장터 한도를 넘어요"}]); }
    re();
    b.appendChild(el("div","cv-sub","공고 전후로 할 것"));
    var L=[["n1","발주계획 등록 (G2B)"]];
    if(t!=="공사"&&est>=5e7) L.push(["n2","사전규격 공개","5일(긴급 3일) · 의견이 오면 14일 안에 검토·통지"]);
    L.push(["n3","공고문 작성","낙찰하한율·참가자격(지역제한은 경상남도)·국민연금·건강보험료 사후정산을 적어요 (시행령 제36조)"],["n4","기초금액 입력","공고문 금액과 똑같이"+(t==="공사"?" · A값·순공사원가도":"")],["n5","복수예비가격 15개 작성","기초금액 ±3% 안 · 개찰 때 4개를 뽑아 평균"]);
    if(t==="공사") L.push(["n6","현장설명","필요한 공사만 · 현장설명일 전날부터 7일 전 공고"]);
    ticks(b,L,c.nk);
    var hr=el("div","cv-next"), hm=el("div","tkmsg"); b.appendChild(hr); b.appendChild(hm);
    hr.appendChild(btn("공고문 초안 한글로","btn ghost",function(){ var H=window.TKHX; if(!H||!H.build){ msg(hm,"한글 만들기 부품을 불러오지 못했어요. 새로고침해 주세요.","warn"); return; }
      saveFile(H.build([{blocks:noticeDoc(c)}],c.name+" 입찰공고"),c.name+"_"+(c.fails&&c.fails.length?"재":"")+"입찰공고문(초안).hwpx").then(function(){ msg(hm,"공고문 초안을 내려받았어요. ○○ 자리를 채워 쓰세요.","ok"); },function(e){ msg(hm,e.message,"warn"); }); }));
    b.appendChild(el("p","cv-law","공고를 고치면(정정공고) 남은 기간에 5일 이상을 더해요. 근거: 지방계약법 시행령 제33조~제36조 · 경남 업무흐름도 '견적·입찰 공고'"));
    nextBar(b,c,"notice",state,"공고 올렸어요",function(){ if(!c.nd||!c.od) return "공고일과 마감일을 넣어 주세요."; var e=bidEarliest(c); return c.od<e?"공고기간이 모자라요. 마감일을 "+kdate(e)+" 이후로 잡아 주세요.":""; });
  };
  /* 입찰 3. 개찰·낙찰 */
  STAGE.award=function(c,b,state){
    var t=tp(c), est=amount(c.est)||0, sd=subDays(c);
    b.appendChild(el("p","cv-say","개찰 뒤 예정가격 이하 최저가 업체부터 적격심사 서류를 받아 심사하고, 통과한 업체를 낙찰자로 정해요. 낙찰자를 정하기 전에 자격·부정당제재·참가제한을 꼭 확인해요."));
    var g=el("div","tkgridf"); b.appendChild(g); var calc=el("div","cv-calc");
    fld(g,"개찰일",c.od,function(v){ c.od=v; put(); re(); },{type:"date"});
    fld(g,"적격심사 서류 요구한 날",c.req,function(v){ c.req=v; put(); re(); },{type:"date"});
    fld(g,"서류 받은 날",c.subm,function(v){ c.subm=v; put(); re(); },{type:"date"});
    fld(g,"낙찰 통지한 날",c.awardD,function(v){ c.awardD=v; put(); re(); },{type:"date"});
    fld(g,"낙찰금액 (원)",c.bidAmt?comma(c.bidAmt):"",function(v){ c.bidAmt=num(v); put(); re(); },{num:1,hint:"계약금액으로 넘어가요"});
    if(t==="물품"){ var mw=el("label","tkf"), mb=el("input"); mb.type="checkbox"; mb.checked=!!c.smeg; mb.style.width="auto"; mw.appendChild(el("span","tkfl","중소기업자간 경쟁제품")); var ms=el("span"); ms.style.display="flex"; ms.style.gap="6px"; ms.style.alignItems="center"; ms.appendChild(mb); ms.appendChild(document.createTextNode("계약이행능력심사")); mw.appendChild(ms); g.appendChild(mw); mb.onchange=function(){ c.smeg=mb.checked; put(); re(); }; }
    b.appendChild(calc);
    function re(){ var fr=floorRate(c), sdue=c.req?addDays(c.req,sd):"", jdue=c.subm?addDays(c.subm,7):"", cdue=c.awardD?addDays(c.awardD,10):"";
      nums(calc,[fr?{l:"낙찰하한율",v:fr+"%",s:frBase(c)+" · "+(t==="물품"?(c.smeg?frNote(c):"적격심사 · 고시금액(2.3억 원) "+(est<GOSI?"미만":"이상")):t==="용역"?"경상남도 일반용역 적격심사 세부기준":"적격심사")}:null,
        {l:"서류 제출 기한",v:sdue?kdate(sdue):sd+"일 안",s:sd+"일 · "+(t==="공사"?(sd===15?"30억~100억 원 공사":"공사"):t==="용역"?"용역":"물품 · 고시금액(2.3억 원) "+(est>=GOSI?"이상":"미만"))},
        {l:"심사 기한",v:jdue?kdate(jdue):"서류 받은 날부터 7일",s:"3일 늘릴 수 있어요 · 보완요구는 1번, 7일 안"},
        {l:"계약 기한",v:cdue?kdate(cdue):"낙찰 통지 후 10일",c:cdue?ddCls(dday(cdue)):"",s:cdue?ddTxt(dday(cdue)):"계약을 안 하면 보증금 귀속"}]); }
    re();
    b.appendChild(el("div","cv-sub","낙찰자"));
    bizBox(c,b,"award");
    b.appendChild(el("p","cv-law","같은 값이 2곳 이상이면 심사 점수가 높은 곳, 점수도 같으면 추첨. 부적격이면 다음 순위를 심사해요. 재심사 요청은 통보일부터 3일 안, 5일 안에 재심사. 근거: 지방계약법 시행령 제40조·제42조, 지방자치단체 입찰시 낙찰자 결정기준 · 경남 업무흐름도 '개찰', '적격심사·낙찰자 결정'"));
    if(state!=="done"){ var fr2=el("div","cv-next"); b.appendChild(fr2);
      fr2.appendChild(btn("유찰 · 재공고하기","btn ghost",function(){ if(!confirm("유찰로 기록하고 공고 단계를 재공고(5일)로 다시 열까요?")) return;
        c.fails=c.fails||[]; c.fails.push({nd:c.nd||"",od:c.od||"",at:today()}); c.urg=true; ["nd","od","req","subm","awardD"].forEach(function(k){ delete c[k]; }); c.nk={}; reopen(c,"notice"); })); }
    nextBar(b,c,"award",state,"낙찰자 정했어요",function(){ if(!c.biz.bizname) return "낙찰자 업체명을 넣어 주세요."; if(c.ok.san===false||c.ok.nts===false) return "조회 결과 계약할 수 없는 업체예요. 다음 순위를 심사해 주세요."; if(!c.awardD) return "낙찰 통지한 날을 넣어 주세요."; if(c.bidAmt&&!c.amount) c.amount=c.bidAmt, c.guar=Math.floor(c.bidAmt*0.1); return ""; });
  };
  /* 3. 계약 맺기 */
  STAGE.sign=function(c,b,state){
    var t=tp(c);
    b.appendChild(el("p","cv-say",(isBid(c)?"낙찰 통지 후 10일 안에 계약해요. ":"")+"계약금액과 기간을 넣으면 보증금·인지세·계약서 생략 여부를 바로 계산해요. 업체가 서명할 각서·서약서는 아래에서 엑셀로 만들어요."));
    var g=el("div","tkgridf"); b.appendChild(g); var calc=el("div","cv-calc");
    fld(g,"계약금액 (부가세 포함, 원)",c.amount?comma(c.amount):"",function(v){ c.amount=num(v); c.guar=Math.floor(c.amount*0.1); if(gi) gi.value=comma(c.guar); hz(); put(); re(); },{num:1});
    var gi=fld(g,"계약보증금 (원)",c.guar?comma(c.guar):"",function(v){ c.guar=num(v); put(); re(); },{num:1,hint:"계약금액의 10%로 채워요"});
    fld(g,"계약일",c.d1,function(v){ c.d1=v; put(); },{type:"date"});
    fld(g,t==="물품"?"납품 시작일":t==="공사"?"착공일":"착수일",c.d2,function(v){ c.d2=v; put(); },{type:"date"});
    fld(g,t==="물품"?"납품 기한":"완료(준공) 기한",c.d3,function(v){ c.d3=v; put(); },{type:"date"});
    if(t==="공사"){
      var gw=el("label","tkf"), gs=el("select"), sw=el("label","tkf wide"), ss=el("select"); gw.appendChild(el("span","tkfl","공종")); gw.appendChild(gs); sw.appendChild(el("span","tkfl","세부종목 (하자기간·보증금률이 정해져요)")); sw.appendChild(ss); g.appendChild(gw); g.appendChild(sw);
      var GG=[]; D.RP.forEach(function(r){ if(GG.indexOf(r["공종"])<0) GG.push(r["공종"]); }); GG.forEach(function(x){ var o=el("option",null,x); o.value=x; gs.appendChild(o); }); if(c.gong) gs.value=c.gong;
      var fillS=function(){ ss.textContent=""; D.RP.filter(function(r){ return r["공종"]===gs.value; }).forEach(function(r){ var o=el("option",null,r["세부종목"]+" — "+r["하자기간"]+", "+(parseFloat(r["보증률"])*100)+"%"); o.value=r["세부종목"]; ss.appendChild(o); }); if(c.sebu) ss.value=c.sebu; hz(); };
      gs.onchange=function(){ c.sebu=""; fillS(); put(); re(); }; ss.onchange=function(){ hz(); put(); re(); };
    }
    function hz(){ if(t!=="공사"||!gs) return; c.gong=gs.value; c.sebu=ss.value; var r=null; D.RP.forEach(function(x){ if(x["공종"]===c.gong&&x["세부종목"]===c.sebu) r=x; }); c.hajaP=r?r["하자기간"]:""; c.rate=r?parseFloat(r["보증률"]):0; c.hajaG=c.amount&&r?Math.floor(c.amount*c.rate):0; }
    if(t==="공사") fillS();
    b.appendChild(calc);
    function re(){ var a=c.amount||0; if(!a){ nums(calc,[{l:"계약금액을 넣으면",v:"계산해요",c:""}]); return; }
      var paper=a>5e7, st=stamp(a), exempt=t==="공사"&&a<=3e7&&!/조경/.test(c.sebu||"");
      nums(calc,[{l:"계약금액",v:won(a),s:hanAmt(a)},{l:"계약보증금",v:c.guar?comma(c.guar)+"원":"-",s:"계약금액의 10% 이상 (시행령 제51조)"},
        {l:"계약서",v:paper?"작성해요":"생략할 수 있어요",c:paper?"":"ok",s:paper?"5천만 원 초과":"5천만 원 이하 · 청구서·각서 등 증거 서류는 받아요 (시행령 제50조)"},
        st?(t==="물품"?{l:"인지세",v:"단순구매 비과세",c:"ok",s:"제조 계약이면 "+comma(st)+"원 · 인지세법 제3조, 편람 p.54"}:{l:"인지세",v:comma(st)+"원",s:"1천만 원 초과 공사·용역 · 인지세법 제3조, 편람 p.54"}):{l:"인지세",v:"없어요",c:"ok",s:"1천만 원 이하"},
        t==="공사"?{l:"하자보수보증금",v:exempt?"면제할 수 있어요":(c.hajaG?comma(c.hajaG)+"원":"-"),c:exempt?"ok":"",s:exempt?"3천만 원 이하 공사(조경 제외) · 지급확약서(각서)는 받아요 (시행규칙 제70조)":(c.hajaP?c.hajaP+" · "+(c.rate*100)+"% (시행규칙 제68조·제70조)":"")}:null]); }
    re();

    /* 서류 */
    b.appendChild(el("div","cv-sub","업체에 받을 서류 (엑셀)"));
    var modeW=el("div","cv-chips"); b.appendChild(modeW); c.mode=c.mode||"full";
    [["full","서류별로 (일반)"],["simple","한 장으로 (1인 수의계약 통합서약서)"]].forEach(function(o){ var p=btn(o[1],"pill",function(){ c.mode=o[0]; put(); modeW.querySelectorAll(".pill").forEach(function(x){ x.setAttribute("aria-pressed",x===p?"true":"false"); }); dl(); }); p.setAttribute("aria-pressed",c.mode===o[0]?"true":"false"); modeW.appendChild(p); });
    var bid=isBid(c), BS=bid?BASE.filter(function(x){ return !/^0[23]/.test(x[0]); }):BASE; if(bid){ c.mode="full"; modeW.hidden=true; }
    var dbox=el("div"); b.appendChild(dbox); c.other=c.other||{}; c.safe=c.safe||{};
    function dl(){ dbox.textContent=""; var simple=c.mode==="simple";
      dbox.appendChild(el("p","cv-law",simple?"늘 들어가요: 1인 수의계약 통합서약서(각서·서약서를 한 장에)":"늘 들어가요: "+BS.map(function(x){return x[1]}).concat(t==="공사"?["부실공사 근절 서약서"]:[]).join(" · ")));
      var def=OTHER_DEF[t]; var opt=OTHER.map(function(x,i){ if(c.other[x[0]]==null) c.other[x[0]]=!!def[i]; return [x[0],x[1]]; });
      ticks(dbox,opt,c.other); if(t==="공사"){ dbox.appendChild(el("p","cv-law","작업이 있으면 안전보건 점검표도 넣어요:")); ticks(dbox,SAFE,c.safe); } }
    dl();
    var mr=el("div","cv-next"); b.appendChild(mr); var mm=el("div","tkmsg"); b.appendChild(mm);
    mr.appendChild(btn(c.docs?"서류 다시 만들기":"서류 엑셀 만들기",c.docs?"btn ghost":"btn",function(){
      var sc=LS.get("school",""), why=!sc?"목록 맨 위에 학교명을 먼저 넣어 주세요.":!c.biz.bizname?(bid?"'낙찰'에서 낙찰자를 먼저 정해 주세요.":"2단계에서 업체를 먼저 정해 주세요."):!c.amount?"계약금액을 넣어 주세요.":(!c.d1||!c.d2||!c.d3)?"계약일과 기간을 모두 넣어 주세요.":c.d3<c.d2?"기한이 시작일보다 빨라요.":"";
      if(why){ msg(mm,why,"warn"); return; }
      var law=c.m&&c.m.law||"「지방자치단체를 당사자로 하는 계약에 관한 법률 시행령」 제25조", z=c.biz, o=z.officeType||officeOf(z.bizno)||"개인";
      var rep={"[[계약건명]":c.name,"[사업자등록번호]":bizfmt(z.bizno),"[biznum2]":bizfmt(z.bizno),"[업체명]":z.bizname,"[주소]":z.bizaddr||"","[전화번호]":z.biztel||"","[대표자]":z.bizceo||"","[학교명]":sc,
        "[계약건명]":c.name,"[계약금액한글]":hanAmt(c.amount),"[계약금액]":comma(c.amount),"[계약보증금액한글]":hanAmt(c.guar),"[계약보증금액]":comma(c.guar),
        "[계약일]":kdate(c.d1),"[시작일]":kdate(c.d2),"[완료일]":kdate(c.d3),"[업태]":z.biztype||"","[업종]":z.bizitem||"","[계약종류]":t,"[업체종류]":o,
        "[근거법령]":law,"[공종]":t==="공사"?c.gong:"","[세부종목]":t==="공사"?c.sebu:"","[하자기간]":t==="공사"?c.hajaP:""};
      var yn="[√] 예 [ ] 아니오", n2="[ ] 예 [ ] 아니오", na3="[ ] 예 [ ] 아니오 [√] 해당없음", y3="[√] 예 [ ] 아니오 [ ] 해당없음";
      var cells={"03수의계약체결제한여부확인서":{J5:t==="공사"?"[√] 공사 [ ] 용역":t==="용역"?"[ ] 공사 [√] 용역":"[ ] 공사 [ ] 용역",J6:t==="물품"?"[√] 물품 [ ] 기타":"[ ] 물품 [ ] 기타",
          K9:o==="개인"?"[√] 개인 [ ] 법인":o==="법인"?"[ ] 개인 [√] 법인":"[ ] 개인 [ ] 법인",K10:o==="단체"?"[√] 단체 [ ] 기타":o==="기타"?"[ ] 단체 [√] 기타":"[ ] 단체 [ ] 기타"},
        "간소화":t==="공사"?{G27:yn,G28:"[ ] 해당없음",G29:y3,G30:y3,G31:yn,G32:"[ ] 해당없음"}:t==="용역"?{G27:n2,G28:"[√] 해당없음",G29:y3,G30:na3,G31:yn,G32:"[ ] 해당없음"}:{G27:n2,G28:"[√] 해당없음",G29:na3,G30:na3,G31:n2,G32:"[√] 해당없음"}};
      var other=OTHER.filter(function(x){ return c.other[x[0]]; }).map(function(x){ return x[0]; }), safe=t==="공사"?SAFE.filter(function(x){ return c.safe[x[0]]; }).map(function(x){ return x[0]; }):[];
      var keep=c.mode==="simple"?["간소화","08-1안전보건점검표"].concat(other.indexOf("09안전보건관리계획서")>=0?["09안전보건관리계획서"]:[],safe):BS.map(function(x){return x[0]}).concat(t==="공사"?["부실공사근절서약서"]:[],other,safe);
      msg(mm,"만드는 중…","ok");
      fillBook(D.DS,rep,cells,keep,c.name+(bid?"_계약서류.xlsx":"_수의계약서류.xlsx")).then(function(){ c.docs=today(); if(z.bizno){ var m=LS.get("biz",{}); m[z.bizno]={bizname:z.bizname,bizceo:z.bizceo,biztel:z.biztel,bizaddr:z.bizaddr,biztype:z.biztype,bizitem:z.bizitem,officeType:o}; LS.set("biz",m); } put();
        msg(mm,"서류 "+keep.length+"종을 내려받았어요. 업체 서명·날인을 받으면 '계약 맺었어요'를 눌러요.","ok"); },function(e){ msg(mm,"만들지 못했어요: "+e.message,"bad"); });
    }));
    nextBar(b,c,"sign",state,"계약 맺었어요",function(){ return !c.amount?"계약금액을 넣어 주세요.":(!c.d1||!c.d3)?"계약일과 기한을 넣어 주세요.":t==="공사"&&!c.hajaP?"세부종목을 골라 주세요.":""; });
  };
  /* 4. 착공·착수 */
  STAGE.work=function(c,b,state){
    var t=tp(c), a=c.amount||0; c.recv=c.recv||{};
    b.appendChild(el("p","cv-say",t==="공사"?"업체에서 착공 서류를 받아요. 금액·기간에 따라 필요한 것만 골라 두었어요.":"업체에서 착수 서류를 받아요."));
    var days=c.d2&&c.d3?Math.round((ymd(c.d3)-ymd(c.d2))/864e5)+1:0;
    var L=t==="공사"?[["w1","착공신고서"],["w2","건설기술인 선임계","재직증명서·자격증 사본·경력증명서"],["w3","공사공정예정표"],["w4","안전·환경·품질관리계획서"],["w5","착공 전 현장사진"],["w6","공사원가 산출내역서"],["w7","고용·산재보험 가입증명원","공사명·기간 확인, 총공사금액은 부가세 뺀 금액"],["w8","노무비 구분관리·지급확인제 합의서 또는 적용 제외 신고서"]]
      :[["s1","용역공정예정표"],["s2","산출내역서"],["s3","인력·장비 투입계획서"]];
    if(t==="공사"&&a>=2e7) L.push(["w9","산업안전보건관리비 사용계획서","총공사금액 2천만 원 이상"]);
    if(t==="공사"&&a>=4e7&&days>=30&&c.kind!=="c2") L.push(["w10","직접시공계획 통보서","도급금액 4천만 원 이상 · 공사기간 30일 이상 (전문공사 제외)"]);
    if(t==="공사"&&c.kind==="c3") L.push(["w11","시공관리책임자 지정통보서","전기공사"]);
    ticks(b,L,c.recv);
    b.appendChild(el("p","cv-law","선금: 업체가 신청하면 최초 선금은 계약금액의 30%를 의무로 줘요"+(a?"("+comma(Math.floor(a*0.3))+"원)":"")+". 그보다 많이 신청하면 불가피할 때 70%"+(a?"("+comma(Math.floor(a*0.7))+"원)":"")+"까지 줄 수 있어요. 업체가 신청하지 않으면 강제하지 않고, 물품 구매는 대상이 아니에요. 근거: 지방회계법 제35조·시행령 제44조, 계약집행기준 제1장 제2절 · 2026 계약실무편람 '선금지급'"));
    nextBar(b,c,"work",state,"서류 받았어요",function(){ return ""; });
  };
  /* 5. 검사 */
  STAGE.check=function(c,b,state){
    var t=tp(c);
    b.appendChild(el("p","cv-say","업체가 다 끝냈다고 알려 오면 그날부터 14일 안에 검사해요. 늦게 끝났으면 지연배상금을 계산해요."));
    var g=el("div","tkgridf"); b.appendChild(g); var calc=el("div","cv-calc");
    fld(g,"이행 완료 통지 받은 날",c.notice,function(v){ c.notice=v; put(); re(); },{type:"date"});
    fld(g,"실제로 끝난 날",c.fin,function(v){ c.fin=v; put(); re(); },{type:"date",hint:"기한("+(c.d3?kdate(c.d3):"-")+")보다 늦으면 지연배상금"});
    fld(g,"검사한 날",c.insp,function(v){ c.insp=v; put(); re(); },{type:"date"});
    b.appendChild(calc);
    function re(){ var due=c.notice?addDays(c.notice,14):"", late=c.fin&&c.d3?Math.round((ymd(c.fin)-ymd(c.d3))/864e5):0, rate=DELAY[t];
      nums(calc,[due?{l:"검사 기한",v:kdate(due),c:c.insp?(c.insp<=due?"ok":"bad"):ddCls(dday(due))==="late"?"bad":"",s:c.insp?(c.insp<=due?"기한 안에 검사했어요":"기한을 넘겨 검사했어요"):ddTxt(dday(due))}:{l:"검사 기한",v:"통지일을 넣으면",s:"통지받은 날부터 14일 안"},
        late>0?{l:"지연배상금",v:comma(Math.floor((c.amount||0)*rate*late))+"원",c:"warn",s:late+"일 늦음 × 계약금액 × "+(rate*1000)+"/1000"}:{l:"지연",v:c.fin?"없어요":"-",c:c.fin?"ok":""}]); }
    re();
    b.appendChild(el("div","cv-sub","받을 서류"));
    c.recv2=c.recv2||{};
    ticks(b,t==="공사"?[["k1","준공계·준공검사원"],["k2","준공사진"],["k3","산업안전보건관리비 사용내역서"],["k4","고용·산재보험 완납증명서"],["k5","건강보험·국민연금 납부영수증","1개월 이상 공사"],["k6","환경관리비 사용내역서"],["k7","주요 자재 시험성적서","어린이활동공간 사전확인 대상일 때"]]
      :[["k1",t==="물품"?"납품계(거래명세서)":"완료계"],["k2","결과물·납품 사진"],["k7","시험성적서","어린이 사용 제품 등 필요할 때"]],c.recv2);
    b.appendChild(el("p","cv-law","잘못된 곳이 있으면 고치게 하고, 고쳤다고 알려 온 날부터 14일 안에 다시 검사해요. 근거: 지방계약법 제17조, 경남 업무흐름도 '준공(납품)·검사'"));
    nextBar(b,c,"check",state,"검사 마쳤어요",function(){ return c.insp?"":"검사한 날을 넣어 주세요."; });
  };
  /* 6. 대금 지급 */
  STAGE.pay=function(c,b,state){
    var t=tp(c), a=c.amount||0; c.payok=c.payok||{};
    b.appendChild(el("p","cv-say","업체의 대금 청구를 받은 날부터 5일 안에 줘요. 첫날과 토요일·공휴일은 세지 않아요."));
    var g=el("div","tkgridf"); b.appendChild(g); var calc=el("div","cv-calc");
    fld(g,"청구 받은 날",c.claim,function(v){ c.claim=v; put(); re(); },{type:"date"});
    fld(g,"지급한 날",c.paid,function(v){ c.paid=v; put(); re(); },{type:"date"});
    b.appendChild(calc);
    function re(){ var due=c.claim?workDays(c.claim,5):""; nums(calc,[due?{l:"지급 기한",v:kdate(due),c:c.paid?(c.paid<=due?"ok":"bad"):ddCls(dday(due))==="late"?"bad":"",s:c.paid?(c.paid<=due?"기한 안에 줬어요":"기한을 넘겼어요"):ddTxt(dday(due))+" · 임시공휴일은 직접 빼 주세요"}:{l:"지급 기한",v:"청구일을 넣으면",s:"청구받은 날부터 5일(근무일)"}]); }
    re();
    b.appendChild(el("div","cv-sub","확인할 서류"));
    var exempt=t==="공사"&&a<=3e7&&!/조경/.test(c.sebu||"");
    var L=[["p1","세금계산서·대금청구서"],["p2","통장 사본"],["p3","국세·지방세 납부증명서"],["p4","4대보험 완납증명서"]];
    if(t==="공사") L.push(["p5",exempt?"하자보수 지급확약서(각서)":"하자보수보증금 납부서 또는 보증서",exempt?"3천만 원 이하 공사라 보증금은 면제":"보증 시작일은 준공검사일"],["p6","산업안전보건관리비·환경보전비 정산서"],["p7","폐기물 처리 증빙","5톤 미만 계량증명서, 5톤 이상 올바로시스템 실적"]);
    if(t==="공사"&&a>=15e6) L.push(["p8","전기·수도 사용료 징수","공사금액 1,500만 원 이상"]);
    ticks(b,L,c.payok);
    b.appendChild(el("p","cv-law","정산으로 금액이 바뀌면 변경계약을 먼저 해요. 근거: 지방계약법 시행령 제67조~제72조, 경남 업무흐름도 '대가지급'"));
    nextBar(b,c,"pay",state,t==="공사"?"대금 줬어요 · 하자 관리로":"대금 줬어요 · 계약 끝",function(){ return c.paid?"":"지급한 날을 넣어 주세요."; });
  };
  /* 7. 하자 관리 */
  STAGE.haja=function(c,b,state){
    c.hj=c.hj&&!Array.isArray(c.hj)?c.hj:{};
    var e=hajaEnd(c);
    b.appendChild(el("p","cv-say","하자담보책임기간("+(c.hajaP||"-")+") 동안 1년에 2번 이상 검사하고, 끝나기 14일 전부터 최종검사를 해요. 검사한 날을 넣고 하자검사조서를 만들어요."));
    var calc=el("div","cv-calc"); b.appendChild(calc);
    nums(calc,[{l:"준공(검사)일",v:c.insp?kdate(c.insp):(c.d3?kdate(c.d3)+" (기한)":"-")},{l:"하자 만료일",v:e?kdate(iso(e)):"-",s:e?ddTxt(dday(iso(e))):""},{l:"하자보수보증금",v:c.hajaG?comma(c.hajaG)+"원":"면제 또는 -"}]);
    var hs=halves(c), box=el("div","cv-half"); b.appendChild(box); var hm=el("div","tkmsg");
    hs.forEach(function(h){ var r=el("div","cv-hrow"); r.appendChild(el("b",null,h.t)); r.appendChild(el("span","cv-law",kdate(h.from)+" ~ "+kdate(h.to)));
      var sp=el("span","sp"); r.appendChild(sp); var di=el("input"); di.type="date"; di.value=c.hj[h.k]||""; di.title="검사한 날"; r.appendChild(di);
      di.onchange=function(){ c.hj[h.k]=di.value; put(); };
      r.appendChild(btn("조서","pill",function(){ var d=di.value||today(); var rep={"[계약건명]":c.name,"[업체명]":c.biz.bizname||"","[사업자번호]":bizfmt(c.biz.bizno),"[계약금액]":comma(c.amount),"[하자보증금액]":comma(c.hajaG),"[계약일]":kdate(c.d1),"[착공일]":kdate(c.d2),
          "[완료일]":kdate(c.d3),"[준공일]":kdate(c.insp||c.d3),"[공종]":c.gong||"","[세부종목]":c.sebu||"","[하자기간]":c.hajaP||"","[검사일]":kdate(d),"[하자만료일]":kdate(iso(e)),"[검사구분]":h.k==="final"?"최종검사":"정기검사","[학교명]":LS.get("school","")};
        fillBook(D.HJ,rep,{},null,c.name+"_하자검사조서_"+d+".xlsx").then(function(){ msg(hm,h.t+" 하자검사조서를 내려받았어요.","ok"); },function(er){ msg(hm,"만들지 못했어요: "+er.message,"bad"); }); }));
      box.appendChild(r); });
    b.appendChild(hm);
    b.appendChild(el("p","cv-law","근거: 지방계약법 시행령 제70조~제72조, 시행규칙 제68조~제71조 · 경남 업무흐름도 '하자보수·하자검사'"));
    nextBar(b,c,"haja",state,"하자 기간 끝 · 보증금 돌려주기",function(){ return c.hj.final?"":"최종검사한 날을 넣어 주세요."; });
  };

  draw();
}
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.ct=build;
/* 다른 도구(교복 등)가 같이 쓰는 부품 */
/* 장부 카드 오른쪽 위 X: 누르면 묻고 지움 */
function delX(card,name,fn){ var x=document.createElement("span"); x.className="cv-del"; x.textContent="\u00d7"; x.setAttribute("role","button"); x.tabIndex=0; x.title="지우기"; x.setAttribute("aria-label","'"+name+"' 지우기");
  function go(e){ e.stopPropagation(); e.preventDefault(); if(confirm("'"+name+"'을(를) 목록에서 지울까요?")) fn(); }
  x.onclick=go; x.onkeydown=function(e){ if(e.key==="Enter"||e.key===" ") go(e); }; card.classList.add("hasdel"); card.appendChild(x); return x; }
window.TKCV={CSS:CSS,delX:delX,unzip:unzip,zipStore:zipStore,saveFile:saveFile,workDays:workDays,addDays:addDays,hanNum:hanNum};
})();
