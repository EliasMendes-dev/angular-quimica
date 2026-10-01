import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hub-inicial',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hub-inicial.component.html',
  styleUrl: './hub-inicial.component.css'
})
export class HubInicialComponent {}
