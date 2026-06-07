// WidgetBridgeModule.swift
//
// Native module that bridges the JS `widgetDataBridge` to the iOS App
// Group + WidgetKit. The JS side does its store aggregation, builds the
// `WidgetSnapshot`, and calls into here to (a) write the JSON payload
// into the shared UserDefaults suite the Widget Extension reads from,
// and (b) ask the OS to refresh widget timelines so the new snapshot
// shows up immediately.
//
// Failure mode: every async function returns a `Bool`/`Void` and never
// throws. Anything unexpected (suite missing, encoding failure) is
// surfaced as a `false` return so the JS side can log + carry on without
// crashing the running session.

import ExpoModulesCore
import WidgetKit

public class WidgetBridgeModule: Module {
  // The App Group identifier the main app and the widget both share.
  // Must stay in sync with:
  //   1. app.json → ios.entitlements.com.apple.security.application-groups
  //   2. targets/widget/expo-target.config.js → entitlements
  //   3. targets/widget/Models.swift → WidgetConstants.appGroupId
  private let appGroupId = "group.com.cankanbur.MicroBreaks"

  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    Constants([
      "appGroupId": appGroupId,
    ])

    /// Write the JSON snapshot to the App Group's shared UserDefaults
    /// under the given key. Returns true on success, false otherwise
    /// (suite unavailable, key empty, etc.). The widget reads the same
    /// key on its next timeline refresh.
    AsyncFunction("writeSnapshot") { (key: String, json: String) -> Bool in
      guard !key.isEmpty else { return false }
      guard let defaults = UserDefaults(suiteName: self.appGroupId) else {
        return false
      }
      defaults.set(json, forKey: key)
      // Persisting here is not strictly required (UserDefaults flushes
      // soon), but doing it explicitly means the widget gets the latest
      // bytes even if the host process is suspended seconds later.
      defaults.synchronize()
      return true
    }

    /// Tell the OS to refresh all of this app's widget timelines.
    /// No-op on platforms below iOS 14 (we deploy to 15.1 minimum, so
    /// the runtime guard is belt-and-braces).
    AsyncFunction("reloadTimelines") { () -> Void in
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }

    /// Refresh a single widget timeline by kind — used when only the
    /// home widget changed but the lock screen is fine, or vice versa.
    /// Currently optional; the JS side calls `reloadTimelines` today.
    AsyncFunction("reloadTimelinesForKind") { (kind: String) -> Void in
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadTimelines(ofKind: kind)
      }
    }
  }
}
