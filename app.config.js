const baseConfig = require('./app.json');

const NOTIFICATION_ICON_PATH = './assets/images/android-icon-monochrome.png';
const PLACEHOLDER_PROJECT_ID = 'your-project-id';

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

  return nextConfig;
};
