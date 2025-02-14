import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { usuario } from '../../entidades/usuario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  editMode = false;
  updatedUsuario: any = {};
  isEditModalOpen = false;
  defaultImage = 'https://www.shutterstock.com/image-vector/young-smiling-man-avatar-brown-600nw-2261401207.jpg';
  userFields: { key: string; value: any }[] = [];
  editableFields: { key: string; value: any }[] = [];
  usuario: usuario = {
    email: '',
    password: '',
    role: '',
    first_name: '',
    last_name: '',
    address: '',
    phone: '',
    foto: ''
  };

  constructor(private http: HttpClient, private router: Router,private authService: AuthService) { }

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    const email = this.authService.getUserInfo()?.email; // Obtén el email del usuario logueado
    if (email) {
      this.authService.getUserData(email).subscribe({
        next: (userInfo) => {
          this.usuario = userInfo;
          this.userFields = [
            { key: 'Nombre', value: userInfo.first_name },
            { key: 'Apellido', value: userInfo.last_name },
            { key: 'Correo', value: userInfo.email },
            { key: 'Teléfono', value: userInfo.phone },
            { key: 'Dirección', value: userInfo.address },
          ];
        },
        error: (err) => {
          console.error('Error al cargar los datos del usuario:', err);
          alert('Hubo un error al cargar los datos del usuario');
        },
      });
    } else {
      console.error('No se encontró el email del usuario en la sesión');
      alert('Error al obtener los datos del usuario');
    }
  }

  openEditModal(): void {
    if (this.usuario) {
      this.editableFields = [
        { key: 'Nombre', value: this.usuario.first_name },
        { key: 'Apellido', value: this.usuario.last_name },
        { key: 'Correo', value: this.usuario.email },
        { key: 'Teléfono', value: this.usuario.phone },
        { key: 'Dirección', value: this.usuario.address },
      ];
      this.isEditModalOpen = true;
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  updateUser(): void {
    if (this.usuario) {
      // Actualizar la información del usuario con los valores editados
      this.editableFields.forEach((field) => {
        (this.usuario as any)[field.key.toLowerCase()] = field.value;
      });
      this.cargarUsuario(); // Refrescar los datos en la vista
      this.closeEditModal();
    }
  }

  activarModoEdicion(): void {
    this.editMode = true;
    this.updatedUsuario = { ...this.usuario };
  }

  cancelarEdicion(): void {
    this.editMode = false;
  }

  guardarEdicion(): void {
    if (this.usuario) {
      const id = this.authService.getUserInfo()?.sub;
      this.authService.updateUsuario(id, this.usuario).subscribe({
        next: () => {
          alert('Perfil actualizado correctamente');
          this.isEditModalOpen = false;
          this.cargarUsuario();
        },
        error: (err) => {
          console.error('Error al actualizar el perfil', err);
          alert('Error al actualizar el perfil');
        }
      });
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('email');
    this.router.navigate(['/']);
  }
}
