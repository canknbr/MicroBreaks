// index.swift — WidgetBundle entry point.
//
// All widgets the extension ships must be listed here. The `@main`
// attribute makes this the executable entry point of the extension
// process. Order matters only for the widget gallery preview.

import SwiftUI
import WidgetKit

@main
struct MicroBreaksWidgetBundle: WidgetBundle {
  var body: some Widget {
    MicroBreaksHomeWidget()
    MicroBreaksLockScreenWidget()
    if #available(iOS 16.2, *) {
      BreakLiveActivity()
    }
  }
}
