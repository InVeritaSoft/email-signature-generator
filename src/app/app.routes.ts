import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./signature/signature.component').then(m => m.SignatureComponent)
  }
];

