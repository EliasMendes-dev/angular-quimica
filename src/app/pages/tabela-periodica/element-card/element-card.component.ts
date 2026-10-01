import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Elemento } from '../../../models/quimica.models';

@Component({
  selector: 'app-element-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './element-card.component.html',
  styleUrl: './element-card.component.css'
})
export class ElementCardComponent {
  @Input() elemento: Elemento | null = null;
  @Input() elementoCor: string = '';

  isExpanded = signal<boolean>(false);

  toggleExpand(): void {
    this.isExpanded.update(v => !v);
  }

  formatarValor(valor: any, unidade?: string): string {
    if (valor === null || valor === undefined || valor === '') return 'N/A';
    const texto = String(valor).trim();
    if (texto === '' || texto === '-') return 'N/A';
    return unidade ? `${texto} ${unidade}` : texto;
  }

  getCamadasFormatadas(camadas: any): string {
    if (!camadas) return '';
    if (Array.isArray(camadas)) return camadas.join('\n');
    return String(camadas).split(',').join('\n');
  }

  getTextColor(bgColor: string): string {
    if (!bgColor) return 'inherit';
    const match = bgColor.match(/\d+/g);
    if (!match || match.length < 3) return 'inherit';
    const r = parseInt(match[0], 10);
    const g = parseInt(match[1], 10);
    const b = parseInt(match[2], 10);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 125 ? '#ffffff' : '#000000';
  }
}
