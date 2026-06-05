import { Component, EventEmitter, Input, Output } from '@angular/core';

type NavItem = {
  label: string;
  path: string;
};

@Component({
  selector: 'app-worker-side-nav',
  standalone: false,
  templateUrl: './worker-side-nav.component.html',
  styleUrls: ['./worker-side-nav.component.scss']
})
export class WorkerSideNavComponent {
  //Recibe del layout padre si el drawer está abierto en mobile
  // El layout cambia este valor cuando el usuario toca el botón de menú
  @Input() isMobileOpen = false;

  //Event que el layout padre escucha para cerrar el drawer
  // Se emite cuando se hace click en un enlace o en el overlay
  @Output() menuClosed = new EventEmitter<void>();

  //Event que el layout padre escucha para manejar logout
  // Se emite cuando se hace click en "Cerrar sesión"
  @Output() logoutClicked = new EventEmitter<void>();

  // Array READONLY de objetos con label y ruta Angular
  // Estas rutas están definidas en worker.module
  // El template itera sobre este array con *ngFor para crear los enlaces
  readonly navItems: NavItem[] = [
    { label: 'Mi Jornada', path: '/empleado/mi-jornada' },
    { label: 'Rutas Finalizadas', path: '/empleado/finalizadas' },
    { label: 'Mis Informes', path: '/empleado/mis-informes' }
  ];

  // Emite evento para que el layout cierre el drawer
  // Se llama cuando se hace click en overlay, click en enlaces del menú, click en logo
  closeMenu() {
    this.menuClosed.emit();
  }

  // Emite evento para que el layout maneje logout
  // Se llama cuando se hace click en botón "Cerrar sesión"
  logout() {
    this.logoutClicked.emit();
  }
}
