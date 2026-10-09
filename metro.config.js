const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase's @firebase/* packages ship .cjs files.
config.resolver.sourceExts.push('cjs');

module.exports = config;
