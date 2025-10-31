import SwiftUI
struct PlanView: View {
    var body: some View {
        List {
            Section("John in 14 days") {
                ForEach(1..<15) { day in
                    HStack { Text("Day \(day)"); Spacer(); Image(systemName: "circle") }
                }
            }
        }.navigationTitle("Reading Plan")
    }
}
