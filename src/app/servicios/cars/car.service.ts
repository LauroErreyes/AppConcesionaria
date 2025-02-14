import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Car } from '../../entidades/car';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private url = 'appluxemotors-production.up.railway.app'; //puerto 8080
  //private url = 'localhost:3000';
  private urlModel = 'appmodelos3d-production.up.railway.app';
  //private urlModel = 'localhost:3200';
  private apiUrl = `https://${this.url}/cars`;

  constructor(private http: HttpClient) {}

  // Método para obtener todos los vehículos
  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.apiUrl).pipe(catchError(this.handleError));
  }
  getCarById(id: string): Observable<Car> {
    return this.http
      .get<Car>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getModel3dById(id: string): Observable<Blob> {
    console.log('carService id:', id);
    return this.http.get(`https://${this.urlModel}/modelo/${id}`, {
      responseType: 'blob',
    });
  }

  updateModelo3D(carId: string, modelo3D: File): Observable<any> {
    const formData = new FormData();
    formData.append('modelo', modelo3D); // Archivo del modelo

    return this.http.put(`https://${this.urlModel}//modelo/${carId}`, formData);
  }

  updateCarColorStock(
    carId: string,
    selectedColor: { name: string; image: string; stock: number },
    newStock: number,
    currentColors: any[]
  ): Observable<Car> {
    // Crear un nuevo arreglo de colores actualizando el stock del color seleccionado.
    const updatedColors = currentColors.map((color) => {
      if (color.name === selectedColor.name) {
        return { ...color, stock: newStock };
      }
      return color;
    });

    // Enviar el objeto de actualización, aquí solo actualizamos el arreglo "colors".
    return this.http
      .put<Car>(`${this.apiUrl}/${carId}`, { colors: updatedColors })
      .pipe(catchError(this.handleError));
  }

  // Manejo de errores
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
  create(car: Car): Observable<Car> {
    return this.http.post<Car>(this.apiUrl, car);
  }

  guardarCarroEnPostgres(carid: string, modelo3D: File): Observable<any> {
    const formData = new FormData();
    formData.append('id', carid); // Debe coincidir con lo que espera la API
    formData.append('modelo', modelo3D); // Debe coincidir con lo que espera la API

    return this.http.post(`https://${this.urlModel}/subir`, formData);
  }

  update(car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/${car._id}`, car);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteModelo3D(carId: string): Observable<any> {
    return this.http.delete(`https://${this.urlModel}/modelo/${carId}`);
  }
}
