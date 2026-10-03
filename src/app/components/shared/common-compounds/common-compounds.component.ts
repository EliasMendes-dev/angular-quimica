import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormulaQuimicaService } from '../../../services/formula-quimica.service';
import { QuimicaService } from '../../../services/quimica.service';
import { Composto } from '../../../models/quimica.models';

@Component({
  selector: 'app-common-compounds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-compounds.component.html',
  styleUrl: './common-compounds.component.css'
})
export class CommonCompoundsComponent {
  quimicaService = inject(QuimicaService);
  formulaService = inject(FormulaQuimicaService);
  compostos = this.quimicaService.compostosComuns;

  @Output() compostoSelecionado = new EventEmitter<Composto>();

  formatarFormula(formula: string): string {
    return this.formulaService.formatarFormulaHTML(formula);
  }

  onSelect(composto: Composto): void {
    this.compostoSelecionado.emit(composto);
  }
}
