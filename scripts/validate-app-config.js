#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const baseConfig = require(path.join(repoRoot, 'app.json'));
const appConfigFactory = require(path.join(repoRoot, 'app.config.js'));

function getArgValue(name) {
  const flag = `--${name}`;
  const matchedArg = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (matchedArg) {
    return matchedArg.slice(flag.length + 1);
  }

  const index = process.argv.indexOf(flag);
  if (index >= 0) {
    return process.argv[index + 1];
  }

  return undefined;
}

function normalizeProfile(rawProfile) {
  if (!rawProfile) {
    return 'development';
  }

  const profile = rawProfile.trim().toLowerCase();
  if (profile === 'prod') {
    return 'production';
  }

  return profile;
}

function isPlaceholder(value) {
  return typeof value !== 'string' || value.length === 0 || value.includes('your-project-id');
}

function toRepoRelativePath(assetPath) {
  return assetPath.replace(/^\.\//, '');
}

function assetExists(assetPath) {
  return fs.existsSync(path.join(repoRoot, toRepoRelativePath(assetPath)));
}

function assertAsset(assetPath, label, errors) {
  if (!assetPath) {
    return;
  }

  if (!assetExists(assetPath)) {
    errors.push(`${label} asset is missing: ${assetPath}`);
  }
}

function findPluginConfig(plugins, pluginName) {
  const plugin = (plugins ?? []).find((entry) => {
    if (Array.isArray(entry)) {
      return entry[0] === pluginName;
    }

    return entry === pluginName;
  });

  return Array.isArray(plugin) ? plugin[1] ?? {} : {};
}

const profile = normalizeProfile(getArgValue('profile') || process.env.APP_ENV);
const expoConfig = appConfigFactory({ config: baseConfig.expo });
const errors = [];
const warnings = [];

assertAsset(expoConfig.icon, 'App icon', errors);
assertAsset(expoConfig.web?.favicon, 'Web favicon', errors);
assertAsset(expoConfig.android?.adaptiveIcon?.foregroundImage, 'Android adaptive foreground', errors);
assertAsset(expoConfig.android?.adaptiveIcon?.backgroundImage, 'Android adaptive background', errors);
assertAsset(expoConfig.android?.adaptiveIcon?.monochromeImage, 'Android adaptive monochrome', errors);

const splashConfig = findPluginConfig(expoConfig.plugins, 'expo-splash-screen');
assertAsset(splashConfig.image, 'Splash image', errors);
assertAsset(splashConfig.dark?.image, 'Dark splash image', errors);

const notificationsConfig = findPluginConfig(expoConfig.plugins, 'expo-notifications');
assertAsset(notificationsConfig.icon, 'Notification icon', errors);

for (const [index, soundPath] of (notificationsConfig.sounds ?? []).entries()) {
  assertAsset(soundPath, `Notification sound #${index + 1}`, errors);
}

const projectId = expoConfig.extra?.eas?.projectId;
const updatesUrl = expoConfig.updates?.url;

if (profile !== 'development') {
  if (isPlaceholder(projectId)) {
    errors.push(
      'Resolved EAS projectId is missing for a non-development build. Set EAS_PROJECT_ID or EXPO_PUBLIC_EAS_PROJECT_ID.'
    );
  }

  if (isPlaceholder(updatesUrl)) {
    errors.push(
      'Resolved Expo updates URL is missing for a non-development build. Set EAS_UPDATE_URL or EXPO_PUBLIC_EAS_UPDATE_URL, or provide a valid projectId.'
    );
  }
}

if (projectId && updatesUrl) {
  const expectedUpdatesUrl = `https://u.expo.dev/${projectId}`;
  if (updatesUrl !== expectedUpdatesUrl) {
    warnings.push(
      `Expo updates URL does not match the resolved projectId. Expected ${expectedUpdatesUrl}, received ${updatesUrl}.`
    );
  }
}

const billingProvider = (process.env.EXPO_PUBLIC_BILLING_PROVIDER ?? '').trim();
const revenueCatIosApiKey = (process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '').trim();
const revenueCatAndroidApiKey = (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '').trim();
if (profile === 'production' && billingProvider === 'preview') {
  errors.push('Production builds cannot use EXPO_PUBLIC_BILLING_PROVIDER=preview.');
}

if (profile === 'production' && billingProvider !== 'revenuecat') {
  errors.push(
    'Production builds must set EXPO_PUBLIC_BILLING_PROVIDER=revenuecat. Billing-disabled or preview production builds are blocked.'
  );
}

if (profile === 'production' && revenueCatIosApiKey.length === 0) {
  errors.push('Production builds require EXPO_PUBLIC_REVENUECAT_IOS_API_KEY.');
}

if (profile === 'production' && revenueCatAndroidApiKey.length === 0) {
  errors.push('Production builds require EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY.');
}

const reportLines = [
  `Config validation profile: ${profile}`,
  `Resolved projectId: ${projectId ?? '<unset>'}`,
  `Resolved updates URL: ${updatesUrl ?? '<unset>'}`,
];

if (warnings.length > 0) {
  reportLines.push('', 'Warnings:');
  for (const warning of warnings) {
    reportLines.push(`- ${warning}`);
  }
}

if (errors.length > 0) {
  reportLines.push('', 'Errors:');
  for (const error of errors) {
    reportLines.push(`- ${error}`);
  }

  console.error(reportLines.join('\n'));
  process.exit(1);
}

reportLines.push('', 'Config validation passed.');
console.log(reportLines.join('\n'));
