/* ======================================================================
   교복 구매 — 경남 기준으로 처음부터 다시 만든 도구
   한 학년도 신입생 교복 구매를 아홉 단계(좌→우)로 따라간다.
     위원회 → 계획 → 기초금액 → 입찰 → 평가 → 계약 → 안내·치수 → 납품·검사 → 지급·평가
   단계마다 그때 넣을 값만 묻고, 기준(위원 구성·상한가격·단가 비율·공고 기간·납품 40일·검사 14일·지급 5일)을
   바로 계산해 보여 주며, 그 값으로 기안문을 채우고 붙임 서식(hwpx)도 채워서 내려받는다.
   기준
   - 경상남도교육청 「교복 학교주관구매 길라잡이」(2026. 6. 개정) = 업무체크리스트 '교복 구매'(gys_7_10)
   - 체육예술건강과-6509(2026. 6. 2.) 상한가격(동복 246,020원·하복 97,605원)·품목별 단가 비율·2026 주요 유의사항
   - 지방계약법 시행령 제42조(낙찰자 결정), 제18조(2단계 입찰), 제32조의2(사전규격)
   저장: gb.p (localStorage)
   ====================================================================== */
(function(){ "use strict";
var U=function(){ return window.TKCV||{}; };
function el(t,c,x){var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e}
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
        set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var WD="일월화수목금토";
function num(v){ var s=String(v==null?"":v).replace(/[^\d.-]/g,""); if(!s) return null; var n=Number(s); return isFinite(n)?n:null; }
function comma(n){ return n==null||n===""?"":Math.round(n).toLocaleString("ko-KR"); }
function pd(v){ var m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(v||"").trim()); return m?new Date(+m[1],+m[2]-1,+m[3]):null; }
function iso(d){ return d?d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2):""; }
function dot(v,noYear){ var d=pd(v); return d?(noYear?"":d.getFullYear()+". ")+(d.getMonth()+1)+". "+d.getDate()+".":""; }
function dotw(v,noYear){ var d=pd(v); return d?dot(v,noYear)+"("+WD[d.getDay()]+")":""; }
function addDays(s,n){ var d=pd(s); if(!d) return ""; d.setDate(d.getDate()+n); return iso(d); }
function diff(a,b){ var x=pd(a), y=pd(b); return x&&y?Math.round((y-x)/864e5):null; }
function today(){ return iso(new Date()); }
function dday(s){ return diff(today(),s); }
function ddTxt(n){ return n==null?"":n===0?"오늘":n>0?"D-"+n:(-n)+"일 지남"; }
function won(n){ return n==null?"-":comma(n)+"원"; }
function man(n){ if(n==null) return "-"; return n>=1e8?(Math.floor(n/1e8)+"억"+(Math.round(n%1e8/1e4)?" "+comma(Math.round(n%1e8/1e4))+"만":"")+" 원"):n>=1e4?comma(Math.round(n/1e4))+"만 원":comma(n)+" 원"; }
function han(n){ var f=U().hanNum; return n?(f?f(n):String(n)):""; }

/* 경남 기준값 — 체육예술건강과-6509(2026. 6. 2.), 적용 2026. 6. 2.~2027. 3. 31. */
var CAP={w:246020,s:97605};
var RATIO=[["w1","동복","블라우스·셔츠",.20],["w2","동복","조끼·니트",.25],["w3","동복","치마·바지",.30],["s1","하복","상의",.47]];
var GN="경상남도교육청 체육예술건강과-6509(2026. 6. 2.)";

/* ---------- 붙임 서식(누리집 tools/gb/ 폴더) ---------- */
var FILES={
  "step1":["step1-committee.hwpx","교복선정위원회 규정 및 명단.hwpx"],
  "01-1":["chuk-01-1.hwpx","교복선정위원회 위원 수락 및 확인서.hwpx"],
  "01-2":["chuk-01-2.hwpx","교복선정위원회 위원 청렴 및 보안 서약서.hwpx"],
  "02-1":["chuk-02-1.hwpx","교복 학교주관구매 계획(안).hwpx"],
  "02-2":["chuk-02-2.hwpx","품목별 단가 비율표 및 기초금액 산정 절차.hwpx"],
  "02-2-1":["chuk-02-2-1.hwpx","교복 견적 의뢰서.hwpx"],
  "02-2-2":["chuk-02-2-2.hwpx","교복 기초금액 산출조서.hwpx"],
  "02-2-3":["chuk-02-2-3.hwpx","품목별 단가 비율표 산정.hwpx"],
  "03-1":["chuk-03-1.hwpx","구매 계획 학교운영위원회 심의(안).hwpx"],
  "04-1":["chuk-04-1.hwpx","교복 사양서.hwpx"],
  "07":["chuk-07.hwpx","입찰 공고문.hwpx"],
  "07-01":["chuk-07-01.hwpx","계약 특수조건.hwpx"],
  "07-02":["chuk-07-02.hwpx","교복 디자인 및 규격서.hwpx"],
  "07-03":["chuk-07-03.hwpx","제안서 평가항목 및 배점기준.hwpx"],
  "07-04":["chuk-07-04.hwpx","[1단계] 정량적 평가.hwpx"],
  "07-05":["chuk-07-05.hwpx","[2단계] 정성적 평가.hwpx"],
  "07-06":["chuk-07-06.hwpx","제출서류 자기확인서.hwpx"],
  "07-07":["chuk-07-07.hwpx","입찰 참가 신청서.hwpx"],
  "07-08":["chuk-07-08.hwpx","입찰 참가 신고서.hwpx"],
  "07-09":["chuk-07-09.hwpx","교복(동·하복) 납품 제안서.hwpx"],
  "07-10":["chuk-07-10.hwpx","교복 납품 실적표.hwpx"],
  "07-11":["chuk-07-11.hwpx","납품 교복 제조 사양서.hwpx"],
  "07-12":["chuk-07-12.hwpx","품목별 단가 비율표.hwpx"],
  "07-13":["chuk-07-13.hwpx","참고 품목별 단가 비율표 기준.hwpx"],
  "07-14":["chuk-07-14.hwpx","교복 AS 계획서.hwpx"],
  "07-15":["chuk-07-15.hwpx","소비자 불만 사항 처리 계획.hwpx"],
  "07-16":["chuk-07-16.hwpx","위임장.hwpx"],
  "07-17":["chuk-07-17.hwpx","개인정보제공 동의서.hwpx"],
  "07-18":["chuk-07-18.hwpx","청렴계약 이행서약서.hwpx"],
  "07-19":["chuk-07-19.hwpx","품목별 금액표.hwpx"],
  "08-1":["chuk-08-1.hwpx","제안서 접수대장.hwpx"],
  "11-1":["chuk-11-1.hwpx","평가위원회 참석 등록부.hwpx"],
  "11-2":["chuk-11-2.hwpx","업체별 제안서 집계표.hwpx"],
  "11-3":["chuk-11-3.hwpx","평가위원 청렴 및 보안 서약서.hwpx"],
  "15-1":["chuk-15-1.hwpx","교복 지원 사전 안내.hwpx"],
  "16-1":["chuk-16-1.hwpx","교복 지원 안내문.hwpx"],
  "16-2":["chuk-16-2.hwpx","수요조사(교복 신청 수량).hwpx"],
  "17-1":["chuk-17-1.hwpx","만족도 조사 설문지.hwpx"],
  "18-1":["chuk-18-1.hwpx","만족도 조사 설문 결과.hwpx"],
  "xls":["step3-base-price.xlsx","기초금액 산출표.xlsx"],
  "g00":["gn/00. 업무흐름도-교복구매.hwp","업무흐름도(교복 구매).hwp"],
  "g01":["gn/01. 2026학년도 중·고등학교 신입생 교복 지원 계획.hwpx","2026학년도 신입생 교복 지원 계획.hwpx"],
  "g03":["gn/03. 2026학년도 신입생 체육복 구입비 지원 계획.hwp","2026학년도 신입생 체육복 구입비 지원 계획.hwp"],
  "g04":["gn/04. 2026. 학교주관구매 교복 품질검사 실시 계획.hwp","2026 교복 품질검사 실시 계획.hwp"],
  "g05":["gn/05. 신입생 교복비 납부(징수)에 대한 가정통신문.hwp","교복비 납부(징수) 가정통신문.hwp"],
  "g06":["gn/06. 교복 학교주관구매 계획(예시).hwp","교복 학교주관구매 계획(예시).hwp"],
  "g07":["gn/07. 2026년 교복 학교주관구매 시 주요 유의사항(체육예술건강과).hwp","2026 교복 학교주관구매 주요 유의사항.hwp"],
  "g08":["gn/08. 교복 납품 제안서(예시).hwpx","교복 납품 제안서(예시).hwpx"],
  "g09":["gn/09. 교복선정위원회(규격 및 기술평가위원회) 회의록(예시).hwp","교복선정위원회 회의록(예시).hwp"],
  "g10":["gn/10. 교복선정위원회 위원 수락 및 확인서(예시).hwp","위원 수락 및 확인서(예시).hwp"],
  "g11":["gn/11. 교복 디자인 사양서(예시).hwp","교복 디자인 사양서(예시).hwp"],
  "g12":["gn/12. 신입생 교복 학교주관구매 안내 가정통신문(예시).hwp","학교주관구매 안내 가정통신문(예시).hwp"],
  "g13":["gn/13. 교복 디자인 선정(변경) 절차 안내.hwpx","교복 디자인 선정(변경) 절차 안내.hwpx"]
};
var GNDOCS=["g00","g01","g07","g13","g04","g03"];

/* ---------- 단계 ---------- */
var STAGES=[
  ["com","위원회","교복선정위원회 구성","3~4월"],
  ["plan","계획","구매 계획·학운위 심의","4~5월"],
  ["price","금액","견적·기초금액 산출","입찰 전"],
  ["bid","입찰","사전규격·입찰 공고","6~7월"],
  ["eval","평가","제안서 평가","공고 마감 후"],
  ["con","계약","낙찰·단가계약","8월 말까지"],
  ["size","치수","안내·수요조사·치수 측정","12~2월"],
  ["deliv","납품","납품·검사·검수","2~5월"],
  ["pay","지급","대금 지급·품질검사·만족도","검수 후"]
];

/* ---------- 기안문 ({키|예시} 자리는 넣은 값으로 바뀐다) ---------- */
var CARDS=[
 {st:"com",who:"교무",key:"committee",t:"{year|2027}학년도 교복선정위원회 구성",
  b:"1. 관련: 「교복 학교주관구매 길라잡이」(경상남도교육청, 2026. 6.)\n2. {year|2027}학년도 교복 학교주관구매 추진을 위한 교복선정위원회를 아래와 같이 구성하고자 합니다.\n  가. 구성: 총 {cnt:|○}명(교원 {cnt:교원|○}명, 학교운영위원 {cnt:학교운영위원|○}명, 학부모 {cnt:학부모|○}명, 학생 {cnt:학생|○}명)\n  나. 위원장: {chair|○○ ○○○}\n  다. 위원: {memAll|○○ ○○○, ○○ ○○○}\n  라. 역할: 교복 디자인·사양 선정, 품질 심사 기준 설정 및 제안서 정성평가, 제작 상황 감독, 구매 결과 평가\n  마. 위원 전원 수락 및 확인서, 청렴 및 보안 서약서 징구\n\n붙임  1. {year|2027}학년도 교복선정위원회 규정 및 명단 1부.\n      2. 위원 수락 및 확인서, 청렴 및 보안 서약서 각 1부.  끝.",
  f:["step1","01-1","01-2","g10"]},
 {st:"com",who:"교무",key:"meeting",t:"{year|2027}학년도 교복 적격업체 선정 평가기준 및 사양서 결정 회의 개최",
  b:"1. 관련: {rel:committee|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 교복 학교주관구매 적격업체 선정 평가기준 및 교복 사양서 결정을 위한 교복선정위원회 회의를 실시하고자 합니다.\n  가. 일시: {meetTime|20○○. ○. ○.(○) ○○:○○}\n  나. 장소: {v:meetPlace|○○실}\n  다. 안건: {year|2027}학년도 교복 적격업체 선정 평가기준 및 교복 사양서 결정\n  라. 참석대상: 교복선정위원회 위원 {cnt:|○}명\n\n붙임  1. {year|2027}학년도 교복 사양서(안) 1부.\n      2. 적격업체 선정 평가기준표(안) 1부.\n      3. 교복선정위원회 명단 1부.  끝.",
  f:["07-02","07-03"]},
 {st:"com",who:"교무",key:"decision",t:"{year|2027}학년도 교복 적격업체 선정 평가기준 및 사양서 결정",
  b:"1. 관련: {rel:meeting|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 신입생 교복(동복, 하복) 학교주관구매 적격업체 선정 평가기준 및 교복 디자인 사양서를 교복선정위원회 협의 결과 붙임과 같이 결정하였습니다.\n\n붙임  1. 교복선정위원회 회의록 1부.\n      2. 제안서 평가항목 및 배점기준표 1부.\n      3. {year|2027}학년도 교복 디자인 사양서 1부.  끝.",
  f:["g09","g11","07-03","07-02"]},
 {st:"plan",who:"교무",key:"plan",t:"{year|2027}학년도 교복 학교주관구매 계획(안)",
  b:"1. 관련: {rel:decision|○○학교-○○○(20○○. ○. ○.)}\n2. 공정하고 투명한 교복 선정 및 합리적인 교복 구매를 위해 {school|○○학교} {year|2027}학년도 교복 학교주관구매 계획을 붙임과 같이 수립하고자 합니다.\n  가. 대상: {year|2027}학년도 신입생 중 학교주관구매 참여자 약 {n:qty|○○○}명\n  나. 착용 시기: {wearPlan|동복 20○○. 3. / 하복 20○○. ○.}\n  다. 계약방법: 2단계 입찰(규격·가격 동시), 단가계약, 지역제한(경상남도)\n\n붙임  {year|2027}학년도 교복 학교주관구매 계획(안) 1부.  끝.",
  f:["02-1","02-2","g06"]},
 {st:"plan",who:"교무",key:"review",t:"{year|2027}학년도 교복 학교주관구매 계획(안) 심의 안건 제출",
  b:"1. 관련: {rel:plan|○○학교-○○○(20○○. ○. ○.)}\n2. 「초·중등교육법」 제32조제1항 및 「경상남도립학교 운영위원회 운영 조례」 제15조에 따라 {year|2027}학년도 교복 학교주관구매 계획(안)을 붙임과 같이 제출하오니 심의하여 주시기 바랍니다.\n\n붙임  {year|2027}학년도 교복 학교주관구매 계획(안) 1부.  끝.",
  f:["03-1","02-1"]},
 {st:"plan",who:"교무",key:"request",t:"{year|2027}학년도 교복 학교주관구매 요청",
  b:"1. 관련: {rel:review|○○학교-○○○(20○○. ○. ○.)}\n2. 교복 구매 계획에 대한 학교운영위원회 심의가 끝나 {year|2027}학년도 교복 학교주관구매를 아래와 같이 요청합니다.\n  가. 대상 및 수량: {year|2027}학년도 신입생 중 학교주관구매 참여자 {n:qty|○○○}명\n  나. 사양: 붙임 사양서 참조\n  다. 납품기한: 동복 {date:winterDue|20○○. ○. ○.}, 하복 {date:summerDue|20○○. ○. ○.}\n\n붙임  1. {year|2027}학년도 교복 학교주관구매 계획 1부.\n      2. 교복 사양서 1부.  끝.",
  f:["02-1","04-1"]},
 {st:"price",who:"행정",t:"{year|2027}학년도 {school|○○학교} 교복 견적 의뢰",
  b:"1. 관련: {rel:request|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 {school|○○학교} 교복(동복·하복) 학교주관구매 기초금액 산출을 위해 아래와 같이 견적을 요청하오니 회신하여 주시기 바랍니다.\n  가. 회신기한: {dated:quoteDue|20○○. ○. ○.(○)}\n  나. 요청내용: {year|2027}학년도 교복(동복 4pcs, 하복 2pcs) 견적 및 품목별 단가\n  다. 예정수량: {n:qty|○○○}벌\n  라. 회신방법: 팩스({v:fax|055-000-0000}) 또는 이메일({v:email|○○○@gne.go.kr})\n\n붙임  1. {year|2027}학년도 교복 견적 의뢰서 1부.\n      2. 교복 사양서 1부.  끝.",
  f:["02-2-1","04-1"]},
 {st:"price",who:"행정",key:"price",t:"{year|2027}학년도 교복 기초금액 산출",
  b:"1. 관련: {rel:request|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 교복 견적서 {qn|○}곳을 받아 거래실례가격(견적가격){avgHow|의 평균}으로 아래와 같이 기초금액을 산출하고자 합니다.\n  가. 동복(4pcs): {n:winterPrice|○○○,○○○}원\n  나. 하복(2pcs): {n:summerPrice|○○,○○○}원\n  다. 기초금액(1인 단가): {n:basePrice|○○○,○○○}원\n  ※ 경남교육청 권고 상한가격: 동복 246,020원, 하복 97,605원(체육예술건강과-6509, 2026. 6. 2.) — 상한가격은 기초금액이 아님\n\n붙임  1. 교복 견적서 {qn|○}부.\n      2. 기초금액 산출조서 1부.  끝.",
  f:["02-2-2","xls","02-2-3"]},
 {st:"bid",who:"행정",need:"pre",t:"{year|2027}학년도 학생 교복 구매규격 사전공개",
  b:"1. 관련: 「지방자치단체를 당사자로 하는 계약에 관한 법률」 제9조의2, 같은 법 시행령 제32조의2\n2. {year|2027}학년도 학생 교복(동복·하복) 구매규격(사양서)을 아래와 같이 지정정보처리장치(G2B)로 사전공개하고자 합니다.\n  가. 사업명: {school|○○학교} {year|2027}학년도 학생 교복 구입\n  나. 기초금액: 단가 {n:basePrice|○○○,○○○}원(동복 {n:winterPrice|○○○,○○○}원, 하복 {n:summerPrice|○○,○○○}원)\n  다. 배정예산: {budgetCalc|○○○,○○○원×○○○벌=○○,○○○,○○○원}\n  라. 공개사항: {year|2027}학년도 학생 교복 사양서\n  마. 공개기간: {preRange|20○○. ○. ○. ~ 20○○. ○. ○.(○일간)}\n\n붙임  {year|2027}학년도 학생 교복 사양서 1부.  끝.",
  f:["04-1"]},
 {st:"bid",who:"행정",t:"{year|2027}학년도 교복 학교주관구매 기초금액 및 계약방법 결정",
  b:"1. 관련: {rel:price|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 교복 학교주관구매 기초금액을 아래와 같이 정하고, 「지방자치단체를 당사자로 하는 계약에 관한 법률 시행령」 제18조제3항에 따라 2단계 입찰(규격·가격 동시)로 계약상대자를 정하고자 합니다.\n  가. 건명: {year|2027}학년도 교복(동복·하복) 학교주관구매\n  나. 기초금액: 금{n:basePrice|○○○,○○○}원(단가), 예정수량 {n:qty|○○○}벌\n  다. 추정가격: {estCalc|○○,○○○,○○○원}\n  라. 공고기간: {noticeRange|20○○. ○. ○.~○. ○.(○일간)}\n  마. 계약방법: 단가계약, 지역제한(경상남도), 2단계 입찰 — 규격(제안서) 평가에서 {n:passScore|80}점 이상인 업체만 가격 개찰\n\n붙임  1. 기초금액 산출조서 1부.\n      2. 입찰 공고문 1부.\n      3. 계약 특수조건 1부.\n      4. 교복 사양서 1부.  끝.",
  f:["02-2-2","07","07-01","04-1"]},
 {st:"bid",who:"행정",key:"notice",t:"{year|2027}학년도 {school|○○학교} 교복 학교주관구매 입찰 공고",
  b:"{year|2027}학년도 {school|○○학교} 교복 학교주관구매 입찰을 아래와 같이 공고하고자 합니다.\n\n1. 관련: {rel:price|○○학교-○○○(20○○. ○. ○.)}\n2. 공고명: {year|2027}학년도 {school|○○학교} 교복 학교주관구매 입찰공고(2단계 규격·가격 동시입찰)\n3. 제안서 및 가격서 제출기간: {bidPeriod|20○○. ○. ○.(○) ○○:○○ ~ 20○○. ○. ○.(○) ○○:○○}\n4. 구매예정 벌수: {n:qty|○○○}벌(구매 수량은 신청 학생 수에 따라 확정)\n5. 기초금액: 금{n:basePrice|○○○,○○○}원(금{han:basePrice|○○○}원)\n6. 제안서 평가: {evalWhen|20○○. ○. ○.(○) ○○:○○, ○○실} — 교복선정위원회가 제안서와 견본품으로 블라인드 심사\n7. 개찰: {dt:openAt|20○○. ○. ○.(○) ○○:○○} 이후, 입찰집행관 PC\n8. 입찰방법: 단가입찰, 2단계 규격·가격 동시, 지역제한(경상남도)\n\n붙임  {year|2027}학년도 {school|○○학교} 교복 학교주관구매 입찰 공고문 1부.  끝.",
  f:["07","07-01","07-02","07-03","07-04","07-05","07-06","07-07","07-08","07-09","07-10","07-11","07-12","07-13","07-14","07-15","07-16","07-17","07-18","07-19","g08"]},
 {st:"eval",who:"행정",t:"{year|2027}학년도 교복 학교주관구매 제안서 접수 결과 보고",
  b:"1. 관련: {rel:notice|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 교복 학교주관구매 2단계 입찰(규격·가격 동시) 제안서 접수 결과를 아래와 같이 보고합니다.\n  {receiptRows|1) 접수번호 1 / 접수일자 20○○. ○. ○. / 업체명 ○○○ / 대표자 ○○○}\n\n붙임  제안서 접수대장 1부.  끝.",
  f:["08-1"]},
 {st:"eval",who:"교무",key:"evalmeet",t:"{year|2027}학년도 교복 학교주관구매 제안서 평가위원회 개최",
  b:"1. 관련: {rel:notice|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 교복 학교주관구매 제안서 평가위원회를 아래와 같이 개최하고자 합니다.\n  가. 일시: {evalKor|20○○년 ○월 ○일(○) ○○시}\n  나. 장소: {v:evalPlace|○○실}\n  다. 대상: 평가위원 {cnt:|○}명\n    1) 위원장 {role:위원장|○○○}\n    2) 부위원장 {role:부위원장|○○○}\n    3) 위원 {role:위원|○○○, ○○○}\n  라. 안내방법: 개별통지.  끝.",
  f:["11-1","11-3","07-05"]},
 {st:"eval",who:"행정",t:"{year|2027}학년도 교복 학교주관구매 제안서 정량평가 결과 보고",
  b:"1. 관련: {rel:notice|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 교복 학교주관구매 2단계 입찰(규격·가격 동시)에 접수된 제안서의 정량평가 결과를 아래와 같이 보고합니다.\n  □ 정량평가(수행 경험 / 품질 인증 / 접근성 / 단가비율 / 합계)\n  {quantRows|1) ○○○: ○ / ○ / ○ / ○ / ○}\n\n붙임  1. 정량 평가표 각 1부.\n      2. 업체별 실적, 품질 인증, 상한 가격 자료 각 1부.  끝.",
  f:["07-04"]},
 {st:"eval",who:"교무",key:"evalresult",t:"{year|2027}학년도 교복 업체 선정 제안서 평가 집계결과 보고",
  b:"1. 관련: {relopen:evalmeet|○○학교-○○○(20○○. ○. ○.}, “제안서 평가위원회 개최”)\n2. {year|2027}학년도 교복업체 선정을 위한 제안서 평가 결과를 아래와 같이 보고합니다.\n  업체명 / 정량평가 / 정성평가 / 합계 / 적격 여부\n  {evalRows|○○○ / ○ / ○ / ○ / 적격}\n  ※ 적격 기준: 합계 {n:passScore|80}점 이상(적격 업체 모두 가격 개찰)\n\n붙임  1. 제안서 평가위원 등록부 1부.\n      2. 제안서 집계표 1부.\n      3. 위원별 평가표 {cnt:|○}부.\n      4. 평가위원 청렴 및 보안 서약서 각 1부.  끝.",
  f:["11-1","11-2","07-05","11-3"]},
 {st:"con",who:"행정",key:"award",t:"{year|2027}학년도 교복 학교주관구매 낙찰자 결정",
  b:"1. 관련: {rel:evalresult|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 교복 학교주관구매 개찰 결과, 규격 평가 적격 업체 중 예정가격 이하 최저가격으로 입찰한 아래 업체를 낙찰자로 결정하고자 합니다.\n  가. 건명: {year|2027}학년도 교복(동복·하복) 학교주관구매\n  나. 기초금액: 금{n:basePrice|○○○,○○○}원\n  다. 예정가격: 금{n:estPrice|○○○,○○○}원\n  라. 낙찰자: {v:winner|○○교복사}(대표자 {winnerCeo|○○○}), 투찰단가 {n:bidPrice|○○○,○○○}원, 낙찰률 {rate|○○.○○○}%\n  마. 근거: 「지방자치단체를 당사자로 하는 계약에 관한 법률 시행령」 제42조.  끝.",
  f:[]},
 {st:"con",who:"행정",t:"{year|2027}학년도 교복 학교주관구매 낙찰자 결정 통보",
  b:"1. 우리 학교 {year|2027}학년도 교복 학교주관구매 건의 낙찰자로 귀사를 결정하여 알려 드리오니, 전자계약[나라장터(G2B)] 체결을 위해 아래 서류를 {date:docsDue|20○○. ○. ○.}까지 제출하여 주시기 바랍니다.\n  가. 낙찰자: {v:winner|○○교복사}(대표자 {winnerCeo|○○○}), 단가 {n:bidPrice|○○○,○○○}원, 예정수량 {n:qty|○○○}벌, 계약금액 {contractAmt|○○,○○○,○○○}원\n  나. 제출서류\n    1) 품목별 단가표 1부.\n    2) 원단 시험성적서 1부.\n    3) 사용인감계(조달등록 인장이 아닌 경우) 1부.\n    4) 법인 등기사항증명서(법인) 또는 주민등록등본(개인) 1부.  끝.",
  f:["07-19"]},
 {st:"con",who:"행정",t:"{year|2027}학년도 교복 학교주관구매 계약 체결",
  b:"1. 관련: {rel:award|○○학교-○○○(20○○. ○. ○.)}\n2. {year|2027}학년도 교복 학교주관구매 계약을 아래와 같이 체결하고자 합니다.\n  가. 계약명: {year|2027}학년도 교복(동복·하복) 학교주관구매\n  나. 계약금액: 금{contractAmt|○○,○○○,○○○}원[{n:bidPrice|○○○,○○○}원(단가)×{n:qty|○○○}벌(예정수량)]\n     ※ 구매물량은 학생 신청 인원에 따라 확정\n  다. 계약상대자: {v:winner|○○교복사} / 소재지 {v:winnerAddr|경상남도 ○○시 ○○로} / 대표자 {winnerCeo|○○○} / 전화 {v:winnerTel|055-000-0000}\n  라. 계약보증금: 계약금액의 10%(보증서 전자 접수)\n  마. 납품기한: 동복 {dated:winterDue|20○○. ○. ○.(○)}, 하복 {dated:summerDue|20○○. ○. ○.(○)}\n  바. 계약방법: 나라장터(G2B) 전자계약\n\n붙임  1. 계약서(안) 1부.\n      2. 교복 사양서 1부.\n      3. 계약 특수조건 1부.\n      4. 품목별 단가표 1부.  끝.",
  f:["04-1","07-01","07-19"]},
 {st:"size",who:"교무",t:"신입생 교복 학교주관구매 사전 안내 가정통신문 발송",
  b:"1. 관련: 「교복 학교주관구매 길라잡이」(경상남도교육청, 2026. 6.)\n2. 상급학교 진학 전에 교복 학교주관구매와 교복 지원을 안내하기 위하여 붙임과 같이 가정통신문을 발송하고자 합니다.\n  가. 대상: {year|2027}학년도 신입생(예정) 및 학부모\n  나. 내용: 학교주관구매 참여·지원 방법, 교복 가격(동복 {n:bidPrice|○○○,○○○}원), 치수 측정 일정({sizeRange|○. ○.~○. ○.}), 일괄 착용일\n\n붙임  교복 학교주관구매 안내 가정통신문 1부.  끝.",
  f:["15-1","g12","g05"]},
 {st:"size",who:"교무",t:"신입생 교복 구매 수요조사 가정통신문 발송",
  b:"1. 관련: 「교복 학교주관구매 길라잡이」(경상남도교육청, 2026. 6.)\n2. 교복 구매 물량을 확정하기 위하여 학교주관구매 수요조사를 붙임과 같이 실시하고자 합니다.\n  가. 대상: {year|2027}학년도 신입생 및 학부모\n  나. 내용: 학교주관구매 참여 여부, 희망 치수\n\n붙임  1. 교복 지원 안내문 1부.\n      2. 수요조사서 1부.  끝.",
  f:["16-1","16-2"]},
 {st:"pay",who:"교무",t:"교복 학교주관구매 만족도 조사 실시",
  b:"1. 관련: 「교복 학교주관구매 길라잡이」(경상남도교육청, 2026. 6.)\n2. 교복 학교주관구매 만족도 조사를 아래와 같이 실시하고자 합니다.\n  가. 대상: {year|2027}학년도 교복 학교주관구매 참여 학생 및 학부모\n  나. 기간: {surveyRange|20○○. ○. ○.~○. ○.}\n  다. 내용: 가격, 품질, 구매절차, 사후관리(A/S·교환) 만족도\n\n붙임  교복 학교주관구매 만족도 설문지 1부.  끝.",
  f:["17-1"]},
 {st:"pay",who:"교무",t:"교복 학교주관구매 만족도 조사 결과 보고",
  b:"1. 관련: 「교복 학교주관구매 길라잡이」(경상남도교육청, 2026. 6.)\n2. 교복 학교주관구매 만족도 조사 결과를 붙임과 같이 보고하고, 학교 누리집에 게시하고자 합니다.\n  가. 대상: {year|2027}학년도 교복 학교주관구매 참여 학생 및 학부모\n  나. 내용: 항목별 평균점수 및 총평(교복업체명 포함 공개)\n\n붙임  교복 학교주관구매 만족도 조사 결과 1부.  끝.",
  f:["18-1"]}
];

/* 문서번호 대장 키 → 이름 */
var DOCN={committee:"위원회 구성",meeting:"결정회의 개최",decision:"평가기준·사양서 결정",plan:"구매 계획",review:"학운위 심의 안건",request:"구매 요청",price:"기초금액 산출",notice:"입찰 공고",evalmeet:"평가위원회 개최",evalresult:"평가 집계결과",award:"낙찰자 결정"};

function defYear(){ var d=new Date(); return String(d.getFullYear()+(d.getMonth()>=2?1:0)); }
function load(){ var p=LS.get("gb.p",null); if(!p||typeof p!=="object") p={};
  p.f=p.f||{}; p.members=p.members||[]; p.bidders=p.bidders||[]; p.quotes=p.quotes||[]; p.docs=p.docs||{}; p.done=p.done||{}; p.items=p.items||{};
  if(!p.f.year) p.f.year=defYear(); if(!p.f.passScore) p.f.passScore="80";
  if(!p.f.school){ try{ var s=JSON.parse(localStorage.getItem("ct.school")||'""'); if(s) p.f.school=s; }catch(e){} }
  return p; }

/* ---------------- 그리기 ---------------- */
var CSS=[
".gbv .cv-pane{padding-bottom:12px}",
".gb-hero{display:flex;gap:8px 12px;align-items:center;flex-wrap:wrap;margin:2px 0 4px}",
".gb-hero input{font:inherit;font-size:15px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0}",
".gb-hero .sch{flex:1 1 220px;max-width:340px}",
".gb-hero .yr{width:92px}",
".gb-hero label{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--ink-2)}",
".gb-hero .sp{flex:1}",
".gb-now{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:10px 0 0;font-size:14px}",
".gb-now b{font-size:15px}",
".gb-say{font-size:14px;color:var(--ink-2);margin:0 0 10px;line-height:1.6}",
".gb-sub{font-size:13.5px;font-weight:700;color:var(--ink);margin:18px 0 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
".gb-sub small{font-weight:400;color:var(--muted);font-size:12.5px}",
".gb-tbl{display:grid;gap:6px}",
".gb-tr{display:grid;gap:6px;align-items:center;background:var(--surface-2);border-radius:10px;padding:6px 8px}",
".gb-tr input,.gb-tr select{font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box}",
".gb-tr .x{font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:2px 6px}",
".gb-tr .x:hover{color:var(--neg)}",
".gb-tr .o{font-size:13px;font-weight:700;text-align:right;white-space:nowrap}",
".gb-tr .o.ok{color:var(--pos)}.gb-tr .o.bad{color:var(--neg)}",
".gb-th{display:grid;gap:6px;padding:0 8px;font-size:11.5px;font-weight:700;color:var(--muted)}",
".gb-mem{grid-template-columns:118px 104px 1fr 1fr 28px}",
".gb-quo{grid-template-columns:1.4fr 1fr 1fr 1fr 28px}",
".gb-bid{grid-template-columns:1.3fr .9fr repeat(5,.62fr) .75fr 28px}",
".gb-add{font:inherit;font-size:13.5px;border:1px dashed var(--line-strong);background:none;color:var(--accent-ink);border-radius:10px;padding:7px 12px;cursor:pointer;justify-self:start}",
"@media (max-width:640px){.gb-th{display:none}.gb-mem{grid-template-columns:1fr 1fr 28px}.gb-mem>:nth-child(3){grid-column:1}.gb-mem>:nth-child(4){grid-column:2}.gb-mem>.x{grid-row:1;grid-column:3}",
"  .gb-quo{grid-template-columns:1fr 1fr 28px}.gb-quo>:first-child{grid-column:1/3}.gb-quo>.x{grid-row:1;grid-column:3}.gb-quo>.o{grid-column:1/-1;text-align:left}",
"  .gb-bid{grid-template-columns:repeat(5,1fr) 28px}.gb-bid>:nth-child(1){grid-column:1/4}.gb-bid>:nth-child(2){grid-column:4/6}.gb-bid>.x{grid-row:1;grid-column:6}.gb-bid>.o{grid-column:1/-1;text-align:left}",
"  .gbv .cv-ix .t{font-size:10.5px;letter-spacing:-.04em;text-overflow:clip}.gbv .cv-calc{grid-template-columns:1fr 1fr}",
"  .gb-tr input::placeholder{font-size:12px}}",
/* 기안문 카드 */
".gb-docs{display:grid;gap:8px;margin-top:6px}",
".gb-doc{border:1px solid var(--line);border-radius:12px;background:var(--surface);overflow:hidden}",
".gb-dh{font:inherit;display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;padding:11px 14px;cursor:pointer;color:var(--ink)}",
".gb-dh .who{flex:0 0 auto;font-size:11.5px;font-weight:700;border-radius:6px;padding:2px 7px;background:var(--surface-3);color:var(--ink-2)}",
".gb-dh .who.h{background:var(--accent-soft);color:var(--accent-ink)}",
".gb-dh .tt{flex:1;min-width:0;font-size:14.5px;font-weight:600;line-height:1.4}",
".gb-dh .no{flex:0 0 auto;font-size:12px;color:var(--pos);font-weight:700}",
".gb-dh .ar{flex:0 0 auto;color:var(--muted);transition:transform .15s}",
".gb-doc.open .gb-dh .ar{transform:rotate(90deg)}",
".gb-db{display:none;border-top:1px solid var(--line);padding:12px 14px}",
".gb-doc.open .gb-db{display:block}",
".gb-txt{white-space:pre-wrap;font-size:13.5px;line-height:1.75;background:var(--surface-2);border-radius:10px;padding:12px 14px;margin:0;color:var(--ink);word-break:keep-all;overflow-wrap:anywhere}",
".gb-txt .tl{display:block;font-weight:700;margin-bottom:6px}",
".gb-txt mark{background:none;color:var(--accent-ink);font-weight:600}",
".gb-txt mark.ex{color:var(--warn);font-weight:400;background:var(--warn-bg);border-radius:3px}",
".gb-dfoot{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}",
".gb-dfoot .reg{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12.5px;color:var(--muted);margin-left:auto}",
".gb-dfoot .reg input{font:inherit;font-size:13px;padding:5px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);width:96px}",
".gb-dfoot .reg input[type=date]{width:auto}",
".gb-files{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}",
".gb-file{font:inherit;font-size:12.5px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink-2);border-radius:8px;padding:5px 10px;cursor:pointer;display:inline-flex;gap:6px;align-items:center}",
".gb-file:hover{border-color:var(--accent);color:var(--accent-ink)}",
".gb-file i{font-style:normal;font-size:10.5px;font-weight:700;border-radius:4px;padding:1px 4px;background:var(--surface-3);color:var(--muted)}",
".gb-file.fill i{background:var(--accent-soft);color:var(--accent-ink)}",
".gb-file[disabled]{opacity:.6;cursor:default}",
".gb-rules{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:5px}",
".gb-rules li{font-size:13.5px;line-height:1.55;color:var(--ink-2);padding-left:14px;position:relative}",
".gb-rules li::before{content:\"\";position:absolute;left:2px;top:.62em;width:5px;height:5px;border-radius:50%;background:var(--accent)}",
".gb-gn{margin-top:22px}",
".gb-ubtn .btn{font-size:14px;line-height:inherit;padding:7px 14px;border-radius:8px;align-self:flex-start;width:auto}",
".gb-gn .cv-h{margin-top:0}"
].join("\n");

function build(root){
  var T=U();
  if(!document.getElementById("cv-css")&&T.CSS){ var s0=el("style"); s0.id="cv-css"; s0.textContent=T.CSS; document.head.appendChild(s0); }
  if(!document.getElementById("gb-css")){ var s1=el("style"); s1.id="gb-css"; s1.textContent=CSS; document.head.appendChild(s1); }
  var P=load(), view={open:null}, F=P.f;
  root.textContent=""; var app=el("div","cv gbv"); root.appendChild(app);
  var REF=[];
  function put(){ LS.set("gb.p",P); REF.forEach(function(f){ f(); }); }
  function btn(t,cls,fn){ var b=el("button",cls||"btn",t); b.type="button"; if(fn) b.onclick=fn; return b; }
  function msg(box,t,kind){ box.textContent=t||""; box.className="tkmsg"+(t?" on "+(kind||"ok"):""); }
  function V(k){ return String(F[k]==null?"":F[k]).trim(); }
  function N(k){ return num(F[k]); }
  function Y(){ var y=parseInt(V("year"),10); return y>=2000&&y<=2100?y:null; }

  /* ---- 계산 ---- */
  function mem(){ return P.members.filter(function(m){ return String(m.name||"").trim(); }); }
  function bids(){ return P.bidders.filter(function(b){ return String(b.name||"").trim(); }); }
  function qsum(b){ var s=0, any=false; ["q1","q2","q3","q4"].forEach(function(k){ var n=num(b[k]); if(n!=null){ s+=n; any=true; } }); return any?s:null; }
  function r2(n){ return Math.round(n*100)/100; }
  function total(b){ var q=qsum(b), l=num(b.qual); return q!=null&&l!=null?r2(q+l):null; }
  function passOk(b){ var t=total(b), p=N("passScore"); return t==null||p==null?null:t>=p; }
  function base(){ var w=N("winterPrice"), s=N("summerPrice"); return w!=null&&s!=null?w+s:N("basePrice"); }
  function budget(){ var b=base(), q=N("qty"); return b!=null&&q!=null?b*q:null; }
  function est(){ var b=budget(); return b==null?null:Math.round(b/1.1); }        /* 추정가격 = 부가세 뺀 금액 */
  function quoteList(k){ return P.quotes.map(function(q){ return num(q[k]); }).filter(function(n){ return n!=null; }); }
  function quoteAvg(k){ var a=quoteList(k).sort(function(x,y){ return x-y; }); if(!a.length) return null;
   /* 견적은 받은 곳 모두 평균(길라잡이·편람 예시에 최고·최저를 빼는 규칙 없음) */
    return Math.floor(a.reduce(function(x,y){ return x+y; },0)/a.length/10)*10; }   /* 평균, 원 단위 절삭 */
  function trimmed(){ return false; }
  /* 앞 날짜로 정해지는 날짜 미리 채우기. 직접 고친 값·끝난 단계는 그대로, 실제로 일어난 날은 채우지 않음 */
  function nextWork(d){ return d?workDays(addDays(d,-1),1):""; }
  function weekendEnd(a){ if(!a) return ""; var we=false; for(var i=0;i<40;i++){ var x=addDays(a,i), w=pd(x).getDay(); if(w===0||w===6) we=true; if(i>=4&&we) return x; } return ""; }   /* 5일 이상·주말 포함 */
  function prefill(){ P.autoV=P.autoV||{}; P.done=P.done||{}; var ch=false, td=today();
    function A(k,v,st){ if(P.done[st]||!v) return; var cur=V(k); if(cur&&cur!==P.autoV[k]) return; if(cur!==v){ F[k]=v; ch=true; } P.autoV[k]=v; }
    if(needPre()){ A("preStart",td,"bid"); A("preEnd",addDays(V("preStart"),4),"bid"); A("bidStart",nextWork(addDays(V("preEnd"),1)),"bid"); } else A("bidStart",td,"bid");
    A("bidEnd",nextWork(addDays(V("bidStart"),noticeDays()+1)),"bid"); A("evalDate",nextWork(addDays(V("bidEnd"),1)),"bid"); A("openDate",V("evalDate"),"bid");
    A("docsDue",V("awardDate")?addDays(V("awardDate"),10):"","con");
    A("sizeEnd",weekendEnd(V("sizeStart")),"size"); A("winterDue",V("qtyFixDate")?addDays(V("qtyFixDate"),40):"","size");
    A("surveyStart",V("summerDone")||V("winterDone"),"pay");
    return ch; }
  function needPre(){ var e=est(); return e!=null&&e>=5e7; }
  function noticeDays(){ var e=est(); return e!=null&&e>=1e8?20:10; }               /* 2단계 입찰: 1억 미만 10일, 1억 이상 20일 */
  function lastNotice(){ return V("bidEnd")?addDays(V("bidEnd"),-(noticeDays()+1)):""; }  /* 마감일 전날부터 기산 */
  function selDue(){ var y=Y(); return y?(y-1)+"-08-31":""; }
  function rel(k,open){ var r=P.docs[k]||{}, no=String(r.no||"").trim(), dt=dot(r.date); if(!V("school")||!no||!dt) return ""; return V("school")+"-"+no+"("+dt+(open?"":")"); }
  function pn(m){ return (String(m.pos||"").trim()?m.pos.trim()+" ":"")+m.name.trim(); }
  function at(dk,tk){ var s=dotw(V(dk)); return s?s+(V(tk)?" "+V(tk):""):""; }
  function workDays(s,n){ return T.workDays?T.workDays(s,n):addDays(s,n+2); }

  var FMT={
    school:function(){ return V("school"); },
    year:function(){ return Y()?String(Y()):""; },
    v:function(a){ return V(a); },
    n:function(a){ var x=a==="basePrice"?base():N(a); return x==null?"":comma(x); },
    han:function(a){ var x=a==="basePrice"?base():N(a); return x?han(x):""; },
    date:function(a){ return dot(V(a)); },
    dated:function(a){ return dotw(V(a)); },
    dt:function(a){ return a==="openAt"?at("openDate","openTime"):""; },
    meetTime:function(){ return at("meetDate","meetTime"); },
    bidPeriod:function(){ var a=at("bidStart","bidStartTime"), b=at("bidEnd","bidEndTime"); return a&&b?a+" ~ "+b:""; },
    evalWhen:function(){ var a=at("evalDate","evalTime"); return a?a+(V("evalPlace")?", "+V("evalPlace"):""):""; },
    evalKor:function(){ var d=pd(V("evalDate")); if(!d) return ""; var t=/^(\d{1,2}):(\d{2})$/.exec(V("evalTime")), s=d.getFullYear()+"년 "+(d.getMonth()+1)+"월 "+d.getDate()+"일("+WD[d.getDay()]+")";
      return t?s+" "+(+t[1])+"시"+(+t[2]?" "+(+t[2])+"분":""):s; },
    preRange:function(){ var a=V("preStart"), b=V("preEnd"); return a&&b?dot(a)+" ~ "+dot(b)+"("+(diff(a,b)+1)+"일간)":""; },
    noticeRange:function(){ var a=V("bidStart"), b=V("bidEnd"); if(!pd(a)||!pd(b)) return ""; return dot(a)+"~"+dot(b,pd(a).getFullYear()===pd(b).getFullYear())+"("+(diff(a,b)+1)+"일간)"; },
    sizeRange:function(){ var a=V("sizeStart"), b=V("sizeEnd"); return a&&b?dot(a,true)+"~"+dot(b,true):""; },
    surveyRange:function(){ var a=V("surveyStart"), b=V("surveyEnd"); return a&&b?dot(a)+"~"+dot(b,true):""; },
    wearPlan:function(){ var y=Y(); return y?"동복 "+y+". 3. / 하복 "+y+". 5.~6.":""; },
    budgetCalc:function(){ var b=base(), q=N("qty"); return b!=null&&q!=null?comma(b)+"원×"+comma(q)+"벌="+comma(b*q)+"원":""; },
    estCalc:function(){ var e=est(); return e==null?"":comma(e)+"원(부가세 제외)"; },
    contractAmt:function(){ var p=N("bidPrice"), q=N("qty"); return p!=null&&q!=null?comma(p*q):""; },
    rate:function(){ var p=N("bidPrice"), e=N("estPrice"); return p!=null&&e?(p/e*100).toFixed(3):""; },
    avgHow:function(){ return trimmed()?" 중 최고·최저가를 뺀 평균":"의 평균"; },
    qn:function(){ var n=P.quotes.filter(function(q){ return num(q.w)!=null||num(q.s)!=null; }).length; return n?String(n):""; },
    winnerCeo:function(){ if(V("winnerCeo")) return V("winnerCeo"); var w=bids().filter(function(b){ return b.name.trim()===V("winner"); })[0]; return w&&String(w.ceo||"").trim()?w.ceo.trim():""; },
    rel:function(a){ return rel(a); },
    relopen:function(a){ return rel(a,true); },
    cnt:function(a){ var m=mem(); if(!m.length) return ""; return String(m.filter(function(x){ return !a||x.grp===a; }).length); },
    chair:function(){ var c=mem().filter(function(x){ return x.role==="위원장"; })[0]; return c?pn(c):""; },
    memAll:function(){ return mem().filter(function(x){ return x.role!=="위원장"; }).map(pn).join(", "); },
    role:function(a){ return mem().filter(function(x){ return (x.role||"위원")===a; }).map(function(x){ return x.name.trim(); }).join(", "); },
    receiptRows:function(){ return bids().map(function(b,i){ return (i+1)+") 접수번호 "+(i+1)+" / 접수일자 "+(dot(b.date)||"○. ○.")+" / 업체명 "+b.name.trim()+" / 대표자 "+(String(b.ceo||"").trim()||"○○○"); }).join("\n  "); },
    quantRows:function(){ return bids().map(function(b,i){ var s=qsum(b); return (i+1)+") "+b.name.trim()+": "+["q1","q2","q3","q4"].map(function(k){ return String(b[k]||"").trim()||"○"; }).join(" / ")+" / "+(s==null?"○":r2(s)); }).join("\n  "); },
    evalRows:function(){ return bids().map(function(b){ var q=qsum(b), l=num(b.qual), t=total(b), ok=passOk(b);
      return b.name.trim()+" / "+(q==null?"○":r2(q))+" / "+(l==null?"○":r2(l))+" / "+(t==null?"○":t)+" / "+(ok==null?"○":ok?"적격(가격 개찰 대상)":"부적격"); }).join("\n  "); }
  };
  function fmt(k){ var i=k.indexOf(":"), name=i<0?k:k.slice(0,i), arg=i<0?"":k.slice(i+1); try{ return FMT[name]?String(FMT[name](arg)||""):""; }catch(e){ return ""; } }
  /* 템플릿 → [{t:글자, k:키?, ok:채움?}] */
  function parse(tpl){ var out=[], re=/\{([^|{}]*)\|([^{}]*)\}/g, last=0, m;
    while((m=re.exec(tpl))){ if(m.index>last) out.push({t:tpl.slice(last,m.index)}); var v=fmt(m[1]); out.push({t:v||m[2],k:m[1],ok:!!v}); last=re.lastIndex; }
    if(last<tpl.length) out.push({t:tpl.slice(last)}); return out; }
  function plain(tpl){ return parse(tpl).map(function(s){ return s.t; }).join(""); }
  function paint(box,tpl){ parse(tpl).forEach(function(s){ if(!s.k){ box.appendChild(document.createTextNode(s.t)); return; } box.appendChild(el("mark",s.ok?"":"ex",s.t)); }); }

  /* ---- 붙임 서식 채우기(hwpx) ---- */
  function shortName(){ return V("school").replace(/\s+/g,"").replace(/학교$/,""); }
  function bidNo(){ var n=V("bidNo").replace(/^\s*제\s*|\s*호\s*$/g,""); return n?"공고 제"+n:""; }
  function committeeRules(){ var rank=function(m){ var i=["위원장","부위원장"].indexOf(m.role); return i<0?2:i; };
    var list=mem().map(function(m,i){ return [m,i]; }).sort(function(a,b){ return rank(a[0])-rank(b[0])||a[1]-b[1]; }).map(function(x){ return x[0]; }), idx={r:0,p:0,n:0};
    function next(k,f){ var m=list[idx[k]++]; return m?f(m):""; }
    return [[/^(위원장|위  원)$/g,function(){ return next("r",function(m){ return m.role||"위원"; }); }],
      [/^(교 *감|교 *사|학부모|학 *생)$/g,function(){ return next("p",function(m){ return String(m.pos||"").trim()||m.grp||""; }); }],
      [/^[○◯]{3}$/g,function(){ return next("n",function(m){ return m.name.trim(); }); }]]; }
  function COMMON(){ var y=Y(); return [
    [/[○◯](?: [○◯]){1,3} 학 교( 장)?/g,function(m,j){ return shortName()?shortName().split("").join(" ")+" 학 교"+(j||""):""; }],
    [/[○◯]{2,4} ?(?:고등|중)?(?=학교)/g,function(){ return shortName(); },true],
    [/202[67](?=학년도|\s*년|\s*\.\s*(?:[0O○◯.]|$))/g,function(m){ return y?String(+m+y-2027):""; }],
    [/063-000-0000/g,function(){ return "055-000-0000"; }]
  ]; }
  var FORMS={
    "07-07":function(){ return [[/공고 제2026 ?[–-] ?00(?=호)/g,bidNo]]; },
    "17-1":function(){ return [[/O{3}(?=학교)/g,function(){ return shortName(); }]]; },
    "18-1":function(){ return [[/(학교명: +)0000/g,function(m,p){ return V("school")?p+V("school"):""; }]]; },
    "02-1":function(){ return [[/^\s*\d{4}\. ○\.\s*$/g,function(){ var d=pd((P.docs.plan||{}).date); return d?d.getFullYear()+". "+(d.getMonth()+1)+".":""; }]].concat(committeeRules()); },
    "03-1":committeeRules,
    "02-2-1":function(){ return [[/[○◯]{3}(?=명입니다)/g,function(){ return comma(N("qty")); }],[/\d{4}\. ○○\. ○○\.\(○\)/g,function(){ return dotw(V("quoteDue")); }]]; },
    "07-01":function(){ return [[/(상대자 )○○교복사/g,function(m,p){ return V("winner")?p+V("winner"):""; }],[/(대표 )[○◯]{3}(?=\(이하)/g,function(m,p){ var c=FMT.winnerCeo(); return c?p+c:""; }],
      [/(동복|하복): \d{4}\.OO\.OO\(요일\)/g,function(m,w){ var s=dotw(V(w==="동복"?"winterDue":"summerDue")); return s?w+": "+s:""; }]]; },
    "07-08":function(){ return [[/\d{4}\.00\.00\.(?= 일자로)/g,function(){ return dot(V("bidStart")); }]]; },
    "11-1":function(){ return [[/(일시：)\d{4}\.○\.○\. ○○:○○/g,function(m,p){ var s=at("evalDate","evalTime"); return s?p+s:""; }],[/^(2\. 장소：)회의실$/g,function(m,p){ return V("evalPlace")?p+V("evalPlace"):""; }]]; },
    "16-1":function(){ return [[/(가격은 )000원/g,function(m,p){ var n=comma(N("bidPrice")); return n?p+n+"원":""; }]]; },
    "07":function(){ var nm=mem().length; return [
      [/공고 제2026 ?[–-] ?00(?=호)/g,bidNo],
      [/금000,000원/g,function(){ var n=comma(base()); return n?"금"+n+"원":""; }],
      [/각 000벌/g,function(){ var n=comma(N("qty")); return n?"각 "+n+"벌":""; }],
      [/(동복|하복) : \d{4}\.00\.00\.\(요일\)/g,function(m,w){ var s=dotw(V(w==="동복"?"winterDue":"summerDue")); return s?w+" : "+s:""; }],
      [/\d{4}\.00\.00\.\(요일\)\[00:00\] ∼ \d{4}\.00\.00\.\(요일\)\[00:00\]/g,function(){ var a=at("bidStart","bidStartTime"), b=at("bidEnd","bidEndTime"); return a&&b?a+" ∼ "+b:""; }],
      [/(가격개찰 일시 : +)\d{4}\.00\.00\.\(요일\) 00:00/g,function(m,p){ var s=at("openDate","openTime"); return s?p+s:""; }],
      [/(일시 : )\d{4}\.00\.00\.\(요일\) 00:00/g,function(m,p){ var s=at("evalDate","evalTime"); return s?p+s:""; }],
      [/본교 [○◯]{4}실/g,function(){ var p=V("evalPlace"); return p?(/^본교/.test(p)?p:"본교 "+p):""; }],
      [/80점(?=\(학교가 정한 기준 점수\))/g,function(){ var n=N("passScore"); return n==null?"":n+"점"; }],
      [/(점수가 )00점/g,function(m,p){ var n=N("passScore"); return n==null?"":p+n+"점"; }],
      [/^\s*\d{4}\. 00\. 00\.\s*$/g,function(){ return dot(V("bidStart")); }],
      [/(행정실|교무실)\(☎063-000-0000/g,function(m,w){ var t=V(w==="행정실"?"officeTel":"teachTel"); return t?w+"(☎"+t:w+"(☎055-000-0000"; }],
      [/[○◯]부\(평가위원(용?) [○◯]부/g,function(m,y){ return nm?(nm+1)+"부(평가위원"+y+" "+nm+"부":""; }],
      [/(평가위원용 )[○◯]부/g,function(m,p){ return nm?p+nm+"부":""; }]]; }
  };
  function unx(s){ return s.replace(/&(lt|gt|quot|apos|amp);/g,function(m,e){ return {lt:"<",gt:">",quot:'"',apos:"'",amp:"&"}[e]; }); }
  function enx(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function putIn(g,a,b,v,after){ var pos=0, placed=false, wait=null;
    g.forEach(function(n){ var s=pos, e=pos+n.t.length; pos=e; if(e<=a) return;
      if(s>=b){ if(wait&&!placed&&n.t){ n.t=v+n.t; n.ch=placed=true; } return; }
      var tail=b<e?n.t.slice(b-s):"", mine=!placed&&!(after&&!tail);
      n.t=(a>s?n.t.slice(0,a-s):"")+(mine?v:"")+tail; n.ch=true; if(mine) placed=true; else if(!placed) wait=n; });
    if(!placed&&wait){ wait.t+=v; wait.ch=true; } }
  function fillXml(xml,rules){
    var re=/<hp:t>([^<]*)<\/hp:t>|<hp:t\b[^>]*\/>|<hp:t\b[^>]*>[\s\S]*?<\/hp:t>|<\/?hp:p\b[^>]*>/g, m, nodes=[], groups=[], g=[];
    while((m=re.exec(xml))){ if(m[1]!==undefined){ var n={s:m.index+6,e:m.index+6+m[1].length,t:unx(m[1])}; nodes.push(n); g.push(n); }
      else if(m[0].indexOf("<hp:t")!==0||m[0].slice(-2)!=="/>"){ if(g.length) groups.push(g); g=[]; } }
    if(g.length) groups.push(g);
    groups.forEach(function(g){ rules.forEach(function(r){ var s=g.map(function(n){ return n.t; }).join(""), hits=[], x; r[0].lastIndex=0;
      while((x=r[0].exec(s))){ if(!x[0].length){ r[0].lastIndex++; continue; } var v=r[1].apply(null,x); if(v&&v!==x[0]) hits.push([x.index,x.index+x[0].length,v]); }
      for(var i=hits.length-1;i>=0;i--) putIn(g,hits[i][0],hits[i][1],hits[i][2],r[2]); }); });
    var out=[], last=0; nodes.forEach(function(n){ if(n.ch){ out.push(xml.slice(last,n.s),enx(n.t)); last=n.e; } }); out.push(xml.slice(last)); return out.join(""); }
  function outName(id){ var nm=FILES[id][1], y=Y(); if(/^(\d|step)/.test(id)&&y) nm=(y)+"학년도 "+nm; return (V("school")&&/^(\d|step)/.test(id)?V("school")+"_":"")+nm; }
  function getFile(id){ return fetch("tools/gb/"+encodeURI(FILES[id][0]).replace(/#/g,"%23")).then(function(r){ if(!r.ok) throw new Error("서식 파일을 찾지 못했어요("+r.status+")"); return r.arrayBuffer(); }).then(function(b){ return new Uint8Array(b); }); }
  function download(id,b,m){
    var path=FILES[id][0], fill=/\.hwpx$/.test(path)&&/^chuk-/.test(path), lab=b.textContent; b.disabled=true;
    getFile(id).then(function(u){
      if(!fill||!T.unzip) return new Blob([u]);
      var fid=/^chuk-(.+)\.hwpx$/.exec(path)[1], rules=(FORMS[fid]?FORMS[fid]():[]).concat(COMMON()), td=new TextDecoder(), te=new TextEncoder();
      return T.unzip(u).then(function(files){ files.forEach(function(f){ if(/^Contents\/section\d+\.xml$/.test(f.name)) f.data=te.encode(fillXml(td.decode(f.data),rules)); });
        return new Blob([T.zipStore(files)],{type:"application/hwp+zip"}); });
    }).then(function(blob){ return T.saveFile(blob,outName(id).replace(/[\\/:*?"<>|]/g,"_")); })
      .then(function(){ msg(m,FILES[id][1]+(fill?"을 학교 값으로 채워":"을")+" 내려받았어요.","ok"); },function(e){ msg(m,e.message||"내려받지 못했어요.","bad"); })
      .then(function(){ b.disabled=false; b.textContent=lab; });
  }
  function fileChips(box,ids,m){ var w=el("div","gb-files"); box.appendChild(w);
    ids.forEach(function(id){ var p=FILES[id][0], fill=/^chuk-.*\.hwpx$/.test(p), b=btn("","gb-file"+(fill?" fill":"")); b.appendChild(el("i",null,/xlsx$/.test(p)?"XLSX":/hwpx$/.test(p)?"HWPX":"HWP"));
      b.appendChild(document.createTextNode(FILES[id][1].replace(/\.(hwpx|hwp|xlsx)$/,""))); if(fill) b.title="학교명·학년도 등 넣은 값을 채워서 받아요"; b.onclick=function(){ download(id,b,m); }; w.appendChild(b); }); }

  /* ---- 기안문 카드 ---- */
  var OPEN=LS.get("gb.open",{});
  function docs(pn,stage){ var list=CARDS.filter(function(c){ return c.st===stage&&(c.need!=="pre"||needPre()||est()==null); }); if(!list.length) return;
    var h=el("div","gb-sub","기안문·붙임 서식"); h.appendChild(el("small",null,"색 글자는 넣은 값, 노란 칸은 아직 비어 있는 곳")); pn.appendChild(h);
    var w=el("div","gb-docs"); pn.appendChild(w);
    list.forEach(function(c){ var id=stage+CARDS.indexOf(c), box=el("div","gb-doc"+(OPEN[id]?" open":"")), hd=btn("","gb-dh");
      hd.appendChild(el("span","who"+(c.who==="행정"?" h":""),c.who)); hd.appendChild(el("span","tt",plain(c.t)));
      if(c.key&&P.docs[c.key]&&P.docs[c.key].no) hd.appendChild(el("span","no","제"+P.docs[c.key].no+"호"));
      hd.appendChild(el("span","ar","›")); box.appendChild(hd);
      var bd=el("div","gb-db"); box.appendChild(bd);
      hd.onclick=function(){ box.classList.toggle("open"); OPEN[id]=box.classList.contains("open"); LS.set("gb.open",OPEN); };
      var pre=el("div","gb-txt"); bd.appendChild(pre);
      var rp=function(){ pre.textContent=""; var tl=el("span","tl"); paint(tl,c.t); pre.appendChild(tl); paint(pre,c.b); hd.querySelector(".tt").textContent=plain(c.t); }; rp(); REF.push(rp);
      var ft=el("div","gb-dfoot"); bd.appendChild(ft); var m=el("div","tkmsg");
      ft.appendChild(btn("본문 복사","btn ghost",function(){ var t=plain(c.t)+"\n\n"+plain(c.b);
        (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ msg(m,"복사했어요. 업무관리시스템 기안 본문에 붙여 넣으세요.","ok"); },function(){ msg(m,"복사하지 못했어요. 글을 길게 눌러 직접 복사해 주세요.","warn"); }); }));
      if(c.key){ var rg=el("span","reg"); rg.appendChild(document.createTextNode("결재 후 생산번호")); var r=P.docs[c.key]||(P.docs[c.key]={});
        var ni=el("input"); ni.placeholder="예: 10410"; ni.inputMode="numeric"; ni.value=r.no||""; ni.oninput=function(){ r.no=ni.value.trim(); put(); };
        var di=el("input"); di.type="date"; di.value=r.date||""; di.onchange=function(){ r.date=di.value; put(); };
        ni.onchange=function(){ draw(); }; di.addEventListener("change",function(){ draw(); });
        rg.appendChild(ni); rg.appendChild(di); ft.appendChild(rg); }
      if(c.f.length) fileChips(bd,c.f,m); bd.appendChild(m); w.appendChild(box); }); }

  /* ---- 입력 부품 ---- */
  function grid(pn){ var g=el("div","tkgridf"); pn.appendChild(g); return g; }
  function fld(g,k,label,o){ o=o||{}; var f=el("label","tkf"+(o.wide?" wide":"")); f.appendChild(el("span","tkfl",label)); var i=el("input"); i.type=o.type||"text";
    if(o.num){ i.inputMode="numeric"; } i.value=o.num&&V(k)?comma(N(k)):V(k); if(o.ph) i.placeholder=o.ph; f.appendChild(i); if(o.hint) f.appendChild(el("small",null,o.hint)); g.appendChild(f);
    var on=function(){ F[k]=o.num?(num(i.value)==null?"":String(num(i.value))):i.value.trim(); put(); if(o.live) o.live(); if(o.type==="date"&&prefill()){ put(); draw(); } };
    i.addEventListener(o.type==="date"||o.type==="time"?"change":"input",on);
    if(o.num) i.addEventListener("blur",function(){ var n=N(k); i.value=n==null?"":comma(n); });
    if(o.redraw) i.addEventListener("change",function(){ draw(); });
    return i; }
  function tiles(box,items){ box.textContent=""; items.forEach(function(x){ if(!x) return; var d=el("div","cv-num "+(x.c||"")); d.appendChild(el("span",null,x.l)); d.appendChild(el("b",null,x.v)); if(x.s) d.appendChild(el("small",null,x.s)); box.appendChild(d); }); }
  function calcBox(pn){ var c=el("div","cv-calc"); pn.appendChild(c); return c; }
  function say(pn,t){ pn.appendChild(el("p","gb-say",t)); }
  function sub(pn,t,s){ var h=el("div","gb-sub",t); if(s) h.appendChild(el("small",null,s)); pn.appendChild(h); return h; }
  function rules(pn,list){ var u=el("ul","gb-rules"); list.forEach(function(t){ u.appendChild(el("li",null,t)); }); pn.appendChild(u); }
  function law(pn,t){ pn.appendChild(el("p","cv-law",t)); }

  /* ---- 단계별 화면 ---- */
  var S={};
  S.com=function(pn){
    say(pn,"교직원·학부모·학생 대표로 7명 이상 꾸려요. 교원이 아닌 위원이 절반 이상, 학생 대표가 1/3 이상이어야 해요. 학교장·행정실장·교복 업계 이해관계자는 위원이 될 수 없어요.");
    var calc=calcBox(pn);
    sub(pn,"위원 명단");
    var th=el("div","gb-th gb-mem"); ["구분","직책","직위","성명",""].forEach(function(t){ th.appendChild(el("span",null,t)); }); pn.appendChild(th);
    var tb=el("div","gb-tbl"); pn.appendChild(tb);
    function upd(){ var m=mem(), n=m.length, nt=m.filter(function(x){ return x.grp!=="교원"; }).length, st=m.filter(function(x){ return x.grp==="학생"; }).length, ch=m.filter(function(x){ return x.role==="위원장"; }).length;
      tiles(calc,[{l:"위원 수",v:n+"명",s:"7명 이상",c:n?(n>=7?"ok":"bad"):""},
        {l:"교원 아닌 위원",v:nt+"명",s:"절반 이상 ("+Math.ceil(n/2)+"명 이상)",c:n?(nt*2>=n?"ok":"bad"):""},
        {l:"학생 대표",v:st+"명",s:"1/3 이상 ("+Math.ceil(n/3)+"명 이상)",c:n?(st*3>=n?"ok":"bad"):""},
        {l:"위원장",v:ch===1?"정함":ch?ch+"명":"아직",s:"위원 중 호선",c:n?(ch===1?"ok":"warn"):""}]); }
    function row(m){ var r=el("div","gb-tr gb-mem");
      var g=el("select"); ["교원","학교운영위원","학부모","학생"].forEach(function(o){ var op=el("option",null,o); op.value=o; g.appendChild(op); }); g.value=m.grp||"교원"; g.onchange=function(){ m.grp=g.value; put(); upd(); };
      var ro=el("select"); ["위원장","부위원장","위원"].forEach(function(o){ var op=el("option",null,o); op.value=o; ro.appendChild(op); }); ro.value=m.role||"위원"; ro.onchange=function(){ m.role=ro.value; put(); upd(); };
      var po=el("input"); po.placeholder="직위 (예: 교사)"; po.value=m.pos||""; po.oninput=function(){ m.pos=po.value; put(); };
      var na=el("input"); na.placeholder="성명"; na.value=m.name||""; na.oninput=function(){ m.name=na.value; put(); upd(); };
      var x=btn("×","x",function(){ P.members.splice(P.members.indexOf(m),1); put(); r.remove(); upd(); }); x.title="지우기";
      [g,ro,po,na,x].forEach(function(e){ r.appendChild(e); }); tb.appendChild(r); return na; }
    if(!P.members.length) for(var i=0;i<7;i++) P.members.push({grp:i<2?"교원":i<4?"학부모":"학생",role:"위원",pos:"",name:""});
    P.members.forEach(row);
    tb.parentNode.appendChild(btn("+ 위원 더하기","gb-add",function(){ var m={grp:"학생",role:"위원",pos:"",name:""}; P.members.push(m); put(); row(m).focus(); }));
    upd();
    sub(pn,"평가기준·사양서 결정 회의");
    var g2=grid(pn); fld(g2,"meetDate","날짜",{type:"date"}); fld(g2,"meetTime","시간",{ph:"예: 15:00~15:50"}); fld(g2,"meetPlace","장소",{ph:"예: 2층 회의실"});
    law(pn,"근거: 경남 「교복 학교주관구매 길라잡이」(2026. 6.) Ⅰ-1 교복선정위원회 구성");
  };
  S.plan=function(pn){
    say(pn,"품목·사양·착용 시기·구매 일정·계약방법·특수조건·납품 장소·대금 납부·품질 기준을 담아 계획을 세우고, 학교운영위원회 심의를 반드시 거쳐요. 심의 결과는 누리집·가정통신문으로 공개하고, 사업부서(교무)가 계약부서(행정실)에 구매를 요청해요.");
    var g=grid(pn), calc;
    fld(g,"qty","구매 예정 인원(벌)",{num:true,ph:"예: 180",live:function(){ upd(); }});
    fld(g,"winterDue","동복 납품기한",{type:"date",live:function(){ upd(); }}); fld(g,"summerDue","하복 납품기한",{type:"date",live:function(){ upd(); }});
    calc=calcBox(pn);
    function upd(){ var y=Y(), w=V("winterDue");
      tiles(calc,[{l:"업체 선정 마감(권장)",v:selDue()?dot(selDue()):"-",s:"3월 동복 착용 학교는 전년도 8월 말까지",c:selDue()&&dday(selDue())<0&&!P.done.con?"bad":""},
        {l:"동복 착용",v:y?y+". 3.":"-",s:"9월까지 선정 못 하면 하복부터 착용 권장"},
        w?{l:"동복 납품기한",v:dotw(w),s:"물량 확정 후 최소 40일 보장"}:null]); }
    upd();
    sub(pn,"계획에 꼭 담을 것");
    rules(pn,["입찰 자격은 경상남도에 주된 영업소를 둔 업체로 제한(수의계약은 시·군)","학생·학부모·교직원 의견 수렴 결과","단가계약 — 구매물량은 학생 신청 인원에 따라 확정","품목별 단가 비율표(공고문에 그대로 넣음)","이름표는 교복 가격에 넣지 않음"]);
    law(pn,"근거: 길라잡이 Ⅰ-2 구매 계획 수립·Ⅰ-3 학교운영위원회 심의, 초·중등교육법 제32조, 경상남도립학교 운영위원회 운영 조례 제15조, "+GN);
  };
  S.price=function(pn){
    say(pn,"상한가격은 기초금액이 아니에요. 사양서로 견적(나라장터 전자견적 권장)을 받아 거래실례가격으로 산출하고, 부가세·부속품을 넣은 금액으로 정해요.");
    var g=grid(pn); fld(g,"quoteDue","견적 회신기한",{type:"date"}); fld(g,"fax","회신 팩스",{ph:"055-000-0000"}); fld(g,"email","회신 이메일",{ph:"○○○@gne.go.kr"});
    sub(pn,"받은 견적","동복 4pcs · 하복 2pcs, 부가세 포함");
    var th=el("div","gb-th gb-quo"); ["업체","동복","하복","1벌",""].forEach(function(t){ th.appendChild(el("span",null,t)); }); pn.appendChild(th);
    var tb=el("div","gb-tbl"), calc=null; pn.appendChild(tb);
    function row(q){ var r=el("div","gb-tr gb-quo"), o=el("span","o");
      var a=el("input"); a.placeholder="업체명"; a.value=q.n||""; a.oninput=function(){ q.n=a.value; put(); };
      var w=el("input"); w.placeholder="동복"; w.inputMode="numeric"; w.value=q.w?comma(num(q.w)):""; var s=el("input"); s.placeholder="하복"; s.inputMode="numeric"; s.value=q.s?comma(num(q.s)):"";
      function sh(){ var x=num(q.w), y=num(q.s); o.textContent=x!=null&&y!=null?comma(x+y)+"원":""; }
      w.oninput=function(){ q.w=num(w.value)==null?"":String(num(w.value)); put(); sh(); upd(); }; s.oninput=function(){ q.s=num(s.value)==null?"":String(num(s.value)); put(); sh(); upd(); };
      w.onblur=function(){ w.value=q.w?comma(num(q.w)):""; }; s.onblur=function(){ s.value=q.s?comma(num(q.s)):""; };
      var x=btn("×","x",function(){ P.quotes.splice(P.quotes.indexOf(q),1); put(); r.remove(); upd(); });
      [a,w,s,o,x].forEach(function(e){ r.appendChild(e); }); sh(); tb.appendChild(r); return a; }
    if(!P.quotes.length) for(var i=0;i<2;i++) P.quotes.push({n:"",w:"",s:""});
    P.quotes.forEach(row);
    pn.appendChild(btn("+ 견적 더하기","gb-add",function(){ var q={n:"",w:"",s:""}; P.quotes.push(q); put(); row(q).focus(); }));
    sub(pn,"기초금액");
    var g2=grid(pn), wi, si;
    wi=fld(g2,"winterPrice","동복 단가",{num:true,live:function(){ upd(); }}); si=fld(g2,"summerPrice","하복 단가",{num:true,live:function(){ upd(); }});
    var use=btn("견적 평균 넣기","btn ghost",function(){ var a=quoteAvg("w"), b=quoteAvg("s"); if(a!=null){ F.winterPrice=String(a); wi.value=comma(a); } if(b!=null){ F.summerPrice=String(b); si.value=comma(b); } put(); upd(); });
    var ub=el("div","tkf gb-ubtn"); ub.appendChild(el("span","tkfl","\u00a0")); ub.appendChild(use); g2.appendChild(ub);
    calc=calcBox(pn);
    function upd(){ var w=N("winterPrice"), s=N("summerPrice"), aw=quoteAvg("w"), as=quoteAvg("s"), b=base();
      tiles(calc,[{l:"견적 평균(1벌)",v:aw!=null&&as!=null?won(aw+as):"-",s:aw!=null?"동복 "+comma(aw)+" · 하복 "+(as!=null?comma(as):"-")+(trimmed()?" (최고·최저 빼고, 원 단위 절삭)":" (원 단위 절삭)"):"견적을 넣어 주세요"},
        {l:"동복 · 상한 246,020원",v:won(w),s:w!=null?(w<=CAP.w?"상한 이내":"상한보다 "+comma(w-CAP.w)+"원 많음"):"",c:w==null?"":w<=CAP.w?"ok":"bad"},
        {l:"하복 · 상한 97,605원",v:won(s),s:s!=null&&w?"동복의 "+(s/w*100).toFixed(1)+"% (40% 넘지 않게)":"",c:s==null?"":s<=CAP.s&&(!w||s<=w*.4)?"ok":"bad"},
        {l:"기초금액(1인 단가)",v:won(b),s:budget()!=null?"× "+comma(N("qty"))+"벌 = "+man(budget()):"계획 단계에서 인원을 넣으면 예산이 나와요"}]); }
    upd();
    sub(pn,"품목별 단가 비율","공고문 '품목별 단가 비율표'에 넣을 값");
    var g3=grid(pn), rc=calcBox(pn), I=P.items;
    [["w0","동복 자켓"],["w1","동복 블라우스·셔츠"],["w2","동복 조끼·니트"],["w3","동복 치마·바지"],["s1","하복 상의"],["s2","하복 하의"]].forEach(function(o){
      var f=el("label","tkf"); f.appendChild(el("span","tkfl",o[1])); var i=el("input"); i.inputMode="numeric"; i.value=I[o[0]]?comma(num(I[o[0]])):""; f.appendChild(i); g3.appendChild(f);
      i.oninput=function(){ I[o[0]]=num(i.value)==null?"":String(num(i.value)); put(); ru(); }; i.onblur=function(){ i.value=I[o[0]]?comma(num(I[o[0]])):""; }; });
    function ru(){ var sw=["w0","w1","w2","w3"].reduce(function(a,k){ return a+(num(I[k])||0); },0), ss=["s1","s2"].reduce(function(a,k){ return a+(num(I[k])||0); },0);
      tiles(rc,RATIO.map(function(r){ var v=num(I[r[0]]), t=r[1]==="동복"?sw:ss; if(v==null||!t) return {l:r[1]+" "+r[2],v:"-",s:Math.round(r[3]*100)+"% 넘지 않게"};
          var p=v/t; return {l:r[1]+" "+r[2],v:(p*100).toFixed(1)+"%",s:Math.round(r[3]*100)+"% 넘지 않게",c:p<=r[3]+1e-9?"ok":"bad"}; })
        .concat([{l:"품목 합계",v:sw?comma(sw)+" / "+(ss?comma(ss):"-"):"-",s:"동복 / 하복 (원)"}])); }
    ru();
    law(pn,"근거: 지방계약법 시행령 제10조(예정가격 결정 기준), 길라잡이 Ⅱ-1 기초금액 산출, "+GN+" — 상한가격 적용 2026. 6. 2.~2027. 3. 31., 부속품 추가 구매는 1벌 금액의 3% 이내");
  };
  S.bid=function(pn){
    var e=est();
    say(pn,"2단계 입찰(규격·가격 동시)로 공고해요. 제안서(규격) 평가에서 학교가 정한 점수 이상인 업체를 모두 가격 개찰하고, 그중 예정가격 이하 최저가가 낙찰돼요. '상위 2개 업체 적격' 같은 기준은 쓸 수 없어요.");
    var calc=calcBox(pn);
    if(needPre()||e==null){ sub(pn,"사전규격 공개(G2B)","추정가격 5천만 원 이상 · 5일(긴급 3일)"); var g0=grid(pn);
      fld(g0,"preStart","공개 시작",{type:"date",live:function(){ upd(); }}); fld(g0,"preEnd","공개 끝",{type:"date",live:function(){ upd(); }}); }
    sub(pn,"입찰 일정");
    var g=grid(pn);
    fld(g,"bidNo","공고번호",{ph:"예: 2026-15"});
    fld(g,"bidStart","공고일(제출 시작)",{type:"date",live:function(){ upd(); }}); fld(g,"bidStartTime","시작 시각",{type:"time"});
    fld(g,"bidEnd","제출 마감",{type:"date",live:function(){ upd(); }}); fld(g,"bidEndTime","마감 시각",{type:"time"});
    fld(g,"evalDate","제안서 평가일",{type:"date",live:function(){ upd(); }}); fld(g,"evalTime","평가 시각",{type:"time"}); fld(g,"evalPlace","평가 장소",{ph:"예: 2층 회의실"});
    fld(g,"openDate","개찰일",{type:"date"}); fld(g,"openTime","개찰 시각",{type:"time"});
    fld(g,"passScore","적격 기준 점수",{num:true,hint:"학교가 정함(예: 80점)"});
    fld(g,"officeTel","행정실 전화",{ph:"055-000-0000"}); fld(g,"teachTel","교무실 전화",{ph:"055-000-0000"});
    function upd(){ var e=est(), pa=V("preStart"), pb=V("preEnd"), pd0=pa&&pb?diff(pa,pb)+1:null, ln=lastNotice(), bs=V("bidStart"), sd=selDue();
      tiles(calc,[{l:"추정가격(부가세 제외)",v:e==null?"-":man(e),s:e==null?"기초금액·인원을 넣으면 계산돼요":needPre()?"5천만 원 이상 → 사전규격 공개":"5천만 원 미만 → 사전규격 생략 가능"},
        needPre()?{l:"사전규격 기간",v:pd0==null?"-":pd0+"일",s:"5일 이상(긴급 3일)",c:pd0==null?"":pd0>=5?"ok":"warn"}:null,
        {l:"공고 기한",v:ln?dot(ln)+"까지":"-",s:"마감 전날부터 "+noticeDays()+"일 전(추정가격 "+(noticeDays()===20?"1억 이상":"1억 미만")+")",c:ln&&bs?(bs<=ln?"ok":"bad"):""},
        {l:"업체 선정 마감(권장)",v:sd?dot(sd):"-",s:sd?ddTxt(dday(sd)):"",c:sd&&V("evalDate")>sd?"warn":""}]); }
    upd();
    sub(pn,"공고문에 꼭 넣을 것","2026 경남 유의사항");
    rules(pn,["품목별 단가 비율표, 품목별 혼용률(학교 사양서와 ±5%p 넘게 다르면 평가 제외)","품질인증(Q마크·KOLAS 성적서)은 가급적 품질 심사의 10% 이상, 하자 보상·불만 처리 심사는 10% 이상 의무","치수 측정: 5일 이상·주말 포함, 동복·하복 측정 시기 분리, 비용은 업체 부담","전입생 공급 의무(다음 학년도 3. 1.~2월 말)와 단품 추가 구매는 입찰 단가로","무상 A/S 1년, 납품 지연 배상, 하자 교환 책임"]);
    law(pn,"근거: 지방계약법 제9조의2·시행령 제32조의2(사전규격), 시행령 제18조(2단계 입찰)·제35조(공고), 길라잡이 Ⅱ-1 입찰 공고, "+GN);
  };
  S.eval=function(pn){
    say(pn,"가격을 투찰하지 않았거나 견본품을 내지 않은 업체는 평가에서 빼요. 업체명·문양이 없는 제안서와 견본품으로 블라인드 심사하고, 배점표에 있는 점수로만 매겨요.");
    var g=grid(pn); fld(g,"passScore","적격 기준 점수",{num:true,live:function(){ P.bidders.forEach(function(b){ if(b._o) b._o(); }); }});
    sub(pn,"제안서 낸 업체","정량 4항목 + 정성(최고·최저 위원 뺀 평균)");
    pn.appendChild(el("p","cv-law","정성 점수: 위원별 합계점수 중 최고점수를 준 위원과 최저점수를 준 위원을 빼고 나머지 위원 합계점수를 산술평균해요. 최고·최저가 2개 이상이면 하나만 빼요. (길라잡이 제안서 평가항목 및 배점기준 주5)"));
    var th=el("div","gb-th gb-bid"); ["업체명","대표자","수행경험","품질인증","접근성","단가비율","정성","합계",""].forEach(function(t){ th.appendChild(el("span",null,t)); }); pn.appendChild(th);
    var tb=el("div","gb-tbl"); pn.appendChild(tb);
    function row(b){ var r=el("div","gb-tr gb-bid"), o=el("span","o");
      function inp(k,ph,n){ var i=el("input"); i.placeholder=ph; if(n) i.inputMode="decimal"; i.value=b[k]||""; i.oninput=function(){ b[k]=i.value.trim(); put(); sh(); }; r.appendChild(i); return i; }
      var a=inp("name","업체명"); inp("ceo","대표자"); inp("q1","경험",1); inp("q2","인증",1); inp("q3","접근",1); inp("q4","단가",1); inp("qual","정성",1);
      function sh(){ var t=total(b), ok=passOk(b); o.textContent=t==null?"":t+"점 "+(ok?"적격":"부적격"); o.className="o "+(ok==null?"":ok?"ok":"bad"); }
      b._o=sh; Object.defineProperty(b,"_o",{enumerable:false});
      r.appendChild(o); var x=btn("×","x",function(){ P.bidders.splice(P.bidders.indexOf(b),1); put(); r.remove(); }); r.appendChild(x); sh(); tb.appendChild(r); return a; }
    if(!P.bidders.length) for(var i=0;i<2;i++) P.bidders.push({name:""});
    P.bidders.forEach(row);
    pn.appendChild(btn("+ 업체 더하기","gb-add",function(){ var b={name:""}; P.bidders.push(b); put(); row(b).focus(); }));
    law(pn,"근거: 길라잡이 Ⅱ-2 제안서 접수·업체 선정 평가(규격 심사 통과 업체 모두 가격 개찰)");
  };
  S.con=function(pn){
    say(pn,"규격 평가 적격 업체 중 예정가격 이하 최저가로 입찰한 업체가 낙찰자예요. 계약 전에 원단이 사양(혼용률·색상)과 맞는지 검사하고 원단·교복 샘플을 받아 보관해요. 공급 단가만 정하는 단가계약으로 맺어요.");
    var ok=bids().filter(function(b){ return passOk(b); });
    var g=grid(pn);
    var wf=el("label","tkf"); wf.appendChild(el("span","tkfl","낙찰 업체")); var ws=el("input"); ws.setAttribute("list","gb-win"); ws.value=V("winner"); ws.placeholder=ok.length?"적격 업체에서 고르거나 입력":"업체명";
    var dl=el("datalist"); dl.id="gb-win"; ok.forEach(function(b){ var op=el("option"); op.value=b.name.trim(); dl.appendChild(op); }); wf.appendChild(ws); wf.appendChild(dl); g.appendChild(wf);
    ws.oninput=function(){ F.winner=ws.value.trim(); put(); upd(); };
    fld(g,"winnerCeo","대표자",{ph:FMT.winnerCeo()||"대표자"}); fld(g,"winnerAddr","소재지",{ph:"경상남도 ○○시 ○○로"}); fld(g,"winnerTel","전화",{ph:"055-000-0000"});
    fld(g,"estPrice","예정가격(1벌)",{num:true,live:function(){ upd(); }}); fld(g,"bidPrice","투찰 단가(1벌)",{num:true,live:function(){ upd(); }});
    fld(g,"awardDate","낙찰 통보일",{type:"date",live:function(){ upd(); }}); fld(g,"docsDue","서류 제출기한",{type:"date"});
    var calc=calcBox(pn);
    function upd(){ var p=N("bidPrice"), e=N("estPrice"), q=N("qty"), amt=p!=null&&q!=null?p*q:null, aw=V("awardDate"), sd=selDue();
      tiles(calc,[{l:"투찰 단가",v:won(p),s:e?"예정가격 대비 "+(p!=null?(p/e*100).toFixed(3)+"%":"-"):"",c:p!=null&&e?(p<=e?"ok":"bad"):""},
        {l:"계약금액(예정)",v:amt==null?"-":won(amt),s:amt==null?"":"단가 × "+comma(q)+"벌"},
        {l:"계약보증금",v:amt==null?"-":won(Math.ceil(amt*0.1)),s:"계약금액의 10% 이상"},
        {l:"계약 체결 기한",v:aw?dot(addDays(aw,10)):"-",s:"낙찰 통지 후 10일 안"},
        {l:"업체 선정 마감(권장)",v:sd?dot(sd):"-",s:sd?ddTxt(dday(sd)):""}]); }
    upd();
    sub(pn,"계약서·특수조건에 꼭 넣을 것");
    rules(pn,["구매물량은 학생 신청 인원에 따라 확정(단가계약)","신입생·재학생·전입생 구매·교환·단품 추가 구매에 쓸 충분한 수량, 다음 학년도 전입생 공급 의무","치수 측정 방법·납품 방법과 비용 부담, 무상 A/S 1년","납품기한 넘기면 피해 배상, 하자 교환 책임","하자이행보증보험증권은 납품 때 동복·하복 각각 제출"]);
    law(pn,"근거: 지방계약법 시행령 제42조(낙찰자 결정)·제51조(계약보증금), 길라잡이 Ⅱ-3 계약 체결");
  };
  S.size=function(pn){
    say(pn,"12~1월에 초6·중3 학생과 학부모에게 학교주관구매·교복 지원을 안내하고(예비소집일·배정 통지 때 함께), 등록 때 신청서를 받아 물량을 확정해요. 2월에 신청 학생 수로 소요예산을 신청하면 3월에 교부돼요.");
    var g=grid(pn);
    fld(g,"qtyFixDate","물량 확정일",{type:"date",live:function(){ upd(); }}); fld(g,"qtyFinal","확정 인원(벌)",{num:true,live:function(){ upd(); }});
    fld(g,"sizeStart","치수 측정 시작",{type:"date",live:function(){ upd(); }}); fld(g,"sizeEnd","치수 측정 끝",{type:"date",live:function(){ upd(); }});
    fld(g,"winterDue","동복 납품기한",{type:"date",live:function(){ upd(); }});
    var calc=calcBox(pn);
    function upd(){ var a=V("sizeStart"), b=V("sizeEnd"), n=a&&b?diff(a,b)+1:null, we=false, fx=V("qtyFixDate"), wd=V("winterDue"), min=fx?addDays(fx,40):"";
      if(n!=null&&n>0&&n<40){ for(var i=0;i<n;i++){ var d=pd(addDays(a,i)).getDay(); if(d===0||d===6) we=true; } }
      tiles(calc,[{l:"치수 측정 기간",v:n==null?"-":n+"일"+(we?" · 주말 포함":""),s:"5일 이상, 주말 꼭 포함",c:n==null?"":n>=5&&we?"ok":"bad"},
        {l:"납품기한은 이날 이후",v:min?dot(min):"-",s:"물량 확정 후 최소 40일",c:min&&wd?(wd>=min?"ok":"bad"):""},
        {l:"확정 인원",v:N("qtyFinal")!=null?comma(N("qtyFinal"))+"벌":"-",s:N("qty")!=null?"계획 "+comma(N("qty"))+"벌":""}]); }
    upd();
    law(pn,"근거: 길라잡이 Ⅳ 홍보·구매단계(구매 인원 확정·치수 측정), 2026 주요 유의사항(납품기한 40일 보장), 경남 학교업무 도움자료 7-10");
  };
  S.deliv=function(pn){
    say(pn,"교복선정위원회 학부모·학생 위원 중심으로 검사·검수단을 꾸려 학교가 정한 장소에서 검수해요. 제출 견본품과 혼용률을 비교하고, 제조연월 라벨로 당해 신품인지, 바느질·밑단·이름표 상태를 확인해요.");
    var g=grid(pn);
    fld(g,"winterDone","동복 납품(완료 통지)일",{type:"date",live:function(){ upd(); }}); fld(g,"summerDone","하복 납품(완료 통지)일",{type:"date",live:function(){ upd(); }});
    var calc=calcBox(pn);
    function upd(){ var w=V("winterDone"), s=V("summerDone"), wd=V("winterDue"), sd=V("summerDue");
      function late(d,due){ var n=diff(due,d); return n!=null&&n>0?n+"일 늦음 → 지체상금 검토":""; }
      tiles(calc,[{l:"동복 검사 기한",v:w?dot(addDays(w,14)):"-",s:w?(late(w,wd)||ddTxt(dday(addDays(w,14)))):"통지받은 날부터 14일 안",c:w&&late(w,wd)?"warn":""},
        {l:"동복 교환 안내",v:w?dot(addDays(w,10))+"까지":"-",s:"치수 안 맞으면 10일 안 교환"},
        {l:"하복 검사 기한",v:s?dot(addDays(s,14)):"-",s:s?(late(s,sd)||ddTxt(dday(addDays(s,14)))):"통지받은 날부터 14일 안",c:s&&late(s,sd)?"warn":""},
        {l:"하자이행보증",v:w?dot(addDays(addDays(w,365),-1))+"까지":"-",s:"납품 때 동복·하복 각각 증권 제출, 1년"}]); }
    upd();
    sub(pn,"검수할 때");
    rules(pn,["계약 내용과 다른 이월 제품 납품 여부(전년도 제품은 할인·희망자만)","라벨·시험성적서를 견본품과 대조","사이즈 교환 시기(10일 안)와 A/S 안내"]);
    law(pn,"근거: 지방계약법 시행령 제64조(검사 14일), 길라잡이 Ⅳ 납품·검사·검수, 2026 주요 유의사항");
  };
  S.pay=function(pn){
    say(pn,"검사·검수가 끝나면 청구받은 날부터 5일(토·공휴일 빼고) 안에 대금을 줘요. 납품이 끝나면 2주 안에 만족도 조사를 하고 결과(교복업체명 포함)를 누리집에 올려요.");
    var g=grid(pn);
    fld(g,"claimW","동복 대금 청구일",{type:"date",live:function(){ upd(); }}); fld(g,"claimS","하복 대금 청구일",{type:"date",live:function(){ upd(); }});
    fld(g,"surveyStart","만족도 조사 시작",{type:"date",live:function(){ upd(); }}); fld(g,"surveyEnd","만족도 조사 끝",{type:"date"});
    var calc=calcBox(pn);
    function upd(){ var a=V("claimW"), b=V("claimS"), done=V("summerDone")||V("winterDone"), sv=V("surveyStart");
      tiles(calc,[{l:"동복 대금 지급 기한",v:a?dot(workDays(a,5)):"-",s:a?ddTxt(dday(workDays(a,5))):"청구일 + 5일(토·공휴일 제외)"},
        {l:"하복 대금 지급 기한",v:b?dot(workDays(b,5)):"-",s:b?ddTxt(dday(workDays(b,5))):"청구일 + 5일(토·공휴일 제외)"},
        {l:"만족도 조사 시작 기한",v:done?dot(addDays(done,14)):"-",s:"납품 완료 직후 2주 안",c:done&&sv?(sv<=addDays(done,14)?"ok":"warn"):""},
        {l:"품질검사 결과 보고",v:"교육청 계획 기한",s:"2026년 계획은 9. 4.까지 · 해마다 계획 공문 확인 · 공인시험기관 의뢰, 교당 30만 원"}]); }
    upd();
    sub(pn,"마무리");
    rules(pn,["품질검사: 동복 자켓류(점퍼 등) 또는 바지 1종, 시료 구입·시험 의뢰 후 교육행정데이터통합관리로 보고","교복 구매 가격 학교정보공시 등록, 교복선정위원회 구매 결과 평가","다음 해 1~2월 집행 잔액 정산서 제출·반납"]);
    law(pn,"근거: 지방계약법 시행령 제67조(대가 지급), 2026. 학교주관구매 교복 품질검사 실시 계획, 길라잡이 업무 체크리스트(사후 평가), 경남 학교업무 도움자료 7-10");
  };

  /* ---- 화면 ---- */
  function curStage(){ for(var i=0;i<STAGES.length;i++) if(!P.done[STAGES[i][0]]) return i; return STAGES.length; }
  function draw(){
    if(prefill()) LS.set("gb.p",P);
    app.textContent=""; REF=[];
    var hero=el("div","gb-hero"), si=el("input","sch"); si.placeholder="학교명 (예: ○○중학교)"; si.value=V("school"); si.setAttribute("aria-label","학교명");
    si.oninput=function(){ F.school=si.value.trim(); put(); }; si.onchange=function(){ draw(); }; hero.appendChild(si);
    var yl=el("label"), yi=el("input","yr"); yi.type="number"; yi.min="2026"; yi.max="2035"; yi.value=V("year"); yl.appendChild(yi); yl.appendChild(document.createTextNode("학년도 신입생")); hero.appendChild(yl);
    yi.onchange=function(){ F.year=yi.value; put(); draw(); };
    hero.appendChild(el("span","sp"));
    var mb=btn("자료 내보내기","btn ghost"); hero.appendChild(mb); app.appendChild(hero);
    var setBox=el("div"); app.appendChild(setBox); mb.onclick=function(){ if(setBox.firstChild){ setBox.textContent=""; return; } settings(setBox); };

    var cur=curStage(), sel=-1; STAGES.forEach(function(s,i){ if(s[0]===view.open) sel=i; }); if(sel<0) sel=Math.min(cur,STAGES.length-1);
    /* 지금 할 일 */
    var now=el("div","gb-now");
    if(cur>=STAGES.length){ now.appendChild(el("b",null,"이번 학년도 교복 구매를 모두 마쳤어요.")); }
    else { now.appendChild(el("span","cv-dd",STAGES[cur][3])); var t=el("span"); t.appendChild(el("b",null,"지금: "+STAGES[cur][2])); now.appendChild(t);
      var sd=selDue(); if(cur<=5&&sd&&dday(sd)>=0){ var n=dday(sd); now.appendChild(el("span","cv-dd "+(n<0?"late":n<=30?"soon":""),"업체 선정 "+ddTxt(n))); } }
    app.appendChild(now);
    /* 좌→우 인덱스 */
    var nv=el("nav","cv-idx"); nv.style.setProperty("--n",STAGES.length);
    STAGES.forEach(function(s,i){ var st=P.done[s[0]]?"done":i===cur?"cur":"todo", b=btn("","cv-ix "+st+(i===sel?" sel":""),function(){ view.open=s[0]; draw(); });
      if(i===sel) b.setAttribute("aria-current","step"); b.appendChild(el("span","n",st==="done"?"✓":String(i+1))); b.appendChild(el("span","t",s[1])); nv.appendChild(b); });
    app.appendChild(nv);
    var pn=el("section","cv-pane"); app.appendChild(pn);
    var s=STAGES[sel], hd=el("div","cv-ph"); hd.appendChild(el("h4",null,s[2])); hd.appendChild(el("span",null,s[3]+(P.done[s[0]]?" · "+dot(P.done[s[0]])+" 마침":""))); pn.appendChild(hd);
    S[s[0]](pn);
    docs(pn,s[0]);
    var nb=el("div","cv-next"); pn.appendChild(nb);
    if(P.done[s[0]]) nb.appendChild(btn("이 단계 다시 열기","btn ghost",function(){ delete P.done[s[0]]; put(); draw(); }));
    else nb.appendChild(btn(sel<STAGES.length-1?"이 단계 마쳤어요 · "+STAGES[sel+1][1]+"(으)로":"모두 마쳤어요","btn",function(){ P.done[s[0]]=today(); view.open=sel<STAGES.length-1?STAGES[sel+1][0]:s[0]; put(); draw(); top(); }));
    var pr=el("div","cv-pn"); pn.appendChild(pr);
    pr.appendChild(sel>0?btn("← "+STAGES[sel-1][1],"cv-back",function(){ view.open=STAGES[sel-1][0]; draw(); top(); }):el("span"));
    if(sel<STAGES.length-1) pr.appendChild(btn(STAGES[sel+1][1]+" →","cv-back",function(){ view.open=STAGES[sel+1][0]; draw(); top(); }));
    /* 경남 자료 */
    var gn=el("div","gb-gn"); app.appendChild(gn); gn.appendChild(el("div","cv-h","경남교육청 자료")); var gm=el("div","tkmsg"); fileChips(gn,GNDOCS,gm); gn.appendChild(gm);
  }
  function top(){ var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function settings(box){ box.textContent=""; var s=el("div","cv-set"); box.appendChild(s);
    var r=el("div","cv-btns"); s.appendChild(r); var m=el("div","tkmsg"); s.appendChild(m);
    r.appendChild(btn("내보내기","btn ghost",function(){ T.saveFile(new Blob([JSON.stringify(P,null,1)],{type:"application/json"}),"교복구매_"+(V("year")||"")+"_"+today()+".json").then(function(){ msg(m,"내보냈어요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }));
    var lb=el("label","btn ghost","불러오기"), fi=el("input"); fi.type="file"; fi.accept=".json"; fi.hidden=true; lb.appendChild(fi); r.appendChild(lb);
    fi.onchange=function(){ var f=fi.files[0]; if(!f) return; f.text().then(function(t){ var j=JSON.parse(t); if(!j||!j.f) throw 0; LS.set("gb.p",j); P=load(); F=P.f; draw(); }).catch(function(){ msg(m,"교복 구매 파일을 읽지 못했어요.","bad"); }); };
    r.appendChild(btn("새 학년도 시작","cv-x",function(){ if(!confirm("지금 입력한 교복 구매 기록을 모두 비우고 새로 시작할까요? (먼저 내보내기를 권해요)")) return;
      var keep={school:V("school"),fax:V("fax"),email:V("email"),officeTel:V("officeTel"),teachTel:V("teachTel"),passScore:V("passScore")}; LS.set("gb.p",{f:Object.assign(keep,{year:String((Y()||+defYear()-1)+1)}),members:P.members.map(function(x){ return {grp:x.grp,role:x.role,pos:x.pos,name:x.name}; })});
      P=load(); F=P.f; view.open=null; draw(); }));
  }
  draw();
}
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.gb=build;
})();
