/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Component } from '@angular/core';
import { Category } from '../interfaces/category';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Article } from '../interfaces/article';
import { NewsService } from '../services/news.service';
import { LoginService } from '../services/login.service';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../core/services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
//import { User } from '../interfaces/user';

@Component({
  selector: 'app-article-creation',
  templateUrl: './article-creation.component.html',
  styleUrl: './article-creation.component.scss'
})
export class ArticleCreationComponent {

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

  create(){
    if (this.article) {
      this.user_last_edit = this.loginSrv.getUser()?.username;
      this.newsSvr.createArticle(this.article).subscribe(() => {
        alert("The article has been created correctly")
        this.newsSvr.loadArticles();
        this.router.navigate(['/article-list']);
      });
      this.electSvr.sendNotification({
        title: `The article : ${this.article.title} has been created`,
        message:'',
        callback: () => {
          console.log(`The article "${this.article.title}" has been created.`);
        },
      });
      this.article.user_last_edit = this.user_last_edit;
      console.log('The user who created it was: '+this.article.user_last_edit);
      this.router.navigate(['/article-list']);
    }
  }

  back(){
    this.router.navigate(['/article-list']);
  }

}

