/**
 * Apple Targets configuration for the MicroBreaks Widget Extension.
 *
 * Read by @bacons/apple-targets during `expo prebuild`. The plugin
 * generates the Xcode Widget Extension target, wires the App Group
 * entitlement, and links the Swift files in this directory.
 *
 * App Group note:
 *   The widget reads its data from the shared UserDefaults suite
 *   `group.com.cankanbur.MicroBreaks`. The same group MUST be on the
 *   main app target's entitlements (configured in app.json under
 *   `ios.entitlements.com.apple.security.application-groups`).
 */
module.exports = {
  type: 'widget',
  name: 'MicroBreaksWidget',
  icon: '../../assets/images/icon.png',
  colors: {
    $accent: '#06FFA5',
    $widgetBackground: '#0B0E13',
  },
  entitlements: {
    'com.apple.security.application-groups': ['group.com.cankanbur.MicroBreaks'],
  },
  // 16.2 unlocks Live Activity frequent push updates (the timer needs
  // sub-second granularity in the last 10 seconds) and Dynamic Island.
  deploymentTarget: '16.2',
};
