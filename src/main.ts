import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ErrorHandler } from '@angular/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { CustomErrorHandler } from './app/error-handler.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler
    }
  ]
}).catch(err => console.error(err));

