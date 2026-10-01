import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuimicaService } from '../../../services/quimica.service';

@Component({
  selector: 'app-chemical-keypad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chemical-keypad.component.html',
  styleUrl: './chemical-keypad.component.css'
})
export class ChemicalKeypadComponent {
  private quimicaService = inject(QuimicaService);
  teclas = this.quimicaService.tecladoTeclas;

  @Output() inserir = new EventEmitter<string>();
  @Output() apagar = new EventEmitter<void>();
  @Output() limpar = new EventEmitter<void>();

  onTeclaClick(tecla: string): void {
    this.inserir.emit(tecla);
  }

  onApagarClick(): void {
    this.apagar.emit();
  }

  onLimparClick(): void {
    this.limpar.emit();
  }
}
