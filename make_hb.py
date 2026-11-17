#!/usr/bin/env python3
"""호봉(hb) 도구 조립 — 호봉책정 + 호봉정정 급여정산을 하나로.
원본 길잡이 도구에서 계산 엔진만 꺼낸다(화면은 parts/hb_ui.js로 새로 만듦).
 - src/hb.html : HOBONG(초임호봉)·READER(서류 읽기)·RATETABLE(환산율표) — 화면 코드 앞에서 자름
 - src/bb.html : ENGINE(나이스 급여 파일·월별 정산) + 봉급표 2010~2026
각 엔진은 따로 함수 범위에 넣어 이름이 섞이지 않게 한다. 엔진 글자는 고치지 않는다(원본 그대로).
사용: python3 -I make_hb.py
"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
def scripts(name):
    s = open(os.path.join(HERE, "src", name), encoding="utf-8").read()
    return re.findall(r"<script[^>]*>(.*?)</script>", s, re.S)

h = [x for x in scripts("hb.html") if "const HOBONG" in x][0]
i = h.index("function _0x4634(){")
j = h.find("(()=>{", i)          # 원본 화면 코드 시작
assert j > 0 and h[j-1] == "("
h_engine = h[:j-1]
b = scripts("bb.html")
b_engine = [x for x in b if "loadPay" in x and "ENGINE" in x and "ENGINE.loadPay(" not in x[:40]][0]
b_pay = [x for x in b if x.lstrip().startswith("ENGINE.loadPay(")][0]
for part in (h_engine, b_engine, b_pay):
    assert "</script" not in part
ui = open(os.path.join(HERE, "parts", "hb_ui.js"), encoding="utf-8").read()
out = ("/* 호봉 계산 엔진(원본 호봉책정 도구) */\n(function(){\n" + h_engine +
       "\n;window.TKHB_H={HOBONG:HOBONG,READER:READER,RATETABLE:RATETABLE};})();\n"
       "/* 급여 정산 엔진·봉급표(원본 호봉정정 급여정산 도구) */\n(function(){\n" + b_engine + "\n" + b_pay +
       "\n;window.TKHB_E=ENGINE;})();\n" + ui)
open(os.path.join(HERE, "native", "hb.js"), "w", encoding="utf-8").write(out)
print("native/hb.js", len(out))
