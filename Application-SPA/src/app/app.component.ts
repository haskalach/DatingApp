import { Component, OnInit } from '@angular/core';
import { AuthService } from './_services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // title = 'Application-SPA';
  jwtHelper = new JwtHelperService();
  constructor(private authservice: AuthService) {}
  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authservice.decodedToken = this.jwtHelper.decodeToken(token);
    }
  }
}