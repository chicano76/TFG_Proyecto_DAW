import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-workers', 
  standalone: false,
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss']
})
export class WorkersComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  users: User[] = []; //lista de trabajadores
  showModal = false;
  userForm!: FormGroup; 
  isEditing = false;
  currentUserId: number | null = null; //id del trabajador que está siendo modificado

  ngOnInit(): void {
    this.initForm();
    this.load();
  }

  //Configura la estructura del formulario con validaciones
  private initForm(): void {
    const emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(emailPattern)]],
      password: ['', []], 
      rol: ['trabajador', [Validators.required]]
    });
  }

  //Carga todos los trabajadores y filtra por rol
  load(): void {
    this.api.getWorkers().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : [];
        this.users = data.filter(u => u.rol === 'trabajador');
      },
      error: (err) => {
        this.users = [];
        this.notificationService.error('Error al cargar la lista de trabajadores');
      }
    });
  }

  //Ajusta la obligatoriedad de la contraseña
  openModal(user?: User): void {
    this.showModal = true;

    if (user) {
      this.isEditing = true;
      this.currentUserId = user.id;
      this.userForm.patchValue({
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        password: '' 
      });
      
      //Al editar, la contraseña no es obligatoria (solo si se quiere cambiar)
      this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    } else {
      this.isEditing = false;
      this.currentUserId = null;
      this.userForm.reset({ rol: 'trabajador' });
      //Al crear, la contraseña sí es obligatoria
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.userForm.get('password')?.updateValueAndValidity();
  }
  
  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.currentUserId = null;
    this.userForm.reset({ rol: 'trabajador' }); 
  }

  //Guarda el trabajador
  save(): void {
    if (this.userForm.invalid) return;

    const formValue = { ...this.userForm.value };

    if (this.isEditing && !formValue.password) {
      delete formValue.password;
    }
  
    const userData = { ...formValue, id: this.currentUserId };

    this.api.saveWorker(userData).subscribe({
      next: () => {
        this.notificationService.success(this.isEditing ? 'Trabajador actualizado' : 'Trabajador creado');
        this.showModal = false;
        this.load();
      },
      error: () => this.notificationService.error('Error al procesar la solicitud')
    });
  }

  //Elimina trabajador
  delete(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar a este trabajador?')) {
      this.api.deleteWorker(id).subscribe({
        next: () => {
          this.notificationService.success('Trabajador eliminado correctamente');
          this.load();
        },
        error: () => this.notificationService.error('No se pudo eliminar al trabajador')
      });
    }
  }
}