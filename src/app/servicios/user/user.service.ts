import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { usuario } from '../../entidades/usuario';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url = 'appluxemotors-production.up.railway.app';  //Hosting
  //private url = 'localhost:3000'; //local
  private apiUrl = `https://${this.url}/users`;

  constructor(private http: HttpClient, private auth:AuthService) {}

  getAllUsers(): Observable<usuario[]> {
    const headers = new HttpHeaders(
          this.auth.getToken() 
            ? { Authorization: `Bearer ${this.auth.getToken() }` }
            : {}
        );
    return this.http.get<usuario[]>(this.apiUrl,{headers});
  }

  getUserById(id: string): Observable<usuario> {
    const headers = new HttpHeaders(
      this.auth.getToken() 
        ? { Authorization: `Bearer ${this.auth.getToken() }` }
        : {}
    );
    return this.http.get<usuario>(`${this.apiUrl}/${id}`,{headers});
  }

  createUser(user: usuario): Observable<usuario> {
    return this.http.post<usuario>(this.apiUrl, user);
  }

  updateUser(id: string, user: usuario): Observable<usuario> {
     const headers = new HttpHeaders(
          this.auth.getToken() 
            ? { Authorization: `Bearer ${this.auth.getToken() }` }
            : {}
        );
    return this.http.put<usuario>(`${this.apiUrl}/${id}`, user, {headers});
  }

  deleteUser(id: string): Observable<void> {
     const headers = new HttpHeaders(
          this.auth.getToken() 
            ? { Authorization: `Bearer ${this.auth.getToken() }` }
            : {}
        );
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers});
  }
}
