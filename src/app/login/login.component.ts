import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service'; 

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loginForm!: FormGroup;
  loading = false;
  error = ''; //guarda mensajes de error 

  ngOnInit(): void {
    const emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(emailRegex)]],
      password: ['', [Validators.required, Validators.minLength(6), 
                      Validators.pattern(passwordRegex)]] 
       
                      
    });
  }
  
  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
      this.loading = false;
 
      //Redirección según rol
      const route = res.user.rol === 'admin' ? '/admin/clientes' : '/empleado/mi-jornada';
      this.router.navigate([route]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Email o contraseña incorrectos';
        this.notification.error('Error en el inicio de sesión')
        
      }
    });
  }
}








