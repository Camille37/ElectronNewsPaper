import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer!: typeof ipcRenderer;
  webFrame!: typeof webFrame;
  childProcess!: typeof childProcess;
  fs!: typeof fs;

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = (window as any).require('electron').ipcRenderer;
      this.webFrame = (window as any).require('electron').webFrame;

      this.fs = (window as any).require('fs');

      this.childProcess = (window as any).require('child_process');
      this.childProcess.exec('node -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout:\n${stdout}`);
      });

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

  sendNotification(body: { title: string; message: string; callback?: () => void }) {
		if (this.isElectron) {
			this.ipcRenderer.invoke('show-notification', {
				title: body.title,
				message: body.message,
				callbackEvent: 'notification-clicked-answer',
			})

			this.ipcRenderer.on('notification-clicked', () => {
				if (body.callback) {
					body.callback()
				}
			})
		} else {
			return Promise.reject('Not running in Electron environment')
		}
	}

	storeValue(key: string, value: string) {
		if (this.ipcRenderer) {
			this.ipcRenderer.invoke('store-value', key, value)
		} else {
			localStorage.setItem(key, value)
		}
		return null
	}

	async getValue(key: string): Promise<{ path: string; data: string }> {
		let value
		if (this.ipcRenderer) {
			value = await this.ipcRenderer?.invoke('get-value', key)
		} else {
			value = localStorage.getItem(key)
		}
		return value
	}

	removeValue(key: string): Promise<string> {
		const value = this.ipcRenderer.invoke('remove-value', key)
		return value
	}

	async getAllValues(): Promise<{ path: string; data: string }> {
		return await this.ipcRenderer?.invoke('get-all-values')
	}
	clearStore(): Promise<{ path: string; data: string }> {
		return this.ipcRenderer?.invoke('clear-all-values')
	}

	exportArticle(text: string) {
		this.ipcRenderer.invoke('export-text', text)
	}

	async importArticle(): Promise<string> {
		const result: string = await this.ipcRenderer.invoke('import-text')
		return result
	}

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
