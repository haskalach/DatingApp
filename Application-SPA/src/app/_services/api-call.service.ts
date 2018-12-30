import { AuthService } from './auth.service';
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
// import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {
  httpHeader;
  httpHeaderFile;
  baseUrl = environment.apiUrl;
  // jwtHelper = new JwtHelperService();
  constructor(public http: HttpClient) {
    this.init();
  }

  init() {
    this.httpHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      // Authorization: 'Bearer ' + this.getToken()
    });
    this.httpHeaderFile = new HttpHeaders({
      // Authorization: 'Bearer ' + this.auth.getToken()
    });
    // console.log('ini', this.auth.getToken())
  }

  Get<T>(url: string) {
    return this.http.get<T>(this.baseUrl + url, {
      headers: this.httpHeader
    });
  }

  Post<T>(url: string, object?: T) {
    return this.http.post<T>(this.baseUrl + url, object, {
      headers: this.httpHeader
    });
  }

  Put<T>(url: string, object: T) {
    return this.http.put<T>(this.baseUrl + url, object, {
      headers: this.httpHeader
    });
  }

  Delete<T>(url: string, id?: number) {
    if (id) {
      return this.http.delete<T>(this.baseUrl + url + id, {
        headers: this.httpHeader
      });
    } else {
      return this.http.delete<T>(this.baseUrl + url, {
        headers: this.httpHeader
      });
    }
  }

  // when posting file
  PostFile<T>(url: string, object: T) {
    return this.http.post<T>(this.baseUrl + url, object, {
      headers: this.httpHeaderFile
    });
  }

  PutFile<T>(url: string, object: T) {
    return this.http.put<T>(this.baseUrl + url, object, {
      headers: this.httpHeaderFile
    });
  }
  // getToken() {
  //   const token = localStorage.getItem('token');
  //   if (!this.jwtHelper.isTokenExpired(token)) {
  //     return token;
  //   } else {
  //     localStorage.removeItem('token');
  //     return null;
  //   }
  // }
}
