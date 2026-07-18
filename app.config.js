const fs = require('fs');
const path = require('path');

const baseConfig = require('./app.json');

const NOTIFICATION_ICON_PATH = './assets/images/android-icon-monochrome.png';
const PLACEHOLDER_PROJECT_ID = 'your-project-id';

// Firebase native config files. Drop the real files at the repo root (or
// point elsewhere via env). They are included only when present so a fresh
// clone still resolves config; scripts/validate-app-config.js blocks
// preview/production builds when they are missing.
const IOS_GOOGLE_SERVICES_PATH =
  process.env.GOOGLE_SERVICES_PLIST || './GoogleService-Info.plist';
const ANDROID_GOOGLE_SERVICES_PATH =
  process.env.GOOGLE_SERVICES_JSON || './google-services.json';

function fileExists(relativePath) {
  return fs.existsSync(path.resolve(__dirname, relativePath));
}

function trimEnvValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholderProjectId(value) {
  return !value || value.includes(PLACEHOLDER_PROJECT_ID);
}

function resolveProjectId(baseProjectId) {
  const envProjectId =
    trimEnvValue(process.env.EAS_PROJECT_ID) ||
    trimEnvValue(process.env.EXPO_PUBLIC_EAS_PROJECT_ID);

  if (envProjectId) {
    return envProjectId;
  }

  return isPlaceholderProjectId(baseProjectId) ? undefined : baseProjectId;
}

function resolveUpdatesUrl(baseUrl, projectId) {
  const envUpdatesUrl =
    trimEnvValue(process.env.EAS_UPDATE_URL) ||
    trimEnvValue(process.env.EXPO_PUBLIC_EAS_UPDATE_URL);

  if (envUpdatesUrl) {
    return envUpdatesUrl;
  }

  if (projectId) {
    return `https://u.expo.dev/${projectId}`;
  }

  return baseUrl && !baseUrl.includes(PLACEHOLDER_PROJECT_ID) ? baseUrl : undefined;
}

function patchPlugins(plugins) {
  return (plugins ?? []).map((plugin) => {
    if (!Array.isArray(plugin)) {
      return plugin;
    }

    if (plugin[0] === 'expo-notifications') {
      const [, pluginConfig = {}] = plugin;
      const { sounds: _sounds, ...restConfig } = pluginConfig;

      return [
        'expo-notifications',
        {
          ...restConfig,
          icon: NOTIFICATION_ICON_PATH,
        },
      ];
    }

    return plugin;
  });
}

module.exports = ({ config }) => {
  const baseExpoConfig = {
    ...baseConfig.expo,
    ...(config ?? {}),
  };

  const { locales: _locales, updates: baseUpdates, extra: baseExtra, ...restExpoConfig } =
    baseExpoConfig;
  const baseProjectId = baseExtra?.eas?.projectId;
  const resolvedProjectId = resolveProjectId(baseProjectId);
  const resolvedUpdatesUrl = resolveUpdatesUrl(baseUpdates?.url, resolvedProjectId);

  const nextExtra = {
    ...(baseExtra ?? {}),
    eas: {
      ...(baseExtra?.eas ?? {}),
      ...(resolvedProjectId ? { projectId: resolvedProjectId } : {}),
    },
  };

  if (!resolvedProjectId && nextExtra.eas) {
    delete nextExtra.eas.projectId;
  }

  const nextConfig = {
    ...restExpoConfig,
    plugins: patchPlugins(baseExpoConfig.plugins),
    extra: nextExtra,
  };

  if (resolvedUpdatesUrl) {
    nextConfig.updates = {
      ...(baseUpdates ?? {}),
      url: resolvedUpdatesUrl,
    };
  }

  if (fileExists(IOS_GOOGLE_SERVICES_PATH)) {
    nextConfig.ios = {
      ...(nextConfig.ios ?? {}),
      googleServicesFile: IOS_GOOGLE_SERVICES_PATH,
    };
  }

  if (fileExists(ANDROID_GOOGLE_SERVICES_PATH)) {
    nextConfig.android = {
      ...(nextConfig.android ?? {}),
      googleServicesFile: ANDROID_GOOGLE_SERVICES_PATH,
    };
  }

  return nextConfig;
};
