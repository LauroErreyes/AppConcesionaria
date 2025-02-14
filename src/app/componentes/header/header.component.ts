import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isLoggedIn$!: boolean;
  isProfileMenuOpen = false;

  defaultImage =
    'https://www.shutterstock.com/image-vector/young-smiling-man-avatar-brown-600nw-2261401207.jpg';

  constructor(private authService: AuthService, private router: Router) {}

  shouldShowAuthNav(): boolean {
    return this.authService.isAuthenticated();
  }

  shouldShowHeader(): boolean {
    const currentRoute = this.router.url;
    const routesToHide = [
      '/login',
      '/register',
      '/admin/home',
      '/admin/car',
      '/admin/accessories',
      '/admin/car-sales',
      '/admin/acc-sales',
      '/admin/user',
      '/verificacion',
    ];
    return !routesToHide.includes(currentRoute);
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => (this.isLoggedIn$ = isLoggedIn)
    );
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    this.isProfileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  isAdmin(): boolean {
    return this.getUserName().role === 'administrador' ? true : false;
  }

  getUserName(): any | null {
    //console.log(this.authService.getUserInfo());
    return this.authService.getUserInfo();
  }
}
