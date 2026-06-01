import Types "../types/auth";
import AuthLib "../lib/auth";
import Time "mo:core/Time";
import Principal "mo:base/Principal";

mixin (users : AuthLib.UserMap) {
  /// Register a new user account with email.
  /// Uses msg.caller for authentication and data isolation.
  public shared(msg) func register(
    email : Text,
    financierName : Text,
    businessName : Text,
    role : Types.UserRole,
  ) : async Types.SimpleResult {
    AuthLib.register(users, msg.caller, email, financierName, businessName, role, Time.now());
  };

  /// Login. Authenticates using msg.caller.
  public shared(msg) func login() : async Types.AuthResult {
    AuthLib.login(users, msg.caller);
  };

  /// Get the public profile for the currently logged in user.
  public query shared(msg) func getMyProfile() : async ?Types.UserProfile {
    AuthLib.getProfile(users, msg.caller);
  };

  /// Check if the current caller is already registered.
  public query shared(msg) func isRegistered() : async Bool {
    AuthLib.exists(users, msg.caller);
  };
};
