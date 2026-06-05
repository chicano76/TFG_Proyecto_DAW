import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Client } from '../../models/interfaces';

@Component({
  selector: 'app-clients',
  standalone: false,
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
})
export class ClientsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  clients: Client[] = []; 
  showModal = false; 
  clientForm!: FormGroup; 
  isEditing = false;
  currentClientId: number | null = null;

  ngOnInit() {
    this.initForm();
    this.load();
  }

  //Formulario reactivo con validaciones
  private initForm(): void{
    const telefonoRegex = '^[0-9]{9}$'; 
    this.clientForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.pattern(telefonoRegex), Validators.required]]
    });
  }

  //Carga la lista de clientes
  load(): void {
    this.api.getClients().subscribe({
      next: (res) => this.clients = res,
      error: () => this.notificationService.error('Error al cargar la lista')
    });
  }

  openModal(client?: Client): void {
    this.showModal = true;
    if (client) {
      this.isEditing = true;
      this.currentClientId = client.id;
      this.clientForm.patchValue(client); 
    } else {
      this.isEditing = false;
      this.currentClientId = null;
      this.clientForm.reset();
    }
  }

  closeModal(): void{
    this.showModal = false;
    this.clientForm.reset();
  }

  //Gestiona la creación/modificación de un cliente
  save(): void {
    if (this.clientForm.invalid) return;

    const clientData = {
      ...this.clientForm.value,
      id: this.currentClientId
    };

    this.api.saveClient(clientData).subscribe({
      next: () => {
        this.notificationService.success(this.isEditing ? '¡Actualizado!' : '¡Creado!');
        this.closeModal();
        this.load();
      },
      error: () => this.notificationService.error('Error al guardar')
    });
  }

  //Elimina registros
  delete(id: number): void {
    if (confirm('¿Eliminar definitivamente?')) {
      this.api.deleteClient(id).subscribe({
        next: () => {
          this.notificationService.success('Eliminado');
          this.load();
        },
        error: () => this.notificationService.error('Error al eliminar')
      });
    }
  }
}