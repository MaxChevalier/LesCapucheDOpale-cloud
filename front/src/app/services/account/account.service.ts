import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly baseUrl = `/api/users`;

  constructor(private readonly http: HttpClient) {  }

  signUp(user: any) : Observable<any> {
    return this.http.post<any>(this.baseUrl, user);
  }

}