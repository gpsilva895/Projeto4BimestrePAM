import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { PontoWidget } from './PontoWidget';
import { PontoProximoWidgetData } from '../types';

/** Pede ao Android para redesenhar o widget com os dados mais recentes. */
export async function atualizarWidget(dados: PontoProximoWidgetData) {
  if (Platform.OS !== 'android') return;
  try {
    await requestWidgetUpdate({
      widgetName: 'PontoProximo',
      renderWidget: () => <PontoWidget dados={dados} />,
      widgetNotFound: () => {},
    });
  } catch {
    // Sem Development Build (ex.: Expo Go) o módulo nativo não existe: ignoramos.
  }
}
