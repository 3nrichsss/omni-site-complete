(() => {
const DATA=window.ORBIS_DATA;
const TOPO=window.ORBIS_TOPO;
const FLAGS=window.ORBIS_FLAGS;
const ALLC=window.ORBIS_ALLC;
const YEARS=DATA.years,NOW_IDX=YEARS.indexOf(2026),LAST=YEARS.length-1;
const C=DATA.countries,WD=DATA.world,WORLD=WD.pop,WGR=WD.gr;
const KEYS=Object.keys(C).sort((a,b)=>C[b].pop[NOW_IDX]-C[a].pop[NOW_IDX]);
const BIG3=["india","china","united-states"];
const FLAGURI={};Object.entries(FLAGS).forEach(([k,v])=>FLAGURI[k]=v.startsWith("data:")||v.startsWith("/")?v:"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(v));
KEYS.forEach((k,i)=>{const c=C[k];c.rank=i+1;c.code=c.cca2.toLowerCase();c.density=Math.round(c.pop[NOW_IDX]/c.land)});
// Worldometer urban-area lists for the original three pages
C.india.cities=[["New Delhi",30222405],["Kolkata",22549738],["Mumbai",20203056],["Bengaluru",13187098],["Chennai",11153205],["Hajipur",9941510],["Hyderabad",9190795],["Ahmedabad",7632408],["Surat",6908925],["Pune",6817951]];
C.china.cities=[["Shanghai",29558908],["Guangzhou",27563372],["Beijing",17013303],["Shenzhen",13878396],["Suzhou",7731101],["Hangzhou",7500208],["Wuhan",7363548],["Tianjin",7285342],["Chongqing",7071073],["Nanjing",6800676]];
C["united-states"].cities=[["New York City",13920148],["Los Angeles",12740420],["Houston",3955046],["Chicago",3683385],["Washington, D.C.",3270018],["San Francisco",3163486],["Miami",2912486],["Denver",2265994],["Philadelphia",2232420],["Las Vegas",2183655]];
BIG3.forEach(k=>C[k].citySrc="Worldometer (urban areas, 2025)");
C.india.capital="New Delhi";C.china.capTz="Asia/Shanghai";

const CATS=[
 {id:"population",n:"Population",d:"Live counts, growth, migration, age"},
 {id:"economy",n:"Economy",d:"GDP, growth, inflation, trade"},
 {id:"energy",n:"Energy",d:"Consumption and electricity mix"},
 {id:"environment",n:"Environment",d:"CO₂, greenhouse gases, air quality"},
 {id:"health",n:"Health",d:"Life expectancy, spending, care"},
 {id:"food",n:"Food & Agriculture",d:"Crops, yields, nutrition, farm jobs"},
 {id:"water",n:"Water",d:"Withdrawals, access, stress"},
 {id:"education",n:"Education",d:"Literacy, enrolment, spending"},
 {id:"technology",n:"Technology",d:"Internet, mobile, R&D, patents"},
 {id:"society",n:"Society & Media",d:"Age structure, cities, languages"},
 {id:"government",n:"Government",d:"Military, institutions"},
 {id:"transport",n:"Transport",d:"Air, rail, shipping, road safety"},
 {id:"biodiversity",n:"Biodiversity",d:"Protected areas, forests, species"},
 {id:"geography",n:"Geography",d:"Area, borders, elevation"},
 {id:"space",n:"Space & Science",d:"Launches, research, milestones"},
 {id:"time",n:"Time & Calendar",d:"Time zones, daylight, clocks"}
];

/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s);
const root=document.documentElement;
const css=(v,el=root)=>getComputedStyle(el).getPropertyValue(v).trim();
const fmt=n=>Math.round(n).toLocaleString("en-US");
const short=n=>{const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(2)+"B":a>=1e6?(n/1e6).toFixed(1)+"M":a>=1e3?(n/1e3).toFixed(0)+"K":String(n)};
const signed=n=>(n>0?"+":"")+fmt(n);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function hex2rgb(h){h=h.replace("#","");if(h.length===3)h=h.split("").map(c=>c+c).join("");const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}
function alpha(hex,a){if(!hex||hex[0]!=="#")return hex;const [r,g,b]=hex2rgb(hex);return `rgba(${r},${g},${b},${a})`}
function rgb2hsl(hex){let [r,g,b]=hex2rgb(hex).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}return [h,s,l]}
function hsl2hex(h,s,l){h=((h%1)+1)%1;const f=n=>{const k=(n+h*12)%12;const a=s*Math.min(l,1-l);const c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(c*255).toString(16).padStart(2,"0")};return "#"+f(0)+f(8)+f(4)}
const lum=hex=>{const [r,g,b]=hex2rgb(hex);return (.2126*r+.7152*g+.0722*b)/255};
const isDark=()=>lum(css("--bg")||"#ffffff")<.45;
function adj(hex,dark){let [h,s,l]=rgb2hsl(hex);l=dark?Math.max(l,.6):Math.min(l,.5);return hsl2hex(h,s,l)}
const textOn=hex=>lum(hex)>.55?"#14141A":"#FFFFFF";
const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const nmK=k=>k==="world"?"World":C[k].name;
function flag(k,w=40){const c=C[k];if(!c||!FLAGURI[c.code])return "";return `<img class="flag" src="${FLAGURI[c.code]}" width="${w}" height="${Math.round(w*.75)}" alt="">`}
const pS=v=>(v>=10?v.toFixed(1):v>=1?v.toFixed(2):v>=.01?v.toFixed(3):"<0.01")+"%";
function divColor(v,a=1){if(v==null)return alpha(css("--muted"),.25);if(v<0){const t=Math.min(-v/1,1);return `hsla(${205+20*t},80%,${60-16*t}%,${a})`}const t=Math.min(v/2.7,1);return `hsla(${52-52*t},85%,${58-12*t}%,${a})`}

/* ---------- colours ---------- */
const REGION_H={Asia:.95,Africa:.07,Europe:.6,Americas:.43,Oceania:.76};
const FIXED={india:"#FF8A00",china:"#F0145A","united-states":"#2F6BFF"};
const XB=["#FF8A00","#F0145A","#2F6BFF","#00B37E","#9B51E0","#FFC800"];
let COL={},REGCOL={},GCOL={};
function applyTheme(){const d=isDark(),n={};
 let gi=0;KEYS.forEach(k=>{const c=C[k];let hex=FIXED[k];if(!hex){gi++;hex=hsl2hex(.13+gi*.381966,.72+((gi%2)*.12),.44+((gi%3)-1)*.07)}COL[k]=adj(hex,d);
  const i=(n[c.region]=(n[c.region]||0)+1);GCOL[k]=adj(hsl2hex((REGION_H[c.region]??.5)+(((i*.381)%1)-.5)*.08,.7,.5+((i%3)-1)*.08),d)});
 COL.world=adj("#8A8FA3",d);COL.x=XB.map(c=>adj(c,d));
 Object.entries(REGION_H).forEach(([r,h])=>REGCOL[r]=adj(hsl2hex(h,.72,.52),d));
 if(window.Chart){Chart.defaults.font.family=css("--f-body");Chart.defaults.color=css("--muted")}
 const b=$("#theme-btn");if(b){b.innerHTML=d?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';b.setAttribute("aria-label",d?"Switch to light mode":"Switch to dark mode")}}
const catCol=i=>adj(hsl2hex(i/CATS.length,.75,.5),isDark());
$("#theme-btn").addEventListener("click",()=>{const t=isDark()?"light":"dark";root.setAttribute("data-theme",t);try{localStorage.setItem("omni-theme",t)}catch(e){}});

/* ---------- live counters ---------- */
const T0=Date.UTC(2026,6,1),YR=365.2425*864e5;
const WORLD_CHANGE=WD.change;
const wm=(id,mult=1)=>WD.m[id]?WD.m[id][0]*mult:0;
const RATES={births:WD.births,deaths:WD.deaths,growth:WD.births-WD.deaths,co2:wm("en.ghg.co2.mt.ce.ar5",1e6),ghg:wm("en.ghg.all.mt.ce.ar5",1e6),elec:wm("eg.use.elec.kh.pc")*WORLD[NOW_IDX]/1000,gdp:wm("ny.gdp.mktp.cd"),mil:wm("ms.mil.xpnd.cd"),pat:wm("ip.pat.resd"),art:wm("ip.jrn.artc.sc"),cer:wm("ag.prd.crel.mt"),wat:wm("er.h2o.fwtl.k3",1e9),air:wm("is.air.psgr"),teu:wm("is.shp.good.tu"),launch:329};
const STOCK={inet:wm("it.net.user.zs")/100,under:wm("sn.itk.defc.zs")/100};
function liveVal(key){const t=Date.now();
 if(key==="world")return WORLD[NOW_IDX]+WORLD_CHANGE*(t-T0)/YR;
 if(C[key])return C[key].pop[NOW_IDX]+C[key].change*(t-T0)/YR;
 const d=new Date(),y0=new Date(d.getFullYear(),0,1).getTime(),d0=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),per=ms=>ms/YR;
 const [base,span]=key.split(":");
 if(RATES[base]!=null)return RATES[base]*per(t-(span==="today"?d0:y0));
 if(STOCK[base])return STOCK[base]*liveVal("world");return 0}
function paintCounter(el){const v=(el.dataset.pre||"")+fmt(liveVal(el.dataset.live));
 if(el.classList.contains("bignum")&&el.dataset.style!=="digital"){el.classList.add("odo");el.innerHTML=[...v].map(ch=>ch===","?'<span class="sep"></span>':`<span class="digit">${ch}</span>`).join("")}
 else{el.classList.remove("odo");el.textContent=v}}
setInterval(()=>document.querySelectorAll("[data-live]").forEach(paintCounter),250);

/* ---------- chart system ---------- */
let charts=[],timers=[],resizers=[];
window.addEventListener("resize",()=>resizers.forEach(f=>f()));
function cleanup(){charts.forEach(c=>c.destroy());charts=[];timers.forEach(f=>f());timers=[];resizers=[]}
if(window.Chart){Chart.register({id:"glow",beforeDatasetDraw(ch,a){const ds=ch.data.datasets[a.index];if(!ds._glow)return;ch.ctx.save();ch.ctx.shadowColor=ds._c;ch.ctx.shadowBlur=14},afterDatasetDraw(ch,a){if(ch.data.datasets[a.index]._glow)ch.ctx.restore()}})}
const tipStyle=()=>({backgroundColor:css("--surface"),titleColor:css("--ink"),bodyColor:css("--ink"),borderColor:css("--line"),borderWidth:2,padding:10,usePointStyle:true,boxPadding:4,titleFont:{family:css("--f-mono"),weight:"600"},bodyFont:{family:css("--f-mono")}});
function axis(a={}){return {grid:{color:css("--grid"),drawTicks:false},border:{display:false},...a,ticks:{padding:6,color:css("--muted"),...(a.ticks||{})},title:a.title?{color:css("--muted"),...a.title}:undefined}}
function O({x={},y={},y1=null,legend=false,cb={},extra={}}={}){const sc={x:axis(x),y:axis(y)};if(y1)sc.y1=axis(y1);
 return {responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},animation:{duration:650,easing:"easeOutCubic"},
  plugins:{legend:legend?{display:true,position:"bottom",labels:{boxWidth:9,boxHeight:9,usePointStyle:true,color:css("--ink"),padding:12}}:{display:false},tooltip:{...tipStyle(),callbacks:cb}},scales:sc,...extra}}
function mk(id,cfg){const el=document.getElementById(id);if(!el||!window.Chart)return null;const ch=new Chart(el,cfg);charts.push(ch);return ch}
function redraw(id,fn){const i=charts.findIndex(c=>c.canvas.id===id);if(i>-1){charts[i].destroy();charts.splice(i,1)}fn()}
const vGrad=(c,a0,a1)=>ctx=>{const ch=ctx.chart,a=ch.chartArea;if(!a)return alpha(c,a0);const g=ch.ctx.createLinearGradient(0,a.top,0,a.bottom);g.addColorStop(0,alpha(c,a0));g.addColorStop(1,alpha(c,a1));return g};
const RR=()=>8;
const band={id:"band",beforeDatasetsDraw(ch){const x=ch.scales.x;if(!x)return;const a=ch.chartArea;let px;
 if(x.type==="category"){const L=ch.data.labels||[],ix=L.indexOf(2026);if(ix<0||ix>=L.length-1)return;px=(x.getPixelForValue(ix)+x.getPixelForValue(ix+1))/2}else px=x.getPixelForValue(2026);
 if(!(px>a.left&&px<a.right))return;const c=ch.ctx,ink=css("--ink");c.save();c.fillStyle=alpha(ink,.05);c.fillRect(px,a.top,a.right-px,a.bottom-a.top);
 c.strokeStyle=alpha(ink,.4);c.setLineDash([3,3]);c.beginPath();c.moveTo(px,a.top);c.lineTo(px,a.bottom);c.stroke();c.setLineDash([]);
 if(a.right-px>90){c.fillStyle=css("--muted");c.font="11px "+css("--f-mono");c.fillText("UN projection →",px+6,a.top+13)}c.restore()}};
function tsChart(id,sets,o={}){
 sets=sets.filter(s=>s.pts.some(p=>p[1]!=null));if(!sets.length)return null;
 const style=o.style||(sets.length===1?"bar":"area"),fv_=o.fmt||(v=>v),multi=sets.length>1;
 const col=s=>s.c||COL[s.k],dim=s=>!!(o.focus&&s.k!==o.focus&&s.k!=="world");
 const xs=[...new Set(sets.flatMap(s=>s.pts.map(p=>p[0])))].sort((a,b)=>a-b),span=xs[xs.length-1]-xs[0];
 const label=c=>` ${c.dataset.label}: ${(o.tip||fv_)(c.parsed.y)}`,plugins=o.forecast?[band]:[];
 const yAx={beginAtZero:o.zero!==false,min:o.min,max:o.max,ticks:{callback:v=>fv_(v),maxTicksLimit:o.mini?4:7},title:o.yTitle?{display:true,text:o.yTitle}:undefined};
 if(style==="bar"){
  const ds=sets.map(s=>{const c=col(s),m=new Map(s.pts);return {label:s.label,data:xs.map(x=>m.has(x)?m.get(x):null),
   backgroundColor:ctx=>{const x=xs[ctx.dataIndex];return (o.forecast&&x>2026)||dim(s)?alpha(c,.35):vGrad(c,1,.55)(ctx)},borderColor:css("--line"),borderWidth:multi?0:1.5,borderRadius:6,maxBarThickness:24}});
  return mk(id,{type:"bar",data:{labels:xs,datasets:ds},plugins,options:O({x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:9}},y:yAx,legend:multi,cb:{label}})});
 }
 const ds=sets.map(s=>{const c=col(s),d=dim(s),w=s.k==="world"&&multi;return {label:s.label,data:s.pts.filter(p=>p[1]!=null).map(([x,y])=>({x,y})),_c:c,
  borderColor:d?alpha(c,.75):c,borderDash:w?[4,3]:undefined,
  backgroundColor:d||w||(multi&&!o.focus&&sets.length>2)?"transparent":vGrad(c,multi?.28:.5,0),fill:d||w||(multi&&!o.focus&&sets.length>2)?false:"origin",borderWidth:d?1.8:3,tension:.32,
  pointRadius:0,pointBackgroundColor:c,pointBorderColor:c,pointHoverRadius:6,pointHoverBorderColor:css("--surface"),pointHoverBorderWidth:2,
  segment:o.forecast?{borderDash:q=>q.p0.parsed.x>=2026?[5,4]:undefined}:undefined}});
 const step=o.step||(span>60?10:span>20?5:2);
 return mk(id,{type:"line",data:{datasets:ds},plugins,options:O({x:{type:"linear",min:xs[0],max:xs[xs.length-1],ticks:{stepSize:step,callback:v=>v}},y:yAx,legend:multi,
  cb:{title:i=>String(i[0].parsed.x)+(o.forecast&&i[0].parsed.x>2026?" · projection":""),label}})});
}
function popSeries(k,metric){return k==="world"?(WD[metric]||null):C[k][metric]}
function seriesChart(id,keys,metric,o={}){const pct=metric==="shr"||metric==="urb"||metric==="gr";
 return tsChart(id,keys.filter(k=>popSeries(k,metric)).map(k=>({k,label:nmK(k),pts:YEARS.map((y,i)=>[y,popSeries(k,metric)[i]])})),
  {tip:metric==="pop"?fmt:undefined,fmt:v=>metric==="pop"?short(v):(+v).toFixed(metric==="fer"?2:1).replace(/\.0+$/,"")+(pct?"%":""),forecast:metric!=="urb",zero:metric==="pop"&&o.zero!==false,focus:o.focus,step:10,style:o.style})}

/* ---------- metrics ---------- */
const MD={};
function big(v){const a=Math.abs(v);return a>=1e12?(v/1e12).toFixed(2)+"T":a>=1e9?(v/1e9).toFixed(a>=1e11?0:a>=1e10?1:2)+"B":a>=1e6?(v/1e6).toFixed(1)+"M":a>=1e4?(v/1e3).toFixed(0)+"K":fmt(v)}
function fv(m,v){if(v==null)return "n/a";if(m.lt&&v<=m.lt)return "<"+m.lt+"%";const u=m.u?" "+m.u:"";
 switch(m.f){case"usd":return "$"+big(v);case"big":return big(v)+u;case"pct":return (m.sign&&v>0?"+":"")+(+v).toFixed(m.dp??1)+"%";case"d":return (+v).toFixed(m.dp??1)+u;default:return fmt(v)+u}}
function def(id,cat,n,f,u,get,src,o={}){const m={id,cat,n,f,u,src,v:{},y:{},...o};
 [...KEYS,"world"].forEach(k=>{let r=null;if(typeof get==="string"){r=k==="world"?WD.m[get]:C[k].m[get]}else r=get(k);
  if(r&&r[0]!=null&&isFinite(r[0])){m.v[k]=r[0]*(o.mult||1);m.y[k]=r[1]}else{m.v[k]=null;m.y[k]=null}});MD[id]=m}
const WB="World Bank",UN="UN WPP 2024",ow=(k)=>k==="world"?WD:C[k];
const P=(k,f)=>{const c=ow(k);return c[f]?[c[f][NOW_IDX],2026]:null};
// population
def("pop","population","Population","big","",k=>P(k,"pop"),UN,{tot:1});
def("popgr","population","Population growth per year","pct","",k=>P(k,"gr"),UN,{sign:1,dp:2});
def("fert","population","Fertility rate (children per woman)","d","",k=>P(k,"fer"),UN,{dp:2});
def("medage","population","Median age","d","yrs",k=>P(k,"med"),UN);
def("dens","population","Population density","int","per km²",k=>k==="world"?null:[C[k].density,2026],UN+" · "+WB);
def("netmig","population","Net migration per year","int","",k=>k==="world"?null:P(k,"mig"),UN);
def("le","health","Life expectancy","d","yrs",k=>P(k,"le"),UN);
def("infant","population","Infant deaths per 1,000 births","d","","sp.dyn.imrt.in",WB);
// economy
def("gdp","economy","GDP (nominal)","usd","","ny.gdp.mktp.cd",WB,{tot:1});
def("gdpppp","economy","GDP at purchasing-power parity","usd","","ny.gdp.mktp.pp.cd",WB,{tot:1});
def("gdppc","economy","GDP per person","usd","","ny.gdp.pcap.cd",WB);
def("growth","economy","Real GDP growth","pct","","ny.gdp.mktp.kd.zg",WB,{sign:1});
def("infl","economy","Inflation (consumer prices)","pct","","fp.cpi.totl.zg",WB);
def("unemp","economy","Unemployment rate","pct","","sl.uem.totl.zs",WB+" (ILO)");
def("exp","economy","Exports, % of GDP","pct","","ne.exp.gnfs.zs",WB);
def("imp","economy","Imports, % of GDP","pct","","ne.imp.gnfs.zs",WB);
def("ind_gdp","economy","Industry, % of GDP","pct","","nv.ind.totl.zs",WB);
def("srv_gdp","economy","Services, % of GDP","pct","","nv.srv.totl.zs",WB);
const DEBT={india:[80.4,75.8],china:[96.3,116.0],"united-states":[122.5,128.2]};
def("debt","economy","Government debt, % of GDP","pct","",k=>DEBT[k]?[DEBT[k][0],2025]:null,"IMF WEO",{note:"so far for India, China and the US"});
// energy
def("elec_pc","energy","Electricity use per person","int","kWh","eg.use.elec.kh.pc",WB);
def("eng_pc","energy","Energy use per person","int","kgoe","eg.use.pcap.kg.oe",WB);
def("ren_elec","energy","Renewable electricity share","pct","",k=>ow(k).ren!=null?[ow(k).ren,ow(k).mixY]:null,"Ember via OWID");
def("lowc","energy","Low-carbon electricity share","pct","",k=>ow(k).lowc!=null?[ow(k).lowc,ow(k).mixY]:null,"Ember via OWID",{note:"renewables plus nuclear"});
def("access","energy","Access to electricity","pct","","eg.elc.accs.zs",WB);
def("ren_fin","energy","Renewables in final energy use","pct","","eg.fec.rnew.zs",WB,{note:"includes traditional biomass such as wood"});
// environment
def("co2","environment","CO₂ emissions","big","t","en.ghg.co2.mt.ce.ar5",WB+" (EDGAR)",{tot:1,mult:1e6});
def("co2pc","environment","CO₂ per person","d","t","en.ghg.co2.pc.ce.ar5",WB+" (EDGAR)");
def("ghg","environment","All greenhouse gases","big","t CO₂e","en.ghg.all.mt.ce.ar5",WB+" (EDGAR)",{tot:1,mult:1e6});
def("pm25","environment","Air pollution (PM2.5)","d","µg/m³","en.atm.pm25.mc.m3",WB,{ref:5,refl:"WHO guideline: 5 µg/m³"});
def("forest","biodiversity","Forest cover, % of land","pct","","ag.lnd.frst.zs",WB+" (FAO)");
// health
def("le_f","health","Life expectancy, women","d","yrs",k=>[ow(k).lef,2026],UN);
def("le_m","health","Life expectancy, men","d","yrs",k=>[ow(k).lem,2026],UN);
def("hexp_gdp","health","Health spending, % of GDP","pct","","sh.xpd.chex.gd.zs",WB+" (WHO)");
def("hexp_pc","health","Health spending per person","usd","","sh.xpd.chex.pc.cd",WB+" (WHO)");
def("phys","health","Doctors per 1,000 people","d","","sh.med.phys.zs",WB,{dp:2});
def("beds","health","Hospital beds per 1,000 people","d","","sh.med.beds.zs",WB,{dp:2});
def("mmr","health","Maternal deaths per 100,000 births","int","","sh.sta.mmrt",WB+" (WHO)");
def("measles","health","Children vaccinated against measles","pct","","sh.imm.meas",WB+" (WHO/UNICEF)",{dp:0});
// food
def("arable","food","Arable land, % of land area","pct","","ag.lnd.arbl.zs",WB+" (FAO)");
def("cereal","food","Cereal production","big","t","ag.prd.crel.mt",WB+" (FAO)",{tot:1});
def("yield","food","Cereal yield","int","kg/ha","ag.yld.crel.kg",WB+" (FAO)");
def("under","food","Undernourished people","pct","","sn.itk.defc.zs",WB+" (FAO)",{lt:2.5});
def("agri_emp","food","Workers in agriculture","pct","","sl.agr.empl.zs",WB+" (ILO)");
def("agri_gdp","food","Agriculture, % of GDP","pct","","nv.agr.totl.zs",WB);
// water
def("wd","water","Fresh water withdrawn per year","big","m³","er.h2o.fwtl.k3",WB+" (FAO)",{tot:1,mult:1e9});
def("stress","water","Water stress","pct","","er.h2o.fwst.zs",WB+" (FAO)",{note:"withdrawals as % of available water"});
def("renew_pc","water","Renewable water per person","int","m³","er.h2o.intr.pc",WB+" (FAO)",{ref:1700,refl:"Falkenmark stress line: 1,700 m³"});
def("water","water","Basic drinking water access","pct","","sh.h2o.basw.zs",WB+" (WHO/UNICEF)");
def("sanit","water","Safely managed sanitation","pct","","sh.sta.smss.zs",WB+" (WHO/UNICEF)");
def("wag","water","Water used by agriculture","pct","","er.h2o.fwag.zs",WB,{hide:1});
def("win","water","Water used by industry","pct","","er.h2o.fwin.zs",WB,{hide:1});
// education
def("lit","education","Adult literacy","pct","","se.adt.litr.zs",WB+" (UNESCO)",{note:"many high-income countries do not report it"});
def("prim","education","Primary enrolment (gross)","pct","","se.prm.enrr",WB+" (UNESCO)");
def("sec","education","Secondary enrolment (gross)","pct","","se.sec.enrr",WB+" (UNESCO)");
def("ter","education","University enrolment (gross)","pct","","se.ter.enrr",WB+" (UNESCO)");
def("edu","education","Education spending, % of GDP","pct","","se.xpd.totl.gd.zs",WB+" (UNESCO)");
def("ptr","education","Pupils per teacher (primary)","d","","se.prm.enrl.tc.zs",WB+" (UNESCO)");
// technology
def("inet","technology","Internet users","pct","","it.net.user.zs",WB+" (ITU)");
def("inet_n","technology","People online","big","",k=>{const r=ow(k).m["it.net.user.zs"];return r?[r[0]/100*ow(k).pop[YEARS.indexOf(2025)],r[1]]:null},"ITU share × UN population",{tot:1});
def("mobile","technology","Mobile subscriptions per 100 people","d","","it.cel.sets.p2",WB+" (ITU)",{dp:0});
def("bband","technology","Fixed broadband per 100 people","d","","it.net.bbnd.p2",WB+" (ITU)");
def("rd","technology","R&D spending, % of GDP","pct","","gb.xpd.rsdv.gd.zs",WB+" (UNESCO)",{dp:2});
def("resr","technology","Researchers per million people","int","","sp.pop.scie.rd.p6",WB+" (UNESCO)");
def("patents","technology","Patent applications by residents","big","","ip.pat.resd",WB+" (WIPO)",{tot:1});
def("hitech","technology","High-tech share of manufactured exports","pct","","tx.val.tech.mf.zs",WB);
// society
def("age0","society","Children under 15","pct","",k=>[ow(k).a0,2025],UN);
def("age65","society","People aged 65 and over","pct","",k=>[ow(k).a65,2025],UN);
def("urban","society","Urban population","pct","","sp.urb.totl.in.zs",WB+" (UN WUP)");
const HH={india:[4.4,2021],china:[2.62,2020],"united-states":[2.5,2024]};
def("hh","society","People per household","d","",k=>HH[k]||null,"NFHS-5 · 2020 census · US Census Bureau",{dp:1,note:"so far for India, China and the US"});
// government
def("mil","government","Military spending","usd","","ms.mil.xpnd.cd",WB+" (SIPRI)",{tot:1});
def("milgdp","government","Military spending, % of GDP","pct","","ms.mil.xpnd.gd.zs",WB+" (SIPRI)",{dp:2});
def("forces","government","Armed forces personnel","big","","ms.mil.totl.p1",WB+" (IISS)",{tot:1});
// transport
def("air","transport","Air passengers per year","big","","is.air.psgr",WB+" (ICAO)",{tot:1});
def("air_pc","transport","Flights per person per year","d","",k=>{const r=ow(k).m["is.air.psgr"];return r?[r[0]/ow(k).pop[YEARS.indexOf(2023)],r[1]]:null},"passengers ÷ population",{dp:2});
def("rail","transport","Rail network","int","km","is.rrs.totl.km",WB+" (UIC)");
def("teu","transport","Container port traffic","big","TEU","is.shp.good.tu",WB,{tot:1});
def("road","transport","Road deaths per 100,000 people","d","","sh.sta.traf.p5",WB+" (WHO)");
// biodiversity
def("prot","biodiversity","Protected areas, % of territory","pct","","er.ptd.totl.zs",WB+" (UNEP-WCMC)",{note:"land and sea"});
def("mprot","biodiversity","Marine protected areas","pct","","er.mrn.ptmr.zs",WB+" (UNEP-WCMC)");
const THRK=["en.mam.thrd.no","en.bir.thrd.no","en.fsh.thrd.no","en.hpt.thrd.no"];
def("thr","biodiversity","Threatened species (4 groups)","int","",k=>{if(k==="world")return null;const r=THRK.map(i=>C[k].m[i]);return r.every(Boolean)?[r.reduce((a,b)=>a+b[0],0),r[0][1]]:null},WB+" (IUCN)");
// geography
const CIA="CIA World Factbook";
const GEO3={india:{coast:7000,high:8586,low:-2.2,mean:160,hn:"Kangchenjunga",ln:"Kuttanad"},china:{coast:14500,high:8849,low:-154,mean:1840,hn:"Mount Everest",ln:"Turpan Depression"},"united-states":{coast:19924,high:6190,low:-86,mean:760,hn:"Denali",ln:"Death Valley"}};
def("area","geography","Total area","int","km²",k=>k==="world"?null:[C[k].area,null],"world-countries");
def("landarea","geography","Land area","int","km²","ag.lnd.totl.k2",WB);
def("nbr","geography","Neighbouring countries","int","",k=>k==="world"?null:[C[k].borders.length,null],"world-countries");
def("coast","geography","Coastline","int","km",k=>GEO3[k]?[GEO3[k].coast,null]:null,CIA,{note:"so far for India, China and the US"});
def("high","geography","Highest point","int","m",k=>GEO3[k]?[GEO3[k].high,null]:null,CIA,{note:"so far for India, China and the US"});
// space
const LAUNCH={"united-states":181,china:92,russia:17,india:5};
def("launch","space","Orbital launches in 2025","int","",k=>k==="world"?[329,2025]:LAUNCH[k]!=null?[LAUNCH[k],2025]:null,"J. McDowell launch log",{tot:1,note:"listed for the four largest launchers"});
def("articles","space","Scientific articles","big","","ip.jrn.artc.sc",WB+" (NSF)",{tot:1});
const yOf=(m,k)=>m.y[k];
function yRange(m,ks){const ys=(ks||Object.keys(m.y)).map(k=>m.y[k]).filter(Boolean);if(!ys.length)return "";const a=Math.min(...ys),b=Math.max(...ys);return a===b?String(a):a+"–"+b}
const HIGH=new Set("gdp gdpppp gdppc growth access ren_fin ren_elec lowc le le_f le_m hexp_pc phys beds measles yield water sanit lit ter edu inet inet_n mobile bband rd resr patents hitech articles prot mprot forest launch".split(" "));
const LOW=new Set("unemp debt co2pc pm25 mmr under stress ptr road infant".split(" "));
const dirOf=id=>HIGH.has(id)?1:LOW.has(id)?-1:0;
const metricsOf=cat=>Object.values(MD).filter(m=>m.cat===cat&&!m.hide);
function ranked(m){const d=dirOf(m.id);return KEYS.filter(k=>m.v[k]!=null).sort((a,b)=>d<0?m.v[a]-m.v[b]:m.v[b]-m.v[a])}

/* ---------- fixed facts for the original three ---------- */
const FACTS3={
 gov:{"System":{india:"Federal parliamentary republic",china:"Unitary one-party socialist republic","united-states":"Federal presidential republic"},
  "Main divisions":{india:"28 states, 8 union territories",china:"22 provinces*, 5 autonomous regions, 4 municipalities, 2 special administrative regions","united-states":"50 states, 1 federal district, 5 inhabited territories"},
  "Legislature":{india:"Parliament: Lok Sabha (543) and Rajya Sabha (up to 250)",china:"National People's Congress (about 3,000 deputies)","united-states":"Congress: House (435) and Senate (100)"},
  "Independence or founding":{india:"15 August 1947",china:"1 October 1949 (People's Republic)","united-states":"4 July 1776"},"Current constitution":{india:"1950",china:"1982","united-states":"1789"}},
 space:{"Space agency":{india:"ISRO (founded 1969)",china:"CNSA (founded 1993)","united-states":"NASA (founded 1958)"},"First satellite":{india:"Aryabhata, 1975 (Soviet launch)",china:"Dong Fang Hong 1, 1970","united-states":"Explorer 1, 1958"},
  "First person in space":{india:"Rakesh Sharma, 1984 (Soviet Soyuz)",china:"Yang Liwei, 2003 (Shenzhou 5)","united-states":"Alan Shepard, 1961"},"Moon landing":{india:"Chandrayaan-3, 2023 (robotic)",china:"Chang'e 3, 2013 (robotic)","united-states":"Apollo 11, 1969 (crewed)"},
  "Mars":{india:"Mangalyaan orbiter, 2014",china:"Zhurong rover, 2021","united-states":"Viking 1 lander, 1976"},"Space station":{india:"Bharatiya Antariksh Station planned",china:"Tiangong, completed 2022","united-states":"International Space Station partner"}},
 time:{"Official time zones":{india:"1: IST (UTC+5:30)",china:"1: China Standard Time (UTC+8), across about 5 geographic zones","united-states":"6 across the states, 9 with territories"},"Date format":{india:"DD/MM/YYYY",china:"YYYY-MM-DD","united-states":"MM/DD/YYYY"},
  "Calendars in use":{india:"Gregorian; Indian national (Saka) calendar",china:"Gregorian; Chinese lunisolar calendar for festivals","united-states":"Gregorian"}},
 society:{"Official language(s)":{india:"Hindi and English; 22 scheduled languages",china:"Standard Chinese (Putonghua)","united-states":"English (designated by executive order in 2025)"}}};
const MS={"united-states":[[1958,"Explorer 1, first US satellite; NASA founded"],[1961,"Alan Shepard, first American in space"],[1962,"John Glenn orbits Earth"],[1969,"Apollo 11: first crewed Moon landing"],[1976,"Viking 1 lands on Mars"],[1990,"Hubble Space Telescope launched"]],
 china:[[1970,"Dong Fang Hong 1, first Chinese satellite"],[2003,"Yang Liwei, first Chinese astronaut"],[2013,"Chang'e 3 lands on the Moon"],[2019,"Chang'e 4: first landing on the Moon's far side"],[2021,"Zhurong rover lands on Mars"],[2022,"Tiangong space station completed"]],
 india:[[1969,"ISRO founded"],[1975,"Aryabhata, first Indian satellite"],[1980,"Rohini: first launch on an Indian rocket"],[1984,"Rakesh Sharma flies on Soyuz T-11"],[2014,"Mangalyaan reaches Mars orbit"],[2023,"Chandrayaan-3 lands near the lunar south pole"]]};
const US_ZONES=[["Washington, D.C. (Eastern)","America/New_York",38.9,-77.04],["Chicago (Central)","America/Chicago",41.88,-87.63],["Denver (Mountain)","America/Denver",39.74,-104.99],["Los Angeles (Pacific)","America/Los_Angeles",34.05,-118.24],["Anchorage (Alaska)","America/Anchorage",61.22,-149.9],["Honolulu (Hawaii)","Pacific/Honolulu",21.31,-157.86]];

/* ---------- selection (which countries a page compares) ---------- */
const PEERSEL={};let CATSEL=KEYS.slice(0,5),SHOWW=true;
function peersOf(k){const c=C[k];const same=KEYS.filter(x=>x!==k&&C[x].region===c.region);const rest=KEYS.filter(x=>x!==k&&!same.includes(x));return [...same.slice(0,4),...rest].slice(0,6)}
function selFor(f){if(f){if(!PEERSEL[f])PEERSEL[f]=peersOf(f).slice(0,2);return [f,...PEERSEL[f]]}return CATSEL}
function selBar(f){const sel=selFor(f),sugg=f?peersOf(f):KEYS.slice(0,10),extra=sel.filter(k=>k!==f&&!sugg.includes(k));
 return `<div class="selbar"><span class="label">${f?"Compare "+esc(C[f].name)+" with":"Countries shown"}</span>
 ${[...sugg,...extra].map(k=>`<button class="chip" data-selk="${k}" aria-pressed="${sel.includes(k)}">${flag(k,18)}${esc(C[k].name)}</button>`).join("")}
 <button class="chip" data-selw="1" aria-pressed="${SHOWW}"><i style="background:${COL.world}"></i>World</button>
 <div class="search" data-search data-mode="sel"><input type="search" placeholder="Add a country…" autocomplete="off" aria-label="Add a country to the comparison"><ul hidden></ul></div>${!f&&!sel.length?`<span class="muted" style="font-size:.82rem">${SHOWW?"Showing world figures only.":"Pick a country or the World to fill the charts."}</span>`:""}</div>`}
function toggleSel(k,f){if(k===f)return;if(f){const a=PEERSEL[f]||[];PEERSEL[f]=a.includes(k)?a.filter(x=>x!==k):[...a,k].slice(-6)}else{CATSEL=CATSEL.includes(k)?CATSEL.filter(x=>x!==k):[...CATSEL,k].slice(-8)}}
let CUR_F=null;
document.addEventListener("click",e=>{const t=e.target.closest("[data-selk],[data-selw]");if(!t)return;if(t.dataset.selw)SHOWW=!SHOWW;else toggleSel(t.dataset.selk,CUR_F);route(true)});

/* ---------- search ---------- */
function searchHits(q){q=norm(q.trim());if(!q)return [];const pages=[],others=[];
 ALLC.forEach(([name,ccn,slug,alt])=>{const n=norm(name),a=norm(alt||"");if(n.includes(q)||a.includes(q)){(slug?pages:others).push({name,slug,score:n.startsWith(q)?0:1})}});
 const s=(a,b)=>a.score-b.score||a.name.localeCompare(b.name);return [...pages.sort(s),...others.sort(s)].slice(0,9)}
function bindSearch(box){if(box.dataset.bound)return;box.dataset.bound=1;const inp=box.querySelector("input"),ul=box.querySelector("ul"),mode=box.dataset.mode;let hits=[],act=0;
 const pick=h=>{if(!h)return;if(!h.slug){toast(`${h.name}: page coming soon`);return}inp.value="";ul.hidden=true;
  if(mode==="sel"){toggleSel(h.slug,CUR_F);route(true)}else if(mode==="cmp"){if(!CMP.keys.includes(h.slug))CMP.keys=[...CMP.keys,h.slug].slice(-8);saveCmp();route(true)}else if(mode==="globe"){globeFocus(h.slug)}else go(h.slug)};
 const paint=()=>{ul.innerHTML=hits.map((h,i)=>h.slug?`<li class="${i===act?"act":""}"><a href="#${h.slug}" data-i="${i}">${flag(h.slug,22)}${esc(h.name)}<small>#${C[h.slug].rank} · ${short(C[h.slug].pop[NOW_IDX])}</small></a></li>`:`<li class="off"><span>${esc(h.name)}<small>coming soon</small></span></li>`).join("")||`<li class="off"><span>No country matches "${esc(inp.value)}"</span></li>`;ul.hidden=false};
 inp.addEventListener("input",()=>{hits=searchHits(inp.value);act=0;if(!inp.value.trim()){ul.hidden=true;return}paint()});
 inp.addEventListener("keydown",e=>{if(ul.hidden)return;const pg=hits.filter(h=>h.slug);if(e.key==="ArrowDown"){act=Math.min(act+1,hits.length-1);paint();e.preventDefault()}else if(e.key==="ArrowUp"){act=Math.max(act-1,0);paint();e.preventDefault()}else if(e.key==="Enter"){pick(hits[act]&&hits[act].slug?hits[act]:pg[0]||hits[act]);e.preventDefault()}else if(e.key==="Escape")ul.hidden=true});
 ul.addEventListener("click",e=>{const a=e.target.closest("a[data-i]");if(!a)return;e.preventDefault();pick(hits[+a.dataset.i])});
 inp.addEventListener("blur",()=>setTimeout(()=>ul.hidden=true,180))}
function toast(msg){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");document.body.appendChild(t)}t.textContent=msg;t.hidden=false;clearTimeout(t._h);t._h=setTimeout(()=>t.hidden=true,2400)}

/* ---------- globe ---------- */
let G=null;
function globeBlock(id){return `<div class="globe-card"><div class="globe-wrap" id="${id}"><canvas aria-label="Interactive globe. Drag to rotate, click a country to open its page."></canvas><div class="globe-tip" hidden></div>
 <div class="globe-ctl"><button type="button" data-gz="1.25" aria-label="Zoom in">+</button><button type="button" data-gz="0.8" aria-label="Zoom out">−</button></div></div>
 <div class="globe-legend">${Object.keys(REGION_H).map(r=>`<span><i style="background:${REGCOL[r]}"></i>${r}</span>`).join("")}<span><i style="background:var(--land)"></i>No UN data</span></div>
 <p class="note" style="text-align:center;margin:0">Drag to spin · scroll or +/− to zoom · click a country to open it</p></div>`}
function initGlobe(id){const wrap=document.getElementById(id);if(!wrap||!window.d3||!window.topojson)return;
 const cv=wrap.querySelector("canvas"),tip=wrap.querySelector(".globe-tip"),ctx=cv.getContext("2d");
 const feats=topojson.feature(TOPO,TOPO.objects.countries).features;feats.forEach(f=>{f._k=BYCCN[+f.id]||null});
 const proj=d3.geoOrthographic().clipAngle(90).precision(.4),path=d3.geoPath(proj,ctx),grat=d3.geoGraticule10();
 let W=0,rot=[-78,-18,0],zoom=1,hover=null,drag=null,moved=0,spin=!matchMedia("(prefers-reduced-motion: reduce)").matches,idle=0,raf=0,anim=null;
 const ocean=css("--ocean"),land=css("--land"),lline=css("--land-line"),ink=css("--ink"),acc=css("--accent");
 const size=()=>{const r=wrap.getBoundingClientRect(),dpr=window.devicePixelRatio||1;W=r.width;cv.width=W*dpr;cv.height=W*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
 const draw=()=>{proj.scale(W/2.08*zoom).translate([W/2,W/2]).rotate(rot);ctx.clearRect(0,0,W,W);
  ctx.beginPath();path({type:"Sphere"});ctx.fillStyle=ocean;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=ink;ctx.stroke();
  ctx.beginPath();path(grat);ctx.lineWidth=.5;ctx.strokeStyle=alpha(ink,.12);ctx.stroke();
  feats.forEach(f=>{ctx.beginPath();path(f);ctx.fillStyle=f===hover?acc:f._k?GCOL[f._k]:land;ctx.fill();ctx.lineWidth=f===hover?1.6:.6;ctx.strokeStyle=f._k?alpha(ink,.55):lline;ctx.stroke()});
  ctx.beginPath();path({type:"Sphere"});ctx.lineWidth=2.5;ctx.strokeStyle=ink;ctx.stroke()};
 const loop=()=>{if(anim){const t=Math.min(1,(performance.now()-anim.t0)/900),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;rot=[anim.a[0]+(anim.b[0]-anim.a[0])*e,anim.a[1]+(anim.b[1]-anim.a[1])*e,0];if(t>=1)anim=null}
  else if(spin&&!drag&&!hover&&performance.now()>idle)rot[0]+=.12;draw();raf=requestAnimationFrame(loop)};
 const pick=(x,y)=>{const p=proj.invert([x,y]);if(!p||d3.geoDistance(p,[-rot[0],-rot[1]])>Math.PI/2)return null;return feats.find(f=>d3.geoContains(f,p))||null};
 const pos=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
 cv.addEventListener("pointerdown",e=>{drag={p:pos(e),r:[...rot]};moved=0;cv.setPointerCapture(e.pointerId);cv.classList.add("drag");anim=null});
 cv.addEventListener("pointermove",e=>{const [x,y]=pos(e);if(drag){const k=75/(W*zoom);moved+=Math.abs(x-drag.p[0])+Math.abs(y-drag.p[1]);rot=[drag.r[0]+(x-drag.p[0])*k*2.2,clamp(drag.r[1]-(y-drag.p[1])*k*2.2,-70,70),0];drag.p=[x,y];drag.r=[...rot];tip.hidden=true;return}
  const f=pick(x,y);hover=f;if(f){const k=f._k;tip.innerHTML=k?`${flag(k,20)}<b>${esc(C[k].name)}</b><small>${short(C[k].pop[NOW_IDX])}</small>`:`<b>${esc(f.properties.name)}</b><small>coming soon</small>`;tip.style.left=x+"px";tip.style.top=y+"px";tip.hidden=false;cv.style.cursor=k?"pointer":"grab"}else{tip.hidden=true;cv.style.cursor=""}});
 cv.addEventListener("pointerleave",()=>{hover=null;tip.hidden=true});
 cv.addEventListener("pointerup",e=>{cv.classList.remove("drag");const wasDrag=moved>6;drag=null;idle=performance.now()+2500;if(wasDrag)return;const f=pick(...pos(e));if(!f)return;if(f._k)go(f._k);else toast(`${f.properties.name}: page coming soon`)});
 cv.addEventListener("wheel",e=>{e.preventDefault();zoom=clamp(zoom*(e.deltaY<0?1.1:.9),.8,4)},{passive:false});
 wrap.querySelectorAll("[data-gz]").forEach(b=>b.addEventListener("click",()=>{zoom=clamp(zoom*+b.dataset.gz,.8,4)}));
 size();loop();resizers.push(size);timers.push(()=>cancelAnimationFrame(raf));
 G={focus:k=>{const f=feats.find(x=>x._k===k);if(!f)return;const [lon,lat]=d3.geoCentroid(f);anim={a:[...rot],b:[-lon,-lat],t0:performance.now()};idle=performance.now()+4000;zoom=Math.max(zoom,1.4)}}}
function globeFocus(k){if(G)G.focus(k);setTimeout(()=>go(k),1100)}
const BYCCN={};KEYS.forEach(k=>BYCCN[C[k].ccn3]=k);

/* ---------- shared blocks ---------- */
function shareBlock(){const top=KEYS.slice(0,8);return `<div class="card"><div class="card-h"><div><h3>Who lives where</h3><p>Share of the world's population in the eight most populous countries.</p></div>
 <div class="chips" id="share-y">${[0,YEARS.indexOf(1990),NOW_IDX,LAST].map(j=>`<button class="chip" data-j="${j}" aria-pressed="${j===NOW_IDX}">${YEARS[j]}</button>`).join("")}</div></div>
 <div class="share-wrap"><div class="chart sm" style="height:200px"><canvas id="c-share"></canvas></div><div class="lg-list" id="share-lg"></div></div></div>`}
function initShare(){if(!$("#c-share"))return;let j=NOW_IDX;const top=KEYS.slice(0,8);
 const data=()=>{const s=top.map(k=>C[k].shr[j]);return [...s,+(100-s.reduce((a,b)=>a+b,0)).toFixed(1)]};
 const cols=()=>[...top.map(k=>COL[k]),alpha(css("--muted"),.28)],names=[...top.map(k=>C[k].name),"Rest of world"];
 const legend=()=>{const d=data();$("#share-lg").innerHTML=names.map((n,i)=>`<div><i style="background:${cols()[i]}"></i><span>${esc(n)}</span><span class="mono">${d[i].toFixed(1)}%</span></div>`).join("")};
 const ch=donut("c-share",names.map((n,i)=>({l:n,v:data()[i],c:cols()[i]})),{top:()=>data().slice(0,8).reduce((a,b)=>a+b,0).toFixed(0)+"%",sub:"in these 8"});legend();
 $("#share-y").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;j=+b.dataset.j;$("#share-y").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));ch.data.datasets[0].data=data();ch.update();legend()})}
function stripesBlock(rowsK,focus){const rows=[["World",WGR,"world"],...rowsK.map(k=>[C[k].name,C[k].gr,k])],lbl={0:"1955",9:"2000",18:"2026",23:"2050"};
 return `<div class="card wide"><div class="card-h"><div><h3>Growth stripes</h3><p>Each cell is one data point (every 5 years, yearly 2022–26). Warm = fast growth, blue = shrinking. Hover a cell.</p></div></div>
 <div class="stripes" id="stripes">${rows.map(([n,arr,k])=>`<div class="nm" style="${k===focus?"color:var(--accent)":""}">${esc(n)}</div>${arr.map((v,i)=>`<div class="cell" style="background:${divColor(v)}" data-r="${esc(n)}" data-i="${i}" data-v="${v==null?"":v}"></div>`).join("")}`).join("")}
 <div></div>${YEARS.map((y,i)=>`<div class="yr">${lbl[i]||""}</div>`).join("")}</div>
 <div style="max-width:320px;margin-top:12px"><div class="legend-grad"></div><div class="lg-scale"><span>−1%</span><span>0%</span><span>+1.3%</span><span>+2.7%/yr</span></div></div><div class="readout" id="stripe-read">&nbsp;</div></div>`}
function initStripes(){const g=$("#stripes");if(!g)return;const out=$("#stripe-read");
 g.addEventListener("mouseover",e=>{const c=e.target.closest(".cell");if(!c)return;const y=YEARS[+c.dataset.i];out.textContent=`${c.dataset.r} · ${y}${y>2026?" (projection)":""} · ${c.dataset.v===""?"no data":(c.dataset.v>0?"+":"")+c.dataset.v+"% per year"}`})}
function bubbleBlock(p){return `<div class="card wide"><div class="card-h"><div><h3>Demographic transition</h3><p>All ${KEYS.length} countries: fewer children per woman, older population. Bubble size is population; highlighted countries leave a trail. Press play.</p></div>
 <div class="bub-ctl"><button class="btn primary" id="${p}-play">▶ Play</button><input type="range" id="${p}-yr" min="0" max="${LAST}" value="${NOW_IDX}" aria-label="Year"><span class="mono" id="${p}-lbl" style="min-width:9ch"></span></div></div>
 <div class="chart lg"><canvas id="${p}-c"></canvas></div></div>`}
function initBubble(p,hl){const cv=$("#"+p+"-c");if(!cv||!window.Chart)return;let j=NOW_IDX,timer=null;const k=cv.clientWidth<520?.38:.62;
 const btn=$("#"+p+"-play"),rng=$("#"+p+"-yr"),lbl=$("#"+p+"-lbl"),ds=[];
 hl.forEach(key=>ds.push({type:"line",label:C[key].name+" path",data:[],borderColor:alpha(COL[key],.6),borderWidth:2,pointRadius:0,tension:.35,order:2,_k:key}));
 KEYS.forEach(key=>{const on=hl.includes(key);ds.push({type:"bubble",label:C[key].name,_k:key,data:[],backgroundColor:alpha(COL[key],on?.85:.28),borderColor:on?css("--line"):alpha(COL[key],.6),borderWidth:on?2:1,order:on?0:1})});
 const mark={id:"yr",beforeDatasetsDraw(ch){const a=ch.chartArea,c=ch.ctx;c.save();c.textAlign="center";c.textBaseline="middle";c.fillStyle=alpha(css("--ink"),.08);c.font=`700 ${Math.min(a.width/3.2,150)}px ${css("--f-display")}`;c.fillText(String(YEARS[j]),(a.left+a.right)/2,(a.top+a.bottom)/2);c.restore()}};
 const opt=O({x:{type:"linear",min:.5,max:8,title:{display:true,text:"Fertility rate · children per woman"}},y:{min:12,max:60,title:{display:true,text:"Median age · years"}},
  cb:{title:()=>String(YEARS[j]),label:x=>{const key=x.dataset._k;return ` ${C[key].name}: ${C[key].fer[j]} children, median ${C[key].med[j]} yrs, ${short(C[key].pop[j])}`}},extra:{interaction:{mode:"nearest",intersect:true}}});
 opt.plugins.tooltip.filter=i=>i.dataset.type==="bubble";
 const ch=mk(p+"-c",{type:"bubble",data:{datasets:ds},options:opt,plugins:[mark]});
 const set=i=>{j=i;ds.forEach(d=>{const c=C[d._k];if(d.type==="line")d.data=YEARS.slice(0,i+1).map((y,m)=>({x:c.fer[m],y:c.med[m]}));else d.data=[{x:c.fer[i],y:c.med[i],r:Math.max(2.5,Math.sqrt(c.pop[i]/1e6)*k)}]});
  ch.update();rng.value=i;lbl.textContent=YEARS[i]+(YEARS[i]>2026?" proj.":"")};
 const stop=()=>{if(timer){clearInterval(timer);timer=null}btn.textContent="▶ Play"};
 btn.addEventListener("click",()=>{if(timer){stop();return}if(j>=LAST)set(0);btn.textContent="❚❚ Pause";timer=setInterval(()=>{if(j>=LAST){stop();return}set(j+1)},650)});
 rng.addEventListener("input",()=>{stop();set(+rng.value)});timers.push(stop);set(NOW_IDX)}
const CMP_METRICS=[["pop","Population"],["shr","World share"],["med","Median age"],["fer","Fertility"],["le","Life expectancy"],["gr","Growth %"]];
let cmpMetric="pop";
function compareCard(){return `<div class="card wide"><div class="card-h"><div><h3>Compared over time</h3><p>Pick a metric. The shaded part is the UN projection.</p></div><div class="chips" id="cmp-m">${CMP_METRICS.map(([k,l])=>`<button class="chip" data-m="${k}" aria-pressed="${k===cmpMetric}">${l}</button>`).join("")}</div></div><div class="chart lg"><canvas id="c-cmp"></canvas></div></div>`}
function initCompare(keys,focus){const box=$("#cmp-m");if(!box)return;const draw=()=>redraw("c-cmp",()=>seriesChart("c-cmp",[...keys,...(SHOWW&&cmpMetric!=="shr"&&(cmpMetric!=="pop"||!keys.length)?["world"]:[])],cmpMetric,{zero:false,focus}));
 box.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cmpMetric=b.dataset.m;box.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));draw()});draw()}
function countryCards(keys){return `<div class="ctry-grid">${keys.map(k=>{const c=C[k];return `<a class="ctry" href="#${k}">${flag(k,44)}<b>${esc(c.name)}</b><span class="mono">#${c.rank} · ${short(c.pop[NOW_IDX])} · ${c.gr[NOW_IDX]>0?"+":""}${c.gr[NOW_IDX]}%</span></a>`}).join("")}</div>`}
function catGrid(){return `<div class="cats">${CATS.map((c,i)=>{const col=catCol(i);return `<a class="cat" href="#cat-${c.id}" style="--cc:${col}"><span class="badge" style="color:${textOn(col)}">${c.n.slice(0,2)}</span><b>${c.n}</b><span class="d">${c.d}</span></a>`}).join("")}</div>`}
function donut(cid,cells,center){return mk(cid,{type:"doughnut",data:{labels:cells.map(c=>c.l),datasets:[{data:cells.map(c=>c.v),backgroundColor:cells.map(c=>c.c),borderColor:css("--line"),borderWidth:2,hoverOffset:10,borderRadius:4}]},
 options:{responsive:true,maintainAspectRatio:false,cutout:"62%",animation:{animateRotate:true,duration:700},plugins:{legend:{display:false},tooltip:{...tipStyle(),callbacks:{label:x=>` ${x.label}: ${(+x.parsed).toFixed(1)}%${cells[x.dataIndex]&&cells[x.dataIndex].t?" · "+cells[x.dataIndex].t:""}`}}}},
 plugins:[{id:"mid",afterDraw(c){const {ctx,chartArea:a}=c,cx=(a.left+a.right)/2,cy=(a.top+a.bottom)/2;ctx.save();ctx.textAlign="center";ctx.fillStyle=css("--ink");ctx.font=`700 21px ${css("--f-display")}`;ctx.fillText(typeof center.top==="function"?center.top():center.top,cx,cy+4);ctx.font="11px "+css("--f-body");ctx.fillStyle=css("--muted");ctx.fillText(center.sub,cx,cy+20);ctx.restore()}}]})}
function legendList(id,cells,extra=""){const el=$("#"+id);if(el)el.innerHTML=cells.map(c=>`<div><i style="background:${c.c}"></i><span>${esc(c.l)}${c.t?` <small class="muted">${c.t}</small>`:""}</span><span class="mono">${(+c.v).toFixed(1)}%</span></div>`).join("")+extra}

/* ---------- category blocks ---------- */
const SX=(id,t,lead,html,o={})=>({id,t,lead,html,wide:!!o.wide,raw:!!o.raw});
const chartSec=(id,t,lead,cid,o={})=>SX(id,t,lead,`${o.top||""}<div class="chart ${o.size||""}"><canvas id="${cid}"></canvas></div>${o.extra||""}`,o);
const donutHTML=(cid,chips="")=>`${chips?`<div class="card-h"><div class="chips" id="${cid}-c">${chips}</div></div>`:""}<div class="share-wrap"><div class="chart sm" style="height:200px"><canvas id="${cid}"></canvas></div><div class="lg-list" id="${cid}-lg"></div></div>`;
const chip2=(a,la,b,lb)=>`<button class="chip" data-m="${a}" aria-pressed="true">${la}</button><button class="chip" data-m="${b}" aria-pressed="false">${lb}</button>`;
function tile(l,v,s,c){return `<div class="tile"><span class="label"><i style="background:${c}"></i>${l}</span><span class="mono">${v}</span><small>${s}</small></div>`}
function tilesSec(ids,f){if(!f)return null;const X=COL.x;
 ids=ids.filter(id=>!(MD[id].v[f]==null&&MD[id].note&&MD[id].note.startsWith("so far")));return SX("kpi","Key figures",`Headline numbers for ${esc(C[f].name)}, with the world value or rank for context.`,`<div class="tiles">${ids.map((id,n)=>{const m=MD[id],v=m.v[f],w=m.v.world;let sub=[];
  if(v!=null&&m.tot&&w)sub.push(`${(v/w*100).toFixed(1)}% of world`);else if(w!=null)sub.push(`World: ${fv(m,w)}`);
  const r=ranked(m),ri=r.indexOf(f);if(ri>=0&&!m.tot)sub.push(`#${ri+1} of ${r.length}`);else if(ri>=0)sub.push(`#${ri+1}`);if(m.y[f])sub.push(m.y[f]);
  return tile(m.n,fv(m,v),sub.join(" · ")||"not reported",X[n%X.length])}).join("")}</div>`,{wide:1})}
function dotsStrip(m,f){const r=ranked(m);if(r.length<3)return "";const vals=r.map(k=>m.v[k]),mn=Math.min(...vals),mx=Math.max(...vals);const lg=mn>0&&mx/mn>60;
 const x=v=>lg?(Math.log(v)-Math.log(mn))/(Math.log(mx)-Math.log(mn)):(v-mn)/((mx-mn)||1);
 return `<div class="dots" title="All ${r.length} countries${lg?" (log scale)":""}">${r.map(k=>`<i class="${k===f?"f":""}" style="left:${(x(m.v[k])*96+2).toFixed(1)}%;background:${COL[k]}" title="${esc(C[k].name)}: ${fv(m,m.v[k])}"></i>`).join("")}</div>`}
function cmpRow(m,k,mx,f,num){const v=m.v[k],w=v==null?0:Math.max(v,0)/mx*100;return `<div class="cmp-r ${k===f?"foc":""} ${k==="world"?"w":""}"><span class="nm">${num?`<b>${num}</b>`:""}${esc(nmK(k))}</span><span class="track"><i style="width:${w.toFixed(1)}%;background:${COL[k]}"></i>${m.ref?`<b class="ref" style="left:${(m.ref/mx*100).toFixed(1)}%"></b>`:""}</span><span class="mono">${fv(m,v)}</span></div>`}
function cmpBlock(m,f,ks){if(f&&m.v[f]==null&&m.note&&m.note.startsWith("so far"))return "";const d=dirOf(m.id),r=ranked(m);const meta=`<div class="meta">${[yRange(m),m.src,d>0?"higher is better":d<0?"lower is better":"",m.note||""].filter(Boolean).join(" · ")}</div>`;
 if(f){const rows=[...ks.filter(k=>m.v[k]!=null||k===f),...(!m.tot&&m.v.world!=null?["world"]:[])];const mx=Math.max(...rows.map(k=>Math.max(m.v[k]??0,0)),m.ref||0)||1;const ri=r.indexOf(f);
  return `<div class="cmp"><h4>${m.n}</h4>${meta}${rows.map(k=>cmpRow(m,k,mx,f)).join("")}${m.ref?`<div class="refl">▌ ${m.refl}</div>`:""}${dotsStrip(m,f)}<div class="rank"><span>${ri>=0?`${esc(C[f].name)} ranks #${ri+1} of ${r.length}`:"Not reported"}</span>${m.tot&&m.v[f]&&m.v.world?`<span>${(m.v[f]/m.v.world*100).toFixed(1)}% of world</span>`:""}</div></div>`}
 if(!r.length)return "";const mx=Math.max(m.v[r[0]],m.v[r[r.length-1]],m.ref||0,...(!m.tot&&m.v.world!=null?[m.v.world]:[]))||1;
 return `<div class="cmp"><h4>${m.n}</h4>${meta}${r.slice(0,8).map((k,i)=>cmpRow(m,k,mx,null,i+1)).join("")}${!m.tot&&m.v.world!=null?cmpRow(m,"world",mx):""}
  ${r.length>8?`<details><summary>Show all ${r.length}</summary>${r.slice(8).map((k,i)=>cmpRow(m,k,mx,null,i+9)).join("")}</details>`:""}${m.ref?`<div class="refl">▌ ${m.refl}</div>`:""}</div>`}
const cmpSec=(cat,f,ks)=>{const ms=metricsOf(cat);return ms.length?SX("cmp",f?"How "+esc(C[f].name)+" compares":"Rankings",f?"Selected countries and the world. The strip under each bar shows where every country sits.":`All ${KEYS.length} countries ranked. Open the list for the full ranking.`,`<div class="cmp-grid">${ms.map(m=>cmpBlock(m,f,ks)).join("")}</div>`,{wide:1}):null};
function factsTable(rows,ks,f,note){if(!ks.length)return `<div class="empty">Add a country above to see its facts.</div>`;return `<div class="tbl-wrap"><table class="facts"><thead><tr><th></th>${ks.map(k=>`<th class="${k===f?"foc":""}">${flag(k,20)}${esc(C[k].name)}</th>`).join("")}</tr></thead><tbody>${rows.map(([l,fn])=>`<tr><td>${l}</td>${ks.map(k=>`<td class="${k===f?"foc":""}">${fn(k)??"—"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${note?`<p class="note">${note}</p>`:""}`}
const f3=(group,label)=>[label,k=>FACTS3[group][label][k]];
const GENFACTS=[["Capital",k=>esc(C[k].capital||"—")],["Region",k=>`${C[k].subregion||C[k].region}`],["Official languages",k=>esc(C[k].languages.slice(0,4).join(", ")||"—")],
 ["Total area",k=>fmt(C[k].area)+" km²"],["Land area",k=>fmt(C[k].land)+" km²"],["Neighbours",k=>C[k].borders.length?`${C[k].borders.length}: ${esc(C[k].borders.slice(0,8).join(", "))}${C[k].borders.length>8?"…":""}`:"None (island or coastal state)"],
 ["Landlocked",k=>C[k].landlocked?"Yes":"No"],["Time zones",k=>C[k].tz.map(t=>"UTC"+t).join(", ")],["Daylight saving",k=>C[k].dst?"Yes":"No"]];
function squaresSVG(ks,f){if(!ks.length)return `<div class="empty">Add countries above to compare their size.</div>`;const A=ks.map(k=>C[k].area),sd=A.map(a=>Math.sqrt(a)),W=460,gap=14,s=(W-gap*(ks.length+1))/sd.reduce((a,b)=>a+b,0),H=Math.max(...sd)*s+40;let x=gap;
 return `<svg class="squares" viewBox="0 0 ${W} ${H.toFixed(0)}" role="img" aria-label="Areas drawn to scale">${ks.map((k,i)=>{const d=sd[i]*s,y=H-28-d,cx=(x+d/2).toFixed(1);
  const r=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${d.toFixed(1)}" height="${d.toFixed(1)}" rx="4" fill="${alpha(COL[k],k===f||!f?.55:.3)}" stroke="${css("--line")}" stroke-width="2"/><text x="${cx}" y="${(H-10).toFixed(1)}" text-anchor="middle">${esc(C[k].name.length>14?C[k].iso3:C[k].name)}</text>${d>46?`<text class="m" x="${cx}" y="${(y+d/2+4).toFixed(1)}" text-anchor="middle">${A[i]>=1e6?(A[i]/1e6).toFixed(2)+"M":Math.round(A[i]/1e3)+"K"} km²</text>`:""}`;x+=d+gap;return r}).join("")}</svg>`}
function solar(doy){const g=2*Math.PI/365*(doy-1);return {eq:229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g)),dec:.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g)}}
function hourAngle(lat,dec){const r=Math.PI/180;return Math.acos(clamp(Math.cos(90.833*r)/(Math.cos(lat*r)*Math.cos(dec))-Math.tan(lat*r)*Math.tan(dec),-1,1))/r}
const doyOf=d=>Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,0))/864e5);
function sunToday(lat,lon){const d=new Date(),{eq,dec}=solar(doyOf(d)),ha=hourAngle(lat,dec),base=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());return {rise:new Date(base+(720-4*(lon+ha)-eq)*6e4),set:new Date(base+(720-4*(lon-ha)-eq)*6e4),len:8*ha}}
const tf=(tz,d,o)=>{try{return new Intl.DateTimeFormat("en-GB",{timeZone:tz,...o}).format(d)}catch(e){return "--"}};
function tzOffset(tz){try{const p=new Intl.DateTimeFormat("en-US",{timeZone:tz,timeZoneName:"shortOffset"}).formatToParts(new Date()).find(x=>x.type==="timeZoneName");return p?p.value.replace("GMT","UTC"):""}catch(e){return ""}}
function clockList(f,ks){if(f){if(f==="united-states")return US_ZONES.map(z=>[...z,f]);const c=C[f],seen=new Set([tzOffset(c.capTz)]),list=[[c.capital+" (capital)",c.capTz,c.capLoc[0],c.capLoc[1],f]];
  c.tzNames.forEach(z=>{const o=tzOffset(z);if(!seen.has(o)&&list.length<6){seen.add(o);list.push([z.split("/").pop().replace(/_/g," "),z,null,null,f])}});return list}
 return ks.length?ks.map(k=>[C[k].capital+", "+C[k].name,C[k].capTz,C[k].capLoc[0],C[k].capLoc[1],k]):[["Coordinated Universal Time (UTC)","UTC",null,null,"world"]]}
function clocksHTML(f,ks){return `<div class="clocks">${clockList(f,ks).map(([n,tz,lat,lon,k])=>{const hm={hour:"2-digit",minute:"2-digit",hour12:false};let sun="";
 if(lat!=null){const s=sunToday(lat,lon);sun=`<span>Sunrise ${tf(tz,s.rise,hm)} · Sunset ${tf(tz,s.set,hm)}</span><span>Daylight ${Math.floor(s.len/60)} h ${Math.round(s.len%60)} min</span>`}
 return `<div class="clock" style="--cc:${COL[k]}"><span class="label">${esc(n)}</span><div class="t" data-tz="${tz}">--:--:--</div><div class="s"><span data-tzd="${tz}"></span>${sun}</div></div>`}).join("")}</div>`}
function startClocks(){if(!$("[data-tz]"))return;const tick=()=>{const now=new Date();document.querySelectorAll("[data-tz]").forEach(el=>el.textContent=tf(el.dataset.tz,now,{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}));document.querySelectorAll("[data-tzd]").forEach(el=>el.textContent=tf(el.dataset.tzd,now,{weekday:"short",day:"numeric",month:"short"})+" · "+tzOffset(el.dataset.tzd))};tick();const id=setInterval(tick,1000);timers.push(()=>clearInterval(id))}
function msList(ks){const ok=ks.filter(k=>MS[k]);return ok.length?`<div class="ms-list">${ok.map(k=>`<div><h3 style="color:${COL[k]};font-size:.95rem">${esc(C[k].name)}</h3><ol>${MS[k].map(([y,t])=>`<li><b>${y}</b>${t}</li>`).join("")}</ol></div>`).join("")}</div>`:""}
const MIXS=[["Coal","#5B5B66"],["Gas","#F28C28"],["Nuclear","#8E5CD9"],["Hydro","#1E78D6"],["Wind","#19B3A6"],["Solar","#F2C230"],["Other","#B0A49A"]],MIXY=[2000,2005,2010,2015,2020,2025];

/* ---------- country population sections ---------- */
function countrySections(k,ks){const c=C[k],i=NOW_IDX,p=c.pop[i],X=COL.x;
 return [
 SX("overview","Overview",`${esc(c.name)} is home to ${pS(c.shr[i])} of everyone alive today and ranks number ${c.rank} in the world by population.`,`<div class="tiles">
   ${tile("Share of world",pS(c.shr[i]),"of "+short(WORLD[i])+" people",COL[k])}${tile("Yearly change",(c.gr[i]>0?"+":"")+c.gr[i]+"%",signed(c.change)+" people",divColor(c.gr[i]))}
   ${tile("Density",fmt(c.density),"people per km²",X[1])}${tile("Land area",fmt(c.land),"km²",X[3])}
   ${tile("Urban",MD.urban.v[k]!=null?MD.urban.v[k].toFixed(1)+"%":"n/a",MD.urban.v[k]!=null?short(p*MD.urban.v[k]/100)+" people":"",X[4])}${tile("Median age",c.med[i],"years",X[5])}
   ${tile("Fertility",c.fer[i],"children per woman",X[0])}${tile("Life expectancy",c.le[i],"years at birth",catCol(4))}
   ${tile("Births per year",short(c.births),"2026, UN estimate",X[3])}${tile("Net migrants",signed(c.mig[i]),"per year",c.mig[i]<0?css("--neg"):css("--pos"))}</div>`,{wide:1}),
 SX("population","Population, 1955–2050",`History and UN projection, with the countries you picked above.`,`<div class="chart lg"><canvas id="c-pop"></canvas></div>`,{wide:1}),
 SX("timemachine","Time machine","Drag through 95 years of data and projections.",`<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap"><span class="tm-year" id="tm-y">2026</span><input id="tm" type="range" min="0" max="${LAST}" value="${i}" style="flex:1;min-width:180px" aria-label="Year"></div><div class="tm" id="tm-out"></div>`,{wide:1}),
 chartSec("profile","Country profile","Seven indicators scaled 0–100. Hover for real values.","c-radar"),
 chartSec("growth","Yearly growth rate","Colour shows speed: red is fast growth, blue is decline.","c-gr"),
 chartSec("migration","Net migration","Immigrants minus emigrants per year. Red means more people leave than arrive.","c-mig"),
 chartSec("age","Median age vs fertility","Falling fertility pushes the median age up a generation later.","c-age"),
 SX("stripes","","",stripesBlock(ks,k),{raw:1,wide:1}),
 SX("transition","","",bubbleBlock("cbub"),{raw:1,wide:1}),
 SX("urban","Urban share","Share of people living in cities, 1960–2025 (UN World Urbanization Prospects via World Bank).",MD.urban.v[k]!=null?`<div class="urb-wrap"><div class="chart sm" style="height:160px"><canvas id="c-urb-d"></canvas></div><div class="chart sm"><canvas id="c-urb"></canvas></div></div>`:`<div class="empty">No urbanisation data reported.</div>`),
 SX("cities","Largest cities",`Source: ${c.citySrc}. Switch between bars and a treemap.`,`<div class="card-h"><div class="chips" id="city-v"><button class="chip" data-v="bars" aria-pressed="true">Bars</button><button class="chip" data-v="tree" aria-pressed="false">Treemap</button></div></div>
  <div class="chart lg"><canvas id="c-city"></canvas><canvas id="c-tree" hidden style="position:absolute;inset:0;width:100%;height:100%"></canvas></div><div class="readout" id="tree-read">&nbsp;</div>`,{wide:1}),
 SX("data","Data table","All values as of 1 July. Italic rows are projections.",`<div class="tbl-wrap"><table><thead><tr><th>Year</th><th>Population</th><th>Change %</th><th>Migrants</th><th>Median age</th><th>Fertility</th><th>Life exp.</th><th>World share</th></tr></thead><tbody>
  ${YEARS.map((y,j)=>`<tr class="${y>2026?"fc-row":""}"><td>${y}</td><td>${fmt(c.pop[j])}<span class="bar" style="width:${(c.pop[j]/Math.max(...c.pop)*60).toFixed(0)}px;background:${COL[k]}"></span></td><td style="color:${divColor(c.gr[j])}">${c.gr[j]}%</td><td>${signed(c.mig[j])}</td><td>${c.med[j]}</td><td>${c.fer[j]}</td><td>${c.le[j]}</td><td>${pS(c.shr[j])}</td></tr>`).reverse().join("")}</tbody></table></div>`,{wide:1})]}
const RADAR=[["Median age",k=>C[k].med[NOW_IDX],v=>v/55*100,v=>v+" yrs"],["Fertility",k=>C[k].fer[NOW_IDX],v=>v/7*100,v=>v+" children"],["Urban",k=>MD.urban.v[k],v=>v,v=>(+v).toFixed(1)+"%"],["Life expectancy",k=>C[k].le[NOW_IDX],v=>(v-50)/37*100,v=>v+" yrs"],["World share",k=>C[k].shr[NOW_IDX],v=>Math.sqrt(v/18)*100,pS],["Growth",k=>C[k].gr[NOW_IDX],v=>(v+1.2)/4.2*100,v=>v+"%/yr"],["Density",k=>C[k].density,v=>Math.log10(Math.max(v,1))/Math.log10(1500)*100,v=>v+"/km²"]];
function initRadar(keys,focus){const order=[...keys.filter(x=>x!==focus),focus].filter(Boolean);
 mk("c-radar",{type:"radar",data:{labels:RADAR.map(r=>r[0]),datasets:order.map(k=>{const c=COL[k],fo=k===focus;return {label:C[k].name,_k:k,data:RADAR.map(r=>{const v=r[1](k);return v==null?0:clamp(r[2](v),0,100)}),borderColor:c,backgroundColor:alpha(c,fo?.3:.06),borderWidth:fo?3:1.6,borderDash:fo?undefined:[4,3],pointBackgroundColor:c,pointRadius:fo?3:2}})},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:"bottom",labels:{color:css("--ink"),usePointStyle:true,boxWidth:8}},tooltip:{...tipStyle(),callbacks:{label:x=>` ${x.dataset.label}: ${RADAR[x.dataIndex][3](RADAR[x.dataIndex][1](x.dataset._k))}`}}},
   scales:{r:{min:0,max:100,ticks:{display:false,stepSize:25},grid:{color:css("--grid")},angleLines:{color:css("--grid")},pointLabels:{color:css("--ink"),font:{size:12,family:css("--f-body")}}}}}})}
function drawTree(cv,items,out){const dpr=window.devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;cv.width=w*dpr;cv.height=h*dpr;const ctx=cv.getContext("2d");ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);const rects=[];
 (function split(arr,x,y,W,H){if(arr.length===1){rects.push({...arr[0],x,y,w:W,h:H});return}const tot=arr.reduce((s,a)=>s+a.v,0);let acc=0,i=0;while(i<arr.length-1&&acc+arr[i].v<=tot/2){acc+=arr[i].v;i++}if(i===0){acc=arr[0].v;i=1}
  const f=acc/tot,A=arr.slice(0,i),B=arr.slice(i);if(W>=H){split(A,x,y,W*f,H);split(B,x+W*f,y,W*(1-f),H)}else{split(A,x,y,W,H*f);split(B,x,y+H*f,W,H*(1-f))}})(items,0,0,w,h);
 rects.forEach(r=>{ctx.fillStyle=r.c;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(r.x+2,r.y+2,r.w-4,r.h-4,8);else ctx.rect(r.x+2,r.y+2,r.w-4,r.h-4);ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=css("--line");ctx.stroke();
  if(r.w>60&&r.h>32){ctx.fillStyle=textOn(r.c);ctx.font="600 13px "+css("--f-body");ctx.fillText(r.n,r.x+10,r.y+21,r.w-18);if(r.h>48){ctx.font="12px "+css("--f-mono");ctx.globalAlpha=.85;ctx.fillText(short(r.v),r.x+10,r.y+38);ctx.globalAlpha=1}}});
 cv.onmousemove=e=>{const b=cv.getBoundingClientRect(),mx=e.clientX-b.left,my=e.clientY-b.top;const r=rects.find(r=>mx>=r.x&&mx<r.x+r.w&&my>=r.y&&my<r.y+r.h);if(r)out.textContent=`${r.n} · ${fmt(r.v)} people`}}
function initCountry(k,ks){const c=C[k];
 seriesChart("c-pop",[...ks],"pop",{focus:k,style:ks.length===1?"bar":"area"});
 const col=COL[k],X=COL.x;
 mk("c-gr",{type:"bar",data:{labels:YEARS,datasets:[{label:"Growth",data:c.gr,backgroundColor:c.gr.map((v,j)=>divColor(v,YEARS[j]>2026?.45:1)),borderRadius:5,maxBarThickness:20}]},plugins:[band],
  options:O({x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:8}},y:{ticks:{callback:v=>v+"%"}},cb:{label:x=>` Growth: ${x.parsed.y}% per year`}})});
 const pos=css("--pos"),neg=css("--neg");
 mk("c-mig",{type:"bar",data:{labels:YEARS,datasets:[{label:"Net migrants",data:c.mig,backgroundColor:ctx=>{const v=c.mig[ctx.dataIndex],cc=v<0?neg:pos;return YEARS[ctx.dataIndex]>2026?alpha(cc,.4):vGrad(cc,1,.6)(ctx)},borderRadius:5,maxBarThickness:20}]},plugins:[band],
  options:O({x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:8}},y:{ticks:{callback:v=>short(v)}},cb:{label:x=>` Net migrants: ${signed(x.parsed.y)}`}})});
 const sec=X.find(x=>x!==col&&Math.abs(rgb2hsl(x)[0]-rgb2hsl(col)[0])>.15)||X[3];
 mk("c-age",{type:"line",data:{datasets:[
   {label:"Median age (yrs)",data:YEARS.map((y,j)=>({x:y,y:c.med[j]})),borderColor:col,backgroundColor:vGrad(col,.3,0),fill:"origin",yAxisID:"y",tension:.3,pointRadius:0,borderWidth:3},
   {label:"Fertility rate",data:YEARS.map((y,j)=>({x:y,y:c.fer[j]})),borderColor:sec,backgroundColor:sec,yAxisID:"y1",tension:.3,pointRadius:0,borderWidth:3,borderDash:[6,3]}]},plugins:[band],
  options:O({x:{type:"linear",min:1955,max:2050,ticks:{stepSize:20,callback:v=>v}},y:{min:0,title:{display:true,text:"median age"}},y1:{position:"right",min:0,grid:{display:false},title:{display:true,text:"children / woman"}},legend:true})});
 const u=MD.urban.v[k],rur=X.find(x=>x!==col&&x!==sec)||X[1];
 if(u!=null){donut("c-urb-d",[{l:"Urban",v:u,c:col},{l:"Rural",v:+(100-u).toFixed(1),c:rur}],{top:u.toFixed(0)+"%",sub:"urban"});
  const pts=YEARS.map((y,j)=>[y,c.urb[j]]).filter(p=>p[1]!=null);
  mk("c-urb",{type:"line",data:{datasets:[{label:"Urban",data:pts.map(([x,y])=>({x,y})),borderColor:col,backgroundColor:vGrad(col,.75,.35),fill:"origin",tension:.3,pointRadius:0,borderWidth:2},{label:"Rural",data:pts.map(([x])=>({x,y:100})),borderColor:"transparent",backgroundColor:vGrad(rur,.35,.6),fill:"-1",tension:.3,pointRadius:0}]},
   options:O({x:{type:"linear",min:pts[0]?pts[0][0]:1960,max:2025,ticks:{stepSize:15,callback:v=>v}},y:{min:0,max:100,ticks:{callback:v=>v+"%"}},legend:true,cb:{label:x=>x.datasetIndex===0?` Urban: ${x.parsed.y}%`:` Rural: ${(100-pts[x.dataIndex][1]).toFixed(1)}%`}})})}
 const [h0,s0]=rgb2hsl(col),dk=isDark();const cityCols=c.cities.map((x,j)=>hsl2hex(h0+j*.045,clamp(s0,.55,.85),dk?.62-j*.012:.46+j*.018));
 mk("c-city",{type:"bar",data:{labels:c.cities.map(x=>x[0]),datasets:[{label:"Population",data:c.cities.map(x=>x[1]),backgroundColor:cityCols,borderColor:css("--line"),borderWidth:1.5,borderRadius:6,maxBarThickness:26}]},
  options:O({x:{ticks:{callback:v=>short(v)}},y:{grid:{display:false},ticks:{color:css("--ink")}},cb:{label:x=>` ${fmt(x.parsed.x)} people`},extra:{indexAxis:"y",interaction:{mode:"nearest",axis:"y",intersect:false}}})});
 const tree=$("#c-tree"),cityCv=$("#c-city"),tread=$("#tree-read"),items=c.cities.map((x,j)=>({n:x[0],v:x[1],c:cityCols[j]}));
 let view="bars";const paintTree=()=>{if(view==="tree")drawTree(tree,items,tread)};resizers.push(paintTree);
 $("#city-v").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;view=b.dataset.v;$("#city-v").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));tree.hidden=view!=="tree";cityCv.style.visibility=view==="tree"?"hidden":"visible";tread.innerHTML=view==="tree"?"Hover a tile for the exact figure.":"&nbsp;";paintTree()});
 initRadar(ks,k);initStripes();initBubble("cbub",ks);
 const tm=$("#tm"),out=$("#tm-out"),yEl=$("#tm-y");
 const paintTM=()=>{const j=+tm.value,y=YEARS[j];yEl.innerHTML=y+(y>2026?'<span class="fc">projection</span>':"");
  out.innerHTML=[["Population",fmt(c.pop[j])],["Median age",c.med[j]+" yrs"],["Fertility",c.fer[j]],["Life expectancy",c.le[j]+" yrs"],["World share",pS(c.shr[j])],["Growth",`<span style="color:${divColor(c.gr[j])}">${c.gr[j]}%</span>`],["Net migrants",signed(c.mig[j])],["World pop.",short(WORLD[j])]].map(([l,v])=>`<div><span class="label">${l}</span><span class="mono">${v}</span></div>`).join("")};
 tm.addEventListener("input",paintTM);paintTM()}

/* ---------- category sections ---------- */
function catSections(cat,f){const ks=selFor(f),w=SHOWW;let a;
 const has=k=>k&&FACTS3;
 switch(cat){
 case "population":a=f?countrySections(f,ks):[SX("share","","",shareBlock(),{raw:1}),SX("stripes","","",stripesBlock(ks),{raw:1,wide:1}),SX("bubble","","",bubbleBlock("pb"),{raw:1,wide:1}),SX("cmpc","","",compareCard(),{raw:1,wide:1})];break;
 case "economy":a=[tilesSec(["gdp","gdpppp","gdppc","growth","infl","unemp","exp","imp"],f),
  chartSec("gdpt","GDP since 2000","Nominal GDP in current US dollars.","c-gdp",{wide:1,size:"lg"}),
  SX("gdpshare","Share of the world economy","Nominal vs purchasing-power parity (PPP), which adjusts for local prices.",donutHTML("c-gdpshare",chip2("gdp","Nominal","gdpppp","PPP"))),
  chartSec("sector","What the economy is made of","Value added by sector, % of GDP. The remainder is taxes and adjustments.","c-sector")];break;
 case "energy":a=[tilesSec(["elec_pc","eng_pc","ren_elec","lowc","access","ren_fin"],f),
  SX("mix","Electricity mix, 2000–2025","Share of electricity generated by each source.",`<div class="card-h"><div class="chips" id="mix-k">${[...ks,...(w?["world"]:[])].filter(k=>ow(k).mix&&ow(k).mix.some(Boolean)).map((k,i)=>`<button class="chip" data-k="${k}" aria-pressed="${i===0}">${flag(k,18)}${esc(nmK(k))}</button>`).join("")}</div></div><div class="mixwrap"><div class="chart lg"><canvas id="c-mix"></canvas></div><div><span class="label" id="mix-lbl">Latest mix</span>${donutHTML("c-mix25")}</div></div>`,{wide:1}),
  chartSec("coal","Coal's share of electricity","How fast each country is moving away from coal.","c-coal"),
  chartSec("ws","Wind and solar share","Wind plus solar as a share of electricity generation.","c-ws")];break;
 case "environment":a=[tilesSec(["co2","co2pc","ghg","pm25","forest"],f),
  chartSec("co2t","CO₂ emissions since 1990","Fossil CO₂, tonnes per year (EDGAR via World Bank).","c-co2",{wide:1,size:"lg"}),
  SX("co2share","Share of world CO₂","Latest year.",donutHTML("c-co2share")),chartSec("co2pcc","CO₂ per person","Tonnes per person, latest year.","c-co2pc")];break;
 case "health":a=[tilesSec(["le","le_f","le_m","hexp_pc","hexp_gdp","phys","beds","mmr"],f),
  chartSec("let","Life expectancy, 1955–2050","Years a newborn can expect to live, with UN projections.","c-le",{wide:1,size:"lg"}),
  chartSec("lefm","Women and men","Life expectancy at birth, 2026.","c-lefm"),chartSec("hexp","Health spending per person","US dollars a year. Log scale: each step is ten times more.","c-hexp")];break;
 case "food":a=[tilesSec(["arable","cereal","yield","under","agri_emp","agri_gdp"],f),
  SX("cshare","Share of the world's cereal harvest","Latest year.",donutHTML("c-cshare")),chartSec("farm","Farm jobs vs farm output","Share of workers in agriculture compared with agriculture's share of GDP.","c-farm")];break;
 case "water":a=[tilesSec(["wd","stress","renew_pc","water","sanit"],f),
  chartSec("wuse","What fresh water is used for","Share of withdrawals: agriculture, industry, and homes and cities.","c-wuse",{wide:1}),
  SX("wdshare","Share of world water withdrawals","",donutHTML("c-wdshare")),chartSec("rpc","Renewable water per person","Cubic metres per person per year. Below 1,700 counts as water stress.","c-rpc")];break;
 case "education":a=[tilesSec(["lit","prim","sec","ter","edu","ptr"],f),
  chartSec("enrol","Enrolment by level","Gross enrolment ratio: students as % of the official age group. It can pass 100% when older or younger pupils enrol.","c-enrol",{wide:1}),
  chartSec("educ","Education spending","Government spending, % of GDP.","c-edu"),chartSec("ptrc","Pupils per teacher","Primary school. Fewer means more attention per child.","c-ptr")];break;
 case "technology":a=[tilesSec(["inet","inet_n","mobile","bband","rd","resr","patents","hitech"],f),
  chartSec("inett","Internet users since 2000","% of the population online.","c-inet",{wide:1,size:"lg"}),
  SX("patshare","Share of world patent applications","Resident applications, latest year.",donutHTML("c-patshare")),chartSec("rdc","R&D spending","Research and development, % of GDP.","c-rd")];break;
 case "society":a=[tilesSec(["age0","age65","urban","hh"],f),chartSec("agestr","Age structure","Share of the population by age group, 2025.","c-agestr",{wide:1}),
  SX("facts","Society facts","",factsTable([["Official languages",k=>FACTS3.society["Official language(s)"][k]||esc(C[k].languages.join(", "))],["Median age (2026)",k=>C[k].med[NOW_IDX]+" years"],["Urban share",k=>MD.urban.v[k]!=null?MD.urban.v[k].toFixed(1)+"%":"—"],["Largest city",k=>`${esc(C[k].cities[0][0])} (${short(C[k].cities[0][1])})`]],ks,f),{wide:1})];break;
 case "government":a=[tilesSec(["mil","milgdp","forces","debt"],f),
  SX("facts","How the state is organised","",factsTable([["Capital",k=>esc(C[k].capital)],["Official name",k=>esc(C[k].official)],...Object.keys(FACTS3.gov).map(l=>f3("gov",l))],ks,f,ks.includes("china")?"*The People's Republic of China also claims Taiwan as a province. Detailed institutional facts are so far written for India, China and the US.":"Detailed institutional facts are so far written for India, China and the US."),{wide:1}),
  SX("milshare","Share of world military spending","",donutHTML("c-milshare")),chartSec("milg","Military spending, % of GDP","","c-milg")];break;
 case "transport":a=[tilesSec(["air","air_pc","rail","teu","road"],f),SX("teushare","Share of world container traffic","Port throughput, latest year.",donutHTML("c-teushare")),chartSec("airpc","Flights per person","Air passengers a year divided by population.","c-airpc")];break;
 case "biodiversity":a=[tilesSec(["prot","mprot","forest","thr"],f),chartSec("thrc","Threatened species by group","Species assessed as threatened on the IUCN Red List.","c-thr",{wide:1}),
  chartSec("protc","Protected areas","Land and sea, % of territory.","c-prot"),chartSec("forc","Forest cover","% of land area.","c-forest")];break;
 case "geography":a=[tilesSec(["area","landarea","nbr","coast","high"],f),SX("size","Size compared","Total area drawn to scale.",squaresSVG(ks.slice(0,6),f)),
  ks.some(k=>GEO3[k])?chartSec("elev","Highest and lowest points","Each bar runs from the lowest point to the highest. So far for India, China and the US.","c-elev"):null,
  SX("facts","Geography facts","",factsTable(GENFACTS.slice(0,7),ks,f),{wide:1})];break;
 case "space":a=[tilesSec(["launch","articles","resr","rd"],f),chartSec("launchc","Orbital launches in 2025","Launch attempts by country. 329 worldwide, a record year.","c-launch"),chartSec("artc","Scientific articles","Peer-reviewed articles, latest year.","c-art"),
  ks.some(k=>MS[k])?chartSec("ms","Milestones","Each dot is a first. Hover for the event.","c-ms",{wide:1,extra:msList(ks)}):null,
  ks.some(k=>FACTS3.space["Space agency"][k])?SX("facts","Space programmes","",factsTable(Object.keys(FACTS3.space).map(l=>f3("space",l)),ks.filter(k=>FACTS3.space["Space agency"][k]),f),{wide:1}):null];break;
 case "time":a=[SX("clocks","Local time now",f?"Live clocks for the capital and every other UTC offset in use.":"Live clocks for the capitals of the selected countries.",clocksHTML(f,ks),{wide:1}),
  chartSec("day","Day length through the year","Hours of daylight in each capital, calculated from the sun's position. The dashed line is today.","c-day",{wide:1}),
  SX("facts","Time facts","",factsTable([["Capital time zone",k=>C[k].capTz+" ("+tzOffset(C[k].capTz)+")"],["UTC offsets in use",k=>C[k].tz.map(t=>"UTC"+t).join(", ")],["Daylight saving",k=>C[k].dst?"Yes":"No"],...Object.keys(FACTS3.time).map(l=>f3("time",l))],ks,f),{wide:1})];break;
 default:a=[]}
 if(cat!=="population"&&cat!=="time")a.push(cmpSec(cat,f,ks));
 if(cat==="population")a.push(cmpSec("population",f,ks));
 return a.filter(Boolean)}

/* ---------- category charts ---------- */
const rowsOf=(ks,m,noW)=>[...ks,...(SHOWW&&!noW&&!(m&&m.tot)?["world"]:[])].filter(k=>!m||m.v[k]!=null);
function rowBar(cid,mid,ks,o={}){const m=MD[mid],rk=rowsOf(ks,m,o.noWorld);if(!rk.length)return;
 return groupBar(cid,rk.map(nmK),[{l:m.n,cs:rk.map(k=>COL[k]),d:rk.map(k=>m.v[k])}],{fmt:v=>fv(m,v),...o})}
function groupBar(cid,labels,series,o={}){return mk(cid,{type:"bar",data:{labels,datasets:series.map(s=>({label:s.l,data:s.d,backgroundColor:s.cs||(ctx=>vGrad(s.c,1,.6)(ctx)),borderColor:css("--line"),borderWidth:1.5,borderRadius:6,maxBarThickness:46}))},
  options:O({x:{grid:{display:false},ticks:{color:css("--ink"),autoSkip:false,maxRotation:labels.length>6?40:0}},y:{type:o.log?"logarithmic":undefined,beginAtZero:!o.log,min:o.log?Math.pow(10,Math.floor(Math.log10(Math.max(1,Math.min(...series.flatMap(s=>s.d).filter(v=>v>0)))))):o.min,ticks:{callback:v=>o.log&&!/^10*$/.test(String(v))?"":(o.fmt?o.fmt(v):v),maxTicksLimit:6}},
   legend:series.length>1,cb:{label:x=>` ${x.dataset.label}: ${x.parsed.y==null?"n/a":o.fmt?o.fmt(x.parsed.y):x.parsed.y}`}})})}
function stackBar(cid,labels,series){return mk(cid,{type:"bar",data:{labels,datasets:series.map(s=>({label:s.l,data:s.d,backgroundColor:s.c,borderColor:css("--line"),borderWidth:1.5,borderSkipped:false,maxBarThickness:32}))},
 options:O({x:{stacked:true,min:0,max:100,ticks:{callback:v=>v+"%"}},y:{stacked:true,grid:{display:false},ticks:{color:css("--ink")}},legend:true,cb:{label:x=>` ${x.dataset.label}: ${(+x.parsed.x).toFixed(1)}%`},extra:{indexAxis:"y",interaction:{mode:"index",axis:"y",intersect:false}}})})}
function shareDonut(cid,mid,ks){if(!$("#"+cid))return;const m=MD[mid],w=m.v.world;if(!w)return;const show=(ks||[]).filter(k=>m.v[k]!=null).slice(0,7);if(!show.length){donut(cid,[{l:"World",v:100,c:COL.world,t:fv(m,w)}],{top:fv(m,w),sub:"world total"});legendList(cid+"-lg",[{l:"World total",v:100,c:COL.world,t:fv(m,w)}],`<div><i></i><span class="muted">Add countries above to see their share</span><span></span></div>`);return}
 const pc=show.map(k=>m.v[k]/w*100),rest=Math.max(0,100-pc.reduce((a,b)=>a+b,0));
 const cells=[...show.map((k,i)=>({l:C[k].name,v:pc[i],c:COL[k],t:fv(m,m.v[k])})),{l:"Rest of world",v:rest,c:alpha(css("--muted"),.3)}];
 donut(cid,cells,{top:(100-rest).toFixed(1)+"%",sub:show.length===1?esc(C[show[0]].name):"in these "+show.length});
 legendList(cid+"-lg",cells,`<div><i></i><span class="muted">World, ${yRange(m,["world"])}</span><span class="mono">${fv(m,w)}</span></div>`);
 const ch=$("#"+cid+"-c");if(ch&&!ch.dataset.bound){ch.dataset.bound=1;ch.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;ch.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));redraw(cid,()=>shareDonut(cid,b.dataset.m,ks))})}}
const srcC=i=>adj(MIXS[i][1],isDark());
function drawMix(k){const rows=ow(k).mix;if(!rows)return;const other=r=>r?Math.max(0,+(100-r.reduce((a,b)=>a+(b||0),0)).toFixed(1)):null;
 const pts=MIXY.map((y,j)=>[y,rows[j]]).filter(p=>p[1]);
 redraw("c-mix",()=>mk("c-mix",{type:"line",data:{datasets:MIXS.map(([n],i)=>({label:n,data:pts.map(([y,r])=>({x:y,y:i<6?(r[i]||0):other(r)})),borderColor:css("--line"),backgroundColor:alpha(srcC(i),.88),fill:i===0?"origin":"-1",pointRadius:0,tension:.3,borderWidth:1}))},
  options:O({x:{type:"linear",min:pts[0][0],max:2025,ticks:{stepSize:5,callback:v=>v}},y:{stacked:true,min:0,max:100,ticks:{callback:v=>v+"%"}},legend:true,cb:{title:i=>`${nmK(k)} · ${i[0].parsed.x}`,label:x=>` ${x.dataset.label}: ${(+x.raw.y).toFixed(1)}%`}})}));
 const r=pts[pts.length-1][1];$("#mix-lbl").textContent=`Mix in ${ow(k).mixY||pts[pts.length-1][0]}`;
 redraw("c-mix25",()=>{const cells=MIXS.map(([n],i)=>({l:n,v:i<6?(r[i]||0):other(r),c:srcC(i)}));donut("c-mix25",cells,{top:((r[3]||0)+(r[4]||0)+(r[5]||0)).toFixed(0)+"%",sub:"hydro, wind, solar"});legendList("c-mix25-lg",cells)})}
const MSTART=[1,32,60,91,121,152,182,213,244,274,305,335],MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function initCat(cat,f){const ks=selFor(f),X=COL.x,wk=SHOWW?["world"]:[];
 const ser=(cid,field,y0,o={})=>tsChart(cid,[...ks,...(o.noWorld&&ks.length?[]:wk)].map(k=>({k,label:nmK(k),pts:(ow(k)[field]||[]).map((v,i)=>[y0+i,v])})),{focus:f,...o});
 switch(cat){
 case "population":if(f)initCountry(f,ks);else{initShare();initStripes();initBubble("pb",ks);initCompare(ks,null)}break;
 case "economy":ser("c-gdp","gdpS",2000,{fmt:v=>"$"+big(v),noWorld:1,step:5});shareDonut("c-gdpshare","gdp",ks);
  {const rk=rowsOf(ks,null);const g=id=>rk.map(k=>MD[id].v[k]);const A=g("agri_gdp"),I=g("ind_gdp"),S2=g("srv_gdp");
   stackBar("c-sector",rk.map(nmK),[{l:"Agriculture",c:X[3],d:A},{l:"Industry",c:X[2],d:I},{l:"Services",c:X[0],d:S2},{l:"Taxes & other",c:alpha(css("--muted"),.35),d:rk.map((k,i)=>A[i]!=null&&I[i]!=null&&S2[i]!=null?Math.max(0,+(100-A[i]-I[i]-S2[i]).toFixed(1)):null)}])}break;
 case "energy":{const box=$("#mix-k"),first=box&&box.querySelector("button");if(first){drawMix(first.dataset.k);box.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;box.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));drawMix(b.dataset.k)})}
  const mixSer=(cid,fn)=>tsChart(cid,[...ks,...wk].filter(k=>ow(k).mix).map(k=>({k,label:nmK(k),pts:MIXY.map((y,j)=>[y,ow(k).mix[j]?fn(ow(k).mix[j]):null])})),{focus:f,fmt:v=>(+v).toFixed(0)+"%",tip:v=>(+v).toFixed(1)+"%",step:5,style:"area"});
  mixSer("c-coal",r=>r[0]);mixSer("c-ws",r=>+((r[4]||0)+(r[5]||0)).toFixed(1));break}
 case "environment":ser("c-co2","co2S",1990,{fmt:v=>big(v*1e6)+" t",noWorld:1,step:5});shareDonut("c-co2share","co2",ks);rowBar("c-co2pc","co2pc",ks);break;
 case "health":tsChart("c-le",[...ks,...wk].map(k=>({k,label:nmK(k),pts:YEARS.map((y,i)=>[y,ow(k).le[i]])})),{focus:f,fmt:v=>(+v).toFixed(0)+" yrs",tip:v=>v+" years",zero:false,forecast:true,step:10,style:"area"});
  {const rk=rowsOf(ks,null);groupBar("c-lefm",rk.map(nmK),[{l:"Women",c:X[1],d:rk.map(k=>MD.le_f.v[k])},{l:"Men",c:X[0],d:rk.map(k=>MD.le_m.v[k])}],{fmt:v=>v+" yrs",min:40})}
  rowBar("c-hexp","hexp_pc",ks,{log:true});break;
 case "food":shareDonut("c-cshare","cereal",ks);{const rk=rowsOf(ks,null);groupBar("c-farm",rk.map(nmK),[{l:"Share of workers in farming",c:X[3],d:rk.map(k=>MD.agri_emp.v[k])},{l:"Farming's share of GDP",c:X[2],d:rk.map(k=>MD.agri_gdp.v[k])}],{fmt:v=>v==null?"n/a":(+v).toFixed(1)+"%"})}break;
 case "water":{const rk=rowsOf(ks,MD.wag);stackBar("c-wuse",rk.map(nmK),[{l:"Agriculture",c:X[3],d:rk.map(k=>MD.wag.v[k])},{l:"Industry",c:X[4],d:rk.map(k=>MD.win.v[k])},{l:"Homes & cities",c:X[0],d:rk.map(k=>MD.win.v[k]!=null?Math.max(0,+(100-MD.wag.v[k]-MD.win.v[k]).toFixed(1)):null)}])}
  shareDonut("c-wdshare","wd",ks);rowBar("c-rpc","renew_pc",ks);break;
 case "education":{const rk=rowsOf(ks,null);groupBar("c-enrol",["Primary","Secondary","University"],rk.map(k=>({l:nmK(k),c:COL[k],d:[MD.prim.v[k],MD.sec.v[k],MD.ter.v[k]]})),{fmt:v=>v==null?"n/a":(+v).toFixed(0)+"%"})}rowBar("c-edu","edu",ks);rowBar("c-ptr","ptr",ks);break;
 case "technology":ser("c-inet","inetS",2000,{fmt:v=>(+v).toFixed(0)+"%",max:100,step:5});shareDonut("c-patshare","patents",ks);rowBar("c-rd","rd",ks);break;
 case "society":{const rk=rowsOf(ks,null);stackBar("c-agestr",rk.map(nmK),[{l:"Under 15",c:X[2],d:rk.map(k=>MD.age0.v[k])},{l:"15–64",c:X[0],d:rk.map(k=>+(100-MD.age0.v[k]-MD.age65.v[k]).toFixed(1))},{l:"65 and over",c:X[1],d:rk.map(k=>MD.age65.v[k])}])}break;
 case "government":shareDonut("c-milshare","mil",ks);rowBar("c-milg","milgdp",ks);break;
 case "transport":shareDonut("c-teushare","teu",ks);rowBar("c-airpc","air_pc",ks);break;
 case "biodiversity":groupBar("c-thr",["Mammals","Birds","Fish","Plants"],ks.filter(k=>MD.thr.v[k]!=null).map(k=>({l:C[k].name,c:COL[k],d:THRK.map(i=>C[k].m[i][0])})));rowBar("c-prot","prot",ks);rowBar("c-forest","forest",ks);break;
 case "geography":{const g=ks.filter(k=>GEO3[k]);if(g.length)mk("c-elev",{type:"bar",data:{labels:g.map(nmK),datasets:[{label:"Elevation range",data:g.map(k=>[GEO3[k].low,GEO3[k].high]),backgroundColor:g.map(k=>COL[k]),borderColor:css("--line"),borderWidth:1.5,borderRadius:6,borderSkipped:false,maxBarThickness:56}]},
  options:O({x:{grid:{display:false},ticks:{color:css("--ink")}},y:{ticks:{callback:v=>fmt(v)+" m"}},cb:{label:x=>{const e=GEO3[g[x.dataIndex]];return [` Highest: ${e.hn}, ${fmt(e.high)} m`,` Lowest: ${e.ln}, ${e.low} m`]}}})});break}
 case "space":groupBar("c-launch",["United States","China","Russia","India","Rest of world"],[{l:"Orbital launches",cs:[COL["united-states"],COL.china,COL.russia,COL.india,COL.world],d:[181,92,17,5,34]}]);rowBar("c-art","articles",ks,{noWorld:true});
  {const ms=ks.filter(k=>MS[k]);if(ms.length)mk("c-ms",{type:"scatter",data:{datasets:ms.map((k,lane)=>({label:C[k].name,data:MS[k].map(([y,t])=>({x:y,y:lane,t})),backgroundColor:COL[k],borderColor:css("--line"),borderWidth:2,pointRadius:8,pointHoverRadius:11}))},
   options:O({x:{type:"linear",min:1955,max:2030,ticks:{stepSize:10,callback:v=>v}},y:{min:-.7,max:ms.length-.3,grid:{display:false},afterBuildTicks:ax=>{ax.ticks=ms.map((_,i)=>({value:i}))},ticks:{callback:v=>ms[v]?C[ms[v]].name:"",color:css("--ink")}},cb:{title:()=>"",label:x=>` ${x.raw.x} · ${x.raw.t}`},extra:{interaction:{mode:"nearest",intersect:true}}})})}break;
 case "time":{startClocks();const today=doyOf(new Date());
  const ds=ks.map(k=>{const lat=C[k].capLoc[0],c=COL[k],d=f&&k!==f;return {label:C[k].capital,data:Array.from({length:183},(_,i)=>{const doy=1+i*2;return {x:doy,y:+(8*hourAngle(lat,solar(doy).dec)/60).toFixed(2)}}),borderColor:d?alpha(c,.7):c,backgroundColor:d?"transparent":vGrad(c,.25,0),fill:d?false:"origin",borderWidth:d?1.8:3,pointRadius:0,tension:.3}});
  const todayLine={id:"today",afterDatasetsDraw(ch){const x=ch.scales.x.getPixelForValue(today),a=ch.chartArea,c=ch.ctx;c.save();c.strokeStyle=css("--ink");c.setLineDash([4,4]);c.beginPath();c.moveTo(x,a.top);c.lineTo(x,a.bottom);c.stroke();c.restore()}};
  mk("c-day",{type:"line",data:{datasets:ds},plugins:[todayLine],options:O({x:{type:"linear",min:1,max:365,afterBuildTicks:ax=>{ax.ticks=MSTART.map(v=>({value:v}))},ticks:{callback:v=>MN[MSTART.indexOf(v)]||""}},y:{min:6,max:18,ticks:{callback:v=>v+" h"}},legend:true,
   cb:{title:i=>new Date(Date.UTC(2026,0,i[0].parsed.x)).toLocaleDateString("en-GB",{day:"numeric",month:"short",timeZone:"UTC"}),label:x=>{const h=x.parsed.y;return ` ${x.dataset.label}: ${Math.floor(h)} h ${Math.round((h%1)*60)} min`}}})});break}
 }}

/* ---------- layout ---------- */
function catStrip(k,cur){return `<nav class="cstrip" aria-label="Categories">${CATS.map((x,i)=>{const col=catCol(i),on=x.id===cur;const href=k?`#${k}${x.id==="population"?"":"-"+x.id}`:`#cat-${x.id}`;
 return `<a class="cpill ${on?"on":""}" href="${href}" style="--cc:${col};${on?`color:${textOn(col)}`:""}"><i></i>${x.n}</a>`}).join("")}</nav>`}
function renderSections(secs){const card=s=>s.raw?s.html.replace('<div class="card','<div id="s-'+s.id+'" class="card'):`<section class="card ${s.wide?"wide":""}" id="s-${s.id}"><div class="card-h"><div><h3>${s.t}</h3>${s.lead?`<p>${s.lead}</p>`:""}</div></div>${s.html}</section>`;
 return `<div class="lay"><nav class="side" aria-label="Sections">${secs.map(s=>`<button data-go="s-${s.id}">${s.t||({stripes:"Growth stripes",transition:"Demographic transition",bubble:"Demographic transition",share:"Who lives where",cmpc:"Compared over time"}[s.id]||s.id)}</button>`).join("")}</nav><div class="grid">${secs.map(card).join("")}</div></div>`}
const srcNote=cat=>`<div class="src" style="margin-top:20px">${cat==="population"?"Source: UN World Population Prospects 2024 (medium variant), 1 July estimates. The live counter interpolates the 2025–26 change.":"Sources: World Bank World Development Indicators (latest year per country, shown under each figure), Ember and Global Carbon Project via Our World in Data, UN WPP 2024, IMF, CIA World Factbook. Years can differ between countries."}</div>`;
function pageCountry(k,cat){CUR_F=k;const c=C[k],ci=CATS.findIndex(x=>x.id===cat);
 const head=`<div class="c-head">${flag(k,80)}<div><div class="crumb"><a href="#countries">Countries</a> / ${esc(c.region)} / ${esc(c.subregion||"")}${cat!=="population"?` / ${CATS[ci].n}`:""}</div><h1 style="color:${COL[k]}">${esc(c.name)}</h1>
  <div class="chips" style="margin-top:8px"><span class="chip" style="cursor:default">#${c.rank} by population</span><span class="chip" style="cursor:default">Capital: ${esc(c.capital)}</span><a class="chip" href="#compare" data-cmpwith="${k}">⇄ Compare</a></div></div>
  <div class="c-live"><span class="label"><span class="live-dot"></span>Population · live</span><div class="bignum mono" data-live="${k}"></div></div></div>`;
 return head+catStrip(k,cat)+(cat!=="population"?`<div class="sec-title" style="margin-top:0"><h2 style="color:${catCol(ci)}">${CATS[ci].n}</h2><p>${CATS[ci].d}. <a href="#cat-${cat}">See the world ranking →</a></p></div>`:"")+selBar(k)+renderSections(catSections(cat,k))+srcNote(cat)}
function pageCat(id){CUR_F=null;const i=CATS.findIndex(x=>x.id===id);const c=CATS[i];if(!c)return pageHome();const col=catCol(i);
 return `<div class="crumb"><a href="#categories">Categories</a> / ${c.n}</div><div class="cat-head"><div><h1 style="color:${col}">${c.n}</h1><p class="muted" style="margin:6px 0 0">${c.d}, for ${KEYS.length} countries.</p></div></div>
 ${catStrip(null,id)}${selBar(null)}${renderSections(catSections(id,null))}${srcNote(id)}`}

/* ---------- compare page ---------- */
let CMP={keys:["india","china","united-states"],cats:["population","economy","health","technology","environment"]};
try{const s=JSON.parse(localStorage.getItem("omni-compare")||"{}");if(Array.isArray(s.keys)){const k=s.keys.map(x=>x==="usa"?"united-states":x).filter(x=>C[x]||x==="world");if(k.length)CMP.keys=k}if(Array.isArray(s.cats))CMP.cats=s.cats.filter(c=>CATS.some(x=>x.id===c))}catch(e){}
const saveCmp=()=>{try{localStorage.setItem("omni-compare",JSON.stringify(CMP))}catch(e){}};
const PRESETS_K=[["Big three",["india","china","united-states"]],["G7",["united-states","japan","germany","united-kingdom","france","italy","canada"]],["BRICS",["brazil","russia","india","china","south-africa"]],["Europe",["germany","united-kingdom","france","italy","spain","poland"]],["Africa's largest",["nigeria","ethiopia","egypt","dr-congo","tanzania"]],["Southeast Asia",["indonesia","philippines","vietnam","thailand","malaysia","myanmar"]]];
const PRESETS_C=[["all","All",CATS.map(c=>c.id)],["power","Economy & power",["economy","energy","government","technology","space"]],["life","Quality of life",["health","education","water","food","society"]],["planet","Planet",["environment","energy","biodiversity","water","geography"]],["clear","Clear",[]]];
function scoreMetric(m,keys){const d=dirOf(m.id),ks=keys.filter(k=>k!=="world"&&m.v[k]!=null);if(!d||ks.length<2)return null;
 const best=d>0?Math.max(...ks.map(k=>m.v[k])):Math.min(...ks.map(k=>m.v[k]));const s={};ks.forEach(k=>{const v=m.v[k];s[k]=clamp(d>0?(best>0?v/best:0):(v>0?best/v:1),0,1)});return {s,win:ks.filter(k=>m.v[k]===best)}}
const TSC={population:{f:"pop",x:YEARS,fmt:short,tip:fmt,t:"Population, 1955–2050",forecast:true,noW:1},economy:{f:"gdpS",x:2000,fmt:v=>"$"+big(v),t:"GDP since 2000, current US$",noW:1},
 environment:{f:"co2S",x:1990,fmt:v=>big(v*1e6)+" t",t:"CO₂ emissions since 1990",noW:1},health:{f:"le",x:YEARS,fmt:v=>(+v).toFixed(0)+" yrs",t:"Life expectancy, 1955–2050",zero:false,forecast:true},
 technology:{f:"inetS",x:2000,fmt:v=>(+v).toFixed(0)+"%",t:"Internet users since 2000, % of population",max:100}};
function cmpBlock2(m,sel){const nReal=sel.filter(k=>k!=="world").length,ks=sel.filter(k=>!(k==="world"&&(m.v.world==null||(m.tot&&nReal>0)))),r=scoreMetric(m,sel),d=dirOf(m.id);
 const mx=Math.max(...ks.map(k=>Math.max(m.v[k]??0,0)),m.ref||0)||1;const real=ks.filter(k=>k!=="world"&&m.v[k]!=null);
 let ratio="";if(real.length===2&&m.v[real[0]]>0&&m.v[real[1]]>0&&m.f!=="pct"){const [a,b]=m.v[real[0]]>=m.v[real[1]]?real:[real[1],real[0]];const x=m.v[a]/m.v[b];if(x>=1.15)ratio=`${esc(nmK(a))}: ${x<10?x.toFixed(1):x.toFixed(0)}× ${esc(nmK(b))}`}
 return `<div class="cmp"><h4>${m.n}</h4><div class="meta">${[yRange(m,ks),m.src,d>0?"higher is better":d<0?"lower is better":""].filter(Boolean).join(" · ")}</div>
 ${ks.map(k=>{const v=m.v[k],w=v==null?0:Math.max(v,0)/mx*100,win=r&&r.win.includes(k);return `<div class="cmp-r ${win?"foc":""} ${k==="world"?"w":""}"><span class="nm">${win?"★ ":""}${esc(nmK(k))}</span><span class="track"><i style="width:${w.toFixed(1)}%;background:${COL[k]}"></i>${m.ref?`<b class="ref" style="left:${(m.ref/mx*100).toFixed(1)}%"></b>`:""}</span><span class="mono">${fv(m,v)}</span></div>`}).join("")}
 ${m.ref?`<div class="refl">▌ ${m.refl}</div>`:""}${ratio?`<div class="refl">${ratio}</div>`:""}</div>`}
function pageCompare(){CUR_F=null;const sel=CMP.keys.filter(k=>C[k]||k==="world"),cats=CATS.filter(c=>CMP.cats.includes(c.id)),real=sel.filter(k=>k!=="world");
 const cChip=c=>{const i=CATS.indexOf(c),col=catCol(i),on=CMP.cats.includes(c.id);return `<button class="chip" data-cmpc="${c.id}" aria-pressed="${on}" style="${on?`background:${col};border-color:${col};color:${textOn(col)}`:""}"><i style="background:${on?textOn(col):col}"></i>${c.n}</button>`};
 const head=`<div class="cat-head"><div><h1>Compare countries</h1><p class="muted" style="margin:6px 0 0">Pick up to 8 countries and any categories. Everything below updates instantly, and your selection is remembered.</p></div></div>
 <div class="card cmp-ctl"><div class="ctl-row"><div><span class="label">1 · Countries</span><p class="muted">${real.length} selected. Search to add, tap to remove.</p></div><div>
  <div class="chips">${real.map(k=>`<button class="chip" data-cmpk="${k}" aria-pressed="true" style="background:${COL[k]};border-color:var(--line);color:${textOn(COL[k])}">${flag(k,18)}${esc(C[k].name)}<span class="x">✕</span></button>`).join("")}
  <button class="chip" data-cmpk="world" aria-pressed="${sel.includes("world")}"><i style="background:${COL.world}"></i>World average</button>
  <div class="search" data-search data-mode="cmp"><input type="search" placeholder="Add a country…" autocomplete="off" aria-label="Add a country"><ul hidden></ul></div></div>
  <div class="chips" style="margin-top:10px"><span class="muted" style="font-size:.8rem">Groups:</span>${PRESETS_K.map(([l],i)=>`<button class="chip" data-cmpg="${i}">${l}</button>`).join("")}</div></div></div>
 <div class="ctl-row"><div><span class="label">2 · Categories</span><p class="muted">${cats.length} of ${CATS.length} selected</p></div><div><div class="chips">${CATS.map(cChip).join("")}</div>
 <div class="chips" style="margin-top:10px"><span class="muted" style="font-size:.8rem">Quick picks:</span>${PRESETS_C.map(([id,l])=>`<button class="chip" data-cmpp="${id}">${l}</button>`).join("")}</div></div></div></div>`;
 if(!sel.length||!cats.length)return head+`<div class="card" style="margin-top:16px;text-align:center;padding:48px 20px"><h3>${!sel.length?"Pick a country or the World average":"Pick at least one category"}</h3><p class="muted">Use the controls above to build your comparison.</p></div>`;
 const sc=cats.map(c=>{const ms=metricsOf(c.id).map(m=>({m,r:scoreMetric(m,sel)})).filter(x=>x.r);const avg={},wins={};
  real.forEach(k=>{const xs=ms.map(x=>x.r.s[k]).filter(v=>v!=null);avg[k]=xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length*100):null;wins[k]=ms.filter(x=>x.r.win.includes(k)).length});
  const top=real.length>1&&ms.length?real.reduce((a,b)=>(avg[b]??-1)>(avg[a]??-1)?b:a):null;return {c,ms,avg,wins,top}});
 const scored=sc.filter(x=>x.ms.length),N=scored.reduce((a,x)=>a+x.ms.length,0);let board="";
 if(real.length>=2&&N){const tw=Object.fromEntries(real.map(k=>[k,scored.reduce((a,x)=>a+x.wins[k],0)]));const mxw=Math.max(...Object.values(tw))||1;
  board=`<section class="card"><div class="card-h"><div><h2>Scoreboard</h2><p>Who comes out ahead on ${N} indicators where higher or lower is clearly better. Neutral facts such as area are shown but not scored. Ties count for both.</p></div></div>
  <div class="score-grid">${real.map(k=>`<div class="score" style="--cc:${COL[k]}">${flag(k,32)}<b>${esc(C[k].name)}</b><span class="n">${tw[k]}</span><span class="muted">best on ${tw[k]} of ${N}</span><span class="mini wide"><i style="width:${(tw[k]/mxw*100).toFixed(0)}%;background:${COL[k]}"></i></span></div>`).join("")}</div>
  <div class="tbl-wrap" style="margin-top:16px"><table class="sc-table"><thead><tr><th>Category</th>${real.map(k=>`<th>${esc(C[k].name)}</th>`).join("")}<th>Leader</th></tr></thead><tbody>
  ${scored.map(x=>`<tr><td><i class="dot" style="background:${catCol(CATS.indexOf(x.c))}"></i>${x.c.n} <small class="muted">${x.ms.length} indicator${x.ms.length>1?"s":""}</small></td>${real.map(k=>`<td><span class="mini"><i style="width:${x.avg[k]??0}%;background:${COL[k]}"></i></span>${x.avg[k]??"–"}</td>`).join("")}<td><b style="color:${COL[x.top]}">${esc(C[x.top].name)}</b></td></tr>`).join("")}
  </tbody></table></div><p class="note">Score: each country's value as a share of the best value among the selected countries (or the inverse when lower is better), averaged per category. 100 = best on every indicator. It depends on which countries you pick.</p></section>
  <section class="card"><div class="card-h"><div><h2>Profile</h2><p>Category scores on one chart. A bigger shape means stronger across the categories you picked.</p></div></div><div class="chart lg"><canvas id="c-cprof"></canvas></div></section>`}
 else board=`<p class="note" style="margin-top:16px">${real.length?"Add a second country to see who leads on each indicator.":"Showing world figures. Add countries to compare them with the world and see a scoreboard."}</p>`;
 const secs=cats.map(c=>{const i=CATS.indexOf(c),col=catCol(i),x=sc.find(s=>s.c===c),ms=metricsOf(c.id),ts=TSC[c.id];
  return `<section class="card" id="cc-${c.id}"><div class="card-h"><div><h2 style="color:${col}">${c.n}</h2><p>${c.d}.</p></div><div class="chips">${x.top?`<span class="lead-pill">Leads: <b style="color:${COL[x.top]}">${esc(C[x.top].name)}</b></span>`:""}<a class="chip" href="#cat-${c.id}">World ranking →</a></div></div>
  ${ts?`<h3 style="font-size:.95rem;margin-bottom:8px">${ts.t}</h3><div class="chart"><canvas id="cc-ts-${c.id}"></canvas></div><div style="height:18px"></div>`:""}
  ${c.id==="time"?clocksHTML(null,real):""}
  ${ms.length?`<div class="cmp-grid">${ms.map(m=>cmpBlock2(m,sel)).join("")}</div>`:""}</section>`}).join("");
 const allRows=cats.flatMap(c=>metricsOf(c.id).map(m=>[c,m]));
 const table=allRows.length?`<section class="card"><div class="card-h"><div><h2>All indicators</h2><p>Every figure in one table. ★ marks the best value where higher or lower is better.</p></div></div><div class="tbl-wrap"><table class="all-t"><thead><tr><th>Indicator</th>${sel.map(k=>`<th>${esc(nmK(k))}</th>`).join("")}</tr></thead><tbody>
  ${allRows.map(([c,m])=>{const r=scoreMetric(m,sel);return `<tr><td><i class="dot" style="background:${catCol(CATS.indexOf(c))}"></i>${m.n}</td>${sel.map(k=>{const w=r&&r.win.includes(k);return `<td style="${w?`color:${COL[k]};font-weight:700`:""}">${w?"★ ":""}${fv(m,m.v[k])}${m.y[k]?` <small class="muted">${m.y[k]}</small>`:""}</td>`}).join("")}</tr>`}).join("")}</tbody></table></div></section>`:"";
 return head+`<div class="cmp-out">${board}${secs}${table}</div>`}
function initComparePage(){const sel=CMP.keys.filter(k=>C[k]||k==="world"),real=sel.filter(k=>k!=="world"),cats=CATS.filter(c=>CMP.cats.includes(c.id));
 cats.forEach(c=>{const ts=TSC[c.id];if(!ts||!$("#cc-ts-"+c.id))return;const keys=sel.filter(k=>!(k==="world"&&ts.noW&&real.length));
  tsChart("cc-ts-"+c.id,keys.map(k=>({k,label:nmK(k),pts:(ow(k)[ts.f]||[]).map((v,i)=>[Array.isArray(ts.x)?ts.x[i]:ts.x+i,v])})),{fmt:ts.fmt,tip:ts.tip,forecast:ts.forecast,zero:ts.zero,max:ts.max,step:Array.isArray(ts.x)?10:5,style:"area"})});
 if($("#c-cprof")){const scored=cats.map(c=>({c,ms:metricsOf(c.id).map(m=>scoreMetric(m,sel)).filter(Boolean)})).filter(x=>x.ms.length);
  const avg=(x,k)=>{const xs=x.ms.map(r=>r.s[k]).filter(v=>v!=null);return xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length*100):0};
  if(scored.length>=3)mk("c-cprof",{type:"radar",data:{labels:scored.map(x=>x.c.n),datasets:real.map(k=>({label:C[k].name,data:scored.map(x=>avg(x,k)),borderColor:COL[k],backgroundColor:alpha(COL[k],.18),borderWidth:2.6,pointBackgroundColor:COL[k],pointRadius:3}))},
   options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:"bottom",labels:{color:css("--ink"),usePointStyle:true,boxWidth:8}},tooltip:{...tipStyle(),callbacks:{label:x=>` ${x.dataset.label}: ${x.parsed.r}/100`}}},scales:{r:{min:0,max:100,ticks:{display:false,stepSize:25},grid:{color:css("--grid")},angleLines:{color:css("--grid")},pointLabels:{color:css("--ink"),font:{size:12,family:css("--f-body")}}}}}});
  else groupBar("c-cprof",scored.map(x=>x.c.n),real.map(k=>({l:C[k].name,c:COL[k],d:scored.map(x=>avg(x,k))})),{fmt:v=>v+"/100"})}
 startClocks()}
document.addEventListener("click",e=>{const t=e.target.closest("[data-cmpk],[data-cmpc],[data-cmpp],[data-cmpg],[data-cmpwith]");if(!t)return;const d=t.dataset;
 if(d.cmpwith){if(!CMP.keys.includes(d.cmpwith))CMP.keys=[...CMP.keys,d.cmpwith].slice(-8);saveCmp();return}
 if(d.cmpk)CMP.keys=CMP.keys.includes(d.cmpk)?CMP.keys.filter(x=>x!==d.cmpk):[...CMP.keys,d.cmpk];
 else if(d.cmpc)CMP.cats=CMP.cats.includes(d.cmpc)?CMP.cats.filter(x=>x!==d.cmpc):[...CMP.cats,d.cmpc];
 else if(d.cmpg!=null)CMP.keys=[...PRESETS_K[+d.cmpg][1],...(CMP.keys.includes("world")?["world"]:[])];
 else{const p=PRESETS_C.find(x=>x[0]===d.cmpp);if(p)CMP.cats=[...p[2]]}
 saveCmp();route(true)});

/* ---------- pages ---------- */
function pageHome(){CUR_F=null;
 const rows=arr=>arr.map(([l,k,cls,pre])=>`<div class="crow"><span>${l}</span><span class="mono ${cls||""}" data-live="${k}" ${pre?`data-pre="${pre}"`:""}></span></div>`).join("");
 const grp=(i,title,body)=>`<div class="card cgroup" style="--cc:${catCol(i)}"><h3><i></i>${title}</h3>${body}</div>`;
 return `<section class="hero">
  <div class="meter"><span class="label"><span class="live-dot"></span>World population · live estimate</span><h1 class="bignum mono" data-live="world"></h1>
   <div class="subcount"><div><span class="label">Births today</span><span class="mono" data-live="births:today"></span></div><div><span class="label">Deaths today</span><span class="mono" data-live="deaths:today"></span></div><div><span class="label">Net growth today</span><span class="mono pos" data-live="growth:today"></span></div></div>
   <p class="muted" style="margin:0;font-size:.86rem">Growing by about ${fmt(WORLD_CHANGE)} people a year (+${WGR[NOW_IDX]}%). Projected to pass 9 billion in 2037.</p>
   <div class="search big" data-search><input type="search" placeholder="Find a country, e.g. Brazil, Japan, Kenya…" autocomplete="off" aria-label="Find a country"><ul hidden></ul></div>
   <div class="chart sm"><canvas id="c-world"></canvas></div></div>
  <div class="card">${globeBlock("globe-home")}</div>
 </section>
 <div class="sec-title"><h2>Live counters by category</h2><p>The Worldometer model, regrouped and extended. Every row ticks in real time.</p></div>
 <div class="counters">
  ${grp(0,"Population",rows([["Births this year","births:year"],["Deaths this year","deaths:year"],["Net growth this year","growth:year","pos"],...KEYS.slice(0,3).map(k=>[esc(C[k].name)+", now",k])]))}
  ${grp(3,"Environment & Energy",rows([["CO₂ emitted this year (t)","co2"],["All greenhouse gases (t CO₂e)","ghg"],["Electricity used this year (MWh)","elec"]]))}
  ${grp(1,"Economy & Government",rows([["World GDP produced this year","gdp","","$"],["Military spending this year","mil","","$"]]))}
  ${grp(8,"Technology & Science",rows([["People online now","inet"],["Patent applications this year","pat"],["Scientific articles this year","art"]]))}
  ${grp(5,"Food & Water",rows([["Cereals harvested this year (t)","cer"],["Fresh water withdrawn this year (m³)","wat"],["Undernourished people now","under"]]))}
  ${grp(11,"Transport & Space",rows([["Air passengers this year","air"],["Containers shipped this year (TEU)","teu"],["Orbital launches this year (2025 pace)","launch"]]))}
 </div><p class="note">Yearly counters spread the latest annual world total (World Bank, 2023–2025) evenly from 1 January. They are estimates, not live measurements.</p>
 <div class="sec-title"><h2>The big picture</h2><p>India passed China in 2023. China is now shrinking, while Africa's populations keep growing fast.</p></div>
 <div class="row2">${shareBlock()}<div class="card">${(()=>{const t=KEYS.slice(0,10);return `<div class="card-h"><div><h3>Fastest and slowest growing</h3><p>Population growth per year, 2026, among the ${KEYS.length} countries.</p></div></div><div class="chart"><canvas id="c-gr-rank"></canvas></div>`})()}</div></div>
 <div style="margin-top:16px">${bubbleBlock("hb")}</div>
 <div class="sec-title"><h2>Country pages</h2><p>${KEYS.length} countries and territories, ranked by population. Search above or spin the globe.</p></div>${countryCards(KEYS.slice(0,18))}
 <p style="margin-top:14px"><a class="btn" href="#countries">See all ${KEYS.length} countries →</a></p>
 <div class="sec-title"><h2>Categories</h2><p>${CATS.length} categories with data for every country page, and world rankings for each.</p></div>${catGrid()}`}
function initHome(){tsChart("c-world",[{k:"world",label:"World",pts:YEARS.map((y,i)=>[y,WORLD[i]]),c:css("--accent")}],{tip:fmt,fmt:short,forecast:true,step:10,style:"bar"});
 initGlobe("globe-home");initShare();initBubble("hb",KEYS.slice(0,3));
 const r=[...KEYS].sort((a,b)=>C[b].gr[NOW_IDX]-C[a].gr[NOW_IDX]),pick=[...r.slice(0,6),...r.slice(-6)];
 groupBar("c-gr-rank",pick.map(k=>C[k].name),[{l:"Growth per year",cs:pick.map(k=>divColor(C[k].gr[NOW_IDX])),d:pick.map(k=>C[k].gr[NOW_IDX])}],{fmt:v=>(+v).toFixed(1)+"%"})}
let SORT={k:"pop",d:-1};
const TCOLS=[["rank","#",k=>C[k].rank,v=>v],["name","Country",k=>C[k].name,null],["pop","Population 2026",k=>C[k].pop[NOW_IDX],fmt],["gr","Yearly change",k=>C[k].gr[NOW_IDX],v=>(v>0?"+":"")+v+"%"],["chg","Net change",k=>C[k].change,signed],["dens","Density (P/km²)",k=>C[k].density,fmt],["land","Land area (km²)",k=>C[k].land,fmt],["mig","Migrants (net)",k=>C[k].mig[NOW_IDX],signed],["fer","Fertility",k=>C[k].fer[NOW_IDX],v=>v],["med","Median age",k=>C[k].med[NOW_IDX],v=>v],["urb","Urban %",k=>MD.urban.v[k],v=>v==null?"n/a":v.toFixed(1)+"%"],["shr","World share",k=>C[k].shr[NOW_IDX],pS]];
function pageCountries(){CUR_F=null;const col=TCOLS.find(c=>c[0]===SORT.k)||TCOLS[2];const rows=[...KEYS].sort((a,b)=>{const x=col[2](a),y=col[2](b);return typeof x==="string"?SORT.d*x.localeCompare(y):SORT.d*((x??-1e18)-(y??-1e18))});
 return `<div class="cat-head"><div><h1>Countries of the world</h1><p class="muted" style="margin:6px 0 0">${KEYS.length} countries and territories with UN population data, ranked by population. Spin the globe or search.</p></div></div>
 <div class="row2"><div class="card">${globeBlock("globe-c")}</div><div class="card" style="display:flex;flex-direction:column;gap:14px"><h3>Find a country</h3><div class="search big" data-search data-mode="globe"><input type="search" placeholder="Type a country: the globe spins to it" autocomplete="off" aria-label="Find a country on the globe"><ul hidden></ul></div>
  <p class="muted" style="margin:0;font-size:.88rem">Every coloured country has a full page with 16 categories.</p>
  <div class="chips">${["Asia","Africa","Europe","Americas","Oceania"].map(r=>`<span class="chip" style="cursor:default"><i style="background:${REGCOL[r]}"></i>${r}: ${KEYS.filter(k=>C[k].region===r).length}</span>`).join("")}</div>
  <h3 style="margin-top:6px">Largest by population</h3>${countryCards(KEYS.slice(0,6))}</div></div>
 <div class="sec-title"><h2>All countries by population</h2><p>Click a column to sort and a row to open the country. Data: UN WPP 2024 (1 July 2026 estimates).</p></div>
 <div class="card" style="padding:0;overflow:hidden"><div class="tbl-wrap" style="border:0;border-radius:0"><table class="sortable" id="ctable"><thead><tr>${TCOLS.map(c=>`<th data-sort="${c[0]}" ${c[0]===SORT.k?`aria-sort="${SORT.d>0?"ascending":"descending"}"`:""}>${c[1]}</th>`).join("")}</tr></thead>
 <tbody>${rows.map(k=>`<tr data-href="${k}">${TCOLS.map(c=>c[0]==="name"?`<td class="cn">${flag(k,22)}${esc(C[k].name)}</td>`:c[0]==="gr"?`<td style="color:${divColor(C[k].gr[NOW_IDX])}">${c[3](c[2](k))}</td>`:`<td>${c[3](c[2](k))}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`}
function initCountries(){initGlobe("globe-c");const t=$("#ctable");if(!t)return;
 t.querySelector("thead").addEventListener("click",e=>{const th=e.target.closest("th");if(!th)return;const k=th.dataset.sort;SORT=SORT.k===k?{k,d:-SORT.d}:{k,d:k==="name"||k==="rank"?1:-1};route(true)});
 t.querySelector("tbody").addEventListener("click",e=>{const tr=e.target.closest("tr");if(tr)go(tr.dataset.href)})}
function pageAbout(){CUR_F=null;return `<div class="cat-head"><div><h1>About Omni</h1><p class="muted" style="margin:6px 0 0">Live world statistics with interactive charts for ${KEYS.length} countries and territories.</p></div></div>
 <div class="row2"><section class="card"><h3>Sources</h3><ul style="padding-left:18px;margin:10px 0 0;display:flex;flex-direction:column;gap:6px;font-size:.92rem">
  <li><b>Population, age, fertility, migration, life expectancy:</b> United Nations, World Population Prospects 2024, medium variant (CC BY 3.0 IGO). 1 July estimates; years after 2026 are projections.</li>
  <li><b>Economy, health, education, water, food, technology, transport, biodiversity, military:</b> World Bank, World Development Indicators, October 2026 release (CC BY 4.0), via Open Numbers. Each figure shows its own year; we only use values from 2010 or later.</li>
  <li><b>Electricity mix:</b> Ember, via Our World in Data (CC BY 4.0).</li>
  <li><b>Government debt:</b> IMF World Economic Outlook. <b>Physical geography of India, China and the US:</b> CIA World Factbook. <b>Orbital launches:</b> Jonathan McDowell's launch log.</li>
  <li><b>Cities:</b> GeoNames (CC BY 4.0), city-proper populations; Worldometer urban areas for India, China and the US. <b>Borders on the globe:</b> Natural Earth (public domain). <b>Flags:</b> flag-icons (MIT).</li></ul></section>
 <section class="card"><h3>How the numbers work</h3><ul style="padding-left:18px;margin:10px 0 0;display:flex;flex-direction:column;gap:6px;font-size:.92rem">
  <li><b>Live counters</b> interpolate between UN estimates (population) or spread the latest annual world total evenly from 1 January (CO₂, GDP and others). They are estimates, not measurements.</li>
  <li><b>Rankings</b> include every country with data for that indicator, so the number of ranked countries changes from one indicator to another.</li>
  <li><b>Compare scores</b> express each value as a share of the best value among the countries you pick, averaged per category. They are not an official index.</li>
  <li>Borders and names follow the sources above and do not imply any position on disputed territories.</li></ul>
  <h3 style="margin-top:18px">Privacy</h3><p style="font-size:.92rem;margin:8px 0 0">Omni uses no cookies, no analytics and no third-party trackers. Your theme and comparison choices are stored only in your own browser.</p></section></div>`}
function pageCategories(){CUR_F=null;return `<div class="sec-title" style="margin-top:0"><h1 style="font-size:2.2rem">All categories</h1><p>Each category has world rankings for all ${KEYS.length} countries and a section on every country page.</p></div>${catGrid()}`}

/* ---------- router ---------- */
const SITE=!!window.ORBIS_SITE,STATIC_TITLE=SITE?document.title:"";
function tokenToPath(t){if(!t||t==="home")return "/";if(["countries","categories","compare","about"].includes(t))return `/${t}/`;if(t.startsWith("cat-"))return `/rankings/${t.slice(4)}/`;const p=parse(t);if(p)return p.cat==="population"?`/${p.k}/`:`/${p.k}/${p.cat}/`;return "/"}
function pathToToken(path){const a=path.replace(/index\.html$/,"").split("/").filter(Boolean);if(!a.length)return "home";if(a[0]==="rankings"&&a[1])return "cat-"+a[1];if(a.length===1)return a[0];return a[0]+"-"+a[1]}
function getTok(){return SITE?pathToToken(location.pathname):(location.hash.slice(1)||"home")}
function go(t){if(SITE){history.pushState(null,"",tokenToPath(t));route(false)}else location.hash=t}
function fixLinks(scope){scope.querySelectorAll('a[href^="#"]').forEach(a=>{const t=a.getAttribute("href").slice(1);if(t)a.setAttribute("href",tokenToPath(t))})}
if(SITE)document.addEventListener("click",e=>{const a=e.target.closest("a[href]");if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target)return;const href=a.getAttribute("href");if(!href.startsWith("/")||href.startsWith("//"))return;e.preventDefault();go(pathToToken(href))});
function parse(h){if(C[h])return {k:h,cat:"population"};const m=h.match(/^(.+)-([a-z]+)$/);if(m&&C[m[1]]&&CATS.some(x=>x.id===m[2]))return {k:m[1],cat:m[2]};return null}
function route(keepScroll){
 const h=getTok();cleanup();applyTheme();G=null;const app=$("#app");let after=()=>{};
 const cm=parse(h);
 if(cm){app.innerHTML=pageCountry(cm.k,cm.cat);after=()=>initCat(cm.cat,cm.k);document.title=`${C[cm.k].name} ${cm.cat==="population"?"population":CATS.find(x=>x.id===cm.cat).n.toLowerCase()} · Omni`}
 else if(h==="countries"){app.innerHTML=pageCountries();after=initCountries;document.title="Countries · Omni"}
 else if(h==="categories"){app.innerHTML=pageCategories();document.title="Categories · Omni"}
 else if(h==="compare"){app.innerHTML=pageCompare();after=initComparePage;document.title="Compare countries · Omni"}
 else if(h.startsWith("cat-")&&CATS.some(x=>x.id===h.slice(4))){const id=h.slice(4);app.innerHTML=pageCat(id);after=()=>initCat(id,null);document.title=`${CATS.find(x=>x.id===id).n} by country · Omni`}
 else if(h==="about"){app.innerHTML=pageAbout();document.title="About and sources · Omni"}
 else if(h!=="home"){app.innerHTML=`<div class="card" style="text-align:center;padding:48px 20px;max-width:640px;margin:0 auto"><h1 style="font-size:2rem">Page not found</h1><p class="muted">There is no page at this address. Try searching for a country.</p><div class="search big" data-search style="margin:16px auto;max-width:420px"><input type="search" placeholder="Search any country…" autocomplete="off" aria-label="Search any country"><ul hidden></ul></div><p><a class="btn" href="#home">Go to the home page</a></p></div>`;document.title="Page not found · Omni"}
 else{app.innerHTML=pageHome();after=initHome;document.title="Omni"}
 if(SITE){fixLinks(document);if(!route.done&&STATIC_TITLE)document.title=STATIC_TITLE}route.done=1;
 document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on",a.dataset.r===h||(a.dataset.r==="home"&&h==="home")||(a.dataset.r==="countries"&&!!cm)||(a.dataset.r==="categories"&&h.startsWith("cat-"))));
 document.querySelectorAll("[data-live]").forEach(paintCounter);document.querySelectorAll("[data-search]").forEach(bindSearch);
 document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{const t=document.getElementById(b.dataset.go);if(t)t.scrollIntoView({behavior:"smooth",block:"start"})}));
 if(window.Chart)after();else window.addEventListener("load",()=>{applyTheme();after()},{once:true});
 if(!keepScroll)window.scrollTo(0,0)}
if(SITE)window.addEventListener("popstate",()=>route(false));else window.addEventListener("hashchange",()=>route(false));
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>route(true));
new MutationObserver(()=>route(true)).observe(root,{attributes:true,attributeFilter:["data-theme"]});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>charts.forEach(c=>c.update("none")));
route(false);
})();