/* eslint-disable @typescript-eslint/no-floating-promises */
import { Component, OnInit } from '@angular/core';
//import { Category } from '../interfaces/category';
import { Router } from '@angular/router';
//import * as _ from 'lodash';
import { Article } from '../interfaces/article';
import { NewsService } from '../services/news.service';
import { LoginService } from '../services/login.service';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../core/services';
//import { User } from '../interfaces/user';

@Component({
  selector: 'app-article-details',
  templateUrl: './article-details.component.html',
  styleUrl: './article-details.component.css'
})
export class ArticleDetailsComponent implements OnInit{

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    const isLogged = this.route.snapshot.paramMap.get('isLogged');
    if (articleId) {
      this.newsSvr.getArticle(articleId).subscribe((data: Article) => {
        this.article = data;
      });
      //console.log('Article Details - Edited by:'+this.article.user_last_edit);
    }
    if(isLogged === 'true') {
      this.isLogged = true;
    }
  }

  loginSvr: LoginService;
  newsSvr : NewsService;
  electSvr: ElectronService;
  isLogged: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private newsSrv: NewsService, loginSrv : LoginService, private electSrv : ElectronService) {
    if (!loginSrv.isLogged()){
      newsSrv.setAnonymousApiKey();
    }
    this.loginSvr = loginSrv;
    this.newsSvr = newsSrv;
    this.electSvr = electSrv;
  }

  article: Article = {} as Article;

  redirectEmailsList(): void {
    this.router.navigate(['/emailslist']);
  }

  back(){
    this.router.navigate(['/article-list']);
  }

  delete(article : Article){
    const confirmed = window.confirm('Are you sure you want to delete '+ article.title +' ?');
    if (confirmed){
      this.newsSrv.deleteArticle(parseInt(article.id)).subscribe(
        (data: Article) => {
          const deletedArticle = data;
          console.log(deletedArticle);
        }
      );
      this.electSvr.sendNotification({
        title: `The article : ${article.title} has been deleted`,
        message:'The operation was successful.',
        callback: () => {
          console.log(`The article "${article.title}" has been deleted.`);
        },
      });
      this.newsSrv.loadArticles();
    }

  }

  exportArticleToJson(article: Article): void {
    if (!article) {
      console.error('Article is undefined');
      alert("There was an error to export the article")
      return;
    }
    // We change the format of article to JSON and use the electron Service
    const articleJson = JSON.stringify(article);
    this.electSrv.exportArticleAsJson(articleJson);
  }

}
