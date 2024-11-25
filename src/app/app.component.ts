import { Component } from '@angular/core';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NewsPaper';
  loginSrv : LoginService;

  constructor(loginSrv : LoginService){
    this.loginSrv = loginSrv;
  }
}
