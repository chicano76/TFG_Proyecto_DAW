import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './login/login.component';
import { NavLogoComponent } from './components/nav-logo/nav-logo.component';
import { AboutComponent } from './about/about.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';



@NgModule({
  declarations: [
    App,
    LoginComponent,
    AboutComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NavLogoComponent,
    HttpClientModule
    
  ],
  providers: [
   
   { provide: HTTP_INTERCEPTORS, 
    useClass: AuthInterceptor, 
    multi: true }
],

  bootstrap: [App]
})
export class AppModule { }
