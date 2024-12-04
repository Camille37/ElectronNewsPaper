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
	ipcRenderer!: typeof ipcRenderer;  // ipcRenderer sera initialisé après la vérification de l'environnement
	webFrame!: typeof webFrame;
	childProcess!: typeof childProcess;
  
	constructor() {
	  if (this.isElectron) {
		this.initializeElectron();
	  }
	}
  
	private initializeElectron(): void {
	  // Assure-toi que tout est bien initialisé ici
	  this.ipcRenderer = (window as any).require('electron').ipcRenderer;
	  this.webFrame = (window as any).require('electron').webFrame;
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

	exportArticleAsJson(articleJson: string) {
		if (this.isElectron) {
			return this.ipcRenderer.invoke('export-article-json', articleJson)
		}
	  }

	async importArticle(): Promise<string> {
		const result: string = await this.ipcRenderer.invoke('import-text')
		return result
	}

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
