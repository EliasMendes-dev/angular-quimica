import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfiguracaoEletronicaService } from './configuracao-eletronica.service';
import { FormulaQuimicaService } from './formula-quimica.service';
import { QuimicaService } from './quimica.service';

describe('FormulaQuimicaService', () => {
  let service: FormulaQuimicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: QuimicaService,
        useValue: {
          elementosPorSimbolo: new Map([
            ['h', { nome: 'Hidrogênio', massa_molar: 1.008 }],
            ['o', { nome: 'Oxigênio', massa_molar: 15.999 }],
            ['ca', { nome: 'Cálcio', massa_molar: 40.078 }]
          ])
        }
      }]
    });
    service = TestBed.inject(FormulaQuimicaService);
  });

  it('parses grouped formulas and hydrate segments', () => {
    expect(service.parseFormula('Ca(OH)2')).toEqual({
      contagens: { Ca: 1, O: 2, H: 2 },
      ordem: ['Ca', 'O', 'H']
    });
    expect(service.parseFormula('CuSO4·5H2O').contagens).toEqual({
      Cu: 1,
      S: 1,
      O: 9,
      H: 10
    });
  });

  it('calculates molar mass and converts moles to mass', () => {
    expect(service.calcularMassaMolar('H2O').total).toBeCloseTo(18.015, 3);
    expect(service.converterMolMassa('H2O', 2, true).saida).toBeCloseTo(36.03, 2);
  });

  it('normalizes, formats, and validates formulas', () => {
    expect(service.normalizarFormula(' FeSO4.7H2O ')).toBe('FeSO4·7H2O');
    expect(service.formatarFormulaHTML('H2O')).toBe('H<sub>2</sub>O');
    expect(service.validarFormula('H2O')).toBe('');
    expect(service.validarFormula('H2O+')).toBe('Caracteres inválidos.');
  });
});

describe('ConfiguracaoEletronicaService', () => {
  let service: ConfiguracaoEletronicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracaoEletronicaService);
  });

  it('expands noble-gas notation and parses sublevels', () => {
    const expanded = service.expandirConfiguracao('[Ar] 4s2 3d10');
    expect(expanded).toBe('1s2 2s2 2p6 3s2 3p6 4s2 3d10');
    expect(service.parseConfiguracao(expanded)).toEqual({
      '1s': 2,
      '2s': 2,
      '2p': 6,
      '3s': 2,
      '3p': 6,
      '4s': 2,
      '3d': 10
    });
  });
});
