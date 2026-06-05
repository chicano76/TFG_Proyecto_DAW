import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componente standalone que muestra el logo de la aplicacion
// Se usa en el sidebar para la marca visual principal
@Component({
  selector: 'app-nav-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent {
  // Ruta del archivo logo (gif animado)
  readonly src = '/logo/logo_1.gif';
  // Texto alternativo para accesibilidad
  readonly alt = 'Logo TimeRoute';
}