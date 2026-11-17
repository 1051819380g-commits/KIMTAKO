# native/sg.js = 원래 '송금내역서 생성기'(src/sg.html)의 읽기·계산·엑셀 엔진(화면 앞까지 그대로) + parts/sg_ui.js(새 화면)
import re, pathlib
H=pathlib.Path(__file__).resolve().parent
s=(H/"src/sg.html").read_text(encoding="utf-8")
js=max(re.findall(r"<script>(.*?)</script>",s,re.S),key=len)
eng=js[:js.index("/* ───────── 화면 ───────── */")]
ui=(H/"parts/sg_ui.js").read_text(encoding="utf-8")
out=ui.replace("/*__ENGINE__*/",eng,1); assert out!=ui
(H/"native/sg.js").write_text(out,encoding="utf-8"); print("native/sg.js",len(out))
