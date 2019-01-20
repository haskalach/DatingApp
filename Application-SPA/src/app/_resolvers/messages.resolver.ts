import { Observable, of } from 'rxjs';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { UserService } from './../_services/user/user.service';
import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Message } from '../_models/message';

@Injectable()
export class MessagesResolver implements Resolve<Message[]> {
  pageNumber = 1;
  pageSize = 5;
  messageContainer = 'Unread';
  constructor(
    private userService: UserService,
    private router: Router,
    private alertify: AlertifyService
  ) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Message[]> {
    return this.userService
      .getMessages(this.pageNumber, this.pageSize, this.messageContainer)
      .pipe(
        catchError(error => {
          this.alertify.error('problems retreiving messages');
          this.router.navigate(['/home']);
          return of(null);
        })
      );
  }
}
