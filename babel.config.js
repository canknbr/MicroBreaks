module.exports = function (api) {
  api.cache(true);

  const isProduction =
    process.env.BABEL_ENV === 'production' || process.env.NODE_ENV === 'production';

  const plugins = ['react-native-reanimated/plugin'];

  if (isProduction) {
    // Strip console.* in production bundles so debug noise and any accidentally
    // logged PII does not ship to App Store / Play Store builds. Tests and dev
    // builds keep console output for diagnostics. console.error is preserved
    // so unhandled errors still surface to Crashlytics breadcrumbs.
    plugins.unshift(['transform-remove-console', { exclude: ['error'] }]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
