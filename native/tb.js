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
var SRC={"STEPS":[{"id":"s1","no":1,"title":"선정 준비·계획 수립·연수","own":"교무","when":"8~9월","sub":"공문과 매뉴얼을 확인하고, 우리 학교 선정계획을 결재한 뒤 부조리 예방 연수를 합니다","flow":[["교무","교육청 공문·매뉴얼 확인","9월 교육청 공문에 ‘선정 매뉴얼’, ‘도서 목록’, ‘웹전시 인증번호’가 붙어 옵니다. 신간본이 있는 과목이 선정 대상입니다."],["교무","선정계획 수립 → 내부결재","매뉴얼의 예시 계획을 우리 학교 이름·일정·절차로 고칩니다. 절차·평가 기준·일정·부조리 예방 대책이 들어갑니다.","d11"],["교무","부조리 예방 연수(교직원·학교운영위원)","참고 2 안내문으로 10분이면 됩니다. 메신저 배포도 가능. 학운위 위원에게도 자료를 줍니다.","d12"],["교무·행정","전시본 받기·비치, 웹전시 안내","서책 전시본은 도서관 등 한곳에 두고, 웹전시(textbook114.com)는 인증번호를 교사에게 안내합니다."],["행정","출입 통제·무상 자료 반려","전시 기간과 상관없이 출판사·저작자·판매업자의 학교 출입은 막고, 전시본 외 자료는 받지 않습니다."]],"warn":["전시본(교과서·지도서 64쪽 요약본) 외의 참고서·자습서·기념품·학교발전기금은 금액과 상관없이 받을 수 없습니다. 요구해도 안 됩니다.","후보가 한 종뿐인 과목(1책 1도서)은 교사 의견수렴을 생략할 수 있지만 학교운영위원회 심의는 해야 합니다.","출판사가 여는 설명회·모임 참석을 금지하고, 교사 모임에서 출판사별 분석표를 인터넷에 올리는 일도 하지 않습니다."],"hand":["교무 → 행정: 선정계획(결재본), 연수 자료 — 학운위 위원 배부용"],"docs":["d11","d12"],"g":["교육청 공문·선정 매뉴얼·도서 목록 확인, 우리 학교 선정 대상 과목(신간본 있는 과목) 추리기","1책 1도서 과목 표시(의견수렴 생략, 심의만)","선정계획 작성·내부결재 <code>기안문 1-1</code> — 절차·평가기준·일정·연수·부조리 예방 대책","부조리 예방 연수 실시 <code>기안문 1-2</code>, 연수 자료(참고 2) 보관","서책 전시본 수령·비치 장소 지정, 웹전시 인증번호 교사 안내","교과협의회 구성 안내(과목별 대표교사 지정)"],"h":["전시본 수령 시 종류·수량 확인, 전시본 외 무상 자료는 반려","학운위 위원에게 연수 자료 배부(간사)","출판사·판매업자 출입 통제 협조(현관·행정실 안내)","NEIS로 주문할 수 없는 도서(2022개정 중학교 지도서 등) 자체예산 확인"]},{"id":"s2","no":2,"title":"교과협의회 의견수렴·심사","own":"교무","when":"9~10월","sub":"과목별로 교사들이 평가표를 만들어 후보 교과서에 점수를 매기고, 추천 순위와 의견을 냅니다","flow":[["교무","교과협의회 구성","과목 자격 교원 전원 참여가 원칙, 대표 3인 이상 권장(10학급 미만은 2인 이상). 저자는 빠집니다."],["교무","우리 학교 평가표 만들기","참고 1의 7개 영역(교육과정·학습내용·조직·교수학습·평가·표현·재정)에서 항목을 골라 배점을 정합니다. 가격 항목을 꼭 넣습니다.","d21"],["교무","심사 방법 정하기","교사별 전체 심사 / 단원별 분담 / 평가기준별 분담 중 하나. 장단점은 매뉴얼에 있습니다."],["교무","개별 심사(서식 1) → 총괄표(서식 2)","위원마다 평가표에 점수를 적고, 대표교사가 총괄표로 합산·평균을 냅니다."],["교무","추천 의견서(서식 3) 제출","순위·출판사·가격·추천 의견을 적어 담당 부서에 냅니다. 작성자 대표교사, 확인자 교감."]],"warn":["교원 자격 소지자가 3인 미만이면 같은 교과군 교원이나 인근 학교 교원을 넣어 3인 이상으로 꾸리는 것을 권장합니다(10학급 미만 2인 이상).","출판사가 주는 플랫폼·자료 제공 같은 편의성은 보조 요소입니다. 내용·단원 구성·학습활동 등 교육적 기준으로 비교해야 합니다.","개인별 평가표의 점수와 의견은 외부에 공개하지 않습니다. 결과 공개 때도 마찬가지입니다."],"hand":["교무(협의회) → 교무(담당 부서): 서식 1·2·3 원본 — 새 교과서를 선정할 때까지 보관"],"docs":["d21"],"g":["과목별 교과협의회 구성(3인 이상 권장), 저자 제외 확인","평가표 작성: 참고 1에서 항목 조합 + 가격 항목, 항목별 배점(합계 100)","심사 방법 결정(교사별 전체 / 단원별 / 기준별 분담)","개별 평가표(서식 1) 작성 — 위원 서명","총괄표(서식 2) 합산·평균 — 작성자 소속 교사, 확인자 대표교사","추천 의견서(서식 3) — 순위·출판사·가격·의견, 확인자 교감","제출 기한까지 담당 부서에 제출 <code>기안문 2-1</code>"],"h":["(해당 없음) — 학운위 회의 일정을 교무와 미리 맞춰 둡니다(심의 일정 역산)"]},{"id":"s3","no":3,"title":"선정심의(안) 작성·학운위 상정","own":"교무·행정","when":"10월","sub":"과목별 추천 의견서를 모아 심의안을 만들고, 학교장이 학교운영위원회 소집을 요구합니다","flow":[["교무","추천 의견서 수합 → 선정심의(안) 작성","과목·추천 순위·출판사·가격·추천 사유를 표로 정리합니다. ‘재주문이 필요하면 차순위 도서로 자동 확정’ 문구를 넣습니다."],["교무","학교장 결재 → 학운위 소집 요구","선정심의(안)을 붙여 소집을 요구합니다.","d31"],["행정","회의 소집·안건 통지(간사)","회의 7일 전까지 일시·장소·안건을 위원에게 알리고 학교 누리집에 공개합니다. 이해관계 위원이 있는지 확인합니다."]],"warn":["선정심의(안)에 ‘발행사 운영난 등으로 재주문이 필요할 경우 학교운영위원회를 별도 개최하지 않고 차순위 도서로 자동 확정한다’를 명기해 두면 뒤에 번거로움이 줄어듭니다.","저작자·발행사·대리점 관계자는 학교운영위원이라도 이 안건 심의에 참여할 수 없습니다."],"hand":["교무 → 행정(간사): 선정심의(안), 과목별 추천 의견서 사본 — 회의 자료"],"docs":["d31"],"g":["과목별 추천 의견서 수합(기한 관리)","선정심의(안) 작성: 과목 · 1~3순위 · 출판사 · 정가 · 사유 · 1책 1도서 과목 표시","차순위 자동 확정 문구 포함","학교장 결재 후 학운위 소집 요구 <code>기안문 3-1</code>"],"h":["소집 공고·개별 통지(회의 7일 전), 누리집 공개","안건 자료 위원 배부(개인별 평가표는 제외, 총괄표·의견서까지)","이해관계 위원 확인(저작자·발행사·대리점) — 해당 시 심의 제척","학운위 문서 도구(학교 행정실무 길잡이 › 학운위)로 소집 공고·회의록 틀 준비"]},{"id":"s4","no":4,"title":"학교운영위원회 심의","own":"행정","when":"10월","sub":"학운위는 ‘어느 책이 좋은가’가 아니라 평가 기준과 절차가 타당하고 공정했는지를 심의합니다","flow":[["행정","회의 진행(간사)","성원 보고 → 안건 상정. 필요하면 교과협의회 대표교사가 설명합니다."],["교무","대표교사 설명","평가표·심사 방법·추천 사유를 설명합니다. 개인별 점수는 밝히지 않습니다."],["행정","심의 결과 정리","원안 가결이면 회의록에 기록. 원안과 다르면 심의 의견서(서식 4)를 작성해 회의록에 붙입니다.","d41"],["행정","심의 결과 학교장 이송·서류 봉함 보관","관계 서류는 봉하여 담당 부서에서 새 교과서 선정 때까지 보관합니다."]],"warn":["매년 학운위 심의가 필요합니다. 신간본 선정이 없는 해에도 사용 도서 목록 심의 등 약식으로 합니다.","심의 결과가 원안과 다르면 반드시 서식 4(심의 의견서)를 회의록에 첨부합니다. 작성자 학교운영위원, 확인자 위원장."],"hand":["행정 → 교무: 심의 결과(회의록 사본), 심의 의견서(있을 때)"],"docs":["d41"],"g":["대표교사 참석·설명 준비(평가표·총괄표·추천 사유)","심의 결과 수령 → 5단계 확정 준비"],"h":["성원 확인, 이해관계 위원 제척 확인","회의록 작성(안건명·심의 결과·의결 방법), 원안과 다르면 서식 4 첨부","심의 결과 학교장 이송 <code>기안문 4-1</code>","관계 서류 봉함 보관(새 교과용도서 선정 시까지)"]},{"id":"s5","no":5,"title":"학교장 확정·공개·보관","own":"교무","when":"10월","sub":"학교장이 심의 결과를 존중해 확정하고, 기준표·절차·결과를 학교 누리집에 공개합니다","flow":[["교무","학교장 확정","심의 결과를 존중해 선정합니다. 다르게 하려면 학운위와 교육지원청에 서면 보고해야 합니다(국·공·사립 동일).","d51"],["교무","학교 누리집 공개","공개 항목: 선정 기준표, 선정 절차, 결과. 개인별 평가 결과·의견은 공개하지 않습니다."],["교무","자료 보관","개인별 평가표·총괄표·의견서·회의록을 교육과정 개정 등으로 새 교과서를 선정할 때까지 보관합니다."]],"warn":["공개하는 ‘결과’는 학운위 심의 대상이 된 검·인정도서에 한합니다.","선정한 책을 바꾸려면 처음부터 같은 절차(협의회 → 학운위 → 확정)를 다시 밟아야 합니다. 바꾸는 일이 생기지 않게 신중히 결정하세요."],"hand":["교무 → NEIS 담당(교무 또는 행정): 확정 도서 목록(과목·출판사·저자) — 6단계 주문 입력용"],"docs":["d51"],"g":["학교장 확정 결재 <code>기안문 5-1</code>(심의 결과와 다르면 서면 보고 추가)","누리집 공개: 기준표·절차·결과 — 개인별 평가·의견 제외 확인","자료 보관함 지정(새 교과서 선정 시까지), 전시본은 교육과정 만료 시까지 보관","확정 목록을 NEIS 담당에게 전달"],"h":["누리집 게시 협조(필요 시)","서면 보고가 있으면 교육지원청 공문 발송 지원"]},{"id":"s6","no":6,"title":"NEIS 교과용도서 주문","own":"교무·행정","when":"10월 1일 ~ 10월 31일","sub":"확정한 책을 NEIS에 선정·신청·마감·제출합니다. 수량은 재학생·교사 수 기준, 지도서는 최소로","flow":[["교무·행정","교과서/지도서 선정관리","[교과용도서 › 교과용도서 선정관리 › 교과서/지도서 선정관리]. 전년도선정내역복사 뒤 바뀐 과목만 고칩니다. 목록에 없는 책은 상위기관에 등록 요청(인정: 교육청, 국·검정: 교육부)."],["교무·행정","교과서 개별신청(고등학교)","학생별 신청. 필수는 아니지만 교과서대금 개인별 고지서를 뽑으려면 해야 합니다. 일괄복사로 한 번에."],["교무·행정","교과서/지도서 신청관리","‘국/검/인 신청수’ 입력 → 교과서신청수설정 → 대상·재활용·주문부수 확인 후 저장."],["교무·행정","마감관리 → 제출","학년별 저장 확인 → 마감 → 담당자·연락처 → 제출(교육청 전송).","d61"]],"warn":["주문 수량 = 현재 재학생·교사 수. 국정도서 수량은 가격 산정의 기초라, 과다 주문 뒤 반품·폐기는 감사 지적 사항입니다(고등학교는 재고 없이 학생 수대로).","지도서는 교원 1인당이 아니라 교과·학년당 1권 등 최소 수량. 전자저작물은 쓰지 않으면 사지 않습니다.","2022개정 교육과정 중학교 ‘지도서’는 교과용도서가 아니라 NEIS로 주문할 수 없습니다(2026년 중1·2, 2027년 중1~3). 필요하면 학교 자체예산.","특수교육 교과용도서는 1학기에만 주문, 저시력 확대교과서는 학기마다 주문 — 시각장애 학생 누락 주의.","디지털교과서(서책형 선정 출판사 것)는 dtbook.edunet.net으로 제공되어 따로 주문하지 않습니다."],"hand":["NEIS 담당 → 행정: 제출 완료 내역(과목·부수·금액 추정) — 예산·대금 지급 준비"],"docs":["d61"],"g":["선정관리에 확정 도서 입력(전년도 복사 → 변경분 수정)","고등학교: 개별신청(대금 고지서 필요 시)","신청관리: 학년·학과별 부수 입력, 재활용 부수 반영(수정·보완 대조표 확인)","마감 → 담당자·연락처 → 제출, 제출 완료 확인"],"h":["주문 기간(10. 1.~10. 31.) 달력에 표시, 기한 엄수","주문 내역과 예산(교과용도서 지원·무상교육 지원금) 대조","특수·저시력 교과서 신청 누락 확인(특수교육 담당과 협의)","NEIS 주문 불가 도서 자체예산 구입 계획 <code>기안문 6-1</code>"]},{"id":"s7","no":7,"title":"추가 주문·반품","own":"행정","when":"11월 ~ 이듬해 2월(교육청 지정 기간)","sub":"전입·전출, 학급 증감으로 부수가 달라지면 NEIS 추가·반품으로 처리합니다","flow":[["행정","증감 사유 확인·공급인 협의","전입·전출생, 학급 신·증설, 주문 오류. 공급이 늦어지지 않게 바로 공급인과 협의합니다."],["행정","교과서/지도서 추가,반품 관리","‘신규’ 모든 차수가 마감·제출돼 있어야 입력됩니다. 부수설정으로 일괄 입력 가능.","d71"],["행정","마감관리 → 제출","신청구분 ‘추가,반품’으로 조회 → 자료저장여부 확인 → 마감 → 제출."]],"warn":["추가·반품 기간은 교육청마다 달라 공문을 확인합니다.","정산 자료가 저장된 뒤에는 추가·반품을 넣을 수 없습니다. 먼저 정산관리에서 해당 학년 자료를 삭제해야 합니다(정산이 마감·제출됐으면 교육청에 ‘제출 풀어주기’ 요청)."],"hand":["행정 ↔ 공급인: 추가·반품 부수와 일정"],"docs":["d71"],"g":["전입·전출에 따른 과목별 필요 부수 통보(학적 담당 → NEIS 담당)"],"h":["추가·반품 사유와 부수 확정, 공급인 협의","NEIS 추가,반품 관리 입력 → 마감 → 제출 <code>기안문 7-1</code>","반품 도서 상태 확인·반송 증빙 보관"]},{"id":"s8","no":8,"title":"공급·검수·대금 정산","own":"행정","when":"공급 11월~2월 · 정산 2월 말(추가·반품 시 3월 말)","sub":"납품된 책의 종류와 부수를 확인하고, NEIS 정산 뒤 기한 안에 대금을 지급합니다","flow":[["행정","공급 일정 협의·납품 확인","학교별로 공급소(발행사)와 날짜를 정합니다. 대신 확인하는 사람도 종류·부수를 정확히 확인합니다."],["행정","교과서/지도서 정산관리","모든 신규·추가반품 차수가 마감·제출된 뒤 진행. ‘가격결정 완료’여야 하며, 정보가져오기로 학생·학급·교원 수를 반영합니다."],["행정","마감관리(신청구분: 정산) → 제출","정산 마감 버튼은 신청구분을 ‘정산’으로 바꿔 조회해야 보입니다."],["행정","대금 지급","초·중·특수는 교육지원청 또는 학교, 고등학교는 학교가 직접. 납품된 건은 법령상 기한 안에 지급하고, 중간 정산에도 협조합니다.","d81"]],"warn":["가격이 ‘가격결정중’이면 정산할 수 없습니다. 완료로 바뀐 뒤 진행합니다.","교과서 가격이 나중에 바뀌어도 이미 만든 정산에는 자동 반영되지 않습니다. 정산 내역을 삭제하고 다시 만들어 마감·제출합니다.","정산처: 검정도서는 (사)한국교과서협회 또는 발행사, 국정도서는 2025년 12월 이후 발행자 변경 — 공문으로 확인."],"hand":["행정 → 교무: 공급 완료·미납 현황(개학 전 교과서 배부 준비)"],"docs":["d81"],"g":["납품 도서 교실·학년별 배부, 부족분 즉시 행정에 통보"],"h":["납품 확인: 종류·부수 대조, 검수 조서","NEIS 정산관리 입력(가격결정 완료 확인, 정보가져오기) → 정산 마감 → 제출","대금 지급 결의 <code>기안문 8-1</code> — 기한 내 지급, 미지급 민원 방지","정산 기한: 2월 말(추가·반품 시 3월 말)"]}],"DOCS":{"d11":{"s":"s1","lb":"기안문 1-1","role":"gyomu","when":"9월 초 — 교육청 공문 받은 뒤","title":"{{year}}학년도 교과용도서(검·인정도서) 선정 계획 수립","body":"1. 관련: 경상남도교육청 중등교육과 「{{year}}학년도 검정·인정도서 선정 매뉴얼」\n2. {{year}}학년도에 사용할 검·인정 교과용도서를 공정하고 투명하게 선정하기 위하여 붙임과 같이 선정 계획을 수립하고자 합니다.\n  가. 선정 대상: {{year}}학년도 적용 검·인정 신간본 교과용도서 {{nsub}}개 과목({{subjects}})\n  나. 선정 절차: 교과협의회 의견수렴·심사 → 선정심의(안) 학교운영위원회 상정 → 심의 → 학교장 확정 → NEIS 주문\n  다. 전시 기간: {{expo}} (서책 전시본 도서관 비치, 웹전시 www.textbook114.com)\n  라. 교과협의회 추천 의견서 제출 기한: {{due}}\n  마. 학교운영위원회 심의: {{sw}}\n  바. 부조리 예방 대책: 교직원·학교운영위원 연수({{train}}), 출판사 관계자 출입 통제, 전시본 외 자료 무상 수령 금지\n\n붙임  1. {{year}}학년도 검·인정도서 선정 계획 1부.\n      2. 교과용도서 선정기준 평가표(서식 1~3) 1부.\n      3. 교과용도서 선정 관련 부조리 예방 안내문 1부.  끝.","files":["f05","f06","f02"]},"d12":{"s":"s1","lb":"기안문 1-2","role":"gyomu","when":"연수 전 — 계획 결재와 함께 또는 직후","title":"{{year}}학년도 검·인정도서 선정 부조리 예방 교직원 연수 실시","body":"1. 관련: {{school}}-○○○○({{prev}}. ○. ○.) 「{{year}}학년도 교과용도서 선정 계획 수립」\n2. 검·인정도서 선정의 공정성·투명성을 높이기 위하여 다음과 같이 부조리 예방 연수를 실시하고자 합니다.\n  가. 일시: {{train}}\n  나. 대상: 전 교직원 및 학교운영위원(위원은 자료 배부)\n  다. 방법: 업무메신저 자료 배부 및 질의응답\n  라. 내용: 교과용도서 선정 관계자의 범위, 불공정행위 유형(전시본 외 자료·금품·행사비 수수 금지), 신고 요령(교육청·교육지원청 부조리 신고센터, 한국교과서협회 031-8071-7980)\n\n붙임  교과용도서 선정 관련 부조리 예방 안내문 1부.  끝.","files":["f02","f18"]},"d21":{"s":"s2","lb":"기안문 2-1","role":"gyomu","when":"전시 시작 때 — 과목별 협의회에 안내","title":"{{year}}학년도 검·인정도서 선정을 위한 교과협의회 구성 및 평가표 제출 안내","body":"1. 관련: {{school}}-○○○○({{prev}}. ○. ○.) 「{{year}}학년도 교과용도서 선정 계획 수립」\n2. 과목별 교과협의회를 구성하여 아래와 같이 검·인정도서를 심사하고 추천 의견서를 제출하여 주시기 바랍니다.\n  가. 협의회 구성: 과목별 자격 소지 교원 전원(대표 3인 이상 권장, 저자 제외)\n  나. 평가표: 교과용도서 평가기준 항목(참고 1)을 참고하여 과목별로 작성, 가격 항목 포함, 합계 100점\n  다. 제출 서류: 개별 평가표(서식 1), 평가 총괄표(서식 2), 추천 의견서(서식 3), 교과협의록\n  라. 제출 기한: {{due}} — {{dept}}\n  마. 유의: 전시본 외 출판사 자료 수령 금지, 개인별 평가 결과 비공개\n\n붙임  검·인정도서 선정 평가표 및 제출 양식 1부.  끝.","files":["f06"]},"d31":{"s":"s3","lb":"기안문 3-1","role":"gyomu","when":"추천 의견서를 모은 뒤 — 회의 7일 전보다 앞서","title":"{{year}}학년도 교과용도서 선정심의(안) 학교운영위원회 심의 요청(소집 요구)","body":"1. 관련: {{school}}-○○○○({{prev}}. ○. ○.) 「{{year}}학년도 교과용도서 선정 계획 수립」\n2. 과목별 교과협의회 추천 결과를 수합하여 작성한 {{year}}학년도 교과용도서 선정심의(안)을 학교운영위원회에 상정하고자 하오니 회의를 소집하여 주시기 바랍니다.\n  가. 안건: {{year}}학년도 교과용도서(검·인정도서) 선정심의(안)\n  나. 회의 일시(안): {{sw}}\n  다. 심의 내용: 과목별 추천 도서(1~3순위)의 선정 기준·절차의 타당성 및 공정성\n  라. 발행사 운영난 등으로 재주문이 필요할 경우 학교운영위원회를 별도 개최하지 않고 차순위 도서로 자동 확정함\n\n붙임  1. {{year}}학년도 교과용도서 선정심의(안) 1부.\n      2. 과목별 추천 검·인정도서 및 추천 의견서 1부.  끝.","files":["f06"]},"d41":{"s":"s4","lb":"기안문 4-1","role":"haeng","when":"회의 직후 — 간사가 결과를 학교장에게","title":"제○차 학교운영위원회 심의 결과 보고({{year}}학년도 교과용도서 선정심의(안))","body":"1. 관련: {{school}}-○○○○({{prev}}. ○. ○.) 「{{year}}학년도 교과용도서 선정심의(안) 학교운영위원회 심의 요청」\n2. {{sw}} 개최한 제○차 학교운영위원회에서 {{year}}학년도 교과용도서 선정심의(안)을 심의한 결과를 다음과 같이 보고합니다.\n  가. 심의 결과: 원안 가결 (원안과 다른 경우 심의 의견서 첨부)\n  나. 출석: 재적 ○명 중 ○명 출석, 이해관계 위원 없음\n  다. 주요 의견: 평가 기준·절차가 매뉴얼에 부합하고 공정하게 진행되었음\n\n붙임  1. 제○차 학교운영위원회 회의록 1부.\n      2. 추천 검·인정도서 심의 의견서(해당 시) 1부.  끝.","files":["f02"]},"d51":{"s":"s5","lb":"기안문 5-1","role":"gyomu","when":"심의 결과를 받은 뒤 — 주문 전에","title":"{{year}}학년도 교과용도서 선정 결과 확정 및 학교 누리집 공개","body":"1. 관련: 제○차 학교운영위원회 심의 결과({{sw}})\n2. 학교운영위원회 심의 결과를 존중하여 {{year}}학년도 교과용도서를 붙임과 같이 확정하고, 선정 기준표·절차·결과를 학교 누리집에 공개하고자 합니다.\n  가. 확정 도서: 붙임 목록(과목·출판사·저자·정가)\n  나. 공개 항목: 교과용도서 선정 기준표, 선정 절차, 선정 결과 (개인별 평가 결과·의견 제외)\n  다. 보관: 개인별 평가표·총괄표·추천 의견서·회의록은 새 교과용도서 선정 시까지 {{dept}} 보관\n  라. NEIS 주문: {{order}}\n\n붙임  {{year}}학년도 교과용도서 선정 결과(확정) 1부.  끝.","files":[]},"d61":{"s":"s6","lb":"기안문 6-1","role":"haeng","when":"NEIS 제출 완료 뒤 — 자체예산 구입분이 있을 때","title":"{{year}}학년도 1학기 교과용도서 주문 결과 및 자체예산 구입 계획","body":"1. 관련: 경상남도교육청 「{{year}}학년도 1학기 교과용도서 주문 및 정산절차 안내」\n2. {{year}}학년도 1학기 교과용도서를 NEIS를 통해 아래와 같이 주문하였으며, NEIS로 주문할 수 없는 도서는 학교 자체예산으로 구입하고자 합니다.\n  가. 주문 기간: {{order}}\n  나. 주문 기준: 재학생 및 교사 수, 지도서는 교과·학년당 최소 수량\n  다. NEIS 주문 내역: 국정 ○종 ○부, 검정 ○종 ○부, 인정 ○종 ○부 (붙임)\n  라. 자체예산 구입: 2022개정 중학교 지도서 등 ○종 ○부, 예산과목 ○○○\n\n붙임  1. NEIS 교과서/지도서 신청내역 1부.\n      2. 자체예산 구입 도서 목록 1부.  끝.","files":["f04","f09"]},"d71":{"s":"s7","lb":"기안문 7-1","role":"haeng","when":"추가·반품 사유가 생겼을 때","title":"{{year}}학년도 1학기 교과용도서 추가 주문 및 반품","body":"1. 관련: {{school}}-○○○○(○○○○. ○. ○.) 「{{year}}학년도 1학기 교과용도서 주문 결과」\n2. 전입·전출 등 아래 사유로 교과용도서 부수가 변동되어 NEIS 추가·반품을 처리하고자 합니다.\n  가. 사유: 전입생 ○명, 전출생 ○명 / 학급 ○개 증설\n  나. 추가 주문: ○종 ○부 / 반품: ○종 ○부 (붙임)\n  다. 처리: NEIS 교과서/지도서 추가,반품 관리 입력 후 마감·제출, 공급인 협의 완료\n\n붙임  교과용도서 추가·반품 내역 1부.  끝.","files":["f10"]},"d81":{"s":"s8","lb":"기안문 8-1","role":"haeng","when":"납품 확인·NEIS 정산 제출 뒤","title":"{{year}}학년도 1학기 교과용도서 대금 지급","body":"1. 관련: 경상남도교육청 「{{year}}학년도 1학기 교과용도서 주문 및 정산절차 안내」\n2. {{year}}학년도 1학기 교과용도서가 납품되어 검수를 마쳤으므로 NEIS 정산 내역에 따라 대금을 지급하고자 합니다.\n  가. 납품 확인: ○○○○. ○. ○. (종류·부수 이상 없음)\n  나. 정산 금액: 검정도서 ○○○원((사)한국교과서협회), 국정도서 ○○○원(발행자), 인정도서 ○○○원(발행사)\n  다. 지급 기한: 정산 기한(2월 말, 추가·반품 시 3월 말) 내\n\n붙임  1. NEIS 교과서/지도서 정산 내역 1부.\n      2. 검수 조서 및 거래명세서 1부.  끝.","files":["f11","f12"]}},"FILES":[["f05","05. 2025. 검인정교과서 선정계획(예시).hwp","검·인정도서 선정계획(예시)","학교 이름·일정만 고치면 되는 계획서. 부조리 예방 안내문 별첨 포함","1단계"],["f06","06. 2025. 교과서 선정 관련 평가표(예시) 및 제출 양식.hwpx","선정 평가표·총괄표·추천 의견서·교과협의록(서식 1~3)","참고 1 평가기준 항목 예시 포함 — 과목별로 항목을 골라 쓰세요","2단계"],["f02","02. 2026학년도 경상남도교육청 검정·인정도서 선정 매뉴얼.hwp","검정·인정도서 선정 매뉴얼(2025. 9.)","절차 전체, 서식 1~4, 참고 1·2, Q&A — 기준이 되는 문서","전체"],["f04","04. 2026학년도 1학기 교과용도서 주문 및 정산절차 안내.hwp","교과용도서 주문 및 정산절차 안내","주문 기간·기준, 공급·정산, 개별 판매처","6~8단계"],["f01","01. 2026년 교과용도서 업무 추진 계획.pdf","교육청 교과용도서 업무 추진 계획","예산·연간 일정(교육청 기준)","참고"],["f09","09. 2025 나이스업무안내서 교과용도서 1 신청.pdf","NEIS 안내서 ① 신청","선정관리 → 개별신청 → 신청관리 → 마감·제출 화면 순서","6단계"],["f10","10. 2025 나이스업무안내서 교과용도서 2 추가반품.pdf","NEIS 안내서 ② 추가·반품","추가,반품 관리와 마감","7단계"],["f11","11. 2025 나이스업무안내서 교과용도서 3 정산.pdf","NEIS 안내서 ③ 정산","정산관리·가격결정·정보가져오기","8단계"],["f12","12. 2025 나이스업무안내서 교과용도서 4 FAQ.pdf","NEIS 안내서 ④ 자주 묻는 질문","삭제가 안 될 때, 전년도 복사가 안 될 때 등","6~8단계"],["f07","07. 2025. 1학기 시각장애학생·교사용 교과용도서 신청 안내.hwp","시각장애 학생·교사용 교과용도서 신청 안내","점자·확대·음성 교과서 신청 방법","6단계"],["f08","08. 2025. 1학기 시각장애학생·교사용 교과용도서 신청서(서식).xlsx","시각장애 학생·교사용 교과용도서 신청서","신청서 서식(학생용·교사용)","6단계"],["f18","18. 부정청탁 및 금품 등 수수금지에 관한 법률 위반행위 유형 및 처리 절차.pdf","청탁금지법 위반행위 유형 및 처리 절차","교과용도서 관련 금지 행위와 신고 절차(한 장)","1단계"]],"CAL":[["8월","매뉴얼·공문 확인, 선정계획 초안, 협의회 대표 정하기"],["9월","계획 결재, 부조리 예방 연수, 전시 시작(9월 중순~), 협의회 심사"],["10월","추천 의견서 제출 → 학운위 심의 → 확정·공개 → NEIS 주문(10. 1.~10. 31.)"],["11~12월","공급 일정 협의, 전입·전출 추가·반품"],["1~2월","납품 확인·검수, 정산(2월 말), 대금 지급, 국정 정가 안내(2월 초)"],["3월","추가·반품이 있었으면 정산 3월 말까지, 개학 전 배부"]],"FIGS":[["NEIS 주문 기간","10월 1일 ~ 10월 31일","2026학년도용은 2025. 10. 1.(수)~10. 31.(금). 출판사 공급을 위해 기한 엄수",1],["전시 기간","9월 중순 ~ 10월 말","2026학년도용은 2025. 9. 15.~10. 31. 서책은 도서관 비치, 웹전시는 textbook114.com(인증번호 공문)"],["공급 · 정산 기한","공급 ~2월 · 정산 2월 말","추가 주문·반품이 있으면 3월 말. 납품된 건은 기한 내 대금 지급",1],["교과협의회 인원","3인 이상 권장","10학급 미만은 2인 이상. 전 교원 참여 원칙, 저자 제외. 자격 교원 부족 시 같은 교과군·인근 학교 교원 포함"],["학운위 소집 통지","회의 7일 전","일시·장소·안건을 위원에게 알리고 누리집 공개. 긴급한 사유는 예외"],["평가표","7개 영역 · 합계 100점","교육과정·학습내용 선정·학습내용 조직·교수학습 활동·학습 평가·표현표기·재정(가격). 학교가 항목을 조합",0],["자료 보관","새 교과용도서 선정 시까지","개인별 평가표·총괄표·추천 의견서·회의록. 서책 전시본은 교육과정 만료 시까지",1],["누리집 공개 항목","기준표 · 절차 · 결과","개인별 평가 결과·의견은 공개 금지. 결과는 학운위 심의 대상 도서에 한함",1],["주문 수량 기준","현재 재학생 · 교사 수","지도서는 교과·학년당 1권 등 최소 수량, 전자저작물은 쓰지 않으면 미구매. 고등학교는 재고 없이 학생 수대로",1],["중학교 지도서","2022개정부터 NEIS 주문 불가","교과용도서에서 제외 — 2026년 중1·2, 2027년 중1~3. 필요하면 학교 자체예산"],["특수 · 저시력 교과서","특수는 1학기만 · 저시력은 학기별","저시력 확대교과서: 초등 전체, 중학교 국어·역사·도덕, 고등학교 공통국어·국어·한국사. 인정도서는 저시력 없음",1],["디지털교과서","따로 주문하지 않음","선정한 서책형 출판사의 디지털교과서가 dtbook.edunet.net으로 제공(AI 디지털교과서와 다름)"],["교과서민원바로처리센터","1566-8572","www.textbook114.com — 웹전시, 수정·보완 대조표(재활용 판단)"],["한국교과서협회","신고 031-8071-7980 · 구입 031-956-8581~4","www.ktbook.com — 부조리 신고, 검·인정도서 일괄 구입(개별 판매)"],["나이스 문의","help.neis.go.kr","나이스광장에 질의 등록. 조회조건에 신청학년도가 없으면 교육청 담당 장학사에게 요청"],["받으면 안 되는 것","전시본 외 전부","참고서·자습서·지도자료·기념품(보조배터리·USB 등)·발전기금·상품권·행사비. 금액 무관. 발생 시 소속기관장에게 서면 신고",1]]};
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
