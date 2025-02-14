import { Component } from '@angular/core';
import { Accessory } from '../../../entidades/accesorios';
import { AccesoriosService } from '../../../servicios/accesorios/accesorios.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adminacc',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './adminacc.component.html',
  styleUrl: './adminacc.component.css'
})
export class AdminaccComponent {
  accessories: Accessory[] = [];
  searchTerm: string = '';
  showModal: boolean = false;

  // Objeto para agregar o editar un accesorio
  selectedAccessory: any = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: []
  };

  // Variable para la URL de la imagen que se agregará
  selectedAccessoryImage: string = '';

  constructor(private accesoriosService: AccesoriosService) { }

  ngOnInit(): void {
    this.loadAccessories();
  }

  loadAccessories(): void {
    this.accesoriosService.getAccesories().subscribe((data: Accessory[]) => {
      this.accessories = data;
    });
  }

  filterAccessories(): Accessory[] {
    return this.accessories.filter(acc =>
      acc.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openModal(accessory?: Accessory): void {
    if (accessory) {
      this.selectedAccessory = { ...accessory };
    } else {
      this.selectedAccessory = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image: []
      };
    }
    this.selectedAccessoryImage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveAccessory(): void {
    if (this.selectedAccessory._id) {
      // Actualizar accesorio
      this.accesoriosService.update(this.selectedAccessory._id, this.selectedAccessory)
        .subscribe(updated => {
          this.loadAccessories();
          Swal.fire({
            title: 'Éxito',
            text: 'La operación se realizó correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.closeModal();
        });
    } else {
      this.accesoriosService.createAccessory(this.selectedAccessory).subscribe((response) => {
        this.loadAccessories();
        Swal.fire({
          title: 'Éxito',
          text: 'La operación se realizó correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
      })
      console.log('Crear accesorio:', this.selectedAccessory);
    }
  }

  deleteAccessory(id: string): void {
    if (confirm('¿Seguro que quieres eliminar este accesorio?')) {
      this.accesoriosService.delete(id).subscribe(() => {
        this.accessories = this.accessories.filter(acc => acc._id !== id);
        Swal.fire({
          title: 'Éxito',
          text: 'La operación se realizó correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      });
    }
  }

  addImage(): void {
    if (this.selectedAccessoryImage.trim() !== '') {
      this.selectedAccessory.image.push(this.selectedAccessoryImage.trim());
      this.selectedAccessoryImage = '';
    }
  }

  openEditModal(accessory: Accessory): void {
    this.openModal(accessory);
  }
}
