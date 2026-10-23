import React from 'react';
import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';
import { PontoProximoWidgetData } from '../types';
import { formatarDistancia } from '../utils/haversine';

export function PontoWidget({ dados }: { dados: PontoProximoWidgetData | null }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 12,
      }}
    >
      {dados ? (
        <>
          <ImageWidget
            image={dados.foto as any}
            imageWidth={80}
            imageHeight={80}
            radius={12}
          />
          <FlexWidget style={{ flex: 1, marginLeft: 12 }}>
            <TextWidget
              text="Mais próximo de você"
              style={{ fontSize: 11, color: '#9CA3AF' }}
            />
            <TextWidget
              text={dados.nome}
              style={{ fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' }}
            />
            <TextWidget
              text={`${dados.categoria} • ${formatarDistancia(dados.distanciaMetros)}`}
              style={{ fontSize: 13, color: '#FBBF24' }}
            />
          </FlexWidget>
        </>
      ) : (
        <TextWidget
          text="Abra o app para localizar o ponto mais próximo"
          style={{ fontSize: 14, color: '#FFFFFF' }}
        />
      )}
    </FlexWidget>
  );
}
