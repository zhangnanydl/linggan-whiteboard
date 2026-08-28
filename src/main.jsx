import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import bulbLogo from './assets/bulb-logo.svg';

const STORAGE_KEY = 'linggan-whiteboard-workspace-v2';
const UI_STORAGE_KEY = 'linggan-whiteboard-ui-v1';
const DOCK_STORAGE_KEY = 'linggan-whiteboard-dock-pinned-v1';
const TOOL_CYCLE_STORAGE_KEY = 'linggan-whiteboard-tool-cycle-v1';
const DOWNLOAD_HISTORY_KEY = 'linggan-whiteboard-download-history-v1';
const CURRENT_TOOL_TOKEN = 'current';
const APP_VERSION = '1.9.0';
const BOARD_WIDTH = 1600;
const BOARD_HEIGHT = 1000;
const COLORS = ['#17191d', '#ff6663', '#ffb21a', '#41a05d', '#175cd3', '#9b6de8'];
const NOTE_COLORS = ['#ffe381', '#ffb9bd', '#9fc4ff', '#9ed9ad'];
const STICKERS = ['⭐', '💗', '💡', '✅', '❓', '👏', '🙂'];

const Icon = ({ name, size = 22 }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    select: <><path d="m5 3 14 9-6.4 1.7L9 20Z"/><path d="m13 14 4 5"/></>,
    pen: <><path d="m4 20 4.4-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.4 16Z"/><path d="m14.8 6.2 3 3"/></>,
    highlight: <><path d="m5 15 8.8-11 5.2 4-8.8 11H5Z"/><path d="m4 21 6-2"/></>,
    eraser: <><path d="m4.2 14.2 8.8-8.8a2.1 2.1 0 0 1 3 0l3.2 3.2a2.1 2.1 0 0 1 0 3L12.4 18H8Z"/><path d="m10.5 8 6.2 6.2"/><path d="M12.4 18H21"/></>,
    line: <path d="M5 19 19 5"/>, arrow: <><path d="M4 18 19 5"/><path d="m12 5 7 0 0 7"/></>, connector: <><path d="M3 7h7v10h8"/><path d="m15 13 4 4-4 4"/></>, rect: <rect x="4" y="4" width="16" height="16" rx="1"/>, circle: <circle cx="12" cy="12" r="8"/>,
    diamond: <path d="m12 3 9 9-9 9-9-9Z"/>,
    person: <><circle cx="12" cy="5" r="2.5"/><path d="M12 7.5v7M7.5 11l4.5-3 4.5 3M8.5 21l3.5-6.5 3.5 6.5"/></>,
    computer: <><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/></>,
    terminator: <rect x="3" y="6" width="18" height="12" rx="6"/>,
    parallelogram: <path d="M7 4h14l-4 16H3Z"/>,
    document: <path d="M4 3h16v15c-4-3-8 3-16 0Z"/>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></>,
    text: <><path d="M5 5h14"/><path d="M12 5v14"/><path d="M8 19h8"/></>,
    sticky: <><path d="M5 4h14v11l-5 5H5Z"/><path d="M14 20v-5h5"/></>,
    sticker: <><circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01"/><path d="M8.5 14c1.4 2 5.6 2 7 0"/></>,
    undo: <><path d="m9 7-5 5 5 5"/><path d="M5 12h8a6 6 0 0 1 6 6"/></>, redo: <><path d="m15 7 5 5-5 5"/><path d="M19 12h-8a6 6 0 0 0-6 6"/></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></>,
    folder: <><path d="M3 6h7l2 2h9v11H3Z"/><path d="M3 9h18"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 17 5-5 4 4 3-3 4 4"/></>,
    refresh: <><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 9A7 7 0 0 1 18 6l2 6M18 15a7 7 0 0 1-12 3l-2-6"/></>,
    trash: <><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m7 7 1 13h8l1-13"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>, minus: <path d="M5 12h14"/>,
    fit: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></>, chevron: <path d="m8 10 4 4 4-4"/>,
    bulb: <><path d="M9 18h6M10 21h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.5-1.2 1.3-1.3 2.5h-4.4c-.1-1.2-.5-2-1.3-2.5Z"/></>,
    x: <><path d="m6 6 12 12M18 6 6 18"/></>, grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></>, more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    check: <path d="m5 12 4 4L19 6"/>, edit: <><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z"/><path d="m14.5 7.5 3 3"/></>,
    cloud: <><path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9Z"/><path d="M12 12v7m-3-4 3-3 3 3"/></>,
    panelClose: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m7-11-3 3 3 3"/></>,
    panelOpen: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m4 5 3 3-3 3"/></>,
    pin: <><path d="m14 4 6 6-3 1-4 4-1 5-3-6-5-5 5-1 4-4Z"/><path d="m9 15-5 5"/></>,
    flow: <><path d="M3 8h4m3 0h4m3 0h4M3 16h4m3 0h4m3 0h4"/><path d="m18 13 3 3-3 3"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7h.01"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>
    ,current: <><path d="M7 7h10v10H7Z"/><path d="m9 3-3 3 3 3M15 21l3-3-3-3"/><path d="M6 6h10a3 3 0 0 1 3 3M18 18H8a3 3 0 0 1-3-3"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
};

const WHITEBOARD_TOOLS = [['select','选择'],['pen','画笔'],['highlight','荧光笔'],['eraser','橡皮擦'],['line','直线'],['arrow','箭头'],['rect','矩形'],['circle','圆形'],['text','文本'],['sticky','便签'],['sticker','贴纸']];
const FLOW_TOOLS = [['text','文字'],['rect','矩形'],['terminator','开始/结束'],['diamond','菱形'],['circle','圆形'],['parallelogram','输入/输出'],['document','文档'],['database','数据库'],['person','小人'],['computer','电脑']];
const CONNECTABLE_TYPES = new Set(['rect','ellipse','terminator','diamond','parallelogram','document','database','person','computer']);
const WYSIWYG_TEXT_STYLE = {width:'100%',height:'100%',overflow:'hidden',whiteSpace:'pre-wrap',overflowWrap:'anywhere',wordBreak:'break-word',fontFamily:'Inter,"Microsoft YaHei","PingFang SC",sans-serif',fontWeight:500,letterSpacing:0};

const seedElements = [
  { id:'title',type:'text',x:305,y:280,text:'今天的思考',color:'#17191d',size:48,font:'hand' },
  { id:'underline',type:'path',color:'#ff6663',width:6,points:[[305,335],[420,328],[565,325],[700,326]] },
  { id:'key',type:'text',x:275,y:405,text:'重点',color:'#175cd3',size:34,font:'hand' },
  { id:'keycircle',type:'ellipse',x:250,y:365,w:135,h:78,color:'#175cd3',width:3 },
  { id:'desc',type:'text',x:420,y:405,text:'理解概念 · 观察关系 · 归纳总结',color:'#20242b',size:24,font:'hand' },
  { id:'box1',type:'rect',x:320,y:455,w:105,h:66,color:'#41a05d',width:3,text:'输入',textColor:'#287841' },
  { id:'arrow1',type:'line',x:438,y:488,x2:500,y2:488,color:'#41a05d',width:3,arrow:true },
  { id:'box2',type:'rect',x:505,y:445,w:230,h:78,color:'#41a05d',width:3,text:'处理过程',textColor:'#287841' },
  { id:'arrow2',type:'line',x:745,y:488,x2:805,y2:488,color:'#41a05d',width:3,arrow:true },
  { id:'box3',type:'rect',x:815,y:455,w:105,h:66,color:'#41a05d',width:3,text:'输出',textColor:'#287841' },
  { id:'note1',type:'sticky',x:380,y:575,w:168,h:132,color:'#ffb9bd',text:'注意：\n联系生活中的\n例子哦！',rotate:-4 },
  { id:'note2',type:'sticky',x:650,y:570,w:168,h:132,color:'#ffe381',text:'小组讨论后\n分享你的\n想法～',rotate:2 },
  { id:'star',type:'sticker',x:945,y:555,w:92,h:92,text:'⭐' }
];

const clone = value => JSON.parse(JSON.stringify(value));
const formatBytes = bytes => bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(1)} MB`;
const formatDownloadTime = value => new Date(value).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
const makeBoard = (title, elements = [], age = 0) => ({ id:crypto.randomUUID(),title,elements:clone(elements),updatedAt:Date.now()-age });
const createInitialWorkspace = () => {
  const first=makeBoard('函数入门课',seedElements), second=makeBoard('几何图形复习',[],86400000), third=makeBoard('课堂讨论记录',[],3*86400000);
  return { boards:[first,second,third],activeBoardId:first.id };
};
const loadWorkspace = () => {
  try { const value=JSON.parse(localStorage.getItem(STORAGE_KEY)); if(value?.boards?.length&&value.activeBoardId) return value; } catch { /* use seed */ }
  return createInitialWorkspace();
};
const loadSidebarPreference = () => {
  try { return localStorage.getItem(UI_STORAGE_KEY) === 'open'; } catch { return false; }
};
const loadDockPreference = () => {
  try { return localStorage.getItem(DOCK_STORAGE_KEY) === 'pinned'; } catch { return false; }
};
const loadToolCycle = () => {
  const fallback={mode:'quick',whiteboardTools:[CURRENT_TOOL_TOKEN,'select'],flowchartTools:[CURRENT_TOOL_TOKEN,'select']};
  try { const value=JSON.parse(localStorage.getItem(TOOL_CYCLE_STORAGE_KEY));if(!value||value.mode!=='custom')return fallback;const legacy=Array.isArray(value.tools)?value.tools:[],valid=(tools,available)=>[...new Set(tools)].filter(id=>id===CURRENT_TOOL_TOKEN||id==='select'||available.some(([toolId])=>toolId===id)).slice(0,5),whiteboardTools=valid(Array.isArray(value.whiteboardTools)?value.whiteboardTools:legacy,WHITEBOARD_TOOLS),flowchartTools=valid(Array.isArray(value.flowchartTools)?value.flowchartTools:legacy,FLOW_TOOLS);return{mode:'custom',whiteboardTools:whiteboardTools.length>=2?whiteboardTools:fallback.whiteboardTools,flowchartTools:flowchartTools.length>=2?flowchartTools:fallback.flowchartTools}; } catch { return fallback; }
};

const bounds = (el,elementMap) => {
  if(el.type==='connector'){
    const points=connectorRoute(el,elementMap);if(!points.length)return{x:0,y:0,w:1,h:1};
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
  }
  if(el.type==='path'){const xs=el.points.map(p=>p[0]),ys=el.points.map(p=>p[1]);return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}
  if(el.type==='line')return{x:Math.min(el.x,el.x2),y:Math.min(el.y,el.y2),w:Math.abs(el.x2-el.x),h:Math.abs(el.y2-el.y)};
  if(el.type==='text'){if(el.layout==='box')return{x:el.x,y:el.y,w:el.w,h:el.h};return{x:el.x,y:el.y-el.size,w:Math.max(...el.text.split('\n').map(t=>t.length))*el.size*.72,h:el.size*1.25*el.text.split('\n').length};}
  return{x:el.x,y:el.y,w:el.w||1,h:el.h||1};
};
const ANCHOR_SIDES = ['top','right','bottom','left'];
const anchorPoint = (el,side) => {const b=bounds(el);if(side==='top')return{x:b.x+b.w/2,y:b.y};if(side==='right')return{x:b.x+b.w,y:b.y+b.h/2};if(side==='bottom')return{x:b.x+b.w/2,y:b.y+b.h};return{x:b.x,y:b.y+b.h/2};};
const offsetAnchor = (point,side,distance=28) => side==='top'?{x:point.x,y:point.y-distance}:side==='right'?{x:point.x+distance,y:point.y}:side==='bottom'?{x:point.x,y:point.y+distance}:{x:point.x-distance,y:point.y};
const compactRoute = points => points.filter((point,index)=>!index||point[0]!==points[index-1][0]||point[1]!==points[index-1][1]);
const routeBetweenAnchors = (start,startSide,end,endSide) => {
  const startStub=offsetAnchor(start,startSide),endStub=offsetAnchor(end,endSide),horizontalStart=startSide==='left'||startSide==='right',horizontalEnd=endSide==='left'||endSide==='right';let middle;
  if(horizontalStart&&horizontalEnd){
    if(startSide===endSide){const outside=startSide==='left'?Math.min(startStub.x,endStub.x)-28:Math.max(startStub.x,endStub.x)+28;middle=[[outside,startStub.y],[outside,endStub.y]];}
    else{const x=(startStub.x+endStub.x)/2;middle=[[x,startStub.y],[x,endStub.y]];}
  }else if(!horizontalStart&&!horizontalEnd){
    if(startSide===endSide){const outside=startSide==='top'?Math.min(startStub.y,endStub.y)-28:Math.max(startStub.y,endStub.y)+28;middle=[[startStub.x,outside],[endStub.x,outside]];}
    else{const y=(startStub.y+endStub.y)/2;middle=[[startStub.x,y],[endStub.x,y]];}
  }else middle=horizontalStart?[[endStub.x,startStub.y]]:[[startStub.x,endStub.y]];
  return compactRoute([[start.x,start.y],[startStub.x,startStub.y],...middle,[endStub.x,endStub.y],[end.x,end.y]]);
};
const routeToPointer = (start,startSide,end) => {const stub=offsetAnchor(start,startSide),horizontal=startSide==='left'||startSide==='right';return compactRoute(horizontal?[[start.x,start.y],[stub.x,stub.y],[end.x,stub.y],[end.x,end.y]]:[[start.x,start.y],[stub.x,stub.y],[stub.x,end.y],[end.x,end.y]]);};
const connectorRoute = (el,elementMap) => {
  const from=elementMap?.get(el.fromId),to=elementMap?.get(el.toId);if(!from||!to)return[];
  let fromSide=el.fromSide,toSide=el.toSide;
  if(!fromSide||!toSide){const a=bounds(from),b=bounds(to),ac={x:a.x+a.w/2,y:a.y+a.h/2},bc={x:b.x+b.w/2,y:b.y+b.h/2},horizontalGap=Math.max(b.x-(a.x+a.w),a.x-(b.x+b.w)),verticalGap=Math.max(b.y-(a.y+a.h),a.y-(b.y+b.h));if(horizontalGap>=verticalGap){const right=bc.x>=ac.x;fromSide=right?'right':'left';toSide=right?'left':'right';}else{const down=bc.y>=ac.y;fromSide=down?'bottom':'top';toSide=down?'top':'bottom';}}
  return routeBetweenAnchors(anchorPoint(from,fromSide),fromSide,anchorPoint(to,toSide),toSide);
};
const arrowHead = (points,size=12) => {
  if(points.length<2)return'';const end=points.at(-1),before=points.at(-2),dx=end[0]-before[0],dy=end[1]-before[1],length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length,px=-uy,py=ux;
  return[[end[0],end[1]],[end[0]-ux*size+px*size*.55,end[1]-uy*size+py*size*.55],[end[0]-ux*size-px*size*.55,end[1]-uy*size-py*size*.55]].map(p=>p.join(',')).join(' ');
};
const pointNearPolyline = (point,points,tolerance=10) => points.slice(1).some((end,index)=>{const start=points[index],dx=end[0]-start[0],dy=end[1]-start[1],lengthSq=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((point.x-start[0])*dx+(point.y-start[1])*dy)/lengthSq)),x=start[0]+t*dx,y=start[1]+t*dy;return Math.hypot(point.x-x,point.y-y)<=tolerance;});
const removeElementAndConnections = (items,id) => items.filter(el=>el.id!==id&&!(el.type==='connector'&&(el.fromId===id||el.toId===id)));
const duplicateElement = (source,offset=28) => {
  const copy=clone(source);copy.id=crypto.randomUUID();
  if(copy.type==='path')copy.points=copy.points.map(([x,y])=>[x+offset,y+offset]);
  else if(copy.type==='line'){copy.x+=offset;copy.y+=offset;copy.x2+=offset;copy.y2+=offset;}
  else{copy.x=(copy.x||0)+offset;copy.y=(copy.y||0)+offset;}
  return copy;
};
const splitPathOutsideCircle = (path,center,radius) => {
  if(path.points.length===1)return Math.hypot(path.points[0][0]-center.x,path.points[0][1]-center.y)>radius+(path.width||2)/2?[path]:[];
  const sampled=[];
  path.points.forEach((point,index)=>{if(!index){sampled.push(point);return;}const previous=path.points[index-1],distance=Math.hypot(point[0]-previous[0],point[1]-previous[1]),steps=Math.max(1,Math.ceil(distance/Math.max(2,radius*.3)));for(let step=1;step<=steps;step++)sampled.push([previous[0]+(point[0]-previous[0])*step/steps,previous[1]+(point[1]-previous[1])*step/steps]);});
  const fragments=[];let fragment=[];
  sampled.forEach(point=>{if(Math.hypot(point[0]-center.x,point[1]-center.y)>radius+(path.width||2)/2)fragment.push(point);else if(fragment.length){if(fragment.length>1)fragments.push(fragment);fragment=[];}});
  if(fragment.length>1)fragments.push(fragment);
  if(fragments.length===1&&fragments[0].length===sampled.length)return[path];
  return fragments.map((points,index)=>({...path,id:index?crypto.randomUUID():path.id,points}));
};
const wrapNote = text => text.split('\n').flatMap(line => line.length>9 ? (line.match(/.{1,9}/g)||[]) : [line]).slice(0,4);
const shapeTextLayout = (el,text=el.text||'') => {
  const ellipse=el.type==='ellipse',diamond=el.type==='diamond',person=el.type==='person',computer=el.type==='computer',insetX=ellipse?el.w*.17:diamond?el.w*.24:computer?el.w*.12:12,insetY=ellipse?el.h*.16:diamond?el.h*.24:computer?el.h*.12:person?el.h*.62:10,w=Math.max(18,el.w-insetX*2),h=Math.max(18,person?el.h*.34:computer?el.h*.58:el.h-insetY*2),maximum=Math.min(26,Math.max(14,Math.min(el.w*.18,h*.34)));
  let size=maximum;
  for(;size>14;size-=1){const charsPerLine=Math.max(1,Math.floor(w/(size*1.02))),lineCount=text.split('\n').reduce((count,line)=>count+Math.max(1,Math.ceil(line.length/charsPerLine)),0);if(lineCount*size*1.3<=h)break;}
  return{x:el.x+insetX,y:el.y+insetY,w,h,size:Math.max(14,size),lineHeight:1.3};
};

function ShapeLabel({el}){
  if(!el.text)return null;const layout=shapeTextLayout(el);
  return <foreignObject className="shape-label" x={layout.x} y={layout.y} width={layout.w} height={layout.h}><div xmlns="http://www.w3.org/1999/xhtml" className="wysiwyg-text shape-label-content" style={{...WYSIWYG_TEXT_STYLE,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',color:el.textColor||el.color,fontSize:layout.size,lineHeight:layout.lineHeight}}>{el.text}</div></foreignObject>;
}

function InlineTextEditor({editor,style,zoom,valueRef,onCommit,onCancel}){
  const inputRef=useRef(null),finished=useRef(false);
  useEffect(()=>{const input=inputRef.current;if(!input)return;valueRef.current=editor.value;input.focus();const range=document.createRange(),selection=window.getSelection();range.selectNodeContents(input);selection.removeAllRanges();selection.addRange(range);},[]);
  const currentText=()=>inputRef.current?.innerText.replace(/\r/g,'').replace(/\n$/,'')??editor.value;
  const finish=()=>{if(finished.current)return;finished.current=true;onCommit(editor,currentText());};
  const cancel=()=>{finished.current=true;onCancel(editor);};
  const resizeText=()=>{valueRef.current=currentText();if(editor.kind!=='shape'||!inputRef.current)return;const layout=shapeTextLayout({type:editor.shapeType,x:0,y:0,w:editor.shapeW,h:editor.shapeH},valueRef.current);inputRef.current.style.fontSize=`${layout.size*zoom}px`;};
  return <div className={`inline-text-editor ${editor.kind==='shape'?'inside-shape':'free-text'}`} style={style} onPointerDown={event=>event.stopPropagation()}><div ref={inputRef} className="wysiwyg-text editable-text" role="textbox" aria-label={editor.kind==='shape'?'图形内文字':'画布文字'} aria-multiline="true" contentEditable suppressContentEditableWarning data-placeholder={editor.kind==='shape'?'直接输入图形文字':'直接输入文字'} onInput={resizeText} onBlur={finish} onKeyDown={event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();cancel();}else if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();finish();}}}>{editor.value}</div><small>{editor.kind==='shape'?'自动居中 · 自动换行':'Ctrl+Enter 完成 · Esc 取消'}</small></div>;
}

function ConnectionAnchors({el}){
  return <g className="connection-anchors">{ANCHOR_SIDES.map(side=>{const p=anchorPoint(el,side);return <circle key={side} data-side={side} cx={p.x} cy={p.y} r="7"/>;})}</g>;
}

function CanvasElement({el,selected=false,hovered=false,thumbnail=false,elementMap,showAnchors=false}){
  const b=bounds(el,elementMap),font=el.font==='hand'?"'KaiTi','STKaiti',cursive":"Inter,'Microsoft YaHei',sans-serif";
  let core;
  if(el.type==='path')core=<polyline points={el.points.map(p=>p.join(',')).join(' ')} fill="none" stroke={el.color} strokeWidth={el.width} opacity={el.opacity||1} strokeLinecap="round" strokeLinejoin="round"/>;
  else if(el.type==='line'){const points=[[el.x,el.y],[el.x2,el.y2]];core=<g><line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={el.color} strokeWidth={el.width} strokeLinecap="round"/>{el.arrow?<polygon points={arrowHead(points,12+el.width)} fill={el.color}/>:null}</g>;}
  else if(el.type==='connector'){
    const points=connectorRoute(el,elementMap),pointText=points.map(p=>p.join(',')).join(' ');
    core=points.length?<g className={`smart-connector ${el.animated===false?'':'is-flowing'}`}><polyline className="connector-hit" points={pointText}/><polyline className="connector-base" points={pointText} stroke={el.color} strokeWidth={el.width}/><polyline className="connector-flow" points={pointText} stroke={el.color} strokeWidth={Math.max(2,el.width*.62)}/><polygon points={arrowHead(points,13+el.width)} fill={el.color}/></g>:null;
  }
  else if(el.type==='rect')core=<g><rect x={el.x} y={el.y} width={el.w} height={el.h} fill="none" stroke={el.color} strokeWidth={el.width} rx="2"/><ShapeLabel el={el}/></g>;
  else if(el.type==='terminator')core=<g><rect x={el.x} y={el.y} width={el.w} height={el.h} fill="none" stroke={el.color} strokeWidth={el.width} rx={Math.min(el.h/2,32)}/><ShapeLabel el={el}/></g>;
  else if(el.type==='ellipse')core=<g><ellipse cx={el.x+el.w/2} cy={el.y+el.h/2} rx={el.w/2} ry={el.h/2} fill="none" stroke={el.color} strokeWidth={el.width}/><ShapeLabel el={el}/></g>;
  else if(el.type==='diamond')core=<g><polygon points={`${el.x+el.w/2},${el.y} ${el.x+el.w},${el.y+el.h/2} ${el.x+el.w/2},${el.y+el.h} ${el.x},${el.y+el.h/2}`} fill="none" stroke={el.color} strokeWidth={el.width} strokeLinejoin="round"/><ShapeLabel el={el}/></g>;
  else if(el.type==='parallelogram')core=<g><polygon points={`${el.x+el.w*.16},${el.y} ${el.x+el.w},${el.y} ${el.x+el.w*.84},${el.y+el.h} ${el.x},${el.y+el.h}`} fill="none" stroke={el.color} strokeWidth={el.width} strokeLinejoin="round"/><ShapeLabel el={el}/></g>;
  else if(el.type==='document')core=<g><path d={`M${el.x} ${el.y}h${el.w}v${el.h*.82}c-${el.w*.28}-${el.h*.2}-${el.w*.52} ${el.h*.2}-${el.w} 0Z`} fill="none" stroke={el.color} strokeWidth={el.width} strokeLinejoin="round"/><ShapeLabel el={el}/></g>;
  else if(el.type==='database')core=<g fill="none" stroke={el.color} strokeWidth={el.width}><ellipse cx={el.x+el.w/2} cy={el.y+el.h*.14} rx={el.w/2} ry={el.h*.14}/><path d={`M${el.x} ${el.y+el.h*.14}v${el.h*.72}c0 ${el.h*.18} ${el.w} ${el.h*.18} ${el.w} 0v-${el.h*.72}M${el.x} ${el.y+el.h*.5}c0 ${el.h*.18} ${el.w} ${el.h*.18} ${el.w} 0`}/><ShapeLabel el={el}/></g>;
  else if(el.type==='person')core=<g fill="none" stroke={el.color} strokeWidth={el.width} strokeLinecap="round" strokeLinejoin="round"><circle cx={el.x+el.w/2} cy={el.y+el.h*.18} r={Math.min(el.w,el.h)*.11}/><path d={`M${el.x+el.w/2} ${el.y+el.h*.3}v${el.h*.28}M${el.x+el.w*.2} ${el.y+el.h*.43}l${el.w*.3}-${el.h*.13} ${el.w*.3} ${el.h*.13}M${el.x+el.w*.25} ${el.y+el.h*.78}l${el.w*.25}-${el.h*.2} ${el.w*.25} ${el.h*.2}`}/><ShapeLabel el={el}/></g>;
  else if(el.type==='computer')core=<g fill="none" stroke={el.color} strokeWidth={el.width} strokeLinejoin="round"><rect x={el.x} y={el.y} width={el.w} height={el.h*.76} rx="3"/><path d={`M${el.x+el.w/2} ${el.y+el.h*.76}v${el.h*.16}M${el.x+el.w*.28} ${el.y+el.h*.94}h${el.w*.44}`}/><ShapeLabel el={el}/></g>;
  else if(el.type==='text'&&el.layout==='box')core=<foreignObject className="free-text-label" x={el.x} y={el.y} width={el.w} height={el.h}><div xmlns="http://www.w3.org/1999/xhtml" className="wysiwyg-text free-label-content" style={{...WYSIWYG_TEXT_STYLE,display:'flex',alignItems:'center',textAlign:'left',color:el.color,fontSize:el.size,lineHeight:1.3,fontFamily:font}}>{el.text}</div></foreignObject>;
  else if(el.type==='text')core=<text x={el.x} y={el.y} fill={el.color} fontSize={el.size} fontFamily={font}>{el.text.split('\n').map((line,i)=><tspan key={i} x={el.x} dy={i?el.size*1.25:0}>{line}</tspan>)}</text>;
  else if(el.type==='sticky')core=<g transform={`rotate(${el.rotate||0} ${el.x+el.w/2} ${el.y+el.h/2})`}><path d={`M${el.x} ${el.y}h${el.w}v${el.h-18}l-18 18h-${el.w-18}Z`} fill={el.color} filter={thumbnail?undefined:`url(#shadow-${el.id})`}/>{wrapNote(el.text).map((t,i)=><text key={i} x={el.x+20} y={el.y+36+i*27} fontSize="19" fontFamily="'KaiTi','STKaiti',cursive" fill="#272b32">{t}</text>)}</g>;
  else core=<text x={el.x} y={el.y+el.h*.78} fontSize={el.w*.82} className="sticker-svg">{el.text}</text>;
  return <g className="canvas-element">{!thumbnail&&el.type==='sticky'?<defs><filter id={`shadow-${el.id}`}><feDropShadow dx="0" dy="7" stdDeviation="7" floodOpacity=".14"/></filter></defs>:null}{core}{hovered&&!selected?<g className="hover-box"><rect x={b.x-6} y={b.y-6} width={Math.max(b.w+12,20)} height={Math.max(b.h+12,20)} rx="5"/></g>:null}{showAnchors?<ConnectionAnchors el={el}/>:null}{selected?<g className="selection-box"><rect x={b.x-8} y={b.y-8} width={Math.max(b.w+16,24)} height={Math.max(b.h+16,24)} fill="none" stroke="#1769e0" strokeWidth="1.5" strokeDasharray="5 4"/><circle cx={b.x-8} cy={b.y-8} r="4"/><circle cx={b.x+b.w+8} cy={b.y+b.h+8} r="4"/></g>:null}</g>;
}

function BoardThumbnail({elements}){
  const visible=elements.slice(0,18),elementMap=new Map(elements.map(el=>[el.id,el])),ordered=[...visible.filter(el=>el.type==='connector'),...visible.filter(el=>el.type!=='connector')];
  return <svg className="board-thumbnail" viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} aria-hidden="true"><rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#fff"/>{ordered.map(el=><CanvasElement key={el.id} el={el} elementMap={elementMap} thumbnail/>)}</svg>;
}

function AppDialog({dialog,onClose,onSubmit}){
  const [value,setValue]=useState(dialog.value||'');
  const [noteColor,setNoteColor]=useState(dialog.color||NOTE_COLORS[0]);
  const destructive=dialog.type==='delete';
  const isText=dialog.type==='sticky';
  const heading=dialog.type==='sticky'?(dialog.editId?'编辑便签':'添加便签'):dialog.mode==='new'?'新建画板':dialog.type==='delete'?'删除画板':'重命名画板';
  const button=dialog.type==='sticky'?'添加到画板':dialog.mode==='new'?'创建画板':dialog.type==='delete'?'确认删除':'保存名称';
  const submit=e=>{e.preventDefault();if(!destructive&&!value.trim())return;onSubmit({...dialog,value:value.trim(),color:noteColor});};
  useEffect(()=>{const key=e=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[onClose]);
  return <div className="modal-scrim" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><form className={`app-dialog ${isText?'wide':''}`} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <div className="dialog-head"><h2 id="dialog-title">{heading}</h2><button type="button" className="dialog-close" onClick={onClose} aria-label="关闭"><Icon name="x"/></button></div>
    {destructive?<div className="delete-copy"><div className="delete-symbol"><Icon name="trash"/></div><p>删除“{dialog.boardTitle}”后将无法恢复，其中的书写、图形和便签都会被移除。</p></div>:isText?<div className="note-editor-layout"><div className="dialog-fields"><label htmlFor="dialog-value">便签内容</label><textarea id="dialog-value" autoFocus value={value} onChange={e=>setValue(e.target.value)} placeholder="输入要提醒的内容" rows="5"/><label>选择颜色</label><div className="note-colors">{NOTE_COLORS.map(c=><button type="button" key={c} aria-label={`便签颜色 ${c}`} className={noteColor===c?'selected':''} style={{background:c}} onClick={()=>setNoteColor(c)}/>)}</div></div><div className="note-preview" style={{background:noteColor}}>{wrapNote(value||'便签预览').map((line,i)=><span key={i}>{line}</span>)}</div></div>:<div className="dialog-fields"><label htmlFor="dialog-value">画板名称</label><input id="dialog-value" autoFocus value={value} onChange={e=>setValue(e.target.value)} maxLength="30" placeholder="例如：函数入门课"/><span className="field-hint">名称会自动保存在本机</span></div>}
    <div className="dialog-actions"><button type="button" className="secondary" onClick={onClose}>取消</button><button type="submit" className={destructive?'danger':'primary'}>{button}</button></div>
  </form></div>;
}

function BoardSidebar({boards,activeId,search,setSearch,onSelect,onNew,onRename,onDelete,onClose}){
  const [menuId,setMenuId]=useState(null);
  const filtered=useMemo(()=>boards.filter(b=>b.title.toLowerCase().includes(search.trim().toLowerCase())),[boards,search]);
  const ageLabel=updatedAt=>{const age=Date.now()-updatedAt;if(age<60000)return'刚刚';if(age<86400000)return'今天';if(age<2*86400000)return'昨天';return new Date(updatedAt).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'});};
  return <aside className="board-sidebar"><div className="sidebar-head"><div className="sidebar-title"><h2>我的画板</h2><button className="sidebar-close" onClick={onClose} aria-label="收起画板库" title="收起画板库"><Icon name="panelClose" size={20}/></button></div><button className="new-board" onClick={onNew}><Icon name="plus"/>新建画板</button><label className="search-box"><Icon name="search" size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索画板" aria-label="搜索画板"/></label></div><div className="board-list">{filtered.map(board=><div key={board.id} className={`board-row ${board.id===activeId?'active':''}`}><button className="board-main" onClick={()=>onSelect(board.id)}><BoardThumbnail elements={board.elements}/><span className="board-meta"><strong>{board.title}</strong><small>{ageLabel(board.updatedAt)}</small></span></button><button className="more-button" aria-label={`${board.title}菜单`} onClick={()=>setMenuId(menuId===board.id?null:board.id)}><Icon name="more"/></button>{menuId===board.id?<div className="board-menu"><button onClick={()=>{setMenuId(null);onRename(board);}}><Icon name="edit" size={17}/>重命名</button><button className="delete" onClick={()=>{setMenuId(null);onDelete(board);}}><Icon name="trash" size={17}/>删除</button></div>:null}</div>)}{filtered.length===0?<div className="empty-search">没有找到相关画板</div>:null}</div><div className="local-note"><Icon name="cloud" size={18}/><span>内容保存在本机</span></div></aside>;
}

function DownloadManager({items,loading,isDesktop,onClose,onRefresh,onOpenFolder,onOpen,onReveal}){
  return <div className="modal-scrim" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><div className="app-dialog downloads-dialog" role="dialog" aria-modal="true" aria-labelledby="downloads-title"><div className="dialog-head"><div><h2 id="downloads-title">下载管理</h2><p>浏览和打开已导出的 PNG 图片</p></div><button className="dialog-close" onClick={onClose} aria-label="关闭"><Icon name="x"/></button></div><div className="download-toolbar"><button className="primary" onClick={onOpenFolder}><Icon name="folder" size={18}/>打开下载目录</button><button className="secondary" onClick={onRefresh}><Icon name="refresh" size={18}/>刷新</button></div>{!isDesktop?<div className="download-browser-note"><Icon name="info" size={18}/><span>浏览器预览仅显示本次记录；桌面版可直接打开图片和定位文件。</span></div>:null}<div className="download-list">{loading?<div className="download-empty"><Icon name="refresh"/><span>正在读取下载目录…</span></div>:items.length?items.map(item=><article className="download-item" key={item.path||`${item.name}-${item.updatedAt}`}><div className="download-thumb"><Icon name="image" size={24}/></div><div className="download-info"><strong title={item.name}>{item.name}</strong><small>{formatBytes(item.size)} · {formatDownloadTime(item.updatedAt)}</small></div><div className="download-actions"><button disabled={!isDesktop||item.browserOnly} onClick={()=>onOpen(item.name)}>打开</button><button disabled={!isDesktop||item.browserOnly} onClick={()=>onReveal(item.name)}>定位</button></div></article>):<div className="download-empty"><Icon name="image"/><strong>还没有导出的图片</strong><span>点击顶部“导出”后，图片会出现在这里。</span></div>}</div></div></div>;
}

function Whiteboard(){
  const initial=useRef(loadWorkspace()).current;
  const [boards,setBoards]=useState(initial.boards);
  const [activeBoardId,setActiveBoardId]=useState(initial.activeBoardId);
  const initialActive=initial.boards.find(b=>b.id===initial.activeBoardId)||initial.boards[0];
  const [elements,setElements]=useState(initialActive.elements);
  const [history,setHistory]=useState([initialActive.elements]);
  const [historyIndex,setHistoryIndex]=useState(0);
  const [toolMode,setToolMode]=useState('whiteboard'); const [tool,setTool]=useState('select'); const [color,setColor]=useState('#175cd3'); const [strokeWidth,setStrokeWidth]=useState(4); const [eraserSize,setEraserSize]=useState(28);
  const [selectedId,setSelectedId]=useState(null); const [stickerOpen,setStickerOpen]=useState(false); const [pendingSticker,setPendingSticker]=useState('⭐');
  const [connectorStartId,setConnectorStartId]=useState(null); const [connectorDraft,setConnectorDraft]=useState(null); const [flowEnabled,setFlowEnabled]=useState(true);
  const [zoom,setZoom]=useState(1); const [camera,setCamera]=useState({x:0,y:0}); const [viewportSize,setViewportSize]=useState({width:1280,height:720});
  const [isPanning,setIsPanning]=useState(false); const [spacePressed,setSpacePressed]=useState(false); const [hoveredId,setHoveredId]=useState(null); const [eraserPoint,setEraserPoint]=useState(null);
  const [dockPinned,setDockPinned]=useState(loadDockPreference); const [dockVisible,setDockVisible]=useState(true);
  const [toolCycle,setToolCycle]=useState(loadToolCycle); const [settingsDraft,setSettingsDraft]=useState(null);
  const [downloads,setDownloads]=useState([]); const [downloadsLoading,setDownloadsLoading]=useState(false);
  const [toast,setToast]=useState('');
  const [sidebarOpen,setSidebarOpen]=useState(loadSidebarPreference); const [search,setSearch]=useState(''); const [dialog,setDialog]=useState(null); const [inlineEditor,setInlineEditor]=useState(null); const [saveState,setSaveState]=useState('saved');
  const svgRef=useRef(null),viewportRef=useRef(null),gesture=useRef(null),keyboardState=useRef(null),saveTimer=useRef(null),dockTimer=useRef(null),dockHovered=useRef(false),lastWheelSwitch=useRef(0),recentTool=useRef({whiteboard:'pen',flowchart:'rect'}),inlineValueRef=useRef(''),committedEditorSessions=useRef(new Set()),suppressCanvasPointer=useRef(false),copyBuffer=useRef(null),pasteCount=useRef(0);
  const activeBoard=boards.find(b=>b.id===activeBoardId)||boards[0];
  const elementMap=useMemo(()=>new Map(elements.map(el=>[el.id,el])),[elements]);
  const orderedElements=useMemo(()=>[...elements.filter(el=>el.type==='connector'),...elements.filter(el=>el.type!=='connector')],[elements]);
  const selectedConnector=selectedId?elementMap.get(selectedId):null;
  const activeTools=toolMode==='flowchart'?FLOW_TOOLS:WHITEBOARD_TOOLS;

  const flash=message=>{setToast(message);window.setTimeout(()=>setToast(''),1800);};
  const clearDockTimer=()=>window.clearTimeout(dockTimer.current);
  const armDockTimer=()=>{clearDockTimer();if(!dockPinned)dockTimer.current=window.setTimeout(()=>{if(!dockHovered.current)setDockVisible(false);},5000);};
  const enterDock=()=>{dockHovered.current=true;clearDockTimer();setDockVisible(true);};
  const leaveDock=()=>{dockHovered.current=false;armDockTimer();};
  const persistElements=next=>{setElements(next);setBoards(prev=>prev.map(b=>b.id===activeBoardId?{...b,elements:clone(next),updatedAt:Date.now()}:b));setSaveState('saving');};
  const commit=next=>{const sliced=history.slice(0,historyIndex+1);persistElements(next);setHistory([...sliced,clone(next)]);setHistoryIndex(sliced.length);};
  const undo=()=>{if(historyIndex>0){const i=historyIndex-1;setHistoryIndex(i);persistElements(clone(history[i]));setSelectedId(null);setConnectorStartId(null);}};
  const redo=()=>{if(historyIndex<history.length-1){const i=historyIndex+1;setHistoryIndex(i);persistElements(clone(history[i]));setSelectedId(null);setConnectorStartId(null);}};
  const copySelection=()=>{const source=selectedId?elementMap.get(selectedId):null;if(!source){flash('请先选择要复制的元素');return false;}if(source.type==='connector'){flash('智能连线请重新连接');return false;}copyBuffer.current=clone(source);pasteCount.current=0;flash('已复制，按 Ctrl + V 粘贴');return true;};
  const pasteSelection=()=>{const source=copyBuffer.current;if(!source){flash('暂无可粘贴的元素');return;}pasteCount.current+=1;const copied=duplicateElement(source,28*pasteCount.current);commit([...elements,copied]);setSelectedId(copied.id);setConnectorStartId(null);flash('已粘贴副本');};
  const duplicateSelected=()=>{const source=selectedId?elementMap.get(selectedId):null;if(!source){flash('请先选择要复制的元素');return;}if(source.type==='connector'){flash('智能连线请重新连接');return;}copyBuffer.current=clone(source);pasteCount.current=1;const copied=duplicateElement(source,28);commit([...elements,copied]);setSelectedId(copied.id);setConnectorStartId(null);flash('已复制选中元素');};

  useEffect(()=>{window.clearTimeout(saveTimer.current);saveTimer.current=window.setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({boards,activeBoardId}));setSaveState('saved');}catch{setSaveState('error');}},220);return()=>window.clearTimeout(saveTimer.current);},[boards,activeBoardId]);
  useEffect(()=>{try{localStorage.setItem(UI_STORAGE_KEY,sidebarOpen?'open':'closed');}catch{ /* keep the current session state */ }},[sidebarOpen]);
  useEffect(()=>{try{localStorage.setItem(DOCK_STORAGE_KEY,dockPinned?'pinned':'auto');}catch{ /* keep the current session state */ }clearDockTimer();if(dockPinned)setDockVisible(true);else armDockTimer();return clearDockTimer;},[dockPinned]);
  useEffect(()=>{try{localStorage.setItem(TOOL_CYCLE_STORAGE_KEY,JSON.stringify(toolCycle));}catch{ /* keep the current session state */ }},[toolCycle]);
  useEffect(()=>{const node=viewportRef.current;if(!node)return;const update=()=>setViewportSize({width:node.clientWidth||1280,height:node.clientHeight||720});update();const observer=new ResizeObserver(update);observer.observe(node);return()=>observer.disconnect();},[]);

  const switchBoard=id=>{const next=boards.find(b=>b.id===id);if(!next||id===activeBoardId)return;setActiveBoardId(id);setElements(clone(next.elements));setHistory([clone(next.elements)]);setHistoryIndex(0);setSelectedId(null);setConnectorStartId(null);setInlineEditor(null);setStickerOpen(false);setCamera({x:0,y:0});setZoom(1);setSaveState('saved');};
  const createBoard=title=>{const board=makeBoard(title,[]);setBoards(prev=>[board,...prev]);setActiveBoardId(board.id);setElements([]);setHistory([[]]);setHistoryIndex(0);setSelectedId(null);setConnectorStartId(null);setInlineEditor(null);setCamera({x:0,y:0});setZoom(1);setSaveState('saving');flash('新画板已创建');};
  const renameBoard=(id,title)=>{setBoards(prev=>prev.map(b=>b.id===id?{...b,title,updatedAt:Date.now()}:b));setSaveState('saving');flash('画板名称已保存');};
  const deleteBoard=id=>{if(boards.length===1){flash('至少保留一个画板');return;}const remaining=boards.filter(b=>b.id!==id);setBoards(remaining);setInlineEditor(null);if(id===activeBoardId){setActiveBoardId(remaining[0].id);setElements(clone(remaining[0].elements));setHistory([clone(remaining[0].elements)]);setHistoryIndex(0);setCamera({x:0,y:0});setZoom(1);}setSaveState('saving');flash('画板已删除');};

  const viewWidth=viewportSize.width/zoom,viewHeight=viewportSize.height/zoom;
  const point=event=>{const r=svgRef.current.getBoundingClientRect();return{x:camera.x+(event.clientX-r.left)*viewWidth/r.width,y:camera.y+(event.clientY-r.top)*viewHeight/r.height};};
  const findHit=(point,items)=>{const itemMap=items===elements?elementMap:new Map(items.map(el=>[el.id,el])),ordered=[...items.filter(el=>el.type==='connector'),...items.filter(el=>el.type!=='connector')];return[...ordered].reverse().find(el=>{if(el.type==='connector')return pointNearPolyline(point,connectorRoute(el,itemMap),12/zoom);if(el.type==='path')return pointNearPolyline(point,el.points,Math.max(9,(el.width||2)/2+4)/zoom);if(el.type==='line')return pointNearPolyline(point,[[el.x,el.y],[el.x2,el.y2]],Math.max(9,(el.width||2)/2+4)/zoom);const b=bounds(el);return point.x>=b.x-8&&point.x<=b.x+b.w+8&&point.y>=b.y-8&&point.y<=b.y+b.h+8;});};
  const hitTest=point=>findHit(point,elements);
  const hitConnectionAnchor=location=>{let nearest=null,distance=18/zoom;for(const el of [...elements].reverse()){if(!CONNECTABLE_TYPES.has(el.type))continue;for(const side of ANCHOR_SIDES){const anchor=anchorPoint(el,side),nextDistance=Math.hypot(location.x-anchor.x,location.y-anchor.y);if(nextDistance<=distance){nearest={element:el,side,point:anchor};distance=nextDistance;}}}return nearest;};
  const hitEditableShape=point=>[...elements].reverse().find(el=>{if(!CONNECTABLE_TYPES.has(el.type)||el.type==='sticky')return false;const b=bounds(el);return point.x>=b.x&&point.x<=b.x+b.w&&point.y>=b.y&&point.y<=b.y+b.h;});
  const openElementDialog=(type,p,edit=null)=>setDialog({type,x:p.x,y:p.y,editId:edit?.id,value:edit?.text||'',color:edit?.color||NOTE_COLORS[0]});
  const startInlineEditor=p=>{
    const shape=hitEditableShape(p),hit=hitTest(p);
    const sessionId=crypto.randomUUID();
    if(shape){const shapeBounds=bounds(shape),legacy=[...elements].reverse().find(el=>{if(el.type!=='text')return false;const textBounds=bounds(el),x=textBounds.x+textBounds.w/2,y=textBounds.y+textBounds.h/2;return x>=shapeBounds.x&&x<=shapeBounds.x+shapeBounds.w&&y>=shapeBounds.y&&y<=shapeBounds.y+shapeBounds.h;}),value=shape.text||legacy?.text||'',layout=shapeTextLayout(shape,value);setInlineEditor({sessionId,kind:'shape',targetId:shape.id,legacyTextId:legacy?.id,value,x:layout.x,y:layout.y,w:layout.w,h:layout.h,color:shape.textColor||legacy?.color||shape.color,size:layout.size,shapeType:shape.type,shapeW:shape.w,shapeH:shape.h});setSelectedId(shape.id);return;}
    if(hit?.type==='text'){const textBounds=bounds(hit);setInlineEditor({sessionId,kind:'text',targetId:hit.id,value:hit.text,x:textBounds.x,y:textBounds.y,w:hit.layout==='box'?hit.w:Math.max(220,textBounds.w+30),h:hit.layout==='box'?hit.h:Math.max(70,textBounds.h+20),color:hit.color,size:hit.size||30});setSelectedId(hit.id);return;}
    setInlineEditor({sessionId,kind:'text',targetId:null,value:'',x:p.x,y:p.y,w:280,h:90,color,size:30});setSelectedId(null);
  };
  const commitInlineText=(editor,currentValue)=>{if(committedEditorSessions.current.has(editor.sessionId))return;committedEditorSessions.current.add(editor.sessionId);if(committedEditorSessions.current.size>100)committedEditorSessions.current=new Set([editor.sessionId]);const value=(currentValue??editor.value).trim(),selectResult=id=>setSelectedId(current=>current&&current!==editor.targetId?current:id);if(editor.kind==='shape'){const next=elements.filter(el=>el.id!==editor.legacyTextId).map(el=>el.id===editor.targetId?{...el,text:value,textColor:editor.color}:el);commit(next);selectResult(editor.targetId);}else if(editor.targetId){if(value){commit(elements.map(el=>el.id===editor.targetId?{...el,text:value,color:editor.color,x:editor.x,y:editor.y,w:editor.w,h:editor.h,layout:'box'}:el));selectResult(editor.targetId);}else{commit(removeElementAndConnections(elements,editor.targetId));setSelectedId(current=>current===editor.targetId?null:current);}}else if(value){const id=crypto.randomUUID();commit([...elements,{id,type:'text',x:editor.x,y:editor.y,w:editor.w,h:editor.h,layout:'box',text:value,color:editor.color,size:editor.size||30,font:'ui'}]);selectResult(id);}setInlineEditor(current=>current?.sessionId===editor.sessionId?null:current);};
  useEffect(()=>{if(!inlineEditor)return;const confirmOutside=event=>{if(event.target.closest?.('.inline-text-editor'))return;if(event.target.closest?.('svg.board'))suppressCanvasPointer.current=true;commitInlineText(inlineEditor,inlineValueRef.current);};document.addEventListener('pointerdown',confirmOutside,true);return()=>document.removeEventListener('pointerdown',confirmOutside,true);},[inlineEditor]);
  const eraseAt=(location,items,gestureState)=>{let changed=false;const pathsErased=items.flatMap(el=>{if(el.type!=='path')return[el];const fragments=splitPathOutsideCircle(el,location,eraserSize/2);if(fragments.length!==1||fragments[0]!==el)changed=true;return fragments;});if(changed){gestureState.changed=true;gestureState.latest=pathsErased;return pathsErased;}const target=findHit(location,items);if(!target)return items;gestureState.changed=true;const next=removeElementAndConnections(items,target.id);gestureState.latest=next;return next;};

  const onPointerDown=event=>{
    if(event.button!==0&&event.button!==1)return;if(suppressCanvasPointer.current){suppressCanvasPointer.current=false;event.preventDefault();return;}event.preventDefault();if(!dockPinned){clearDockTimer();dockHovered.current=false;setDockVisible(false);}const p=point(event),hit=hitTest(p);svgRef.current.setPointerCapture(event.pointerId);
    if(event.button===1||spacePressed||(tool==='select'&&!hit)){setSelectedId(null);setIsPanning(true);gesture.current={kind:'pan',startClient:{x:event.clientX,y:event.clientY},startCamera:camera};return;}
    if(toolMode==='flowchart'){
      if(tool==='text'){startInlineEditor(p);return;}
      const source=hitConnectionAnchor(p);
      if(source&&source.element.id===selectedId){gesture.current={kind:'connect',fromId:source.element.id,fromSide:source.side,start:source.point};setConnectorDraft({fromId:source.element.id,fromSide:source.side,start:source.point,toPoint:source.point});return;}
      if(hit?.type==='connector'){setSelectedId(hit.id);return;}
      if(hit&&(CONNECTABLE_TYPES.has(hit.type)||hit.type==='text')){setSelectedId(hit.id);gesture.current={kind:'move',start:p,original:hit,base:elements};return;}
    }
    if(tool==='select'){setSelectedId(hit?.id||null);if(hit&&hit.type!=='connector')gesture.current={kind:'move',start:p,original:hit,base:elements};return;}
    if(tool==='eraser'){const erasing={kind:'erase',base:elements,changed:false,latest:elements};gesture.current=erasing;setEraserPoint(p);setElements(current=>eraseAt(p,current,erasing));setSelectedId(null);setConnectorStartId(null);return;}
    if(tool==='text'){startInlineEditor(p);return;} if(tool==='sticky'){openElementDialog('sticky',p);return;}
    if(tool==='sticker'){commit([...elements,{id:crypto.randomUUID(),type:'sticker',x:p.x-42,y:p.y-42,w:84,h:84,text:pendingSticker}]);return;}
    const id=crypto.randomUUID(),base={id,color:toolMode==='flowchart'?'#17191d':color,width:tool==='highlight'?18:strokeWidth};let el;
    if(tool==='pen'||tool==='highlight')el={...base,type:'path',opacity:tool==='highlight'?.35:1,points:[[p.x,p.y]]};
    else if(tool==='line'||tool==='arrow')el={...base,type:'line',x:p.x,y:p.y,x2:p.x,y2:p.y,arrow:tool==='arrow'};
    else if(['rect','circle','terminator','diamond','parallelogram','document','database','person','computer'].includes(tool))el={...base,type:tool==='circle'?'ellipse':tool,x:p.x,y:p.y,w:0,h:0,textColor:toolMode==='flowchart'?'#17191d':color};
    if(el){setElements([...elements,el]);gesture.current={kind:'draw',id,start:p,base:elements};}
  };
  const onPointerMove=event=>{const p=point(event);if(tool==='eraser')setEraserPoint(p);const g=gesture.current;if(!g){const target=hitTest(p),directTarget=toolMode==='flowchart'&&target&&(CONNECTABLE_TYPES.has(target.type)||target.type==='text');setHoveredId(tool==='select'||directTarget?target?.id||null:null);return;}setHoveredId(null);if(g.kind==='pan'){setCamera({x:g.startCamera.x-(event.clientX-g.startClient.x)/zoom,y:g.startCamera.y-(event.clientY-g.startClient.y)/zoom});return;}if(g.kind==='connect'){const target=hitConnectionAnchor(p),valid=target&&target.element.id!==g.fromId;setConnectorDraft({fromId:g.fromId,fromSide:g.fromSide,start:g.start,toPoint:valid?target.point:p,toId:valid?target.element.id:null,toSide:valid?target.side:null});return;}if(g.kind==='erase'){setElements(current=>eraseAt(p,current,g));return;}if(g.kind==='move'){const dx=p.x-g.start.x,dy=p.y-g.start.y;setElements(g.base.map(el=>el.id!==g.original.id?el:el.type==='path'?{...el,points:el.points.map(q=>[q[0]+dx,q[1]+dy])}:el.type==='line'?{...el,x:el.x+dx,y:el.y+dy,x2:el.x2+dx,y2:el.y2+dy}:{...el,x:el.x+dx,y:el.y+dy}));return;}setElements(current=>current.map(el=>el.id!==g.id?el:el.type==='path'?{...el,points:[...el.points,[p.x,p.y]]}:el.type==='line'?{...el,x2:p.x,y2:p.y}:{...el,x:Math.min(g.start.x,p.x),y:Math.min(g.start.y,p.y),w:Math.abs(p.x-g.start.x),h:Math.abs(p.y-g.start.y)}));};
  const onPointerUp=event=>{if(!gesture.current)return;const g=gesture.current;gesture.current=null;if(g.kind==='connect'){const target=hitConnectionAnchor(point(event));setConnectorDraft(null);if(!target||target.element.id===g.fromId){setSelectedId(null);flash('请拖到另一个图形的连接点');return;}const id=crypto.randomUUID();commit([...elements,{id,type:'connector',fromId:g.fromId,fromSide:g.fromSide,toId:target.element.id,toSide:target.side,color:'#17191d',width:strokeWidth,animated:flowEnabled}]);setSelectedId(id);flash('节点连线已创建');return;}if(g.kind==='pan'){setIsPanning(false);return;}if(g.kind==='erase'&&!g.changed)return;if(g.kind==='draw'){const drawn=elements.find(el=>el.id===g.id),minimum=6/zoom,tooSmall=!drawn||drawn.type==='path'?(!drawn||drawn.points.slice(1).reduce((length,p,index)=>length+Math.hypot(p[0]-drawn.points[index][0],p[1]-drawn.points[index][1]),0)<minimum):drawn.type==='line'?Math.hypot(drawn.x2-drawn.x,drawn.y2-drawn.y)<minimum:drawn.w<minimum||drawn.h<minimum;if(tooSmall){persistElements(g.base);setSelectedId(null);return;}}const next=g.kind==='erase'?g.latest:elements,sliced=history.slice(0,historyIndex+1);persistElements(next);setHistory([...sliced,clone(next)]);setHistoryIndex(sliced.length);if(g.kind==='draw')setSelectedId(g.id);};
  const onDoubleClick=event=>{if(toolMode!=='flowchart'&&tool!=='select')return;const p=point(event),shape=hitEditableShape(p),hit=hitTest(p);if(shape||hit?.type==='text')startInlineEditor(p);else if(hit?.type==='sticky')openElementDialog('sticky',{x:hit.x,y:hit.y},hit);};

  const submitDialog=data=>{
    if(data.type==='board'){data.mode==='new'?createBoard(data.value):renameBoard(data.boardId,data.value);}
    else if(data.type==='delete')deleteBoard(data.boardId);
    else if(data.type==='sticky'){const existing=elements.find(el=>el.id===data.editId);if(existing)commit(elements.map(el=>el.id===data.editId?{...el,text:data.value,color:data.color}:el));else commit([...elements,{id:crypto.randomUUID(),type:'sticky',x:data.x-84,y:data.y-66,w:174,h:136,color:data.color,text:data.value,rotate:-2}]);}
    setDialog(null);
  };

  keyboardState.current={undo,redo,selectedId,elements,commit,copySelection,pasteSelection,duplicateSelected};
  useEffect(()=>{const keyDown=e=>{const s=keyboardState.current,typing=/INPUT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable,ctrl=e.ctrlKey||e.metaKey,key=e.key.toLowerCase();if(e.code==='Space'&&!dialog&&!typing){e.preventDefault();setSpacePressed(true);}if(!typing&&ctrl&&key==='z'){e.preventDefault();e.shiftKey?s.redo():s.undo();}if(!typing&&ctrl&&key==='c'&&s.selectedId){e.preventDefault();s.copySelection();}if(!typing&&ctrl&&key==='v'){e.preventDefault();s.pasteSelection();}if(!typing&&ctrl&&key==='d'&&s.selectedId){e.preventDefault();s.duplicateSelected();}if(!typing&&(e.key==='Delete'||e.key==='Backspace')&&s.selectedId&&!dialog){e.preventDefault();s.commit(removeElementAndConnections(s.elements,s.selectedId));setSelectedId(null);setConnectorStartId(null);}if(e.key==='Escape'&&!typing){if(dialog)setDialog(null);setSelectedId(null);setConnectorStartId(null);setStickerOpen(false);setSpacePressed(false);}};const keyUp=e=>{if(e.code==='Space')setSpacePressed(false);};window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);return()=>{window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);};},[dialog]);

  const toggleFlow=()=>{if(selectedConnector?.type==='connector'){commit(elements.map(el=>el.id===selectedId?{...el,animated:el.animated===false}:el));}else setFlowEnabled(value=>!value);};
  const chooseTool=id=>{setTool(id);if(id!=='select')recentTool.current[toolMode]=id;if(toolMode==='flowchart')setColor('#17191d');setEraserPoint(null);setConnectorStartId(null);setConnectorDraft(null);setSelectedId(null);setStickerOpen(id==='sticker'?!stickerOpen:false);};
  const switchToolMode=mode=>{const nextTool=mode==='flowchart'?recentTool.current.flowchart:'select';setToolMode(mode);setTool(nextTool);setColor(mode==='flowchart'?'#17191d':'#175cd3');setSelectedId(null);setConnectorStartId(null);setConnectorDraft(null);setStickerOpen(false);setEraserPoint(null);flash(mode==='flowchart'?'已切换到流程图工具':'已切换到画板工具');};
  const renderToolButton=([id,label])=><button key={id} title={id==='connector'?'从图形四边连接点拖到另一个连接点':label} className={`tool-button ${tool===id?'active':''}`} onClick={()=>chooseTool(id)}><Icon name={id}/><span>{label}</span></button>;
  const onCanvasWheel=event=>{event.preventDefault();if(!event.deltaY)return;const now=Date.now();if(now-lastWheelSwitch.current<160)return;lastWheelSwitch.current=now;const configured=toolCycle.mode==='quick'?[CURRENT_TOOL_TOKEN,'select']:(toolMode==='flowchart'?toolCycle.flowchartTools:toolCycle.whiteboardTools),resolved=configured.map(id=>id===CURRENT_TOOL_TOKEN?recentTool.current[toolMode]:id),ids=[...new Set(resolved)],currentIndex=ids.indexOf(tool),nextIndex=currentIndex<0?0:(currentIndex+(event.deltaY>0?1:-1)+ids.length)%ids.length,nextTool=ids[nextIndex]||recentTool.current[toolMode],label=nextTool==='select'?'选择 / 拖动画布':activeTools.find(item=>item[0]===nextTool)?.[1]||nextTool;if(nextTool!=='select')recentTool.current[toolMode]=nextTool;setTool(nextTool);setSelectedId(null);setConnectorStartId(null);setConnectorDraft(null);setStickerOpen(false);setEraserPoint(null);flash(`${toolMode==='flowchart'?'流程图':'画板'}：${label}`);};
  const toggleCycleTool=id=>setSettingsDraft(current=>{if(!current)return current;const key=toolMode==='flowchart'?'flowchartTools':'whiteboardTools',tools=current[key],selected=tools.includes(id);if(selected&&tools.length<=2){flash('自定义轮询至少选择 2 个工具');return current;}if(!selected&&tools.length>=5){flash('自定义轮询最多选择 5 个工具');return current;}const options=[CURRENT_TOOL_TOKEN,'select',...activeTools.map(item=>item[0]).filter(toolId=>toolId!=='select')],chosen=new Set(selected?tools.filter(toolId=>toolId!==id):[...tools,id]);return{...current,[key]:options.filter(toolId=>chosen.has(toolId))};});

  const loadDownloads=async()=>{setDownloadsLoading(true);try{if(window.whiteboardDesktop?.listDownloadedImages){setDownloads(await window.whiteboardDesktop.listDownloadedImages());}else{const history=JSON.parse(localStorage.getItem(DOWNLOAD_HISTORY_KEY)||'[]');setDownloads(Array.isArray(history)?history:[]);}}catch{flash('读取下载记录失败');}finally{setDownloadsLoading(false);}};
  const openDownloadManager=()=>{setDialog({type:'downloads'});loadDownloads();};
  const rememberBrowserDownload=item=>{try{const current=JSON.parse(localStorage.getItem(DOWNLOAD_HISTORY_KEY)||'[]'),next=[item,...(Array.isArray(current)?current:[]).filter(entry=>entry.name!==item.name)].slice(0,30);localStorage.setItem(DOWNLOAD_HISTORY_KEY,JSON.stringify(next));setDownloads(next);}catch{setDownloads(current=>[item,...current].slice(0,30));}};
  const openDownloadsFolder=async()=>{if(!window.whiteboardDesktop?.openDownloadsFolder){flash('请在桌面版中打开下载目录');return;}const error=await window.whiteboardDesktop.openDownloadsFolder();if(error)flash('下载目录打开失败');};
  const openDownloadedImage=async name=>{const error=await window.whiteboardDesktop?.openDownloadedImage?.(name);if(error)flash('图片打开失败');};
  const revealDownloadedImage=async name=>{await window.whiteboardDesktop?.revealDownloadedImage?.(name);};

  const exportPng=()=>{
    const original=svgRef.current;if(!original)return;
    const copy=original.cloneNode(true),display=original.getBoundingClientRect(),density=Math.min(2,Math.max(1,window.devicePixelRatio||1)),pixelWidth=Math.max(1,Math.round(display.width*density)),pixelHeight=Math.max(1,Math.round(display.height*density)),svgNs='http://www.w3.org/2000/svg';
    copy.querySelectorAll('.selection-box,.hover-box,.connection-anchors,.connector-preview,.eraser-preview,.connector-hit,.connector-flow').forEach(node=>node.remove());
    copy.querySelectorAll('foreignObject').forEach(node=>{const content=node.querySelector('div'),value=content?.textContent||'',x=Number(node.getAttribute('x'))||0,y=Number(node.getAttribute('y'))||0,w=Number(node.getAttribute('width'))||200,h=Number(node.getAttribute('height'))||60,size=parseFloat(content?.style.fontSize)||22,lineHeight=size*1.3,isShape=node.classList.contains('shape-label'),limit=Math.max(1,Math.floor(w/(size*(isShape?1.02:.82)))),lines=value.split('\n').flatMap(paragraph=>paragraph.match(new RegExp(`.{1,${limit}}`,'g'))||['']),textNode=document.createElementNS(svgNs,'text'),totalHeight=lines.length*lineHeight,startY=isShape?y+(h-totalHeight)/2+size:y+size;textNode.setAttribute('x',isShape?x+w/2:x);textNode.setAttribute('y',startY);textNode.setAttribute('fill',content?.style.color||'#17191d');textNode.setAttribute('font-size',size);textNode.setAttribute('font-family',content?.style.fontFamily||'Microsoft YaHei, sans-serif');textNode.setAttribute('font-weight','500');textNode.setAttribute('text-anchor',isShape?'middle':'start');lines.forEach((line,index)=>{const tspan=document.createElementNS(svgNs,'tspan');tspan.setAttribute('x',isShape?x+w/2:x);tspan.setAttribute('dy',index?lineHeight:0);tspan.textContent=line;textNode.appendChild(tspan);});node.replaceWith(textNode);});
    copy.setAttribute('xmlns',svgNs);copy.setAttribute('width',pixelWidth);copy.setAttribute('height',pixelHeight);copy.setAttribute('viewBox',`${camera.x} ${camera.y} ${viewWidth} ${viewHeight}`);copy.removeAttribute('class');
    const source=new XMLSerializer().serializeToString(copy),svgBlob=new Blob([source],{type:'image/svg+xml;charset=utf-8'}),svgUrl=URL.createObjectURL(svgBlob),img=new Image();let finished=false;flash('正在生成 PNG…');
    const fail=()=>{if(finished)return;finished=true;URL.revokeObjectURL(svgUrl);flash('导出失败，请重试');},timeout=window.setTimeout(fail,5000);
    img.onload=()=>{if(finished)return;finished=true;window.clearTimeout(timeout);try{const canvas=document.createElement('canvas');canvas.width=pixelWidth;canvas.height=pixelHeight;const ctx=canvas.getContext('2d');if(!ctx){URL.revokeObjectURL(svgUrl);flash('导出失败，请重试');return;}ctx.fillStyle='#fff';ctx.fillRect(0,0,pixelWidth,pixelHeight);ctx.drawImage(img,0,0,pixelWidth,pixelHeight);URL.revokeObjectURL(svgUrl);canvas.toBlob(async png=>{if(!png){flash('导出失败，请重试');return;}const safeTitle=activeBoard.title.replace(/[\\/:*?"<>|]/g,'-').trim()||'灵感白板',fileName=`${safeTitle}.png`;if(window.whiteboardDesktop?.savePng){try{const saved=await window.whiteboardDesktop.savePng(fileName,await png.arrayBuffer());setDownloads(current=>[saved,...current.filter(item=>item.path!==saved.path)]);flash(`已保存到下载目录：${saved.name}`);}catch{flash('保存到下载目录失败');}return;}const pngUrl=URL.createObjectURL(png),a=document.createElement('a');a.download=fileName;a.href=pngUrl;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(pngUrl),1000);rememberBrowserDownload({name:fileName,size:png.size,updatedAt:Date.now(),browserOnly:true});flash(`已下载 ${pixelWidth} × ${pixelHeight} PNG`);},'image/png');}catch{URL.revokeObjectURL(svgUrl);flash('导出失败，请重试');}};
    img.onerror=()=>{window.clearTimeout(timeout);fail();};img.src=svgUrl;
  };
  const inlineEditorStyle=inlineEditor?{left:(inlineEditor.x-camera.x)*zoom,top:(inlineEditor.y-camera.y)*zoom,width:inlineEditor.w*zoom,height:inlineEditor.h*zoom,'--inline-color':inlineEditor.color,'--inline-font-size':`${(inlineEditor.size||22)*zoom}px`}:undefined;
  const connectorDraftPoints=connectorDraft?(connectorDraft.toId&&elementMap.get(connectorDraft.toId)?routeBetweenAnchors(connectorDraft.start,connectorDraft.fromSide,anchorPoint(elementMap.get(connectorDraft.toId),connectorDraft.toSide),connectorDraft.toSide):routeToPointer(connectorDraft.start,connectorDraft.fromSide,connectorDraft.toPoint)):[];
  const draftCycleTools=settingsDraft?(toolMode==='flowchart'?settingsDraft.flowchartTools:settingsDraft.whiteboardTools):[];
  const cycleOptions=[[CURRENT_TOOL_TOKEN,'当前工具'],['select','选择 / 拖动画布'],...activeTools.filter(([id])=>id!=='select')];

  return <main className="app">
    <header className="topbar"><div className="identity"><div className="logo"><img src={bulbLogo} alt="" aria-hidden="true"/></div><strong>灵感白板</strong><button className={`library-toggle ${sidebarOpen?'active':''}`} onClick={()=>setSidebarOpen(!sidebarOpen)} aria-expanded={sidebarOpen} title={sidebarOpen?'收起画板库':'展开画板库'}><Icon name={sidebarOpen?'panelClose':'panelOpen'} size={19}/>我的画板<span>{boards.length}</span></button><button className="board-title-button" onClick={()=>setDialog({type:'board',mode:'rename',boardId:activeBoard.id,value:activeBoard.title})}>{activeBoard.title}<Icon name="edit" size={17}/></button><div className={`save-status ${saveState}`}><span><Icon name="check" size={14}/></span>{saveState==='saving'?'保存中…':saveState==='error'?'保存失败':'已自动保存'}</div></div><div className="actions"><button className="secondary" onClick={()=>{setSettingsDraft(clone(toolCycle));setDialog({type:'settings'});}}><Icon name="settings" size={18}/>设置</button><button className="secondary about-button" onClick={()=>setDialog({type:'about'})}><Icon name="info" size={18}/>关于</button><button className="secondary" onClick={openDownloadManager}><Icon name="folder" size={18}/>下载管理</button><button className="secondary" onClick={()=>setDialog({type:'delete-content'})}><Icon name="trash" size={18}/>清空</button><button className="secondary" onClick={exportPng}><Icon name="download" size={18}/>导出</button></div></header>
    {sidebarOpen?<BoardSidebar boards={boards} activeId={activeBoardId} search={search} setSearch={setSearch} onSelect={switchBoard} onNew={()=>setDialog({type:'board',mode:'new',value:`未命名画板 ${boards.length+1}`})} onRename={b=>setDialog({type:'board',mode:'rename',boardId:b.id,value:b.title})} onDelete={b=>setDialog({type:'delete',boardId:b.id,boardTitle:b.title})} onClose={()=>setSidebarOpen(false)}/>:null}
    {!sidebarOpen?<button className="sidebar-reopen" onClick={()=>setSidebarOpen(true)} aria-label="展开画板库" title="展开画板库"><Icon name="panelOpen" size={21}/><span>画板库</span></button>:null}
    <section className={`workspace ${sidebarOpen?'with-sidebar':''}`}>
      {!dockVisible?<button className="tool-dock-trigger" aria-label="显示工具箱" title="鼠标移入显示工具箱" onMouseEnter={enterDock} onFocus={enterDock} onClick={enterDock}><Icon name="pin" size={16}/><span>工具</span></button>:null}
      <div className={`tool-dock ${dockVisible?'':'dock-hidden'}`} role="toolbar" aria-label="白板工具" onMouseEnter={enterDock} onMouseLeave={leaveDock} onPointerDown={armDockTimer}><div className={`tool-main-row ${toolMode}`}><div className="tool-mode-switch" role="tablist" aria-label="工具模式"><button role="tab" aria-selected={toolMode==='whiteboard'} className={toolMode==='whiteboard'?'active':''} onClick={()=>switchToolMode('whiteboard')}><Icon name="pen" size={18}/><strong>画板</strong></button><button role="tab" aria-selected={toolMode==='flowchart'} className={toolMode==='flowchart'?'active':''} onClick={()=>switchToolMode('flowchart')}><Icon name="flow" size={18}/><strong>流程图</strong></button></div><span className="tool-main-divider"/><div className="tool-row">{activeTools.map(renderToolButton)}</div></div><div className="option-row">{toolMode==='flowchart'?<div className="flow-color-note"><span/>黑色图形 · 黑色文字</div>:<div className="colors">{COLORS.map(c=><button key={c} aria-label={`选择颜色 ${c}`} className={`swatch ${color===c?'selected':''}`} style={{background:c}} onClick={()=>setColor(c)}/>)}</div>}<span className="small-divider"/><button className="icon-only" aria-label={tool==='eraser'?'缩小橡皮':'减小笔画'} onClick={()=>tool==='eraser'?setEraserSize(Math.max(8,eraserSize-4)):setStrokeWidth(Math.max(2,strokeWidth-1))}><Icon name="minus" size={18}/></button>{tool==='eraser'?<span className="eraser-size-label">橡皮 {eraserSize}</span>:<span className="stroke-preview" style={{height:strokeWidth,background:color}}/>}<button className="icon-only" aria-label={tool==='eraser'?'放大橡皮':'增大笔画'} onClick={()=>tool==='eraser'?setEraserSize(Math.min(80,eraserSize+4)):setStrokeWidth(Math.min(12,strokeWidth+1))}><Icon name="plus" size={18}/></button><span className="small-divider"/>{toolMode==='flowchart'?<><button className={`flow-toggle ${(selectedConnector?.type==='connector'?selectedConnector.animated!==false:flowEnabled)?'active':''}`} aria-pressed={selectedConnector?.type==='connector'?selectedConnector.animated!==false:flowEnabled} title={selectedConnector?.type==='connector'?'切换当前连线流动效果':'设置新连线的流动效果'} onClick={toggleFlow}><Icon name="flow" size={19}/><span>流动</span></button><span className="small-divider"/></>:null}<button className="history-button copy-button" disabled={!selectedId||selectedConnector?.type==='connector'} onClick={duplicateSelected} title="复制选中元素（Ctrl + D）"><Icon name="copy" size={20}/><span>复制</span></button><button className="history-button" disabled={historyIndex===0} onClick={undo}><Icon name="undo" size={20}/><span>撤销</span></button><button className="history-button" disabled={historyIndex===history.length-1} onClick={redo}><Icon name="redo" size={20}/><span>重做</span></button><span className="small-divider"/><button className={`dock-pin ${dockPinned?'active':''}`} aria-label={dockPinned?'取消固定工具箱':'固定工具箱'} aria-pressed={dockPinned} title={dockPinned?'取消固定，5 秒后自动隐藏':'固定工具箱一直显示'} onClick={()=>setDockPinned(value=>!value)}><Icon name="pin" size={18}/><span>{dockPinned?'已固定':'固定'}</span></button></div>{stickerOpen?<div className="sticker-panel"><div className="panel-title"><span>选择贴纸</span><button onClick={()=>setStickerOpen(false)} aria-label="关闭"><Icon name="x" size={18}/></button></div><div className="sticker-grid">{STICKERS.map(s=><button key={s} className={pendingSticker===s?'chosen':''} onClick={()=>{setPendingSticker(s);setTool('sticker');}}>{s}</button>)}</div><p>选择后在白板任意位置点击</p></div>:null}</div>
      <div className="canvas-viewport" ref={viewportRef}><svg ref={svgRef} className={`board infinite-board mode-${toolMode} tool-${tool} ${isPanning?'panning':''} ${spacePressed?'pan-ready':''} ${hoveredId?'hover-element':''}`} viewBox={`${camera.x} ${camera.y} ${viewWidth} ${viewHeight}`} onWheel={onCanvasWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerLeave={()=>{setHoveredId(null);setEraserPoint(null);}} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onDoubleClick={onDoubleClick}><defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#dfe4ea"/></pattern></defs><rect x={camera.x} y={camera.y} width={viewWidth} height={viewHeight} fill="#fff"/><rect x={camera.x} y={camera.y} width={viewWidth} height={viewHeight} fill="url(#dots)"/>{orderedElements.map(el=><CanvasElement key={el.id} el={el} elementMap={elementMap} hovered={hoveredId===el.id} selected={selectedId===el.id||connectorStartId===el.id} showAnchors={toolMode==='flowchart'&&CONNECTABLE_TYPES.has(el.type)&&(selectedId===el.id||Boolean(connectorDraft))}/>)}{connectorDraftPoints.length?<g className={`connector-preview ${connectorDraft?.toId?'valid':''}`}><polyline points={connectorDraftPoints.map(p=>p.join(',')).join(' ')}/><circle cx={connectorDraftPoints.at(-1)[0]} cy={connectorDraftPoints.at(-1)[1]} r="7"/></g>:null}{tool==='eraser'&&eraserPoint?<circle className="eraser-preview" cx={eraserPoint.x} cy={eraserPoint.y} r={eraserSize/2} vectorEffect="non-scaling-stroke"/>:null}</svg></div>
      {inlineEditor?<InlineTextEditor key={inlineEditor.sessionId} editor={inlineEditor} style={inlineEditorStyle} zoom={zoom} valueRef={inlineValueRef} onCommit={commitInlineText} onCancel={editor=>setInlineEditor(current=>current?.sessionId===editor.sessionId?null:current)}/>:null}
      <div className="page-control"><strong>无限画布</strong><span/><small>空白处拖动</small></div><div className="zoom-control"><button aria-label="缩小" onClick={()=>setZoom(Math.max(.4,+(zoom-.1).toFixed(1)))}><Icon name="minus" size={19}/></button><strong>{Math.round(zoom*100)}%</strong><button aria-label="放大" onClick={()=>setZoom(Math.min(2.5,+(zoom+.1).toFixed(1)))}><Icon name="plus" size={19}/></button><span/><button aria-label="回到原点" title="回到原点" onClick={()=>{setZoom(1);setCamera({x:0,y:0});}}><Icon name="fit" size={20}/></button></div>
    </section>
    {dialog?.type==='downloads'?<DownloadManager items={downloads} loading={downloadsLoading} isDesktop={Boolean(window.whiteboardDesktop)} onClose={()=>setDialog(null)} onRefresh={loadDownloads} onOpenFolder={openDownloadsFolder} onOpen={openDownloadedImage} onReveal={revealDownloadedImage}/>:dialog?.type==='settings'?<div className="modal-scrim" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setDialog(null);}}><div className="app-dialog settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="dialog-head"><div><h2 id="settings-title">工具切换设置</h2><p>滚轮只在当前工具模式中轮询，画板与流程图互不混用</p></div><button className="dialog-close" onClick={()=>setDialog(null)} aria-label="关闭"><Icon name="x"/></button></div><div className="cycle-mode"><button className={settingsDraft?.mode==='quick'?'selected':''} aria-pressed={settingsDraft?.mode==='quick'} onClick={()=>setSettingsDraft(current=>({...current,mode:'quick'}))}><strong>快捷双工具</strong><small>当前工具与选择工具来回切换</small></button><button className={settingsDraft?.mode==='custom'?'selected':''} aria-pressed={settingsDraft?.mode==='custom'} onClick={()=>setSettingsDraft(current=>({...current,mode:'custom'}))}><strong>自定义</strong><small>选择 2–5 个常用工具</small></button></div>{settingsDraft?.mode==='custom'?<div className="cycle-tools"><div className="cycle-tools-head"><strong>选择轮询工具</strong><span>{draftCycleTools.length} / 5</span></div><div className="cycle-tool-grid">{cycleOptions.map(([id,label])=><button key={id} className={draftCycleTools.includes(id)?'selected':''} aria-pressed={draftCycleTools.includes(id)} onClick={()=>toggleCycleTool(id)}><Icon name={id} size={19}/><span>{label}</span>{draftCycleTools.includes(id)?<Icon name="check" size={15}/>:null}</button>)}</div><small className="settings-hint">“当前工具”会自动跟随你最后主动选择的工具；滚轮向下或向上循环切换。</small></div>:<div className="cycle-tools quick-cycle-preview"><div className="cycle-tools-head"><strong>默认勾选</strong><span>2 / 2</span></div><div className="cycle-tool-grid"><button className="selected" aria-pressed="true"><Icon name="current" size={19}/><span>当前工具</span><Icon name="check" size={15}/></button><button className="selected" aria-pressed="true"><Icon name="select" size={19}/><span>选择 / 拖动画布</span><Icon name="check" size={15}/></button></div><small className="settings-hint">例如正在使用画笔：滚一下切到选择工具拖动画布，再滚一下回到画笔。</small></div>}<div className="dialog-actions"><button className="secondary" onClick={()=>setDialog(null)}>取消</button><button className="primary" onClick={()=>{setToolCycle(settingsDraft);setDialog(null);flash('工具轮询设置已保存');}}>保存设置</button></div></div></div>:dialog?.type==='about'?<div className="modal-scrim" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setDialog(null);}}><div className="app-dialog about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title"><div className="dialog-head"><h2 id="about-title">关于灵感白板</h2><button className="dialog-close" onClick={()=>setDialog(null)} aria-label="关闭"><Icon name="x"/></button></div><div className="about-author"><div className="author-avatar">楠</div><div><small>设计与开发</small><strong>张楠</strong><a href="https://github.com/zhangnanydl" target="_blank" rel="noreferrer">GitHub · @zhangnanydl</a></div></div><p className="about-copy">为课堂教学打造的本地优先无限白板。欢迎在 GitHub 查看源码、提交建议并参与改进。</p><a className="repository-link" href="https://github.com/zhangnanydl/linggan-whiteboard" target="_blank" rel="noreferrer"><Icon name="grid" size={19}/><span><strong>开源项目仓库</strong><small>zhangnanydl/linggan-whiteboard</small></span><Icon name="arrow" size={18}/></a><div className="about-version"><span>灵感白板</span><strong>v{APP_VERSION}</strong></div></div></div>:dialog?.type==='delete-content'?<div className="modal-scrim"><div className="app-dialog" role="dialog" aria-modal="true"><div className="dialog-head"><h2>清空当前画板</h2><button className="dialog-close" onClick={()=>setDialog(null)}><Icon name="x"/></button></div><div className="delete-copy"><div className="delete-symbol"><Icon name="trash"/></div><p>确定清空“{activeBoard.title}”吗？画板本身会保留，但其中所有内容将被删除。</p></div><div className="dialog-actions"><button className="secondary" onClick={()=>setDialog(null)}>取消</button><button className="danger" onClick={()=>{commit([]);setDialog(null);}}>确认清空</button></div></div></div>:dialog?<AppDialog key={`${dialog.type}-${dialog.mode||''}-${dialog.editId||dialog.boardId||''}`} dialog={dialog} onClose={()=>setDialog(null)} onSubmit={submitDialog}/>:null}
    {toast?<div className="toast">{toast}</div>:null}
  </main>;
}

createRoot(document.getElementById('root')).render(<Whiteboard/>);
