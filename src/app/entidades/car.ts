export interface Color {
  name: string;
  image: string;
  stock: number;
}

export interface Car {
  _id: string;
  brand: string;
  car_model: string;
  year: number;
  type: string;
  price: number;
  colors: Color[];
  features: string[];
}