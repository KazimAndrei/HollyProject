import SwiftUI
struct SettingsView: View {
    var body: some View {
        Form {
            Section("Translation") { Text("WEB (default)") }
            Section("Subscription") { Text("Weekly — $7.99 (configure StoreKit)") }
        }
    }
}
