import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { usuario } from '../../entidades/usuario';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-register',
  standalone: true, // Define como componente independiente
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        address: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        foto: ['', Validators.required],
      },
      {
        validators: this.passwordsMatch,
      }
    );
  }
  private passwordsMatch(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;

      // Mapear datos al tipo `usuario`
      const newUser: usuario = {
        first_name: formValue.first_name,
        last_name: formValue.last_name,
        email: formValue.email,
        phone: formValue.phone || '',
        address: formValue.address,
        password: formValue.password,
        role: 'cliente', // Valor predeterminado para el rol,
        foto: formValue.foto,
      };
      console.log(newUser);
      this.authService.register(newUser).subscribe({
        next: (response) => {
          this.authService
            .enviarCorreoVerificacion(newUser.email, response.verificationUrl)
            .subscribe({
              next: () =>
                Swal.fire({
                  title: 'Registro Exitoso',
                  text: 'Se ha enviado un correo de verificación.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                }),
              error: (error) =>
                console.error('Error al enviar el correo:', error),
            });

          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error al registrar usuario';
        },
      });
    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }
  }
}
