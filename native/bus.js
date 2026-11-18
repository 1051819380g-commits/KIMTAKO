/* ======================================================================
   통학차량 노선도 — 사용자가 만든 단독 페이지(Tmap)를 체크리스트 도구로 옮김 (2026-11-18)
   - 엑셀(B 순번, C 약칭, D 주소, '인원' 열은 있으면) 또는 지도 클릭으로 정류장 추가
   - Tmap 자동차 경로로 구간 시간·거리, 승하차 정류장마다 2분 대기·200m 추가
   - 순서 최적화(첫·끝 고정, 가까운 곳 먼저 + 2-opt, 직선거리 기준)
   - 차량 나누기(k-means, 정원 있으면 상한), 차량별 시간·거리 표
   Tmap 키는 사용자가 발급한 브라우저용 키(2026-11-18 Junho 확인). 지도 SDK는 로더(jsv2)가 document.write를 써서
   나중에 불러올 수 없으므로 본체(tmapjs2.min.js)를 바로 불러오고, SDK가 script 주소의 appKey=를 읽게 한다.
   ====================================================================== */
(function(){ "use strict";
var KEY="lcfQLsL2cx9VrEktOTZeK1UcZ308UnXYBDvSusc4", API="https://apis.openapi.sk.com/tmap/";
function num(v){ var n=parseFloat(v); return isFinite(n)?n:NaN; }
function el(t,c,x){ var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e; }
function btn(t,cls,fn){ var b=el("button",cls||"btn",t); b.type="button"; if(fn) b.onclick=fn; return b; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return "&#"+c.charCodeAt(0)+";"; }); }
function loadJs(u){ return new Promise(function(ok,no){ var s=document.createElement("script"); s.src=u; s.onload=ok; s.onerror=function(){ s.remove(); no(new Error("불러오기 실패")); }; document.head.appendChild(s); }); }
var LIB={};
function needXLSX(){ if(window.XLSX) return Promise.resolve(); return LIB.x||(LIB.x=loadJs("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js").catch(function(){ LIB.x=null; throw new Error("엑셀 읽기 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."); })); }
function needMap(){ if(window.Tmapv2&&window.Tmapv2.Map) return Promise.resolve();
  if(!LIB.m){ var base="https://topopentile1.tmap.co.kr/scriptSDKV2/";
    window.Tmapv2={_getScriptLocation:function(){ return base; },VERSION_NUMBER:new Date().getTime()};
    LIB.m=loadJs(base+"tmapjs2.min.js?version=20231206&appKey="+KEY).catch(function(){ LIB.m=null; throw new Error("지도를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."); }); }
  return LIB.m; }

var CSS=[
".bus-map{position:relative;margin:10px 0}",
".bus-hold{height:max(560px,calc(100vh - 220px));border:1px solid var(--line-strong);border-radius:14px;overflow:hidden;background:var(--surface-2)}",
".bus-map .bus-hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px}",
/* 떠 있는 창 */
".bus-panel{position:absolute;top:12px;z-index:5;max-height:calc(100% - 24px);display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 32px rgba(15,23,42,.18),0 2px 6px rgba(15,23,42,.08);font-size:13px;color:var(--ink)}",
".bus-left{left:12px;width:280px}.bus-right{right:12px;width:min(520px,calc(100% - 316px))}",
".bus-ph{display:flex;align-items:center;gap:8px;padding:11px 10px 11px 14px;border-bottom:1px solid var(--line);flex:0 0 auto}",
".bus-ph h3{margin:0;flex:1;font-size:14px;font-weight:800;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bus-ph h3 em{font-style:normal;color:var(--accent);margin-left:4px}",
".bus-fold{flex:0 0 auto;border:0;background:none;width:28px;height:28px;border-radius:8px;cursor:pointer;color:var(--muted);font-size:17px;line-height:1}.bus-fold:hover{background:var(--surface-3);color:var(--ink)}",
".bus-pb{padding:12px 14px 14px;overflow:auto;min-height:0}.bus-panel.fold .bus-pb{display:none}.bus-panel.fold .bus-ph{border-bottom:0}",
".bus-pb .tkmsg{font-size:12.5px;margin:0 0 10px;padding:7px 10px}",
/* 왼쪽 창 */
".bus-drop{display:flex;flex-direction:column;align-items:center;gap:3px;padding:14px 10px;border:1.5px dashed var(--accent);border-radius:12px;background:var(--accent-soft);color:var(--ink-2);text-align:center;cursor:pointer;transition:background .15s}",
".bus-drop:hover,.bus-drop.on{background:color-mix(in srgb,var(--accent) 14%,var(--surface))}.bus-drop .ic{font-size:18px;line-height:1;color:var(--accent)}.bus-drop b{color:var(--accent);font-size:13px}.bus-drop small{color:var(--muted);font-size:11px}",
".bus-hint2{margin:6px 2px 0;font-size:11.5px;color:var(--muted)}",
".bus-grp{margin-top:12px;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--surface-2)}",
".bus-gt{display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin:0 0 8px;font-size:12px;font-weight:800;color:var(--ink-2)}.bus-gt small{font-weight:500;color:var(--muted);font-size:11px}",
".bus-row{display:flex;gap:6px;align-items:center}.bus-row>*{min-width:0}",
".bus-in{height:34px;box-sizing:border-box;border:1px solid var(--line-strong);border-radius:8px;padding:0 8px;font:inherit;font-size:13px;background:var(--surface);color:var(--ink)}.bus-in:focus{outline:2px solid var(--accent-line,var(--accent));outline-offset:-1px}",
".bus-unit{font-size:12px;color:var(--muted);font-weight:700}",
/* 단추 */
".bus-btn{height:32px;padding:0 12px;border-radius:8px;border:1px solid var(--accent);background:var(--accent);color:#fff;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}.bus-btn:hover{filter:brightness(1.06)}",
".bus-btn.gh{background:var(--surface);color:var(--ink-2);border-color:var(--line-strong)}.bus-btn.gh:hover{background:var(--surface-3);filter:none}.bus-btn.sm{height:30px;padding:0 10px;font-size:12px}",
".bus-acts{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.bus-acts .sp{flex:1}",
".bus-tabs{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0 6px}.bus-tab{height:26px;padding:0 10px;border-radius:999px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink-2);font:inherit;font-size:12px;font-weight:700;cursor:pointer}.bus-tab.on{background:var(--accent);border-color:var(--accent);color:#fff}",
/* 요약 */
".bus-sum{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 8px}.bus-sum div{border-radius:10px;padding:8px 10px;background:var(--surface-2);border:1px solid var(--line);font-size:11px;font-weight:700;color:var(--muted);text-align:center}",
".bus-sum b{display:block;margin-top:2px;font-size:19px;font-weight:800;color:var(--accent);font-variant-numeric:tabular-nums}.bus-sum div+div b{color:var(--pos)}.bus-sum b small{font-size:12px;font-weight:700;color:var(--muted);margin-left:2px}",
/* 표 */
".bus-tb{width:100%;border-collapse:collapse;table-layout:fixed;font-size:12.5px}",
".bus-tb th{position:sticky;top:-12px;z-index:1;background:var(--surface);padding:7px 4px;border-bottom:2px solid var(--line);font-size:11px;font-weight:700;color:var(--muted);text-align:center;white-space:nowrap}",
".bus-tb td{padding:7px 3px;border-bottom:1px solid var(--line);text-align:center;vertical-align:middle;font-variant-numeric:tabular-nums}.bus-tb tbody tr:hover td{background:var(--surface-2)}",
".bus-tb td.nm{text-align:left;overflow:hidden}.bus-tb td.nm b{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bus-tb td.nm small{display:block;color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bus-tb td.nm small.w{color:var(--warn);font-weight:700}",
".bus-tb td b.t{display:block;font-weight:800;color:var(--accent)}.bus-tb td b.d{display:block;font-weight:800;color:var(--pos)}.bus-tb td small.s{font-size:10.5px;color:var(--muted)}.bus-tb .no{color:var(--line-strong)}",
".bus-tb tr.pass td{opacity:.62}.bus-tb tr.max td{color:var(--neg);font-weight:800}.bus-tb tr.tot td{font-weight:800;color:var(--accent);border-bottom:0;border-top:1.5px solid var(--line-strong)}",
".bus-bd{display:inline-block;min-width:28px;padding:2px 5px;border-radius:6px;font-size:11px;font-weight:800;background:var(--surface-3);color:var(--ink-2)}.bus-bd.st{background:#dbeafe;color:#1d4ed8}.bus-bd.en{background:#fee2e2;color:#b91c1c}.bus-bd.ps{background:none;color:var(--muted);border:1px dashed var(--line-strong)}",
".bus-tg{border:0;border-radius:999px;padding:3px 9px;font:inherit;font-size:11px;font-weight:700;cursor:pointer;background:#dbeafe;color:#1d4ed8;white-space:nowrap}.bus-tg.ps{background:var(--surface-3);color:var(--muted)}.bus-tg:disabled{opacity:.35;cursor:default}",
".bus-ic{border:0;background:none;width:21px;height:22px;border-radius:6px;cursor:pointer;color:var(--muted);font-size:11px;padding:0}.bus-ic:hover{background:var(--surface-3);color:var(--ink)}.bus-ic.rm:hover{color:var(--neg)}.bus-ic:disabled{opacity:.25;cursor:default;background:none}",
".bus-wt{width:38px;height:26px;box-sizing:border-box;border:1px solid var(--line-strong);border-radius:6px;padding:0 2px;font:inherit;font-size:12px;text-align:center;background:var(--surface);color:var(--ink);-moz-appearance:textfield}.bus-wt::-webkit-inner-spin-button{display:none}.bus-wt:not(:placeholder-shown){border-color:var(--accent);color:var(--accent);font-weight:700}",
".bus-tab.x{border-style:dashed;color:var(--muted)}.bus-tab.x:hover{color:var(--neg);border-color:var(--neg)}button.bus-bd{border:0;cursor:pointer;font:inherit;font-size:11px;font-weight:800}button.bus-bd:hover{outline:2px solid #93c5fd}",
".bus-empty{padding:18px 6px;text-align:center;color:var(--muted);font-size:12.5px}",
/* 지도 표시 */
".bus-mk{display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:#facc15;border:2px solid #fff;border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,.3);font-weight:900;color:#451a03;font-size:13px;white-space:nowrap}",
".bus-mk.pass{width:22px;height:22px;background:#94a3b8;color:#fff;font-size:10px}",
".bus-mk.st,.bus-mk.en{width:auto;border-radius:6px;padding:0 10px;color:#fff;font-size:12px}.bus-mk.st{background:#3b82f6}.bus-mk.en{background:#ef4444}",
".bus-tip{background:rgba(255,255,255,.95);color:#333;border:1px solid #e2e8f0;border-radius:8px;padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap}.bus-tip.pass{color:#64748b}",
"@media(max-width:760px){.bus-map{display:flex;flex-direction:column;gap:10px}.bus-left{order:-1}.bus-hold{height:420px}.bus-panel{position:static;width:auto;max-height:none}.bus-tb th{top:0}.bus-right .bus-tb{min-width:510px}}",
"@media print{.bus-noprint{display:none!important}.bus-panel{position:static;width:auto;max-height:none;box-shadow:none;border:0}.bus-pb{overflow:visible}}"
].join("");

/* ---- 거리·순서 ---- */
var dist=function(a,b){ return Math.hypot((a.lat-b.lat)*111,(a.lng-b.lng)*91); };   /* km 근사(위도 35°) */
var routeLen=function(r){ return r.slice(1).reduce(function(t,x,i){ return t+dist(r[i],x); },0); };
/* 첫·끝 고정, 사이 정류장을 가까운 곳 먼저 + 2-opt로 재배치. ponytail: 직선거리 기준(하천·산 우회 반영 안 됨) */
function orderRoute(s){ var n=s.length, mid=s.slice(1,-1), route=[s[0]];
  while(mid.length){ var last=route[route.length-1], bi=0; mid.forEach(function(x,i){ if(dist(last,x)<dist(last,mid[bi])) bi=i; }); route.push(mid.splice(bi,1)[0]); }
  route.push(s[n-1]);
  for(var improved=true; improved;){ improved=false;
    for(var i=1;i<n-2;i++) for(var j=i+1;j<n-1;j++){ var c=route.slice(0,i).concat(route.slice(i,j+1).reverse(),route.slice(j+1)); if(routeLen(c)<routeLen(route)-1e-9){ route=c; improved=true; } } }
  return route; }
function shortName(a){ var p=String(a||"").trim().split(/\s+/).filter(Boolean); return p.length>=2?p[p.length-2]+" "+p[p.length-1]:(a||"지정 위치"); }

function build(root){
  if(!document.getElementById("bus-css")){ var st=el("style"); st.id="bus-css"; st.textContent=CSS; document.head.appendChild(st); }
  var S={stops:[],res:[],calc:false,veh:null,av:0,vst:[],orig:null,mk:0}, map=null, items=[], seq=0;
  var msg=el("div","tkmsg");
  function say(t,k){ msg.className="tkmsg on "+(k||"ok"); msg.textContent=t; }

  /* 정류장·차량: 지도 왼쪽 위에 띄우는 창(휴대폰은 지도 위) */
  function panel(cls,title){ var sec=el("section","bus-panel "+cls), h=el("div","bus-ph"), hh=el("h3",null,title), body=el("div","bus-pb");
    var f=btn("▴","bus-fold bus-noprint",function(){ var x=sec.classList.toggle("fold"); f.textContent=x?"▾":"▴"; f.title=x?"펼치기":"접기"; }); f.title="접기";
    h.appendChild(hh); h.appendChild(f); sec.appendChild(h); sec.appendChild(body); return {sec:sec,h3:hh,body:body}; }
  var P1=panel("bus-left bus-noprint","정류장·차량"), b1=P1.body;
  var fi=el("input"); fi.type="file"; fi.accept=".xlsx,.xls,.csv"; fi.hidden=true;
  var drop=el("label","bus-drop"); drop.appendChild(el("span","ic","⇪")); drop.appendChild(el("b",null,"엑셀 파일 고르기"));
  drop.appendChild(el("small",null,"또는 여기로 끌어 놓기 · B 순번 · C 약칭 · D 주소")); drop.appendChild(fi);
  drop.ondragover=function(e){ e.preventDefault(); drop.classList.add("on"); }; drop.ondragleave=function(){ drop.classList.remove("on"); };
  drop.ondrop=function(e){ e.preventDefault(); drop.classList.remove("on"); if(e.dataTransfer.files[0]) readXlsx(e.dataTransfer.files[0]); };
  fi.onchange=function(){ if(fi.files[0]) readXlsx(fi.files[0]); fi.value=""; };
  var tt=el("select","bus-in"); [["start","출발 시간"],["end","도착 시간"]].forEach(function(o){ var op=el("option",null,o[1]); op.value=o[0]; tt.appendChild(op); });
  var ti=el("input","bus-in"); ti.type="time"; ti.value="08:00"; ti.style.flex="1"; tt.onchange=ti.onchange=function(){ if(S.calc) calc(); };
  var g1=el("div","bus-grp"), gt1=el("div","bus-gt","운행 시간 기준"); gt1.appendChild(el("small",null,"승하차마다 200m 추가")); g1.appendChild(gt1);
  var tr=el("div","bus-row"); tr.appendChild(tt); tr.appendChild(ti); g1.appendChild(tr);
  var wd=el("input","bus-in"); wd.type="number"; wd.min=0; wd.max=60; wd.value=2; wd.style.cssText="width:52px;text-align:center"; wd.onchange=function(){ if(!(num(wd.value)>=0)) wd.value=2; dirty(); if(S.stops.length>1) calc(); };
  var wr=el("div","bus-row"); wr.style.marginTop="6px"; wr.appendChild(el("span","bus-unit","정류장마다 기본 대기")); wr.appendChild(wd); wr.appendChild(el("span","bus-unit","분")); g1.appendChild(wr);
  g1.appendChild(el("p","bus-hint2","정류장별 대기는 결과 표의 '대기' 칸에서 바꿔요."));
  var vk=el("input","bus-in"); vk.type="number"; vk.min=2; vk.max=20; vk.value=2; vk.style.cssText="width:48px;text-align:center";
  var vc=el("input","bus-in"); vc.type="number"; vc.min=1; vc.placeholder="정원(선택)"; vc.style.cssText="flex:1;width:0";
  var g2=el("div","bus-grp"), gt2=el("div","bus-gt","차량 나누기"); gt2.appendChild(el("small",null,"출발·도착은 공통")); g2.appendChild(gt2);
  var vr=el("div","bus-row"); vr.appendChild(vk); vr.appendChild(el("span","bus-unit","대")); vr.appendChild(vc); vr.appendChild(btn("자동 배분","bus-btn",split)); g2.appendChild(vr);
  var vtabs=el("div","bus-tabs"), vtb=el("div"); g2.appendChild(vtabs); g2.appendChild(vtb);
  b1.appendChild(msg); b1.appendChild(drop); b1.appendChild(el("p","bus-hint2","첫 줄 출발, 끝 줄 도착. 지도 빈 곳을 눌러도 정류장이 더해져요."));
  b1.appendChild(g1); b1.appendChild(g2);

  /* 지도·결과 */
  var mapWrap=el("div","bus-map"), hold=el("div","bus-hold"), mapBox=el("div"); mapBox.id="busmap"; mapBox.style.height="100%"; hold.appendChild(mapBox); mapWrap.appendChild(hold); mapBox.appendChild(el("div","bus-hint","지도를 불러오는 중이에요…"));   /* Tmap이 지도 칸 높이를 100%로 바꾸므로 높이는 바깥 칸에 */
  var P2=panel("bus-right","노선 결과"), b2=P2.body, sec2=P2.sec;   /* 노선 결과: 지도 오른쪽 위에 띄우는 창(휴대폰은 지도 아래) */
  var acts=el("div","bus-acts bus-noprint");
  acts.appendChild(btn("순서 최적화","bus-btn gh sm",optimize)); acts.appendChild(btn("경로 계산","bus-btn sm",function(){ calc(); })); acts.appendChild(el("span","sp"));
  acts.appendChild(btn("엑셀 복사","bus-btn gh sm",copyTsv)); acts.appendChild(btn("인쇄","bus-btn gh sm",function(){ window.print(); }));
  acts.appendChild(btn("비우기","bus-btn gh sm",function(){ if(!S.stops.length||!confirm("정류장을 모두 지울까요?")) return; S.stops=[]; S.veh=null; S.vst=[]; dirty(); }));
  var sum=el("div","bus-sum"), tbw=el("div");
  b2.appendChild(acts); b2.appendChild(sum); b2.appendChild(tbw);
  mapWrap.appendChild(P1.sec); mapWrap.appendChild(sec2);
  root.appendChild(mapWrap);

  needMap().then(function(){ if(!root.isConnected) return; mapBox.textContent="";
    map=new Tmapv2.Map("busmap",{center:new Tmapv2.LatLng(35.2280,128.6811),zoom:12,zoomControl:true,scrollwheel:true,width:"100%",height:"100%"});
    map.addListener("click",function(e){ if(!e.latLng||Date.now()-S.mk<400) return; var s={id:"s"+(++seq),name:"위치 찾는 중…",address:"",lat:e.latLng.lat(),lng:e.latLng.lng(),isPass:false,pax:0};
      S.stops.push(s); dirty();
      fetch(API+"geo/reversegeocoding?version=1&format=json&lat="+s.lat+"&lon="+s.lng+"&coordType=WGS84GEO&addressType=A04&appKey="+KEY).then(function(r){ return r.json(); })
        .then(function(d){ var ad=d&&d.addressInfo?d.addressInfo.fullAddress:""; named(s,ad,ad?shortName(ad):"새 경유지"); })
        .catch(function(){ named(s,"","새 경유지"); }); });
    function named(s,ad,nm){ (S.veh?[].concat.apply([],S.veh):S.stops).concat([s]).forEach(function(x){   /* 출발지를 복사한 도착지도 같이 */
        if(x===s||(x.name==="위치 찾는 중…"&&x.lat===s.lat&&x.lng===s.lng)){ x.address=ad; x.name=nm; } }); draw(); }
    draw(); }, function(e){ mapBox.textContent=""; mapBox.appendChild(el("div","bus-hint",e.message)); });
  draw();

  /* ---- 엑셀 ---- */
  function readXlsx(file){ needXLSX().then(function(){ return file.arrayBuffer(); }).then(function(buf){
      var wb=XLSX.read(new Uint8Array(buf),{type:"array"}), rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:"A",defval:""}), pc=null;
      rows.forEach(function(r){ for(var k in r) if(!pc&&String(r[k]).trim()==="인원") pc=k; });
      var out=rows.map(function(r){ return {name:String(r.C||"").trim(),address:String(r.D||"").trim(),pax:pc?(parseInt(r[pc])||0):0}; })
        .filter(function(x){ return x.address&&x.address!=="주소"&&x.address!=="자세한주소"&&x.address.indexOf("도로명")<0; });
      if(!out.length) throw new Error("엑셀에서 주소(D열)를 찾지 못했어요.");
      return geocodeAll(out); }).catch(function(e){ say(e.message,"bad"); }); }
  function geocode(a){ var q=encodeURIComponent(a);
    return fetch(API+"geo/fullAddrGeo?version=1&format=json&coordType=WGS84GEO&fullAddr="+q+"&appKey="+KEY).then(function(r){ return r.ok?r.json():null; }).then(function(d){
      var ci=d&&d.coordinateInfo, cs=(ci&&ci.coordinate)||[], c=cs.filter(function(x){ return x.newLat; })[0]||cs[0];
      /* 도로명 후보가 있으면 그것(첫 후보가 엉뚱한 지번일 때가 있음). 없으면 앞쪽 후보들이 1km 넘게 흩어졌을 때 '확인 필요' */
      if(c){ var P=function(x){ return {lat:parseFloat(x.newLat||x.lat),lng:parseFloat(x.newLon||x.lon)}; }, r=P(c);
        r.guess=!c.newLat&&cs.slice(0,5).some(function(x){ return !(x.newLat||x.lat)||dist(r,P(x))>1; }); return r; }
      return fetch(API+"pois?version=1&format=json&searchKeyword="+q+"&resCoordType=WGS84GEO&reqCoordType=WGS84GEO&count=1&appKey="+KEY).then(function(r){ return r.ok?r.json():null; })
        .then(function(d){ var p=d&&d.searchPoiInfo&&d.searchPoiInfo.pois.poi[0]; return p?{lat:parseFloat(p.noorLat),lng:parseFloat(p.noorLon)}:null; }); }).catch(function(){ return null; }); }
  async function geocodeAll(list){ S.stops=[]; S.veh=null; S.vst=[]; var miss=[], gs=[];
    for(var i=0;i<list.length;i++){ say("주소를 찾는 중이에요… ("+(i+1)+"/"+list.length+")","warn"); var c=await geocode(list[i].address);
      if(c){ S.stops.push({id:"s"+(++seq),name:list[i].name||shortName(list[i].address),address:list[i].address,pax:list[i].pax,lat:c.lat,lng:c.lng,isPass:false,guess:c.guess}); if(c.guess) gs.push(list[i].name||list[i].address); }
      else miss.push(list[i].name||list[i].address); }
    dirty();
    if(!S.stops.length){ say("찾을 수 있는 주소가 없어요.","bad"); return; }
    if(S.stops.length>1) await calc();
    say(S.stops.length+"곳을 넣었어요."+(miss.length?"\n주소를 못 찾은 곳: "+miss.join(", "):"")+(gs.length?"\n위치가 맞는지 지도에서 확인할 곳(도로명이 맞지 않아 비슷한 번지로 찾음): "+gs.join(", "):""),miss.length||gs.length?"warn":"ok"); }

  /* ---- 경로 계산 ---- */
  function seg(a,b){ if(Math.abs(a.lat-b.lat)<1e-4&&Math.abs(a.lng-b.lng)<1e-4) return Promise.resolve({time:0,dist:0,path:[[a.lat,a.lng]]});
    return fetch(API+"routes?version=1&format=json&appKey="+KEY,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({startX:String(a.lng),startY:String(a.lat),endX:String(b.lng),endY:String(b.lat),reqCoordType:"WGS84GEO",resCoordType:"WGS84GEO",searchOption:0,trafficInfo:"N"})})
      .then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(d){ if(!d.features||!d.features.length) throw 0; var p=d.features[0].properties, path=[];
        d.features.forEach(function(f){ if(f.geometry.type==="LineString") f.geometry.coordinates.forEach(function(c){ path.push([c[1],c[0]]); }); });
        return {time:Math.round((p.totalTime||0)/60),dist:+((p.totalDistance||0)/1000).toFixed(1),path:path}; })
      .catch(function(){ return {time:1,dist:0.1,path:[[a.lat,a.lng],[b.lat,b.lng]],bad:1}; }); }
  function backToStart(){ var s=S.stops, a=s[0], z=s[s.length-1]; if(!a) return;
    if(s.length>1&&Math.abs(a.lat-z.lat)<1e-5&&Math.abs(a.lng-z.lng)<1e-5){ say("도착지가 이미 출발지와 같아요.","ok"); return; }
    s.push({id:"s"+(++seq),name:a.name,address:a.address,lat:a.lat,lng:a.lng,isPass:false,pax:0,guess:a.guess}); dirty();
    if(s.length>1) calc().then(function(){ say("도착지를 출발지와 같은 곳으로 정했어요.","ok"); }); }
  function waitOf(x){ return x.wait!=null?x.wait:(num(wd.value)>=0?num(wd.value):2); }
  async function calc(){ var s=S.stops; if(s.length<2){ say("출발지와 도착지, 적어도 2곳이 있어야 해요.","bad"); return; }
    s[0].isPass=false; s[s.length-1].isPass=false; say("경로를 계산하는 중이에요…","warn");
    var res=[{segTime:0,segDist:0,accTime:0,accDist:0,path:[]}], at=0, ad=0, bad=0;
    for(var i=0;i<s.length-1;i++){ var r=await seg(s[i],s[i+1]), t=r.time, d=r.dist; if(r.bad) bad++;
      if(i+1<s.length-1&&!s[i+1].isPass){ t+=waitOf(s[i+1]); d+=0.2; }
      at+=t; ad+=d; res.push({segTime:t,segDist:+d.toFixed(1),accTime:at,accDist:+ad.toFixed(1),path:r.path}); }
    var hm=(ti.value||"08:00").split(":").map(Number), base=hm[0]*60+hm[1]-(tt.value==="end"?at:0);
    res.forEach(function(r){ var m=((base+r.accTime)%1440+1440)%1440; r.pass=("0"+Math.floor(m/60)).slice(-2)+":"+("0"+m%60).slice(-2); });
    if(s!==S.stops) return;   /* 계산 중에 정류장이 바뀜 */
    S.res=res; S.calc=true; S.tot={time:at,dist:ad};
    if(S.veh) S.vst[S.av]={time:at,dist:ad};
    draw(true); say(bad?"경로를 못 찾은 구간이 "+bad+"곳 있어요(직선 1분·0.1km로 셈).":"노선을 계산했어요.",bad?"warn":"ok"); }
  function dirty(){ S.calc=false; S.res=[]; if(S.veh) S.vst[S.av]=null; draw(); }

  function optimize(){ var s=S.stops; if(s.length<4){ say("순서를 바꿀 중간 정류장이 2곳 이상 있어야 해요.","bad"); return; }
    var r=orderRoute(s), a=routeLen(s), b=routeLen(r); if(b>=a-1e-9){ say("이미 가장 짧은 순서에 가까워요.","ok"); return; }
    S.stops=r; if(S.veh) S.veh[S.av]=r; dirty(); calc().then(function(){ say("순서를 바꿨어요(직선거리 "+a.toFixed(1)+"→"+b.toFixed(1)+"km).","ok"); }); }

  /* ---- 차량 나누기: k-means(가장 먼 점 1회 + 무작위 8회 중 총 거리 최소). ponytail: 직선거리·탐욕 배정, 정원이 빠듯하면 최적 묶음이 아닐 수 있음 ---- */
  var paxSum=function(v){ return v.slice(1,-1).reduce(function(t,x){ return t+(x.pax||0); },0); };
  async function split(){ var k=parseInt(vk.value,10); if(S.veh) S.veh[S.av]=S.stops; else S.orig=S.stops.slice();
    var all=S.veh||[S.stops]; if(!all[0].length){ say("정류장을 먼저 넣어 주세요.","bad"); return; }
    var first=all[0][0], last=all[0][all[0].length-1], mids=[].concat.apply([],all.map(function(v){ return v.slice(1,-1); }));
    if(!(k>=2)||mids.length<k){ say("차량 수는 2대 이상, 중간 정류장 수 이하여야 해요.","bad"); return; }
    var usePax=mids.some(function(m){ return m.pax>0; }), w=function(m){ return usePax?(m.pax||0):1; }, total=mids.reduce(function(t,m){ return t+w(m); },0), unit=usePax?"명":"곳";
    var cap=parseInt(vc.value,10), limit=cap>0?cap:Infinity;
    if(total>limit*k){ say("정원 "+limit+" × "+k+"대로는 "+total+unit+"을 다 태울 수 없어요. "+Math.ceil(total/limit)+"대 이상 필요해요.","bad"); return; }
    var cost=function(gs){ return gs.reduce(function(t,g){ return t+(g.length?routeLen(orderRoute([first].concat(g,[last]))):0); },0); };
    function cluster(C){ var groups, over=false;
      for(var it=0;it<10;it++){ var pairs=[]; mids.forEach(function(m,i){ C.forEach(function(c,j){ pairs.push([dist(m,c),i,j]); }); }); pairs.sort(function(a,b){ return a[0]-b[0]; });
        groups=C.map(function(){ return []; }); var load=C.map(function(){ return 0; }), used={};
        pairs.forEach(function(p){ var i=p[1], j=p[2]; if(!used[i]&&load[j]+w(mids[i])<=limit){ groups[j].push(mids[i]); load[j]+=w(mids[i]); used[i]=1; } });
        mids.forEach(function(m,i){ if(used[i]) return; var j=load.indexOf(Math.min.apply(null,load)); groups[j].push(m); load[j]+=w(m); over=true; });
        C=groups.map(function(g,j){ return g.length?{lat:g.reduce(function(t,x){ return t+x.lat; },0)/g.length,lng:g.reduce(function(t,x){ return t+x.lng; },0)/g.length}:C[j]; }); }
      return {groups:groups,over:over,cost:cost(groups)}; }
    var C0=[mids[0]]; while(C0.length<k){ var far=mids[0], bd=-1; mids.forEach(function(m){ var dd=Math.min.apply(null,C0.map(function(c){ return dist(m,c); })); if(dd>bd){ bd=dd; far=m; } }); C0.push(far); }
    var inits=[C0]; for(var t=0;t<8;t++) inits.push(mids.slice().sort(function(){ return Math.random()-0.5; }).slice(0,k));
    var best=null; inits.forEach(function(C){ var r=cluster(C); if(!best||(r.over!==best.over?!r.over:r.cost<best.cost)) best=r; });
    S.veh=best.groups.filter(function(g){ return g.length; }).map(function(g){ return orderRoute([first].concat(g,[last])); }); S.vst=[];
    for(var i=S.veh.length-1;i>=0;i--){ S.av=i; S.stops=S.veh[i]; S.calc=false; await calc(); }
    say(S.veh.length+"대로 나눴어요: "+S.veh.map(function(v){ return usePax?paxSum(v):v.length-2; }).join(" / ")+unit+(best.over?(cap>0?" (정원을 넘는 차량이 있어요. 차량 수를 늘려 보세요)":" (인원 차이가 커서 고르게 나누기 어려워요)"):""),best.over?"warn":"ok"); }
  function unsplit(){ if(!S.veh) return; S.veh[S.av]=S.stops; var v0=S.veh[0], first=v0[0], last=v0[v0.length-1], o=S.orig||[];
    var mids=[].concat.apply([],S.veh.map(function(v){ return v.slice(1,-1); })), at=function(x){ var k=o.indexOf(x); return k<0?1e9:k; };
    mids.sort(function(a,b){ return at(a)-at(b); });   /* 나누기 전 순서로(나눈 뒤 더한 곳은 끝에) */
    S.stops=[first].concat(mids,[last]); S.veh=null; S.vst=[]; S.av=0; S.orig=null; dirty(); calc().then(function(){ say("차량 나누기를 취소하고 한 노선으로 합쳤어요.","ok"); }); }
  function pick(i){ S.veh[S.av]=S.stops; S.av=i; S.stops=S.veh[i]; S.calc=false; calc(); }

  /* ---- 그리기 ---- */
  function move(i,d){ var s=S.stops, j=i+d; if(j<0||j>=s.length) return; var x=s[i]; s[i]=s[j]; s[j]=x; dirty(); }
  function draw(fit){
    sec2.hidden=!S.stops.length; P2.h3.textContent="노선 결과"; var em=el("em",null,S.stops.length+"곳"+(S.veh?" · "+(S.av+1)+"호차":"")); P2.h3.appendChild(em);
    sum.textContent=""; [["총 소요 시간",S.calc?S.tot.time:"-","분"],["총 이동 거리",S.calc?S.tot.dist.toFixed(1):"-","km"]].forEach(function(x){ var d=el("div",null,x[0]), v=el("b",null,x[1]); if(S.calc) v.appendChild(el("small",null,x[2])); d.appendChild(v); sum.appendChild(d); });
    tbw.textContent="";
    if(!S.stops.length){ tbw.appendChild(el("div","bus-empty","아직 정류장이 없어요.")); drawVeh(); drawMap(fit); return; }
    var tb=el("table","bus-tb"), cg=el("colgroup"); ["46px","","62px","46px","58px","58px","70px"].forEach(function(w,i){ var c=el("col"); if(w) c.style.width=w; if(i===6) c.className="bus-noprint"; cg.appendChild(c); }); tb.appendChild(cg);
    var hr=tb.createTHead().insertRow(); ["순번","약칭·주소","종류","대기","통과","누적",""].forEach(function(h,i){ hr.appendChild(el("th",i===6?"bus-noprint":null,h)); });
    var body=tb.createTBody(), n=S.stops.length;
    S.stops.forEach(function(s,i){ var r=body.insertRow(), end=i===0||i===n-1, res=S.calc?S.res[i]:null; if(s.isPass) r.className="pass";
      var bd=i===0?btn("출발","bus-bd st",backToStart):el("span","bus-bd"+(i===n-1?" en":s.isPass?" ps":""),i===n-1?"도착":s.isPass?"경유":String(i+1));
      if(i===0) bd.title="누르면 도착지도 출발지와 같은 곳으로"; r.insertCell().appendChild(bd);
      var c=r.insertCell(); c.className="nm"; c.title=s.name+"\n"+s.address; c.appendChild(el("b",null,s.name));
      c.appendChild(el("small",s.guess?"w":null,(s.guess?"⚠ 위치 확인 필요 · ":"")+s.address));
      var tg=btn(s.isPass?"단순통과":"승하차","bus-tg"+(s.isPass?" ps":""),function(){ s.isPass=!s.isPass; dirty(); }); tg.disabled=end; r.insertCell().appendChild(tg);
      var wc=r.insertCell(); if(end||s.isPass) wc.appendChild(el("span","no","–"));
      else { var wi=el("input","bus-wt"); wi.type="number"; wi.min=0; wi.max=60; wi.placeholder=String(waitOf({})); if(s.wait!=null) wi.value=s.wait; wi.title="이 정류장 대기(분). 비우면 기본값";
        wi.onchange=function(){ var v=num(wi.value); s.wait=wi.value===""||!(v>=0)?undefined:Math.round(v); dirty(); calc(); }; wc.appendChild(wi); }
      var t=r.insertCell(), d=r.insertCell();
      if(res){ t.appendChild(el("b","t",res.pass)); t.appendChild(el("small","s",res.segTime+"분")); d.appendChild(el("b","d",res.accDist+"km")); d.appendChild(el("small","s","+"+res.segDist)); }
      else { t.appendChild(el("span","no","–")); d.appendChild(el("span","no","–")); }
      var a=r.insertCell(); a.className="bus-noprint"; a.style.whiteSpace="nowrap";
      var up=btn("▲","bus-ic",function(){ move(i,-1); }), dn=btn("▼","bus-ic",function(){ move(i,1); }), rm=btn("✕","bus-ic rm",function(){ S.stops.splice(i,1); dirty(); });
      up.disabled=i===0; dn.disabled=i===n-1; up.title="위로"; dn.title="아래로"; rm.title="지우기"; a.appendChild(up); a.appendChild(dn); a.appendChild(rm); });
    tbw.appendChild(tb);
    drawVeh(); drawMap(fit); }
  function drawVeh(){ vtabs.textContent=""; vtb.textContent=""; var vs=S.veh; if(!vs) return;
    vs.forEach(function(v,i){ vtabs.appendChild(btn((i+1)+"호차 · "+(v.length-2),"bus-tab"+(i===S.av?" on":""),function(){ if(i!==S.av) pick(i); })); });
    var cx=btn("나누기 취소","bus-tab x",unsplit); cx.title="한 노선으로 다시 합쳐요"; vtabs.appendChild(cx);
    var showPax=vs.some(function(v){ return paxSum(v)>0; }), done=vs.every(function(v,i){ return S.vst[i]; }), maxT=Math.max.apply(null,S.vst.map(function(s){ return s?s.time:-1; }));
    var tb=el("table","bus-tb"), hr=tb.createTHead().insertRow(); ["차량","정류장"].concat(showPax?["인원"]:[],["분","km"]).forEach(function(h){ hr.appendChild(el("th",null,h)); });
    var body=tb.createTBody();
    function row(a,cls){ var r=body.insertRow(); if(cls) r.className=cls; a.forEach(function(x){ r.insertCell().textContent=x; }); }
    vs.forEach(function(v,i){ var s=S.vst[i]; row([(i+1)+"호차",v.length-2].concat(showPax?[paxSum(v)]:[],[s?s.time:"–",s?s.dist.toFixed(1):"–"]),done&&s&&s.time===maxT?"max":""); });
    if(done) row(["합계",vs.reduce(function(t,v){ return t+v.length-2; },0)].concat(showPax?[vs.reduce(function(t,v){ return t+paxSum(v); },0)]:[],[S.vst.reduce(function(t,s){ return t+s.time; },0),S.vst.reduce(function(t,s){ return t+s.dist; },0).toFixed(1)]),"tot");
    vtb.appendChild(tb); if(done) vtb.appendChild(el("p","bus-hint2","빨간 줄은 가장 오래 걸리는 차량이에요.")); }
  function drawMap(fit){ if(!map) return; items.forEach(function(x){ x.setMap(null); }); items=[]; var s=S.stops, n=s.length; if(!n) return;
    var B=new Tmapv2.LatLngBounds(), LL=function(p){ return new Tmapv2.LatLng(p[0],p[1]); };
    if(S.calc){ var path=[]; S.res.forEach(function(r){ r.path.forEach(function(p){ path.push(LL(p)); }); });
      if(path.length>1){ items.push(new Tmapv2.Polyline({path:path,strokeColor:"#3b82f6",strokeWeight:6,map:map})); path.forEach(function(p){ B.extend(p); }); } }
    s.forEach(function(x,i){ var p=new Tmapv2.LatLng(x.lat,x.lng), end=i===0||i===n-1; B.extend(p);
      var h=i===0?'<div class="bus-mk st">출발</div>':i===n-1?'<div class="bus-mk en">도착</div>':x.isPass?'<div class="bus-mk pass">경유</div>':'<div class="bus-mk">'+(i+1)+'</div>';
      var mk=new Tmapv2.Marker({position:p,map:map,title:i===0?x.name+" — 한 번 더 누르면 도착지도 여기로":x.name,iconHTML:h,iconSize:new Tmapv2.Size(end?46:x.isPass?22:28,28)}); items.push(mk);
      if(i===0) mk.addListener("click",function(){ S.mk=Date.now(); backToStart(); });
      items.push(new Tmapv2.Label({position:p,map:map,title:'<div class="bus-tip'+(x.isPass?" pass":"")+'">'+esc(x.name)+'</div>',offset:new Tmapv2.Point(0,end?-20:x.isPass?-10:-15)})); });
    if(fit){ try{ if(n===1) map.setCenter(new Tmapv2.LatLng(s[0].lat,s[0].lng)); else map.fitBounds(B,{margin:50}); }catch(e){} } }

  function copyTsv(){ if(!S.calc){ say("먼저 경로를 계산해 주세요.","bad"); return; } var n=S.stops.length;
    var t="순번\t약칭\t주소\t대기(분)\t통과시간\t구간(분)\t누적(분)\t구간(km)\t누적(km)\n"+S.stops.map(function(s,i){ var r=S.res[i];
      return [i===0?"출발":i===n-1?"도착":s.isPass?"경유(통과)":i+1,s.name,s.address,(i===0||i===n-1||s.isPass)?"":waitOf(s),r.pass,r.segTime,r.accTime,r.segDist,r.accDist].join("\t"); }).join("\n");
    navigator.clipboard.writeText(t).then(function(){ say("복사했어요. 엑셀에 붙여 넣으세요.","ok"); },function(){ say("복사하지 못했어요.","bad"); }); }
}
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.bus=build;
})();
