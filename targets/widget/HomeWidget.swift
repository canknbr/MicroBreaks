// HomeWidget.swift — Home Screen widget views (small / medium / large).
//
// Composition order from least to most data-dense:
//   - Small (155×155):   Today's progress ring + streak badge.
//   - Medium (329×155):  Progress ring + the recommended next break.
//   - Large (329×345):   Progress + recommendation + last break + streak.
//
// Every view reads from the same WidgetSnapshot — never recompute,
// never network. The OS will kill us if we do.

import SwiftUI
import WidgetKit

// MARK: - Shared atoms

private struct WidgetContainer<Content: View>: View {
  let accent: Color
  let content: Content

  init(accent: Color, @ViewBuilder content: () -> Content) {
    self.accent = accent
    self.content = content()
  }

  var body: some View {
    ZStack {
      LinearGradient(
        colors: [Color(hex: "#13161D"), Color(hex: "#070A0F")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
      content
        .padding(14)
    }
    .containerBackground(for: .widget) {
      Color(hex: "#0B0E13")
    }
  }
}

private struct ProgressRing: View {
  let progressPct: Int
  let accent: Color
  var size: CGFloat = 64
  var lineWidth: CGFloat = 6

  var body: some View {
    let value = Double(progressPct.clamped(to: 0...100)) / 100.0
    ZStack {
      Circle()
        .stroke(Color.white.opacity(0.08), lineWidth: lineWidth)
      Circle()
        .trim(from: 0, to: value)
        .stroke(accent, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
        .rotationEffect(.degrees(-90))
      Text("\(progressPct)%")
        .font(.system(size: size * 0.27, weight: .bold, design: .rounded))
        .foregroundStyle(.white)
    }
    .frame(width: size, height: size)
  }
}

private struct StreakBadge: View {
  let streak: WidgetSnapshotStreak

  var body: some View {
    HStack(spacing: 4) {
      Text("🔥")
        .font(.system(size: 14))
      Text("\(streak.current)")
        .font(.system(size: 14, weight: .heavy, design: .rounded))
        .foregroundStyle(.white)
      if streak.atRisk {
        Text("at risk")
          .font(.system(size: 9, weight: .bold))
          .foregroundStyle(Color(hex: "#FFD166"))
      }
    }
    .padding(.horizontal, 8)
    .padding(.vertical, 4)
    .background(
      RoundedRectangle(cornerRadius: 8, style: .continuous)
        .fill(Color.white.opacity(0.06))
    )
  }
}

private struct RecommendationCard: View {
  let recommendation: WidgetSnapshotRecommendation
  let compact: Bool

  var body: some View {
    HStack(spacing: 10) {
      Text(recommendation.icon)
        .font(.system(size: compact ? 22 : 28))
      VStack(alignment: .leading, spacing: 2) {
        Text("Next")
          .font(.system(size: 9, weight: .bold))
          .textCase(.uppercase)
          .foregroundStyle(Color.white.opacity(0.5))
          .tracking(0.4)
        Text(recommendation.title)
          .font(.system(size: compact ? 13 : 15, weight: .semibold))
          .foregroundStyle(.white)
          .lineLimit(1)
        Text("\(recommendation.durationMin) min")
          .font(.system(size: 11, weight: .semibold))
          .foregroundStyle(Color(hex: recommendation.color))
      }
      Spacer(minLength: 0)
    }
  }
}

// MARK: - Small

struct SmallHomeWidgetView: View {
  let entry: MicroBreaksEntry

  var body: some View {
    let accent = Color(hex: entry.snapshot.nextRecommended?.color ?? "#06FFA5")
    WidgetContainer(accent: accent) {
      VStack(alignment: .leading, spacing: 8) {
        HStack {
          Text("MicroBreaks")
            .font(.system(size: 11, weight: .bold))
            .foregroundStyle(Color.white.opacity(0.55))
            .tracking(0.4)
          Spacer()
        }
        Spacer(minLength: 0)
        HStack {
          ProgressRing(progressPct: entry.snapshot.today.progressPct, accent: accent, size: 68)
          Spacer(minLength: 0)
        }
        HStack {
          Text("\(entry.snapshot.today.breaksTaken)/\(entry.snapshot.today.breaksGoal)")
            .font(.system(size: 13, weight: .bold, design: .rounded))
            .foregroundStyle(.white)
          Spacer()
          StreakBadge(streak: entry.snapshot.streak)
        }
      }
    }
    .widgetURL(URL(string: "microbreaks://home"))
  }
}

// MARK: - Medium

struct MediumHomeWidgetView: View {
  let entry: MicroBreaksEntry

  var body: some View {
    let accent = Color(hex: entry.snapshot.nextRecommended?.color ?? "#06FFA5")
    WidgetContainer(accent: accent) {
      HStack(spacing: 14) {
        VStack(alignment: .leading, spacing: 6) {
          Text("Today")
            .font(.system(size: 10, weight: .bold))
            .foregroundStyle(Color.white.opacity(0.5))
            .tracking(0.4)
          ProgressRing(progressPct: entry.snapshot.today.progressPct, accent: accent, size: 64)
          Text("\(entry.snapshot.today.breaksTaken)/\(entry.snapshot.today.breaksGoal) breaks")
            .font(.system(size: 11, weight: .semibold))
            .foregroundStyle(.white)
        }
        Divider()
          .frame(width: 1)
          .overlay(Color.white.opacity(0.08))
        VStack(alignment: .leading, spacing: 8) {
          StreakBadge(streak: entry.snapshot.streak)
          if let next = entry.snapshot.nextRecommended {
            RecommendationCard(recommendation: next, compact: false)
          } else {
            Text("All caught up.")
              .font(.system(size: 13, weight: .semibold))
              .foregroundStyle(Color.white.opacity(0.75))
          }
        }
        Spacer(minLength: 0)
      }
    }
    .widgetURL(URL(string: entry.snapshot.nextRecommended?.deepLink ?? "microbreaks://home"))
  }
}

// MARK: - Large

struct LargeHomeWidgetView: View {
  let entry: MicroBreaksEntry

  var body: some View {
    let accent = Color(hex: entry.snapshot.nextRecommended?.color ?? "#06FFA5")
    WidgetContainer(accent: accent) {
      VStack(alignment: .leading, spacing: 12) {
        HStack {
          VStack(alignment: .leading, spacing: 2) {
            Text("Hi, \(entry.snapshot.user.name)")
              .font(.system(size: 16, weight: .heavy, design: .rounded))
              .foregroundStyle(.white)
            Text("Level \(entry.snapshot.user.level) • Day \(entry.snapshot.streak.current)")
              .font(.system(size: 11, weight: .semibold))
              .foregroundStyle(Color.white.opacity(0.6))
          }
          Spacer()
          StreakBadge(streak: entry.snapshot.streak)
        }

        HStack(spacing: 12) {
          ProgressRing(progressPct: entry.snapshot.today.progressPct, accent: accent, size: 96, lineWidth: 8)
          VStack(alignment: .leading, spacing: 4) {
            Text("Today")
              .font(.system(size: 10, weight: .bold))
              .foregroundStyle(Color.white.opacity(0.5))
              .tracking(0.4)
            Text("\(entry.snapshot.today.breaksTaken) of \(entry.snapshot.today.breaksGoal)")
              .font(.system(size: 18, weight: .heavy, design: .rounded))
              .foregroundStyle(.white)
            Text("\(entry.snapshot.today.totalMinutes) min of recovery")
              .font(.system(size: 11, weight: .semibold))
              .foregroundStyle(Color.white.opacity(0.65))
          }
          Spacer()
        }

        if let next = entry.snapshot.nextRecommended {
          RecommendationCard(recommendation: next, compact: false)
            .padding(10)
            .background(
              RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.white.opacity(0.05))
            )
        }

        if let last = entry.snapshot.lastBreak {
          HStack(spacing: 8) {
            Text(last.icon)
              .font(.system(size: 16))
            VStack(alignment: .leading, spacing: 1) {
              Text("Last: \(last.title)")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Color.white.opacity(0.85))
              Text(last.completedDate, style: .relative)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(Color.white.opacity(0.5))
            }
            Spacer(minLength: 0)
          }
        }
      }
    }
    .widgetURL(URL(string: entry.snapshot.nextRecommended?.deepLink ?? "microbreaks://home"))
  }
}

// MARK: - Widget configuration

struct MicroBreaksHomeWidget: Widget {
  let kind: String = "MicroBreaksHomeWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: MicroBreaksProvider()) { entry in
      switch entry.snapshot.schemaVersion {
      case WidgetConstants.supportedSchemaVersion:
        WidgetSizeRouter(entry: entry)
      default:
        UnsupportedSchemaView()
      }
    }
    .configurationDisplayName("MicroBreaks")
    .description("Today's recovery, your streak, and what to do next.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

private struct WidgetSizeRouter: View {
  let entry: MicroBreaksEntry
  @Environment(\.widgetFamily) private var family

  var body: some View {
    switch family {
    case .systemSmall:
      SmallHomeWidgetView(entry: entry)
    case .systemMedium:
      MediumHomeWidgetView(entry: entry)
    case .systemLarge:
      LargeHomeWidgetView(entry: entry)
    default:
      SmallHomeWidgetView(entry: entry)
    }
  }
}

private struct UnsupportedSchemaView: View {
  var body: some View {
    VStack(spacing: 6) {
      Image(systemName: "arrow.up.circle.fill")
        .font(.system(size: 22, weight: .bold))
        .foregroundStyle(Color(hex: "#06FFA5"))
      Text("Open MicroBreaks")
        .font(.system(size: 13, weight: .heavy, design: .rounded))
        .foregroundStyle(.white)
      Text("Update to refresh the widget")
        .font(.system(size: 10, weight: .semibold))
        .foregroundStyle(Color.white.opacity(0.6))
    }
    .containerBackground(for: .widget) {
      Color(hex: "#0B0E13")
    }
  }
}

// MARK: - Helpers

private extension Comparable {
  func clamped(to limits: ClosedRange<Self>) -> Self {
    min(max(self, limits.lowerBound), limits.upperBound)
  }
}
