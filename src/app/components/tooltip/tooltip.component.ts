import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      id="tooltip-global"
      role="tooltip"
      [attr.data-visible]="tooltipService.visible() ? 'true' : 'false'"
      [attr.aria-hidden]="!tooltipService.visible()"
      [style.top.px]="tooltipService.position().top"
      [style.left.px]="tooltipService.position().left"
      [innerHTML]="tooltipService.content()"
    ></div>
  `
})
export class TooltipComponent {
  tooltipService = inject(TooltipService);
}
