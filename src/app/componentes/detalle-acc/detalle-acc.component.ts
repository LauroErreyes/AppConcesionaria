import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Accessory } from '../../entidades/accesorios';
import { AccesoriosService } from '../../servicios/accesorios/accesorios.service';
import { cartService } from '../../servicios/cart/cart.service';
import { AuthService } from '../../servicios/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-acc',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './detalle-acc.component.html',
  styleUrl: './detalle-acc.component.css'
})
export class DetalleAccComponent implements OnInit {

  accessory: Accessory | null = null;
  isAuthenticated: boolean = false;
  selectedImage: string = '';
  triggerZoom: boolean = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private accesorio: AccesoriosService, 
    private cartService:cartService,
    private user:AuthService
  ) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnInit(): void {
    this.isAuthenticated = this.user.isAuthenticated();
    this.route.paramMap.subscribe(params => {
      const accId = params.get('id');
      if (accId) {
        this.loadCarDetails(accId);
      }
    });
  }


  loadCarDetails(id: string) {
    this.accesorio.getAccesoryById(id).subscribe({
      next: (response: Accessory) => {
        console.log(response);
        this.accessory = response;
        // Inicializa la imagen principal si existen imágenes
        if (this.accessory.image && this.accessory.image.length > 0) {
          this.selectedImage = this.accessory.image[0];
        }
      },
      error: (err) => {
        console.error('Error al cargar el accesorio:', err);
      }
    });
  }
  // Método para cambiar la imagen principal al hacer clic en una miniatura
  changeImage(img: string): void {
    this.selectedImage = img;
  }

  // Método para agregar el accesorio al carrito
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
        console.error('Error al agregar al carrito:', err);
      }
    });
  }
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
  scrollPosition: number = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
  }
}
