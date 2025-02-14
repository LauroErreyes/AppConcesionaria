import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Accessory } from '../../entidades/accesorios';

@Injectable({
  providedIn: 'root'
})
export class AccesoriosService {
  private url = 'appluxemotors-production.up.railway.app';
  //private url = 'localhost:3000';
  private apiUrl = `https://${this.url}/accessories`;
  constructor(private http: HttpClient) { }

  // Obtener accesorios compatibles con un vehículo
  getAccessoriesByCar(carId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compatible/${carId}`);
  }

  getAccesories(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl);
  }

  getAccesoryById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}`);
  }
  createAccessory(accesssory: Accessory): Observable<any> {
    return this.http.post<Accessory>(`${this.apiUrl}`, accesssory).pipe(
      catchError(this.handleError)
    );
  }
  // Método para actualizar un accesorio
  updateAccessory(id: string, newStock: number): Observable<any> {
    // Se asume que el endpoint PUT /accessories/:id acepta un objeto con el nuevo stock, por ejemplo { stock: newStock }
    return this.http.put<any>(`${this.apiUrl}/${id}`, { stock: newStock }).pipe(
      catchError(this.handleError)
    );
  }
  // Actualizar un accesorio
  update(id: string, accessory: Accessory): Observable<Accessory> {
    return this.http.put<Accessory>(`${this.apiUrl}/${id}`, accessory);
  }
  // Eliminar un accesorio
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }



}
