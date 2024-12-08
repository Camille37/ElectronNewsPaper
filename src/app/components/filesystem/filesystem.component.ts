/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Component } from '@angular/core';
import { ElectronService } from '../../core/services';

import { Input } from '@angular/core';

@Component({
  selector: 'app-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrl: './filesystem.component.css'
})
export class FilesystemComponent {
  /*
  The article edition page gives to the file system
  the article the user wants to import or export
  */
  @Input() article: any;

  // textToExport: string = ''
	importedContent: any
	constructor(private electronService: ElectronService) {}

	// exportArticleToJson(): void {
  //   if (!this.article) {
  //     console.error('Article is undefined');
  //     return;
  //   }
  //   // We change the format of article to JSON and use the electron Service
  //   const articleJson = JSON.stringify(this.article);
  //   this.electronService.exportArticleAsJson(articleJson);
  // }

  // Use to store the error for the import of the file
  importError: string = '';


  /*
    We use this function when the user wants to import
    a JSON file
  */

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileNameElement = document.getElementById('fileName') as HTMLElement;
      fileNameElement.innerText = file.name;
    }
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result;
        try {
          const data = JSON.parse(content);
          this.setArticleData(data);
        } catch (error) {
          this.importError = 'Error reading JSON file';
        }
      };
      reader.readAsText(file);
    } else {
      this.importError = 'Please upload a valid JSON file';
    }
  }

  // Function to assign JSON data to form fields
  setArticleData(data: any) {
    this.article.title = data.title;
    this.article.subtitle = data.subtitle;
    this.article.category = data.category;
    this.article.abstract = data.abstract;
    this.article.body = data.body;
    if (data.image_data) {
      this.article.thumbnail_image = 'data:image/png;base64,' + data.image_data;
    }
  }

}
