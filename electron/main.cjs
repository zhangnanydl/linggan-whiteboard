const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const downloadsRoot = () => app.getPath('downloads');
const safePngPath = (name) => {
  const root = path.resolve(downloadsRoot());
  const cleanName = path.basename(String(name || '灵感白板.png')).replace(/[^\p{L}\p{N}._ -]/gu, '-');
  const fileName = cleanName.toLowerCase().endsWith('.png') ? cleanName : `${cleanName}.png`;
  const target = path.resolve(root, fileName);
  if (path.dirname(target) !== root || path.extname(target).toLowerCase() !== '.png') throw new Error('Invalid PNG path');
  return target;
};
const describeImage = async (filePath) => { const stat=await fs.stat(filePath);return{name:path.basename(filePath),path:filePath,size:stat.size,updatedAt:stat.mtimeMs}; };
const listDownloadedImages = async () => { const root=downloadsRoot(),entries=await fs.readdir(root,{withFileTypes:true}),files=entries.filter(entry=>entry.isFile()&&path.extname(entry.name).toLowerCase()==='.png').map(entry=>path.join(root,entry.name)),images=await Promise.all(files.map(describeImage));return images.sort((a,b)=>b.updatedAt-a.updatedAt); };

ipcMain.handle('downloads:list',listDownloadedImages);
ipcMain.handle('downloads:open-folder',()=>shell.openPath(downloadsRoot()));
ipcMain.handle('downloads:open-file',async(_event,name)=>shell.openPath(safePngPath(name)));
ipcMain.handle('downloads:reveal-file',(_event,name)=>{shell.showItemInFolder(safePngPath(name));return true;});
ipcMain.handle('downloads:save-png',async(_event,{name,data})=>{const requested=safePngPath(name),extension=path.extname(requested),base=requested.slice(0,-extension.length);let target=requested,index=1;while(true){try{await fs.access(target);target=`${base} (${index++})${extension}`;}catch{break;}}await fs.writeFile(target,Buffer.from(data));return describeImage(target);});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 640,
    show: false,
    backgroundColor: '#ffffff',
    title: '灵感白板',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged
    }
  });

  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) event.preventDefault();
  });
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
