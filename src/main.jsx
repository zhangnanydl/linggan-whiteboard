import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORAGE_KEY = 'linggan-whiteboard-workspace-v2';
const UI_STORAGE_KEY = 'linggan-whiteboard-ui-v1';
const DOCK_STORAGE_KEY = 'linggan-whiteboard-dock-pinned-v1';
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
    eraser: <><path d="m7 20-3-3 10-12a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3l-8 10Z"/><path d="m11 20 4-5"/><path d="M7 20h12"/></>,
    line: <path d="M5 19 19 5"/>, rect: <rect x="4" y="4" width="16" height="16" rx="1"/>, circle: <circle cx="12" cy="12" r="8"/>,
    text: <><path d="M5 5h14"/><path d="M12 5v14"/><path d="M8 19h8"/></>,
    sticky: <><path d="M5 4h14v11l-5 5H5Z"/><path d="M14 20v-5h5"/></>,
    sticker: <><circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01"/><path d="M8.5 14c1.4 2 5.6 2 7 0"/></>,
    undo: <><path d="m9 7-5 5 5 5"/><path d="M5 12h8a6 6 0 0 1 6 6"/></>, redo: <><path d="m15 7 5 5-5 5"/><path d="M19 12h-8a6 6 0 0 0-6 6"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></>, play: <path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/>,
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
    pin: <><path d="m14 4 6 6-3 1-4 4-1 5-3-6-5-5 5-1 4-4Z"/><path d="m9 15-5 5"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
};

const TOOLS = [['select','选择'],['pen','画笔'],['highlight','荧光笔'],['eraser','橡皮擦'],['line','直线'],['rect','矩形'],['circle','圆形'],['text','文本'],['sticky','便签'],['sticker','贴纸']];

const seedElements = [
  { id:'title',type:'text',x:305,y:280,text:'今天的思考',color:'#17191d',size:48,font:'hand' },
  { id:'underline',type:'path',color:'#ff6663',width:6,points:[[305,335],[420,328],[565,325],[700,326]] },
  { id:'key',type:'text',x:275,y:405,text:'重点',color:'#175cd3',size:34,font:'hand' },
  { id:'keycircle',type:'ellipse',x:250,y:365,w:135,h:78,color:'#175cd3',width:3 },
  { id:'desc',type:'text',x:420,y:405,text:'理解概念 · 观察关系 · 归纳总结',color:'#20242b',size:24,font:'hand' },
  { id:'box1',type:'rect',x:320,y:455,w:105,h:66,color:'#41a05d',width:3 },
  { id:'box1t',type:'text',x:342,y:496,text:'输入',color:'#287841',size:24,font:'hand' },
  { id:'arrow1',type:'line',x:438,y:488,x2:500,y2:488,color:'#41a05d',width:3,arrow:true },
  { id:'box2',type:'rect',x:505,y:445,w:230,h:78,color:'#41a05d',width:3 },
  { id:'box2t',type:'text',x:552,y:492,text:'处理过程',color:'#287841',size:24,font:'hand' },
  { id:'arrow2',type:'line',x:745,y:488,x2:805,y2:488,color:'#41a05d',width:3,arrow:true },
  { id:'box3',type:'rect',x:815,y:455,w:105,h:66,color:'#41a05d',width:3 },
  { id:'box3t',type:'text',x:837,y:496,text:'输出',color:'#287841',size:24,font:'hand' },
  { id:'note1',type:'sticky',x:380,y:575,w:168,h:132,color:'#ffb9bd',text:'注意：\n联系生活中的\n例子哦！',rotate:-4 },
  { id:'note2',type:'sticky',x:650,y:570,w:168,h:132,color:'#ffe381',text:'小组讨论后\n分享你的\n想法～',rotate:2 },
  { id:'star',type:'sticker',x:945,y:555,w:92,h:92,text:'⭐' }
];

const clone = value => JSON.parse(JSON.stringify(value));
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

const bounds = el => {
  if(el.type==='path'){const xs=el.points.map(p=>p[0]),ys=el.points.map(p=>p[1]);return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}
  if(el.type==='line')return{x:Math.min(el.x,el.x2),y:Math.min(el.y,el.y2),w:Math.abs(el.x2-el.x),h:Math.abs(el.y2-el.y)};
  if(el.type==='text')return{x:el.x,y:el.y-el.size,w:Math.max(...el.text.split('\n').map(t=>t.length))*el.size*.72,h:el.size*1.25*el.text.split('\n').length};
  return{x:el.x,y:el.y,w:el.w||1,h:el.h||1};
};
const wrapNote = text => text.split('\n').flatMap(line => line.length>9 ? (line.match(/.{1,9}/g)||[]) : [line]).slice(0,4);

function CanvasElement({el,selected=false,thumbnail=false}){
  const b=bounds(el),font=el.font==='hand'?"'KaiTi','STKaiti',cursive":"Inter,'Microsoft YaHei',sans-serif";
  let core;
  if(el.type==='path')core=<polyline points={el.points.map(p=>p.join(',')).join(' ')} fill="none" stroke={el.color} strokeWidth={el.width} opacity={el.opacity||1} strokeLinecap="round" strokeLinejoin="round"/>;
  else if(el.type==='line')core=<g><line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={el.color} strokeWidth={el.width} strokeLinecap="round"/>{el.arrow?<path d={`M ${el.x2-12} ${el.y2-8} L ${el.x2} ${el.y2} L ${el.x2-12} ${el.y2+8}`} fill="none" stroke={el.color} strokeWidth={el.width} strokeLinecap="round" strokeLinejoin="round"/>:null}</g>;
  else if(el.type==='rect')core=<rect x={el.x} y={el.y} width={el.w} height={el.h} fill="none" stroke={el.color} strokeWidth={el.width} rx="2"/>;
  else if(el.type==='ellipse')core=<ellipse cx={el.x+el.w/2} cy={el.y+el.h/2} rx={el.w/2} ry={el.h/2} fill="none" stroke={el.color} strokeWidth={el.width}/>;
  else if(el.type==='text')core=<text x={el.x} y={el.y} fill={el.color} fontSize={el.size} fontFamily={font}>{el.text.split('\n').map((line,i)=><tspan key={i} x={el.x} dy={i?el.size*1.25:0}>{line}</tspan>)}</text>;
  else if(el.type==='sticky')core=<g transform={`rotate(${el.rotate||0} ${el.x+el.w/2} ${el.y+el.h/2})`}><path d={`M${el.x} ${el.y}h${el.w}v${el.h-18}l-18 18h-${el.w-18}Z`} fill={el.color} filter={thumbnail?undefined:`url(#shadow-${el.id})`}/>{wrapNote(el.text).map((t,i)=><text key={i} x={el.x+20} y={el.y+36+i*27} fontSize="19" fontFamily="'KaiTi','STKaiti',cursive" fill="#272b32">{t}</text>)}</g>;
  else core=<text x={el.x} y={el.y+el.h*.78} fontSize={el.w*.82} className="sticker-svg">{el.text}</text>;
  return <g>{!thumbnail&&el.type==='sticky'?<defs><filter id={`shadow-${el.id}`}><feDropShadow dx="0" dy="7" stdDeviation="7" floodOpacity=".14"/></filter></defs>:null}{core}{selected?<g className="selection-box"><rect x={b.x-8} y={b.y-8} width={Math.max(b.w+16,24)} height={Math.max(b.h+16,24)} fill="none" stroke="#1769e0" strokeWidth="1.5" strokeDasharray="5 4"/><circle cx={b.x-8} cy={b.y-8} r="4"/><circle cx={b.x+b.w+8} cy={b.y+b.h+8} r="4"/></g>:null}</g>;
}

function BoardThumbnail({elements}){
  return <svg className="board-thumbnail" viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} aria-hidden="true"><rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#fff"/>{elements.slice(0,18).map(el=><CanvasElement key={el.id} el={el} thumbnail/>)}</svg>;
}

function AppDialog({dialog,onClose,onSubmit}){
  const [value,setValue]=useState(dialog.value||'');
  const [noteColor,setNoteColor]=useState(dialog.color||NOTE_COLORS[0]);
  const destructive=dialog.type==='delete';
  const isText=dialog.type==='sticky'||dialog.type==='text';
  const heading=dialog.type==='sticky'?(dialog.editId?'编辑便签':'添加便签'):dialog.type==='text'?(dialog.editId?'编辑文字':'添加文字'):dialog.mode==='new'?'新建画板':dialog.type==='delete'?'删除画板':'重命名画板';
  const button=dialog.type==='sticky'?'添加到画板':dialog.type==='text'?'添加到画板':dialog.mode==='new'?'创建画板':dialog.type==='delete'?'确认删除':'保存名称';
  const submit=e=>{e.preventDefault();if(!destructive&&!value.trim())return;onSubmit({...dialog,value:value.trim(),color:noteColor});};
  useEffect(()=>{const key=e=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[onClose]);
  return <div className="modal-scrim" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><form className={`app-dialog ${isText?'wide':''}`} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <div className="dialog-head"><h2 id="dialog-title">{heading}</h2><button type="button" className="dialog-close" onClick={onClose} aria-label="关闭"><Icon name="x"/></button></div>
    {destructive?<div className="delete-copy"><div className="delete-symbol"><Icon name="trash"/></div><p>删除“{dialog.boardTitle}”后将无法恢复，其中的书写、图形和便签都会被移除。</p></div>:isText?<div className={dialog.type==='sticky'?'note-editor-layout':'text-editor-layout'}><div className="dialog-fields"><label htmlFor="dialog-value">{dialog.type==='sticky'?'便签内容':'文字内容'}</label><textarea id="dialog-value" autoFocus value={value} onChange={e=>setValue(e.target.value)} placeholder={dialog.type==='sticky'?'输入要提醒的内容':'输入要写在画板上的文字'} rows={dialog.type==='sticky'?5:4}/>{dialog.type==='sticky'?<><label>选择颜色</label><div className="note-colors">{NOTE_COLORS.map(c=><button type="button" key={c} aria-label={`便签颜色 ${c}`} className={noteColor===c?'selected':''} style={{background:c}} onClick={()=>setNoteColor(c)}/>)}</div></>:null}</div>{dialog.type==='sticky'?<div className="note-preview" style={{background:noteColor}}>{wrapNote(value||'便签预览').map((line,i)=><span key={i}>{line}</span>)}</div>:null}</div>:<div className="dialog-fields"><label htmlFor="dialog-value">画板名称</label><input id="dialog-value" autoFocus value={value} onChange={e=>setValue(e.target.value)} maxLength="30" placeholder="例如：函数入门课"/><span className="field-hint">名称会自动保存在本机</span></div>}
    <div className="dialog-actions"><button type="button" className="secondary" onClick={onClose}>取消</button><button type="submit" className={destructive?'danger':'primary'}>{button}</button></div>
  </form></div>;
}

function BoardSidebar({boards,activeId,search,setSearch,onSelect,onNew,onRename,onDelete,onClose}){
  const [menuId,setMenuId]=useState(null);
  const filtered=useMemo(()=>boards.filter(b=>b.title.toLowerCase().includes(search.trim().toLowerCase())),[boards,search]);
  const ageLabel=updatedAt=>{const age=Date.now()-updatedAt;if(age<60000)return'刚刚';if(age<86400000)return'今天';if(age<2*86400000)return'昨天';return new Date(updatedAt).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'});};
  return <aside className="board-sidebar"><div className="sidebar-head"><div className="sidebar-title"><h2>我的画板</h2><button className="sidebar-close" onClick={onClose} aria-label="收起画板库" title="收起画板库"><Icon name="panelClose" size={20}/></button></div><button className="new-board" onClick={onNew}><Icon name="plus"/>新建画板</button><label className="search-box"><Icon name="search" size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索画板" aria-label="搜索画板"/></label></div><div className="board-list">{filtered.map(board=><div key={board.id} className={`board-row ${board.id===activeId?'active':''}`}><button className="board-main" onClick={()=>onSelect(board.id)}><BoardThumbnail elements={board.elements}/><span className="board-meta"><strong>{board.title}</strong><small>{ageLabel(board.updatedAt)}</small></span></button><button className="more-button" aria-label={`${board.title}菜单`} onClick={()=>setMenuId(menuId===board.id?null:board.id)}><Icon name="more"/></button>{menuId===board.id?<div className="board-menu"><button onClick={()=>{setMenuId(null);onRename(board);}}><Icon name="edit" size={17}/>重命名</button><button className="delete" onClick={()=>{setMenuId(null);onDelete(board);}}><Icon name="trash" size={17}/>删除</button></div>:null}</div>)}{filtered.length===0?<div className="empty-search">没有找到相关画板</div>:null}</div><div className="local-note"><Icon name="cloud" size={18}/><span>内容保存在本机</span></div></aside>;
}

function Whiteboard(){
  const initial=useRef(loadWorkspace()).current;
  const [boards,setBoards]=useState(initial.boards);
  const [activeBoardId,setActiveBoardId]=useState(initial.activeBoardId);
  const initialActive=initial.boards.find(b=>b.id===initial.activeBoardId)||initial.boards[0];
  const [elements,setElements]=useState(initialActive.elements);
  const [history,setHistory]=useState([initialActive.elements]);
  const [historyIndex,setHistoryIndex]=useState(0);
  const [tool,setTool]=useState('select'); const [color,setColor]=useState('#175cd3'); const [strokeWidth,setStrokeWidth]=useState(4);
  const [selectedId,setSelectedId]=useState(null); const [stickerOpen,setStickerOpen]=useState(false); const [pendingSticker,setPendingSticker]=useState('⭐');
  const [zoom,setZoom]=useState(1); const [camera,setCamera]=useState({x:0,y:0}); const [viewportSize,setViewportSize]=useState({width:1280,height:720});
  const [isPanning,setIsPanning]=useState(false); const [spacePressed,setSpacePressed]=useState(false); const [hoveringElement,setHoveringElement]=useState(false);
  const [dockPinned,setDockPinned]=useState(loadDockPreference); const [dockVisible,setDockVisible]=useState(true);
  const [presenting,setPresenting]=useState(false); const [toast,setToast]=useState('');
  const [sidebarOpen,setSidebarOpen]=useState(loadSidebarPreference); const [search,setSearch]=useState(''); const [dialog,setDialog]=useState(null); const [saveState,setSaveState]=useState('saved');
  const svgRef=useRef(null),viewportRef=useRef(null),gesture=useRef(null),keyboardState=useRef(null),saveTimer=useRef(null),dockTimer=useRef(null),dockHovered=useRef(false);
  const activeBoard=boards.find(b=>b.id===activeBoardId)||boards[0];

  const flash=message=>{setToast(message);window.setTimeout(()=>setToast(''),1800);};
  const clearDockTimer=()=>window.clearTimeout(dockTimer.current);
  const armDockTimer=()=>{clearDockTimer();if(!dockPinned)dockTimer.current=window.setTimeout(()=>{if(!dockHovered.current)setDockVisible(false);},5000);};
  const enterDock=()=>{dockHovered.current=true;clearDockTimer();setDockVisible(true);};
  const leaveDock=()=>{dockHovered.current=false;armDockTimer();};
  const persistElements=next=>{setElements(next);setBoards(prev=>prev.map(b=>b.id===activeBoardId?{...b,elements:clone(next),updatedAt:Date.now()}:b));setSaveState('saving');};
  const commit=next=>{const sliced=history.slice(0,historyIndex+1);persistElements(next);setHistory([...sliced,clone(next)]);setHistoryIndex(sliced.length);};
  const undo=()=>{if(historyIndex>0){const i=historyIndex-1;setHistoryIndex(i);persistElements(clone(history[i]));setSelectedId(null);}};
  const redo=()=>{if(historyIndex<history.length-1){const i=historyIndex+1;setHistoryIndex(i);persistElements(clone(history[i]));setSelectedId(null);}};

  useEffect(()=>{window.clearTimeout(saveTimer.current);saveTimer.current=window.setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({boards,activeBoardId}));setSaveState('saved');}catch{setSaveState('error');}},220);return()=>window.clearTimeout(saveTimer.current);},[boards,activeBoardId]);
  useEffect(()=>{try{localStorage.setItem(UI_STORAGE_KEY,sidebarOpen?'open':'closed');}catch{ /* keep the current session state */ }},[sidebarOpen]);
  useEffect(()=>{try{localStorage.setItem(DOCK_STORAGE_KEY,dockPinned?'pinned':'auto');}catch{ /* keep the current session state */ }clearDockTimer();if(dockPinned)setDockVisible(true);else armDockTimer();return clearDockTimer;},[dockPinned]);
  useEffect(()=>{const node=viewportRef.current;if(!node)return;const update=()=>setViewportSize({width:node.clientWidth||1280,height:node.clientHeight||720});update();const observer=new ResizeObserver(update);observer.observe(node);return()=>observer.disconnect();},[]);

  const switchBoard=id=>{const next=boards.find(b=>b.id===id);if(!next||id===activeBoardId)return;setActiveBoardId(id);setElements(clone(next.elements));setHistory([clone(next.elements)]);setHistoryIndex(0);setSelectedId(null);setStickerOpen(false);setCamera({x:0,y:0});setZoom(1);setSaveState('saved');};
  const createBoard=title=>{const board=makeBoard(title,[]);setBoards(prev=>[board,...prev]);setActiveBoardId(board.id);setElements([]);setHistory([[]]);setHistoryIndex(0);setSelectedId(null);setCamera({x:0,y:0});setZoom(1);setSaveState('saving');flash('新画板已创建');};
  const renameBoard=(id,title)=>{setBoards(prev=>prev.map(b=>b.id===id?{...b,title,updatedAt:Date.now()}:b));setSaveState('saving');flash('画板名称已保存');};
  const deleteBoard=id=>{if(boards.length===1){flash('至少保留一个画板');return;}const remaining=boards.filter(b=>b.id!==id);setBoards(remaining);if(id===activeBoardId){setActiveBoardId(remaining[0].id);setElements(clone(remaining[0].elements));setHistory([clone(remaining[0].elements)]);setHistoryIndex(0);setCamera({x:0,y:0});setZoom(1);}setSaveState('saving');flash('画板已删除');};

  const viewWidth=viewportSize.width/zoom,viewHeight=viewportSize.height/zoom;
  const point=event=>{const r=svgRef.current.getBoundingClientRect();return{x:camera.x+(event.clientX-r.left)*viewWidth/r.width,y:camera.y+(event.clientY-r.top)*viewHeight/r.height};};
  const hitTest=({x,y})=>[...elements].reverse().find(el=>{const b=bounds(el);return x>=b.x-10&&x<=b.x+b.w+10&&y>=b.y-10&&y<=b.y+b.h+10;});
  const openElementDialog=(type,p,edit=null)=>setDialog({type,x:p.x,y:p.y,editId:edit?.id,value:edit?.text||'',color:edit?.color||NOTE_COLORS[0]});

  const onPointerDown=event=>{
    if(event.button!==0&&event.button!==1)return;event.preventDefault();if(!dockPinned){clearDockTimer();dockHovered.current=false;setDockVisible(false);}const p=point(event),hit=hitTest(p);svgRef.current.setPointerCapture(event.pointerId);
    if(event.button===1||spacePressed||(tool==='select'&&!hit)){setSelectedId(null);setIsPanning(true);gesture.current={kind:'pan',startClient:{x:event.clientX,y:event.clientY},startCamera:camera};return;}
    if(tool==='select'){setSelectedId(hit?.id||null);if(hit)gesture.current={kind:'move',start:p,original:hit,base:elements};return;}
    if(tool==='eraser'){const hit=hitTest(p);if(hit)commit(elements.filter(e=>e.id!==hit.id));return;}
    if(tool==='text'){openElementDialog('text',p);return;} if(tool==='sticky'){openElementDialog('sticky',p);return;}
    if(tool==='sticker'){commit([...elements,{id:crypto.randomUUID(),type:'sticker',x:p.x-42,y:p.y-42,w:84,h:84,text:pendingSticker}]);return;}
    const id=crypto.randomUUID(),base={id,color,width:tool==='highlight'?18:strokeWidth};let el;
    if(tool==='pen'||tool==='highlight')el={...base,type:'path',opacity:tool==='highlight'?.35:1,points:[[p.x,p.y]]};
    else if(tool==='line')el={...base,type:'line',x:p.x,y:p.y,x2:p.x,y2:p.y};
    else if(tool==='rect'||tool==='circle')el={...base,type:tool==='circle'?'ellipse':'rect',x:p.x,y:p.y,w:0,h:0};
    if(el){setElements([...elements,el]);gesture.current={kind:'draw',id,start:p,base:elements};}
  };
  const onPointerMove=event=>{const g=gesture.current;if(!g){if(tool==='select')setHoveringElement(Boolean(hitTest(point(event))));return;}if(g.kind==='pan'){setCamera({x:g.startCamera.x-(event.clientX-g.startClient.x)/zoom,y:g.startCamera.y-(event.clientY-g.startClient.y)/zoom});return;}const p=point(event);if(g.kind==='move'){const dx=p.x-g.start.x,dy=p.y-g.start.y;setElements(g.base.map(el=>el.id!==g.original.id?el:el.type==='path'?{...el,points:el.points.map(q=>[q[0]+dx,q[1]+dy])}:el.type==='line'?{...el,x:el.x+dx,y:el.y+dy,x2:el.x2+dx,y2:el.y2+dy}:{...el,x:el.x+dx,y:el.y+dy}));return;}setElements(current=>current.map(el=>el.id!==g.id?el:el.type==='path'?{...el,points:[...el.points,[p.x,p.y]]}:el.type==='line'?{...el,x2:p.x,y2:p.y}:{...el,x:Math.min(g.start.x,p.x),y:Math.min(g.start.y,p.y),w:Math.abs(p.x-g.start.x),h:Math.abs(p.y-g.start.y)}));};
  const onPointerUp=()=>{if(!gesture.current)return;const g=gesture.current;gesture.current=null;if(g.kind==='pan'){setIsPanning(false);return;}const next=elements,sliced=history.slice(0,historyIndex+1);persistElements(next);setHistory([...sliced,clone(next)]);setHistoryIndex(sliced.length);if(g.kind==='draw')setSelectedId(g.id);};
  const onDoubleClick=event=>{if(tool!=='select')return;const hit=hitTest(point(event));if(hit?.type==='sticky'||hit?.type==='text')openElementDialog(hit.type,{x:hit.x,y:hit.y},hit);};

  const submitDialog=data=>{
    if(data.type==='board'){data.mode==='new'?createBoard(data.value):renameBoard(data.boardId,data.value);}
    else if(data.type==='delete')deleteBoard(data.boardId);
    else {const existing=elements.find(el=>el.id===data.editId);if(existing){commit(elements.map(el=>el.id===data.editId?{...el,text:data.value,color:data.type==='sticky'?data.color:el.color}:el));}else if(data.type==='sticky'){commit([...elements,{id:crypto.randomUUID(),type:'sticky',x:data.x-84,y:data.y-66,w:174,h:136,color:data.color,text:data.value,rotate:-2}]);}else{commit([...elements,{id:crypto.randomUUID(),type:'text',x:data.x,y:data.y,text:data.value,color,size:30,font:'ui'}]);}}
    setDialog(null);
  };

  keyboardState.current={undo,redo,selectedId,elements,commit};
  useEffect(()=>{const keyDown=e=>{const s=keyboardState.current;if(e.code==='Space'&&!dialog&&!/INPUT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();setSpacePressed(true);}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?s.redo():s.undo();}if((e.key==='Delete'||e.key==='Backspace')&&s.selectedId&&!dialog){e.preventDefault();s.commit(s.elements.filter(x=>x.id!==s.selectedId));setSelectedId(null);}if(e.key==='Escape'){setSelectedId(null);setStickerOpen(false);setSpacePressed(false);}};const keyUp=e=>{if(e.code==='Space')setSpacePressed(false);};window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);return()=>{window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);};},[dialog]);

  const exportPng=()=>{const copy=svgRef.current.cloneNode(true);copy.setAttribute('width',BOARD_WIDTH);copy.setAttribute('height',BOARD_HEIGHT);copy.setAttribute('viewBox',`${camera.x} ${camera.y} ${viewWidth} ${viewHeight}`);const source=new XMLSerializer().serializeToString(copy),blob=new Blob([source],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=BOARD_WIDTH;c.height=BOARD_HEIGHT;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);const a=document.createElement('a');a.download=`${activeBoard.title}.png`;a.href=c.toDataURL('image/png');a.click();URL.revokeObjectURL(url);flash('当前视野已导出为 PNG');};img.src=url;};

  return <main className={presenting?'app presenting':'app'}>
    <header className="topbar"><div className="identity"><div className="logo"><Icon name="bulb" size={24}/></div><strong>灵感白板</strong><button className={`library-toggle ${sidebarOpen?'active':''}`} onClick={()=>setSidebarOpen(!sidebarOpen)} aria-expanded={sidebarOpen} title={sidebarOpen?'收起画板库':'展开画板库'}><Icon name={sidebarOpen?'panelClose':'panelOpen'} size={19}/>我的画板<span>{boards.length}</span></button><button className="board-title-button" onClick={()=>setDialog({type:'board',mode:'rename',boardId:activeBoard.id,value:activeBoard.title})}>{activeBoard.title}<Icon name="edit" size={17}/></button><div className={`save-status ${saveState}`}><span><Icon name="check" size={14}/></span>{saveState==='saving'?'保存中…':saveState==='error'?'保存失败':'已自动保存'}</div></div><div className="actions"><button className="secondary" onClick={()=>setDialog({type:'delete-content'})}><Icon name="trash" size={18}/>清空</button><button className="secondary" onClick={exportPng}><Icon name="download" size={18}/>导出</button><button className="primary" onClick={()=>setPresenting(!presenting)}><Icon name={presenting?'x':'play'} size={18}/>{presenting?'退出演示':'开始演示'}</button></div></header>
    {!presenting&&sidebarOpen?<BoardSidebar boards={boards} activeId={activeBoardId} search={search} setSearch={setSearch} onSelect={switchBoard} onNew={()=>setDialog({type:'board',mode:'new',value:`未命名画板 ${boards.length+1}`})} onRename={b=>setDialog({type:'board',mode:'rename',boardId:b.id,value:b.title})} onDelete={b=>setDialog({type:'delete',boardId:b.id,boardTitle:b.title})} onClose={()=>setSidebarOpen(false)}/>:null}
    {!presenting&&!sidebarOpen?<button className="sidebar-reopen" onClick={()=>setSidebarOpen(true)} aria-label="展开画板库" title="展开画板库"><Icon name="panelOpen" size={21}/><span>画板库</span></button>:null}
    <section className={`workspace ${sidebarOpen&&!presenting?'with-sidebar':''}`}>
      {!presenting&&!dockVisible?<button className="tool-dock-trigger" aria-label="显示工具箱" title="鼠标移入显示工具箱" onMouseEnter={enterDock} onFocus={enterDock} onClick={enterDock}><Icon name="pin" size={16}/><span>工具</span></button>:null}
      <div className={`tool-dock ${dockVisible?'':'dock-hidden'}`} role="toolbar" aria-label="白板工具" onMouseEnter={enterDock} onMouseLeave={leaveDock} onPointerDown={armDockTimer}><div className="tool-row">{TOOLS.map(([id,label])=><button key={id} title={label} className={`tool-button ${tool===id?'active':''}`} onClick={()=>{setTool(id);setStickerOpen(id==='sticker'?!stickerOpen:false);}}><Icon name={id}/><span>{label}</span></button>)}</div><div className="option-row"><div className="colors">{COLORS.map(c=><button key={c} aria-label={`选择颜色 ${c}`} className={`swatch ${color===c?'selected':''}`} style={{background:c}} onClick={()=>setColor(c)}/>)}</div><span className="small-divider"/><button className="icon-only" aria-label="减小笔画" onClick={()=>setStrokeWidth(Math.max(2,strokeWidth-1))}><Icon name="minus" size={18}/></button><span className="stroke-preview" style={{height:strokeWidth,background:color}}/><button className="icon-only" aria-label="增大笔画" onClick={()=>setStrokeWidth(Math.min(12,strokeWidth+1))}><Icon name="plus" size={18}/></button><span className="small-divider"/><button className="history-button" disabled={historyIndex===0} onClick={undo}><Icon name="undo" size={20}/><span>撤销</span></button><button className="history-button" disabled={historyIndex===history.length-1} onClick={redo}><Icon name="redo" size={20}/><span>重做</span></button><span className="small-divider"/><button className={`dock-pin ${dockPinned?'active':''}`} aria-label={dockPinned?'取消固定工具箱':'固定工具箱'} aria-pressed={dockPinned} title={dockPinned?'取消固定，5 秒后自动隐藏':'固定工具箱一直显示'} onClick={()=>setDockPinned(value=>!value)}><Icon name="pin" size={18}/><span>{dockPinned?'已固定':'固定'}</span></button></div>{stickerOpen?<div className="sticker-panel"><div className="panel-title"><span>选择贴纸</span><button onClick={()=>setStickerOpen(false)} aria-label="关闭"><Icon name="x" size={18}/></button></div><div className="sticker-grid">{STICKERS.map(s=><button key={s} className={pendingSticker===s?'chosen':''} onClick={()=>{setPendingSticker(s);setTool('sticker');}}>{s}</button>)}</div><p>选择后在白板任意位置点击</p></div>:null}</div>
      <div className="canvas-viewport" ref={viewportRef}><svg ref={svgRef} className={`board infinite-board tool-${tool} ${isPanning?'panning':''} ${spacePressed?'pan-ready':''} ${hoveringElement?'hover-element':''}`} viewBox={`${camera.x} ${camera.y} ${viewWidth} ${viewHeight}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerLeave={()=>setHoveringElement(false)} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onDoubleClick={onDoubleClick}><defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#dfe4ea"/></pattern></defs><rect x={camera.x} y={camera.y} width={viewWidth} height={viewHeight} fill="#fff"/><rect x={camera.x} y={camera.y} width={viewWidth} height={viewHeight} fill="url(#dots)"/>{elements.map(el=><CanvasElement key={el.id} el={el} selected={selectedId===el.id}/>)}</svg></div>
      <div className="page-control"><strong>无限画布</strong><span/><small>空白处拖动</small></div><div className="zoom-control"><button aria-label="缩小" onClick={()=>setZoom(Math.max(.4,+(zoom-.1).toFixed(1)))}><Icon name="minus" size={19}/></button><strong>{Math.round(zoom*100)}%</strong><button aria-label="放大" onClick={()=>setZoom(Math.min(2.5,+(zoom+.1).toFixed(1)))}><Icon name="plus" size={19}/></button><span/><button aria-label="回到原点" title="回到原点" onClick={()=>{setZoom(1);setCamera({x:0,y:0});}}><Icon name="fit" size={20}/></button></div>
    </section>
    {dialog?.type==='delete-content'?<div className="modal-scrim"><div className="app-dialog" role="dialog" aria-modal="true"><div className="dialog-head"><h2>清空当前画板</h2><button className="dialog-close" onClick={()=>setDialog(null)}><Icon name="x"/></button></div><div className="delete-copy"><div className="delete-symbol"><Icon name="trash"/></div><p>确定清空“{activeBoard.title}”吗？画板本身会保留，但其中所有内容将被删除。</p></div><div className="dialog-actions"><button className="secondary" onClick={()=>setDialog(null)}>取消</button><button className="danger" onClick={()=>{commit([]);setDialog(null);}}>确认清空</button></div></div></div>:dialog?<AppDialog key={`${dialog.type}-${dialog.mode||''}-${dialog.editId||dialog.boardId||''}`} dialog={dialog} onClose={()=>setDialog(null)} onSubmit={submitDialog}/>:null}
    {toast?<div className="toast">{toast}</div>:null}
  </main>;
}

createRoot(document.getElementById('root')).render(<Whiteboard/>);
