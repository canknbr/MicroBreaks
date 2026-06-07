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
#if canImport(ActivityKit)
import ActivityKit
#endif

// MARK: - BreakActivityAttributes (mirror of the widget-target type)
//
// ActivityKit identifies a Live Activity by its `ActivityAttributes`
// Swift type. The widget extension declares its own copy of this struct
// inside `targets/widget/BreakLiveActivity.swift`; both definitions must
// stay byte-compatible (same field names + types) so the activity the
// main app requests is the same activity the widget renders. Bump
// `version` in BOTH places when changing the shape.
#if canImport(ActivityKit)
@available(iOS 16.2, *)
public struct BreakActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public var timeRemainingSec: Int
    public var isPaused: Bool
    public var progress: Double
    public var stepLabel: String?
  }

  public let breakId: String
  public let title: String
  public let icon: String
  public let colorHex: String
  public let totalSeconds: Int
}
#endif

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

    // MARK: - Live Activity (iOS 16.2+)
    //
    // The JS side never imports ActivityKit. The bridge accepts a small
    // shape and constructs the `Activity.request` / `update` / `end`
    // calls itself, returning the system-assigned activity ID (or empty
    // string on failure) so the JS side can track the active activity.

    /// Start a Live Activity for an in-progress break. Returns the
    /// activity ID on success, an empty string on any failure (system
    /// throttle, user disabled activities, iOS < 16.2). Never throws.
    AsyncFunction("startBreakActivity") { (params: [String: Any]) -> String in
      if #available(iOS 16.2, *) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled,
              let breakId = params["breakId"] as? String,
              let title = params["title"] as? String,
              let icon = params["icon"] as? String,
              let colorHex = params["colorHex"] as? String,
              let totalSeconds = params["totalSeconds"] as? Int,
              let timeRemainingSec = params["timeRemainingSec"] as? Int,
              let isPaused = params["isPaused"] as? Bool,
              let progress = params["progress"] as? Double else {
          return ""
        }

        let attributes = BreakActivityAttributes(
          breakId: breakId,
          title: title,
          icon: icon,
          colorHex: colorHex,
          totalSeconds: totalSeconds
        )
        let contentState = BreakActivityAttributes.ContentState(
          timeRemainingSec: timeRemainingSec,
          isPaused: isPaused,
          progress: progress,
          stepLabel: params["stepLabel"] as? String
        )

        do {
          let activity = try Activity.request(
            attributes: attributes,
            content: .init(state: contentState, staleDate: nil),
            pushType: nil
          )
          return activity.id
        } catch {
          return ""
        }
      }
      return ""
    }

    /// Update an in-progress Live Activity. The JS bridge holds the
    /// activity ID returned by `startBreakActivity`. A missing / ended
    /// activity is treated as a no-op so a race between session-end
    /// and a stale timer tick does not error.
    AsyncFunction("updateBreakActivity") { (params: [String: Any]) -> Void in
      if #available(iOS 16.2, *) {
        guard let activityId = params["activityId"] as? String,
              let timeRemainingSec = params["timeRemainingSec"] as? Int,
              let isPaused = params["isPaused"] as? Bool,
              let progress = params["progress"] as? Double else {
          return
        }

        guard let activity = Activity<BreakActivityAttributes>.activities
          .first(where: { $0.id == activityId }) else {
          return
        }

        let contentState = BreakActivityAttributes.ContentState(
          timeRemainingSec: timeRemainingSec,
          isPaused: isPaused,
          progress: progress,
          stepLabel: params["stepLabel"] as? String
        )

        Task {
          await activity.update(
            ActivityContent(state: contentState, staleDate: nil)
          )
        }
      }
    }

    /// End an in-progress Live Activity. Optional `final` state freezes
    /// the activity on a "done!" frame before the dismissal policy
    /// removes it. `dismissalSeconds` controls how long the user sees
    /// the final frame; 0 = immediate.
    AsyncFunction("endBreakActivity") { (params: [String: Any]) -> Void in
      if #available(iOS 16.2, *) {
        guard let activityId = params["activityId"] as? String,
              let activity = Activity<BreakActivityAttributes>.activities
                .first(where: { $0.id == activityId }) else {
          return
        }

        let dismissalSeconds = params["dismissalSeconds"] as? Double ?? 0
        let policy: ActivityUIDismissalPolicy = dismissalSeconds > 0
          ? .after(Date().addingTimeInterval(dismissalSeconds))
          : .immediate

        // Allow the JS side to push a "complete" frame before the
        // activity tears down.
        let finalState: BreakActivityAttributes.ContentState
        if let timeRemainingSec = params["timeRemainingSec"] as? Int,
           let isPaused = params["isPaused"] as? Bool,
           let progress = params["progress"] as? Double {
          finalState = BreakActivityAttributes.ContentState(
            timeRemainingSec: timeRemainingSec,
            isPaused: isPaused,
            progress: progress,
            stepLabel: params["stepLabel"] as? String
          )
        } else {
          finalState = BreakActivityAttributes.ContentState(
            timeRemainingSec: 0,
            isPaused: false,
            progress: 1.0,
            stepLabel: "Done"
          )
        }

        Task {
          await activity.end(
            ActivityContent(state: finalState, staleDate: nil),
            dismissalPolicy: policy
          )
        }
      }
    }

    /// True when the user has Live Activities enabled in Settings. The
    /// JS side checks this before showing the "Start break with Live
    /// Activity" UI so a disabled user does not see a dead path.
    Function("areActivitiesEnabled") { () -> Bool in
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    // MARK: - Pending Shortcut handoff
    //
    // App Intents (Siri / Spotlight / Action Button) cannot reach the JS
    // bridge directly — the intent's `perform()` runs before the React
    // Native runtime is reliably alive. Instead, the intent writes a
    // small "pending shortcut" descriptor into the App Group, and the
    // JS side reads + clears it on launch and on every foreground.

    /// Reads the most recent pending shortcut (or null). Does NOT clear
    /// it — call `clearPendingShortcut` after the JS side has routed.
    AsyncFunction("readPendingShortcut") { () -> [String: Any]? in
      guard let defaults = UserDefaults(suiteName: self.appGroupId),
            let raw = defaults.string(forKey: "@microbreaks/pending_shortcut"),
            let data = raw.data(using: .utf8),
            let parsed = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        return nil
      }
      return parsed
    }

    /// Clears the pending shortcut after the JS side has consumed it.
    /// Safe to call when nothing is pending.
    AsyncFunction("clearPendingShortcut") { () -> Void in
      guard let defaults = UserDefaults(suiteName: self.appGroupId) else { return }
      defaults.removeObject(forKey: "@microbreaks/pending_shortcut")
      defaults.synchronize()
    }
  }
}
