import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { User, Route } from '../../models/interfaces';

@Component({
  selector: 'app-journey-list',
  standalone: false,
  templateUrl: './journey-list.component.html',
  styleUrls: ['./journey-list.component.scss']
})
export class JourneyListComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  //Jornadas planificadas
  journeys: any[] = [];
  workers: User[] = []; 
  routes: Route[] = []; 
  
  loading = false;
  showModal = false;
  journeyForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  //Formulario reactivo con validaciones
  private initForm(): void {
    this.journeyForm = this.fb.group({
      id_usuario: ['', [Validators.required]],
      id_ruta: ['', [Validators.required]],
      fecha: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  loadData(): void {
    this.loading = true;

    this.api.getJourneys().subscribe({
      next: (res) => {
        this.journeys = res;
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Error al cargar jornadas');
        this.loading = false;
      }
    });

    this.api.getWorkers().subscribe({
      next: (res) => this.workers = res,
      error: () => console.error('Error cargando trabajadores')
    });

    this.api.getRoutes().subscribe({
      next: (res) => this.routes = res,
      error: () => console.error('Error cargando rutas')
    });
  }

  //Prepara el modal para asignar nuevo
  openModal(): void {
    this.showModal = true;
    this.journeyForm.reset({
      fecha: new Date().toISOString().split('T')[0]
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    if (this.journeyForm.invalid) return;

    const newJourney = {
      ...this.journeyForm.value,
      estado: 'CREADA' 
    };

    this.api.saveJourney(newJourney).subscribe({
      next: () => {
        this.notificationService.success('Jornada asignada correctamente');
        this.closeModal();
        this.loadData();
      },
      error: () => {
        this.notificationService.error('Error al guardar la jornada');
      }
    });
  }
  //Elimina jornada
  delete(j: any): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la jornada de ${j.trabajador}?`)) {
      this.api.deleteJourney(j.id).subscribe({
        next: () => {
          this.notificationService.success('Jornada eliminada');
          this.loadData();
        },
        error: () => {
          this.notificationService.error('No se pudo eliminar la jornada');
        }
      });
    }
  }
}