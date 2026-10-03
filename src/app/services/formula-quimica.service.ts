import { Injectable, inject } from '@angular/core';
import { ResultadoConversao, ResultadoMassaMolar } from '../models/quimica.models';
import { QuimicaService } from './quimica.service';

const MIDDOT = '·';

@Injectable({ providedIn: 'root' })
export class FormulaQuimicaService {
  private quimicaService = inject(QuimicaService);

  normalizarFormula(str = ''): string {
    return String(str).replace(/\s+/g, '').replace(/\./g, MIDDOT);
  }

  formatarFormulaHTML(formula = ''): string {
    return String(formula)
      .replace(/[^A-Za-z0-9()[\]{}·]/g, '')
      .replace(/(\d+)/g, '<sub>$1</sub>')
      .replace(/·/g, '&middot;');
  }

  formatarMassa(valor: number): string {
    if (!Number.isFinite(valor)) return 'N/A';
    return valor.toFixed(4);
  }

  splitSegmentos(formula: string): string[] {
    let nivel = 0;
    let atual = '';
    const out: string[] = [];

    for (const ch of formula) {
      if ('([{'.includes(ch)) nivel++;
      if (')]}'.includes(ch)) nivel--;

      if (nivel === 0 && ch === MIDDOT) {
        out.push(atual);
        atual = '';
        continue;
      }
      atual += ch;
    }
    if (atual) out.push(atual);
    return out;
  }

  parseSegmento(seg: string): Record<string, number> {
    let i = 0;

    const lerNumero = () => {
      let num = '';
      while (i < seg.length && /\d/.test(seg[i])) num += seg[i++];
      return num ? parseInt(num, 10) : 1;
    };

    const parseGrupo = (): Record<string, number> => {
      const mapa: Record<string, number> = {};
      const add = (el: string, q: number) => {
        mapa[el] = (mapa[el] || 0) + q;
      };

      while (i < seg.length) {
        const ch = seg[i];

        if ('([{'.includes(ch)) {
          i++;
          const interno = parseGrupo();
          const mult = lerNumero();
          for (const el in interno) add(el, interno[el] * mult);
          continue;
        }

        if (')]}'.includes(ch)) {
          i++;
          return mapa;
        }

        if (/[A-Z]/.test(ch)) {
          let el = ch;
          i++;
          if (i < seg.length && /[a-z]/.test(seg[i])) el += seg[i++];
          const qtd = lerNumero();
          add(el, qtd);
          continue;
        }

        if (/\d/.test(ch)) {
          throw new Error('Número inválido.');
        }

        throw new Error(`Caractere inválido: ${ch}`);
      }

      return mapa;
    };

    const coef = lerNumero();
    const base = parseGrupo();
    for (const el in base) base[el] *= coef;

    return base;
  }

  parseFormula(formula: string): { contagens: Record<string, number>; ordem: string[] } {
    const segmentos = this.splitSegmentos(formula);
    const contagens: Record<string, number> = {};

    for (const seg of segmentos) {
      const res = this.parseSegmento(seg);
      for (const el in res) {
        contagens[el] = (contagens[el] || 0) + res[el];
      }
    }

    const ordem = Object.keys(contagens);
    return { contagens, ordem };
  }

  validarFormula(valor: string): string {
    const f = this.normalizarFormula(valor);
    if (!f) return 'Fórmula vazia.';
    if (!/^[A-Za-z0-9()[\]{}·]+$/.test(f)) return 'Caracteres inválidos.';

    try {
      this.parseFormula(f);
      return '';
    } catch (e: any) {
      return e.message || 'Fórmula química inválida.';
    }
  }

  calcularMassaMolar(formula: string): ResultadoMassaMolar {
    const parsed = this.parseFormula(formula);
    let total = 0;
    const linhas = parsed.ordem.map(simbolo => {
      const el = this.quimicaService.elementosPorSimbolo.get(simbolo.toLowerCase());
      const quantidade = parsed.contagens[simbolo];
      const massaAtomica = el ? Number(el.massa_molar) || 0 : 0;
      const subtotal = quantidade * massaAtomica;
      total += subtotal;
      return {
        simbolo,
        nome: el?.nome || simbolo,
        quantidade,
        massaAtomica,
        subtotal,
        percentual: 0
      };
    });

    linhas.forEach(linha => {
      linha.percentual = total > 0 ? (linha.subtotal / total) * 100 : 0;
    });

    return {
      formula,
      formulaHTML: this.formatarFormulaHTML(formula),
      total,
      linhas
    };
  }

  converterMolMassa(formula: string, valor: number, isMolParaMassa: boolean): ResultadoConversao {
    const calc = this.calcularMassaMolar(formula);
    const massaMolar = calc.total;
    const saida = isMolParaMassa ? valor * massaMolar : valor / massaMolar;

    const formulaTag = `<span class="conversormolmassa_tag-formula">${calc.formulaHTML}</span>`;
    const formatNum = (v: number) => Number(v.toFixed(4)).toString();
    const formatFix = (v: number) => v.toFixed(4);

    const substituicao = isMolParaMassa
      ? `${formatNum(valor)} mol × ${formatFix(massaMolar)} g/mol = <strong>${formatNum(saida)} g</strong>`
      : `${formatNum(valor)} g ÷ ${formatFix(massaMolar)} g/mol = <strong>${formatNum(saida)} mol</strong>`;

    const passos = [
      `Calcule a massa molar de ${formulaTag}: <strong>${formatFix(massaMolar)} g/mol</strong>.`,
      `Aplique a relação <strong>${isMolParaMassa ? 'massa = mol × massa molar' : 'mol = massa ÷ massa molar'}</strong>.`,
      `Substitua os valores: ${substituicao}.`
    ];

    return {
      formula,
      formulaHTML: calc.formulaHTML,
      massaMolar,
      entrada: valor,
      saida,
      isMolParaMassa,
      passos
    };
  }
}
