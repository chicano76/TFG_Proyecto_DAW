import { Routes } from '@angular/router';
import { ClientsComponent } from './clients/clients.component';
import { RoutesComponent } from './routes/routes.component';
import { PlanningComponent } from './planning/planning.component';
import { JourneyListComponent } from './journey-list/journey-list.component';
import { WorkersComponent } from './workers/workers.component';
import { ReportsComponent } from './reports/reports.component';

export const ADMIN_ROUTES: Routes = [
    { path: 'clientes', component: ClientsComponent },
    { path: 'rutas', component: RoutesComponent },
    { path: 'jornadas', component: PlanningComponent },
    { path: 'jornadas-lista', component: JourneyListComponent },
    { path: 'trabajadores', component: WorkersComponent },
    { path: 'informes', component: ReportsComponent },
    { path: 'usuarios', redirectTo: 'trabajadores', pathMatch: 'full' },
    { path: '', redirectTo: 'clientes', pathMatch: 'full' }
];
