import { Component } from '@angular/core';
import { ElectronService } from '../../core/services';

import { Input } from '@angular/core';

@Component({
  selector: 'app-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrl: './filesystem.component.scss'
})
export class FilesystemComponent {
  @Input() article: any;
  textToExport: string = ''
	importedContent: any
	constructor(private electronService: ElectronService) {}

	exportArticleToJson(): void {
    if (!this.article) {
      console.error('Article is undefined');
      return;
    }
    console.log(this.article);
    const articleJson = JSON.stringify(this.article);
    this.electronService.exportArticleAsJson(articleJson);
    
}




	async importArticle() {
		this.importedContent = await this.electronService.importArticle()
	}

}
