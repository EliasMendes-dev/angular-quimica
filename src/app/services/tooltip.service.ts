import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  content = signal<string>('');
  visible = signal<boolean>(false);
  position = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  private definitions: Record<string, string> = {};
  private loadedSources = new Set<string>();

  async loadDefinitions(source: string): Promise<void> {
    if (this.loadedSources.has(source)) return;
    try {
      const response = await fetch(`/data/tooltips/${source}_tooltip.json`);
      if (response.ok) {
        const json = await response.json();
        if (json && typeof json === 'object') {
          Object.assign(this.definitions, json);
        }
      }
    } catch (e) {
      console.warn(`Erro ao carregar tooltips para ${source}:`, e);
    } finally {
      this.loadedSources.add(source);
    }
  }

  async show(target: HTMLElement, key?: string, fallbackText?: string, source?: string): Promise<void> {
    if (source && !this.loadedSources.has(source)) {
      await this.loadDefinitions(source);
    }

    const text = (key && this.definitions[key]) || fallbackText || target.getAttribute('title') || '';
    if (!text) return;

    this.content.set(text);
    this.visible.set(true);

    // Permitir atualização do DOM antes de calcular a posição
    setTimeout(() => {
      const tooltipEl = document.getElementById('tooltip-global');
      const tooltipWidth = tooltipEl?.offsetWidth || 220;
      const tooltipHeight = tooltipEl?.offsetHeight || 60;

      const rect = target.getBoundingClientRect();
      const topCalc = rect.top - tooltipHeight - 10;
      const top = topCalc < 10 ? rect.bottom + 10 : topCalc;
      const left = Math.min(
        window.innerWidth - tooltipWidth - 8,
        Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2)
      );

      this.position.set({ top, left });
    });
  }

  hide(): void {
    this.visible.set(false);
  }
}
