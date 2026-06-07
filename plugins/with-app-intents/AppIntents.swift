// AppIntents.swift
//
// Siri Shortcuts + Spotlight + Action Button (iPhone 15 Pro+) entry
// points for MicroBreaks. App Intents must live in the main app target
// (NOT a widget / shortcut extension) so they can read the App Group
// the rest of the iOS surface writes to.
//
// Each intent persists a "pending shortcut" descriptor into the App
// Group UserDefaults and asks iOS to bring the app to the foreground.
// The JS-side `shortcutHandler` reads that descriptor on launch /
// foreground transition and routes the user to the right screen via
// expo-router. This is the most reliable pattern for App Intent →
// React Native app navigation; trying to call into the bridge from
// inside `perform()` is racy because the JS engine may not yet be live.

import AppIntents
import Foundation

// MARK: - App Group keys (must match modules/widget-bridge/ios/WidgetBridgeModule.swift)

private enum AppIntentConstants {
  static let appGroupId = "group.com.cankanbur.MicroBreaks"
  static let pendingShortcutKey = "@microbreaks/pending_shortcut"
}

private struct PendingShortcut: Codable {
  let action: String
  let payload: String?
  let requestedAt: Double // epoch ms
}

private func writePendingShortcut(action: String, payload: String? = nil) {
  guard let defaults = UserDefaults(suiteName: AppIntentConstants.appGroupId) else {
    return
  }
  let pending = PendingShortcut(
    action: action,
    payload: payload,
    requestedAt: Date().timeIntervalSince1970 * 1000
  )
  if let data = try? JSONEncoder().encode(pending),
     let json = String(data: data, encoding: .utf8) {
    defaults.set(json, forKey: AppIntentConstants.pendingShortcutKey)
    defaults.synchronize()
  }
}

// MARK: - StartBreakIntent

@available(iOS 16.0, *)
struct StartBreakIntent: AppIntent {
  static var title: LocalizedStringResource = "Start a Break"
  static var description = IntentDescription(
    "Begin a guided micro-break session. Pass a break type or leave it empty to use the recommendation."
  )
  static var openAppWhenRun: Bool = true

  @Parameter(
    title: "Break Type",
    description: "Optional. Pass an exercise id (e.g. eye-rest, neck-reset) or leave blank for the recommended break.",
    default: ""
  )
  var breakType: String

  static var parameterSummary: some ParameterSummary {
    Summary("Start a \(\.$breakType) break")
  }

  func perform() async throws -> some IntentResult {
    let target = breakType.trimmingCharacters(in: .whitespacesAndNewlines)
    writePendingShortcut(
      action: "start-break",
      payload: target.isEmpty ? "recommended" : target
    )
    return .result()
  }
}

// MARK: - OpenStatsIntent

@available(iOS 16.0, *)
struct OpenStatsIntent: AppIntent {
  static var title: LocalizedStringResource = "Check My Recovery"
  static var description = IntentDescription("Open your recovery dashboard.")
  static var openAppWhenRun: Bool = true

  func perform() async throws -> some IntentResult {
    writePendingShortcut(action: "open-stats")
    return .result()
  }
}

// MARK: - StartBreathingIntent (one-tap focused intent)

@available(iOS 16.0, *)
struct StartBreathingIntent: AppIntent {
  static var title: LocalizedStringResource = "Quick Breathing"
  static var description = IntentDescription("Start a 1-minute breathing reset.")
  static var openAppWhenRun: Bool = true

  func perform() async throws -> some IntentResult {
    writePendingShortcut(action: "start-break", payload: "breathing-1min")
    return .result()
  }
}

// MARK: - AppShortcutsProvider

@available(iOS 16.0, *)
struct MicroBreaksAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: StartBreakIntent(),
      phrases: [
        "Start a break with \(.applicationName)",
        "Take a micro-break with \(.applicationName)",
        "Begin a recovery session with \(.applicationName)",
      ],
      shortTitle: "Start a Break",
      systemImageName: "leaf.fill"
    )
    AppShortcut(
      intent: StartBreathingIntent(),
      phrases: [
        "Start breathing with \(.applicationName)",
        "Quick breathing with \(.applicationName)",
      ],
      shortTitle: "Quick Breathing",
      systemImageName: "wind"
    )
    AppShortcut(
      intent: OpenStatsIntent(),
      phrases: [
        "Check my recovery in \(.applicationName)",
        "Show my breaks in \(.applicationName)",
      ],
      shortTitle: "Check Recovery",
      systemImageName: "chart.bar.fill"
    )
  }
}
