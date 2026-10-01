import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { TooltipService } from '../services/tooltip.service';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  private el = inject(ElementRef);
  private tooltipService = inject(TooltipService);

  @Input('appTooltip') tooltipKey: string = '';
  @Input() tooltipText: string = '';
  @Input() tooltipSource: string = '';

  @HostListener('mouseenter')
  @HostListener('focus')
  onMouseEnter(): void {
    this.tooltipService.show(
      this.el.nativeElement,
      this.tooltipKey,
      this.tooltipText,
      this.tooltipSource
    );
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  onMouseLeave(): void {
    this.tooltipService.hide();
  }
}
