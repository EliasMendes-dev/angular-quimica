import { Component, ElementRef, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuimicaService } from '../../services/quimica.service';
import { Elemento } from '../../models/quimica.models';
import { ElementCardComponent } from './element-card/element-card.component';
import { ElectronegativityCardComponent } from './electronegativity-card/electronegativity-card.component';

@Component({
  selector: 'app-tabela-periodica',
  standalone: true,
  imports: [CommonModule, FormsModule, ElementCardComponent, ElectronegativityCardComponent],
  templateUrl: './tabela-periodica.component.html',
  styleUrl: './tabela-periodica.component.css'
})
export class TabelaPeriodicaComponent {
  quimicaService = inject(QuimicaService);
  private elRef = inject(ElementRef);

  selectedElement = signal<Elemento | null>(null);
  hoveredElement = signal<Elemento | null>(null);
  activeFilter = signal<string | null>(null);
  hoverFilter = signal<string | null>(null);

  searchTerm = signal<string>('');
  isSearchOpen = signal<boolean>(false);

  currentElement = computed(() => {
    return this.selectedElement() || this.hoveredElement();
  });

  currentCor = computed(() => {
    const el = this.currentElement();
    if (!el) return '';
    const category = el.category
      || (el.numero !== null ? this.quimicaService.classifyElement(Number(el.numero)) : '');
    return this.getCategoriaCor(category);
  });

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

  getCategoriaCor(category?: string): string {
    if (!category) return '';
    const map: Record<string, string> = {
      'metal-alcalino': 'var(--categoria-alcalino)',
      'metal-alcalino-terroso': 'var(--categoria-alcalino-terroso)',
      'lantanideo': 'var(--categoria-lantanideo)',
      'actinideo': 'var(--categoria-actinideo)',
      'metal-transicao': 'var(--categoria-metal-transicao)',
      'metal-pos-transicao': 'var(--categoria-pos-transicao)',
      'metaloide': 'var(--categoria-metaloide)',
      'nao-metal': 'var(--categoria-nao-metal)',
      'halogenio': 'var(--categoria-halogenio)',
      'gas-nobre': 'var(--categoria-gas-nobre)',
      'outro': 'var(--categoria-outro)'
    };
    return map[category] || '';
  }

  isElementDimmed(el: Elemento): boolean {
    const filter = this.activeFilter() || this.hoverFilter();
    if (!filter) return false;
    return el.category !== filter;
  }

  onCellHover(el: Elemento): void {
    if (el.numero === null) return;
    if (!this.selectedElement()) {
      this.hoveredElement.set(el);
    }
  }

  onCellClick(el: Elemento): void {
    if (el.numero === null) return;
    if (this.selectedElement()?.numero === el.numero) {
      this.selectedElement.set(null);
    } else {
      this.selectedElement.set(el);
    }
  }

  onFilterEnter(catId: string): void {
    if (!this.activeFilter()) {
      this.hoverFilter.set(catId);
    }
  }

  onFilterLeave(): void {
    if (!this.activeFilter()) {
      this.hoverFilter.set(null);
    }
  }

  onFilterClick(catId: string): void {
    if (this.activeFilter() === catId) {
      this.activeFilter.set(null);
    } else {
      this.activeFilter.set(catId);
      this.hoverFilter.set(null);
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

  selectSearchResult(el: Elemento): void {
    this.selectedElement.set(el);
    this.searchTerm.set(el.nome);
    this.isSearchOpen.set(false);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.isSearchOpen.set(false);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentClick(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Se clicar fora do campo de busca, fecha dropdown
    if (!target.closest('.busca')) {
      this.isSearchOpen.set(false);
    }

    // Zonas seguras que não limpam a seleção
    const safe = target.closest('.celula-elemento, .busca, .filtro-item, .icone-aumentar, .maisinformacoes, app-element-card');
    if (!safe) {
      this.selectedElement.set(null);
      this.hoveredElement.set(null);
    }
  }
}
