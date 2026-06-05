import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import { User } from '../models/interfaces';
import { environment } from '../../environments/environment'; 

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl; 
    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable(); //observable para que los componenetes se suscriban

    constructor() {
        const savedUser = localStorage.getItem('tr_user');
        if (savedUser) {
            try {
                this.userSubject.next(JSON.parse(savedUser));
            } catch (e) {
                this.logout();
            }
        }
    }

    //Realiza el login y guarda la sesión
    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/auth/login`, credentials).pipe(
            tap(res => {
                if (res.token && res.user) {
                    localStorage.setItem('tr_token', res.token);
                    localStorage.setItem('tr_user', JSON.stringify(res.user));
                    this.userSubject.next(res.user);
                }
            })
        );
    }

    //Cierra la sesión y redirige al login
    logout(): void {
        localStorage.removeItem('tr_token');
        localStorage.removeItem('tr_user');
        this.userSubject.next(null);
        window.location.href = '/login';
    }

    getToken() {
        return localStorage.getItem('tr_token');
    }

    isAdmin(): boolean {
        return this.userSubject.value?.rol === 'admin';
    }
}


