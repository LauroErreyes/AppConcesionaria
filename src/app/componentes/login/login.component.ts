import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };

  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response && response.access_token) {
          Swal.fire({
            title: 'Éxito',
            text: 'Inicio de Sesion Exitoso!',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            this.router.navigate(['/home']);
          });
        } else {
          this.errorMessage = 'Error en la respuesta del servidor';
        }
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
