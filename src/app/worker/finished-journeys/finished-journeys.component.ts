import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

// Componente que muestra el historial de jornadas finalizadas
@Component({
  selector: 'app-finished-journeys',
  standalone: false, 
  templateUrl: './finished-journeys.component.html',
  styleUrls: ['./finished-journeys.component.scss']
})
export class FinishedJourneysComponent implements OnInit {
  private api = inject(ApiService);
  private notification = inject(NotificationService);

  finishedJourneys: any[] = [];

  ngOnInit(): void {
    this.loadHistory();
  }

  // Carga el historial de jornadas finalizadas desde la API
  loadHistory(): void {
    this.api.getFinishedJourneys().subscribe({
      next: (res) => {
        this.finishedJourneys = res;
      },
      error: (err) => {
        this.notification.error('Error al cargar el historial de jornadas');
        console.error('Error en historial:', err);
      }
    });
  }
}