export type Categoria = 'museu' | 'parque' | 'monumento';

export interface Ponto {
  id: string;
  nome: string;
  categoria: Categoria;
  descricao: string;
  curiosidade: string;
  foto: string;
  latitude: number;
  longitude: number;
  raioMetros: number;
}

export interface PontoProximoWidgetData {
  nome: string;
  categoria: Categoria;
  foto: string;
  distanciaMetros: number;
}
