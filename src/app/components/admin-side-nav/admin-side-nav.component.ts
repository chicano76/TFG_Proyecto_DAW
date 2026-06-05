import { Component, EventEmitter, Input, Output } from '@angular/core';

type NavItem = {
  label: string;
  path: string;
};

@Component({
  selector: 'app-admin-side-nav',
  standalone: false,
  templateUrl: './admin-side-nav.component.html',
  styleUrls: ['./admin-side-nav.component.scss']
})
export class AdminSideNavComponent {
  @Input() isMobileOpen = false;
  @Output() menuClosed = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  readonly navItems: NavItem[] = [
    { label: 'Clientes', path: '/admin/clientes' },
    { label: 'Rutas', path: '/admin/rutas' },
    { label: 'Planificar', path: '/admin/jornadas' },
    { label: 'Jornadas', path: '/admin/jornadas-lista' },
    { label: 'Trabajadores', path: '/admin/trabajadores' },
    { label: 'Informes', path: '/admin/informes' }
  ];

  closeMenu() {
    this.menuClosed.emit();
  }

  logout() {
    this.logoutClicked.emit();
  }
}
