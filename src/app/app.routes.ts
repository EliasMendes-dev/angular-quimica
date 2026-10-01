import { Routes } from '@angular/router';
import { HubInicialComponent } from './pages/hub-inicial/hub-inicial.component';
import { TabelaPeriodicaComponent } from './pages/tabela-periodica/tabela-periodica.component';
import { MassaMolarComponent } from './pages/massa-molar/massa-molar.component';
import { ConversorMolMassaComponent } from './pages/conversor-mol-massa/conversor-mol-massa.component';
import { EstruturaAtomicaComponent } from './pages/estrutura-atomica/estrutura-atomica.component';
import { TopicosComponent } from './pages/topicos/topicos.component';
import { FerramentasComponent } from './pages/ferramentas/ferramentas.component';

export const routes: Routes = [
  { path: '', component: HubInicialComponent },
  { path: 'tabela', component: TabelaPeriodicaComponent },
  { path: 'massamolar', component: MassaMolarComponent },
  { path: 'conversormolmassa', component: ConversorMolMassaComponent },
  { path: 'estruturaatomica', component: EstruturaAtomicaComponent },
  { path: 'topicos', component: TopicosComponent },
  { path: 'ferramentas', component: FerramentasComponent },
  { path: '**', redirectTo: '' }
];
