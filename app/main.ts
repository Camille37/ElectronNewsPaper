import {app,
  screen,
  ipcMain,
  BrowserWindow,
  dialog,
  Notification,
  Menu,
  globalShortcut,
  MenuItem,
  nativeTheme,
  IpcMain,} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
const Store = require('electron-store');

const store = new Store();


let win: BrowserWindow | null = null;

const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

const os = require('os')

function createWindow(): BrowserWindow {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    show: false,
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,
    },
  });

  win.once('ready-to-show', () => {
    if(win){
      win.show(); 
    }
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
       // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

ipcMain.handle('export-article-json', (event, articleJson: string) => {
  try {
    // Parse the JSON to access the article title
    const article = JSON.parse(articleJson);
    let articleTitle = article.title;

    /* Clean the title to use it as a valid file name 
       replace invalid characters with '_'
    */
    articleTitle = articleTitle.replace(/[^a-zA-Z0-9-_]/g, '_'); 
    
    const exportPath = path.join(os.homedir(), 'Desktop', `${articleTitle}.json`);
    fs.writeFileSync(exportPath, articleJson, 'utf8');

    dialog.showMessageBox({
      type: 'info',
      title: 'Article Exported',
      message: 'Article exported to: ' + exportPath,
      buttons: ['OK'],
    });

    return { success: true, path: exportPath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});


ipcMain.handle('import-text', async (event) => {
	try {
		// Show the file dialog to choose a .txt file
		const result = await dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [{ name: 'Text Files', extensions: ['txt'] }],
		})

		// Check if the user selected a file
		if (result.canceled || result.filePaths.length === 0) {
			return { success: false, error: 'No file selected' }
		}

		const filePath = result.filePaths[0]

		// Read the file content as text
		const fileContent = fs.readFileSync(filePath, 'utf8')

		// Return the file content
		return { success: true, content: fileContent }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
})


ipcMain.handle('show-notification', (event, body: any) => {
	const notification = new Notification({
		title: body.title || 'Title missing',
		body: body.message || 'Body missing',
		silent: true,
	})
	notification.on('click', () => {
		event.sender.send('notification-clicked')
	})
	console.log(notification)
	notification.show()
})

ipcMain.handle('store-value', (event, key: string, value: string) => {
  store.delete(key);
  store.set(key, value);
  console.log(`Stored ${key} ${store.get(key)}`);
  return null;
});

ipcMain.handle('get-value', (event, key: string) => {

  const value = store.get(key);
  console.log(`Retrieved ${key}: ${value}`);
  return { path: key, data: value };
});