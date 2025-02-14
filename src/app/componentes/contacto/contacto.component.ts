import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  contactForm: FormGroup;
  showNotification: boolean = false;
  isLoading = true;

  constructor(private fb: FormBuilder,private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      // Lógica para enviar el formulario (por ejemplo, llamar a un servicio)
      this.showNotification = true;

      // Ocultar notificación después de 3 segundos
      setTimeout(() => {
        this.showNotification = false;
        this.contactForm.reset();
      }, 3000);
    }
  }
}
