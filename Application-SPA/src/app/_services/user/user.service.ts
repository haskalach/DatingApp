import { Message } from './../../_models/message';
import { Observable } from 'rxjs';
import { ApiCallService } from './../api-call.service';
import { Injectable } from '@angular/core';
import { User } from 'src/app/_models/user';
import { PaginatedResult } from 'src/app/_models/pagination';
import { HttpParams, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  repo = 'users';
  photoRepo = 'photos';
  baseUrl = environment.apiUrl;
  constructor(private api: ApiCallService, private http: HttpClient) {}

  getUsers(
    page?,
    itemsPerPage?,
    userParams?,
    likesParams?
  ): Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<
      User[]
    >();
    let params = new HttpParams();

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }
    if (userParams != null) {
      // console.log({ userParams });
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }
    if (likesParams === 'Likers') {
      params = params.append('likers', 'true');
    }
    if (likesParams === 'Likees') {
      params = params.append('likees', 'true');
    }
    return this.http
      .get<User[]>(this.baseUrl + this.repo, { observe: 'response', params })
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') !== null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }
          return paginatedResult;
        })
      );
  }
  getUser(id: number): Observable<User> {
    return this.api.Get<User>(this.repo + '/' + id);
  }
  updateUser(user: User): Observable<User> {
    return this.api.Put<User>(this.repo, user);
  }
  setMainPhoto(id: number) {
    return this.api.Post(
      this.repo + '/' + this.photoRepo + '/' + id + '/setMain'
    );
  }
  deletePhoto(id: number) {
    return this.api.Delete(this.repo + '/' + this.photoRepo + '/' + id);
  }
  sendLike(recipientId: number) {
    return this.http.post(this.baseUrl + 'users/like/' + recipientId, {});
  }

  getMessages(page?, itemsPerPage?, messageContainer?) {
    const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<
      Message[]
    >();
    let params = new HttpParams();
    params = params.append('MessageContainer', messageContainer);
    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }
    return this.http
      .get<Message[]>(this.baseUrl + this.repo + '/messages', {
        observe: 'response',
        params
      })
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') !== null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }
          return paginatedResult;
        })
      );
  }
  getMessageThread(recipientId: number) {
    return this.api.http.get<Message[]>(
      this.baseUrl + this.repo + '/messages/thread/' + recipientId
    );
  }
  sendMessage(message: Message) {
    return this.http.post(this.baseUrl + this.repo + '/messages', message);
  }
  deleteMEssage(id: number) {
    return this.http.post(this.baseUrl + this.repo + '/messages/' + id, {});
  }
  markAsRead(id: number) {
    this.http.post(this.baseUrl + this.repo + '/messages/' + id + '/read', {}).subscribe();
  }
}
