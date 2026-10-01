import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuimicaService } from '../../../services/quimica.service';
import { TooltipDirective } from '../../../directives/tooltip.directive';

@Component({
  selector: 'app-electronegativity-card',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './electronegativity-card.component.html',
  styleUrl: './electronegativity-card.component.css'
})
export class ElectronegativityCardComponent {
  quimicaService = inject(QuimicaService);
  topPauling = this.quimicaService.topPauling;
}
