import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { PontoWidget } from './PontoWidget';
import { lerPontoProximo } from '../services/widgetStorage';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const dados = await lerPontoProximo();
      props.renderWidget(<PontoWidget dados={dados} />);
      break;
    }
    default:
      break;
  }
}
