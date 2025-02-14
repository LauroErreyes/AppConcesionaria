import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Car } from '../../../entidades/car';
import { CarService } from '../../../servicios/cars/car.service';

@Component({
  selector: 'app-admincarro',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admincarro.component.html',
  styleUrl: './admincarro.component.css',
})
export class AdmincarroComponent {
  cars: Car[] = [];
  searchTerm: string = '';
  showModal: boolean = false;

  // Objeto para crear/editar un vehículo
  selectedCar: any = {
    brand: '',
    car_model: '',
    year: new Date().getFullYear(),
    type: '',
    price: 0,
    colors: [],
    features: [],
  };

  modelo3D: File | null = null; // Variable para almacenar el archivo

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.modelo3D = file;
    }
  }

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.carService.getCars().subscribe({
      next: (data: Car[]) => (this.cars = data),
      error: (error) => console.error('Error al cargar vehículos:', error),
    });
  }

  filterCars(): Car[] {
    const term = this.searchTerm.toLowerCase();
    return this.cars.filter(
      (car) =>
        car.brand.toLowerCase().includes(term) ||
        car.car_model.toLowerCase().includes(term)
    );
  }

  openModal(car?: Car): void {
    if (car) {
      this.selectedCar = { ...car };
      // Si no existen colores, nos aseguramos de inicializar el array
      if (!this.selectedCar.colors) {
        this.selectedCar.colors = [];
      }
    } else {
      this.selectedCar = {
        brand: '',
        car_model: '',
        year: new Date().getFullYear(),
        type: '',
        price: 0,
        colors: [],
        features: [],
      };
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCar(): void {
    if (this.selectedCar._id) {
      // Actualizar vehículo en MongoDB
      this.carService.update(this.selectedCar).subscribe({
        next: () => {
          this.loadCars();

          // Verificar si ya existe un modelo 3D en PostgreSQL
          this.carService.getModel3dById(this.selectedCar._id).subscribe({
            next: (response) => {
              if (response.size === 0) {
                // Si no hay modelo, lo guardamos
                this.carService
                  .guardarCarroEnPostgres(this.selectedCar._id, this.modelo3D!)
                  .subscribe({});
              } else {
                // Ya existe, actualizar el modelo 3D
                this.carService
                  .updateModelo3D(this.selectedCar._id, this.modelo3D!)
                  .subscribe({});
              }
            },
            error: () => {
              // Si hay un error al obtener el modelo, asumimos que no existe y lo guardamos
              this.carService
                .guardarCarroEnPostgres(this.selectedCar._id, this.modelo3D!)
                .subscribe({});
            },
          });

          this.closeModal();
        },
        error: (error) => console.error('Error al actualizar vehículo:', error),
      });
    } else {
      // Crear vehículo en MongoDB y guardar el modelo 3D en PostgreSQL
      this.carService.create(this.selectedCar).subscribe({
        next: (response) => {
          this.loadCars();
          this.carService
            .guardarCarroEnPostgres(response._id, this.modelo3D!)
            .subscribe({});
          this.closeModal();
        },
        error: (error) => console.error('Error al crear vehículo:', error),
      });
    }
  }

  deleteCar(id: string): void {
    Swal.fire({
      title: '¿Deseas Eliminar el Vehiculo?',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.carService.remove(id).subscribe({
          next: () => {
            this.loadCars();
            this.carService.deleteModelo3D(id).subscribe({});
          },
          error: (error) => console.error('Error al eliminar vehículo:', error),
        });
        Swal.fire({
          title: 'Éxito',
          text: 'La operación se realizó correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      }
    });
  }

  // Función para agregar un nuevo objeto de Color vacío
  addColor(): void {
    this.selectedCar.colors.push({ name: '', image: '', stock: 0 });
  }

  // Función para remover un color dado su índice
  removeColor(index: number): void {
    this.selectedCar.colors.splice(index, 1);
  }

  // Para las características se mantiene el input donde se separan por comas
  updateFeatures(newValue: string): void {
    this.selectedCar.features = newValue
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f);
  }
}
