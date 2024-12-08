import { Injectable, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from '../interfaces/user';
import { ElectronService } from '../core/services/electron/electron.service';
import { NewsService } from './news.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  user: User | null = null;
  private loginUrl = 'https://sanger.dia.fi.upm.es/pui-rest-news/login';

  private message: string | null = null;

  private httpOptions = {
    headers: new HttpHeaders()
      .set('Content-Type', 'x-www-form-urlencoded')
  };

  constructor(private http: HttpClient, private electronService: ElectronService, private newsSrv : NewsService) {}

  async initializeLogin(): Promise<[string, string]> {
    try {
      // Get tokens from Electron store
      const userToken = await this.electronService.getValue('userNameToken');
      const pwdToken = await this.electronService.getValue('userPwdToken');

      // Check if both tokens are present
      if (userToken?.data && pwdToken?.data) {
        const userName = userToken.data;
        const password = pwdToken.data;
        
        // Optionally, you can validate the tokens or check expiration here
        console.log('Tokens found, logging in user...');
        return [userName, password];
      }

      console.log('No token found, prompting user to log in...');
      return ['', '']; // No tokens found, user needs to log in
    } catch (error) {
      console.error('Error during token initialization', error);
      return  ['', '']; // Return false in case of any error
    }
  }

  isLogged() {
    return this.user != null;
  }

  login(name: string, pwd: string): Observable<User> {
    const usereq = new HttpParams()
      .set('username', name)
      .set('passwd', pwd);

    return this.http.post<User>(this.loginUrl, usereq).pipe(
      tap(user => {
        this.user = user;
        this.newsSrv.setUserApiKey(user.apikey);
        this.electronService.storeValue("userNameToken", user.username);
        this.electronService.storeValue("userPwdToken", pwd);
      })
    );
  }

  getUser() {
    return this.user;
  }

  logout() {
    this.user = null;
    this.electronService.removeValue("userNameToken");
    this.electronService.removeValue("userPwdToken");
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.user = null;
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
