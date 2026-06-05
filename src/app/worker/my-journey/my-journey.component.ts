import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { ESTADOS_JORNADA } from '../../models/constants';
import { Journey } from '../../models/interfaces';

@Component({
  selector: 'app-my-journey',
  standalone: false,
  templateUrl: './my-journey.component.html',
  styleUrls: ['./my-journey.component.scss']
})
export class MyJourneyComponent implements OnInit {
  private api = inject(ApiService);
  private notification = inject(NotificationService);

  journey: Journey | null = null;
  tieneJornada = false;
  puedeIniciar = false;
  enCurso = false;
  enPausa = false;
  puedeFinalizar = false;
  finalizada = false;
  colorEstado = '#ccc';
  
  //Coordenadas para el fichaje
  lat?: number;
  lng?: number;

  ngOnInit(): void {
    this.loadJourney();
    this.obtenerUbicacion();
  }

  //Obtiene las coordenadas del dispositivo
  obtenerUbicacion(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.lat = pos.coords.latitude;
          this.lng = pos.coords.longitude;
        },
        (err) => console.warn('GPS no disponible:', err)
      );
    }
  }

  //Carga la jornada actual
  loadJourney(): void {
    this.api.getMyJourney().subscribe({
      next: (res: Journey) => {
      //Si la jornada existe y no está finalizada, se muestra
       if (res && res.id && res.estado !== ESTADOS_JORNADA.FINALIZADA) {
        this.journey = res;
        this.tieneJornada = true;
        this.actualizarEstadosLogicos();
      } else {
        //Si está finalizada, se limpia la vista
        this.limpiarEstado();
      }
    },
      error: () => {
        this.tieneJornada = false;
        this.notification.error('Error al cargar la jornada');
      }
    });
  }

  //Gestiona los booleanos
  actualizarEstadosLogicos(): void {
    if (!this.journey) return;
    
    const estado = this.journey.estado;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

    const fechaJornada = new Date(this.journey.fecha);
    fechaJornada.setHours(0, 0, 0, 0);

    const esFechaValida = fechaJornada.getTime() <= hoy.getTime();


    this.puedeIniciar = (estado === ESTADOS_JORNADA.CREADA) && esFechaValida;
    this.enCurso = estado === ESTADOS_JORNADA.EN_CURSO;
    this.enPausa = !!this.journey.pausa_activa;
    this.finalizada = estado === ESTADOS_JORNADA.FINALIZADA;
    this.puedeFinalizar = this.enCurso && !this.enPausa;

    const colores: any = {
      [ESTADOS_JORNADA.CREADA]: '#6c757d',
      [ESTADOS_JORNADA.EN_CURSO]: '#007bff',
      [ESTADOS_JORNADA.PAUSA]: '#ffc107',
      [ESTADOS_JORNADA.FINALIZADA]: '#28a745'
    };
    this.colorEstado = this.enPausa ? '#ffc107': (colores[estado] || '#ccc');
  }

  private limpiarEstado(): void {
    this.journey = null;
    this.tieneJornada = false;
    this.puedeIniciar = false;
    this.enCurso = false;
    this.enPausa = false;
  }

  //Inicia la jornada enviando ubicación actual
  startJourney(): void { 
    if (!this.journey || !this.lat || !this.lng) {
      this.notification.error('Ubicación necesaria para iniciar');
      this.obtenerUbicacion();
      return;
    }
    this.api.startJourney(this.journey.id, this.lat, this.lng).subscribe({
      next: () => {
        this.notification.success('Jornada iniciada');
        this.loadJourney();
      },
      error: (err) => this.notification.error('Error al iniciar')
    });
  }

  //Inicia/finaliza descanso
  togglePause(): void {
    if (!this.journey) return;

    const obs = this.enPausa ? this.api.endPause(this.journey.id) : this.api.startPause(this.journey.id);
    obs.subscribe({
      next: () => {
        this.notification.success(this.enPausa ? 'Descanso finalizado' : 'Descanso iniciado');
        this.loadJourney();
      },
      error: () => this.notification.error('Error en el descanso')
    });
  }

  //Finaliza la jornada
  endJourney(): void {
    if (!this.journey) return;
    if (!confirm('¿Seguro que quieres finalizar la jornada?')) return;

    this.api.endJourney(this.journey.id, this.lat, this.lng).subscribe({
      next: () => {
        this.notification.success('Jornada finalizada');
        this.limpiarEstado();
      },
      error: () => this.notification.error('Error al finalizar')
    });
  }

  //Registra la llegada a un cliente
  registrarLlegada(id_cliente: number): void {
    if (!this.journey) return;

    this.api.llegada(this.journey.id, id_cliente, this.lat, this.lng).subscribe({
      next: () => {
        this.notification.success('Llegada registrada');
        this.loadJourney();
      },
      error: () => this.notification.error('Error al registrar llegada')
    });
  }

  //Registra la salida de un cliente
  registrarSalida(id_cliente: number): void {
    if (!this.journey) return;

    this.api.salida(this.journey.id, id_cliente).subscribe({
      next: () => {
        this.notification.success('Salida registrada');
        this.loadJourney();
      },
      error: () => this.notification.error('Error al registrar salida')
    });
  }

  //Para crear enlaces de mapas
  encodeURI(text: string): string {
    return encodeURIComponent(text);
  }
}