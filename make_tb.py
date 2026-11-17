# native/tb.js = parts/tb_ui.js + parts/tb_src.json(원래 길잡이의 단계·기안문·붙임 목록)
import json, pathlib
H=pathlib.Path(__file__).resolve().parent
src=json.loads((H/"parts/tb_src.json").read_text(encoding="utf-8"))
ui=(H/"parts/tb_ui.js").read_text(encoding="utf-8")
out=ui.replace("/*__SRC__*/null", json.dumps(src,ensure_ascii=False,separators=(",",":")),1)
assert out!=ui
(H/"native/tb.js").write_text(out,encoding="utf-8"); print("native/tb.js",len(out))
