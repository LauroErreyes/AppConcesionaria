import { Routes } from '@angular/router';
import { AdminaccComponent } from './componentes/admin/adminacc/adminacc.component';
import { AdmincarroComponent } from './componentes/admin/admincarro/admincarro.component';
import { AdminsaleComponent } from './componentes/admin/adminsale/adminsale.component';
import { AdminsaleaccComponent } from './componentes/admin/adminsaleacc/adminsaleacc.component';
import { AdminuserComponent } from './componentes/admin/adminuser/adminuser.component';
import { adminHomeComponent } from './componentes/admin/home/home.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { ColeccionComponent } from './componentes/coleccion/coleccion.component';
import { ContactoComponent } from './componentes/contacto/contacto.component';
import { CotizarComponent } from './componentes/cotizar/cotizar.component';
import { DetalleAccComponent } from './componentes/detalle-acc/detalle-acc.component';
import { DetallesComponent } from './componentes/detalles/detalles.component';
import { HomeComponent } from './componentes/home/home.component';
import { LoginComponent } from './componentes/login/login.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { RegisterComponent } from './componentes/register/register.component';
import { ShopComponent } from './componentes/shop/shop.component';
import { VerificacionComponent } from './componentes/verificacion/verificacion.component';
import { AuthGuard } from './servicios/guards/auth.guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'coleccion', component: ColeccionComponent },
  { path: 'detalles/:id', component: DetallesComponent },
  { path: 'contacto', component: ContactoComponent },
  {
    path: 'cotizar/:id',
    component: CotizarComponent,
    canActivate: [AuthGuard],
  },
  { path: 'shop', component: ShopComponent },
  { path: 'detalle_acc/:id', component: DetalleAccComponent },
  { path: 'cart/:id', component: CarritoComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'admin/car', component: AdmincarroComponent },
  { path: 'admin/user', component: AdminuserComponent },
  { path: 'admin/home', component: adminHomeComponent },
  { path: 'admin/accessories', component: AdminaccComponent },
  { path: 'admin/car-sales', component: AdminsaleComponent },
  { path: 'admin/acc-sales', component: AdminsaleaccComponent },
  { path: 'verificacion', component: VerificacionComponent },
  { path: '**', redirectTo: '/home' },
];
