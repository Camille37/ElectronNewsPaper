import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';// Assume you have an AuthService that manages authentication
import { LoginService } from './services/login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private loginSrv: LoginService, private router: Router) {}

  canActivate(): boolean {
    if (this.loginSrv.isLogged()) {
      console.log('user is logged')
      return true; // User is logged in, allow access to the route
    } else {
      this.router.navigate(['/article-list']); // Redirect to login if not logged in
      console.log('user is not logged');
      return false; // Block access to the route
    }
  }
}

