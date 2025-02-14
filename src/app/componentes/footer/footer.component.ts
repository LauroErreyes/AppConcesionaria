import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  constructor(private router: Router) {}

  shouldShowFooter(): boolean {
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
}
