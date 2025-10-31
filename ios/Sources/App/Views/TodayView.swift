import SwiftUI
import UserNotifications
struct TodayView: View {
    @State private var verse: String = "—"
    var body: some View {
        VStack(spacing: 16) {
            Text("Verse of the Day").font(.headline)
            Text(verse).font(.title3).multilineTextAlignment(.center)
            Button("Notify daily at 8:00") { schedule() }
        }.padding().task { await load() }
    }
    func load() async {
        if let v = await ApiClient.shared.dailyVerse() { verse = v }
        else { verse = "The Lord is my shepherd. (Ps 23:1)" }
    }
    func schedule() {
        Task {
            let center = UNUserNotificationCenter.current()
            _ = try? await center.requestAuthorization(options: [.alert,.sound,.badge])
            var c = DateComponents(); c.hour = 8
            let trigger = UNCalendarNotificationTrigger(dateMatching: c, repeats: true)
            let content = UNMutableNotificationContent()
            content.title = "Verse of the Day"; content.body = verse
            let req = UNNotificationRequest(identifier: "daily-verse", content: content, trigger: trigger)
            try? await center.add(req)
        }
    }
}
