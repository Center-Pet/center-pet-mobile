/**
 * Configuração Expo (substitui app.json).
 * New Relic (extra.*): em dev use .env* (NEW_RELIC_*); em EAS defina secrets de projeto
 * (ex.: eas secret:create) para injetar no build. Origem dos tokens: New Relic → Mobile → Settings.
 * @see https://docs.newrelic.com/docs/mobile-monitoring/new-relic-monitoring-react-native/monitor-your-react-native-application/
 */
module.exports = {
  expo: {
    name: "Center Pet Mobile",
    slug: "center-pet-mobile",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
      },
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission:
            "O app usa suas fotos para atualizar imagens de perfil (adotante e ONG).",
        },
      ],
      "newrelic-react-native-agent",
    ],
    web: {
      bundler: "metro",
    },
    extra: {
      newRelicIosToken: process.env.NEW_RELIC_IOS_APP_TOKEN || "",
      newRelicAndroidToken: process.env.NEW_RELIC_ANDROID_APP_TOKEN || "",
    },
  },
};
