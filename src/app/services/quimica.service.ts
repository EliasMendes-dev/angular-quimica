import { Injectable, signal } from '@angular/core';
import { Elemento, Composto, PaulingElemento } from '../models/quimica.models';

const ALKALI_METALS = [3, 11, 19, 37, 55, 87];
const ALKALINE_EARTHS = [4, 12, 20, 38, 56, 88];
const TRANSITION_RANGES: [number, number][] = [
  [21, 30], [39, 48], [72, 80], [104, 112]
];
const P_BLOCK_METALS = [13, 31, 49, 81, 50, 82, 83, 84, 113, 114, 115, 116];
const NON_METALS = [1, 6, 7, 8, 15, 16, 34];
const HALOGENS = [9, 17, 35, 53, 85, 117];
const NOBLE_GASES = [2, 10, 18, 36, 54, 86, 118];
const METALLOIDS = [5, 14, 32, 33, 51, 52, 84, 85];

const CSS_LOOKUP: Record<string, string> = {
  'metal-alcalino': 'alcalino',
  'metal-alcalino-terroso': 'alcalino-terroso',
  'metal-pos-transicao': 'pos-transicao'
};

@Injectable({
  providedIn: 'root'
})
export class QuimicaService {
  elementos = signal<Elemento[]>([]);
  tabelaElementos = signal<Elemento[]>([]);
  elementosCarregados = signal<boolean>(false);

  elementosPorNumero = new Map<number, Elemento>();
  elementosPorSimbolo = new Map<string, Elemento>();
  elementosPorNome = new Map<string, Elemento>();

  grupos = Array.from({ length: 18 }, (_, i) => ({
    value: i + 1,
    col: i + 2
  }));

  periodos = Array.from({ length: 7 }, (_, i) => ({
    value: i + 1,
    row: i + 2
  }));

  readonly elementosComuns: string[] = [
    'H','He','Li','Be','B','C','N','O','F','Ne',
    'Na','Mg','Al','Si','P','S','Cl','Ar',
    'K','Ca','Fe','Cu','Zn','Ag','Au'
  ];

  readonly compostosComuns: Composto[] = [
    { formula: 'H2O', nome: 'Água' },
    { formula: 'CO2', nome: 'Dióxido de Carbono' },
    { formula: 'NaCl', nome: 'Cloreto de Sódio' },
    { formula: 'NH3', nome: 'Amônia' },
    { formula: 'CH4', nome: 'Metano' },
    { formula: 'H2SO4', nome: 'Ácido Sulfúrico' },
    { formula: 'CaCO3', nome: 'Carbonato de Cálcio' },
    { formula: 'Ca(OH)2', nome: 'Hidróxido de Cálcio' },
    { formula: 'C6H12O6', nome: 'Glicose' }
  ];

  readonly tecladoTeclas: string[] = ['(', ')', '[', ']', '{', '}', '·', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  readonly categoriasFiltro = [
    { id: 'metal-alcalino', nome: 'Metal alcalino' },
    { id: 'metal-alcalino-terroso', nome: 'Metal alcalino-terroso' },
    { id: 'lantanideo', nome: 'Lantanídeo' },
    { id: 'actinideo', nome: 'Actinídeo' },
    { id: 'metal-transicao', nome: 'Metal de transição' },
    { id: 'metal-pos-transicao', nome: 'Metal pós-transição' },
    { id: 'metaloide', nome: 'Metaloides' },
    { id: 'nao-metal', nome: 'Não metais' },
    { id: 'halogenio', nome: 'Halogênios' },
    { id: 'gas-nobre', nome: 'Gás nobre' }
  ];

  readonly topPauling: PaulingElemento[] = [
    { simbolo: 'F', nome: 'Flúor', valor: '3.98', classe: 'fluor' },
    { simbolo: 'O', nome: 'Oxigênio', valor: '3.44', classe: 'oxigenio' },
    { simbolo: 'Cl', nome: 'Cloro', valor: '3.16', classe: 'cloro' },
    { simbolo: 'N', nome: 'Nitrogênio', valor: '3.04', classe: 'nitrogenio' },
    { simbolo: 'Br', nome: 'Bromo', valor: '2.96', classe: 'bromo' },
    { simbolo: 'I', nome: 'Iodo', valor: '2.66', classe: 'iodo' },
    { simbolo: 'S', nome: 'Enxofre', valor: '2.58', classe: 'enxofre' },
    { simbolo: 'C', nome: 'Carbono', valor: '2.55', classe: 'carbono' },
    { simbolo: 'P', nome: 'Fósforo', valor: '2.19', classe: 'fosforo' }
  ];

  constructor() {
    this.carregarDados();
  }

  async carregarDados(): Promise<void> {
    if (this.elementosCarregados()) return;

    try {
      const resp = await fetch('/data/elementos.json');
      if (!resp.ok) throw new Error('Não foi possível carregar elementos.json');
      const dados: Elemento[] = await resp.json();

      dados.forEach(el => {
        if (el.numero !== null && el.numero !== undefined) {
          this.elementosPorNumero.set(Number(el.numero), el);
        }
        if (el.simbolo) {
          this.elementosPorSimbolo.set(el.simbolo.toLowerCase(), el);
        }
        if (el.nome) {
          this.elementosPorNome.set(this.normalizarTexto(el.nome), el);
        }
      });

      this.elementos.set(dados);
      this.construirTabela(dados);
      this.elementosCarregados.set(true);
    } catch (e) {
      console.error('Erro ao carregar banco de elementos:', e);
    }
  }

  private construirTabela(dados: Elemento[]): void {
    const elementosConstruidos: Elemento[] = dados.map(e => {
      const num = Number(e.numero);
      let row = this.computeRow(num);
      let isFblock = false;
      let series: string | null = null;
      const grupoValor = this.normalizarValor(e.grupo);

      if (num >= 57 && num <= 71) {
        row = 8;
        isFblock = true;
        series = 'lanth';
      } else if (num >= 89 && num <= 103) {
        row = 9;
        isFblock = true;
        series = 'act';
      }

      let col: number;
      if (isFblock) {
        const base = series === 'lanth' ? 56 : 88;
        col = num - base + 3;
      } else {
        col = parseInt(grupoValor, 10);
      }
      col += 1;

      const category = this.classifyElement(num);
      const cssVar = 'categoria-' + (CSS_LOOKUP[category] || category);
      const periodoValor = this.normalizarValor(e.periodo)
        || (isFblock ? (series === 'lanth' ? '6' : '7') : String(this.computeRow(num)));
      const blocoValor = this.normalizarValor(e.bloco) || this.inferirBloco(grupoValor, isFblock);
      const camadasTexto = Array.isArray(e.camadas) ? e.camadas.join(',') : this.normalizarValor(e.camadas);
      const configuracaoValor = this.normalizarValor(e.configuracao_eletronica)
        || (camadasTexto ? `Camadas: ${camadasTexto}` : '');

      return {
        ...e,
        row,
        col,
        gridRow: (row || 1) + 1,
        gridCol: col,
        cssVar,
        isFblock,
        series,
        category,
        grupo: grupoValor,
        periodo: periodoValor,
        bloco: blocoValor,
        configuracao_eletronica: configuracaoValor,
        extraClass: ''
      };
    });

    // Placeholders f-block
    elementosConstruidos.push({
      numero: null,
      simbolo: '57-71\n*',
      nome: '',
      row: 6,
      col: 4,
      gridRow: 7,
      gridCol: 4,
      cssVar: 'categoria-lantanideo',
      category: 'lantanideo',
      extraClass: 'celulas-comeco-lact'
    });
    elementosConstruidos.push({
      numero: null,
      simbolo: '89-103\n**',
      nome: '',
      row: 7,
      col: 4,
      gridRow: 8,
      gridCol: 4,
      cssVar: 'categoria-actinideo',
      category: 'actinideo',
      extraClass: 'celulas-comeco-lact'
    });
    elementosConstruidos.push({
      numero: null,
      simbolo: '*',
      nome: '',
      row: 8,
      col: 4,
      gridRow: 9,
      gridCol: 4,
      cssVar: '',
      category: '',
      extraClass: 'celulas-listagem-lact'
    });
    elementosConstruidos.push({
      numero: null,
      simbolo: '**',
      nome: '',
      row: 9,
      col: 4,
      gridRow: 10,
      gridCol: 4,
      cssVar: '',
      category: '',
      extraClass: 'celulas-listagem-lact'
    });

    this.tabelaElementos.set(elementosConstruidos);
  }

  computeRow(numero: number): number | null {
    if (numero <= 2) return 1;
    if (numero <= 10) return 2;
    if (numero <= 18) return 3;
    if (numero <= 36) return 4;
    if (numero <= 54) return 5;
    if (numero <= 86) return 6;
    if (numero <= 118) return 7;
    return null;
  }

  classifyElement(numero: number): string {
    if (ALKALI_METALS.includes(numero)) return 'metal-alcalino';
    if (ALKALINE_EARTHS.includes(numero)) return 'metal-alcalino-terroso';
    if (numero >= 57 && numero <= 71) return 'lantanideo';
    if (numero >= 89 && numero <= 103) return 'actinideo';

    if (TRANSITION_RANGES.some(([a, b]) => numero >= a && numero <= b)) {
      return 'metal-transicao';
    }

    if (P_BLOCK_METALS.includes(numero)) return 'metal-pos-transicao';
    if (NON_METALS.includes(numero)) return 'nao-metal';
    if (HALOGENS.includes(numero)) return 'halogenio';
    if (NOBLE_GASES.includes(numero)) return 'gas-nobre';
    if (METALLOIDS.includes(numero)) return 'metaloide';

    return 'outro';
  }

  inferirBloco(grupo: string, isFblock: boolean): string {
    if (isFblock) return 'f';
    const g = parseInt(grupo, 10);
    if (!Number.isFinite(g)) return '';
    if (g <= 2) return 's';
    if (g >= 13) return 'p';
    return 'd';
  }

  normalizarValor(valor: any): string {
    if (valor === null || valor === undefined) return '';
    return String(valor).trim();
  }

  normalizarTexto(texto: string): string {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  formatarMassaCurta(valor: number): string {
    if (!Number.isFinite(valor)) return '--';
    if (valor < 10) return valor.toFixed(2);
    if (valor < 100) return valor.toFixed(1);
    return valor.toFixed(0);
  }

}
