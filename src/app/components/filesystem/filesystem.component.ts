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

  imageerror: string = '';

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result;
        try {
          const data = JSON.parse(content);
          this.setArticleData(data);
        } catch (error) {
          this.imageerror = 'Erreur lors de la lecture du fichier JSON';
        }
      };
      reader.readAsText(file);
    } else {
      this.imageerror = 'Veuillez importer un fichier JSON valide';
    }
  }

  // Fonction pour affecter les données du JSON aux champs du formulaire
  setArticleData(data: any) {
    this.article.title = data.title;
    this.article.subtitle = data.subtitle;
    this.article.category = data.category;
    this.article.abstract = data.abstract;
    this.article.body = data.body;

    // Pour l'image, vous devrez probablement convertir les données de l'image en base64
    if (data.image_data) {
      this.article.thumbnail_image = 'data:image/png;base64,' + data.image_data;
    }
  }

}
