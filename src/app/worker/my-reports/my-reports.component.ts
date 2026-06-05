import { Component, OnInit, inject } from '@angular/core';
import { ReportApiService } from '../../services/report-api.service'; 
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-my-reports',
  standalone: false,
  templateUrl: './my-reports.component.html',
  styleUrls: ['./my-reports.component.scss']
})
export class MyReportsComponent implements OnInit {
  private reportApi = inject(ReportApiService);  
  private notification = inject(NotificationService);

  loading = false; //indica si se está realizando una petición al servidor
  firstLoad = true;   //para saber si es la primera vez que se carga 
  reportData: any = null; //almacena los datos devueltos por la API

  //Filtros iniciales, fecha actual por defecto
  filters = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  };

  months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  years = [2024, 2025, 2026];

  ngOnInit(): void {
    this.search();
  }

  //Calcula el rango de fechas y llama al servicio de informes
  search(): void {
  this.loading = true;
  this.reportData = null;
  this.firstLoad = false;

  //obtiene valores de los filtros
  const y = this.filters.year; 
  const m = this.filters.month;

  //formatea la fecha de inicio
  const mesFormateado = m < 10 ? '0' + m : m;
  const fechaInicio = `${y}-${mesFormateado}-01`;

  //calcula la fecha de fin
  let mesSiguiente = m + 1;
  let añoSiguiente = y;

  if (mesSiguiente > 12) {
    mesSiguiente = 1;
    añoSiguiente = y + 1;
  }

  const mSigFormateado = mesSiguiente < 10 ? '0' + mesSiguiente : mesSiguiente;
  const fechaFin = `${añoSiguiente}-${mSigFormateado}-01`;

  //llama al servicio API
  this.reportApi.getMyWorkReport(fechaInicio, fechaFin).subscribe({
    next: (res: any) => {
      this.loading = false;
      const data =  res;

      let mesRecibido = null;
      let añoRecibido = null;

    if (data && data.days && data.days.length > 0) {
      const fechaPrimeraJornada = new Date(data.days[0].fecha);
      mesRecibido = fechaPrimeraJornada.getMonth() + 1; 
      añoRecibido = fechaPrimeraJornada.getFullYear();
  }

    console.log('Filtro:', m, y);
    console.log('Recibido de la API:', mesRecibido, añoRecibido);

    //valida si hay datos coincidentes y los guarda
    if (data && data.days && data.days.length > 0 && mesRecibido == m && añoRecibido == y) {
    this.reportData = data;
  } else {
    //si no hay datos, avisa al usuario
    this.reportData = null;
    this.notification.error('No se encontraron informes para este periodo.');
  }
},
    //manejo de errores
    error: (err: any) => {
      this.loading = false;
      this.reportData = null; 
      this.notification.error('Error de conexión con el servidor.');
      console.error('Error crítico:', err);
    }
  });
}
}