import { Component, OnInit } from '@angular/core';
import { Category } from '../interfaces/category';
import { NewsService } from '../services/news.service';
import { LoginService } from '../services/login.service';
import { Article } from '../interfaces/article';
import { log } from 'console';
import { ElectronService } from '../core/services';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css'
})
export class ArticleListComponent implements OnInit{

  activeTab: Category = Category.All; // active tab by default;
  tabs : any = Object.values(Category); // list of tabs
  searchText: string = '';
  loginSrv: LoginService;

  newsSvr : NewsService;
  articleList : Article[] = [];
  electSvr : ElectronService;

  constructor(private newsSrv : NewsService, loginSrv : LoginService, private electSrv : ElectronService){
    if (!loginSrv.isLogged()){
      newsSrv.setAnonymousApiKey();
    }
    this.loginSrv = loginSrv;
    this.newsSvr = newsSrv;
    this.electSvr = electSrv;
  }

  ngOnInit() {
    this.getArticles();
  }
  
  setActiveTab(tab: Category) {
    this.activeTab = tab; // update the active onglet in the menu
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
      this.getArticles();
    }
   
  }

  getArticles(){
    this.newsSrv.getArticles().subscribe(
      (data: Article[]) => {
        this.articleList = data;
      },
      error => {
        console.error('Erreur lors de la récupération des articles:', error);
      }
    );
  }
  
}
