import Combine
import Foundation

@MainActor
final class EntitlementService: ObservableObject {
    @Published private(set) var isActive: Bool = false
    @Published private(set) var expiresAt: Date?

    private let userID: String

    init(userID: String) {
        self.userID = userID
    }

    func refresh() async {
        var components = URLComponents(url: ApiClient.baseURL.appendingPathComponent("iap/entitlement"), resolvingAgainstBaseURL: false)
        components?.queryItems = [URLQueryItem(name: "user_id", value: userID)]

        guard let url = components?.url else {
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                return
            }

            let entitlement = try JSONDecoder().decode(EntitlementResponse.self, from: data)
            isActive = entitlement.status == "active"
            expiresAt = entitlement.expiresAt
        } catch {
            // Ignore errors and keep prior state; callers can retry.
        }
    }
}

private struct EntitlementResponse: Decodable {
    let status: String
    let expires_at: String?

    var expiresAt: Date? {
        guard let expires_at else { return nil }
        return EntitlementResponse.formatter.date(from: expires_at)
    }

    private static let formatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
}
