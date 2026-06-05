import { Component, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

// Layout principal del módulo worker
// Gestiona el drawer mobile, navegación lateral y comunicación entre componentes
@Component({
  selector: 'app-worker-layout',
  standalone: false,
  templateUrl: './worker-layout.component.html',
  styleUrls: ['./worker-layout.component.scss']
})
export class WorkerLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Controla si el drawer está abierto en mobile
  showMobileMenu = signal(false);

  // Cierra el drawer automáticamente cuando el usuario navega
  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showMobileMenu.set(false);
    });
  }

  // Alterna el estado del drawer (abierto/cerrado)
  toggleMenu() {
    this.showMobileMenu.update(v => !v);
  }

  // Cierra el drawer
  closeMenu() {
    this.showMobileMenu.set(false);
  }

  // Cierra sesión y redirige al login
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
