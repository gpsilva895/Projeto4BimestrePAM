import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

import pontosJson from './src/data/pontos.json';
import { Categoria, Ponto } from './src/types';
import { distanciaMetros, formatarDistancia } from './src/utils/haversine';
import { useShake } from './src/hooks/useShake';
import {
  configurarNotificacoes,
  notificarCuriosidade,
} from './src/services/notificacoes';
import { salvarPontoProximo } from './src/services/widgetStorage';
import { atualizarWidget } from './src/widget/atualizarWidget';

const PONTOS = pontosJson as Ponto[];

const ESTILO_CATEGORIA: Record<Categoria, { emoji: string; cor: string }> = {
  museu: { emoji: '🏛️', cor: '#8E44AD' },
  parque: { emoji: '🌳', cor: '#27AE60' },
  monumento: { emoji: '🗿', cor: '#E67E22' },
};

const REGIAO_INICIAL = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export default function App() {
  const mapRef = useRef<MapView>(null);
  const notificados = useRef<Set<string>>(new Set());

  const [posicao, setPosicao] = useState<Location.LocationObjectCoords | null>(null);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  // Pontos com a distância até o usuário, ordenados do mais perto ao mais longe
  const pontosComDistancia = useMemo(() => {
    return PONTOS.map((p) => ({
      ...p,
      distancia: posicao
        ? distanciaMetros(posicao.latitude, posicao.longitude, p.latitude, p.longitude)
        : null,
    })).sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));
  }, [posicao]);

  const maisProximo = posicao ? pontosComDistancia[0] : null;
  const destaque =
    pontosComDistancia.find((p) => p.id === selecionadoId) ?? maisProximo;

  // 1) Permissões + acompanhamento do GPS
  useEffect(() => {
    let assinatura: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Ative a localização para usar o guia.');
        return;
      }
      await configurarNotificacoes();

      assinatura = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
        (loc) => setPosicao(loc.coords)
      );
    })();

    return () => assinatura?.remove();
  }, []);

  // 2) A cada nova posição: notificação por proximidade + widget
  useEffect(() => {
    if (!posicao || !maisProximo || maisProximo.distancia === null) return;

    // Notificação ao entrar no raio de um ponto (uma vez por ponto)
    pontosComDistancia.forEach((p) => {
      if (
        p.distancia !== null &&
        p.distancia <= p.raioMetros &&
        !notificados.current.has(p.id)
      ) {
        notificados.current.add(p.id);
        notificarCuriosidade(p);
      }
      // Saiu do raio: libera para notificar novamente numa próxima visita
      if (p.distancia !== null && p.distancia > p.raioMetros * 1.5) {
        notificados.current.delete(p.id);
      }
    });

    // Widget: guarda e atualiza o ponto mais próximo
    const dados = {
      nome: maisProximo.nome,
      categoria: maisProximo.categoria,
      foto: maisProximo.foto,
      distanciaMetros: maisProximo.distancia,
    };
    salvarPontoProximo(dados).then(() => atualizarWidget(dados));
  }, [posicao]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3) Sensor: agitar o celular centraliza um ponto aleatório
  const pontoAleatorio = useCallback(() => {
    const p = PONTOS[Math.floor(Math.random() * PONTOS.length)];
    setSelecionadoId(p.id);
    mapRef.current?.animateToRegion(
      {
        latitude: p.latitude,
        longitude: p.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );
  }, []);

  useShake(pontoAleatorio);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={REGIAO_INICIAL}
        showsUserLocation
        showsMyLocationButton
      >
        {PONTOS.map((p) => {
          const estilo = ESTILO_CATEGORIA[p.categoria];
          return (
            <React.Fragment key={p.id}>
              <Marker
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                onPress={() => setSelecionadoId(p.id)}
                tracksViewChanges={false}
              >
                <View style={[styles.pin, { backgroundColor: estilo.cor }]}>
                  <Text style={styles.pinEmoji}>{estilo.emoji}</Text>
                </View>
              </Marker>
              <Circle
                center={{ latitude: p.latitude, longitude: p.longitude }}
                radius={p.raioMetros}
                strokeColor={estilo.cor}
                fillColor={estilo.cor + '22'}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      <View style={styles.dica}>
        <Text style={styles.dicaTexto}>📳 Agite o celular para um ponto surpresa</Text>
      </View>

      {destaque && (
        <View style={styles.card}>
          <Image source={{ uri: destaque.foto }} style={styles.foto} />
          <View style={styles.cardInfo}>
            <Text style={styles.nome}>{destaque.nome}</Text>
            <Text style={styles.meta}>
              {ESTILO_CATEGORIA[destaque.categoria].emoji} {destaque.categoria}
              {destaque.distancia !== null && ` • ${formatarDistancia(destaque.distancia)}`}
            </Text>
            <Text style={styles.descricao} numberOfLines={3}>
              {destaque.descricao}
            </Text>
            <TouchableOpacity style={styles.botao} onPress={pontoAleatorio}>
              <Text style={styles.botaoTexto}>🎲 Ponto aleatório</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinEmoji: { fontSize: 18 },
  dica: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    backgroundColor: '#000000AA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dicaTexto: { color: '#fff', fontSize: 13 },
  card: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    elevation: 6,
  },
  foto: { width: 96, height: 96, borderRadius: 12, backgroundColor: '#ddd' },
  cardInfo: { flex: 1, marginLeft: 12 },
  nome: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  meta: { fontSize: 13, color: '#6B7280', marginVertical: 2, textTransform: 'capitalize' },
  descricao: { fontSize: 13, color: '#374151' },
  botao: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  botaoTexto: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
