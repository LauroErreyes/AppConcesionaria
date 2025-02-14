import { Component } from '@angular/core';
import { Car } from '../../entidades/car';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CarService } from '../../servicios/cars/car.service';
import { Sale } from '../../entidades/sale';
import { SaleService } from '../../servicios/sale/sale.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccesoriosService } from '../../servicios/accesorios/accesorios.service';
import { AuthService } from '../../servicios/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-cotizar',
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizar.component.html',
  styleUrls: ['./cotizar.component.css']
})
export class CotizarComponent {
  car: Car | null = null;
  usuario: any;
  cuotas = [12, 24, 36, 48, 60, 72];
  porcentajes = [20, 30, 40, 50, 75];
  selectedCuota: number;
  selectedEntrada: number;
  customEntrada = 0;
  currentImage: string = '';
  errorMessage: string = '';
  metodoPago: 'financiado' | 'contado' = 'financiado';
  totalContado: number = 0;
  totalMensual = 0;
  cuotaMensual = 0;
  seguroMensual = 88.83;
  selectedAccessories: { _id: string, name: string; image: string; price: number, stock: number }[] = [];
  totalAccesorios = 0;

  formaPago: 'tarjeta' | 'efectivo' = 'tarjeta';
  tarjetaForm = {
    numero: '',
    nombre: '',
    expiracion: '',
    cvv: ''
  };

  confirmationModalVisible: boolean = false;
  loadingOverlayVisible: boolean = false;

  constructor(
    private carService: CarService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private saleService: SaleService,
    private accesoriosService: AccesoriosService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
    this.selectedCuota = this.cuotas[this.cuotas.length - 1];
    this.selectedEntrada = this.porcentajes[0];
  }

  toggleMetodoPago(metodo: 'financiado' | 'contado'): void {
    this.metodoPago = metodo;
    if (metodo === 'contado') {
      this.totalMensual = 0;
      this.cuotaMensual = 0;
      this.selectedCuota = this.cuotas[0];
      this.selectedEntrada = 0;
      this.customEntrada = 0;
    }
    this.calculateQuote();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const carId = params.get('id');
      if (carId) {
        this.loadCarDetails(carId);
      }
    });
  }

  private loadCarDetails(id: string): void {
    const storedData = localStorage.getItem('orderData');
    this.carService.getCarById(id).subscribe({
      next: (car) => {
        this.car = car;
        if (car.colors.length > 0) {
          const parsedData = JSON.parse(storedData!);
          this.currentImage = parsedData.selectedColor.image;
        }
        this.loadSelectedAccessories();
        this.calculateQuote();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar los detalles del vehículo';
      }
    });
  }

  loadSelectedAccessories() {
    const storedData = localStorage.getItem('orderData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      this.selectedAccessories = parsedData.accessories || [];
    }
    this.totalAccesorios = this.calculateTotalAccesorios();
  }

  selectCuota(cuota: number): void {
    this.selectedCuota = cuota;
    this.calculateQuote();
  }

  selectEntrada(entrada: number): void {
    this.selectedEntrada = entrada;
    this.customEntrada = Math.round((entrada / 100) * (this.car?.price || 0));
    this.calculateQuote();
  }

  onCustomEntradaChange(): void {
    this.selectedEntrada = 0;
    this.calculateQuote();
  }

  private calculateQuote(): void {
    if (this.metodoPago === 'contado') {
      this.totalContado = (this.car?.price || 0) + this.calculateTotalAccesorios();
    } else {
      const price = this.car?.price || 0;
      const entrada = this.customEntrada || (this.selectedEntrada / 100) * price;
      const remaining = (price - entrada) + this.calculateTotalAccesorios();
      this.cuotaMensual = remaining / this.selectedCuota;
      this.totalMensual = this.cuotaMensual + this.seguroMensual;
    }
  }

  private calculateTotalAccesorios(): number {
    return this.selectedAccessories.reduce((total, acc) => total + acc.price, 0);
  }

  getQuoteDetails(): string {
    if (this.metodoPago === 'contado') {
      const accesoriosTotal = this.calculateTotalAccesorios();
      const precioBase = this.car?.price || 0;
      return `Pago único de $${this.totalContado.toLocaleString()} (Vehículo: $${precioBase.toLocaleString()} + Accesorios: $${accesoriosTotal.toLocaleString()})`;
    }
    return `${this.selectedCuota} cuotas con ${this.selectedEntrada > 0 ?
      this.selectedEntrada + '% de entrada' :
      '$' + this.customEntrada.toLocaleString() + ' entrada'}`;
  }

  toggleFormaPago(forma: 'tarjeta' | 'efectivo'): void {
    this.formaPago = forma;
    this.resetFormularios();
  }

  resetFormularios(): void {
    this.tarjetaForm = {
      numero: '',
      nombre: '',
      expiracion: '',
      cvv: ''
    };
  }

  validarTarjeta(): boolean {
    const cardNumberRegex = /^\d{16}$/;
    const nombreValido = this.tarjetaForm.nombre.trim().length > 0;
    const expiracionRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3}$/;

    const numeroValido = cardNumberRegex.test(this.tarjetaForm.numero);
    const expiracionValida = expiracionRegex.test(this.tarjetaForm.expiracion);
    const cvvValido = cvvRegex.test(this.tarjetaForm.cvv);

    return numeroValido && nombreValido && expiracionValida && cvvValido;
  }

  formatearNumeroTarjeta(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 16) input = input.substr(0, 16);
    this.tarjetaForm.numero = input;
  }

  formatearExpiracion(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length >= 2) {
      input = input.substr(0, 2) + '/' + input.substr(2);
    }
    if (input.length > 5) input = input.substr(0, 5);
    this.tarjetaForm.expiracion = input;
  }

  formatearCVV(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 3) input = input.substr(0, 3);
    this.tarjetaForm.cvv = input;
  }

  registrarVenta(): void {
    if (!this.car) {
      alert('No hay información del vehículo.');
      return;
    }

    const storedData = localStorage.getItem('orderData');
    let selectedColor: any;
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData.selectedColor) {
        selectedColor = parsedData.selectedColor;
      }
    }

    const sale: Sale = {
      usuarioID: this.auth.getUserInfo().sub,
      vehiculo: {
        id: this.car._id,
        brand: this.car.brand,
        modelo: this.car.car_model,
        precioBase: this.car.price,
        imagenSeleccionada: this.currentImage
      },
      selectedColor,
      accessories: this.selectedAccessories.map(({ name, image, price }) => ({ name, image, price })),
      totalAccesorios: this.totalAccesorios,
      paymentDetails: this.formaPago === 'tarjeta'
        ? {
          method: 'tarjeta',
          cardNumber: this.tarjetaForm.numero,
          cardHolder: this.tarjetaForm.nombre,
          expiry: this.tarjetaForm.expiracion
        }
        : {
          method: 'efectivo',
          isAgencyPayment: true
        },
      status: 'pendiente',
      date: new Date()
    };

    if (this.metodoPago === 'financiado') {
      sale.financingDetails = {
        cuotas: this.selectedCuota,
        entradaPorcentaje: this.selectedEntrada,
        entradaMonto: this.customEntrada,
        cuotaMensual: this.cuotaMensual,
        seguroMensual: this.seguroMensual,
        totalMensual: this.totalMensual
      };
    } else {
      sale.totalContado = this.totalContado;
    }

    this.saleService.createSale(sale).subscribe({
      next: (res) => {
        console.log('Venta registrada con éxito', res);
        const storedData = localStorage.getItem('orderData');
        const parsedData = JSON.parse(storedData!);
        console.log(parsedData);
        console.log(this.car!);
        const newColorStock = parsedData.selectedColor.stock - 1;
        this.carService.updateCarColorStock(this.car?._id!, parsedData.selectedColor, newColorStock, this.car?.colors!).subscribe({
          next: (updatedCar) => {
            console.log('Stock del vehículo actualizado correctamente', updatedCar);
          },
          error: (err) => console.error('Error actualizando stock del vehículo', err)
        });

        this.selectedAccessories.forEach((accessory) => {
          const newAccessoryStock = accessory.stock - 1;
          this.accesoriosService.updateAccessory(accessory._id, newAccessoryStock).subscribe({
            next: (updatedAccessory) => console.log(`Stock actualizado para el accesorio ${accessory.name}`, updatedAccessory),
            error: (err) => console.error(`Error actualizando stock para el accesorio ${accessory.name}`, err)
          });
        });
        Swal.fire({
          title: 'Compra realizada!',
          text: '¿Desea ir a la colección o permanecer aquí?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Ir a colección',
          cancelButtonText: 'Permanecer aquí',
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirige a /coleccion
            this.clearForm();
            this.router.navigate(['/coleccion']);
          } else {
            // El usuario prefiere permanecer; aquí puedes ejecutar otra acción si es necesario
            console.log('El usuario decidió permanecer en la página.');
          }
        });
      },
      error: (err) => console.error('Error al registrar la venta', err)
    });
  }


  mostrarConfirmacionVenta(): void {
    this.confirmationModalVisible = true;
  }

  // Se invoca cuando el usuario confirma en el modal
  onConfirmarVenta(): void {
    this.confirmationModalVisible = false;  // Oculta el modal
    this.loadingOverlayVisible = true;        // Muestra el overlay de carga

    // Simula la carga durante 3 segundos
    setTimeout(() => {
      this.registrarVenta();                 // Ejecuta la venta
      this.loadingOverlayVisible = false;      // Oculta el overlay de carga
    }, 3000);
  }

  onCancelarVenta(): void {
    this.confirmationModalVisible = false;
  }

  clearForm(): void {
    // Reinicia el formulario de tarjeta (si corresponde)
    this.tarjetaForm = {
      numero: '',
      nombre: '',
      expiracion: '',
      cvv: ''
    };
    // Reinicia otros campos modificables
    this.customEntrada = 0;
    // (Opcional) Puedes reiniciar otros estados, como selección de cuotas, porcentajes, etc.
  }
}
