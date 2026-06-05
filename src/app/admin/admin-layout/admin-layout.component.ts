import { Component, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  //Signal para controlar la visibilidad del menú lateral en móviles
  showMobileMenu = signal(false);

  constructor() {
    //Suscripción a eventos de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showMobileMenu.set(false);
    });
  }

  toggleMenu() {
    this.showMobileMenu.update(v => !v);
  }

  closeMenu() {
    this.showMobileMenu.set(false);
  }
  //Finaliza la sesión
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
