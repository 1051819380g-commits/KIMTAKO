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

var CSS=".bus-top{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}.bus-top .tksec{margin:0}"+".bus-map{position:relative;margin:10px 0}.bus-hold{height:640px;border:1px solid var(--line-strong);border-radius:12px;overflow:hidden;background:var(--surface-2)}"+".bus-panel{position:absolute;top:10px;right:10px;z-index:5;width:min(560px,calc(100% - 20px));max-height:calc(100% - 20px);overflow:auto;margin:0!important;box-shadow:0 8px 24px rgba(0,0,0,.18)}"+".bus-panel .tksech{position:sticky;top:0;background:var(--surface);z-index:1;align-items:center;padding:10px 14px}.bus-panel .tksech>div{flex:1}.bus-panel.fold .tksecb{display:none}.bus-panel.fold .tksech{border-bottom:0}"+"@media(max-width:760px){.bus-top{grid-template-columns:1fr}.bus-hold{height:420px}.bus-panel{position:static;width:auto;max-height:none;box-shadow:none;margin-top:10px!important}}"+
".bus-map .bus-hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px}"+
".bus-mk{display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:#facc15;border:2px solid #fff;border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,.3);font-weight:900;color:#451a03;font-size:13px;white-space:nowrap}"+
".bus-mk.pass{width:22px;height:22px;background:#94a3b8;color:#fff;font-size:10px}"+
".bus-mk.st,.bus-mk.en{width:auto;border-radius:6px;padding:0 10px;color:#fff;font-size:12px}.bus-mk.st{background:#3b82f6}.bus-mk.en{background:#ef4444}"+
".bus-tip{background:rgba(255,255,255,.95);color:#333;border:1px solid #e2e8f0;border-radius:8px;padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap}.bus-tip.pass{color:#64748b}"+
".bus-sum{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0}.bus-sum div{flex:1 1 140px;border:1px solid var(--line);border-radius:10px;padding:8px 12px;background:var(--surface-2);font-size:12px;color:var(--muted)}.bus-sum b{display:block;font-size:18px;color:var(--ink)}"+
".bus-tb{width:100%;border-collapse:collapse;font-size:12.5px;margin:8px 0}.bus-tb th,.bus-tb td{border:1px solid var(--line-strong);padding:4px 6px;text-align:center;word-break:keep-all}.bus-tb th{background:var(--surface-3);font-weight:700}"+
".bus-tb td.nm{text-align:left}.bus-tb td.nm small{display:block;color:var(--muted);font-size:11px}.bus-tb tr.pass td{color:var(--muted)}.bus-tb tr.max td{color:var(--neg);font-weight:700}"+
".bus-tb .x{border:0;background:none;cursor:pointer;color:var(--muted);font:inherit;padding:2px 4px}.bus-tb .x:hover{color:var(--ink)}.bus-tb .x:disabled{opacity:.3;cursor:default}"+
".bus-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.bus-drop{border:2px dashed var(--line-strong);border-radius:10px;padding:14px;text-align:center;font-size:13px;color:var(--muted);cursor:pointer}.bus-drop.on{border-color:var(--accent);background:var(--accent-soft)}"+
"@media print{.bus-noprint{display:none!important}.bus-panel{position:static;width:auto;max-height:none;box-shadow:none}}";

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
  var S={stops:[],res:[],calc:false,veh:null,av:0,vst:[]}, map=null, items=[], seq=0;
  var msg=el("div","tkmsg");
  function say(t,k){ msg.className="tkmsg on "+(k||"ok"); msg.textContent=t; }

  /* 정류장 넣기 */
  var sec1=el("section","tksec"), h1=el("div","tksech"), b1=el("div","tksecb");
  h1.appendChild(el("div")).appendChild(el("h3",null,"1. 정류장 넣기"));
  h1.firstChild.appendChild(el("p",null,"엑셀(B열 순번, C열 약칭, D열 주소)을 넣거나 지도 빈 곳을 눌러 핀을 꽂아요. 첫 줄이 출발지, 끝 줄이 도착지예요."));
  var fi=el("input"); fi.type="file"; fi.accept=".xlsx,.xls,.csv"; fi.hidden=true;
  var drop=el("label","bus-drop","엑셀 파일을 끌어 놓거나 눌러서 고르기"); drop.appendChild(fi);
  drop.ondragover=function(e){ e.preventDefault(); drop.classList.add("on"); }; drop.ondragleave=function(){ drop.classList.remove("on"); };
  drop.ondrop=function(e){ e.preventDefault(); drop.classList.remove("on"); if(e.dataTransfer.files[0]) readXlsx(e.dataTransfer.files[0]); };
  fi.onchange=function(){ if(fi.files[0]) readXlsx(fi.files[0]); fi.value=""; };
  var g=el("div","tkgridf"), f1=el("label","tkf"), f2=el("label","tkf");
  f1.appendChild(el("span","tkfl","시간 기준")); var tt=el("select"); [["start","출발 시간"],["end","도착 시간"]].forEach(function(o){ var op=el("option",null,o[1]); op.value=o[0]; tt.appendChild(op); }); f1.appendChild(tt);
  f2.appendChild(el("span","tkfl","시각")); var ti=el("input"); ti.type="time"; ti.value="08:00"; f2.appendChild(ti);
  tt.onchange=ti.onchange=function(){ if(S.calc) calc(); };
  g.appendChild(f1); g.appendChild(f2);
  b1.appendChild(drop); b1.appendChild(g); b1.appendChild(el("p","note","승하차 정류장마다 2분 대기·200m 진입이 더해져요. '단순통과'로 바꾼 곳은 더하지 않아요."));
  sec1.appendChild(h1); sec1.appendChild(b1);

  /* 지도·결과 */
  var mapWrap=el("div","bus-map"), hold=el("div","bus-hold"), mapBox=el("div"); mapBox.id="busmap"; mapBox.style.height="100%"; hold.appendChild(mapBox); mapWrap.appendChild(hold); mapBox.appendChild(el("div","bus-hint","지도를 불러오는 중이에요…"));   /* Tmap이 지도 칸 높이를 100%로 바꾸므로 높이는 바깥 칸에 */
  var sec2=el("section","tksec bus-panel"), h2=el("div","tksech"), b2=el("div","tksecb");   /* 노선 결과: 지도 위에 띄우는 창(휴대폰은 지도 아래) */
  h2.appendChild(el("div")).appendChild(el("h3",null,"노선 결과"));
  var fold=btn("접기","btn ghost bus-noprint",function(){ var f=sec2.classList.toggle("fold"); fold.textContent=f?"펼치기":"접기"; }); fold.style.cssText="padding:3px 10px;font-size:12px"; h2.appendChild(fold);
  var acts=el("div","tkrow bus-noprint");
  acts.appendChild(btn("순서 최적화","btn ghost",optimize)); acts.appendChild(btn("경로 계산","btn",function(){ calc(); }));
  acts.appendChild(btn("엑셀로 복사","btn ghost",copyTsv)); acts.appendChild(btn("인쇄","btn ghost",function(){ window.print(); }));
  acts.appendChild(btn("모두 지우기","btn ghost",function(){ if(!S.stops.length||!confirm("정류장을 모두 지울까요?")) return; S.stops=[]; S.veh=null; S.vst=[]; dirty(); }));
  var sum=el("div","bus-sum"), tbw=el("div");
  b2.appendChild(acts); b2.appendChild(sum); b2.appendChild(tbw); sec2.appendChild(h2); sec2.appendChild(b2); mapWrap.appendChild(sec2);

  /* 차량 나누기 */
  var sec3=el("section","tksec bus-noprint"), h3=el("div","tksech"), b3=el("div","tksecb");
  h3.appendChild(el("div")).appendChild(el("h3",null,"2. 차량 나누기"));
  h3.firstChild.appendChild(el("p",null,"가까운 정류장끼리 묶어 여러 대로 나눠요. 출발지·도착지는 모든 차량이 같이 써요."));
  var vr=el("div","tkrow"), vk=el("input"); vk.type="number"; vk.min=2; vk.max=20; vk.value=2; vk.style.width="70px";
  var vc=el("input"); vc.type="number"; vc.min=1; vc.placeholder="비우면 제한 없음"; vc.style.width="140px";
  vr.appendChild(el("span","tkfl","차량")); vr.appendChild(vk); vr.appendChild(el("span","tkfl","대 · 정원")); vr.appendChild(vc); vr.appendChild(btn("자동 배분","btn",split));
  var vtabs=el("div","bus-tabs"), vtb=el("div");
  b3.appendChild(vr); b3.appendChild(el("p","note","엑셀에 '인원' 열이 있으면 정원을 인원 합계로, 없으면 정류장 수로 따져요.")); b3.appendChild(vtabs); b3.appendChild(vtb);
  sec3.appendChild(h3); sec3.appendChild(b3);

  var top=el("div","bus-top"); top.appendChild(sec1); top.appendChild(sec3);
  root.appendChild(msg); root.appendChild(top); root.appendChild(mapWrap);

  needMap().then(function(){ if(!root.isConnected) return; mapBox.textContent="";
    map=new Tmapv2.Map("busmap",{center:new Tmapv2.LatLng(35.2280,128.6811),zoom:12,zoomControl:true,scrollwheel:true,width:"100%",height:"100%"});
    map.addListener("click",function(e){ if(!e.latLng) return; var s={id:"s"+(++seq),name:"위치 찾는 중…",address:"",lat:e.latLng.lat(),lng:e.latLng.lng(),isPass:false,pax:0};
      S.stops.push(s); dirty();
      fetch(API+"geo/reversegeocoding?version=1&format=json&lat="+s.lat+"&lon="+s.lng+"&coordType=WGS84GEO&addressType=A04&appKey="+KEY).then(function(r){ return r.json(); })
        .then(function(d){ s.address=d&&d.addressInfo?d.addressInfo.fullAddress:""; s.name=s.address?shortName(s.address):"새 경유지"; draw(); })
        .catch(function(){ s.name="새 경유지"; draw(); }); });
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
  async function calc(){ var s=S.stops; if(s.length<2){ say("출발지와 도착지, 적어도 2곳이 있어야 해요.","bad"); return; }
    s[0].isPass=false; s[s.length-1].isPass=false; say("경로를 계산하는 중이에요…","warn");
    var res=[{segTime:0,segDist:0,accTime:0,accDist:0,path:[]}], at=0, ad=0, bad=0;
    for(var i=0;i<s.length-1;i++){ var r=await seg(s[i],s[i+1]), t=r.time, d=r.dist; if(r.bad) bad++;
      if(i+1<s.length-1&&!s[i+1].isPass){ t+=2; d+=0.2; }
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
  async function split(){ var k=parseInt(vk.value,10); if(S.veh) S.veh[S.av]=S.stops;
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
  function pick(i){ S.veh[S.av]=S.stops; S.av=i; S.stops=S.veh[i]; S.calc=false; calc(); }

  /* ---- 그리기 ---- */
  function move(i,d){ var s=S.stops, j=i+d; if(j<0||j>=s.length) return; var x=s[i]; s[i]=s[j]; s[j]=x; dirty(); }
  function draw(fit){
    sec2.hidden=!S.stops.length; h2.firstChild.firstChild.textContent="노선 결과 ("+S.stops.length+"곳)"+(S.veh?" — "+(S.av+1)+"호차":"");
    sum.textContent=""; [["총 소요 시간",S.calc?S.tot.time+"분":"-"],["총 이동 거리",S.calc?S.tot.dist.toFixed(1)+"km":"-"]].forEach(function(x){ var d=el("div",null,x[0]); d.appendChild(el("b",null,x[1])); sum.appendChild(d); });
    tbw.textContent="";
    if(S.stops.length){ var tb=el("table","bus-tb"), hr=tb.createTHead().insertRow();
      ["순번","약칭·주소","종류","통과 시간","누적 거리",""].forEach(function(h,i){ var th=el("th",i===5?"bus-noprint":null,h); hr.appendChild(th); });
      var body=tb.createTBody(), n=S.stops.length;
      S.stops.forEach(function(s,i){ var r=body.insertRow(), end=i===0||i===n-1, res=S.calc?S.res[i]:null; if(s.isPass) r.className="pass";
        r.insertCell().textContent=i===0?"출발":i===n-1?"도착":s.isPass?"경유":String(i+1);
        var c=r.insertCell(); c.className="nm"; c.appendChild(document.createTextNode(s.name)); c.appendChild(el("small",null,(s.guess?"⚠ 위치 확인 필요 · ":"")+s.address));
        var tc=r.insertCell(), tb2=btn(s.isPass?"단순통과":"승하차","btn ghost"); tb2.style.cssText="padding:2px 8px;font-size:12px"; tb2.disabled=end;
        tb2.onclick=function(){ s.isPass=!s.isPass; dirty(); }; tc.appendChild(tb2);
        r.insertCell().textContent=res?res.pass+" ("+res.segTime+"분)":"-";
        r.insertCell().textContent=res?res.accDist+"km ("+res.segDist+")":"-";
        var a=r.insertCell(); a.className="bus-noprint"; var up=btn("▲","x",function(){ move(i,-1); }), dn=btn("▼","x",function(){ move(i,1); }), rm=btn("×","x",function(){ S.stops.splice(i,1); dirty(); });
        up.disabled=i===0; dn.disabled=i===n-1; up.title="위로"; dn.title="아래로"; rm.title="지우기"; a.appendChild(up); a.appendChild(dn); a.appendChild(rm); });
      tbw.appendChild(tb); }
    else tbw.appendChild(el("p","note","아직 정류장이 없어요."));
    drawVeh(); drawMap(fit); }
  function drawVeh(){ vtabs.textContent=""; vtb.textContent=""; var vs=S.veh; if(!vs) return;
    vs.forEach(function(v,i){ vtabs.appendChild(btn((i+1)+"호차 ("+(v.length-2)+")",i===S.av?"btn":"btn ghost",function(){ if(i!==S.av) pick(i); })); });
    var showPax=vs.some(function(v){ return paxSum(v)>0; }), done=vs.every(function(v,i){ return S.vst[i]; }), maxT=Math.max.apply(null,S.vst.map(function(s){ return s?s.time:-1; }));
    var tb=el("table","bus-tb"), hr=tb.createTHead().insertRow(); ["차량","정류장"].concat(showPax?["인원"]:[],["시간(분)","거리(km)"]).forEach(function(h){ hr.appendChild(el("th",null,h)); });
    var body=tb.createTBody();
    function row(a,cls){ var r=body.insertRow(); if(cls) r.className=cls; a.forEach(function(x){ r.insertCell().textContent=x; }); }
    vs.forEach(function(v,i){ var s=S.vst[i]; row([(i+1)+"호차",v.length-2].concat(showPax?[paxSum(v)]:[],[s?s.time:"-",s?s.dist.toFixed(1):"-"]),done&&s&&s.time===maxT?"max":""); });
    if(done) row(["합계",vs.reduce(function(t,v){ return t+v.length-2; },0)].concat(showPax?[vs.reduce(function(t,v){ return t+paxSum(v); },0)]:[],[S.vst.reduce(function(t,s){ return t+s.time; },0),S.vst.reduce(function(t,s){ return t+s.dist; },0).toFixed(1)]));
    vtb.appendChild(tb); if(done) vtb.appendChild(el("p","note","빨간 줄 = 가장 오래 걸리는 차량(정류장마다 2분 대기 포함)")); }
  function drawMap(fit){ if(!map) return; items.forEach(function(x){ x.setMap(null); }); items=[]; var s=S.stops, n=s.length; if(!n) return;
    var B=new Tmapv2.LatLngBounds(), LL=function(p){ return new Tmapv2.LatLng(p[0],p[1]); };
    if(S.calc){ var path=[]; S.res.forEach(function(r){ r.path.forEach(function(p){ path.push(LL(p)); }); });
      if(path.length>1){ items.push(new Tmapv2.Polyline({path:path,strokeColor:"#3b82f6",strokeWeight:6,map:map})); path.forEach(function(p){ B.extend(p); }); } }
    s.forEach(function(x,i){ var p=new Tmapv2.LatLng(x.lat,x.lng), end=i===0||i===n-1; B.extend(p);
      var h=i===0?'<div class="bus-mk st">출발</div>':i===n-1?'<div class="bus-mk en">도착</div>':x.isPass?'<div class="bus-mk pass">경유</div>':'<div class="bus-mk">'+(i+1)+'</div>';
      items.push(new Tmapv2.Marker({position:p,map:map,title:x.name,iconHTML:h,iconSize:new Tmapv2.Size(end?46:x.isPass?22:28,28)}));
      items.push(new Tmapv2.Label({position:p,map:map,title:'<div class="bus-tip'+(x.isPass?" pass":"")+'">'+esc(x.name)+'</div>',offset:new Tmapv2.Point(0,end?-20:x.isPass?-10:-15)})); });
    if(fit){ try{ if(n===1) map.setCenter(new Tmapv2.LatLng(s[0].lat,s[0].lng)); else map.fitBounds(B,{margin:50}); }catch(e){} } }

  function copyTsv(){ if(!S.calc){ say("먼저 경로를 계산해 주세요.","bad"); return; } var n=S.stops.length;
    var t="순번\t약칭\t주소\t통과시간\t구간(분)\t누적(분)\t구간(km)\t누적(km)\n"+S.stops.map(function(s,i){ var r=S.res[i];
      return [i===0?"출발":i===n-1?"도착":s.isPass?"경유(통과)":i+1,s.name,s.address,r.pass,r.segTime,r.accTime,r.segDist,r.accDist].join("\t"); }).join("\n");
    navigator.clipboard.writeText(t).then(function(){ say("복사했어요. 엑셀에 붙여 넣으세요.","ok"); },function(){ say("복사하지 못했어요.","bad"); }); }
}
window.TKNATIVE=window.TKNATIVE||{}; window.TKNATIVE.bus=build;
})();
