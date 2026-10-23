import AsyncStorage from '@react-native-async-storage/async-storage';
import { PontoProximoWidgetData } from '../types';

const CHAVE = '@guia/ponto_proximo';

export async function salvarPontoProximo(dados: PontoProximoWidgetData) {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(dados));
}

export async function lerPontoProximo(): Promise<PontoProximoWidgetData | null> {
  const raw = await AsyncStorage.getItem(CHAVE);
  return raw ? (JSON.parse(raw) as PontoProximoWidgetData) : null;
}
