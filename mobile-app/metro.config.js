const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const mapsWebShim = path.resolve(__dirname, "shims/react-native-maps.web.tsx");
const secureStoreWebShim = path.resolve(__dirname, "shims/expo-secure-store.web.js");

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      type: "sourceFile",
      filePath: mapsWebShim,
    };
  }

  if (platform === "web" && moduleName === "expo-secure-store") {
    return {
      type: "sourceFile",
      filePath: secureStoreWebShim,
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
