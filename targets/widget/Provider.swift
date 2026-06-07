// Provider.swift — TimelineProvider for the MicroBreaks home + lock screen widgets.
//
// Widgets in iOS are NOT live — the OS asks the provider for a small set
// of pre-rendered timeline entries every so often. We rebuild that
// timeline whenever:
//   1. The JS bridge calls `WidgetCenter.shared.reloadAllTimelines()` after
//      a flush, OR
//   2. The OS asks us to refresh on its own schedule (~every 15-60 min).
//
// Strategy: build a single entry from the current snapshot, then schedule
// the next refresh ~15 minutes out so the widget never goes too stale.

import WidgetKit
import SwiftUI

struct MicroBreaksEntry: TimelineEntry {
  let date: Date
  let snapshot: WidgetSnapshot
}

struct MicroBreaksProvider: TimelineProvider {
  /// Shown briefly while the widget is being added — Apple recommends a
  /// representative payload, not a "loading…" placeholder.
  func placeholder(in _: Context) -> MicroBreaksEntry {
    MicroBreaksEntry(date: Date(), snapshot: .sample)
  }

  /// Used by the widget gallery + when the OS needs an instant snapshot
  /// (e.g. when the user is about to add the widget). Hit the App Group
  /// — if it's empty we fall back to `.sample` so the gallery looks alive.
  func getSnapshot(in context: Context, completion: @escaping (MicroBreaksEntry) -> Void) {
    let stored = WidgetSnapshotLoader.load()
    let snapshot = context.isPreview && stored.generatedAt == 0 ? WidgetSnapshot.sample : stored
    completion(MicroBreaksEntry(date: Date(), snapshot: snapshot))
  }

  /// Real timeline. One entry now + a refresh in ~15 minutes so we re-read
  /// the App Group even if the JS bridge has not pinged us.
  func getTimeline(in _: Context, completion: @escaping (Timeline<MicroBreaksEntry>) -> Void) {
    let snapshot = WidgetSnapshotLoader.load()
    let now = Date()
    let entry = MicroBreaksEntry(date: now, snapshot: snapshot)
    let refreshAt = Calendar.current.date(byAdding: .minute, value: 15, to: now) ?? now.addingTimeInterval(900)
    completion(Timeline(entries: [entry], policy: .after(refreshAt)))
  }
}
