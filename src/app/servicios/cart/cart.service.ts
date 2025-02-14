import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { cart } from '../../entidades/cart';

@Injectable({
  providedIn: 'root'
})
export class cartService {
  private url = 'appluxemotors-production.up.railway.app';
  //private url = 'localhost:3000';
  private apiUrl = `https://${this.url}/cart`;
  constructor(private http: HttpClient) { }

  /**
 * Agrega un ítem al carrito del usuario.
 * Si el carrito ya existe, el backend se encargará de agregar o actualizar el ítem.
 * 
 * @param cartItem Datos del ítem a agregar (incluye user, accessory, quantity, unit_price, image)
 * @returns Observable con el carrito actualizado
 */
  addItem(cartItem: any): Observable<cart> {
    return this.http.post<cart>(this.apiUrl, cartItem);
  }

  /**
   * Actualiza la cantidad de un ítem específico del carrito.
   * 
   * @param user ID del usuario
   * @param accessory ID del accesorio
   * @param quantity Nueva cantidad
   * @returns Observable con el carrito actualizado
   */
  updateItem(user: string, accessory: string, quantity: number): Observable<cart> {
    const url = `${this.apiUrl}/${user}/${accessory}`;
    // El endpoint espera en el body la nueva cantidad
    return this.http.patch<cart>(url, { quantity });
  }

  /**
   * Elimina un ítem específico del carrito del usuario.
   * 
   * @param user ID del usuario
   * @param accessory ID del accesorio a eliminar
   * @returns Observable con el carrito actualizado
   */
  removeItem(user: string, accessory: string): Observable<cart> {
    const url = `${this.apiUrl}/${user}/${accessory}`;
    return this.http.delete<cart>(url);
  }

  /**
   * Elimina todo el carrito del usuario.
   * Por ejemplo, al finalizar la compra.
   * 
   * @param user ID del usuario
   * @returns Observable con la respuesta del backend
   */
  removecart(user: string): Observable<any> {
    const url = `${this.apiUrl}/${user}`;
    return this.http.delete(url);
  }

  /**
   * (Opcional) Obtiene el carrito de un usuario.
   * 
   * @param user ID del usuario
   * @returns Observable con el carrito
   */
  getcart(user: string): Observable<cart> {
    const url = `${this.apiUrl}/${user}`;
    return this.http.get<cart>(url);
  }

  getAllCarts(): Observable<cart[]> {
    return this.http.get<cart[]>(this.apiUrl);
  }

  // Obtener carrito por ID de usuario
  getCartByUser(userId: string): Observable<cart> {
    return this.http.get<cart>(`${this.apiUrl}/${userId}`);
  }

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

}
