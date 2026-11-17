/* ======================================================================
   사립학교 본예산 — 경남 기준으로 처음부터 다시 만든 도구
   한 학년도 교비회계 본예산을 여덟 단계(좌→우)로 따라간다.
     계획 → 의견수렴 → 요구서 → 조정 → 학운위 → 법인 제출 → 이사회 → 보고·공시
   기한은 회계연도 개시일(3. 1.)에서 거꾸로 센다: 전입금 교부계획 50일 전, 관할청 보고·누리집 공시 5일 전.
   기준
   - 경남교육청 「2026학년도 사학기관 예산편성 및 결산지침」
   - 사립학교법 제29조, 같은 법 시행령 제14조, 사학기관 재무·회계 규칙 제12조·제16조·제24조
   단계 문안·붙임 hwpx·예산요구안 엑셀 엔진은 원래 '본예산 길라잡이'(SRC·엔진)를 그대로 쓴다.
   저장: pri.p (localStorage)
   ====================================================================== */
(function(){ "use strict";
var SRC={"pri":{"steps":[{"t":"본예산 편성 계획 수립 및 사전교육","when":"{P}. 12월 초~중순","who":"행정실","law":"법인 이사장은 예산편성 전에 <b>교육청 예산편성지침과 이사장 예산편성요령</b>(학교 전출금 규모 등)을 학교에 시달합니다(<b>「사학기관 재무·회계 규칙」 제12조</b>). 학교는 12월 초 자체수입 추계·전년도 가결산을 하고, 12월 중순 <b>예산편성 계획</b>을 세워 <b>소속 교직원</b>을 대상으로 자체 교육을 실시합니다(경남 지침 본예산 편성 절차).","todo":["편성 일정 확정 (위 '예산 편성 일정 한눈에 보기' 참고)","법인 예산편성요령(학교 전출금 규모 등) 받기","교직원 자체교육 일정 정하기","예산요구서 제출 기한 정하기"],"docs":[{"kind":"in","label":"편성 계획(내부결재)","title":"{Y}학년도 교비회계 본예산 편성 계획","body":"1. 관련\n  가. 「사학기관 재무·회계 규칙」\n  나. 경상남도교육청 학교지원과-[[gno|○○○○]]([[gdate.|{P}. ○○. ○○.]])\n2. {Y}학년도 교비회계 본예산 편성을 위하여 다음과 같이 계획을 수립하고자 합니다.\n  가. 기본 방향\n    1) 학교교육계획과 연계한 사업 중심의 예산 편성\n    2) 학교구성원(학생·학부모·교직원) 의견 수렴 및 반영\n    3) 가용재원 범위 안에서 사업 우선순위에 따른 편성\n  나. 추진 일정\n    1) 교직원 자체교육: [[edu|{P}. 12. ○.(○)]]\n    2) 학교구성원 의견수렴: [[op.|{P}. 12. ○.]] ~ [[opE.|{P}. 12. 31.]]\n    3) 예산요구서 제출: [[req|{P}. 12. ○○.(○)]]까지\n    4) 예산조정위원회 개최: {Y}. 1월 중\n    5) 학교운영위원회 심의: [[com|{Y}. 2. ○○.(○)]]\n    6) 법인 이사장에게 예산안 제출 및 이사회 의결: 회계연도 개시 전\n    7) 관할청 보고 및 누리집 공시: {d5}까지(개시 5일 전)\n  다. 교직원 자체교육\n    1) 일시/장소: [[edu|{P}. 12. ○.(○)]] [[eduT|○○:○○]] / [[eduP|○○실]]\n    2) 대상: 소속 교직원\n    3) 내용: {Y}학년도 학교운영시책 및 예산편성 방향, 예산요구서 작성 방법\n  라. 예산요구서 제출: [[req|{P}. 12. ○○.(○)]]까지, 부서(담당자)별 작성 후 행정실 제출\n\n붙임  1. {Y}학년도 본예산 편성 일정표 1부.\n      2. 세입·세출예산요구서 서식 1부.  끝.","attach":["pri1"],"make":["sched"]}]},{"t":"학교구성원 의견수렴","when":"{P}. 12월","who":"행정실","law":"학교 누리집과 가정통신문으로 <b>「학생·학부모 참여예산제」</b>와 참여 방법을 안내하고(제출 서식 함께), 학생·학부모의 <b>제안(의견)서</b>를 받습니다. 인편·우편으로 직접 내거나 학부모회·학생회를 통해 낼 수 있고, 취합한 의견은 담당부서가 검토해 예산요구서에 반영합니다(경남 지침 「학생·학부모 참여예산제」 운영). 고등학교 이하 학교운영지원비 예산편성에는 학부모회 의견을 들어야 합니다(<b>「사학기관 재무·회계 규칙」 제16조제2항</b>).","todo":["가정통신문 발송(참여예산제 안내·제안서 서식)","학교 누리집에 참여예산제 안내·제안서 게시","들어온 의견을 담당부서로 배정 → 검토 후 예산요구서 반영"],"docs":[{"kind":"in","label":"의견수렴 실시(내부결재)","title":"{Y}학년도 교비회계 본예산 편성 의견수렴 실시","body":"1. 관련: 경상남도교육청 학교지원과-[[gno|○○○○]]([[gdate.|{P}. ○○. ○○.]])\n2. {Y}학년도 교비회계 예산편성에 학교구성원의 의견을 반영하기 위하여 다음과 같이 의견수렴을 실시하고자 합니다.\n  가. 기간: [[op.|{P}. 12. ○.]] ~ [[opE.|{P}. 12. 31.]]\n  나. 대상: 학생, 학부모(「학생·학부모 참여예산제」)\n  다. 방법: 가정통신문 발송, 학교 누리집 게시 — 제안(의견)서 직접 제출 또는 학부모회·학생회를 통해 제출\n  라. 결과 활용\n    1) 예산조정위원회에서 반영 여부 검토\n    2) 학교운영위원회·이사회 심의 시 요구사업 설명 및 회의록 명기\n    3) 반영된 사업 등 운영 결과를 예산 확정 후 7일 이내 학교 누리집 『학생·학부모가 참여하는 학교예산 편성』에 공개\n\n붙임  가정통신문 1부.  끝.","attach":["priLetter"]}]},{"t":"예산요구서 제출 안내","when":"{P}. 12월 (사전교육 직후)","who":"전 교직원 → 행정실","law":"교직원으로 하여금 교육과정 및 학교운영에 필요한 경비를 적은 <b>예산요구서</b>를 부서별 또는 개인별로 제출하게 하고(12월 중순), 세부사업별·부서별로 취합해 세입규모보다 요구액이 많으면 조정합니다(12월 중순~하순, 경남 지침 본예산 편성 절차). 붙임 요구서 양식은 참고용입니다.","todo":["교내 메신저로 서식과 기한 안내","제출 현황 확인·독려"],"docs":[{"kind":"memo","label":"교내 메신저 안내문","title":"[행정실] {Y}학년도 예산요구서 제출 안내 ([[req.|{P}. 12. ○○.]]까지)","body":"선생님들 안녕하세요. 행정실입니다.\n{Y}학년도 교비회계 본예산 편성을 위하여 부서(담당자)별 예산요구서를 받습니다.\n\n○ 제출 기한: [[req|{P}. 12. ○○.(○)]]까지\n○ 제출 서식: 세입·세출예산요구서 (붙임)\n○ 작성 요령\n  - 세부사업별로 산출내역(단가×수량)을 구체적으로 적어 주세요.\n  - 전년도 예산액과 비교해 늘거나 준 이유를 적어 주세요.\n  - 총액배분사업비·목적사업비는 교육청 사업 내용과 금액을 확인해 주세요.\n○ 제출 방법: 메신저 회신 또는 행정실 직접 제출\n\n문의: 행정실 ○○○ (☎ ○○○○)","attach":["pri1"],"make":["reqForm","req"]}]},{"t":"전입금 교부계획 확인 및 예산조정위원회","when":"교부계획 통보 {d50}까지 → {Y}. 1월 중순~하순 조정","who":"학교장(조정위원회)","must":true,"law":"회계연도 개시 <b>50일 전까지</b> 전입금 교부계획이 통지되면 자체세입을 포함한 세입예산을 확정하고, 가용재원 안에서 <b>각 부서 또는 전 교직원 간</b>에 구체적으로 예산을 조정해 예산안을 확정합니다(1월 중순~하순, 경남 지침 본예산 편성 절차). 조정 결과는 내부결재로 남겨 둡니다.","todo":["재정결함보조금·총액배분사업비·목적사업비 교부계획 확인","부서 요구액 합계와 가용재원 비교표 만들기","조정위원회 개최·회의록 작성","결과 내부결재"],"docs":[{"kind":"in","label":"조정위원회 결과(내부결재 필수)","title":"{Y}학년도 교비회계 예산조정위원회 개최 결과 보고","body":"1. 관련: 경상남도교육청 학교지원과-[[ano|○○○○]]([[alloc.|{Y}. ○○. ○○.]]) ({Y}학년도 교비회계 전입금 교부계획 통보)\n2. {Y}학년도 교비회계 세입·세출예산안 확정을 위한 예산조정위원회 결과를 다음과 같이 보고합니다.\n  가. 일시/장소: [[adj|{Y}. 1. ○○.(○)]] [[adjT|○○:○○]] / [[adjP|○○실]]\n  나. 참석: 교감, 부장교사, 행정실장 등 ○명\n  다. 세입 규모: 총 ○○○,○○○천원\n    1) 교육비특별회계 이전수입(재정결함보조금 등) ○○○,○○○천원\n    2) 목적사업비 ○○,○○○천원\n    3) 수익자부담수입 ○○,○○○천원\n    4) 기타(전년도이월금 등) ○,○○○천원\n  라. 조정 결과: 부서 요구액 [[_req|○○○,○○○]]천원 → 조정액 [[_adj|○○○,○○○]]천원\n  마. 주요 조정 내용\n[[_adjList|    1) ○○○ 사업: ○,○○○천원 → ○,○○○천원(사유: ○○○)]]\n    [[_adjNext|2]]) 학교구성원 의견 반영 사업: ○○○\n\n붙임  1. 예산조정 결과표 1부.\n      2. 예산조정위원회 회의록 1부.  끝.","attach":[],"make":["adj","minutes","req"]}]},{"t":"학교운영위원회 심의","when":"{Y}. 2월 (이사회 제출 전)","who":"학교장 → 학교운영위원회","law":"학교장은 교비회계 예산안을 <b>학교운영위원회의 심의</b>를 거쳐 법인 이사장에게 제출합니다. <b>「사립학교법」 제29조제4항제2호</b>·「사학기관 재무·회계 규칙」 제16조제2항(학교운영위원회 <b>심의</b>를 거쳐야 함) · 요구사업이 있으면 설명하고 회의록에 명기합니다.","todo":["예산총칙·세입세출예산서 준비","학교운영위원회 안건 제출(내부결재)","요구사업 설명 → 회의록 명기","회의록 사본 확보(관할청 보고 때 첨부)"],"docs":[{"kind":"in","label":"학운위 심의 요청(내부결재)","title":"{Y}학년도 교비회계 세입·세출예산안 학교운영위원회 심의 요청","body":"1. 관련: 「사립학교법」 제29조, 「사학기관 재무·회계 규칙」 제16조\n2. {Y}학년도 교비회계 세입·세출예산안을 붙임과 같이 편성하여 학교운영위원회에 심의를 요청하고자 합니다.\n  가. 예산 규모: 세입·세출 각각 ○○○,○○○,○○○원\n  나. 심의 일정(안): 제[[comNo|○○]]회 학교운영위원회 [[com|{Y}. 2. ○○.(○)]]\n  다. 학교구성원 의견수렴 결과: 요구사업 ○건(반영 ○건, 미반영 ○건) — 심의 시 설명\n  라. 심의 후 조치: 법인 이사장에게 예산안 제출(회계연도 개시 전)\n\n붙임  1. {Y}학년도 교비회계 예산총칙 1부.\n      2. {Y}학년도 교비회계 세입·세출예산서 1부.  끝.","attach":[],"self":"예산총칙·예산서: 에듀파인에서 다운로드"}]},{"t":"예산안 법인 이사장 제출","when":"회계연도 개시 전 — 관할청 보고({d5}) 전에 마치기","who":"학교장 → 이사장","must":true,"law":"학교에 속하는 회계의 예산은 학교의 장이 편성하여 <b>매 회계연도 개시 전에</b> 법인 이사장에게 제출해야 합니다. <b>「사학기관 재무·회계 규칙」 제16조제2항</b>(지침 인용, 2025. 4. 18. 개정 — 종전 '개시 1월 전까지')","todo":["학운위 심의 결과 반영","예산안·학운위 회의록 사본을 법인에 제출(시행문)"],"docs":[{"kind":"out","label":"법인 제출 시행문","title":"{Y}학년도 교비회계 세입·세출예산안 제출","body":"수신  {C} 이사장\n\n1. 관련: 「사학기관 재무·회계 규칙」 제16조\n2. {Y}학년도 {S} 교비회계 세입·세출예산안을 학교운영위원회 심의를 거쳐 붙임과 같이 제출하오니 이사회 의결을 받아 주시기 바랍니다.\n  가. 예산 규모: 세입·세출 각각 ○○○,○○○,○○○원\n  나. 학교운영위원회 심의: 제[[comNo|○○]]회([[com.|{Y}. 2. ○○.]]) — 원안(수정) 의결\n\n붙임  1. {Y}학년도 교비회계 세입·세출예산서 1부.\n      2. 학교운영위원회 회의록(사본) 1부.  끝.","attach":[]}]},{"t":"이사회 의결 결과 접수 및 예산 확정","when":"회계연도 개시 전 — 관할청 보고({d5}) 전에 마치기","who":"이사장 → 학교장","must":true,"law":"이사장은 제출받은 예산안을 <b>매 회계연도 개시 전에</b> 이사회 의결을 받아 학교의 장에게 송부해야 합니다. <b>「사학기관 재무·회계 규칙」 제16조제3항</b>(지침 인용)","todo":["이사회 의결 결과 공문 접수","K-에듀파인 예산 확정 처리","이사회 회의록 사본 확보(관할청 보고 때 첨부)"],"docs":[{"kind":"in","label":"예산 확정(내부결재)","title":"{Y}학년도 교비회계 본예산 이사회 의결 결과 보고 및 예산 확정","body":"1. 관련: {C}-○○○({Y}. ○○. ○○.)\n2. {Y}학년도 교비회계 세입·세출예산안에 대한 이사회 의결 결과를 다음과 같이 보고하고, 예산을 확정하고자 합니다.\n  가. 학교운영위원회 심의: 제[[comNo|○○]]회([[com.|{Y}. 2. ○○.]])\n  나. 이사회 의결: [[brd|{Y}. 2. ○○.(○)]] — 원안(수정) 의결\n  다. 확정 예산: 세입·세출 각각 ○○○,○○○,○○○원\n\n붙임  1. 이사회 회의록(사본) 1부.\n      2. {Y}학년도 교비회계 세입·세출예산서 1부.  끝.","attach":[]}]},{"t":"관할청 보고 및 누리집 공시","when":"{d5}까지 (개시 5일 전)","who":"학교","must":true,"law":"학교법인은 교비회계 예산서를 <b>매 회계연도 개시 5일 이전</b>에 관계 부속서류를 첨부하여 관할청에 보고하고, 해당 학교 누리집에 <b>1년간 공개</b>합니다. <b>「사립학교법 시행령」 제14조</b>·「사학기관 재무·회계 규칙」 제24조 — 학교회계 예산서를 이사회 심의·의결로 확정한 뒤 개시 5일 전까지 관할청에 제출하고, 학교누리집/학교회계현황에 1년간 공개합니다. 공개는 학교회계시스템에서 내려받은 <b>원본파일 그대로</b>(PDF 권장, 별도 편집 금지), 총칙 등 부속서류도 함께 올립니다(경남 지침).","todo":["예산서(K-에듀파인 예산서 일괄출력) 확인","학운위·이사회 회의록 사본 첨부","교육청에 보고(시행문)","학교누리집/학교회계현황에 예산서 원본파일 공개(1년간)","참여예산 반영 결과 누리집 공개(예산 확정 후 7일 이내)"],"docs":[{"kind":"out","label":"관할청 보고 시행문","title":"{Y}학년도 교비회계 본예산서 보고","body":"수신  경상남도교육감(참조: 학교지원과장)\n\n1. 관련: 「사립학교법 시행령」 제14조(예산과 결산의 보고 및 공시)\n2. {Y}학년도 {S} 교비회계 본예산서를 붙임과 같이 보고합니다.\n  가. 예산 규모: 세입·세출 각각 ○○○,○○○,○○○원\n  나. 학교운영위원회 심의: [[com.|{Y}. 2. ○○.]]\n  다. 이사회 의결: [[brd.|{Y}. 2. ○○.]]\n  라. 누리집 공시: [[pubd.|{Y}. 2. ○○.]](1년간 게재)\n\n붙임  1. {Y}학년도 교비회계 세입·세출예산서 1부.\n      2. 학교운영위원회 회의록(사본) 1부.\n      3. 이사회 회의록(사본) 1부.  끝.","attach":["pri35"]}]}],"sched":[["{P}. 12월 초~중순","사학기관 재무·회계 규칙 제12조, 경남 지침"],["{P}. 12월","경남 지침 학생·학부모 참여예산제"],["{P}. 12월 중순~하순","경남 지침 본예산 편성 절차"],["교부계획 {d50}까지 → 1월 중순~하순","경남 지침 본예산 편성 절차"],["{Y}. 2월","사립학교법 제29조제4항"],["개시 전 (관할청 보고 {d5} 전)","사학기관 재무·회계 규칙 제16조제2항"],["개시 전 (관할청 보고 {d5} 전)","사학기관 재무·회계 규칙 제16조제3항"],["{d5}까지","사립학교법 시행령 제14조"]],"rows":[["교직원 자체교육","[[edu|{P}. 12. ○.(○)]]","행정실"],["학교구성원 의견수렴(가정통신문·누리집)","[[op.|{P}. 12. ○.]] ~ [[opE.|{P}. 12. 31.]]","행정실"],["부서별 예산요구서 제출","[[req|{P}. 12. ○○.(○)]]까지","각 부서 → 행정실"],["전입금 교부계획 확인","{d50}까지","교육청"],["예산조정위원회 개최","[[adj|{Y}. 1월 중]]","예산조정위원회"],["학교운영위원회 심의","[[com|{Y}. 2월]]","학교운영위원회"],["법인 이사장에게 예산안 제출","회계연도 개시 전","학교장"],["이사회 의결 및 예산 확정","[[brd|회계연도 개시 전]]","이사회"],["관할청 제출 및 누리집 공개","{d5}까지","학교"]],"files":{"priLetter":["가정통신문(교비회계 본예산 편성 의견 참여).hwpx","가정통신문 — 본예산 편성 의견 참여"],"pri1":["세입·세출예산요구서(참고 양식).hwpx","세입·세출예산요구서(참고 양식)"],"pri35":["교비회계 예산편성 및 결산 확인사항(참고).hwpx","예산편성 및 결산 확인사항(참고)"]}},"pub":{"steps":[{"t":"본예산 편성 계획 수립 및 교직원 사전교육","when":"{P}. 12월 초","who":"행정실","law":"학교장은 지침이 시달되면 교직원에게 학교교육시책 및 예산편성에 필요한 <b>사전교육</b>을 실시합니다. <b>학교회계 규칙 제12조</b>(지침 인용) · 편성 계획과 사전교육은 <b>내부결재</b>로 남깁니다.","todo":["편성 일정 확정 (위 '예산 편성 일정 한눈에 보기' 참고)","사전교육 일시·장소 정하기","예산요구서 제출 기한 정하기"],"docs":[{"kind":"in","label":"편성 계획(내부결재)","title":"{Y}학년도 학교회계 본예산 편성 계획","body":"1. 관련\n  가. 「초·중등교육법」 제30조의3(학교회계의 운영)\n  나. 경상남도교육청 학교지원과-[[gno|○○○○]]([[gdate.|{P}. ○○. ○○.]])\n2. {Y}학년도 학교회계 본예산 편성을 위하여 다음과 같이 계획을 수립하고자 합니다.\n  가. 기본 방향\n    1) 학교교육계획과 연계한 사업 중심의 예산 편성\n    2) 학교구성원(학생·학부모·교직원) 의견 수렴 및 반영\n    3) 가용재원 범위 안에서 사업 우선순위에 따른 편성\n  나. 추진 일정\n    1) 교직원 사전교육: [[edu|{P}. 12. ○.(○)]]\n    2) 학교구성원 의견수렴: [[op.|{P}. 12. ○.]] ~ [[opE.|{P}. 12. 31.]]\n    3) 예산요구서 제출: [[req|{P}. 12. ○○.(○)]]까지\n    4) 예산조정위원회 개최: {Y}. 1월 중(전입금 교부계획 통보 후)\n    5) 예산안 학교운영위원회 제출: {d30}까지\n    6) 학교운영위원회 심의: {d5}까지\n    7) 예산 확정 및 공개: 확정 후 10일 이내\n  다. 교직원 사전교육\n    1) 일시/장소: [[edu|{P}. 12. ○.(○)]] [[eduT|○○:○○]] / [[eduP|○○실]]\n    2) 대상: 전 교직원\n    3) 내용: {Y}학년도 학교교육시책 및 예산편성 방향, 예산요구서 작성 방법\n  라. 예산요구서 제출\n    1) 기한: [[req|{P}. 12. ○○.(○)]]까지\n    2) 방법: 부서(담당자)별 세입·세출예산요구서 작성 후 행정실 제출\n\n붙임  1. {Y}학년도 본예산 편성 일정표 1부.\n      2. 세입·세출예산요구서 서식 각 1부.  끝.","attach":["pub1","pub2"],"make":["sched"]}]},{"t":"학교구성원 의견수렴","when":"{P}. 12월","who":"행정실","law":"학교장은 예산편성 과정에 학교구성원이 참여하도록 <b>의견을 수렴</b>합니다(누리집·가정통신문 등). 요구사업이 있으면 학교운영위원회 심의 때 설명하고 <b>회의록에 명기</b>하며, 예산 공개 때 반영 사업을 안내합니다. <b>학교회계 규칙 제12조</b>(지침 인용)","todo":["가정통신문 발송","학교 누리집 [예산참여]에 의견서 게시","들어온 의견 목록 정리(학운위 설명용)"],"docs":[{"kind":"in","label":"의견수렴 실시(내부결재)","title":"{Y}학년도 학교회계 본예산 편성 의견수렴 실시","body":"1. 관련: 경상남도교육청 학교지원과-[[gno|○○○○]]([[gdate.|{P}. ○○. ○○.]])\n2. {Y}학년도 학교회계 예산편성에 학교구성원의 의견을 반영하기 위하여 다음과 같이 의견수렴을 실시하고자 합니다.\n  가. 기간: [[op.|{P}. 12. ○.]] ~ [[opE.|{P}. 12. 31.]]\n  나. 대상: 학생, 학부모(「학생·학부모 참여예산제」)\n  다. 방법: 가정통신문 발송, 학교 누리집 게시 — 제안(의견)서 직접 제출 또는 학부모회·학생회를 통해 제출\n  라. 결과 활용\n    1) 예산조정위원회에서 반영 여부 검토\n    2) 학교운영위원회 예산 심의 시 요구사업 설명 및 회의록 명기\n    3) 예산 공개 시 의견 반영 사업 안내\n\n붙임  가정통신문 1부.  끝.","attach":["pubLetter"]}]},{"t":"예산요구서 제출 안내","when":"{P}. 12월 (사전교육 직후)","who":"전 교직원 → 행정실","law":"교직원은 교육과정 운영과 학교운영에 필요한 경비를 적은 <b>세입·세출예산요구서</b>를 개인별 또는 부서별로 제출합니다. [서식1]·[서식2]","todo":["교내 메신저로 서식과 기한 안내","제출 현황 확인·독려"],"docs":[{"kind":"memo","label":"교내 메신저 안내문","title":"[행정실] {Y}학년도 예산요구서 제출 안내 ([[req.|{P}. 12. ○○.]]까지)","body":"선생님들 안녕하세요. 행정실입니다.\n{Y}학년도 학교회계 본예산 편성을 위하여 부서(담당자)별 예산요구서를 받습니다.\n\n○ 제출 기한: [[req|{P}. 12. ○○.(○)]]까지\n○ 제출 서식: 세입예산요구서(해당 시), 세출예산요구서 (붙임)\n○ 작성 요령\n  - 세부사업별로 산출내역(단가×수량)을 구체적으로 적어 주세요.\n  - 전년도 예산액과 비교해 늘거나 준 이유를 적어 주세요.\n  - 목적사업비(교육청 지정 사업)는 공문의 사업 내용과 금액을 확인해 주세요.\n○ 제출 방법: 메신저 회신 또는 행정실 직접 제출\n\n문의: 행정실 ○○○ (☎ ○○○○)","attach":["pub1","pub2"],"make":["reqForm","req"]}]},{"t":"전입금 교부계획 확인 및 예산조정위원회","when":"교부계획 통보 {d50}까지 → {Y}. 1월 중순~하순 조정","who":"학교장(조정위원회)","must":true,"law":"관할청은 회계연도 개시 <b>50일 전까지</b> 연간 전입금 총규모와 분기별 교부계획을 통보합니다(<b>학교회계 규칙 제11조</b>, 지침 인용). 학교장은 자체세입을 포함한 세입예산을 확정하고 <b>조정위원회(교직원회의 또는 부장회의)</b>에서 예산을 조정해 예산안을 확정합니다. <b>※ 내부결재 필수</b>","todo":["학교기본운영비·목적사업비 교부계획 공문 확인","부서 요구액 합계와 가용재원 비교표 만들기","조정위원회 개최·회의록 작성","결과 내부결재"],"docs":[{"kind":"in","label":"조정위원회 결과(내부결재 필수)","title":"{Y}학년도 학교회계 예산조정위원회 개최 결과 보고","body":"1. 관련: 경상남도교육청 학교지원과-[[ano|○○○○]]([[alloc.|{Y}. ○○. ○○.]]) ({Y}학년도 학교회계전입금 교부계획 통보)\n2. {Y}학년도 학교회계 세입·세출예산안 확정을 위한 예산조정위원회 결과를 다음과 같이 보고합니다.\n  가. 일시/장소: [[adj|{Y}. 1. ○○.(○)]] [[adjT|○○:○○]] / [[adjP|○○실]]\n  나. 참석: 교감, 부장교사, 행정실장 등 ○명\n  다. 세입 규모: 총 ○○○,○○○천원\n    1) 학교운영비전입금(학교기본운영비) ○○○,○○○천원\n    2) 목적사업비전입금 ○○,○○○천원\n    3) 수익자부담수입 ○○,○○○천원\n    4) 기타(전년도이월금 등) ○,○○○천원\n  라. 조정 결과: 부서 요구액 [[_req|○○○,○○○]]천원 → 조정액 [[_adj|○○○,○○○]]천원\n  마. 주요 조정 내용\n[[_adjList|    1) ○○○ 사업: ○,○○○천원 → ○,○○○천원(사유: ○○○)]]\n    [[_adjNext|2]]) 학교구성원 의견 반영 사업: ○○○\n\n붙임  1. 예산조정 결과표 1부.\n      2. 예산조정위원회 회의록 1부.  끝.","attach":[],"make":["adj","minutes","req"]}]},{"t":"예산안 학교운영위원회 제출","when":"{d30}까지 (개시 30일 전)","who":"학교장","must":true,"law":"학교의 장은 세입세출예산안을 편성하여 <b>회계연도가 시작되기 30일 전까지</b> 학교운영위원회에 제출해야 합니다. <b>「초·중등교육법」 제30조의3제2항</b> · 위원장은 심의 회의 <b>7일 전까지</b> 위원에게 예산안을 통지합니다(학교회계 규칙 제14조, 지침 인용).","todo":["예산총칙·세입세출예산서·세부사업설명서 출력","학교운영위원회 안건 제출(내부결재)","회의 7일 전 위원 통지 확인"],"docs":[{"kind":"in","label":"학운위 심의 요청(내부결재)","title":"{Y}학년도 학교회계 세입·세출예산안 학교운영위원회 심의 요청","body":"1. 관련: 「초·중등교육법」 제30조의3(학교회계의 운영)\n2. {Y}학년도 학교회계 세입·세출예산안을 붙임과 같이 편성하여 학교운영위원회에 심의를 요청하고자 합니다.\n  가. 예산 규모: 세입·세출 각각 ○○○,○○○,○○○원\n  나. 제출 기한: {d30}까지(회계연도 개시 30일 전)\n  다. 심의 일정(안): 예·결산소위원회 [[sub|{Y}. 2. ○.(○)]], 학교운영위원회 [[com|{Y}. 2. ○○.(○)]]\n  라. 위원 통지: 회의 개최 7일 전까지 예산안 송부\n  마. 학교구성원 의견수렴 결과: 요구사업 ○건(반영 ○건, 미반영 ○건) — 심의 시 설명\n\n붙임  1. {Y}학년도 학교회계 예산총칙 1부.\n      2. {Y}학년도 학교회계 세입·세출예산서 1부.\n      3. 세부사업설명서 1부.  끝.","attach":[],"self":"예산총칙·예산서: 에듀파인에서 다운로드"}]},{"t":"예·결산소위원회 심사 및 학교운영위원회 심의","when":"{d5}까지 (개시 5일 전)","who":"학교운영위원회","must":true,"law":"학교운영위원회는 예산안을 <b>회계연도가 시작되기 5일 전까지</b> 심의합니다. <b>「초·중등교육법」 제30조의3제3항</b> · 심의 효율화를 위해 <b>예·결산소위원회</b>를 구성합니다(학생 수 100명 미만 학교는 생략 가능). 학교장은 제안 설명을 하고, 학운위는 학교장 동의 없이 세출예산 각 목을 증액하거나 새 목을 둘 수 없습니다(학교회계 규칙 제14조, 지침 인용).","todo":["예·결산소위원회 심사(심사보고서 작성)","학교운영위원회 본회의 — 학교장 제안 설명","학교구성원 요구사업 설명 → 회의록에 명기","심의 결과 받기"],"docs":[{"kind":"in","label":"심의 결과 보고 및 예산 확정(내부결재)","title":"{Y}학년도 학교회계 본예산 학교운영위원회 심의 결과 보고 및 예산 확정","body":"1. 관련: 「초·중등교육법」 제30조의3(학교회계의 운영)\n2. {Y}학년도 학교회계 세입·세출예산안에 대한 학교운영위원회 심의 결과를 다음과 같이 보고하고, 예산을 확정하고자 합니다.\n  가. 예·결산소위원회 심사: [[sub|{Y}. 2. ○.(○)]], 심사 결과 ○○\n  나. 학교운영위원회 심의: 제[[comNo|○○]]회 학교운영위원회([[com|{Y}. 2. ○○.(○)]])\n  다. 심의 결과: 원안 의결(또는 수정 의결 — 수정 내용: ○○○)\n  라. 확정 예산: 세입·세출 각각 ○○○,○○○,○○○원\n  마. 학교구성원 요구사업 설명 및 회의록 명기 여부: 명기함\n\n붙임  1. 예·결산소위원회 심사보고서 1부.\n      2. 학교운영위원회 회의록(사본) 1부.\n      3. {Y}학년도 학교회계 세입·세출예산서 1부.  끝.","attach":["pub19","pub18"]}]},{"t":"예산 확정 및 공개","when":"{dEnd}까지 확정 → 확정 후 10일 이내 공개","who":"학교장","law":"학교장은 학교회계 세입·세출예산을 확정하고, <b>확정 후 10일 이내</b>에 누리집 탑재·가정통신문 등으로 공개합니다(지침 예산편성 절차). 예산 공개 때 <b>학교구성원 의견 반영 사업</b>을 안내합니다. 개시 전까지 확정되지 않으면 인건비 등은 전년도 예산에 준하여 집행할 수 있습니다(「초·중등교육법」 제30조의3제4항).","todo":["K-에듀파인 예산 확정 처리","학교 누리집 예산 공개(의견 반영 사업 포함)","가정통신문 안내(필요 시)"],"docs":[{"kind":"in","label":"예산 공개(내부결재)","title":"{Y}학년도 학교회계 본예산 공개","body":"1. 관련: 「초·중등교육법」 제30조의3(학교회계의 운영)\n2. 확정된 {Y}학년도 학교회계 본예산을 다음과 같이 공개하고자 합니다.\n  가. 공개 내용: 예산총칙, 세입·세출예산서, 학교구성원 의견 반영 사업\n  나. 공개 방법: 학교 누리집 [예산공개] 게시(및 가정통신문 안내)\n  다. 공개 일자: [[pubd.|{Y}. ○. ○.]](예산 확정 후 10일 이내)\n\n붙임  1. {Y}학년도 학교회계 세입·세출예산서 1부.\n      2. 학교구성원 의견 반영 사업 목록 1부.  끝.","attach":[]}]}],"sched":[["{P}. 12월 초","학교회계 규칙 제12조(지침)"],["{P}. 12월","학교회계 규칙 제12조(지침)"],["{P}. 12월","지침 [서식1]·[서식2]"],["교부계획 {d50}까지 → 1월 중","학교회계 규칙 제11조(지침)"],["{d30}까지","초·중등교육법 제30조의3제2항"],["{d5}까지","초·중등교육법 제30조의3제3항"],["확정 후 10일 이내 공개","지침 예산편성 절차"]],"rows":[["교직원 사전교육(학교교육시책·예산편성 방향)","[[edu|{P}. 12. ○.(○)]]","행정실"],["학교구성원 의견수렴(가정통신문·누리집)","[[op.|{P}. 12. ○.]] ~ [[opE.|{P}. 12. 31.]]","행정실"],["부서별 예산요구서 제출","[[req|{P}. 12. ○○.(○)]]까지","각 부서 → 행정실"],["학교회계전입금 교부계획 통보","{d50}까지","교육청"],["예산조정위원회 개최","[[adj|{Y}. 1월 중]]","예산조정위원회"],["예산안 학교운영위원회 제출","{d30}까지","학교장"],["예·결산소위원회 심사","[[sub|{Y}. 2. ○.(○)]]","예·결산소위원회"],["학교운영위원회 심의","[[com|{d5}까지]]","학교운영위원회"],["예산 확정 및 공개","[[pubd|확정 후 10일 이내]]","학교장"]],"files":{}}};
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
function chon(n){ return won(Math.round(n/1000)); }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function defYear(){ var d=new Date(); return String(d.getMonth()>=8?d.getFullYear()+1:d.getFullYear()); }   /* 9월부터는 다음 학년도 예산 */
/* 회계연도 개시(Y. 3. 1.) "n일 전까지" = 개시일에서 n+1일 앞(지침 예시: 2026. 3. 1. 30일 전 → 2026. 1. 29.) */
function before(Y,n){ return iso(new Date(Y,2,1-(n+1))); }
function load(K){ var p=LS.get(K,null); if(!p||typeof p!=="object") p={};
  p.f=p.f||{}; p.done=p.done||{}; p.tk=p.tk||{}; p.autoV=p.autoV||{}; p.req=p.req||[]; p.adj=p.adj||[]; p.mt=p.mt||{};
  if(!p.f.year) p.f.year=defYear();
  if(!p.f.school){ try{ var s=JSON.parse(localStorage.getItem("ct.school")||'""'); if(s) p.f.school=s; }catch(e){} }
  return p; }

var STGS={pri:[["계획"],["의견수렴"],["요구서"],["조정"],["학운위"],["법인"],["이사회"],["공시"]],
          pub:[["계획"],["의견수렴"],["요구서"],["조정"],["학운위 제출"],["심의"],["확정·공개"]]};
var toastBox=null;
function toast(t){ if(toastBox){ toastBox.textContent=t; toastBox.className="tkmsg on ok"; } }

/* ---------- 예산요구안 엑셀 엔진(원래 도구 그대로: 에듀파인 업로드서식 → 배포 서식, 회수 파일 취합) ---------- */
var CUR=null;
function reqAll(){ return CUR.req.reduce(function(a,s){ return a.concat(s.rows||[]); },[]); }
var XLSX_URL = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
function needXLSX(){
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise(function(ok, no){
    var s = document.createElement("script"); s.src = XLSX_URL;
    s.onload = function(){ ok(window.XLSX); }; s.onerror = function(){ no(new Error("load")); };
    document.head.appendChild(s);
  });
}
var REQ_HEAD = ["부서명","세부사업명","세부항목명","원가통계비목명","산출내역","산출식","요구금액","사업담당자","전년산출식","전년요구금액","증감"];
var REQ_W = [12.8,18.8,20.8,16.8,16.8,26,13,10,26,13,13];
var XINK = "FF16202B", XRULE = "FFB9B2A6", XHEAD = "FFEDEBE4", XIN = "FFFFF6D4", XNOTE = "FFB4232A";
var xthin = {style:"thin",color:{argb:XRULE}}, xmed = {style:"medium",color:{argb:XINK}};
function xbox(c, b){ c.border = b || {top:xthin,left:xthin,bottom:xthin,right:xthin}; }
function xfill(c, argb){ c.fill = {type:"pattern",pattern:"solid",fgColor:{argb:argb}}; }
function XF(size, bold, color){ return {name:"맑은 고딕",size:size,bold:!!bold,color:{argb:color||XINK}}; }
var EXCELJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
function needExcelJS(){
  if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
  return new Promise(function(ok, no){
    var s = document.createElement("script"); s.src = EXCELJS_URL;
    s.onload = function(){ ok(window.ExcelJS); }; s.onerror = function(){ no(new Error("load")); };
    document.head.appendChild(s);
  });
}
function saveBuf(buf, name){ U().saveFile(new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),name); }
// 검산: 산출식의 숫자를 모두 곱함 (배포 양식의 엑셀 수식과 같은 규칙)
function calcFormula(s){
  if (s == null || s === "") return null;
  var t = String(s).replace(/[,\s]/g, ""), nums = t.match(/\d+(?:\.\d+)?/g);
  if (!nums || !nums.length) return null;
  var v = 1; for (var i = 0; i < nums.length; i++) v *= Number(nums[i]);
  return v;
}
function toNum(v){
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  var n = Number(String(v).replace(/[^0-9.\-]/g, "")); return isNaN(n) ? 0 : n;
}
// 산출식(F열) → 요구금액(G열) 자동 계산 엑셀 수식 (매크로 없음, 숨김열 P~W 사용)
var NUMARR = "{1;2;3;4;5;6;7;8;9;10;11;12;13;14;15}";
function segNum(seg){ return "IFERROR(LOOKUP(9.9E307,--LEFT(" + seg + "," + NUMARR + ")),\"\")"; }
function autoCalcHelpers(ws, rn){
  var F = "F"+rn, P = "P"+rn, Q = "Q"+rn, R = "R"+rn, T = "T"+rn, V = "V"+rn;
  ws.getCell(P).value = {formula:"SUBSTITUTE(SUBSTITUTE("+F+',",",""),CHAR(32),"")'};
  ws.getCell(Q).value = {formula:'IF(ISERR(FIND("*",'+P+')),'+P+',LEFT('+P+',FIND("*",'+P+')-1))'};
  ws.getCell(R).value = {formula:'IF(ISERR(FIND("*",'+P+')),"",MID('+P+',FIND("*",'+P+')+1,999))'};
  ws.getCell("S"+rn).value = {formula:'IF('+R+'="","",IF(ISERR(FIND("*",'+R+')),'+R+',LEFT('+R+',FIND("*",'+R+')-1)))'};
  ws.getCell(T).value = {formula:'IF('+R+'="","",IF(ISERR(FIND("*",'+R+')),"",MID('+R+',FIND("*",'+R+')+1,999)))'};
  ws.getCell("U"+rn).value = {formula:'IF('+T+'="","",IF(ISERR(FIND("*",'+T+')),'+T+',LEFT('+T+',FIND("*",'+T+')-1)))'};
  ws.getCell(V).value = {formula:'IF('+T+'="","",IF(ISERR(FIND("*",'+T+')),"",MID('+T+',FIND("*",'+T+')+1,999)))'};
  ws.getCell("W"+rn).value = {formula:'IF('+V+'="","",'+V+')'};
}
function autoCalcFormula(rn){
  var F = "F"+rn, Q = "Q"+rn, S = "S"+rn, U = "U"+rn, W = "W"+rn;
  return "IF("+F+'="","",IFERROR(IF('+Q+'="","",('+segNum(Q)+")*IF("+S+'="",1,'+segNum(S)+")*IF("+U+'="",1,'+segNum(U)+")*IF("+W+'="",1,'+segNum(W)+')),""))';
}
function readSheet(X, wb){
  var name = wb.SheetNames.indexOf("세출예산서식") >= 0 ? "세출예산서식" : wb.SheetNames[0];
  var rows = X.utils.sheet_to_json(wb.Sheets[name], {header:1, raw:true, defval:""}), hIdx = -1;
  for (var r = 0; r < Math.min(rows.length, 20); r++){
    var line = (rows[r] || []).join("|");
    if (line.indexOf("세부사업명") >= 0 && line.indexOf("세부항목명") >= 0){ hIdx = r; break; }
  }
  if (hIdx < 0) return null;
  var map = {};
  (rows[hIdx] || []).forEach(function(hd, i){ var k = String(hd || "").replace(/\s/g, ""); if (k && map[k] == null) map[k] = i; });
  return {rows:rows, head:hIdx, map:map};
}
function readMeta(rows, hIdx){
  var meta = {dept:"", mgr:""}, isLabel = function(t){ return /^(부서|담당자|담당|행정실장|교감|결재)/.test(t); };
  for (var r = 0; r < hIdx; r++){
    var row = rows[r] || [];
    for (var c = 0; c < row.length; c++){
      var txt = String(row[c] == null ? "" : row[c]).trim(); if (!txt) continue;
      var key = /^부서/.test(txt) ? "dept" : (/^담당자/.test(txt) ? "mgr" : null);
      if (!key || meta[key]) continue;
      var aft = txt.split(/[:：]/)[1];
      if (aft && aft.trim()){ meta[key] = aft.trim(); continue; }
      for (var d = 1; d <= 3; d++){
        var nx = String(row[c+d] == null ? "" : row[c+d]).trim(); if (!nx) continue;
        if (!isLabel(nx)) meta[key] = nx; break;
      }
    }
  }
  return meta;
}
function cleanName(fn){
  return fn.replace(/\.[^.]+$/, "").replace(/^\([^()]*\([^()]*\)\)\s*/, "").replace(/\d{2,4}\s*(학년도|년도|년)/g, " ")
    .replace(/본예산|예산\s*요구안|교원용|행정실용|취합본|\(첨부\)/g, " ").replace(/[_()]/g, " ").replace(/\s+/g, " ").trim();
}
function sheetRecs(s){
  var out = [];
  for (var r = s.head + 1; r < s.rows.length; r++){
    var row = s.rows[r] || [], rec = {};
    REQ_HEAD.forEach(function(hd){ var i = s.map[hd]; rec[hd] = (i == null) ? "" : (row[i] == null ? "" : row[i]); });
    out.push(rec);
  }
  return out;
}
function readBook(file){
  return needXLSX().then(function(X){
    return new Promise(function(res, rej){
      var fr = new FileReader();
      fr.onload = function(e){ try{ res([X, X.read(new Uint8Array(e.target.result), {type:"array"})]); }catch(err){ rej(new Error("엑셀 파일로 읽지 못했어요")); } };
      fr.onerror = function(){ rej(new Error("파일을 읽지 못했어요")); };
      fr.readAsArrayBuffer(file);
    });
  });
}
/* 1단계: 에듀파인 기초자료 → 배포용 서식 */
var reqMaster = [], reqBiz = [], reqMsg = "";
function loadMaster(file){
  readBook(file).then(function(p){
    var s = readSheet(p[0], p[1]);
    if (!s) throw new Error("머리글을 찾지 못했어요. '세부사업명' 열이 있는 파일인지 확인해 주세요.");
    reqMaster = sheetRecs(s).filter(function(m){ return String(m["세부사업명"]).trim() || String(m["세부항목명"]).trim(); });
    if (!reqMaster.length) throw new Error("읽을 자료가 없어요.");
    var cnt = {};
    reqMaster.forEach(function(m){ var k = String(m["세부사업명"]).trim() || "(사업명 없음)"; cnt[k] = (cnt[k] || 0) + 1; });
    reqBiz = Object.keys(cnt).sort(function(a, b){ return a.localeCompare(b, "ko"); }).map(function(k){ return {name:k, count:cnt[k], on:true}; });
    reqMsg = "<b>" + esc(file.name) + "</b> — " + reqMaster.length + "행, 세부사업 " + reqBiz.length + "개";
    mkDraw(true);
  }).catch(function(err){ reqMsg = '<span class="mk-warn">' + esc(err.message || "파일을 열지 못했어요.") + "</span>"; mkDraw(true); });
}
function reqPicked(){
  var on = {}; reqBiz.forEach(function(b){ if (b.on) on[b.name] = 1; });
  return reqMaster.filter(function(m){ return on[String(m["세부사업명"]).trim() || "(사업명 없음)"]; });
}
function buildForm(EJ, rows, title){
  var wb = new EJ.Workbook();
  var ws = wb.addWorksheet("세출예산서식", {views:[{state:"frozen", ySplit:4}],
    pageSetup:{paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1, fitToHeight:0, margins:{left:.3,right:.3,top:.4,bottom:.4,header:.2,footer:.2}}});
  REQ_W.forEach(function(w, i){ ws.getColumn(i+1).width = w; });
  ws.getColumn(12).width = 5; ws.getColumn(13).width = 10; ws.getColumn(14).width = 10; ws.getColumn(15).width = 10;
  ws.mergeCells("A1:K1");
  var t = ws.getCell("A1"); t.value = title; t.font = XF(17, true); t.alignment = {horizontal:"center", vertical:"middle"}; ws.getRow(1).height = 34;
  ws.mergeCells("L2:L3");
  var lab = ws.getCell("L2"); lab.value = "결재"; lab.font = XF(10, true, "FFFFFFFF");
  lab.alignment = {horizontal:"center", vertical:"middle", textRotation:"vertical"}; xfill(lab, XINK); xbox(lab, {top:xmed, left:xmed, bottom:xmed, right:xthin});
  ["M","N","O"].forEach(function(col, i){
    var hh = ws.getCell(col + "2"); hh.value = ["담당","행정실장","교감"][i]; hh.font = XF(9.5, true);
    hh.alignment = {horizontal:"center", vertical:"middle"}; xfill(hh, XHEAD); xbox(hh, {top:xmed, left:xthin, bottom:xthin, right: i === 2 ? xmed : xthin});
    xbox(ws.getCell(col + "3"), {top:xthin, left:xthin, bottom:xmed, right: i === 2 ? xmed : xthin});
  });
  ws.getRow(2).height = 19; ws.getRow(3).height = 52;
  ws.mergeCells("A3:D3");
  var note = ws.getCell("A3"); note.value = "노란 칸을 채워 주세요 — 부서, 담당자, 산출내역, 산출식 (요구금액은 산출식에서 자동 계산)";
  note.font = XF(10, true, XNOTE); note.alignment = {horizontal:"left", vertical:"middle"};
  var le = ws.getCell("E3"); le.value = "부서"; le.font = XF(10.5, true); le.alignment = {horizontal:"right", vertical:"middle"};
  ws.mergeCells("F3:G3"); var ie = ws.getCell("F3"); ie.font = XF(11); ie.alignment = {horizontal:"center", vertical:"middle"}; xfill(ie, XIN); xbox(ie);
  var lh = ws.getCell("H3"); lh.value = "담당자"; lh.font = XF(10.5, true); lh.alignment = {horizontal:"right", vertical:"middle"};
  ws.mergeCells("I3:J3"); var ih = ws.getCell("I3"); ih.font = XF(11); ih.alignment = {horizontal:"center", vertical:"middle"}; xfill(ih, XIN); xbox(ih);
  var hr = ws.getRow(4);
  REQ_HEAD.forEach(function(hd, i){ var c = hr.getCell(i+1); c.value = hd; c.font = XF(10, true); c.alignment = {horizontal:"center", vertical:"middle", wrapText:true}; xfill(c, XHEAD); xbox(c, {top:xmed, left:xthin, bottom:xmed, right:xthin}); });
  hr.height = 30;
  rows.forEach(function(m, i){
    var rn = 5 + i, r = ws.getRow(rn);
    var vals = ["", m["세부사업명"], m["세부항목명"], m["원가통계비목명"], m["산출내역"], null, null, null, m["전년산출식"], toNum(m["전년요구금액"]) || null, null];
    vals.forEach(function(v, ci){
      var c = r.getCell(ci+1);
      if (v !== null && v !== undefined) c.value = v;
      c.font = XF(10); xbox(c);
      c.alignment = {vertical:"middle", horizontal: (ci === 6 || ci === 9 || ci === 10) ? "right" : (ci === 7 ? "center" : "left")};
    });
    xfill(r.getCell(5), XIN); xfill(r.getCell(6), XIN);
    autoCalcHelpers(ws, rn);
    r.getCell(7).value = {formula: autoCalcFormula(rn)}; r.getCell(7).numFmt = "#,##0";
    r.getCell(10).numFmt = "#,##0";
    r.getCell(11).value = {formula:"N(G" + rn + ")-N(J" + rn + ")"}; r.getCell(11).numFmt = "#,##0";
    r.height = 18;
  });
  ["P","Q","R","S","T","U","V","W"].forEach(function(col){ ws.getColumn(col).hidden = true; ws.getColumn(col).width = 12; });
  ws.autoFilter = {from:{row:4, column:1}, to:{row:4 + rows.length, column:11}};
  var g = wb.addWorksheet("작성안내");
  g.getColumn(1).width = 6; g.getColumn(2).width = 78; g.mergeCells("A1:B1");
  var gt = g.getCell("A1"); gt.value = "예산요구안 작성 안내"; gt.font = XF(14, true); gt.alignment = {vertical:"middle"}; g.getRow(1).height = 30;
  [["1","맨 위 노란 칸에 부서와 담당자를 적습니다."],
   ["2","머리글의 필터 단추를 눌러 내가 맡은 세부사업만 골라 봅니다."],
   ["3","노란 칸 두 개를 채웁니다 — 산출내역, 산출식."],
   ["4","산출식은 000원*00명*00회 형식으로 적습니다.  예) 10,000원*10명*5회"],
   ["5","요구금액은 산출식을 적으면 자동으로 계산됩니다. 직접 고치지 않습니다."],
   ["6","산출식에 * 로 이어 적은 숫자를 곱해 계산합니다. 쉼표·단위(원·명·회 등)는 그대로 적어도 됩니다."],
   ["7","증감도 자동으로 계산되니 건드리지 않습니다."],
   ["8","목록에 없는 항목은 비슷한 행을 복사해 해당 사업 근처에 행 삽입 후 붙여 넣습니다."],
   ["9","다 쓰면 저장해서 행정실에 보냅니다."]].forEach(function(row, i){
    var r = g.getRow(3 + i);
    r.getCell(1).value = row[0]; r.getCell(1).font = XF(10, true, XNOTE); r.getCell(1).alignment = {horizontal:"center", vertical:"middle"};
    r.getCell(2).value = row[1]; r.getCell(2).font = XF(10.5); r.getCell(2).alignment = {vertical:"middle", wrapText:true}; r.height = 22;
  });
  return wb;
}
function groupBy(rows, key){
  var m = {};
  rows.forEach(function(r){ var k = r[key] == null ? "" : r[key]; if (!m[k]) m[k] = {키:k, 건수:0, 요구:0, 전년:0}; m[k].건수++; m[k].요구 += r.요구금액; m[k].전년 += r.전년; });
  return Object.keys(m).sort(function(a, b){ return m[b].요구 - m[a].요구; }).map(function(k){ return m[k]; });
}
function exportReq(){
  var rows = reqAll(); if (!rows.length) return;
  needExcelJS().then(function(EJ){
    var total = 0, prev = 0; rows.forEach(function(r){ total += r.요구금액; prev += r.전년; });
    var wb = new EJ.Workbook();
    var d = wb.addWorksheet("통합내역", {views:[{state:"frozen", ySplit:1}], pageSetup:{paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1, fitToHeight:0}});
    REQ_W.forEach(function(w, i){ d.getColumn(i+1).width = w; });
    function head(ws, titles, widths){
      if (widths) widths.forEach(function(w, i){ ws.getColumn(i+1).width = w; });
      var r = ws.getRow(1);
      titles.forEach(function(t, i){ var c = r.getCell(i+1); c.value = t; c.font = XF(10, true); c.alignment = {horizontal:"center", vertical:"middle", wrapText:true}; xfill(c, XHEAD); xbox(c, {top:xmed, left:xthin, bottom:xmed, right:xthin}); });
      r.height = 28;
    }
    head(d, REQ_HEAD);
    rows.forEach(function(r, i){
      var rn = 2 + i, row = d.getRow(rn);
      [r.부서, r.사업, r.항목, r.비목, r.내역, r.산출식, r.요구금액, "", r.전년식, r.전년, null].forEach(function(v, ci){
        var c = row.getCell(ci+1); if (v !== null) c.value = v; c.font = XF(10);
        c.alignment = {vertical:"middle", horizontal: (ci === 6 || ci === 9 || ci === 10) ? "right" : (ci === 7 ? "center" : "left")}; xbox(c);
      });
      row.getCell(7).numFmt = "#,##0"; row.getCell(10).numFmt = "#,##0";
      row.getCell(11).value = {formula:"G" + rn + "-J" + rn}; row.getCell(11).numFmt = "#,##0";
      if (r.어긋남 || r.빈금액) for (var ci = 1; ci <= 11; ci++) xfill(row.getCell(ci), "FFFDF4DE");
      row.height = 18;
    });
    var last = rows.length + 1, tr = d.getRow(last + 1);
    tr.getCell(1).value = "합계 (" + rows.length + "건)"; tr.getCell(7).value = total; tr.getCell(10).value = prev; tr.getCell(11).value = total - prev;
    for (var ci = 1; ci <= 11; ci++){ var tc = tr.getCell(ci); tc.font = XF(10.5, true); tc.alignment = {vertical:"middle", horizontal: ci >= 7 ? "right" : "left"}; if (ci === 7 || ci === 10 || ci === 11) tc.numFmt = "#,##0"; xbox(tc, {top:xmed, left:xthin, bottom:xmed, right:xthin}); xfill(tc, XHEAD); }
    tr.height = 22;
    d.autoFilter = {from:{row:1, column:1}, to:{row:last, column:11}};
    var flagged = rows.filter(function(r){ return r.어긋남 || r.빈금액; });
    if (flagged.length){
      var ck = wb.addWorksheet("확인필요", {views:[{state:"frozen", ySplit:1}]});
      head(ck, ["사유","부서","세부사업명","세부항목명","산출내역","산출식","요구금액","산출식 검산","차이","출처파일"], [10,13,18,20,22,24,13,13,11,26]);
      flagged.forEach(function(r, i){
        var row = ck.getRow(2 + i), diff = (r.검산 == null) ? "" : (r.검산 - r.요구금액);
        [r.어긋남 ? "불일치" : "금액없음", r.부서, r.사업, r.항목, r.내역, r.산출식, r.요구금액, r.검산 == null ? "" : r.검산, diff, r.파일].forEach(function(v, ci){
          var c = row.getCell(ci+1); c.value = v; c.font = (ci === 0) ? XF(10, true, XNOTE) : XF(10);
          c.alignment = {vertical:"middle", horizontal: (ci >= 6 && ci <= 8) ? "right" : "left"}; if (ci >= 6 && ci <= 8) c.numFmt = "#,##0"; xbox(c); xfill(c, "FFFDF4DE");
        });
        row.height = 18;
      });
    }
    function pivot(name, key, label){
      var g = groupBy(rows, key), ws = wb.addWorksheet(name, {views:[{state:"frozen", ySplit:1}]});
      head(ws, [label, "건수", "요구금액", "전년요구금액", "증감"], [26,9,16,16,15]);
      g.forEach(function(r, i){
        var row = ws.getRow(2 + i);
        [r.키, r.건수, r.요구, r.전년, r.요구 - r.전년].forEach(function(v, ci){ var c = row.getCell(ci+1); c.value = v; c.font = XF(10); c.alignment = {vertical:"middle", horizontal: ci === 0 ? "left" : "right"}; if (ci >= 1) c.numFmt = "#,##0"; xbox(c); });
        row.height = 18;
      });
      var t2 = ws.getRow(g.length + 2);
      ["합계", rows.length, total, prev, total - prev].forEach(function(v, ci){ var c = t2.getCell(ci+1); c.value = v; c.font = XF(10.5, true); c.alignment = {vertical:"middle", horizontal: ci === 0 ? "left" : "right"}; if (ci >= 1) c.numFmt = "#,##0"; xbox(c, {top:xmed, left:xthin, bottom:xmed, right:xthin}); xfill(c, XHEAD); });
      t2.height = 22;
    }
    pivot("부서별소계", "부서", "부서");
    pivot("사업별소계", "사업", "세부사업명");
    var dt = new Date(), tag = dt.getFullYear() + ("0" + (dt.getMonth()+1)).slice(-2) + ("0" + dt.getDate()).slice(-2);
    return wb.xlsx.writeBuffer().then(function(buf){ saveBuf(buf, "예산요구안_취합본_" + tag + ".xlsx"); toast("취합본을 내려받았어요."); });
  }).catch(function(){ toast("엑셀 만들기 기능을 불러오지 못했어요. 인터넷 연결을 확인해 주세요."); });
}


var CSS=[
".priv .cv-pane{padding-bottom:12px}",
".pr-hero{display:flex;gap:8px 12px;align-items:center;flex-wrap:wrap;margin:2px 0 4px}",
".pr-hero select{font:inherit;font-size:15px;padding:8px 10px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink)}",
".pr-hero input{font:inherit;font-size:15px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0}",
".pr-hero .sch{flex:1 1 180px;max-width:260px}.pr-hero .corp{flex:1 1 180px;max-width:260px}.pr-hero .yr{width:92px}",
".pr-hero label{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--ink-2)}.pr-hero .sp{flex:1}",
".pr-now{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:10px 0 0;font-size:14px}",
".pr-say{font-size:13.5px;color:var(--ink-2);margin:0 0 10px;line-height:1.65}",
".pr-say b{color:var(--ink);font-weight:650}",
".pr-sub{font-size:13.5px;font-weight:700;color:var(--ink);margin:18px 0 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
".pr-sub small{font-weight:400;color:var(--muted);font-size:12.5px}",
".pr-tk{margin:0;padding:0;list-style:none;display:grid;gap:4px}",
".pr-tk li label{display:flex;gap:8px;align-items:flex-start;font-size:13.5px;line-height:1.5;cursor:pointer;color:var(--ink)}",
".pr-tk li input{margin-top:3px;flex:0 0 auto;width:auto}",
".pr-tk li.on span{color:var(--muted);text-decoration:line-through}",
".pr-drop{display:grid;gap:4px;border:1.5px dashed var(--line-strong);border-radius:12px;padding:14px;text-align:center;cursor:pointer;font-size:14px;color:var(--ink);background:var(--surface-2)}",
".pr-drop small{color:var(--muted);font-size:12.5px}.pr-drop.hot{border-color:var(--accent);background:var(--accent-soft)}",
".pr-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
".pr-biz{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}",
".pr-biz label{display:flex;gap:5px;align-items:center;font-size:12.5px;border:1px solid var(--line);border-radius:8px;padding:4px 8px;background:var(--surface);cursor:pointer}",
".pr-biz label input{width:auto}",
".pr-rows{display:grid;gap:6px}",
".pr-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto 28px;gap:8px;align-items:center;background:var(--surface-2);border-radius:10px;padding:8px 10px;font-size:13.5px}",
".pr-row .fn{min-width:0;overflow-wrap:anywhere}.pr-row .fn small{display:block;color:var(--muted);font-size:12px}",
".pr-row .am{font-variant-numeric:tabular-nums;font-weight:650;white-space:nowrap}",
".pr-row .x,.pr-adj .x{font:inherit;border:0;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:2px 6px}",
".pr-adj{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.4fr) 110px 120px minmax(0,1.2fr) 28px;gap:6px;align-items:center;background:var(--surface-2);border-radius:10px;padding:7px 10px;font-size:13.5px}",
".pr-adj.hd{background:none;padding:0 10px;font-size:12px;font-weight:700;color:var(--muted)}",
".pr-adj input{font:inherit;font-size:13.5px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);min-width:0;width:100%;box-sizing:border-box}",
".pr-adj input.r{text-align:right;font-variant-numeric:tabular-nums}.pr-adj .rq{text-align:right;font-variant-numeric:tabular-nums}",
".pr-adj.ch{box-shadow:inset 3px 0 0 var(--accent)}",
".pr-add{font:inherit;font-size:13.5px;border:1px dashed var(--line-strong);background:none;color:var(--accent-ink);border-radius:10px;padding:7px 12px;cursor:pointer;justify-self:start}",
".pr-docs{display:grid;gap:8px;margin-top:6px}",
".pr-doc{border:1px solid var(--line);border-radius:12px;background:var(--surface);overflow:hidden}",
".pr-dh{font:inherit;display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;padding:11px 14px;cursor:pointer;color:var(--ink)}",
".pr-dh .who{flex:0 0 auto;font-size:11.5px;font-weight:700;border-radius:6px;padding:2px 7px;background:var(--surface-3);color:var(--ink-2)}",
".pr-dh .who.out{background:var(--accent-soft);color:var(--accent-ink)}",
".pr-dh .tt{flex:1;min-width:0;font-size:14.5px;font-weight:600;line-height:1.4}.pr-dh .ar{flex:0 0 auto;color:var(--muted);transition:transform .15s}",
".pr-doc.open .pr-dh .ar{transform:rotate(90deg)}.pr-db{display:none;border-top:1px solid var(--line);padding:12px 14px}.pr-doc.open .pr-db{display:block}",
".pr-txt{white-space:pre-wrap;font-size:13.5px;line-height:1.75;background:var(--surface-2);border-radius:10px;padding:12px 14px;margin:0;color:var(--ink);word-break:keep-all;overflow-wrap:anywhere}",
".pr-txt .tl{display:block;font-weight:700;margin-bottom:6px}.pr-txt mark{background:none;color:var(--accent-ink);font-weight:600}",
".pr-txt mark.ex{color:var(--warn);font-weight:400;background:var(--warn-bg);border-radius:3px}",
".pr-dfoot{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}",
".pr-files{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}",
".pr-file{font:inherit;font-size:12.5px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink-2);border-radius:8px;padding:5px 10px;cursor:pointer;display:inline-flex;gap:6px;align-items:center;text-align:left}",
".pr-file:hover{border-color:var(--accent);color:var(--accent-ink)}",
".pr-file i{font-style:normal;font-size:10.5px;font-weight:700;border-radius:4px;padding:1px 4px;background:var(--surface-3);color:var(--muted)}",
".pr-file.mk i{background:var(--accent-soft);color:var(--accent-ink)}",
".pr-mt{display:grid;gap:8px}.pr-mt label{display:grid;gap:4px;font-size:12.5px;font-weight:700;color:var(--muted)}",
".pr-mt textarea,.pr-mt input{font:inherit;font-size:13.5px;font-weight:400;padding:8px 10px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink);width:100%;box-sizing:border-box;resize:vertical}",
"@media (max-width:640px){.priv .cv-ix .t{font-size:10.5px;letter-spacing:-.05em;text-overflow:clip}.priv .cv-calc{grid-template-columns:1fr 1fr}.pr-two{grid-template-columns:1fr}",
".pr-adj{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 28px}.pr-adj.hd{display:none}.pr-adj .dp{grid-column:1/3}.pr-adj .bz{grid-column:1/-1;grid-row:2}.pr-adj .x{grid-column:3;grid-row:1}.pr-adj .rq{text-align:left}.pr-adj .wy{grid-column:1/-1}",
".pr-row{grid-template-columns:minmax(0,1fr) auto 28px}.pr-row .ct{display:none}}"
].join("\n");

function build(root,ver){
  var SD=SRC[ver], STG=STGS[ver], KEY=ver+".p", PRI=ver==="pri", ACCT=PRI?"교비회계":"학교회계";
  var T=U();
  if(!document.getElementById("cv-css")&&T.CSS){ var s0=el("style"); s0.id="cv-css"; s0.textContent=T.CSS; document.head.appendChild(s0); }
  if(!document.getElementById("pri-css")){ var s1=el("style"); s1.id="pri-css"; s1.textContent=CSS; document.head.appendChild(s1); }
  var P=load(KEY); CUR=P; if(!P.f.school){ var o=LS.get(PRI?"pub.p":"pri.p",null); if(o&&o.f&&o.f.school) P.f.school=o.f.school; } var F=P.f, view={open:null}, master={rows:[],biz:[],msg:""};
  root.textContent=""; var app=el("div","cv priv"); root.appendChild(app);
  function put(){ LS.set(KEY,P); }
  function rAll(){ return P.req.reduce(function(a,s){ return a.concat(s.rows||[]); },[]); }
  function btn(t,cls,fn){ var b=el("button",cls||"btn",t); b.type="button"; if(fn) b.onclick=fn; return b; }
  function msg(box,t,kind){ box.textContent=t||""; box.className="tkmsg"+(t?" on "+(kind||"ok"):""); }
  function V(k){ return String(F[k]==null?"":F[k]).trim(); }
  function Y(){ var y=parseInt(V("year"),10); return y>=2000&&y<=2100?y:+defYear(); }
  function workDays(s,n){ return T.workDays?T.workDays(s,n):addDays(s,n); }
  function isWork(d){ return !!d&&workDays(addDays(d,-1),1)===d; }
  function prevWork(d){ for(var i=0;d&&i<10&&!isWork(d);i++) d=addDays(d,-1); return d; }
  function D50(){ return before(Y(),50); } function D5(){ return before(Y(),5); } function D30(){ return before(Y(),30); }

  /* ---- 날짜 미리 채우기(직접 고친 값·끝난 단계는 그대로) ---- */
  function prefill(){ var ch=false, y=Y();
    function A(k,v,st){ if(P.done[st]||!v) return; var cur=V(k); if(cur&&cur!==P.autoV[k]) return; if(cur!==v){ F[k]=v; ch=true; } P.autoV[k]=v; }
    A("opE",(y-1)+"-12-31",1);                  /* 의견수렴 끝: 12. 31.(지침 문안 기본값) */
    A("op",V("edu"),1);                          /* 의견수렴은 교직원 교육 날 함께 시작 */
    if(PRI){ A("sub",V("com")?workDays(V("com"),1):"",5); /* 학운위 심의 다음 근무일에 법인 제출 */
      A("pubd",prevWork(D5()),7); }               /* 관할청 보고·누리집 공시: 개시 5일 전(근무일) */
    else { A("subm",prevWork(D30()),4);           /* 학운위 제출: 개시 30일 전까지(근무일) */
      A("fix",V("com"),6);                        /* 심의 받은 날 확정 */
      A("pubd",V("fix")?prevWork(addDays(V("fix"),10)):"",6); }   /* 확정 후 10일 이내 공개 */
    return ch; }

  /* ---- 문안 채우기: {Y}{P}{S}{C}{d50}{d30}{d5} · [[키|기본값]] · [[키.|기본값]](요일 없이) · [[_계산|기본값]] ---- */
  function adjRows(){ var keep={}, out=[]; P.adj.forEach(function(r){ keep[r.dept+"|"+r.biz]=r; });
    reqAgg().forEach(function(a){ var o=keep[a.dept+"|"+a.biz]; out.push({dept:a.dept,biz:a.biz,req:a.req,adj:o&&o.adj!==""&&o.adj!=null?o.adj:a.req,why:o?o.why||"":"",manual:false}); });
    P.adj.forEach(function(r){ if(r.manual) out.push(r); }); return out; }
  function reqAgg(){ var map={}, order=[];
    rAll().forEach(function(r){ var b=r.사업&&r.항목&&r.항목!==r.사업?r.사업+" · "+r.항목:(r.사업||r.항목||"(사업명 없음)"), key=r.부서+"|"+b;
      if(!map[key]){ map[key]={dept:r.부서,biz:b,req:0,prev:0}; order.push(key); } map[key].req+=r.요구금액; map[key].prev+=r.전년||0; });
    return order.map(function(k){ return map[k]; }); }
  function saveAdj(rows){ P.adj=rows.map(function(r){ return {dept:r.dept,biz:r.biz,req:r.req,adj:r.adj,why:r.why,manual:r.manual}; }); put(); }
  function adjSum(rows){ var a=0,b=0; rows.forEach(function(r){ a+=num(r.req); b+=num(r.adj); }); return [a,b]; }
  function computed(k){ var rows=adjRows(); if(!rows.length) return ""; var s=adjSum(rows);
    if(k==="_req") return chon(s[0]); if(k==="_adj") return chon(s[1]);
    var ch=rows.filter(function(r){ return num(r.req)!==num(r.adj); });
    if(k==="_adjList") return ch.length?ch.map(function(r,i){ return "    "+(i+1)+") "+r.biz+"("+r.dept+"): "+chon(num(r.req))+"천원 → "+chon(num(r.adj))+"천원(사유: "+(r.why||"○○○")+")"; }).join("\n"):"    1) 조정 없음(부서 요구액대로 반영)";
    if(k==="_adjNext") return String(Math.max(ch.length,1)+1); return ""; }
  function fmtD(x,nowd){ var p=pd(x); if(!p) return x; return nowd?dot(x):dotw(x); }
  function parse(t){ var y=Y(), out=[], map={Y:String(y),P:String(y-1),S:V("school"),C:V("corp"),d50:dotw(D50()),d30:dotw(D30()),d5:dotw(D5())},
      re=/\[\[(\w+)(\.?)\|([^\]]*)\]\]|\{(Y|P|S|C|d50|d30|d5|dEnd)\}|○○○,○○○,○○○원/g, last=0, m;
    while((m=re.exec(t))){ if(m.index>last) out.push({t:t.slice(last,m.index)});
      if(m[1]){ var v=m[1].charAt(0)==="_"?computed(m[1]):V(m[1]); if(v&&m[1].charAt(0)!=="_") v=fmtD(v,m[2]); out.push(v?{t:v,k:1,ok:1}:{t:fill0(m[3]),k:1}); }
      else if(m[4]){ var w=m[4]==="S"?map.S||"○○학교":m[4]==="C"?map.C||"학교법인 ○○학원":m[4]==="dEnd"?dotw(addDays(y+"-03-01",-1)):map[m[4]]; out.push({t:w,k:(m[4]==="S"||m[4]==="C")?1:0,ok:!!map[m[4]]}); }
      else { var a=num(V("amt")); out.push(a?{t:won(a)+"원",k:1,ok:1}:{t:m[0],k:1}); }
      last=re.lastIndex; }
    if(last<t.length) out.push({t:t.slice(last)}); return out; }
  function fill0(t){ return t.replace(/\{(Y|P|d50|d30|d5)\}/g,function(_,k){ var y=Y(); return {Y:String(y),P:String(y-1),d50:dotw(D50()),d30:dotw(D30()),d5:dotw(D5())}[k]; }); }
  function plain(t){ return parse(t).map(function(s){ return s.t; }).join(""); }
  function paint(box,t){ parse(t).forEach(function(s){ if(!s.k) box.appendChild(document.createTextNode(s.t)); else box.appendChild(el("mark",s.ok?"":"ex",s.t)); }); }
  function strip(h){ var d=el("div"); d.innerHTML=h; return d.textContent; }

  /* ---- 한글(hwpx) ---- */
  function P0(x,o){ return Object.assign({t:"p",text:x,size:12,lh:1.6,font:"m"},o||{}); }
  function cell(x,o){ return Object.assign({t:String(x==null?"":x),al:"left",size:10.5},o||{}); }
  function th(x){ return cell(x,{b:true,al:"center",bg:"#EDEDED"}); }
  function hwpx(blocks,name,m){ var H=window.TKHX; if(!H||!H.build){ msg(m,"한글 만들기 부품을 불러오지 못했어요. 새로고침해 주세요.","warn"); return; }
    T.saveFile(H.build([{blocks:blocks}],name),(V("school")?V("school")+"_":"")+name.replace(/[\\/:*?"<>|]/g,"_")+".hwpx").then(function(){ msg(m,name+"을(를) 한글로 내려받았어요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }
  function head(title){ return [P0(title,{b:true,size:16,al:"center"}),{t:"p",text:"",size:6},P0(V("school")||"○○학교",{al:"right",size:11}),{t:"p",text:"",size:4}]; }
  function draftBlocks(d){ var out=[P0(plain(d.title),{b:true,size:15}),{t:"p",text:"",size:8}];
    plain(d.body).split("\n").forEach(function(l){ var ind=/^\s{2,}/.test(l); out.push(P0(l.replace(/^\s+/,""),ind?{ind:4,hang:3}:{})); }); return out; }
  var MAKE={
    sched:["편성 일정표",function(){ var rows=[[th("순"),th("추진 내용"),th("일정"),th("담당")]];
      SD.rows.forEach(function(r,i){ rows.push([cell(i+1,{al:"center"}),cell(r[0]),cell(plain(r[1]),{al:"center"}),cell(r[2],{al:"center"})]); });
      return head(Y()+"학년도 "+ACCT+" 본예산 편성 일정표").concat([{t:"tbl",w:[12,72,52,36],font:"m",size:10.5,pad:1.2,rows:rows}]); }],
    adj:["예산조정 결과표",function(){ var rows=adjRows(), s=adjSum(rows), tb=[[th("순"),th("부서"),th("세부사업"),th("요구액"),th("조정액"),th("증감"),th("조정 사유")]];
      rows.forEach(function(r,i){ var d=num(r.adj)-num(r.req); tb.push([cell(i+1,{al:"center"}),cell(r.dept,{al:"center"}),cell(r.biz),cell(won(num(r.req)),{al:"right"}),cell(won(num(r.adj)),{al:"right"}),cell(d?(d>0?"+":"")+won(d):"-",{al:"right"}),cell(r.why||"")]); });
      tb.push([cell("합계",{cs:3,al:"center",b:true,bg:"#EDEDED"}),cell(won(s[0]),{al:"right",b:true,bg:"#EDEDED"}),cell(won(s[1]),{al:"right",b:true,bg:"#EDEDED"}),cell(s[1]-s[0]?won(s[1]-s[0]):"-",{al:"right",b:true,bg:"#EDEDED"}),cell("",{bg:"#EDEDED"})]);
      return head(Y()+"학년도 예산조정 결과표").concat([P0("(단위: 원)",{al:"right",size:9.5}),{t:"tbl",w:[10,22,46,24,24,20,30],font:"m",size:10,pad:1,rows:tb}]); }],
    minutes:["예산조정위원회 회의록",function(){ var m=mt(), when=[dotw(V("adj"))||Y()+". 1. ○○.(○)",V("adjT")].filter(Boolean).join(" ");
      function r(k,v){ return [th(k),cell(v)]; }
      return head(Y()+"학년도 예산조정위원회 회의록").concat([{t:"tbl",w:[32,144],font:"m",size:10.5,pad:1.5,rows:[r("일시",when),r("장소",V("adjP")||"○○실"),r("참석 위원",m.attend),r("불참 위원",m.absent),r("안건",m.agenda),r("회의 내용",m.talk),r("결정 사항",m.dec)]},
        {t:"p",text:"",size:14},P0("위원장                    (서명)",{al:"right"}),P0("기록자                    (서명)",{al:"right"})]); }]
  };
  function mt(){ var rows=adjRows(), s=adjSum(rows), m=P.mt;
    var talk=rows.length?"부서별 예산요구서 "+rows.length+"건(요구액 "+won(s[0])+"원)을 가용재원 범위에서 검토함.\n"+computed("_adjList").split("\n").map(function(l){ return l.trim(); }).join("\n"):"부서별 예산요구서를 가용재원 범위에서 검토함.";
    var dec=rows.length?"부서 요구액 "+won(s[0])+"원을 "+won(s[1])+"원으로 조정함(붙임 예산조정 결과표 참조).":"부서 요구액 ○○○원을 ○○○원으로 조정함(붙임 예산조정 결과표 참조).";
    return {attend:m.attend||"위원장 교감 ○○○, 위원 ○○○(교무부장), ○○○(연구부장), ○○○(행정실장) 등 ○명",absent:m.absent||"없음",agenda:m.agenda||Y()+"학년도 세입·세출예산안 조정",talk:m.talk||talk,dec:m.dec||dec,talk0:talk,dec0:dec}; }

  /* ---- 화면 부품 ---- */
  function grid(pn){ var g=el("div","tkgridf"); pn.appendChild(g); return g; }
  function sub(pn,t,s){ var h=el("div","pr-sub",t); if(s) h.appendChild(el("small",null,s)); pn.appendChild(h); return h; }
  function fld(g,k,label,o){ o=o||{}; var f=el("label","tkf"); f.appendChild(el("span","tkfl",label)); var i=el("input"); i.type=o.type||"text";
    if(o.ph) i.placeholder=o.ph; if(o.num) i.inputMode="numeric"; i.value=o.num&&V(k)?won(num(V(k))):V(k); f.appendChild(i); if(o.hint) f.appendChild(el("small",null,o.hint)); g.appendChild(f);
    i.addEventListener(o.type==="date"||o.type==="time"?"change":"input",function(){ F[k]=o.num?String(num(i.value)||""):i.value.trim(); put(); if(o.live) o.live(); if(o.type==="date"&&prefill()){ put(); draw(); } });
    if(o.num) i.addEventListener("blur",function(){ i.value=V(k)?won(num(V(k))):""; });
    return i; }
  function tiles(box,items){ box.textContent=""; items.forEach(function(x){ if(!x) return; var d=el("div","cv-num "+(x.c||"")); d.appendChild(el("span",null,x.l)); d.appendChild(el("b",null,x.v)); if(x.s) d.appendChild(el("small",null,x.s)); box.appendChild(d); }); }
  function calc(pn){ var c=el("div","cv-calc"); pn.appendChild(c); return c; }
  function dd(s,i){ var n=dday(s); return s?{v:dot(s),s:ddTxt(n),c:P.done[i]?"":ddCls(n)}:{v:"-",s:""}; }
  function chk(s,lim,okT,badT){ return s&&lim?(s<=lim?{s:okT,c:"ok"}:{s:badT,c:"bad"}):{s:"",c:""}; }
  function ticks(pn,i,st){ var u=el("ul","pr-tk"); pn.appendChild(u);
    st.todo.forEach(function(t,j){ var key=i+"."+j, li=el("li",P.tk[key]?"on":""), lb=el("label"), cb=el("input"); cb.type="checkbox"; cb.checked=!!P.tk[key];
      cb.onchange=function(){ P.tk[key]=cb.checked; li.className=cb.checked?"on":""; put(); }; lb.appendChild(cb); lb.appendChild(el("span",null,t.replace(/ \(위 '.*?' 참고\)/,""))); li.appendChild(lb); u.appendChild(li); }); }
  var OPEN=LS.get(ver+".open",{});
  function getFile(k,b,m){ var f=SD.files[k]; b.disabled=true;
    fetch("tools/pri/"+k+".hwpx").then(function(r){ if(!r.ok) throw new Error("파일을 찾지 못했어요("+r.status+")"); return r.blob(); })
      .then(function(bl){ return T.saveFile(bl,f[0]); }).then(function(){ msg(m,f[1]+"을(를) 내려받았어요.","ok"); },function(e){ msg(m,e.message||"내려받지 못했어요.","bad"); }).then(function(){ b.disabled=false; }); }
  function docs(pn,i,st){ sub(pn,"기안문·붙임","색 글자는 넣은 값, 노란 칸은 아직 비어 있는 곳");
    var w=el("div","pr-docs"); pn.appendChild(w);
    st.docs.forEach(function(d,j){ var id=i+"."+j, box=el("div","pr-doc"+(OPEN[id]?" open":"")), hd=btn("","pr-dh");
      var K={in:"내부결재",out:"시행문",memo:"교내 안내"}[d.kind]||"";
      hd.appendChild(el("span","who"+(d.kind==="out"?" out":""),K)); hd.appendChild(el("span","tt",plain(d.title))); hd.appendChild(el("span","ar","›")); box.appendChild(hd);
      var bd=el("div","pr-db"); box.appendChild(bd); hd.onclick=function(){ box.classList.toggle("open"); OPEN[id]=box.classList.contains("open"); LS.set(ver+".open",OPEN); if(OPEN[id]) txt(); };
      var pre=el("div","pr-txt"); bd.appendChild(pre);
      function txt(){ pre.textContent=""; var tl=el("span","tl"); paint(tl,d.title); pre.appendChild(tl); paint(pre,d.body); hd.querySelector(".tt").textContent=plain(d.title); } txt();
      var ft=el("div","pr-dfoot"), m=el("div","tkmsg"); bd.appendChild(ft);
      ft.appendChild(btn("제목 복사","btn ghost",function(){ cp(plain(d.title),m); }));
      ft.appendChild(btn("본문 복사","btn ghost",function(){ cp(plain(d.body),m); }));
      ft.appendChild(btn("한글로","btn ghost",function(){ hwpx(draftBlocks(d),plain(d.title),m); }));
      var fs=el("div","pr-files"); bd.appendChild(fs);
      (d.make||[]).forEach(function(k){ if(!MAKE[k]) return; var b=btn("","pr-file mk"); b.appendChild(el("i",null,"만들기")); b.appendChild(document.createTextNode(MAKE[k][0])); b.onclick=function(){ hwpx(MAKE[k][1](),Y()+"학년도 "+MAKE[k][0],m); }; fs.appendChild(b); });
      (d.attach||[]).forEach(function(k){ var f=SD.files[k]; if(!f) return; var b=btn("","pr-file"); b.appendChild(el("i",null,"HWPX")); b.appendChild(document.createTextNode(f[1])); b.onclick=function(){ getFile(k,b,m); }; fs.appendChild(b); });
      if(d.self) fs.appendChild(el("span","cv-law",d.self));
      bd.appendChild(m); w.appendChild(box); }); }
  function cp(t,m){ (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ msg(m,"복사했어요.","ok"); },function(){ msg(m,"복사하지 못했어요. 글을 직접 골라 복사해 주세요.","warn"); }); }
  function drop(lab,inp){ lab.addEventListener("dragover",function(e){ e.preventDefault(); lab.classList.add("hot"); }); lab.addEventListener("dragleave",function(){ lab.classList.remove("hot"); });
    lab.addEventListener("drop",function(e){ e.preventDefault(); lab.classList.remove("hot"); var fl=Array.prototype.filter.call(e.dataTransfer.files,function(f){ return /\.(xlsx|xls|xlsm)$/i.test(f.name); }); if(fl.length) inp._take(inp.multiple?fl:fl.slice(0,1)); }); }
  function upBox(pn,title,small,multi,take){ var lab=el("label","pr-drop"), inp=el("input"); inp.type="file"; inp.accept=".xlsx,.xls,.xlsm"; inp.hidden=true; inp.multiple=!!multi;
    lab.appendChild(el("b",null,title)); lab.appendChild(el("small",null,small)); lab.appendChild(inp); pn.appendChild(lab);
    inp._take=take; inp.onchange=function(){ var fl=Array.prototype.slice.call(inp.files); inp.value=""; if(fl.length) take(fl); }; drop(lab,inp); return lab; }

  /* ---- 단계 ---- */
  var S=[];
  S[0]=function(pn){ var g=grid(pn), c;
    fld(g,"gno","지침 공문 번호",{ph:"학교지원과-0000"}); fld(g,"gdate","지침 공문 날짜",{type:"date"});
    fld(g,"edu","교직원 자체교육",{type:"date"}); fld(g,"eduT","시각",{type:"time"}); fld(g,"eduP","장소",{ph:"○○실"}); fld(g,"req","예산요구서 제출 기한",{type:"date",live:function(){ up(); }});
    c=calc(pn); function up(){ var x=dd(D50(),3), y=dd(D5(),7);
      tiles(c,[{l:"회계연도 개시",v:dot(Y()+"-03-01"),s:ACCT+" 3. 1.~2. 말"},{l:"전입금 교부계획",v:x.v+"까지",s:"개시 50일 전"},PRI?{l:"관할청 보고·공시",v:y.v+"까지",s:"개시 5일 전 · "+y.s,c:y.c}:{l:"학운위 제출",v:dot(D30())+"까지",s:"개시 30일 전 · 심의는 "+dot(D5())+"까지"}]); } up(); };
  S[1]=function(pn){ var g=grid(pn); fld(g,"op","의견수렴 시작",{type:"date",hint:"교직원 교육 날로 채워요"}); fld(g,"opE","의견수렴 끝",{type:"date"});
    var c=calc(pn), a=V("op"), b=V("opE"), n=a&&b?Math.round((pd(b)-pd(a))/864e5)+1:null;
    tiles(c,[{l:"의견수렴 기간",v:n?n+"일":"-",s:"가정통신문·누리집 · 참여예산제"},PRI?{l:"학부모회 의견",v:"꼭 들어요",s:"학교운영지원비 편성(재무·회계 규칙 제16조)"}:{l:"요구사업",v:"학운위에서 설명",s:"회의록에 명기"},PRI?{l:"반영 결과 공개",v:"확정 후 7일 이내",s:"누리집 『학생·학부모가 참여하는 학교예산 편성』"}:{l:"반영 사업 안내",v:"예산 공개 때",s:"학교회계 규칙 제12조(지침)"}]); };
  S[2]=function(pn){ var m=el("div","tkmsg"); toastBox=m;
    var c=calc(pn); function up(){ var rows=rAll(), tot=0, prev=0, dp={}; rows.forEach(function(r){ tot+=r.요구금액; prev+=r.전년; dp[r.부서]=1; }); var bad=rows.filter(function(r){ return r.어긋남||r.빈금액; }).length, x=dd(V("req"),2);
      tiles(c,[{l:"제출 기한",v:x.v,s:x.s,c:x.c},{l:"요구 총액",v:rows.length?won(tot)+"원":"-",s:rows.length?Object.keys(dp).length+"개 부서 · "+rows.length+"건 · 전년 대비 "+(tot-prev>=0?"+":"")+won(tot-prev):"회수한 파일을 올리면 나와요"},{l:"다시 볼 줄",v:bad+"건",s:"산출식과 금액이 어긋나거나 금액이 빈 줄",c:bad?"bad":rows.length?"ok":""}]); }
    up();
    var two=el("div","pr-two"); pn.appendChild(two); var L=el("div"), R=el("div"); two.appendChild(L); two.appendChild(R);
    sub(L,"① 선생님께 보낼 서식","노란 칸만 채우면 금액이 계산돼요");
    upBox(L,"에듀파인 본예산 업로드서식","예산편성 → 세출예산관리 → 본예산 업로드서식 다운 (.xls, .xlsx)",false,function(fl){ var f=fl[0];
      readBook(f).then(function(p){ var s=readSheet(p[0],p[1]); if(!s) throw new Error("'세부사업명' 열이 있는 파일인지 확인해 주세요.");
        master.rows=sheetRecs(s).filter(function(r){ return String(r["세부사업명"]).trim()||String(r["세부항목명"]).trim(); }); if(!master.rows.length) throw new Error("읽을 자료가 없어요.");
        var cnt={}; master.rows.forEach(function(r){ var k=String(r["세부사업명"]).trim()||"(사업명 없음)"; cnt[k]=(cnt[k]||0)+1; });
        master.biz=Object.keys(cnt).sort(function(a,b){ return a.localeCompare(b,"ko"); }).map(function(k){ return {name:k,count:cnt[k],on:true}; });
        master.msg=f.name+" — "+master.rows.length+"행, 세부사업 "+master.biz.length+"개"; bizDraw(); }).catch(function(e){ msg(m,e.message||"파일을 열지 못했어요.","bad"); }); });
    var bz=el("div"); L.appendChild(bz);
    function picked(){ var on={}; master.biz.forEach(function(b){ if(b.on) on[b.name]=1; }); return master.rows.filter(function(r){ return on[String(r["세부사업명"]).trim()||"(사업명 없음)"]; }); }
    function form(rows){ needExcelJS().then(function(EJ){ var title=Y()+"학년도 본예산 예산요구안"; return buildForm(EJ,rows,title).xlsx.writeBuffer().then(function(buf){ saveBuf(buf,title+".xlsx"); msg(m,"배포용 서식을 내려받았어요. 메신저로 선생님들께 보내 주세요.","ok"); }); })
      .catch(function(){ msg(m,"엑셀 만들기 기능을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.","warn"); }); }
    function bizDraw(){ bz.textContent=""; if(!master.biz.length) return; bz.appendChild(el("p","cv-law",master.msg));
      var w=el("div","pr-biz"); bz.appendChild(w);
      master.biz.forEach(function(b){ var lb=el("label"), cb=el("input"); cb.type="checkbox"; cb.checked=b.on; cb.onchange=function(){ b.on=cb.checked; }; lb.appendChild(cb); lb.appendChild(document.createTextNode(b.name+" ("+b.count+")")); w.appendChild(lb); });
      bz.appendChild(btn("배포용 서식 내려받기","btn",function(){ var r=picked(); if(!r.length){ msg(m,"사업을 하나 이상 골라 주세요.","warn"); return; } form(r); })); }
    bizDraw();
    var bl=el("p","cv-law"); L.appendChild(bl); bl.appendChild(document.createTextNode("기초자료 없이: ")); var lk=btn("빈 서식(60줄) 내려받기","cv-back",function(){ var r=[]; for(var i=0;i<60;i++) r.push({}); form(r); }); bl.appendChild(lk);
    sub(R,"② 회수한 파일 취합","여러 개를 한 번에");
    upBox(R,"작성된 예산요구안","끌어 놓거나 눌러서 선택 · 여러 개 가능",true,function(fl){
      Promise.all(fl.map(parseReq)).then(function(res){ res.forEach(function(r){ var i=-1; P.req.forEach(function(s,j){ if(s.file===r.file) i=j; }); if(i>=0) P.req[i]=r; else P.req.push(r); });
        put(); var ok=res.filter(function(r){ return !r.error; }).length; list(); up(); msg(m,ok+"개 파일을 취합했어요."+(res.length-ok?" 못 읽은 파일 "+(res.length-ok)+"개":""),ok?"ok":"warn"); }); });
    var ls=el("div","pr-rows"); R.appendChild(ls);
    function list(){ ls.textContent=""; P.req.forEach(function(s,i){ var r=el("div","pr-row"), fn=el("div","fn",s.dept||"(부서 없음)"); fn.appendChild(el("small",null,s.error?s.file+" — "+s.error:s.file+(s.mgr?" · "+s.mgr:""))); r.appendChild(fn);
        r.appendChild(el("span","ct",s.rows.length+"건")); r.appendChild(el("span","am",won(s.sum)+"원")); r.appendChild(btn("×","x",function(){ P.req.splice(i,1); put(); list(); up(); })); ls.appendChild(r); });
      if(P.req.length){ var bb=el("div","pr-dfoot"); bb.appendChild(btn("취합본 내려받기(엑셀)","btn ghost",function(){ CUR=P; exportReq(); })); ls.appendChild(bb); } }
    list(); pn.appendChild(m); };
  function parseReq(f){ return readBook(f).then(function(p){ var s=readSheet(p[0],p[1]); if(!s) return {file:f.name,error:"머리글을 찾지 못했어요",rows:[],sum:0};
      var meta=readMeta(s.rows,s.head), rows=[], last={사업:"",항목:"",비목:""}, dept=meta.dept||cleanName(f.name);
      sheetRecs(s).forEach(function(rec){ var amt=toNum(rec["요구금액"]), fml=String(rec["산출식"]||"").trim(), biz=String(rec["세부사업명"]||"").trim(), sb=String(rec["세부항목명"]||"").trim(), cost=String(rec["원가통계비목명"]||"").trim();
        if(/^(합\s*계|총\s*계|소\s*계)/.test(biz)) return; biz=biz||last.사업; sb=sb||last.항목; cost=cost||last.비목; last={사업:biz,항목:sb,비목:cost};
        if(amt===0&&fml==="") return; var ck=calcFormula(fml);
        rows.push({부서:dept||String(rec["부서명"]||"").trim(),사업:biz,항목:sb,비목:cost,내역:String(rec["산출내역"]||"").replace(/\s*\n\s*/g," ").trim(),산출식:fml.replace(/\s*\n\s*/g," "),
          요구금액:amt||(ck||0),검산:ck,전년식:String(rec["전년산출식"]||"").trim(),전년:toNum(rec["전년요구금액"]),파일:f.name,어긋남:(ck!=null&&amt>0&&Math.abs(ck-amt)>0.5),빈금액:amt===0}); });
      return {file:f.name,dept:dept,mgr:meta.mgr,rows:rows,sum:rows.reduce(function(a,b){ return a+b.요구금액; },0)}; })
    .catch(function(e){ return {file:f.name,error:e.message||"열지 못했어요",rows:[],sum:0}; }); }
  S[3]=function(pn){ var g=grid(pn), c;
    fld(g,"ano","교부계획 공문 번호",{ph:"학교지원과-0000"}); fld(g,"alloc","교부계획 공문 날짜",{type:"date",live:function(){ up(); }});
    fld(g,"adj","조정위원회 날짜",{type:"date"}); fld(g,"adjT","시각",{type:"time"}); fld(g,"adjP","장소",{ph:"○○실"});
    c=calc(pn); var tb;
    function up(){ var rows=adjRows(), s=adjSum(rows), k=chk(V("alloc"),D50(),"기한 안에 받았어요","50일 전보다 늦었어요");
      tiles(c,[{l:"교부계획 통지",v:D50()?dot(D50())+"까지":"-",s:k.s||"개시 50일 전",c:k.c},{l:"요구액",v:rows.length?chon(s[0])+"천원":"-",s:rows.length?rows.length+"줄":"'요구서'에서 취합하거나 줄을 넣어요"},{l:"조정액",v:rows.length?chon(s[1])+"천원":"-",s:rows.length?(s[1]-s[0]?"증감 "+(s[1]-s[0]>0?"+":"")+won(s[1]-s[0])+"원":"조정 없음"):""}]); }
    sub(pn,"조정표","요구액은 취합에서 오고, 조정액·사유만 고쳐요");
    tb=el("div","pr-rows"); pn.appendChild(tb);
    function rowsDraw(){ tb.textContent=""; var rows=adjRows(); var hd=el("div","pr-adj hd"); ["부서","세부사업","요구액(원)","조정액(원)","조정 사유",""].forEach(function(t){ hd.appendChild(el("span",null,t)); }); if(rows.length) tb.appendChild(hd);
      rows.forEach(function(r,i){ var w=el("div","pr-adj"+(num(r.req)!==num(r.adj)?" ch":""));
        function inp(f,cls,ro){ var x=el("input",cls||""); x.value=f==="adj"||f==="req"?won(num(r[f])):r[f]||""; if(f==="adj"||f==="req") x.inputMode="numeric"; x.readOnly=!!ro; x.setAttribute("aria-label",f);
          x.oninput=function(){ var all=adjRows(); all[i][f]=f==="req"||f==="adj"?num(x.value):x.value; saveAdj(all); w.className="pr-adj"+(num(all[i].req)!==num(all[i].adj)?" ch":""); up(); };
          x.onblur=function(){ if(f==="req"||f==="adj") x.value=won(num(x.value)); }; return x; }
        if(r.manual){ var a=inp("dept"); a.className="dp"; a.placeholder="부서"; w.appendChild(a); var b=inp("biz"); b.className="bz"; b.placeholder="세부사업"; w.appendChild(b); var q=inp("req","r rq"); w.appendChild(q); }
        else { w.appendChild(el("span","dp",r.dept)); w.appendChild(el("span","bz",r.biz)); w.appendChild(el("span","rq",won(num(r.req)))); }
        w.appendChild(inp("adj","r")); var y=inp("why","wy"); y.placeholder="조정 사유"; w.appendChild(y);
        w.appendChild(r.manual?btn("×","x",function(){ var all=adjRows(); all.splice(i,1); saveAdj(all); rowsDraw(); up(); }):el("span"));
        tb.appendChild(w); }); }
    rowsDraw(); up();
    pn.appendChild(btn("+ 줄 더하기","pr-add",function(){ var all=adjRows(); all.push({dept:"",biz:"",req:0,adj:0,why:"",manual:true}); saveAdj(all); rowsDraw(); up(); }));
    sub(pn,"회의록","비우면 조정표 내용으로 채워요");
    var mw=el("div","pr-mt"), M=mt(); pn.appendChild(mw);
    [["attend","참석 위원",2],["absent","불참 위원",1],["talk","회의 내용",4],["dec","결정 사항",2]].forEach(function(x){ var lb=el("label",null,x[1]), t=el("textarea"); t.rows=x[2]; t.value=P.mt[x[0]]||""; t.placeholder=x[0]==="talk"?M.talk0:x[0]==="dec"?M.dec0:M[x[0]];
      t.oninput=function(){ P.mt[x[0]]=t.value; put(); }; lb.appendChild(t); mw.appendChild(lb); }); };
  S[4]=function(pn){ var g=grid(pn), c; fld(g,"comNo","학운위 회차",{ph:"○○"}); fld(g,"com","학운위 심의 날짜",{type:"date",live:function(){ up(); }}); fld(g,"amt","예산 규모(세입·세출 각각)",{num:1,ph:"원"});
    c=calc(pn); function up(){ var x=dd(V("com"),4), k=chk(V("com"),D5(),"관할청 보고 전이에요","보고 기한을 넘겨요");
      tiles(c,[{l:"학운위 심의",v:x.v,s:k.s||x.s,c:k.c||x.c},{l:"심의 뒤",v:"법인 이사장에게 제출",s:"사립학교법 제29조제4항"},{l:"예산 규모",v:V("amt")?won(num(V("amt")))+"원":"-",s:"문안의 ○○○,○○○,○○○원에 들어가요"}]); } up();
    pn.appendChild(el("p","cv-law","회의 문서(소집 공고·회의록)는 학운위 문서 도구에서 만들어요."));
    pn.appendChild(btn("학운위 문서 도구 열기 →","cv-back",function(){ if(window.tkShow) window.tkShow("hk"); })); };
  S[5]=function(pn){ var g=grid(pn), c; fld(g,"sub","법인 제출일",{type:"date",hint:"학운위 다음 근무일로 채워요",live:function(){ up(); }});
    c=calc(pn); function up(){ var k=chk(V("sub"),D5(),"관할청 보고 전이에요","보고 기한을 넘겨요"), o=V("sub")&&V("com")&&V("sub")<V("com");
      tiles(c,[{l:"법인 제출",v:V("sub")?dot(V("sub")):"-",s:o?"학운위 심의보다 빨라요":k.s||"회계연도 개시 전",c:o?"bad":k.c},{l:"수신",v:V("corp")?V("corp")+" 이사장":"법인 이사장",s:"예산서 + 학운위 회의록 사본"},{l:"근거",v:"재무·회계 규칙 제16조②",s:"2025. 4. 18. 개정 — 개시 전"}]); } up(); };
  S[6]=function(pn){ var g=grid(pn), c; fld(g,"brd","이사회 의결일",{type:"date",live:function(){ up(); }});
    c=calc(pn); function up(){ var k=chk(V("brd"),D5(),"관할청 보고 전이에요","보고 기한을 넘겨요"), b=V("brd");
      tiles(c,[{l:"이사회 의결",v:b?dot(b):"-",s:k.s||"개시 전, 보고 기한("+dot(D5())+") 전에",c:k.c},{l:"참여예산 결과 공개",v:b?dot(addDays(b,7))+"까지":"확정 후 7일",s:b?ddTxt(dday(addDays(b,7))):"누리집"},{l:"에듀파인",v:"예산 확정 처리",s:"이사회 회의록 사본 받아 두기"}]); } up(); };
  S[7]=function(pn){ var g=grid(pn), c; fld(g,"pubd","관할청 보고·누리집 공시일",{type:"date",live:function(){ up(); }});
    c=calc(pn); function up(){ var x=dd(D5(),7), k=chk(V("pubd"),D5(),"기한 안이에요","5일 전 기한을 넘겨요");
      tiles(c,[{l:"보고·공시 기한",v:x.v,s:"개시 5일 전 · "+x.s,c:x.c},{l:"공시일",v:V("pubd")?dot(V("pubd")):"-",s:k.s,c:k.c},{l:"공개",v:"1년간",s:"학교회계시스템 원본파일(PDF) 그대로"}]); } up(); };

  if(!PRI){ S[4]=function(pn){ var g=grid(pn), c; fld(g,"subm","학운위 제출일",{type:"date",hint:"개시 30일 전 근무일로 채워요",live:function(){ up(); }}); fld(g,"amt","예산 규모(세입·세출 각각)",{num:1,ph:"원"});
      c=calc(pn); function up(){ var k=chk(V("subm"),D30(),"기한 안이에요","30일 전 기한을 넘겨요"), x=dd(D30(),4);
        tiles(c,[{l:"제출 기한",v:x.v,s:"개시 30일 전 · "+x.s,c:x.c},{l:"제출일",v:V("subm")?dot(V("subm")):"-",s:k.s,c:k.c},{l:"위원 통지",v:"회의 7일 전까지",s:"예산안 송부(학교회계 규칙 제14조)"}]); } up(); };
    S[5]=function(pn){ var g=grid(pn), c; fld(g,"sub","예·결산소위원회 심사일 (구성한 경우)",{type:"date",live:function(){ up(); }}); fld(g,"comNo","학운위 회차",{ph:"○○"}); fld(g,"com","학운위 심의 날짜",{type:"date",live:function(){ up(); }});
      c=calc(pn); function up(){ var k=chk(V("com"),D5(),"기한 안이에요","5일 전 기한을 넘겨요"), x=dd(D5(),5), nt=V("com")?addDays(V("com"),-7):"", o=V("sub")&&V("com")&&V("sub")>V("com");
        tiles(c,[{l:"심의 기한",v:x.v,s:k.s||"개시 5일 전 · "+x.s,c:k.c||x.c},{l:"위원 통지",v:nt?dot(nt)+"까지":"-",s:"회의 7일 전"},{l:"소위원회",v:V("sub")?dot(V("sub")):"구성은 학교가 정해요",s:o?"본회의보다 늦어요":"학운위가 구성할 수 있어요 · 학교회계 규칙 제14조④",c:o?"bad":""}]); } up();
      pn.appendChild(el("p","cv-law","회의 문서(소집 공고·회의록)는 학운위 문서 도구에서 만들어요."));
      pn.appendChild(btn("학운위 문서 도구 열기 →","cv-back",function(){ if(window.tkShow) window.tkShow("hk"); })); };
    S[6]=function(pn){ var g=grid(pn), c; fld(g,"fix","예산 확정일",{type:"date",hint:"심의 날로 채워요",live:function(){ up(); }}); fld(g,"pubd","누리집 공개일",{type:"date",hint:"확정 후 10일 안쪽으로 채워요",live:function(){ up(); }});
      c=calc(pn); function up(){ var f=V("fix"), lim=f?addDays(f,10):"", k=chk(V("pubd"),lim,"10일 안이에요","10일을 넘겨요"), e=addDays(Y()+"-03-01",-1), kf=chk(f,e,"개시 전 확정","개시 뒤 확정 — 인건비 등은 전년도 준용");
        tiles(c,[{l:"확정",v:f?dot(f):"-",s:kf.s||dot(e)+"까지",c:kf.c},{l:"공개 기한",v:lim?dot(lim)+"까지":"확정 후 10일",s:k.s,c:k.c},{l:"참여예산 결과 공개",v:f?dot(addDays(f,7))+"까지":"확정 후 7일",s:f?ddTxt(dday(addDays(f,7)))+" · 누리집 '학생·학부모가 참여하는 학교예산 편성'":"기본지침 Ⅷ"},{l:"공개 내용",v:"총칙·예산서",s:"학교구성원 의견 반영 사업 포함"}]); } up(); }; }
  /* ---- 화면 ---- */
  function curStage(){ for(var i=0;i<STG.length;i++) if(!P.done[i]) return i; return STG.length; }
  function draw(){
    CUR=P; if(prefill()) put(); toastBox=null;
    app.textContent="";
    var hero=el("div","pr-hero");
    function hin(k,cls,ph,lab){ var i=el("input",cls); i.placeholder=ph; i.value=V(k); i.setAttribute("aria-label",lab); i.oninput=function(){ F[k]=i.value.trim(); put(); }; i.onchange=function(){ draw(); }; hero.appendChild(i); }
    var md=el("select"); md.setAttribute("aria-label","공립·사립"); [["pub","공립 학교회계"],["pri","사립 교비회계"]].forEach(function(x){ var o=el("option",null,x[1]); o.value=x[0]; md.appendChild(o); }); md.value=ver;
    md.onchange=function(){ try{ localStorage.setItem("bud.mode",md.value); }catch(e){} var sc=V("school"); build(root,md.value); };   /* 공립·사립은 기록을 따로 둔다(pub.p·pri.p) */
    hero.appendChild(md);
    hin("school","sch","학교명 (예: ○○고등학교)","학교명"); if(PRI) hin("corp","corp","법인명 (예: 학교법인 ○○학원)","법인명");
    var yl=el("label"), yi=el("input","yr"); yi.type="number"; yi.min="2026"; yi.max="2035"; yi.value=String(Y()); yl.appendChild(yi); yl.appendChild(document.createTextNode("학년도 예산")); hero.appendChild(yl);
    yi.onchange=function(){ F.year=yi.value; put(); draw(); };
    hero.appendChild(el("span","sp")); var mb=btn("자료 내보내기","btn ghost"); hero.appendChild(mb); app.appendChild(hero);
    var setBox=el("div"); app.appendChild(setBox); mb.onclick=function(){ if(setBox.firstChild){ setBox.textContent=""; return; } settings(setBox); };
    var cur=curStage(), sel=view.open==null?Math.min(cur,STG.length-1):view.open;
    var now=el("div","pr-now");
    if(cur>=STG.length) now.appendChild(el("b",null,Y()+"학년도 본예산 편성을 모두 마쳤어요."));
    else { var st0=SD.steps[cur]; now.appendChild(el("span","cv-dd",plain(st0.when).replace(/ —.*/,""))); var t=el("span"); t.appendChild(el("b",null,"지금: "+st0.t)); now.appendChild(t);
      if(!P.done[STG.length-1]){ var dl=PRI?D5():(P.done[4]?D5():D30()), n=dday(dl); now.appendChild(el("span","cv-dd "+ddCls(n),(PRI?"관할청 보고·공시 ":P.done[4]?"학운위 심의 기한 ":"학운위 제출 기한 ")+ddTxt(n))); } }
    app.appendChild(now);
    var nv=el("nav","cv-idx"); nv.style.setProperty("--n",STG.length);
    STG.forEach(function(s,i){ var stt=P.done[i]?"done":i===cur?"cur":"todo", b=btn("","cv-ix "+stt+(i===sel?" sel":""),function(){ view.open=i; draw(); });
      if(i===sel) b.setAttribute("aria-current","step"); b.appendChild(el("span","n",stt==="done"?"✓":String(i+1))); b.appendChild(el("span","t",s[0])); nv.appendChild(b); });
    app.appendChild(nv);
    var pn=el("section","cv-pane"); app.appendChild(pn); var st=SD.steps[sel];
    var hd=el("div","cv-ph"); hd.appendChild(el("h4",null,st.t)); hd.appendChild(el("span",null,plain(st.when)+" · "+st.who+(P.done[sel]?" · "+dot(P.done[sel])+" 마침":""))); pn.appendChild(hd);
    S[sel](pn,st);
    sub(pn,"할 일"); ticks(pn,sel,st);
    var lw=el("p","pr-say"); lw.innerHTML=st.law; lw.style.marginTop="10px"; pn.appendChild(lw);
    docs(pn,sel,st);
    var nb=el("div","cv-next"); pn.appendChild(nb);
    if(P.done[sel]) nb.appendChild(btn("이 단계 다시 열기","btn ghost",function(){ delete P.done[sel]; put(); draw(); }));
    else nb.appendChild(btn(sel<STG.length-1?"이 단계 마쳤어요 · "+STG[sel+1][0]+"(으)로":"모두 마쳤어요","btn",function(){ P.done[sel]=today(); view.open=sel<STG.length-1?sel+1:sel; put(); draw(); top(); }));
    var pr=el("div","cv-pn"); pn.appendChild(pr);
    pr.appendChild(sel>0?btn("← "+STG[sel-1][0],"cv-back",function(){ view.open=sel-1; draw(); top(); }):el("span"));
    if(sel<STG.length-1) pr.appendChild(btn(STG[sel+1][0]+" →","cv-back",function(){ view.open=sel+1; draw(); top(); }));
  }
  function top(){ var r=root.getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-80}); }
  function settings(box){ box.textContent=""; var s=el("div","cv-set"); box.appendChild(s);
    var r=el("div","cv-btns"); s.appendChild(r); var m=el("div","tkmsg"); s.appendChild(m);
    r.appendChild(btn("내보내기","btn ghost",function(){ T.saveFile(new Blob([JSON.stringify(P,null,1)],{type:"application/json"}),(PRI?"사립본예산_":"공립본예산_")+Y()+"_"+today()+".json").then(function(){ msg(m,"내보냈어요.","ok"); },function(e){ msg(m,e.message,"warn"); }); }));
    var lb=el("label","btn ghost","불러오기"), fi=el("input"); fi.type="file"; fi.accept=".json"; fi.hidden=true; lb.appendChild(fi); r.appendChild(lb);
    fi.onchange=function(){ var f=fi.files[0]; if(!f) return; f.text().then(function(t){ var j=JSON.parse(t); if(!j||!j.f) throw 0; LS.set(KEY,j); P=load(KEY); CUR=P; F=P.f; draw(); }).catch(function(){ msg(m,"본예산 파일을 읽지 못했어요.","bad"); }); };
    r.appendChild(btn("새 학년도 시작","cv-x",function(){ if(!confirm("지금 기록을 비우고 다음 학년도를 새로 시작할까요? (먼저 내보내기를 권해요)")) return;
      LS.set(KEY,{f:{school:V("school"),corp:V("corp"),year:String(Y()+1)},mt:{attend:P.mt.attend||""}}); P=load(KEY); CUR=P; F=P.f; view.open=null; draw(); }));
  }
  draw();
}
/* 본예산 하나: 맨 위에서 공립/사립을 고르면 뒤 단계가 바뀐다(2026-11-17 Junho — 따로 둘 필요 없음) */
function mode(){ var m=null; try{ m=localStorage.getItem("bud.mode"); }catch(e){} if(m!=="pub"&&m!=="pri"){ var hasPri=false; try{ hasPri=!!localStorage.getItem("pri.p")&&!localStorage.getItem("pub.p"); }catch(e){} m=hasPri?"pri":"pub"; } return m; }
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.pri=function(r){ return build(r,mode()); };
})();
