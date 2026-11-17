#!/usr/bin/env python3
"""경남 학교행정 도구 모음(tools.html) 빌드.

입력
  - 업무체크리스트 index.html  : 겉모습(CSS)·업무 목록·연간 업무달력을 그대로 가져온다
  - tools_meta.json            : 도구별 설명·근거·경남 확인 필요 항목
  - src/<id>.html              : 길잡이에서 꺼낸 도구 원본(계산 코드는 손대지 않음)
출력
  - <repo>/tools.html, <repo>/tools/<id>.html

사용: python3 -I build_tools.py <업무체크리스트 index.html> <repo 폴더>
"""
import json, os, re, shutil, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
ck_html, repo = sys.argv[1], sys.argv[2]
s = open(ck_html, encoding="utf-8").read()
meta = json.load(open(os.path.join(HERE, "tools_meta.json"), encoding="utf-8"))

styles = re.findall(r"<style([^>]*)>(.*?)</style>", s, re.S)
# 0 = 본 스타일, 1 = 분야 색(ckcg cN), 5·6 = 대화상자. 8번은 엑셀 내보내기 문자열 안의 것이라 뺀다
css = "\n".join(styles[i][1] for i in (0, 1, 5, 6))
CKD = json.loads(re.search(r'<script id="CKD" type="application/json">(.*?)</script>', s, re.S).group(1))
app = re.search(r'<script>\s*\(function\(\)\{ "use strict"; var V=JSON\.parse.*?</script>', s, re.S)
groups = re.search(r"var CKGROUPS=(\[.*?\]\]\]);", s).group(1)
CKGROUPS = json.loads(groups)

lists = {l["id"]: l for l in CKD["checklist"]["lists"]}
tools = meta["tools"]
ids = [t["id"] for t in tools]

# 체크리스트 단계 중 이 도구를 가리키는 것(step.go = 도구 id) — 합칠 때도 같은 열쇠를 쓴다
uses = {k: [] for k in ids}
for l in CKD["checklist"]["lists"]:
    for i, st in enumerate(l.get("steps", [])):
        g = st.get("go")
        g = {"flow": "ct", "bb": "hb"}.get(g, g)   # 합친 도구의 옛 열쇠
        if g in uses:
            uses[g].append([l["id"], i])

out_tools = []
for t in tools:
    ck = []
    for cid in t["ck"]:
        l = lists.get(cid)
        if not l:
            print("경고: 체크리스트에 없는 업무", cid, file=sys.stderr); continue
        ck.append({"id": cid, "t": l["title"], "c": l.get("cat", "")})
    st = []
    for cid, i in uses[t["id"]]:
        l = lists[cid]
        st.append({"id": cid, "t": l["title"], "c": l.get("cat", ""), "i": i, "n": l["steps"][i]["n"]})
    t2 = dict(t); t2["ck"] = ck; t2["steps"] = st
    out_tools.append(t2)

# 연간 업무달력에서 도구와 이어진 업무의 일정만 가져온다
# 도구마다 대표 업무(meta cal)의 일정 전부 + 그 도구를 가리키는 단계(step.go)의 일정
def tools_for(cid, i):
    r = [t["id"] for t in tools if cid in t.get("cal", [])]
    r += [k for k, v in uses.items() if [cid, i] in v and k not in r]
    return r
cal = []
for x in CKD["checklist"]["cal"]:
    ckx = x.get("ck")
    if not ckx:
        continue
    tl = tools_for(ckx[0], ckx[1] if len(ckx) > 1 else None)
    if not tl:
        continue
    step = ""
    l = lists.get(ckx[0])
    if l and len(ckx) > 1 and ckx[1] is not None and ckx[1] < len(l.get("steps", [])):
        step = l["steps"][ckx[1]]["n"]
    cal.append({"m": x["m"], "d": x.get("d"), "dl": x.get("dl", ""), "t": x["t"], "w": x.get("w", ""),
                "cat": x.get("cat", ""), "ck": ckx[0], "st": step, "tools": tl, "src": x.get("src", "")})
# 교감업무 달력의 호봉재획정(체크리스트 업무와 이어지지 않은 일정)
for x in CKD["checklist"]["cal"]:
    if "호봉재획정" in x.get("t", "") and not x.get("ck"):
        cal.append({"m": x["m"], "d": x.get("d"), "dl": x.get("dl", ""), "t": x["t"], "w": x.get("w", ""),
                    "cat": "인사", "ck": "", "st": "", "tools": ["hb"], "src": x.get("src", "")})

TKD = {"updated": meta["updated"], "groups": CKGROUPS, "tools": out_tools, "cal": cal}
tkd = json.dumps(TKD, ensure_ascii=False).replace("</", "<\\/")

tpl = open(os.path.join(HERE, "tools_template.html"), encoding="utf-8").read()
# 다시 만든 도구: native/<id>.js (+ 자료 <id>_data.json → window.TK_<ID>_DATA)
native = ""
for k in ids:
    js = os.path.join(HERE, "native", k + ".js")
    if not os.path.exists(js):
        continue
    dj = os.path.join(HERE, k + "_data.json")
    if os.path.exists(dj):
        native += "<script>window.TK_%s_DATA=%s;</script>\n" % (k.upper(), open(dj, encoding="utf-8").read().replace("</", "<\\/"))
    native += "<script>\n" + open(js, encoding="utf-8").read() + "\n</script>\n"
page = tpl.replace("/*__CKCSS__*/", css).replace("__TKD__", tkd).replace("__NATIVE__", native)
open(os.path.join(repo, "tools.html"), "w", encoding="utf-8").write(page)

os.makedirs(os.path.join(repo, "tools"), exist_ok=True)
for k in ids:
    if os.path.exists(os.path.join(HERE, "src", k + ".html")):   # pub(공립 본예산)처럼 원본 없이 새로 만든 도구는 건너뜀
        shutil.copyfile(os.path.join(HERE, "src", k + ".html"), os.path.join(repo, "tools", k + ".html"))
# 도구별 붙임 서식·자료(누리집에서 내려받기): gbfiles → tools/gb, tbfiles → tools/tb …
for k in ids:
    src = os.path.join(HERE, k + "files")
    if not os.path.isdir(src):
        continue
    dst = os.path.join(repo, "tools", k)
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)
print("tools.html", len(page), "bytes ·", len(out_tools), "도구 ·", len(cal), "일정 ·",
      {k: len(v) for k, v in uses.items() if v})
