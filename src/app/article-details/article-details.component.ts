/* eslint-disable @typescript-eslint/no-floating-promises */
import { Component, OnInit } from '@angular/core';
//import { Category } from '../interfaces/category';
import { Router } from '@angular/router';
//import * as _ from 'lodash';
import { Article } from '../interfaces/article';
import { NewsService } from '../services/news.service';
import { LoginService } from '../services/login.service';
import { ActivatedRoute } from '@angular/router';
//import { User } from '../interfaces/user';

@Component({
  selector: 'app-article-details',
  templateUrl: './article-details.component.html',
  styleUrl: './article-details.component.css'
})
export class ArticleDetailsComponent implements OnInit{

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.newsSvr.getArticle(articleId).subscribe((data: Article) => {
        this.article = data;
      });
      //console.log('Article Details - Edited by:'+this.article.user_last_edit);
    }
  }

  loginSrv: LoginService;
  newsSvr : NewsService;

  constructor(private router: Router, private route: ActivatedRoute, private newsSrv: NewsService, loginSrv : LoginService) {
    if (!loginSrv.isLogged()){
      newsSrv.setAnonymousApiKey();
    }
    this.loginSrv = loginSrv;
    this.newsSvr = newsSrv;
  }

  article: Article = {} as Article;

  redirectEmailsList(): void {
    this.router.navigate(['/emailslist']);
  }

  back(){
    this.router.navigate(['/article-list']);
  }

}
