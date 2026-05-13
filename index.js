/**
 * Ponto de entrada Expo + New Relic Mobile.
 * Expo managed com código nativo custom: rode `npx expo prebuild` antes de builds nativos.
 * @see https://docs.newrelic.com/docs/mobile-monitoring/new-relic-monitoring-react-native/monitor-your-react-native-application/
 */
import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import Constants from "expo-constants";
import NewRelic from "newrelic-react-native-agent";
import App from "./App";

const iosToken = Constants.expoConfig?.extra?.newRelicIosToken;
const androidToken = Constants.expoConfig?.extra?.newRelicAndroidToken;
const appToken =
  Platform.OS === "ios"
    ? iosToken
    : Platform.OS === "android"
      ? androidToken
      : null;

if (appToken) {
  const agentConfiguration = {
    analyticsEventEnabled: true,
    crashReportingEnabled: true,
    interactionTracingEnabled: true,
    networkRequestEnabled: true,
    networkErrorRequestEnabled: true,
    httpRequestBodyCaptureEnabled: false,
    loggingEnabled: __DEV__,
    logLevel: NewRelic.LogLevel.INFO,
    webViewInstrumentation: true,
    offlineStorageEnabled: true,
    fedRampEnabled: false,
    backgroundReportingEnabled: false,
    newEventSystemEnabled: false,
  };

  NewRelic.startAgent(appToken, agentConfiguration);
  NewRelic.setJSAppVersion(Constants.expoConfig?.version ?? "1.0.0");
}

registerRootComponent(App);
