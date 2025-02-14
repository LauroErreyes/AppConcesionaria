import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { usuario } from '../entidades/usuario';

interface LoginResponse {
  access_token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'appluxemotors-production.up.railway.app';
  //private url = 'localhost:3000';
  private apiUrl = `https://${this.url}/auth/login`;
  private readonly TOKEN_KEY = 'access_token';
  //private emailApiUrl = 'http://localhost:3100/enviar-correo';
  private emailApiUrl = `https://apicorreos-production.up.railway.app/enviar-correo`;

  constructor(private http: HttpClient) { }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap((response) => {
        if (response && response.access_token) {
          localStorage.setItem(this.TOKEN_KEY, response.access_token);
        } else {
          throw new Error('Token no recibido del servidor');
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: usuario): Observable<any> {
    return this.http
      .post(`https://${this.url}/users`, userData)
      .pipe(catchError(this.handleError));
  }

  enviarCorreoVerificacion(
    correo: string,
    verificationUrl: string
  ): Observable<any> {
    const emailData = {
      correo: correo,
      subject: 'Verifica tu cuenta',
      mensaje: `<!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Verificación de Cuenta</title>
                  <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px;
                      border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); text-align: center; }
                    h2 { color: #333; }
                    p { color: #555; font-size: 16px; line-height: 1.6; }
                    .button { display: inline-block; background: #007bff; color: #ffffff; padding: 12px 20px;
                      text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
                    .button:hover { background: #0056b3; }
                    .footer { margin-top: 20px; font-size: 14px; color: #777; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h2>¡Bienvenido a Nuestra Plataforma!</h2>
                    <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu correo haciendo clic en el siguiente botón:</p>
                    <a href="${verificationUrl}" class="button">Verificar Cuenta</a>
                    <p>Si no solicitaste este registro, puedes ignorar este mensaje.</p>
                    <p class="footer">© 2025 Tu Empresa. Todos los derechos reservados.</p>
                  </div>
                </body>
                </html>`,
    };

    console.log('Enviando correo con estos datos:', emailData); // 👀 Verifica si Angular genera bien la solicitud

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.emailApiUrl, emailData, { headers });
  }

  getUserData(email: string): Observable<usuario> {
    // Crear headers usando HttpHeaders
    const headers = new HttpHeaders(
      this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}
    );

    return this.http
      .get<usuario>(
        `https://${this.url}/users/email/${email}`,
        { headers: headers } // Pasar headers correctamente estructurados
      )
      .pipe(
        tap((data) => {
          const userWithDefaults = {
            ...data,
          };
          return userWithDefaults;
        }),
        catchError((err) => {
          console.error('Error al cargar los datos del usuario:', err);
          return throwError(
            () => new Error('Error al cargar los datos del usuario')
          );
        })
      );
  }

  updateUsuario(id: string, updatedUsuario: usuario): Observable<any> {
    const headers = new HttpHeaders(
      this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}
    );

    const url = `https://${this.url}/users/${id}`;
    return this.http.put(url, updatedUsuario, { headers }).pipe(
      tap(() => {
        console.log('Perfil actualizado correctamente');
      }),
      catchError((error) => {
        console.error('Error al actualizar el perfil', error);
        return throwError(() => new Error('Error al actualizar el perfil'));
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error en la autenticación';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Credenciales incorrectas';
      } else if (error.status === 404) {
        errorMessage = 'Servicio no disponible';
      } else {
        errorMessage = `Error del servidor: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.clear();
    this.loggedInSubject.next(false);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  private loggedInSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem('username')
  );
  isLoggedIn$ = this.loggedInSubject.asObservable();

  user = {
    username: localStorage.getItem('username'),
    role: localStorage.getItem('userType'),
    image: localStorage.getItem('image'),
  };

  getUserInfo(): any {
    const token = this.getToken();
    if (token) {
      try {
        const decoded: usuario = jwtDecode(token);
        return decoded;
      } catch (error) {
        console.error('Error decoding token', error);
        return null;
      }
    }
    return null;
  }
  getUserById(id: string): Observable<usuario> {
    const headers = new HttpHeaders(
      this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}
    );
    const url = `https://${this.url}/users`;
    return this.http.get<usuario>(`${url}/${id}`, { headers });
  }
}
