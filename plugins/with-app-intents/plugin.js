/**
 * Config plugin — adds the App Intents Swift file to the main iOS app
 * target on every `expo prebuild`.
 *
 * App Intents must live in the main app target (not a widget / shortcut
 * extension) so they can read from the App Group the rest of the iOS
 * surface writes to. @bacons/apple-targets does not (today) expose a
 * way to inject Swift files into the main target, so we do it
 * ourselves: copy the .swift file from this plugin folder into
 * `ios/<ProjectName>/`, then register it with the Xcode project.
 *
 * The plugin is idempotent — re-running `expo prebuild` updates the
 * Swift file in place and skips the project-add step if the file is
 * already registered.
 */

const fs = require('fs');
const path = require('path');
const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');

const SWIFT_SRC = 'AppIntents.swift';

const withAppIntents = (config) => {
  // Step 1 — copy the .swift file from this plugin folder into the
  // generated ios/<ProjectName>/ directory.
  config = withDangerousMod(config, [
    'ios',
    (modConfig) => {
      const projectName = modConfig.modRequest.projectName;
      if (!projectName) return modConfig;

      const src = path.join(__dirname, SWIFT_SRC);
      const destDir = path.join(modConfig.modRequest.platformProjectRoot, projectName);
      const dest = path.join(destDir, SWIFT_SRC);

      try {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
      } catch (err) {
        console.warn('[with-app-intents] copy failed:', err);
      }
      return modConfig;
    },
  ]);

  // Step 2 — register the file with the Xcode main app target's source
  // build phase. xcode (the npm package) lets us do this without
  // touching project.pbxproj as text.
  config = withXcodeProject(config, (modConfig) => {
    const xcode = modConfig.modResults;
    const projectName = modConfig.modRequest.projectName;
    if (!projectName) return modConfig;

    const filePath = `${projectName}/${SWIFT_SRC}`;

    // The `hasFile` check is the official idempotency guard.
    if (xcode.hasFile(filePath)) {
      return modConfig;
    }

    const groupKey = xcode.findPBXGroupKey({ name: projectName });
    if (!groupKey) {
      console.warn(`[with-app-intents] could not locate group ${projectName}`);
      return modConfig;
    }

    const firstTarget = xcode.getFirstTarget();
    if (!firstTarget || !firstTarget.uuid) {
      console.warn('[with-app-intents] could not locate main app target');
      return modConfig;
    }

    xcode.addSourceFile(filePath, { target: firstTarget.uuid }, groupKey);

    return modConfig;
  });

  return config;
};

module.exports = withAppIntents;
