import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from './../../../_services/alertify.service';
import { UserService } from './../../../_services/user/user.service';
import { Message } from 'src/app/_models/message';
import { Component, OnInit, Input } from '@angular/core';
import { tap } from 'rxjs/internal/operators/tap';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.scss']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};
  constructor(
    private userService: UserService,
    private alertifyService: AlertifyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const currentUserId = +this.authService.decodedToken.nameid;
    this.userService
      .getMessageThread(this.recipientId)
      .pipe(
        tap(messages => {
          messages.forEach(message => {
            if (
              message.isRead === false &&
              message.recipientId === currentUserId
            ) {
              this.userService.markAsRead(message.id);
            }
          });
          // for (let i = 0)
        })
      )
      .subscribe(
        next => {
          this.messages = next;
        },
        error => {
          this.alertifyService.error(error);
        }
      );
  }
  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    this.userService.sendMessage(this.newMessage).subscribe(
      (message: Message) => {
        this.messages.unshift(message);
        this.newMessage.content = '';
      },
      error => {
        this.alertifyService.error(error);
      }
    );
  }
}
