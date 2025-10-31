import SwiftUI
struct ChatView: View {
    @State private var input: String = ""
    @State private var messages: [String] = []
    var body: some View {
        VStack {
            ScrollView {
                ForEach(messages.indices, id: \.self) { i in
                    Text(messages[i]).frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 4)
                }
            }
            HStack {
                TextField("Ask anything...", text: $input).textFieldStyle(.roundedBorder)
                Button("Send") { Task { await send() } }
            }.padding(.vertical, 8)
        }.padding()
    }
    func send() async {
        guard !input.isEmpty else { return }
        messages.append("You: " + input)
        if let ans = await ApiClient.shared.sendChat(message: input) {
            messages.append("Bot: " + ans)
        } else {
            messages.append("Bot: (offline) God cares for you. See Psalm 23:1 and Psalm 46:1.")
        }
        input = ""
    }
}
