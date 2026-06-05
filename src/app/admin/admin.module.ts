import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminSideNavComponent } from '../components/admin-side-nav/admin-side-nav.component';
import { ClientsComponent } from './clients/clients.component';
import { RoutesComponent } from './routes/routes.component';
import { PlanningComponent } from './planning/planning.component';
import { JourneyListComponent } from './journey-list/journey-list.component';
import { WorkersComponent } from './workers/workers.component';
import { ReportsComponent } from './reports/reports.component';
import { NavLogoComponent } from '../components/nav-logo/nav-logo.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminSideNavComponent,
    ClientsComponent,
    RoutesComponent,
    PlanningComponent,
    WorkersComponent,
    ReportsComponent,
    JourneyListComponent
    
  ],
  
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminRoutingModule, NavLogoComponent
  ]
})
export class AdminModule { }