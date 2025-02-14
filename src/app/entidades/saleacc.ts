export interface SaleItem {
    accessory: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_item: number;
}

export interface Sale_acc {
    user: string;
    items: SaleItem[];
    totalAccesorios: number;
    orderDate: Date;
    formaPago: string;
    datosTarjeta?: {
        numero: string;
        nombre: string;
        expiracion: string;
        cvv: string;
    };
    datosEfectivo?: {
        lugarPago: 'agencia';
    };
}