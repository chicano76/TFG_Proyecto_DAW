import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Client, Route, User, Journey } from '../models/interfaces';
import { catchError, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Ha ocurrido un error inesperado';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = error.error?.error || `Código: ${error.status}\nMensaje: ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }

    // Clientes
    getClients() {
        return this.http.get<Client[]>(`${this.apiUrl}/api/clientes`).pipe(catchError(this.handleError));
    }
    saveClient(client: Partial<Client>) {
        if (client.id) return this.http.put<Client>(`${this.apiUrl}/api/clientes/${client.id}`, client).pipe(catchError(this.handleError));
        return this.http.post<Client>(`${this.apiUrl}/api/clientes`, client).pipe(catchError(this.handleError));
    }
    deleteClient(id: number) {
        return this.http.delete(`${this.apiUrl}/api/clientes/${id}`).pipe(catchError(this.handleError));
    }

    // Trabajadores
    getWorkers() {
        return this.http.get<User[]>(`${this.apiUrl}/api/trabajadores`).pipe(catchError(this.handleError));
    }
    saveWorker(user: Partial<User>) {
        if (user.id) return this.http.put<User>(`${this.apiUrl}/api/trabajadores/${user.id}`, user).pipe(catchError(this.handleError));
        return this.http.post<User>(`${this.apiUrl}/api/trabajadores`, user).pipe(catchError(this.handleError));
    }
    deleteWorker(id: number) {
        return this.http.delete(`${this.apiUrl}/api/trabajadores/${id}`).pipe(catchError(this.handleError));
    }

    // Rutas
    getRoutes() {
        return this.http.get<Route[]>(`${this.apiUrl}/api/rutas`).pipe(catchError(this.handleError));
    }
    getRoute(id: number) {
        return this.http.get<Route>(`${this.apiUrl}/api/rutas/${id}`).pipe(catchError(this.handleError));
    }
    saveRoute(route: Partial<Route>) {
        if (route.id) return this.http.put<Route>(`${this.apiUrl}/api/rutas/${route.id}`, route).pipe(catchError(this.handleError));
        return this.http.post<Route>(`${this.apiUrl}/api/rutas`, route).pipe(catchError(this.handleError));
    }
    deleteRoute(id: number) {
        return this.http.delete(`${this.apiUrl}/api/rutas/${id}`).pipe(catchError(this.handleError));
    }

    // Jornadas
    saveJourney(journey: Partial<Journey>) {
        return this.http.post<{ id: number, message: string }>(`${this.apiUrl}/api/jornadas`, journey).pipe(catchError(this.handleError));
    }
    getJourneys() {
        return this.http.get<any[]>(`${this.apiUrl}/api/jornadas`).pipe(catchError(this.handleError));
    }
    deleteJourney(id: number) {
        return this.http.delete(`${this.apiUrl}/api/jornadas/${id}`).pipe(catchError(this.handleError));
    }
    getMyJourney() {
        return this.http.get<Journey>(`${this.apiUrl}/api/mis-jornadas`).pipe(catchError(this.handleError));
    }

    // Interacciones
    getFinishedJourneys() {
        return this.http.get<any[]>(`${this.apiUrl}/api/mis-jornadas-finalizadas`).pipe(catchError(this.handleError));
    }
    startJourney(id: number, lat?: number, lng?: number) {
        return this.http.post(`${this.apiUrl}/api/jornadas/${id}/iniciar`, { lat, lng }).pipe(catchError(this.handleError));
    }
    endJourney(id: number, lat?: number, lng?: number) {
        return this.http.post(`${this.apiUrl}/api/jornadas/${id}/finalizar`, { lat, lng }).pipe(catchError(this.handleError));
    }
    startPause(id: number) {
        return this.http.post(`${this.apiUrl}/api/jornadas/${id}/pausas/iniciar`, {}).pipe(catchError(this.handleError));
    }
    endPause(id: number) {
        return this.http.post(`${this.apiUrl}/api/jornadas/${id}/pausas/finalizar`, {}).pipe(catchError(this.handleError));
    }

    llegada(jId: number, cId: number, lat?: number, lng?: number) {
        return this.http.post(`${this.apiUrl}/api/jornadas/${jId}/visitas/${cId}/llegada`, { lat, lng }).pipe(catchError(this.handleError));
    }
    salida(jId: number, cId: number) {
        return this.http.post(`${this.apiUrl}/api/jornadas/${jId}/visitas/${cId}/salida`, {}).pipe(catchError(this.handleError));
    }

    reportIncident(jId: number, incidencia: string) {
        return this.http.post(`${this.apiUrl}/api/jornadas/${jId}/incidencia`, { incidencia }).pipe(catchError(this.handleError));
    }

// Informes (Worker)
    getMyReports(month: number, year: number) {
        return this.http.get<any>(`${this.apiUrl}/api/worker/informes`, {
            params: { 
                month: month.toString(), 
                year: year.toString() 
            }
        }).pipe(catchError(this.handleError));
    }

    // Informes (Administrador)
    getAdminReports(month: any, year: any, userId: any): Observable<any> {
        const from = `${year}-${month.toString().padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const to = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

        return this.http.get(`${this.apiUrl}report-work`, { 
      params: { 
        from: from, 
        to: to, 
        userId: userId.toString() 
      }
    });
  }
}
