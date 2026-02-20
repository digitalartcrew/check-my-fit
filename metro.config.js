const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for Firebase JS SDK to work with Metro bundler.
// Firebase ships some modules as .cjs files which Metro doesn't handle by default.
// Also disable package exports to let Metro use the react-native field in
// @firebase/auth's package.json (dist/rn/index.js), which properly registers
// the auth component for React Native.
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
