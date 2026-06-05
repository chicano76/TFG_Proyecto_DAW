import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { WorkerLayoutComponent } from './worker-layout/worker-layout.component';
import { WorkerSideNavComponent } from '../components/worker-side-nav/worker-side-nav.component';
import { MyJourneyComponent } from './my-journey/my-journey.component';
import { FinishedJourneysComponent } from './finished-journeys/finished-journeys.component';
import { MyReportsComponent } from './my-reports/my-reports.component';
import { NavLogoComponent } from '../components/nav-logo/nav-logo.component';

const WORKER_ROUTES: Routes = [
  { path: 'mi-jornada', component: MyJourneyComponent },
  { path: 'finalizadas', component: FinishedJourneysComponent },
  { path: 'mis-informes', component: MyReportsComponent },
  { path: '', redirectTo: 'mi-jornada', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    WorkerLayoutComponent,
    WorkerSideNavComponent,
    MyJourneyComponent,
    FinishedJourneysComponent,
    MyReportsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NavLogoComponent,
    RouterModule.forChild([
      {
        path: '',
        component: WorkerLayoutComponent,
        children: WORKER_ROUTES
      }
    ])
  ]
})
export class WorkerModule { }