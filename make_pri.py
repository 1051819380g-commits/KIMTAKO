# native/pri.js = 원래 '본예산 길라잡이'(src/pri.html)의 사립 단계 자료 + 예산요구안 엑셀 엔진(그대로) + parts/pri_ui.js(새 화면)
# 붙임 hwpx(base64)는 prifiles/로 풀어 tools/pri/에서 내려받게 한다.
import json, re, base64, subprocess, pathlib
H=pathlib.Path(__file__).resolve().parent
s=(H/"src/pri.html").read_text(encoding="utf-8")
js=re.findall(r"<script[^>]*>(.*?)</script>",s,re.S)[0]
def cut(a,b): i=js.index(a); j=js.index(b,i); return js[i:j]
# 단계 자료(VERS.pri·SCHROWS.pri·SCHED.pri·FILES)를 node로 평가
data=cut("var FILES = {","/* ---------- 값 채우기")
sch=cut("var SCHROWS = {","function jget(")
node="var r=(function(){"+data+sch+";return {FILES:FILES,VERS:VERS,SCHED:SCHED,SCHROWS:SCHROWS};})();process.stdout.write(JSON.stringify(r));"
d=json.loads(subprocess.run(["node"],input=node,capture_output=True,text=True,check=True).stdout)
out=H/"prifiles"; out.mkdir(exist_ok=True)
files={}
for k in ("priLetter","pri1","pri35"):
    url,name,title=d["FILES"][k]
    (out/(k+".hwpx")).write_bytes(base64.b64decode(url.split(",",1)[1])); files[k]=[name,title]
SRC={v:{"steps":d["VERS"][v]["steps"],"sched":d["SCHED"][v],"rows":d["SCHROWS"][v],"files":files if v=="pri" else {}} for v in ("pri","pub")}   # 공립 붙임 서식(files/pub-*.hwpx)은 원본에 없어 붙이지 않음
eng=cut("var REQ_HEAD = [","function makeForm(")+cut("function groupBy(","function sgn(")+cut("function exportReq(","document.addEventListener(\"change\"")
eng=cut("var XLSX_URL","// 지금 화면")+eng
eng=re.sub(r"function saveBuf\(buf, name\)\{.*?\n\}\n","function saveBuf(buf, name){ U().saveFile(new Blob([buf],{type:\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\"}),name); }\n",eng,flags=re.S)
assert "U().saveFile" in eng
ui=(H/"parts/pri_ui.js").read_text(encoding="utf-8")
res=ui.replace("/*__SRC__*/null",json.dumps(SRC,ensure_ascii=False,separators=(",",":")),1).replace("/*__ENGINE__*/",eng,1)
assert "/*__" not in res.split("*/",1)[1] or True
(H/"native/pri.js").write_text(res,encoding="utf-8"); print("native/pri.js",len(res),"files",list(files))
