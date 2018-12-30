import { Observable } from 'rxjs';
import { ApiCallService } from './../api-call.service';
import { Injectable } from '@angular/core';
import { User } from 'src/app/_models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  repo = 'users/';
  constructor(private api: ApiCallService) {}

  getUsers(): Observable<User[]> {
    return this.api.Get<User[]>(this.repo);
  }
  getUser(id: number): Observable<User> {
    return this.api.Get<User>(this.repo + id);
  }
  updateUser(user: User): Observable<User> {
    return this.api.Put<User>(this.repo, user);
  }
}
