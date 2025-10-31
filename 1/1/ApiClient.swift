import Foundation

actor ApiClient {
    static let shared = ApiClient()

    // 1) База для симулятора и устройства
    #if targetEnvironment(simulator)
    private let base = URL(string: "http://127.0.0.1:8000/v1")!
    #else
    // Подставь IP твоего Mac в локальной сети
    private let base = URL(string: "http://192.168.0.42:8000/v1")!
    #endif

    // 2) Чат с обработкой 402 (paywall) и таймаутом
    func sendChat(message: String) async throws -> String {
        var req = URLRequest(url: base.appendingPathComponent("chat"))
        req.httpMethod = "POST"
        req.timeoutInterval = 20
        req.addValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = ["user_id":"local","message":message,"translation":"WEB"]
        req.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, resp) = try await URLSession.shared.data(for: req)
        if let http = resp as? HTTPURLResponse {
            if http.statusCode == 402 {
                // сигнализируй UI показать пейвол
                throw NSError(domain: "api", code: 402, userInfo: ["paywall": true])
            }
            guard (200..<300).contains(http.statusCode) else {
                throw NSError(domain: "api", code: http.statusCode)
            }
        }
        let obj = try JSONSerialization.jsonObject(with: data) as? [String:Any]
        return (obj?["answer"] as? String) ?? "(no answer)"
    }

    func dailyVerse() async -> String? {
        let url = base.appendingPathComponent("daily-verse")
        do {
            let (data, resp) = try await URLSession.shared.data(from: url)
            if let http = resp as? HTTPURLResponse, !(200..<300).contains(http.statusCode) { return nil }
            if let obj = try JSONSerialization.jsonObject(with: data) as? [String:Any],
               let verse = obj["verse"] as? [String:Any],
               let text = verse["text"] as? String { return text }
        } catch { return nil }
        return nil
    }
}
