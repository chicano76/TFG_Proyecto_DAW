import { Component, OnInit, inject } from '@angular/core';
import { ReportApiService } from '../../services/report-api.service';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/interfaces';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  private reportApi = inject(ReportApiService);
  private notification = inject(NotificationService);

  workers: User[] = []; //lista trabajadores

  months = [ //meses
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];
  years = [2024, 2025, 2026]; //años disponibles

  //Estado de filtros seleccionados por el usuario
  filters = {
    user_id: '', 
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  };

  //Guarda los resultados del informe procesados
  reportData: any = null;
  loading = false;

  ngOnInit() {
    this.loadWorkers();
  }

  //Carga los trabajadores y selecciona el primero
  loadWorkers(): void {
    this.api.getWorkers().subscribe({
      next: (res) => {
        this.workers = res.filter(u => u.rol === 'trabajador');
        if (this.workers.length > 0) {
          this.filters.user_id = this.workers[0].id.toString();
        }
      },
      error: () => this.notification.error('Error al cargar la lista de trabajadores')
    });
  }

  //Calcula la fecha seleccionada y pide el informe a la API
  search(): void {
  if (!this.filters.user_id) {
    this.notification.error('Por favor, selecciona un trabajador');
    return;
  }

  this.reportData = null;
  this.loading = true;

  const y = this.filters.year;
  const m = this.filters.month;

  //Formateo de fecha
  const mesFormateado = m < 10 ? '0' + m : m;
  const fechaInicio = `${y}-${mesFormateado}-01`;

  //Calcula el primer día del mes siguiente
  let mesSiguiente = Number(m) + 1;
  let añoSiguiente = y;

  if (mesSiguiente > 12) {
    mesSiguiente = 1;
    añoSiguiente = y + 1;
  }

  const mSigFormateado = mesSiguiente < 10 ? '0' + mesSiguiente : mesSiguiente;
  const fechaFin = `${añoSiguiente}-${mSigFormateado}-01`;

  this.reportApi.getWorkReport(fechaInicio, fechaFin, Number(this.filters.user_id))
    .subscribe({
      next: (res) => {
        this.loading = false;

        if (!res || !res.days || res.days.length === 0) {
        this.reportData = { days: [], summary: {} }; 
      } else {
        this.reportData = res;
      }

      },
      error: (err: any) => {
        this.loading = false;
        this.reportData = { days: [], summary: {} };
        this.notification.error('No se encontraron datos para este periodo');
      }
    });
}
}