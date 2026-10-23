import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Ponto } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configurarNotificacoes(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pontos', {
      name: 'Pontos turísticos',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function notificarCuriosidade(ponto: Ponto) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📍 Você está perto: ${ponto.nome}`,
      body: ponto.curiosidade,
    },
    trigger: null, // dispara imediatamente
  });
}
