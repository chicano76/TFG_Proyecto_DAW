import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Route, User } from '../../models/interfaces';

@Component({
  selector: 'app-planning', 
  standalone: false,
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  
  today: string = ''; //fecha actual
  journeyForm!: FormGroup; //formulario
  workers: User[] = []; //lista trabajadores
  routes: Route[] = []; //lista rutas
  loading = false; //estado de carga

  ngOnInit(): void {
    this.today = new Date().toISOString().split('T')[0];
    this.initForm();
    this.loadData();
  }

  //Inicializa formulario y validaciones
  private initForm(): void {
    this.journeyForm = this.fb.group({
      id_usuario: ['', [Validators.required]],
      id_ruta: ['', [Validators.required]],
      fecha: [this.today, [Validators.required]]
    });
  }

  loadData(): void {
    //Carga de trabajadores
    this.api.getWorkers().subscribe({
      next: (res) => {
        //Filtro
        this.workers = res.filter(u => u.rol === 'trabajador');
      },
      error: () => this.notificationService.error('Error al cargar trabajadores')
    });

    // Carga de rutas
    this.api.getRoutes().subscribe({
      next: (res) => this.routes = res,
      error: () => this.notificationService.error('Error al cargar rutas')
    });
  }

  planify(): void {
  //Comprueba que una fecha no sea pasada
  if (this.journeyForm.value.fecha < this.today) {
    this.notificationService.error('No se pueden planificar jornadas en fechas pasadas');
    return; 
  }
    
  if (this.journeyForm.invalid) return;

    this.loading = true;

    const data = {
      ...this.journeyForm.value,
      estado: 'CREADA'
    };

    this.api.saveJourney(data).subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.success('Jornada planificada correctamente');
        this.journeyForm.reset({
          fecha: this.today
        }); 
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error('Error al planificar la jornada');
      }
    });
  }
}