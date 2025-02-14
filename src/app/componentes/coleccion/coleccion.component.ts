import { Component } from '@angular/core';
import { CarService } from '../../servicios/cars/car.service';
import { Car } from '../../entidades/car';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-coleccion',
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coleccion.component.html',
  styleUrl: './coleccion.component.css'
})
export class ColeccionComponent {
  cars: any[] = [];
  filteredCars: any[] = [];
  currentImages: Map<string, { image: string, stock: number }> = new Map();
  errorMessage: string = '';
  defaultImage: string = 'assets/default-car.jpg';
  currentstock: number = 0;

  // Filtros
  searchQuery = new FormControl('');
  minPrice = new FormControl(0);
  maxPrice = new FormControl(100000);
  selectedBrands: string[] = [];
  selectedTypes: string[] = [];

  // Listas para los filtros
  brands: string[] = [];
  vehicleTypes: string[] = [];

  constructor(private carService: CarService,private router: Router) {
    // Suscribirse a cambios en los filtros
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
    this.searchQuery.valueChanges.subscribe(() => this.applyFilters());
    this.minPrice.valueChanges.subscribe(() => this.applyFilters());
    this.maxPrice.valueChanges.subscribe(() => this.applyFilters());
  }

  ngOnInit(): void {
    this.loadCars();
    
  }

  private loadCars(): void {
    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars = cars;
        this.filteredCars = cars;
        this.initializeFilters();
        // Inicializar los precios min y max basados en los datos
        const prices = cars.map(car => car.price);
        const minDataPrice = Math.min(...prices);
        const maxDataPrice = Math.max(...prices);
        this.minPrice.setValue(minDataPrice);
        this.maxPrice.setValue(maxDataPrice);
        
        this.cars.forEach(car => {
          const firstColorImage = car.colors && car.colors[0]?.image ? car.colors[0].image : this.defaultImage;
          this.currentImages.set(this.getCarKey(car), { image: firstColorImage, stock: car.colors?.[0]?.stock || 0 });
        });
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error al cargar los coches:', error);
      }
    });
  }

  private initializeFilters(): void {
    this.brands = [...new Set(this.cars.map(car => car.brand))];
    this.vehicleTypes = [...new Set(this.cars.map(car => car.type))];
  }

  toggleBrand(brand: string): void {
    const index = this.selectedBrands.indexOf(brand);
    if (index === -1) {
      this.selectedBrands.push(brand);
    } else {
      this.selectedBrands.splice(index, 1);
    }
    this.applyFilters();
  }

  toggleType(type: string): void {
    const index = this.selectedTypes.indexOf(type);
    if (index === -1) {
      this.selectedTypes.push(type);
    } else {
      this.selectedTypes.splice(index, 1);
    }
    this.applyFilters();
  }

  onPriceChange(min: number, max: number): void {
    this.minPrice.setValue(min);
    this.maxPrice.setValue(max);
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredCars = this.cars.filter(car => {
      const matchesSearch = !this.searchQuery.value || 
        car.car_model.toLowerCase().includes(this.searchQuery.value.toLowerCase());
      
      const matchesBrand = this.selectedBrands.length === 0 || 
        this.selectedBrands.includes(car.brand);
      
      const matchesType = this.selectedTypes.length === 0 || 
        this.selectedTypes.includes(car.type);
      
      const matchesPrice = car.price >= this.minPrice.value! && 
                          car.price <= this.maxPrice.value!;

      return matchesSearch && matchesBrand && matchesType && matchesPrice;
    });
  }

  // Resto de los métodos existentes...
  private getCarKey(car: any): string {
    return `${car.brand}-${car.car_model}-${car.year}`;
  }

  changeImage(car: any, color: { name: string, image?: string, stock: number }): void {
    if (color.image) {
      this.currentImages.set(this.getCarKey(car), { image: color.image, stock: color.stock });
    }
  }

  getCurrentStock(car: any): number {
    return this.currentImages.get(this.getCarKey(car))?.stock || 0;
  }

  getCarImage(car: any): string {
    return this.currentImages.get(this.getCarKey(car))?.image || this.defaultImage;
  }
  
  isCurrentImage(car: any, imageUrl: string): boolean {
    return this.currentImages.get(this.getCarKey(car))?.image === imageUrl;
  }
}