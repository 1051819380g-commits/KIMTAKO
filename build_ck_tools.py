# 도구를 업무체크리스트 시험판(test.html)으로 옮긴다 (2026-11-17 Junho: "도구모음 사이트는 이제 필요없고, 도구만 체크리스트로 이식").
#   python3 -I build_ck_tools.py <repo>
# 1) build_tools.py로 도구 자료(tools/<id>/ 붙임 파일)와 TKD(도구 메타 + 체크리스트 연결)를 만든다
# 2) 도구 스크립트 전부 + 도구 꾸밈(.tk*)을 tools/app.js 한 파일로 묶는다(시험판은 도구를 처음 열 때만 불러온다)
# 3) test.html: 오른쪽 여백 '도구 모음' 카드(가로로 긴 작은 카드) + 체크리스트 안 화면(mode "tool")을 넣는다
# 4) build_tools.py가 만든 중간 파일 tools.html(TKD만 읽음)과 옛 원본 사본 tools/<id>.html은 지운다 — 예전 도구 주소는 내림
import hashlib, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
repo = sys.argv[1]
subprocess.run([sys.executable, "-I", os.path.join(HERE, "build_tools.py"), os.path.join(repo, "index.html"), repo], check=True)
th = open(os.path.join(repo, "tools.html"), encoding="utf-8").read()
TKD = json.loads(re.search(r'<script type="application/json" id="TKD">(.*?)</script>', th, re.S).group(1).replace("<\\/", "</"))
meta = json.load(open(os.path.join(HERE, "tools_meta.json"), encoding="utf-8"))
ids = [t["id"] for t in meta["tools"]]

# ---- 2) tools/app.js ----
tpl = open(os.path.join(HERE, "tools_template.html"), encoding="utf-8").read()
tkcss = re.search(r"<style>\s*/\* ---- 도구 모음만의 꾸밈\(\.tk\*\) ---- \*/(.*?)</style>", tpl, re.S).group(1)
parts = ['/* 경남 학교행정 도구(업무체크리스트 안에서 씀) — gn_tools/build_ck_tools.py가 만든 파일 */',
         '(function(){ if(document.getElementById("tk-css")) return; var s=document.createElement("style"); s.id="tk-css"; s.textContent=%s; document.head.appendChild(s); })();' % json.dumps(tkcss, ensure_ascii=False)]
for k in ids:
    dj = os.path.join(HERE, k + "_data.json")
    if os.path.exists(dj):
        parts.append("window.TK_%s_DATA=%s;" % (k.upper(), open(dj, encoding="utf-8").read()))
    _js = open(os.path.join(HERE, "native", k + ".js"), encoding="utf-8").read()
    # 공공데이터포털 키는 저장소에 두지 않는다: gn_tools/.datakey(또는 환경변수 GN_DATA_KEY)에서 넣음. 없으면 화면에서 키를 넣어 씀
    if "__DATA_GO_KR_KEY__" in _js:
        _kf = os.path.join(HERE, ".datakey")
        _key = os.environ.get("GN_DATA_KEY") or (open(_kf, encoding="utf-8").read().strip() if os.path.exists(_kf) else "")
        if _key:
            _js = _js.replace("__DATA_GO_KR_KEY__", _key)
        else:
            print("알림: .datakey가 없어 공공데이터포털 키 없이 만듦")
    parts.append(_js)
parts.append("window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.__ok=1;")
app = "\n".join(parts)
os.makedirs(os.path.join(repo, "tools"), exist_ok=True)
open(os.path.join(repo, "tools", "app.js"), "w", encoding="utf-8").write(app)
ver = hashlib.sha1(app.encode("utf-8")).hexdigest()[:10]

# ---- 4) 중간 파일 tools.html과 옛 사본 tools/<id>.html은 지운다(예전 도구 주소는 2026-11-17 내림) ----
if os.path.exists(os.path.join(repo, "tools.html")):
    os.remove(os.path.join(repo, "tools.html"))
for k in os.listdir(os.path.join(repo, "tools")):
    if k.endswith(".html"):
        os.remove(os.path.join(repo, "tools", k))

# ---- 3) test.html ----
M = {"src": "tools/app.js?v=" + ver, "tools": [{k: t[k] for k in ("id", "name", "cat", "who", "in", "out", "basis", "check", "ck", "steps")} for t in TKD["tools"]]}
mjson = json.dumps(M, ensure_ascii=False).replace("</", "<\\/")
path = os.path.join(repo, "test.html")
s = open(path, encoding="utf-8").read()
# 다른 세션이 시험판에 직접 넣은 도구(예: AI 품의 pumui)는 지우지 않는다:
#  - TKMETA에서 tools_meta.json에 없는 id는 앞자리 그대로 유지
#  - /*CKTOOL*/ 블록에서 이 스크립트 코드(/* 도구(본예산… 로 시작) 앞에 끼운 코드는 유지
_ours = {t["id"] for t in M["tools"]}
_om = re.search(r'<script type="application/json" id="TKMETA">(.*?)</script>', s, re.S)
if _om:
    try:
        _old = json.loads(_om.group(1).replace("<\\/", "</"))
        _keep = [t for t in _old.get("tools", []) if t.get("id") not in _ours]
        if _keep:
            M["tools"] = _keep + M["tools"]
            mjson = json.dumps(M, ensure_ascii=False).replace("</", "<\\/")
            print("TKMETA 유지:", [t["id"] for t in _keep])
    except Exception as e:
        raise SystemExit("TKMETA 읽기 실패: %s" % e)
_EXTRA = ""
_ob = re.search(r"/\*CKTOOL\*/\n(.*?)/\* 도구\(본예산", s, re.S)
if _ob and _ob.group(1).strip():
    _EXTRA = _ob.group(1)
    print("CKTOOL 앞 코드 유지:", len(_EXTRA), "자")

CODE = r'''/*CKTOOL*/
/* 도구(본예산·예산 변경·수의·입찰 따라가기 …)를 체크리스트 화면 안에서 연다: CK.mode "tool", CK.tool=<id>. 도구 스크립트는 처음 열 때 tools/app.js에서 불러온다 */
var TKM=null, TKLOAD=null, TKALIAS={bb:"hb",flow:"ct",pub:"pri"};
function tkMeta(){ if(TKM) return TKM; var n=document.getElementById("TKMETA"), m={tools:[]}; try{ if(n) m=JSON.parse(n.textContent); }catch(e){} m.by={}; m.tools.forEach(function(t){ m.by[t.id]=t; }); if(n) TKM=m; return m; }   /* TKMETA는 body 끝에 있어 처음 그릴 때는 아직 없을 수 있다 */
function tkLoad(){ if(window.TKNATIVE&&window.TKNATIVE.__ok) return Promise.resolve(); if(TKLOAD) return TKLOAD;
  TKLOAD=new Promise(function(res,rej){ var s=document.createElement("script"); s.src=tkMeta().src; s.onload=function(){ res(); }; s.onerror=function(){ TKLOAD=null; s.remove(); rej(new Error("도구를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.")); }; document.head.appendChild(s); });
  return TKLOAD; }
function ckTool(){ var M=tkMeta(), k=TKALIAS[CK.tool]||CK.tool, t=M.by[k], d=$("#ckdetail"); d.textContent=""; d.appendChild(el("div","ckcap"));
  if(!t){ CK.mode="cal"; ckCal(); return; }
  var bar=el("div","tkbar"); bar.appendChild(el("h2",null,t.name)); bar.appendChild(el("span","ckcg c"+CKCATS.indexOf(t.cat),t.cat)); d.appendChild(bar);
  var info=el("details","tkinfo"), sm=el("summary"); sm.appendChild(el("b","tksl","기준·근거")); info.appendChild(sm);
  var bd=el("div","bd"); info.appendChild(bd);
  function col(h){ var c=el("div"); c.appendChild(el("h5",null,h)); bd.appendChild(c); return c; }
  function li(ul,x,href){ var l=el("li"); if(href){ var a=el("a",null,x); a.href=href; a.target="_blank"; a.rel="noopener"; l.appendChild(a); } else l.textContent=x; ul.appendChild(l); }
  var c1=col("쓰는 법"), dl=el("dl"); [["누가",t.who],["넣을 것",t.in],["나오는 것",t.out]].forEach(function(p){ dl.appendChild(el("dt",null,p[0])); dl.appendChild(el("dd",null,p[1])); }); c1.appendChild(dl);
  var u2=el("ul"); t.basis.forEach(function(b){ li(u2,b[0],b[1]); }); col("근거 자료").appendChild(u2);
  if(t.check.length){ var u3=el("ul"); t.check.forEach(function(x){ li(u3,x); }); col("알아 둘 점").appendChild(u3); }
  var c4=col("이 도구를 쓰는 업무"), w4=el("div","tkpills"); c4.appendChild(w4);
  t.ck.forEach(function(c){ if(!CKBY[c.id]) return; var b=el("button","pill",c.t); b.type="button"; b.onclick=function(){ CK.mode="flow"; CK.cur=""; CK.pv=c.id; ckSave(); ckRender(); window.scrollTo(0,0); }; w4.appendChild(b); });
  d.appendChild(info);
  var mount=el("div","tknative"); d.appendChild(mount); mount.appendChild(el("p","note","도구를 불러오는 중이에요…"));
  tkLoad().then(function(){ if(CK.mode!=="tool"||(TKALIAS[CK.tool]||CK.tool)!==k) return; mount.textContent="";
      try{ window.TKNATIVE[k](mount); }catch(e){ mount.appendChild(el("p","tkmsg on bad","도구를 그리지 못했어요: "+e.message)); } },
    function(e){ mount.textContent=""; mount.appendChild(el("p","tkmsg on bad",e.message)); });
}
function ckToolMark(){ var cur=CK.mode==="tool"?(TKALIAS[CK.tool]||CK.tool):"", ct=CK.mode==="flow"?((ckCase(CK.cur)||{}).t||CK.pv||""):"", by=tkMeta().by;
  document.querySelectorAll("#cktl .cktc").forEach(function(a){ var k=a.dataset.k, t=by[k]; a.classList.toggle("on",k===cur); a.classList.toggle("rel",!!ct&&!!t&&t.ck.some(function(x){ return x.id===ct; })); if(k===cur) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); }); }
window.ckOpenTool=function(k){ if(!CKL.length){ setTimeout(function(){ window.ckOpenTool(k); },150); return; } CK.mode="tool"; CK.tool=TKALIAS[k]||k; ckSave(); ckRender(); window.scrollTo(0,0); };
window.tkShow=window.ckOpenTool;   /* 도구 안에서 다른 도구 열기(예: 본예산 → 학운위 문서) */
/*/CKTOOL*/
'''

def patch(a, b):
    global s
    if b in s:
        return
    assert s.count(a) == 1, ("패치 자리를 못 찾음", a[:60], s.count(a))
    s = s.replace(a, b)

if _EXTRA:
    CODE = CODE.replace("/*CKTOOL*/\n", "/*CKTOOL*/\n" + _EXTRA, 1)
if "/*CKTOOL*/" in s:
    s = re.sub(r"/\*CKTOOL\*/.*?/\*/CKTOOL\*/\n", lambda m: CODE, s, flags=re.S)
else:
    patch("function ckRender(){", CODE + "function ckRender(){")
patch('sp.classList.toggle("ckcalmode",CK.mode==="cal"||CK.mode==="mon"||CK.mode==="ask"||CK.mode==="gian");',
      'sp.classList.toggle("ckcalmode",CK.mode==="cal"||CK.mode==="mon"||CK.mode==="ask"||CK.mode==="gian"||CK.mode==="tool");')
patch('else if(CK.mode==="gian") ckGian(); else ckMain(); ckCats(); }',
      'else if(CK.mode==="gian") ckGian(); else if(CK.mode==="tool") ckTool(); else ckMain(); ckCats(); ckToolMark(); }')
patch('function ckView(){ return {m:CK.mode, c:CK.mode==="flow"?(CK.cur||""):"", p:CK.mode==="flow"?(CK.pv||""):""}; }',
      'function ckView(){ return {m:CK.mode, c:CK.mode==="flow"?(CK.cur||""):"", p:CK.mode==="flow"?(CK.pv||""):"", t:CK.mode==="tool"?(CK.tool||""):""}; }')
patch('if(o.m===v.m&&o.c===v.c&&o.p===v.p) return;', 'if(o.m===v.m&&o.c===v.c&&o.p===v.p&&(o.t||"")===(v.t||"")) return;')
patch('CK.mode=v.m; if(v.m==="flow")', 'CK.mode=v.m; if(v.m==="tool") CK.tool=v.t||CK.tool; if(v.m==="flow")')

RAIL = r'''<!--CKTOOLS-->
<script type="application/json" id="TKMETA">__M__</script>
<style>
#cktools{position:fixed;z-index:30;display:none;width:208px}
#cktools.rail{display:block}
#cktools h2{font-size:13px;font-weight:700;color:var(--muted);margin:0 0 8px}
.cktl{display:grid;gap:6px}
.cktc{font:inherit;display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:6px 10px 6px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);text-align:left;cursor:pointer;box-shadow:var(--shadow)}
.cktc:hover{border-color:var(--accent-line);background:var(--accent-soft)}
.cktc.on{border-color:var(--accent);background:var(--accent-soft)}
.cktc.rel{box-shadow:inset 3px 0 0 var(--accent),var(--shadow)}
.cktc b{flex:1;min-width:0;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cktc small{flex:0 0 auto;font-size:11px;font-weight:600;color:var(--ink-2);background:var(--surface-3);border-radius:999px;padding:1px 7px}
#cktoolsbtn{position:fixed;right:0;bottom:84px;z-index:31;display:none;font:inherit;font-size:13px;font-weight:700;writing-mode:vertical-rl;letter-spacing:.1em;padding:12px 7px;border:1px solid var(--accent);border-right:0;border-radius:10px 0 0 10px;background:var(--accent);color:#fff;cursor:pointer;box-shadow:var(--shadow)}
:root[data-theme="dark"] #cktoolsbtn{color:#0B1430}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #cktoolsbtn{color:#0B1430}}
#cktoolsbtn.on{display:block}
#cktools.drawer{display:block;right:0;top:0;bottom:0;width:240px;max-width:82vw;padding:16px 14px;background:var(--ground,var(--surface));border-left:1px solid var(--line);box-shadow:var(--shadow);overflow:auto;transform:translateX(100%);visibility:hidden;transition:transform .18s,visibility .18s}
#cktools.drawer.open{transform:none;visibility:visible}
@media print{#cktools,#cktoolsbtn{display:none!important}}
.hb a,.ckfoot a{color:var(--accent-ink)}
/* 분야 색 c17~c28: 어두운 화면 글자색이 빠져 있어 안 보이던 것(2026-11-17) */
.ckcg.c27{--cgbg:hsl(180 70% 93%);--cgfg:hsl(180 60% 32%);--cgb:hsl(180 60% 82%)}.ckcg.c28{--cgbg:hsl(260 70% 93%);--cgfg:hsl(260 60% 32%);--cgb:hsl(260 60% 82%)}
:root[data-theme="dark"] .ckcg.c17{--cgfg:hsl(200 70% 78%)}:root[data-theme="dark"] .ckcg.c18{--cgfg:hsl(280 70% 78%)}:root[data-theme="dark"] .ckcg.c19{--cgfg:hsl(20 70% 78%)}:root[data-theme="dark"] .ckcg.c20{--cgfg:hsl(340 70% 78%)}:root[data-theme="dark"] .ckcg.c21{--cgfg:hsl(160 70% 78%)}:root[data-theme="dark"] .ckcg.c22{--cgfg:hsl(50 70% 78%)}:root[data-theme="dark"] .ckcg.c23{--cgfg:hsl(240 70% 78%)}:root[data-theme="dark"] .ckcg.c24{--cgfg:hsl(120 70% 78%)}:root[data-theme="dark"] .ckcg.c25{--cgfg:hsl(0 70% 78%)}:root[data-theme="dark"] .ckcg.c26{--cgfg:hsl(300 70% 78%)}:root[data-theme="dark"] .ckcg.c27{--cgfg:hsl(180 70% 78%)}:root[data-theme="dark"] .ckcg.c28{--cgfg:hsl(260 70% 78%)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ckcg.c17{--cgfg:hsl(200 70% 78%)}:root:not([data-theme="light"]) .ckcg.c18{--cgfg:hsl(280 70% 78%)}:root:not([data-theme="light"]) .ckcg.c19{--cgfg:hsl(20 70% 78%)}:root:not([data-theme="light"]) .ckcg.c20{--cgfg:hsl(340 70% 78%)}:root:not([data-theme="light"]) .ckcg.c21{--cgfg:hsl(160 70% 78%)}:root:not([data-theme="light"]) .ckcg.c22{--cgfg:hsl(50 70% 78%)}:root:not([data-theme="light"]) .ckcg.c23{--cgfg:hsl(240 70% 78%)}:root:not([data-theme="light"]) .ckcg.c24{--cgfg:hsl(120 70% 78%)}:root:not([data-theme="light"]) .ckcg.c25{--cgfg:hsl(0 70% 78%)}:root:not([data-theme="light"]) .ckcg.c26{--cgfg:hsl(300 70% 78%)}:root:not([data-theme="light"]) .ckcg.c27{--cgfg:hsl(180 70% 78%)}:root:not([data-theme="light"]) .ckcg.c28{--cgfg:hsl(260 70% 78%)}}

</style>
<aside id="cktools" aria-label="도구 모음"><h2>도구 모음</h2><div class="cktl" id="cktl"></div></aside>
<button type="button" id="cktoolsbtn" aria-controls="cktools" aria-expanded="false">도구 모음</button>
<script>/* 오른쪽 여백 '도구 모음': 여백이 넉넉하면 붙여 두고, 좁으면 오른쪽 끝 단추로 연다. 누르면 체크리스트 화면 안에서 도구가 열린다 */
(function(){ var T=JSON.parse(document.getElementById("TKMETA").textContent).tools, box=document.getElementById("cktools"), list=document.getElementById("cktl"), bt=document.getElementById("cktoolsbtn"), W=208, G=16;
  function close(){ box.classList.remove("open"); bt.setAttribute("aria-expanded","false"); }
  T.forEach(function(t){ var a=document.createElement("button"); a.type="button"; a.className="cktc"; a.dataset.k=t.id; a.title=t.name+" 열기";
    var b=document.createElement("b"); b.textContent=t.name; var s=document.createElement("small"); s.textContent=t.cat; a.appendChild(b); a.appendChild(s);
    a.onclick=function(){ close(); if(window.ckOpenTool) window.ckOpenTool(t.id); }; list.appendChild(a); });
  function place(){ var m=document.querySelector("main"), r=m?m.getBoundingClientRect():{right:innerWidth}, free=innerWidth-r.right, top=(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hdr"))||120)+20;
    if(free>=W+G*2){ box.className="rail"; box.style.left=Math.round(r.right+G)+"px"; box.style.top=top+"px"; box.style.width=Math.min(240,Math.round(free-G*2))+"px"; bt.className=""; bt.setAttribute("aria-expanded","false"); }
    else { if(box.className.indexOf("drawer")<0) box.className="drawer"; box.style.left=""; box.style.top=""; box.style.width=""; bt.className="on"; } }
  bt.onclick=function(e){ e.stopPropagation(); var o=box.classList.toggle("open"); bt.setAttribute("aria-expanded",String(o)); };
  document.addEventListener("click",function(e){ if(box.classList.contains("open")&&!box.contains(e.target)) close(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&box.classList.contains("open")) close(); });
  addEventListener("resize",place); if(window.ResizeObserver){ var m=document.querySelector("main"); if(m) new ResizeObserver(place).observe(m); var h=document.querySelector("header"); if(h) new ResizeObserver(place).observe(h); }
  place();
  var h0=/^#tool=([a-z]+)/.exec(location.hash||""); if(h0){ try{ history.replaceState(history.state,"",location.pathname+location.search); }catch(e){} if(window.ckOpenTool) window.ckOpenTool(h0[1]); } })();</script>
<!--/CKTOOLS-->'''.replace("__M__", mjson)
if "<!--CKTOOLS-->" in s:
    s = re.sub(r"<!--CKTOOLS-->.*?<!--/CKTOOLS-->", lambda m: RAIL, s, flags=re.S)
else:
    i = s.rindex("</body>")
    s = s[:i] + RAIL + "\n" + s[i:]
open(path, "w", encoding="utf-8").write(s)
print("tools/app.js", len(app), "bytes · test.html 도구", len(M["tools"]), "개 · v", ver)
