import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  services: any[] = [];
  vehicles = [
    {
      name: 'Sedán Ejecutivo',
      description: 'Diseño minimalista y tecnología de punta',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      name: 'SUV de Lujo',
      description: 'Potencia y confort en perfecta armonía',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      name: 'Deportivo de Alto Rendimiento',
      description: 'Velocidad y elegancia sin compromiso',
      image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  ngOnInit() {
    this.services = [
      {
        name: 'Mantenimiento de Élite',
        description: 'Cuidado experto para su vehículo de lujo',
        icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-luxe-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>')
      },
      {
        name: 'Personalización de Vehículos',
        description: 'Haga de su automóvil una pieza única',
        icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-luxe-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>')
      },
      {
        name: 'Asistencia en Carretera VIP',
        description: 'Soporte premium donde y cuando lo necesite',
        icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-luxe-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>')
      }
    ];
  }

  heroOpacity = 1;

  constructor(private router: Router, private el: ElementRef,private sanitizer: DomSanitizer) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const heroSection = this.el.nativeElement.querySelector('.hero-section');
    const scrollPosition = window.pageYOffset;
    const heroHeight = heroSection.offsetHeight;

    // Calculate opacity based on scroll position
    this.heroOpacity = Math.max(0, 1 - (scrollPosition / (heroHeight / 2)));
  }

  navigateToCollection() {
    this.router.navigate(['/coleccion']);
  }
}
