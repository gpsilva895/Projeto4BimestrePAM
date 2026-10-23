# 🗺️ Guia Turístico e Histórico Interativo

**Disciplina:** PAM II — Curso Técnico em Desenvolvimento de Sistemas
**Equipe:** Gustavo Pires da Silva
**Tema:** Projeto 3 — Guia Turístico e Histórico Interativo

Aplicativo React Native (Expo) que mostra pontos turísticos de São Paulo no mapa, avisa com uma curiosidade histórica quando o usuário se aproxima de um deles e exibe o ponto mais próximo em um widget na tela inicial.

## Conceitos aplicados

| Conceito | Como foi usado | Arquivo |
|---|---|---|
| Localização e mapas | `react-native-maps` com marcadores por categoria (museu 🏛️, parque 🌳, monumento 🗿) e círculos de raio; `expo-location` acompanha o GPS | `App.tsx` |
| Notificações | `expo-notifications` dispara uma curiosidade ao entrar no raio de um ponto | `src/services/notificacoes.ts` |
| Widget | `react-native-android-widget` mostra foto e nome do ponto mais próximo | `src/widget/` |
| Sensor | `Accelerometer` (`expo-sensors`): agitar o celular centraliza um ponto aleatório | `src/hooks/useShake.ts` |

Os pontos ficam em `src/data/pontos.json` (sem banco externo). A distância é calculada pela fórmula de Haversine (`src/utils/haversine.ts`).

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   npx expo install --fix
   ```
2. Coloque sua chave do Google Maps em `app.json` (`android.config.googleMaps.apiKey`). Gere a chave no Google Cloud Console ativando a **Maps SDK for Android**.
3. Conecte um celular Android (depuração USB) ou abra um emulador e rode:
   ```bash
   npx expo run:android
   ```
4. Para o widget: segure a tela inicial do Android → *Widgets* → **Guia Turístico**.

## Como testar

- **Proximidade/notificação:** use um app de GPS falso (*Fake GPS*) ou o emulador (Extended Controls → Location) para colocar a posição perto de um ponto, por exemplo o MASP (`-23.5614, -46.6559`).
- **Agitar:** balance o celular. No emulador, use *Virtual sensors → Move* ou o botão "🎲 Ponto aleatório".
- **Widget:** depois que o app obtiver a localização, o widget é atualizado com o ponto mais próximo.

## Estrutura

```
App.tsx                      tela principal (mapa, card, lógica)
index.ts                     entrada: registra o app e o widget
src/data/pontos.json         pontos de interesse
src/utils/haversine.ts       cálculo de distância
src/hooks/useShake.ts        detecção de chacoalhada
src/services/                notificações e armazenamento do widget
src/widget/                  componente e handler do widget
```

## Observações

- As fotos em `pontos.json` são imagens de exemplo (picsum.photos). Troquem por fotos reais dos locais.
- O widget lê o último ponto salvo pelo app; ele atualiza quando o app recebe nova localização.
