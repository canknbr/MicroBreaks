// BreakLiveActivity.swift — Live Activity + Dynamic Island for an in-progress break.
//
// When a break starts, the JS side calls `WidgetBridge.startBreakActivity`
// with the immutable session info (title, color, icon, total duration)
// and the initial countdown state. ActivityKit then pushes a Live
// Activity onto the Lock Screen and the Dynamic Island — the user can
// see the timer ticking down without unlocking or opening the app.
//
// Update strategy:
//   - Throttled to every 2 seconds while time > 10s remaining.
//   - Every second once we're inside the final 10 seconds so the
//     countdown feels honest.
//   - Forced update on pause / resume / step change.
//
// All update + end calls flow through the WidgetBridgeModule so the JS
// layer never imports ActivityKit directly.

import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Attributes + ContentState

/// Immutable session info. Lives for the entire Live Activity, never
/// changes. Anything the JS side might want to override mid-session
/// belongs in `ContentState`.
public struct BreakActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    /// Seconds left on the *current step* (or the whole break for
    /// single-step exercises). The widget formats this itself.
    public var timeRemainingSec: Int
    /// True when the user paused. The widget changes to a "paused"
    /// chrome and stops the ring animation.
    public var isPaused: Bool
    /// 0..1 fraction of the break that has been completed so far. The
    /// widget renders a ring of this width.
    public var progress: Double
    /// Short label for the current step, e.g. "Breathe in" or "Hold".
    /// Optional; widget falls back to the exercise title.
    public var stepLabel: String?
  }

  public let breakId: String
  public let title: String
  public let icon: String
  /// `#RRGGBB` string. Widget parses on render — same Color(hex:) helper
  /// the rest of the widget bundle uses.
  public let colorHex: String
  public let totalSeconds: Int
}

// MARK: - Helpers shared across all variants

private func formatTime(_ seconds: Int) -> String {
  let clamped = max(0, seconds)
  let m = clamped / 60
  let s = clamped % 60
  return String(format: "%d:%02d", m, s)
}

private func accentColor(for attributes: BreakActivityAttributes) -> Color {
  Color(hex: attributes.colorHex)
}

// MARK: - Lock Screen view

private struct BreakLockScreenView: View {
  let context: ActivityViewContext<BreakActivityAttributes>

  var body: some View {
    let accent = accentColor(for: context.attributes)
    HStack(spacing: 14) {
      Text(context.attributes.icon)
        .font(.system(size: 32))
        .frame(width: 48, height: 48)
        .background(
          Circle().fill(accent.opacity(0.18))
        )

      VStack(alignment: .leading, spacing: 4) {
        Text(context.attributes.title)
          .font(.system(size: 15, weight: .heavy, design: .rounded))
          .foregroundStyle(.white)
          .lineLimit(1)
        Text(context.state.stepLabel ?? "In progress")
          .font(.system(size: 11, weight: .semibold))
          .foregroundStyle(Color.white.opacity(0.7))
          .lineLimit(1)
        ProgressView(value: context.state.progress.clamped01)
          .progressViewStyle(.linear)
          .tint(accent)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      VStack(alignment: .trailing, spacing: 2) {
        Text(formatTime(context.state.timeRemainingSec))
          .font(.system(size: 22, weight: .heavy, design: .rounded).monospacedDigit())
          .foregroundStyle(.white)
        Text(context.state.isPaused ? "Paused" : "remaining")
          .font(.system(size: 9, weight: .bold))
          .foregroundStyle(Color.white.opacity(0.55))
          .textCase(.uppercase)
      }
    }
    .padding(14)
    .activityBackgroundTint(Color(hex: "#0B0E13"))
    .activitySystemActionForegroundColor(.white)
  }
}

// MARK: - Dynamic Island

@available(iOS 16.1, *)
private struct DynamicIslandCompactLeading: View {
  let context: ActivityViewContext<BreakActivityAttributes>
  var body: some View {
    Label {
      Text(context.attributes.title)
        .font(.system(size: 12, weight: .semibold))
        .lineLimit(1)
    } icon: {
      Text(context.attributes.icon)
        .font(.system(size: 14))
    }
  }
}

@available(iOS 16.1, *)
private struct DynamicIslandCompactTrailing: View {
  let context: ActivityViewContext<BreakActivityAttributes>
  var body: some View {
    Text(formatTime(context.state.timeRemainingSec))
      .font(.system(size: 13, weight: .heavy, design: .rounded).monospacedDigit())
      .foregroundStyle(accentColor(for: context.attributes))
  }
}

@available(iOS 16.1, *)
private struct DynamicIslandMinimal: View {
  let context: ActivityViewContext<BreakActivityAttributes>
  var body: some View {
    let accent = accentColor(for: context.attributes)
    ZStack {
      Circle()
        .stroke(Color.white.opacity(0.18), lineWidth: 2)
      Circle()
        .trim(from: 0, to: context.state.progress.clamped01)
        .stroke(accent, style: StrokeStyle(lineWidth: 2, lineCap: .round))
        .rotationEffect(.degrees(-90))
      Text(context.attributes.icon)
        .font(.system(size: 10))
    }
  }
}

@available(iOS 16.1, *)
private struct DynamicIslandExpandedCenter: View {
  let context: ActivityViewContext<BreakActivityAttributes>
  var body: some View {
    let accent = accentColor(for: context.attributes)
    HStack(spacing: 12) {
      ZStack {
        Circle()
          .stroke(Color.white.opacity(0.15), lineWidth: 5)
          .frame(width: 50, height: 50)
        Circle()
          .trim(from: 0, to: context.state.progress.clamped01)
          .stroke(accent, style: StrokeStyle(lineWidth: 5, lineCap: .round))
          .rotationEffect(.degrees(-90))
          .frame(width: 50, height: 50)
        Text(context.attributes.icon)
          .font(.system(size: 18))
      }
      VStack(alignment: .leading, spacing: 2) {
        Text(context.state.stepLabel ?? context.attributes.title)
          .font(.system(size: 13, weight: .bold))
          .foregroundStyle(.white)
          .lineLimit(1)
        Text(formatTime(context.state.timeRemainingSec) + (context.state.isPaused ? " · paused" : " left"))
          .font(.system(size: 11, weight: .semibold).monospacedDigit())
          .foregroundStyle(Color.white.opacity(0.7))
      }
      Spacer(minLength: 0)
    }
  }
}

// MARK: - ActivityConfiguration

struct BreakLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: BreakActivityAttributes.self) { context in
      BreakLockScreenView(context: context)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.center) {
          DynamicIslandExpandedCenter(context: context)
        }
        DynamicIslandExpandedRegion(.bottom) {
          ProgressView(value: context.state.progress.clamped01)
            .progressViewStyle(.linear)
            .tint(accentColor(for: context.attributes))
        }
      } compactLeading: {
        DynamicIslandCompactLeading(context: context)
      } compactTrailing: {
        DynamicIslandCompactTrailing(context: context)
      } minimal: {
        DynamicIslandMinimal(context: context)
      }
      .widgetURL(URL(string: "microbreaks://break/\(context.attributes.breakId)"))
      .keylineTint(accentColor(for: context.attributes))
    }
  }
}

// MARK: - Math helpers

private extension Double {
  var clamped01: Double {
    if self < 0 { return 0 }
    if self > 1 { return 1 }
    return self
  }
}
