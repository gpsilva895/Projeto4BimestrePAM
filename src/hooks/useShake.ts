import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

/**
 * Detecta o gesto de "agitar" o aparelho usando o acelerômetro.
 * Em repouso a força total é ~1g (gravidade). Acima do limite = chacoalhada.
 */
export function useShake(onShake: () => void, limite = 1.8) {
  const ultimo = useRef(0);
  const callback = useRef(onShake);
  callback.current = onShake;

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const forca = Math.sqrt(x * x + y * y + z * z);
      const agora = Date.now();
      if (forca > limite && agora - ultimo.current > 1200) {
        ultimo.current = agora;
        callback.current();
      }
    });
    return () => sub.remove();
  }, [limite]);
}
