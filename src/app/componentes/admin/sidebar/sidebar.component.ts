import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../servicios/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isExpanded = false;
  menuItems = [
    { route: '/admin/home', icon: 'home', label: 'Dashboard', description: 'Panel Principal' },
    { route: '/admin/car', icon: 'car', label: 'Vehículos', description: 'Gestión de Vehículos' },
    { route: '/admin/accessories', icon: 'tools', label: 'Accesorios', description: 'Gestión de Accesorios' },
    { route: '/admin/car-sales', icon: 'shopping-cart', label: 'Ventas Carros', description: 'Registro de Ventas' },
    { route: '/admin/acc-sales', icon: 'tag', label: 'Ventas Accesorios', description: 'Ventas de Accesorios' },
    { route: '/admin/user', icon: 'users', label: 'Usuarios', description: 'Gestión de Usuarios' },
  ];

  constructor(private router: Router, private auth:AuthService) {}

  
  shouldShow(): boolean {
    const currentRoute = this.router.url;
    const routes = ['/admin/home','/admin/car','/admin/accessories','/admin/car-sales','/admin/acc-sales','/admin/user']
    return routes.includes(currentRoute);

  }
  toggleSidebar(expand: boolean) {
    this.isExpanded = expand;
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
