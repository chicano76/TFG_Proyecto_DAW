import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { ADMIN_ROUTES } from './admin.routes';

@NgModule({
  imports: [RouterModule.forChild([
    {
      path: '',
      component: AdminLayoutComponent,
      children: ADMIN_ROUTES
    }
  ])],
  exports: [RouterModule]
})
export class AdminRoutingModule { }