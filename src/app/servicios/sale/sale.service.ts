// src/servicios/sales/sale.service.ts

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Sale } from '../../entidades/sale';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private url = 'appluxemotors-production.up.railway.app';
  //private url = 'localhost:3000';
  private apiUrl = `https://${this.url}/sales`;
  private urlEmail = 'apicorreos-production.up.railway.app';
  private emailApiUrl = `https://${this.urlEmail}/enviar-correo`; // subir luego a host

  constructor(private http: HttpClient) { }

  // Método para crear una nueva venta
  createSale(sale: Sale): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, sale).pipe(
      catchError(this.handleError)
    );
  }

  // Método para obtener todas las ventas (si lo requieres)
  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Método para obtener una venta por su ID (opcional)
  getSaleById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo básico de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error del servidor: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }
  enviarCorreo(
    correo: string,
    subject: string,
    mensaje: string
  ): Observable<any> {
    const emailData = {
      correo: correo,
      subject: subject,
      mensaje: mensaje,
    };

    console.log('Enviando correo con estos datos:', emailData);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.emailApiUrl, emailData, { headers });
  }
}
