import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { cartService } from '../../servicios/cart/cart.service';
import { cart, CartItem } from '../../entidades/cart';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { catchError, finalize, of, throwError } from 'rxjs';
import { SaleaccService } from '../../servicios/saleacc/saleacc.service';
import { Sale_acc } from '../../entidades/saleacc';
import { response } from 'express';
import { usuario } from '../../entidades/usuario';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',

})
export class CarritoComponent {
  cartItems: cart = {
    user: '',
    items: [],
    total: 0
  };
  isLoading: boolean = true;
  error: string | null = null;
  isUpdating: boolean = false;
  userId: string = '';

  // Variables para el flujo de pago
  showPaymentForm: boolean = false;
  formaPago: string = 'tarjeta';
  tarjetaForm = {
    numero: '',
    nombre: '',
    expiracion: '',
    cvv: ''
  };
  confirmationModalVisible: boolean = false;
  loadingOverlayVisible: boolean = false;

  constructor(
    private cartService: cartService,
    private route: ActivatedRoute,
    private router: Router,
    private sale_acc: SaleaccService,
    private user:AuthService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
   }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      if (userId) {
        this.userId = userId;
        this.loadCartItems(userId);
      } else {
        this.error = 'No se encontró ID del usuario';
        this.isLoading = false;
      }
    });
  }

  loadCartItems(userId: string): void {
    this.isLoading = true;
    this.error = null;

    this.cartService.getCartByUser(userId).pipe(
      catchError(error => {
        console.error('Error loading cart:', error);
        this.error = 'Error al cargar el carrito';
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(response => {
      if (response) {
        this.cartItems = response;
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || this.isUpdating) return;

    this.isUpdating = true;
    this.cartService.updateItem(this.userId, item.accessory, newQuantity).pipe(
      catchError(error => {
        console.error('Error updating quantity:', error);
        this.error = 'Error al actualizar la cantidad';
        return of(null);
      }),
      finalize(() => this.isUpdating = false)
    ).subscribe(response => {
      if (response) {
        this.cartItems = response;
        this.error = null;
      }
    });
  }

  removeItem(item: CartItem): void {
    if (this.isUpdating) return;

    this.isUpdating = true;
    this.cartService.removeItem(this.userId, item.accessory).pipe(
      catchError(error => {
        console.error('Error removing item:', error);
        this.error = 'Error al eliminar el producto';
        return of(null);
      }),
      finalize(() => this.isUpdating = false)
    ).subscribe(response => {
      if (response) {
        this.cartItems = response;
        this.error = null;
      }
    });
  }

  clearCart(): void {
    if (this.isUpdating) return;

    this.isUpdating = true;
    this.cartService.removecart(this.userId).pipe(
      catchError(error => {
        console.error('Error clearing cart:', error);
        this.error = 'Error al vaciar el carrito';
        return of(null);
      }),
      finalize(() => this.isUpdating = false)
    ).subscribe(response => {
      if (response) {
        this.cartItems.items = [];
        this.cartItems.total = 0;
        this.error = null;
      }
    });
  }

  // Al hacer clic en "Finalizar Compra" se abre el modal de pago
  checkout(): void {
    if (this.cartItems.items.length === 0) {
      this.error = 'El carrito está vacío';
      return;
    }
    this.showPaymentForm = true;
  }

  // Cierra el modal de pago
  closePaymentModal(): void {
    this.showPaymentForm = false;
  }

  continueShopping(): void {
    this.router.navigate(['/shop']); // Ajusta la ruta según tu aplicación
  }

  getInputValue(event: Event): number {
    const inputElement = event.target as HTMLInputElement;
    return inputElement.value ? +inputElement.value : 1;
  }

  // Funciones para manejar la forma de pago
  toggleFormaPago(paymentMethod: string): void {
    this.formaPago = paymentMethod;
  }

  formatearNumeroTarjeta(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
    this.tarjetaForm.numero = formattedValue;
  }

  formatearExpiracion(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.tarjetaForm.expiracion = value;
  }

  formatearCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    this.tarjetaForm.cvv = value.substring(0, 3);
  }

  // Muestra el modal de confirmación
  mostrarConfirmacionVenta(): void {
    this.confirmationModalVisible = true;
  }

  onCancelarVenta(): void {
    this.confirmationModalVisible = false;
  }

  // Al confirmar la venta se crea la venta y se limpia el carrito
  onConfirmarVenta(): void {
    this.confirmationModalVisible = false;
    const newSale: Sale_acc = {
      user: this.cartItems.user,
      items: this.cartItems.items.map(item => ({
        accessory: item.accessory,
        name: item.name_acc,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_item: item.total
      })),
      totalAccesorios: this.cartItems.total,
      orderDate: new Date(),
      formaPago: this.formaPago,
      ...(this.formaPago === 'tarjeta'
        ? { datosTarjeta: { ...this.tarjetaForm } }
        : { datosEfectivo: { lugarPago: 'agencia' } })
    };

    this.loadingOverlayVisible = true;
    this.sale_acc.createSale(newSale).pipe(
      catchError(error => {
        console.error('Error creating sale:', error);
        this.error = 'Error al procesar la venta';
        return of(null);
      }),
      finalize(() => {
        this.loadingOverlayVisible = false;
      })
    ).subscribe(response => {
      if (response) {
        // Limpiar carrito y cerrar modal de pago
        this.cartItems.items = [];
        this.cartItems.total = 0;
        this.showPaymentForm = false;
        this.user.getUserById(newSale.user).subscribe({
          next: (response: usuario ) => {
            this.persona = response;
            console.log(this.persona);
            alert("Compra realizada exitosamente");  
            this.openInvoiceInNewWindow(newSale, this.persona);
                    }
        })
        
        // Opcional: redirigir a una página de confirmación
      }
    });
    this.borrarCarrito();

  }
  async borrarCarrito(){
    this.cartService.removecart(this.userId).pipe(
      catchError(error => {
        console.error('Error clearing cart:', error);
        this.error = 'Error al vaciar el carrito';
        return of(null);
      }),
      finalize(() => this.isUpdating = false)
    ).subscribe(response => {
      if (response) {
        this.cartItems.items = [];
        this.cartItems.total = 0;
        this.error = null;
      }
    });
  }
  persona: usuario | null = null;
  openInvoiceInNewWindow(newSale: Sale_acc, persona: usuario | null): void {
    if (!persona?.email) {
      console.error('No hay email disponible');
      alert('No se pudo enviar el correo: email no disponible');
      return;
    }
  
    const invoiceHTML = this.sale_acc.generateInvoiceHTML(newSale, persona);
    
    this.sale_acc.enviarCorreoFactura(persona.email, invoiceHTML)
      .pipe(
        catchError(error => {
          console.error('Error al enviar el correo:', error);
          alert('Error al enviar el correo electrónico');
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Correo enviado exitosamente:', response);
          alert('Factura enviada al correo exitosamente');
        },
        error: (error) => {
          console.error('Error en la suscripción:', error);
        }
      });
  }
}
