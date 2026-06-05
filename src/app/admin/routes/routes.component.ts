import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Route, Client } from '../../models/interfaces';

@Component({
  selector: 'app-routes',
  standalone: false,
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss']
})
export class RoutesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  
  routes: Route[] = [];
  allClients: Client[] = [];
  showModal = false;
  
  routeForm!: FormGroup;
  paradas: any[] = []; //lista temporal de paradas
  isEditing = false;
  currentRouteId: number | null = null;

  ngOnInit() {
    this.initForm();
    this.load();
    //Carga los clientes para el selector de paradas
    this.api.getClients().subscribe({
      next: (res) => this.allClients = res,
      error: () => console.error('Error al cargar la lista de clientes')
    });
  }

  private initForm(): void {
    this.routeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  //Carga las rutas desde el servidor
  load(): void {
    this.api.getRoutes().subscribe({
      next: (res) => this.routes = res,
      error: () => this.notificationService.error('Error al cargar rutas')
    });
  }

  //Gestiona modal para crear/modificar ruta
  openModal(route?: Route): void {
    if (route && route.id) {
      this.isEditing = true;
      this.currentRouteId = route.id;
      
      this.api.getRoute(route.id).subscribe({
        next: (res) => {
          this.routeForm.patchValue({ nombre: res.nombre });
        
        //Asegura que client_id esté presente
        this.paradas = (res.paradas || []).map((p: any) => ({
          ...p,
          client_id: p.client_id || p.id_cliente, 
          nombre: p.nombre,
          direccion: p.direccion,
          orden: p.orden
        }));
        
        this.showModal = true;
      },
      error: () => this.notificationService.error('No se pudo obtener el detalle de la ruta')
      });

    } else {
      this.isEditing = false;
      this.currentRouteId = null;
      this.routeForm.reset();
      this.paradas = [];
      this.showModal = true;
    }
  }

  //Añade un cliente a la lista de paradas
  addStop(clientId: string): void {
    if (!clientId) return;
    const id = Number(clientId);
    const client = this.allClients.find(c => c.id === id);
    
    if (client) {
      this.paradas.push({
        client_id: client.id, 
        orden: this.paradas.length + 1,
        nombre: client.nombre, 
        direccion: client.direccion 
      });
    }
  }
  //Elimina una parada y ordena
  removeStop(index: number): void{
    this.paradas.splice(index, 1);
    // Recalculamos el orden de las que quedan
    this.paradas.forEach((s, i) => s.orden = i + 1);
  }

  //Envía los datos de la ruta y de las paradas al servidor
  save(): void {
    if (this.routeForm.invalid) return;

    const dataParaEnviar: any = {
      id: this.currentRouteId, 
      nombre: this.routeForm.value.nombre,
      paradas: this.paradas.map(p => ({
        client_id: p.client_id,
        orden: p.orden
      }))
    };

    this.api.saveRoute(dataParaEnviar).subscribe({
      next: () => {
        this.notificationService.success('Ruta guardada con éxito');
        this.showModal = false;
        this.load();
      },
      error: () => this.notificationService.error('Error al guardar la ruta')
    });
  }
  
  //Elimina la ruta
  delete(): void {
    if (this.currentRouteId && confirm('¿Eliminar esta ruta permanentemente?')) {
      this.api.deleteRoute(this.currentRouteId).subscribe({
        next: () => {
          this.notificationService.success('Ruta eliminada');
          this.showModal = false;
          this.load();
        },
        error: () => this.notificationService.error('Error al eliminar')
      });
    }
  }
}