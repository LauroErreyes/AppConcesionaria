import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Sale_acc } from '../../entidades/saleacc';
import { AuthService } from '../auth.service';
import { usuario } from '../../entidades/usuario';

@Injectable({
    providedIn: 'root'
})
export class SaleaccService {
    private url = 'appluxemotors-production.up.railway.app';
    //private url = 'localhost:3000';
    private apiUrl = `https://${this.url}/sale-accesories`;
    //private urlEmail = 'localhost:3100';
    private urlEmail = 'apicorreos-production.up.railway.app';
    private emailApiUrl = `https://${this.urlEmail}/enviar-correo`; // subir luego a host
    constructor(private http: HttpClient, private user: AuthService) { }

    // Método para crear una nueva venta
    createSale(sale: Sale_acc): Observable<Sale_acc> {
        return this.http.post<Sale_acc>(this.apiUrl, sale).pipe(
            catchError(this.handleError)
        );
    }

    // Obtener todas las ventas
    getAllSales(): Observable<Sale_acc[]> {
        return this.http.get<Sale_acc[]>(this.apiUrl);
    }

    // Obtener ventas de un usuario en particular
    getSalesByUser(userId: string): Observable<Sale_acc[]> {
        return this.http.get<Sale_acc[]>(`${this.apiUrl}/user/${userId}`);
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
    // Método para generar el HTML de la factura a partir de newSale
    /*generateInvoiceHTML(newSale: Sale_acc): string {
      // Convertir la fecha de la venta a un formato legible (por ejemplo, dd/mm/yyyy)
      const invoiceDate = new Date(newSale.orderDate);
      const formattedDate = invoiceDate.toLocaleDateString('es-ES');
      // Usamos la fecha en milisegundos para generar un número de factura único
      const invoiceNumber = 'FAC-' + invoiceDate.getTime();
  
      // Generar las filas de la tabla a partir de los items de la venta
      const itemsHTML = newSale.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$ ${item.unit_price.toFixed(2)}</td>
        <td>$ ${item.total_item.toFixed(2)}</td>
      </tr>
    `).join('');
  
      // Armar el HTML de la factura utilizando el ejemplo proporcionado y completándolo con los datos de newSale
      const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura</title>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            .factura {
                max-width: 800px;
                margin: auto;
                padding: 20px;
                border: 1px solid #000;
            }
            .factura-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .factura-header h2 {
                margin: 0;
            }
            .factura-header .factura-titulo {
                color: lightgray;
                font-size: 24px;
                font-weight: bold;
            }
            .factura-datos {
                margin-top: 20px;
            }
            .factura-tabla {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .factura-tabla th, .factura-tabla td {
                border: 1px solid #000;
                padding: 10px;
                text-align: left;
            }
            .factura-total {
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="factura">
            <div class="factura-header">
                <div>
                    <h2>Nombre de su compañía</h2>
                    <p><i>Lema de su compañía</i></p>
                    <p>Dirección<br>Ciudad, Código postal<br>Teléfono (503) 555-0190 Fax (503) 555-0191</p>
                </div>
                <div class="factura-titulo">FACTURA</div>
            </div>
  
            <div class="factura-datos">
                <p><strong>FECHA:</strong> ${formattedDate}</p>
                <p><strong>FACTURA:</strong> ${invoiceNumber}</p>
                <p><strong>POR:</strong> Compra de accesorios</p>
                <p><strong>FACTURAR A:</strong></p>
                <p>${newSale.user}</p>
            </div>
  
            <table class="factura-tabla">
                <thead>
                    <tr>
                        <th>DESCRIPCIÓN</th>
                        <th>CANTIDAD</th>
                        <th>TASA</th>
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
  
            <div class="factura-total">
                <p><strong>SUBTOTAL:</strong> $ ${newSale.totalAccesorios.toFixed(2)}</p>
                <p><strong>TIPO IMPOSITIVO:</strong> 0%</p>
                <p><strong>IMPUESTO SOBRE VENTAS:</strong> $ 0.00</p>
                <p><strong>OTROS:</strong> $ 0.00</p>
                <p><strong>TOTAL:</strong> $ ${newSale.totalAccesorios.toFixed(2)}</p>
            </div>
  
            <p>Extienda todos los cheques pagaderos a <strong>Nombre de su compañía</strong></p>
            <p>Total a pagar en 15 días. Las cantidades vencidas tendrán un cargo de servicio de un 1% por mes.</p>
        </div>
    </body>
    </html>
    `;
  
      return invoiceHTML;
    }*/
    generateInvoiceHTML(newSale: Sale_acc, persona: usuario | null): string {
        // Format the date
        const invoiceDate = new Date(newSale.orderDate);
        const formattedDate = invoiceDate.toLocaleDateString('es-ES');
        const invoiceNumber = 'FAC-' + invoiceDate.getTime();

        // Generate table rows for items
        const itemsHTML = newSale.items.map(item => `
          <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>$ ${item.unit_price.toFixed(2)}</td>
              <td>$ ${item.total_item.toFixed(2)}</td>
          </tr>
      `).join('');

        return `<!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <style>
          body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 20px auto;
              padding: 20px;
          }
          .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
          }
          .company-info {
              flex: 1;
          }
          .invoice-title {
              flex: 1;
              text-align: right;
              color: #a0a0a0;
              font-size: 2em;
          }
          .invoice-details {
              text-align: right;
              margin-bottom: 20px;
          }
          .billing-info {
              margin-bottom: 30px;
          }
          table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
          }
          th {
              background-color: #f0f0f0;
              padding: 10px;
              text-align: left;
          }
          td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
          }
          .totals {
              width: 300px;
              margin-left: auto;
          }
          .totals td {
              text-align: right;
          }
          .footer {
              margin-top: 30px;
              font-size: 0.9em;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <div class="company-info">
              <h2>Luxe Motors</h2>
              <p><em>Innovación y Elegancia en Movimiento</em></p>
              <p>Dirección</p>
              <p>Machala, 09090</p>
              <p>Teléfono +(593) 456-7890</p>
          </div>
          <div class="invoice-title">
              FACTURA
          </div>
      </div>
  
      <div class="invoice-details">
          <p>FECHA: ${formattedDate}</p>
          <p>FACTURA: ${invoiceNumber}</p>
      </div>
  
      <div class="billing-info">
          <h3>FACTURAR A:</h3>
          <p>Nombres: ${persona?.first_name} ${persona?.last_name}</p>
          <p>Correo: ${persona?.email}</p>
          <p>Telefono: ${persona?.phone}</p>
          <p>Direccion: ${persona?.address}</p>
      </div>
  
      <div>
          <p>POR: Compra de accesorios</p>
      </div>
  
      <table>
          <thead>
              <tr>
                  <th>DESCRIPCIÓN</th>
                  <th>CANTIDAD</th>
                  <th>TASA</th>
                  <th>TOTAL</th>
              </tr>
          </thead>
          <tbody>
              ${itemsHTML}
          </tbody>
      </table>
  
      <div class="totals">
          <table>
              <tr>
                  <td>SUBTOTAL</td>
                  <td>$ ${newSale.totalAccesorios.toFixed(2)}</td>
              </tr>
              <tr>
                  <td>IVA</td>
                  <td>$ 0.00</td>
              </tr>
              <tr>
                  <td>OTROS</td>
                  <td>$ 0.00</td>
              </tr>
              <tr>
                  <td><strong>TOTAL</strong></td>
                  <td><strong>$ ${newSale.totalAccesorios.toFixed(2)}</strong></td>
              </tr>
          </table>
      </div>
  
      <div class="footer">
          <p>Extienda todos los cheques pagaderos a Nombre de su compañía</p>
          <p>Total a pagar en 15 días. Las cantidades vencidas tendrán un cargo de servicio de un 1% por mes.</p>
      </div>
  </body>
  </html>`;
    }
    enviarCorreoFactura(
        correo: string,
        mensaje: string
    ): Observable<any> {
        const emailData = {
            correo: correo,
            subject: 'Factura',
            mensaje: mensaje,
        };

        console.log('Enviando correo con estos datos:', emailData);

        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        return this.http.post(this.emailApiUrl, emailData, { headers });
    }

}
