import { Injectable } from '@angular/core';

const CONFIG_EXPANSOES: Record<string, string> = {
  He: '1s2',
  Ne: '1s2 2s2 2p6',
  Ar: '1s2 2s2 2p6 3s2 3p6',
  Kr: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6',
  Cd: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2',
  Xe: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6',
  Hg: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2',
  Rn: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6',
  Og: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6 5f14 6d10 7s2 7p6'
};

@Injectable({ providedIn: 'root' })
export class ConfiguracaoEletronicaService {
  readonly ordemPauling: string[] = [
    '1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p',
    '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'
  ];

  readonly orbitaisPorSubnivel: Record<string, number> = {
    s: 1, p: 3, d: 5, f: 7
  };

  readonly letrasCamadas: string[] = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

  readonly coresEletrons: string[] = [
    'var(--texto-destaque)',
    'var(--categoria-metal-transicao)',
    'var(--categoria-halogenio)',
    'var(--categoria-alcalino)',
    'var(--categoria-gas-nobre)',
    'var(--categoria-metaloide)',
    'var(--categoria-pos-transicao)'
  ];

  expandirConfiguracao(configuracao: string): string {
    if (!configuracao) return '';
    return configuracao
      .replace(/\[(He|Ne|Ar|Kr|Xe|Rn|Og)\]/g, (match, gas) => CONFIG_EXPANSOES[gas] || match)
      .replace(/\s+/g, ' ')
      .trim();
  }

  formatarConfiguracaoHTML(texto: string): string {
    const limpo = String(texto || '').replace(/[^A-Za-z0-9\[\]\s().-]/g, '');
    return limpo.replace(/([spdf])(\d+)/gi, '$1<sup>$2</sup>');
  }

  parseConfiguracao(configuracao: string): Record<string, number> {
    if (!configuracao) return {};
    const tokens = configuracao
      .replace(/\([^)]*\)/g, '')
      .replace(/\[.*?\]/g, '')
      .match(/\d+[spdf]\d+/gi) || [];

    return tokens.reduce((acc, token) => {
      const match = token.match(/(\d+)([spdf])(\d+)/i);
      if (!match) return acc;
      const chave = `${match[1]}${match[2].toLowerCase()}`;
      const quantidade = Number(match[3]);
      if (!Number.isFinite(quantidade)) return acc;
      acc[chave] = (acc[chave] || 0) + quantidade;
      return acc;
    }, {} as Record<string, number>);
  }
}
