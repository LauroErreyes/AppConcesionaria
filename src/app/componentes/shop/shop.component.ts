import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Accessory } from '../../entidades/accesorios';
import { AccesoriosService } from '../../servicios/accesorios/accesorios.service';
import { response } from 'express';
import { cartService } from '../../servicios/cart/cart.service';
import { AuthService } from '../../servicios/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  accessories: Accessory[] = [];
  filteredAccessories: Accessory[] = [];

  // Filtros
  searchQuery = new FormControl('');
  minPrice = new FormControl(0);
  maxPrice = new FormControl(1000);

  constructor(
    private accesorios: AccesoriosService,
    private cartService: cartService,
    private user: AuthService
  ) {
    // Suscribirse a cambios en los filtros
    this.searchQuery.valueChanges.subscribe(() => this.applyFilters());
    this.minPrice.valueChanges.subscribe(() => this.applyFilters());
    this.maxPrice.valueChanges.subscribe(() => this.applyFilters());
  }

  ngOnInit(): void {
    this.loadAccesories();
  }
  isAuth(): boolean {
    return this.user.isAuthenticated();
  }
  loadAccesories(): void {
    this.accesorios.getAccesories().subscribe({
      next: (response) => {
        console.log(response);
        this.accessories = response;
        this.filteredAccessories = response;

        // Inicializar los precios min y max basados en los datos
        const prices = response.map(acc => acc.price);
        const minDataPrice = Math.min(...prices);
        const maxDataPrice = Math.max(...prices);
        this.minPrice.setValue(minDataPrice);
        this.maxPrice.setValue(maxDataPrice);
      }
    });
  }

  onPriceChange(min: number, max: number): void {
    this.minPrice.setValue(min);
    this.maxPrice.setValue(max);
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredAccessories = this.accessories.filter(accessory => {
      const matchesSearch = !this.searchQuery.value ||
        accessory.name.toLowerCase().includes(this.searchQuery.value.toLowerCase());

      const matchesPrice = accessory.price >= this.minPrice.value! &&
        accessory.price <= this.maxPrice.value!;

      return matchesSearch && matchesPrice;
    });
  }

  addToCart(accessory: Accessory) {
    console.log('Agregando al carrito:', accessory);

    const newCartItem = {
      user: this.user.getUserInfo().sub,
      accessory: accessory._id,
      name_acc: accessory.name,
      quantity: 1,
      unit_price: accessory.price,
      image: accessory.image[0] || '',
      total: accessory.price
    };
    console.log(newCartItem);
    this.cartService.addItem(newCartItem).subscribe({
      next: (cart) => {
        Swal.fire({
                    title: 'Éxito',
                    text: 'Accesorio agregado al carrito con exito!',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                  })
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'Error al agregar al carrito',
          icon: 'error',
        });
      }
    });
  }
}

