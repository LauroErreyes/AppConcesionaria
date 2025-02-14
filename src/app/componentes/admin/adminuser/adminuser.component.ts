import { Component } from '@angular/core';
import { usuario } from '../../../entidades/usuario';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../servicios/user/user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adminuser',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adminuser.component.html',
  styleUrl: './adminuser.component.css'
})
export class AdminuserComponent {
  users: usuario[] = [];
  selectedUser: usuario | null = null;
  showModal = false;
  userForm: FormGroup;
  loading = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      foto: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      if (this.selectedUser) {
        this.userService.updateUser(this.selectedUser._id!, this.userForm.value).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire({
              title: 'Éxito',
              text: 'La operación se realizó correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.closeModal();
          },
          error: (error) => console.error('Error updating user:', error)
        });
      } else {
        this.userService.createUser(this.userForm.value).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire({
              title: 'Éxito',
              text: 'La operación se realizó correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.closeModal();
          },
          error: (error) => console.error('Error creating user:', error)
        });
      }
    }
  }

  openModal(user?: usuario): void {
    this.selectedUser = user || null;
    if (user) {
      this.userForm.patchValue(user);
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.reset();
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
    this.userForm.reset();
  }

  deleteUser(id: string): void {
    
    Swal.fire({
          title: '¿Deseas Eliminar el Usuario?',
           showCancelButton: true,
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.userService.deleteUser(id).subscribe({
              next: () => this.loadUsers(),
              error: (error) => console.error('Error deleting user:', error)
            });
            Swal.fire({
              title: 'Éxito',
              text: 'La operación se realizó correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          } 
        });
  }
}
