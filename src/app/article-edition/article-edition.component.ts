/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Component, OnInit } from '@angular/core';
import { Category } from '../interfaces/category';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Article } from '../interfaces/article';
import { NewsService } from '../services/news.service';
import { LoginService } from '../services/login.service';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../core/services';
//import { User } from '../interfaces/user';

@Component({
  selector: 'app-article-edition',
  templateUrl: './article-edition.component.html',
  styleUrl: './article-edition.component.css'
})
export class ArticleEditionComponent implements OnInit{

  electSvr : ElectronService;

  article: Article = {} as Article;
  loginSrv: LoginService;
  newsSvr : NewsService;
  user_last_edit?: string = 'Unknown';
  showview : boolean = false;

  title: string = '';
  subtitle: string = '';
  category: string = '';
  abstract: string = '';
  body: string = '';

  imageError: string | null = null;
  isImageSaved: boolean = false;
  cardImageBase64: string | null = null;

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.newsSvr.getArticle(articleId).subscribe((data: Article) => {
        this.article = data;
      });
    }
  }

  listCategory: any = Object.values(Category).filter(
    (value): value is any => typeof value === 'string'
  );

  constructor(private router: Router, private route: ActivatedRoute, loginSrv : LoginService, newsSrv : NewsService, private electSrv : ElectronService) {
    this.article.update_date = new Date().toISOString();
    this.loginSrv = loginSrv;
    this.newsSvr = newsSrv;
    this.electSvr = electSrv;
    //this.isLogged = this.loginSrv.isLogged();
    //this.user = this.loginSrv.getUser() ?? {} as User;
  }

  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      // Size Filter Bytes
      const MAX_SIZE = 20971520;
      const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

      if (fileInput.target.files[0].size > MAX_SIZE) {
        this.imageError =
          'Maximum size allowed is ' + MAX_SIZE / 1000 + 'Mb';
        return false;
      }
      if (!_.includes(ALLOWED_TYPES, fileInput.target.files[0].type)) {
        fileInput.target.value = '';
        this.imageError = 'Only images are allowed ( JPG | PNG )';
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const imgBase64Path = e.target.result;
          this.cardImageBase64 = imgBase64Path;
          this.isImageSaved = true;

          this.article.image_data = fileInput.target.files[0].type;
          const head = (this.article.image_media_type ?? '').length + 13;
          this.article.image_data = e.target.result.substring(head, e.target.result.length);

        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
    return true;
  }

  save() {
    if (!this.article) {
      // Notify the user if there is no article to save
      this.electSvr.sendNotification({
        title: 'Error',
        message: 'No article found to save.',
      });
      return;
    }
  
    // Validate required fields
    const errors: { field: string; message: string }[] = [];
    
    if (!this.article.title?.trim()) {
      errors.push({ field: 'title', message: 'The title is required.' });
    }
    if (!this.article.subtitle?.trim()) {
      errors.push({ field: 'subtitle', message: 'The subtitle is required.' });
    }
    if (!this.article.abstract?.trim()) {
      errors.push({ field: 'abstract', message: 'The abstract is required.' });
    }
    if (!this.article.category?.trim()) {
      errors.push({ field: 'category', message: 'The category is required.' });
    }
  
    // Remove error highlighting from all fields
    const allFields = ['title', 'subtitle', 'abstract', 'category'];
    allFields.forEach((field) => {
      const element = document.getElementById(field);
      if (element) {
        element.classList.remove('error-highlight');
      }
    });
  
    // If there are validation errors, highlight fields and scroll to the first error
    if (errors.length > 0) {
      errors.forEach((error) => {
        const errorElement = document.getElementById(error.field);
        console.log(`Error on field: ${error.field}, Found element:`, errorElement);
        if (errorElement) {
          // Add red highlight to fields with errors
          errorElement.classList.add('error-highlight');
        }
      });
  
      const firstError = errors[0];
      const firstErrorElement = document.getElementById(firstError.field);
      if (firstErrorElement) {
        // Scroll smoothly to the first field with an error
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElement.focus(); // Focus on the field for the user's convenience
      }
  
      // Send notifications for each validation error
      errors.forEach((error) => {
        this.electSvr.sendNotification({
          title: 'Validation Error',
          message: error.message,
        });
      });
  
      return; // Stop execution if there are validation errors
    }
  
    // If all validations pass, save the article
    this.user_last_edit = this.loginSrv.getUser()?.username;
    this.article.user_last_edit = this.user_last_edit;
  
    // Call the service to update the article
    this.newsSvr.updateArticle(this.article).subscribe(() => {
      this.newsSvr.loadArticles(); // Reload the list of articles
      this.router.navigate(['/article-list']); // Redirect to the article list
    });
  
    // Notify the user that the article has been saved
    this.electSvr.sendNotification({
      title: `The article "${this.article.title}" has been saved`,
      message: 'You will be redirected to the main page.',
      callback: () => {
        console.log(`The article "${this.article.title}" has been saved.`);
      },
    });
  
    console.log('The user who edited the last time was: ' + this.article.user_last_edit);
  }
  
  
  

  back(){
    this.router.navigate(['/article-list']);
  }
}
