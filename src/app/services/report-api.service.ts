import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ReportApiService {
    private http = inject(HttpClient);

    getWorkReport(from: string, to: string, userId: number) {
        let params = new HttpParams()
            .set('from', from)
            .set('to', to)
            .set('userId', userId.toString());
        return this.http.get<any>(`${API}/api/reports/work`, { params });
    }

    getMyWorkReport(from: string, to: string) {
        let params = new HttpParams()
            .set('from', from)
            .set('to', to);
        return this.http.get<any>(`${API}/api/reports/my-work`, { params });
    }

    getStats() {
        return this.http.get<any>(`${API}/api/reports/stats`);
    }
}
