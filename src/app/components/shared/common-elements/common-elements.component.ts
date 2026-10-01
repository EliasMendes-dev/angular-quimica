import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuimicaService } from '../../../services/quimica.service';

@Component({
  selector: 'app-common-elements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-elements.component.html',
  styleUrl: './common-elements.component.css'
})
export class CommonElementsComponent {
  quimicaService = inject(QuimicaService);
  elementos = this.quimicaService.elementosComuns;

  @Output() elementoSelecionado = new EventEmitter<string>();

  getMassaCurta(simbolo: string): string {
    const el = this.quimicaService.elementosPorSimbolo.get(simbolo.toLowerCase());
    return el ? this.quimicaService.formatarMassaCurta(Number(el.massa_molar)) : '--';
  }

  getNome(simbolo: string): string {
    const el = this.quimicaService.elementosPorSimbolo.get(simbolo.toLowerCase());
    return el?.nome || simbolo;
  }

  onSelect(simbolo: string): void {
    this.elementoSelecionado.emit(simbolo);
  }
}
