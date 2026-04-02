# Center Pet Mobile (React Native + Expo)

Este repositório foi migrado para **React Native** usando **Expo**.

## Requisitos

- Node.js 20+
- Expo Go no celular (Android/iOS) ou emulador configurado

## Configuracao de ambiente

O endpoint da API usa a variavel:

`EXPO_PUBLIC_API_URL`

Arquivos de exemplo ja existentes:

- `.env.development`
- `.env.test`
- `.env.production`

## Como rodar

```bash
npm install
npm run start
```

Depois:

- pressione `a` para Android
- pressione `i` para iOS
- ou escaneie o QR code com Expo Go

## Estrutura mobile nova

- `App.js` - entrada principal do app
- `src-mobile/navigation` - rotas do app
- `src-mobile/contexts` - contexto de autenticacao
- `src-mobile/screens` - telas React Native
- `src-mobile/services` - servicos HTTP e persistencia local

## Observacao

O codigo web antigo em `src/` foi mantido como legado para referencia durante a migracao gradual das demais telas.
