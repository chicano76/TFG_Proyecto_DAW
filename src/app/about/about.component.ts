import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  // Inyeccion del servicio Location para manejar la navegación
  private location = inject(Location);
  // Método para volver a la página anterior
  goBack() {
    console.log('Se hizo click en botón Volver');
    this.location.back();
    console.log('Redirección terminada');
  }
}
