// LockScreenWidget.swift — Lock Screen / accessory widget variants.
//
// iOS 16+ accessory families:
//   - accessoryCircular     (round complication, ~58×58)
//   - accessoryRectangular  (single-line block, ~150×72)
//   - accessoryInline       (status-bar-style text, monochrome)
//
// These are intentionally minimal — accessories are seen briefly, often
// in a glance. We surface the single most relevant signal:
//   * Streak day count (or "at-risk" warning), OR
//   * Today's progress percentage.

import SwiftUI
import WidgetKit

// MARK: - Circular

private struct CircularLockView: View {
  let entry: MicroBreaksEntry

  var body: some View {
    let progress = Double(max(0, min(100, entry.snapshot.today.progressPct))) / 100.0
    Gauge(value: progress) {
      Text("🔥")
    } currentValueLabel: {
      Text("\(entry.snapshot.streak.current)")
        .font(.system(size: 14, weight: .heavy, design: .rounded))
    }
    .gaugeStyle(.accessoryCircular)
    .widgetURL(URL(string: "microbreaks://home"))
  }
}

// MARK: - Rectangular

private struct RectangularLockView: View {
  let entry: MicroBreaksEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      HStack(spacing: 4) {
        Text("🔥")
        Text("\(entry.snapshot.streak.current)-day streak")
          .font(.system(size: 12, weight: .semibold, design: .rounded))
      }
      if entry.snapshot.streak.atRisk {
        Text("Take a break to keep it")
          .font(.system(size: 10, weight: .semibold))
      } else if let next = entry.snapshot.nextRecommended {
        Text("Next: \(next.title) • \(next.durationMin)m")
          .font(.system(size: 10, weight: .semibold))
          .lineLimit(1)
      } else {
        Text("\(entry.snapshot.today.breaksTaken)/\(entry.snapshot.today.breaksGoal) breaks today")
          .font(.system(size: 10, weight: .semibold))
      }
    }
    .widgetURL(URL(string: entry.snapshot.nextRecommended?.deepLink ?? "microbreaks://home"))
  }
}

// MARK: - Inline

private struct InlineLockView: View {
  let entry: MicroBreaksEntry

  var body: some View {
    if entry.snapshot.streak.atRisk {
      Text("🔥 \(entry.snapshot.streak.current)-day streak at risk")
    } else if entry.snapshot.streak.current > 0 {
      Text("🔥 \(entry.snapshot.streak.current)-day streak")
    } else if let next = entry.snapshot.nextRecommended {
      Text("Next break: \(next.title)")
    } else {
      Text("MicroBreaks ready")
    }
  }
}

// MARK: - Widget configuration

struct MicroBreaksLockScreenWidget: Widget {
  let kind: String = "MicroBreaksLockScreenWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: MicroBreaksProvider()) { entry in
      LockScreenRouter(entry: entry)
    }
    .configurationDisplayName("MicroBreaks Streak")
    .description("Your streak and next break, at a glance.")
    .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
  }
}

private struct LockScreenRouter: View {
  let entry: MicroBreaksEntry
  @Environment(\.widgetFamily) private var family

  var body: some View {
    switch family {
    case .accessoryCircular:
      CircularLockView(entry: entry)
    case .accessoryRectangular:
      RectangularLockView(entry: entry)
    case .accessoryInline:
      InlineLockView(entry: entry)
    default:
      InlineLockView(entry: entry)
    }
  }
}
