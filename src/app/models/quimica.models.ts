export interface Elemento {
  numero: number | null;
  nome: string;
  simbolo: string;
  bloco?: string;
  periodo?: string;
  grupo?: string;
  massa_molar?: number | string;
  massa_molar_unidade?: string;
  estado_padrao?: string;
  raio_atomico?: string;
  energia_ionizacao?: string;
  afinidade_eletronica?: string;
  configuracao_eletronica?: string;
  eletronegatividade?: string | number;
  densidade?: number | string;
  densidade_unidade?: string;
  ponto_fusao?: number | string;
  ponto_fusao_unidade?: string;
  ponto_ebulicao?: number | string;
  ponto_ebulicao_unidade?: string;
  ano_descoberta?: string;
  descricao?: string;
  camadas?: number[] | string;
  categoria_filtro?: string;

  // Propriedades calculadas da tabela periódica
  row?: number | null;
  col?: number | null;
  gridRow?: number | null;
  gridCol?: number | null;
  cssVar?: string;
  category?: string;
  extraClass?: string;
  isFblock?: boolean;
  series?: string | null;
}

export interface Composto {
  formula: string;
  nome: string;
}

export interface FiltroCategoria {
  id: string;
  nome: string;
}

export interface LinhaMassaMolar {
  simbolo: string;
  nome: string;
  quantidade: number;
  massaAtomica: number;
  subtotal: number;
  percentual: number;
}

export interface ResultadoMassaMolar {
  formula: string;
  formulaHTML: string;
  total: number;
  linhas: LinhaMassaMolar[];
}

export interface ResultadoConversao {
  formula: string;
  formulaHTML: string;
  massaMolar: number;
  entrada: number;
  saida: number;
  isMolParaMassa: boolean;
  passos: string[];
}

export interface PaulingElemento {
  simbolo: string;
  nome: string;
  valor: string;
  classe: string;
}
