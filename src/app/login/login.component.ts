/* eslint-disable @typescript-eslint/no-floating-promises */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { User } from '../interfaces/user';
import { NewsService } from '../services/news.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy, OnInit {

  isLogged : boolean ;
  isError: boolean = false;
  formUsername: string = '';
  formPassword: string = '';
  user: User;

  private loginSrv : LoginService;
  private newsSrv : NewsService;
  private subscription: Subscription = new Subscription();

  constructor(private router: Router, private route: ActivatedRoute, loginSrv : LoginService, newsSrv : NewsService){
    this.loginSrv = loginSrv;
    this.newsSrv = newsSrv;
    this.isLogged = this.loginSrv.isLogged();
    this.user = this.loginSrv.getUser() ?? {} as User;
  }

 async ngOnInit() {
    const userId : [string, string] = await this.loginSrv.initializeLogin();

    this.loginSrv.login(userId[0], userId[1]).subscribe({
      next: (user: User) => {
        this.isError = false; //delete the error message if it was displayed
        this.user = user;
        this.isLogged = this.loginSrv.isLogged();
      },
      })
  }

  @ViewChild('loginForm') loginForm: any;

  login(){
    this.subscription.add(
      this.loginSrv.login(this.formUsername, this.formPassword).subscribe({
        next: (user: User) => {
          console.log('Successful login of '+user.username, user);
          this.isError = false; //delete the error message if it was displayed
          this.user = user;
          this.isLogged = this.loginSrv.isLogged();
          this.loginForm.reset();
        },
        error: (err) => {
          console.error('Login failed', err);
          this.isError = true;
        },
      })
    );
  }

  logout(){
    this.loginSrv.logout();
    this.newsSrv.setAnonymousApiKey();
    this.isLogged = this.loginSrv.isLogged();
    this.router.navigate(['/article-list']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
