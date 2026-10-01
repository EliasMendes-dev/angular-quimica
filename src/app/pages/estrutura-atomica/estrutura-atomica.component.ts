import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuimicaService } from '../../services/quimica.service';
import { Elemento } from '../../models/quimica.models';
import { CommonElementsComponent } from '../../components/shared/common-elements/common-elements.component';

interface OrbitaInfo {
  tamanho: number;
  zIndex: number;
  eletrons: Array<{ angulo: number; raio: number; cor: string }>;
}

interface PaulingLinha {
  nivelSubnivel: string;
  eletronsNumero: number;
  orbitais: Array<{ up: boolean; down: boolean }>;
}

@Component({
  selector: 'app-estrutura-atomica',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonElementsComponent],
  templateUrl: './estrutura-atomica.component.html',
  styleUrl: './estrutura-atomica.component.css'
})
export class EstruturaAtomicaComponent {
  quimicaService = inject(QuimicaService);

  elementoSelecionado = signal<Elemento | null>(null);
  searchTerm = signal<string>('');
  isSearchOpen = signal<boolean>(false);

  searchResults = computed(() => {
    const termo = this.searchTerm().trim();
    if (!termo) return [];
    const norm = this.quimicaService.normalizarTexto(termo);
    return this.quimicaService.elementos().filter(e => {
      const nome = this.quimicaService.normalizarTexto(e.nome);
      const simbolo = this.quimicaService.normalizarTexto(e.simbolo);
      const numero = String(e.numero);
      return nome.includes(norm) || simbolo.includes(norm) || numero.startsWith(norm);
    }).slice(0, 12);
  });

  protons = computed(() => {
    const el = this.elementoSelecionado();
    return el && el.numero !== null ? el.numero.toString() : '-';
  });

  neutrons = computed(() => {
    const el = this.elementoSelecionado();
    if (!el || el.numero === null || !el.massa_molar) return '-';
    const num = Number(el.numero);
    const massa = Number(el.massa_molar);
    if (!Number.isFinite(num) || !Number.isFinite(massa)) return '-';
    return Math.max(0, Math.round(massa) - num).toString();
  });

  eletrons = computed(() => {
    return this.protons();
  });

  configAbreviadaHTML = computed(() => {
    const el = this.elementoSelecionado();
    if (!el || !el.configuracao_eletronica) return '--';
    return this.quimicaService.formatarConfiguracaoHTML(el.configuracao_eletronica);
  });

  configExpandidaHTML = computed(() => {
    const el = this.elementoSelecionado();
    if (!el || !el.configuracao_eletronica) return '--';
    const exp = this.quimicaService.expandirConfiguracao(el.configuracao_eletronica);
    return this.quimicaService.formatarConfiguracaoHTML(exp);
  });

  camadasArray = computed<number[]>(() => {
    const el = this.elementoSelecionado();
    if (!el || !el.camadas) return [];
    if (Array.isArray(el.camadas)) return el.camadas.map(Number);
    return String(el.camadas).split(',').map(s => Number(s.trim())).filter(Number.isFinite);
  });

  orbitas = computed<OrbitaInfo[]>(() => {
    const camadas = this.camadasArray();
    if (!camadas.length) return [];

    const total = camadas.length;
    const tamanhoMin = 90;
    const tamanhoMax = 220;
    const passo = total > 1 ? (tamanhoMax - tamanhoMin) / (total - 1) : 0;
    const cores = this.quimicaService.coresEletrons;

    return camadas.map((quantidade, index) => {
      const tamanho = Math.round(tamanhoMin + index * passo);
      const raio = tamanho / 2 - 10;
      const cor = cores[index % cores.length];
      const count = Number(quantidade) || 0;
      const eletrons = [];

      for (let i = 0; i < count; i++) {
        const angulo = (360 / count) * i;
        eletrons.push({ angulo, raio, cor });
      }

      return {
        tamanho,
        zIndex: index + 1,
        eletrons
      };
    });
  });

  paulingLinhas = computed<PaulingLinha[]>(() => {
    const el = this.elementoSelecionado();
    if (!el || !el.configuracao_eletronica) return [];

    const configExp = this.quimicaService.expandirConfiguracao(el.configuracao_eletronica);
    const contagens = this.quimicaService.parseConfiguracao(configExp || el.configuracao_eletronica);
    const ordem = this.quimicaService.ordemPauling.filter(chave => (contagens[chave] || 0) > 0);
    const extras = Object.keys(contagens).filter(
      chave => (contagens[chave] || 0) > 0 && !this.quimicaService.ordemPauling.includes(chave)
    );
    const lista = ordem.concat(extras);

    return lista.map(chave => {
      const match = chave.match(/(\d+)([spdf])/i);
      const subnivel = match ? match[2].toLowerCase() : 's';
      const totalOrbitais = this.quimicaService.orbitaisPorSubnivel[subnivel] || 1;
      const eletronsNumero = contagens[chave] || 0;

      const ocupacao = Array.from({ length: totalOrbitais }, () => 0);
      let restantes = eletronsNumero;

      // Hund's rule: first pass up
      for (let i = 0; i < totalOrbitais && restantes > 0; i++) {
        ocupacao[i]++;
        restantes--;
      }
      // Second pass down
      for (let i = 0; i < totalOrbitais && restantes > 0; i++) {
        ocupacao[i]++;
        restantes--;
      }

      const orbitais = ocupacao.map(q => ({
        up: q >= 1,
        down: q >= 2
      }));

      return {
        nivelSubnivel: chave,
        eletronsNumero,
        orbitais
      };
    });
  });

  valencia = computed(() => {
    const camadas = this.camadasArray();
    return camadas.length ? camadas[camadas.length - 1] : null;
  });

  letraValencia = computed(() => {
    const camadas = this.camadasArray();
    if (!camadas.length) return '';
    return this.quimicaService.letrasCamadas[camadas.length - 1] || '';
  });

  valenciaDots = computed(() => {
    const val = this.valencia();
    return Array.from({ length: 8 }, (_, i) => ({
      ativo: val !== null && i < val
    }));
  });

  valenciaTexto = computed(() => {
    const val = this.valencia();
    const camadas = this.camadasArray();
    if (val === null) return 'Selecione um elemento para ver os elétrons de valência.';

    let tendencia = '';
    const camadaUnica = camadas.length === 1 && val === 2;
    if (val === 8 || camadaUnica) {
      tendencia = 'Camada completa, baixa reatividade.';
    } else if (val === 4) {
      tendencia = 'Tendência a compartilhar 4 elétron(s) em ligações covalentes.';
    } else if (val > 4) {
      tendencia = `Tendência a ganhar ${8 - val} elétron(s) para formar ânion.`;
    } else if (val > 0) {
      tendencia = `Tendência a perder ${val} elétron(s) para formar cátion.`;
    }

    return `Elétrons na última camada: ${val}. ${tendencia}`.trim();
  });

  categoriaTexto = computed(() => {
    const el = this.elementoSelecionado();
    if (!el) return '--';
    const cat = el.categoria_filtro || el.category || '';
    const map: Record<string, string> = {
      'metal-alcalino': 'Metal alcalino',
      'metal-alcalino-terroso': 'Metal alcalino-terroso',
      'metal-transicao': 'Metal de transição',
      'metal-pos-transicao': 'Metal pós-transição',
      'metaloide': 'Metaloide',
      'nao-metal': 'Não metal',
      'halogenio': 'Halogênio',
      'gas-nobre': 'Gás nobre',
      'lantanideo': 'Lantanídeo',
      'actinideo': 'Actinídeo',
      'outro': 'Outro'
    };
    return map[cat] || cat || '--';
  });

  massaFormatada = computed(() => {
    const el = this.elementoSelecionado();
    if (!el || !el.massa_molar) return '--';
    const num = Number(el.massa_molar);
    if (!Number.isFinite(num)) return '--';
    const texto = num < 10 ? num.toFixed(3) : num < 100 ? num.toFixed(2) : num.toFixed(1);
    return `${texto} ${el.massa_molar_unidade || 'u'}`;
  });

  selecionarElemento(el: Elemento): void {
    this.elementoSelecionado.set(el);
    this.searchTerm.set('');
    this.isSearchOpen.set(false);
  }

  selecionarPorSimbolo(simbolo: string): void {
    const el = this.quimicaService.elementosPorSimbolo.get(simbolo.toLowerCase());
    if (el) {
      this.selecionarElemento(el);
    }
  }

  onSearchInput(val: string): void {
    this.searchTerm.set(val);
    this.isSearchOpen.set(val.trim().length > 0);
  }

  onSearchFocus(): void {
    if (this.searchTerm().trim().length > 0) {
      this.isSearchOpen.set(true);
    }
  }
}
