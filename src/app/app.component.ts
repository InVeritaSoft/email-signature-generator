import { Component } from '@angular/core';
import { SignatureComponent } from './signature/signature.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SignatureComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
