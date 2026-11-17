#!/usr/bin/env python3
"""학운위 문서(hk) 도구 조립.
원본 길잡이 도구(src/hk.html)에서 '문서 엔진'(상태·문서 11종 정의·미리보기·한글(hwpx) 저장·한글 안건 읽기)만
꺼내고, 화면은 parts/hk_ui.js(새로 만든 회의 장부)로 바꿔 native/hk.js 를 만든다.
사용: python3 -I make_hk.py
"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(HERE, "src", "hk.html"), encoding="utf-8").read()
main = [x for x in re.findall(r"<script[^>]*>(.*?)</script>", s, re.S) if "const APP_NAME" in x][0]
e = main[main.index("const APP_NAME"):main.index("function go(")]

def rep(a, b, count=1):
    global e
    assert a in e, a[:60]
    e = e.replace(a, b, count)

# 화면 쪽과 닿는 곳만 바꾼다(문서 내용·한글 저장 규칙은 그대로)
e = re.sub(r"let toastT; function toast\(m,ms=2400\)\{.*?\n", "function toast(m){ if(HK.toast) HK.toast(String(m)); }\n", e, count=1)
e = re.sub(r"function popup\(title,bodyHtml,btns\)\{.*?\n", "function popup(title,bodyHtml){ if(HK.toast) HK.toast(title+' — '+String(bodyHtml).replace(/<br>/g,' / ').replace(/<[^>]+>/g,'')); }\n", e, count=1)
e = re.sub(r"function confirmPop\(title,bodyHtml,okText,fn\)\{.*?\n", lambda _m: "function confirmPop(title,bodyHtml,okText,fn){ if(confirm(String(bodyHtml).replace(/<br>/g,' ').replace(/<[^>]+>/g,''))) fn&&fn(); }\n", e, count=1)
e = re.sub(r"function download\(blob,name\)\{.*?\n", "function download(blob,name){ return HK.save(blob,name); }\n", e, count=1)
rep("function persist(){", "function _persist0(){")
rep("function restore(){", "function _restore0(){")
rep("const persistLater=debounce(persist,300);", "const persistLater=debounce(()=>HK.persist&&HK.persist(),300);")
rep("tx.objectStore(ATT_OS).put(data,STORE_KEY)", "tx.objectStore(ATT_OS).put(data,HK.attKey||STORE_KEY)")
rep(".objectStore(ATT_OS).get(STORE_KEY)", ".objectStore(ATT_OS).get(HK.attKey||STORE_KEY)")
rep("S.attach=L; _attSig=_sig(L); renderAgendas(); renderAttach(); refresh();\n    const st=+String(curStep).slice(1); if(st>=4&&st<=6&&curDoc[curStep]) renderPreview(st,curDoc[curStep],true); })",
    "S.attach=L; _attSig=_sig(L); if(HK.onAttach) HK.onAttach(); })")
rep("const root=$('#printRoot'); root.innerHTML=docsHTML(ids);", "const root=HK.printRoot(); root.innerHTML=docsHTML(ids);")
rep("const done=()=>{ setTimeout(()=>{ root.innerHTML=''; },500);", "const done=()=>{ setTimeout(()=>{ root.innerHTML=''; document.body.classList.remove('hk-printing'); },500);")
rep("setTimeout(()=>window.print(),60);", "document.body.classList.add('hk-printing'); setTimeout(()=>window.print(),60);")
# '예시' 안내 문구 속 다른 지역 전화번호 예시를 경남으로
e = e.replace("041-111-1111", "055-000-0000")

ui = open(os.path.join(HERE, "parts", "hk_ui.js"), encoding="utf-8").read()
head = ui[:ui.index("/*__ENGINE__*/")]
tail = ui[ui.index("/*__ENGINE__*/") + len("/*__ENGINE__*/"):]
out = head + "\n/* ===== 문서 엔진(원본 학운위 문서 도구에서 가져옴) ===== */\n" + e + "\n/* 다른 도구(수의·입찰 따라가기 공고문 등)가 같이 쓰는 한글 만들기 */\nwindow.TKHX={build:buildHwpx};\n/* ===== 엔진 끝 ===== */\n" + tail
open(os.path.join(HERE, "native", "hk.js"), "w", encoding="utf-8").write(out)
print("native/hk.js", len(out))
