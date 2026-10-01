import { Component, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuimicaService } from '../../services/quimica.service';
import { Composto, ResultadoConversao } from '../../models/quimica.models';
import { CommonElementsComponent } from '../../components/shared/common-elements/common-elements.component';
import { CommonCompoundsComponent } from '../../components/shared/common-compounds/common-compounds.component';
import { ChemicalKeypadComponent } from '../../components/shared/chemical-keypad/chemical-keypad.component';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-conversor-mol-massa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CommonElementsComponent,
    CommonCompoundsComponent,
    ChemicalKeypadComponent,
    TooltipDirective
  ],
  templateUrl: './conversor-mol-massa.component.html',
  styleUrl: './conversor-mol-massa.component.css'
})
export class ConversorMolMassaComponent {
  quimicaService = inject(QuimicaService);

  @ViewChild('formulaInput') formulaInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('valorInput') valorInputRef!: ElementRef<HTMLInputElement>;

  formula = signal<string>('');
  valor = signal<string>('');
  isMolParaMassa = signal<boolean>(true);

  formulaErro = signal<string>('');
  valorErro = signal<string>('');
  resultado = signal<ResultadoConversao | null>(null);

  preview = computed(() => {
    const f = this.quimicaService.normalizarFormula(this.formula());
    if (!f) return 'Digite uma fórmula';
    return this.quimicaService.formatarFormulaHTML(f);
  });

  valorLabel = computed(() => {
    return this.isMolParaMassa() ? 'Quantidade de matéria (mol)' : 'Massa da substância (g)';
  });

  valorAjuda = computed(() => {
    return this.isMolParaMassa()
      ? 'Digite a quantidade em mol para converter em gramas.'
      : 'Digite a massa em gramas para converter em mol.';
  });

  valorPlaceholder = computed(() => {
    return this.isMolParaMassa() ? 'Ex: 2,5' : 'Ex: 45,0';
  });

  setModo(molParaMassa: boolean): void {
    if (this.isMolParaMassa() !== molParaMassa) {
      this.isMolParaMassa.set(molParaMassa);
      if (this.resultado()) {
        this.converter();
      }
    }
  }

  alternarModo(): void {
    this.setModo(!this.isMolParaMassa());
  }

  onFormulaChange(val: string): void {
    this.formula.set(val);
    this.formulaErro.set('');
    this.resultado.set(null);
  }

  onValorChange(val: string): void {
    this.valor.set(val);
    this.valorErro.set('');
    this.resultado.set(null);
  }

  inserirTexto(texto: string): void {
    const input = this.formulaInputRef?.nativeElement;
    if (!input) {
      this.formula.update(f => f + texto);
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const current = input.value;
    const nextVal = current.slice(0, start) + texto + current.slice(end);

    this.formula.set(nextVal);
    this.formulaErro.set('');
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

    this.formulaErro.set('');
    this.resultado.set(null);
  }

  limparFormula(): void {
    this.formula.set('');
    this.formulaErro.set('');
    this.resultado.set(null);
    this.formulaInputRef?.nativeElement?.focus();
  }

  limparValor(): void {
    this.valor.set('');
    this.valorErro.set('');
    this.resultado.set(null);
    this.valorInputRef?.nativeElement?.focus();
  }

  onCompostoSelecionado(composto: Composto): void {
    this.formula.set(composto.formula);
    this.formulaErro.set('');
    if (this.valor().trim()) {
      this.converter();
    }
  }

  normalizarNumero(valor: string): number {
    const texto = String(valor ?? '').trim();
    if (!texto) return NaN;
    const temVirgula = texto.includes(',');
    const temPonto = texto.includes('.');
    let normalizado = texto;

    if (temVirgula && temPonto) {
      normalizado = normalizado.replace(/\./g, '').replace(',', '.');
    } else {
      normalizado = normalizado.replace(',', '.');
    }

    const limpo = normalizado.replace(/[^0-9.+-]/g, '');
    return Number(limpo);
  }

  converter(): void {
    this.formulaErro.set('');
    this.valorErro.set('');

    if (!this.quimicaService.elementosCarregados()) {
      this.formulaErro.set('Carregando elementos, aguarde um instante.');
      return;
    }

    const errFormula = this.quimicaService.validarFormula(this.formula());
    if (errFormula) {
      this.formulaErro.set(errFormula);
      this.resultado.set(null);
      return;
    }

    const valTexto = this.valor().trim();
    if (!valTexto) {
      this.valorErro.set('Informe um valor.');
      this.resultado.set(null);
      return;
    }

    const num = this.normalizarNumero(valTexto);
    if (!Number.isFinite(num)) {
      this.valorErro.set('Valor inválido.');
      this.resultado.set(null);
      return;
    }
    if (num <= 0) {
      this.valorErro.set('Use um valor maior que zero.');
      this.resultado.set(null);
      return;
    }

    try {
      const formulaNorm = this.quimicaService.normalizarFormula(this.formula());
      const res = this.quimicaService.converterMolMassa(formulaNorm, num, this.isMolParaMassa());

      if (res.massaMolar === 0) {
        this.formulaErro.set('Elementos desconhecidos na fórmula.');
        this.resultado.set(null);
        return;
      }

      this.resultado.set(res);
    } catch (e: any) {
      this.formulaErro.set(e.message || 'Erro ao realizar conversão.');
      this.resultado.set(null);
    }
  }

  formatarNumero(num: number): string {
    if (!Number.isFinite(num)) return '--';
    return Number(num.toFixed(4)).toString();
  }

  formatarNumeroFix(num: number): string {
    if (!Number.isFinite(num)) return '--';
    return num.toFixed(4);
  }
}
