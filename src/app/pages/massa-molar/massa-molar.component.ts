import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormulaQuimicaService } from '../../services/formula-quimica.service';
import { QuimicaService } from '../../services/quimica.service';
import { Composto, ResultadoMassaMolar } from '../../models/quimica.models';
import { CommonElementsComponent } from '../../components/shared/common-elements/common-elements.component';
import { CommonCompoundsComponent } from '../../components/shared/common-compounds/common-compounds.component';
import { ChemicalKeypadComponent } from '../../components/shared/chemical-keypad/chemical-keypad.component';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-massa-molar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CommonElementsComponent,
    CommonCompoundsComponent,
    ChemicalKeypadComponent,
    TooltipDirective
  ],
  templateUrl: './massa-molar.component.html',
  styleUrl: './massa-molar.component.css'
})
export class MassaMolarComponent {
  quimicaService = inject(QuimicaService);
  formulaService = inject(FormulaQuimicaService);

  @ViewChild('formulaInput') formulaInputRef!: ElementRef<HTMLInputElement>;

  formula = signal<string>('');
  preview = signal<string>('Digite uma fórmula');
  erro = signal<string>('');
  resultado = signal<ResultadoMassaMolar | null>(null);

  onFormulaChange(val: string): void {
    this.formula.set(val);
    this.atualizarPreview();
    this.erro.set('');
    this.resultado.set(null);
  }

  atualizarPreview(): void {
    const norm = this.formulaService.normalizarFormula(this.formula());
    if (!norm) {
      this.preview.set('Digite uma fórmula');
    } else {
      this.preview.set(this.formulaService.formatarFormulaHTML(norm));
    }
  }

  inserirTexto(texto: string): void {
    const input = this.formulaInputRef?.nativeElement;
    if (!input) {
      this.formula.update(f => f + texto);
      this.atualizarPreview();
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const current = input.value;
    const nextVal = current.slice(0, start) + texto + current.slice(end);

    this.formula.set(nextVal);
    this.atualizarPreview();
    this.erro.set('');
    this.resultado.set(null);

    setTimeout(() => {
      input.focus();
      const pos = start + texto.length;
      input.setSelectionRange(pos, pos);
    });
  }

  apagarUltimo(): void {
    const input = this.formulaInputRef?.nativeElement;
    if (!input) {
      this.formula.update(f => f.slice(0, -1));
      this.atualizarPreview();
      return;
    }

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const current = input.value;

    if (start !== end) {
      const nextVal = current.slice(0, start) + current.slice(end);
      this.formula.set(nextVal);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start, start);
      });
    } else if (start > 0) {
      const nextVal = current.slice(0, start - 1) + current.slice(end);
      this.formula.set(nextVal);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start - 1, start - 1);
      });
    }

    this.atualizarPreview();
    this.erro.set('');
    this.resultado.set(null);
  }

  limparFormula(): void {
    this.formula.set('');
    this.atualizarPreview();
    this.erro.set('');
    this.resultado.set(null);
    this.formulaInputRef?.nativeElement?.focus();
  }

  onCompostoSelecionado(composto: Composto): void {
    this.formula.set(composto.formula);
    this.atualizarPreview();
    this.erro.set('');
    this.calcular();
  }

  calcular(): void {
    this.erro.set('');
    if (!this.quimicaService.elementosCarregados()) {
      this.erro.set('Carregando elementos, aguarde um instante.');
      return;
    }

    const err = this.formulaService.validarFormula(this.formula());
    if (err) {
      this.erro.set(err);
      this.resultado.set(null);
      return;
    }

    try {
      const formulaNorm = this.formulaService.normalizarFormula(this.formula());
      const res = this.formulaService.calcularMassaMolar(formulaNorm);

      // Verificar elementos desconhecidos
      const desconhecidos = res.linhas.filter(l => l.massaAtomica === 0);
      if (desconhecidos.length > 0) {
        this.erro.set(`Elementos não encontrados: ${desconhecidos.map(d => d.simbolo).join(', ')}`);
        this.resultado.set(null);
        return;
      }

      this.resultado.set(res);
    } catch (e: any) {
      this.erro.set(e.message || 'Erro ao calcular massa molar.');
      this.resultado.set(null);
    }
  }

  formatarMassa(val: number): string {
    return this.formulaService.formatarMassa(val);
  }
}
