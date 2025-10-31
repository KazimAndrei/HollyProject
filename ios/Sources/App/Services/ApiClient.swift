import Foundation

struct ApiClient {
    let userID: String

    static var baseURL: URL {
        #if targetEnvironment(simulator)
        return URL(string: "http://127.0.0.1:8000/v1")!
        #else
        return URL(string: "http://<REPLACE_WITH_LAN_IP>:8000/v1")!
        #endif
    }

    private var chatURL: URL {
        Self.baseURL.appendingPathComponent("chat")
    }

    private var dailyVerseURL: URL {
        Self.baseURL.appendingPathComponent("verses/daily")
    }

    func sendChat(message: String, translation: String = "WEB") async throws -> String {
        var request = URLRequest(url: chatURL)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = ChatRequest(user_id: userID, message: message, translation: translation)
        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        if http.statusCode == 402 {
            throw NSError(domain: "api", code: 402, userInfo: ["paywall": true])
        }

        guard (200..<300).contains(http.statusCode) else {
            throw NSError(domain: "api", code: http.statusCode, userInfo: nil)
        }

        let chatResponse = try JSONDecoder().decode(ChatResponse.self, from: data)
        return chatResponse.answer
    }

    func dailyVerse(translation: String = "WEB") async -> String? {
        var components = URLComponents(url: dailyVerseURL, resolvingAgainstBaseURL: false)
        components?.queryItems = [URLQueryItem(name: "translation", value: translation)]

        guard let url = components?.url else {
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                return nil
            }

            if let verse = try? JSONDecoder().decode(DailyVerseResponse.self, from: data) {
                return verse.text
            }
        } catch {
            return nil
        }

        return nil
    }
}

private struct ChatRequest: Codable {
    let user_id: String
    let message: String
    let translation: String
}

private struct ChatResponse: Codable {
    let answer: String
}

private struct DailyVerseResponse: Codable {
    let text: String
}
