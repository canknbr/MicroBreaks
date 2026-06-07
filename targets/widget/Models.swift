// Models.swift — Swift mirror of the TS `WidgetSnapshot` shape.
//
// The Widget Extension reads its data from the App Group's shared
// UserDefaults under the key `WIDGET_SNAPSHOT_STORAGE_KEY`. The JS
// `widgetDataBridge` writes the same shape, schema-versioned so a
// shape change in the app does not crash the running widget.
//
// Keep this file in lock-step with `services/widgets/types.ts`.

import Foundation

// MARK: - Shared constants

enum WidgetConstants {
  static let appGroupId = "group.com.cankanbur.MicroBreaks"
  static let snapshotKey = "@microbreaks/widget_snapshot"
  static let supportedSchemaVersion = 1
}

// MARK: - Snapshot models

struct WidgetSnapshotToday: Codable, Hashable {
  let breaksTaken: Int
  let breaksGoal: Int
  let progressPct: Int
  let totalMinutes: Int
}

struct WidgetSnapshotStreak: Codable, Hashable {
  let current: Int
  let longest: Int
  let atRisk: Bool
}

struct WidgetSnapshotLastBreak: Codable, Hashable {
  /// Epoch ms (JS-native). Convert to `Date` via `Date(timeIntervalSince1970: ms / 1000)`.
  let completedAt: Double
  let title: String
  let icon: String
  let color: String

  var completedDate: Date {
    Date(timeIntervalSince1970: completedAt / 1000)
  }
}

struct WidgetSnapshotRecommendation: Codable, Hashable {
  let breakId: String
  let title: String
  let icon: String
  let color: String
  let durationMin: Int
  /// `microbreaks://break/<id>` — widget tap routes here.
  let deepLink: String
}

struct WidgetSnapshotUser: Codable, Hashable {
  let level: Int
  let name: String
}

struct WidgetSnapshot: Codable, Hashable {
  let schemaVersion: Int
  let generatedAt: Double
  let today: WidgetSnapshotToday
  let streak: WidgetSnapshotStreak
  let lastBreak: WidgetSnapshotLastBreak?
  let nextRecommended: WidgetSnapshotRecommendation?
  let user: WidgetSnapshotUser

  var generatedDate: Date {
    Date(timeIntervalSince1970: generatedAt / 1000)
  }

  // MARK: - Fallback used before the JS bridge has flushed once.
  static let empty = WidgetSnapshot(
    schemaVersion: WidgetConstants.supportedSchemaVersion,
    generatedAt: 0,
    today: WidgetSnapshotToday(breaksTaken: 0, breaksGoal: 4, progressPct: 0, totalMinutes: 0),
    streak: WidgetSnapshotStreak(current: 0, longest: 0, atRisk: false),
    lastBreak: nil,
    nextRecommended: nil,
    user: WidgetSnapshotUser(level: 1, name: "Friend")
  )

  // MARK: - Sample data used for Xcode previews + widget gallery thumbnails.
  static let sample = WidgetSnapshot(
    schemaVersion: WidgetConstants.supportedSchemaVersion,
    generatedAt: Date().timeIntervalSince1970 * 1000,
    today: WidgetSnapshotToday(breaksTaken: 2, breaksGoal: 4, progressPct: 50, totalMinutes: 8),
    streak: WidgetSnapshotStreak(current: 7, longest: 12, atRisk: false),
    lastBreak: WidgetSnapshotLastBreak(
      completedAt: (Date().timeIntervalSince1970 - 45 * 60) * 1000,
      title: "Eye Rescue",
      icon: "👁️",
      color: "#00E5FF"
    ),
    nextRecommended: WidgetSnapshotRecommendation(
      breakId: "neck-reset",
      title: "Neck Reset",
      icon: "🧘",
      color: "#FF9F1C",
      durationMin: 3,
      deepLink: "microbreaks://break/neck-reset"
    ),
    user: WidgetSnapshotUser(level: 4, name: "Ada")
  )
}

// MARK: - Loader

enum WidgetSnapshotLoader {
  /// Reads the latest snapshot the JS side flushed, falling back to
  /// `WidgetSnapshot.empty` if the App Group has nothing yet or the
  /// payload is unparseable. Never throws — a missing snapshot is an
  /// expected state on a fresh install.
  static func load() -> WidgetSnapshot {
    guard let defaults = UserDefaults(suiteName: WidgetConstants.appGroupId) else {
      return .empty
    }
    guard let raw = defaults.string(forKey: WidgetConstants.snapshotKey),
          let data = raw.data(using: .utf8) else {
      return .empty
    }
    do {
      let snapshot = try JSONDecoder().decode(WidgetSnapshot.self, from: data)
      // Reject unknown schema versions cleanly.
      guard snapshot.schemaVersion == WidgetConstants.supportedSchemaVersion else {
        return .empty
      }
      return snapshot
    } catch {
      return .empty
    }
  }
}

// MARK: - Color helpers

import SwiftUI

extension Color {
  /// Parses a `#RRGGBB` or `#RRGGBBAA` string into a `Color`. Returns
  /// `.gray` when the input is malformed — widgets should never crash
  /// on a bad colour string from the JS bridge.
  init(hex: String) {
    let trimmed = hex.trimmingCharacters(in: .whitespacesAndNewlines)
      .replacingOccurrences(of: "#", with: "")

    guard trimmed.count == 6 || trimmed.count == 8,
          let value = UInt64(trimmed, radix: 16) else {
      self = .gray
      return
    }

    let r, g, b, a: Double
    if trimmed.count == 6 {
      r = Double((value & 0xFF0000) >> 16) / 255.0
      g = Double((value & 0x00FF00) >> 8) / 255.0
      b = Double(value & 0x0000FF) / 255.0
      a = 1.0
    } else {
      r = Double((value & 0xFF000000) >> 24) / 255.0
      g = Double((value & 0x00FF0000) >> 16) / 255.0
      b = Double((value & 0x0000FF00) >> 8) / 255.0
      a = Double(value & 0x000000FF) / 255.0
    }
    self = Color(.sRGB, red: r, green: g, blue: b, opacity: a)
  }
}
