# gn_tools — 경남 학교행정 도구 원본

업무체크리스트(KIMTAKO) 시험판 `test.html`의 '도구 모음' 9개 도구를 만드는 원본과 빌드 스크립트예요.
이 브랜치(`gn-tools-src`)는 GitHub Pages에 올라가지 않아요. 빌드 결과물만 `main`에 둬요.

## 고치는 순서

1. 작업 전에 늘 최신본을 받아요: `git fetch origin && git checkout gn-tools-src && git pull`
   (`main`도 최신으로: `git -C <KIMTAKO> pull origin main`)
2. 원본을 고쳐요(아래 '파일' 표).
3. 생성 스크립트가 있는 도구는 그 스크립트를 돌려 `native/<id>.js`를 다시 만들어요.
4. 빌드: `python3 -I build_ck_tools.py <KIMTAKO 저장소 폴더>`
5. `main`에 바뀐 `tools/app.js`, `test.html`을 올리고, 이 브랜치에도 원본 변경을 바로 올려요.

`main`의 `tools/app.js`와 `test.html`의 도구 블록(`/*CKTOOL*/`, `<!--CKTOOLS-->`)은 빌드 결과물이에요. 직접 고치지 마세요.
`index.html`(공개판)은 빌드가 건드리지 않아요. 공개판 반영은 따로 해요.

## 빌드가 하는 일

`build_ck_tools.py <repo>`
- `build_tools.py`를 먼저 돌려 도구 메타(TKD)를 만들고, `gbfiles/`·`tbfiles/`·`prifiles/`를 `<repo>/tools/gb|tb|pri/`로 복사해요(내려받기 서식).
- `native/*.js`(+ `ct_data.json`)를 묶어 `<repo>/tools/app.js`를 만들어요.
- `<repo>/test.html`의 `/*CKTOOL*/` 코드와 `<!--CKTOOLS-->` 카드·`TKMETA`를 바꿔 넣어요.
- `build_tools.py`가 만든 중간 파일 `<repo>/tools.html`은 도구 메타(TKD)만 읽고 지워요. 예전 도구 주소(tools.html)는 2026-11-17에 내렸어요.

**빌드가 보존하는 것(test.html):**
- 다른 세션이 넣은 'AI 품의'(`TKMETA`의 `pumui` 항목, `window.TKNATIVE.pumui`, `window.ckLlmImg`)
  - `TKMETA`에서 `tools_meta.json`에 없는 id는 앞자리에 그대로 남겨요.
  - `/*CKTOOL*/` 바로 뒤, `/* 도구(본예산…` 앞에 끼운 코드는 그대로 남겨요.
- 기안문 모음 빈칸 표시(`ckBlTools` 등), 사용법·튜토리얼의 도구 모음 안내, 업데이트 내역, 튜토리얼 단추 처리
  - 이것들은 빌드가 바꾸는 블록 밖에 있어요.

## 파일

| 파일 | 하는 일 | 고치는 방법 |
|---|---|---|
| `tools_meta.json` | 도구 이름·분야·설명·근거·확인할 점, 사용법 창 내용(`how` 쓰는 순서, `tips` 알아 둘 점) | 직접 |
| `tools_template.html` | 도구 꾸밈 CSS(`.tk*`) | 직접 |
| `native/ct.js` | 수의·입찰 따라가기 | 직접 |
| `ct_data.json` | 수의계약 서식(빌드가 `TK_CT_DATA`로 넣음) | 직접 |
| `native/bc.js` | 예산 변경 | 직접 |
| `native/gb.js` | 교복 구매 | 직접 |
| `native/hb.js` | 호봉 획정·정산 | `parts/hb_ui.js` 고친 뒤 `python3 make_hb.py` (엔진: `src/hb.html`, `src/bb.html`) |
| `native/hk.js` | 학운위 문서 | `parts/hk_ui.js` 고친 뒤 `python3 make_hk.py` (엔진: `src/hk.html`) |
| `native/pri.js` | 본예산 편성 | `parts/pri_ui.js` 고친 뒤 `python3 make_pri.py` (자료: `src/pri.html`, 붙임은 `prifiles/`로 풀림) |
| `native/sg.js` | 송금내역서 생성기 | `make_sg.py`의 `JSFIX`·`BODYFIX`에 고칠 곳 추가 후 `python3 make_sg.py` (원본: `src/sg.html`) |
| `native/tb.js` | 교과서 선정 | `parts/tb_ui.js`, `parts/tb_src.json` 고친 뒤 `python3 make_tb.py` |
| `make_sg_native.py`, `parts/sg_ui.js` | 쓰지 않는 예전 송금내역서 화면 | — |
| `gbfiles/`, `tbfiles/`, `prifiles/` | 내려받기 서식·자료 | 그대로 복사됨 |
| `reports/` | 검토·수정 기록 | — |

## 공공데이터포털 키

`native/ct.js`에는 키 자리(`__DATA_GO_KR_KEY__`)만 있어요. 빌드할 때 `gn_tools/.datakey` 파일(이 브랜치에 올리지 않음, `.gitignore`)이나 환경변수 `GN_DATA_KEY`에서 넣어요.
없으면 키 없이 만들어지고, 쓰는 사람이 화면에서 키를 넣어 써요.
※ 브라우저에서 바로 부르는 키라서 빌드된 `main`의 `tools/app.js`에는 들어가요.

## 올리지 않은 원본(빌드에 안 씀)

모두 KIMTAKO `main`의 커밋 기록에 이미 있어요. 필요하면 `git show <커밋>:<경로>`로 꺼내요.

| 파일 | 내용 | 출처 |
|---|---|---|
| `src/gb.html` (13 MB) | 교복 학교주관구매 길잡이(옛 도구 페이지) | 커밋 `4fd84c8`의 `tools/gb.html` |
| `src/gb.html.bak-2025` | 위 파일의 이전 판 | 커밋 `ff274d2`의 `tools/gb.html` |
| `src/tb.html` (3 MB) | 교과용도서 선정 길잡이 | 커밋 `ff274d2`의 `tools/tb.html` |
| `src/ct.html` | 수의계약 서류 | 커밋 `ff274d2`의 `tools/ct.html` |
| `src/flow.html` | 학교 계약업무 흐름도 | 커밋 `ff274d2`의 `tools/flow.html` |
| `미리보기_*.png` | 작업 중 화면 캡처 | 없음(필요 없음) |

옛 도구 페이지는 맥 '길잡이 공개판' 세션이 만들어 2026-11-16 KIMTAKO에 올린 것이에요. 교복 서식(`gbfiles/gn/`, 00~13번)은 경남 교복 학교주관구매 업무 예시 서식이에요.

## 점검 (2026-11-17)

- 개인정보: 전화번호는 `055-000-0000` 같은 예시와 한국교과서협회 대표번호뿐, 이메일·계좌·주민등록번호 없음.
- 비밀 값: 공공데이터포털 키는 위처럼 뺐어요. Claude/Anthropic 키 없음.
- `gbfiles/`·`tbfiles/`·`prifiles/`는 `main`의 `tools/gb|tb|pri/`와 같은 파일이에요(이미 공개).
