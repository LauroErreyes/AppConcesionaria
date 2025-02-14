// cart.model.ts

export interface CartItem {
    accessory: string;  // ID del accesorio
    name_acc:string;
    quantity: number;
    unit_price: number;
    image: string;
    total: number;      // total = quantity * unit_price
  }
  
  export interface cart {
    _id?: string;       // Opcional, se asigna en la base de datos
    user: string;       // ID del usuario
    items: CartItem[];
    total: number;      // Suma de los totales de cada item
  }
  