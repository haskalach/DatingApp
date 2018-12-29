import { ApiCallService } from './api-call.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  repo = 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  constructor(private api: ApiCallService) {}

  login(model: any) {
    return this.api.Post(this.repo + 'login', model).pipe(
      map((response: any) => {
        const user = response;
        if (user) {
          localStorage.setItem('token', user.token);
          this.decodedToken = this.jwtHelper.decodeToken(user.token);
          console.log('token', this.decodedToken);
        }
      })
    );
  }

  resgiter(model: any) {
    return this.api.Post(this.repo + 'register', model);
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }
}
