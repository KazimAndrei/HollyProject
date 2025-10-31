import SwiftUI
@main
struct HollyApp: App {
    var body: some Scene {
        WindowGroup { RootView() }
    }
}
struct RootView: View {
    var body: some View {
        TabView {
            ChatView().tabItem { Label("Chat", systemImage: "text.bubble") }
            TodayView().tabItem { Label("Today", systemImage: "sun.max") }
            PlanView().tabItem { Label("Plan", systemImage: "list.number") }
            SettingsView().tabItem { Label("Settings", systemImage: "gear") }
        }
    }
}
