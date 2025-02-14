import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './componentes/header/header.component'; 
import { FooterComponent } from './componentes/footer/footer.component';
import { AuthService } from './servicios/auth.service';
import { SidebarComponent } from './componentes/admin/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prueba_api';

  constructor() {}

  ngOnInit() {
   
  }

  
  
}
