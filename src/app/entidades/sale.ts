// src/entidades/sale.ts

export interface Vehiculo {
    id: string;
    brand: string;
    modelo: string;
    precioBase: number;
    imagenSeleccionada: string;
  }
  
  export interface SelectedColor {
    name: string;
    image: string;
  }
  
  export interface Accessory {
    name: string;
    price: number;
  }
  
  export interface PaymentDetails {
    method: 'tarjeta' | 'efectivo';
    // Datos para pago con tarjeta:
    cardNumber?: string;
    cardHolder?: string;
    expiry?: string;
    // Para pago en efectivo, siempre se asume pago en agencia:
    isAgencyPayment?: boolean;
  }
  
  export interface FinancingDetails {
    cuotas: number;
    entradaPorcentaje: number;
    entradaMonto: number;
    cuotaMensual: number;
    seguroMensual: number;
    totalMensual: number;
  }
  
  export interface Sale {
    usuarioID: string;
    _id?: string; // Opcional, ya que se asigna al crear la venta
    vehiculo: Vehiculo;
    selectedColor: SelectedColor;
    accessories: Accessory[];
    totalAccesorios: number;
    paymentDetails: PaymentDetails;
    financingDetails?: FinancingDetails; // Solo para ventas financiadas
    totalContado?: number; // Solo para venta al contado
    status: string;
    date: Date;
  }
  