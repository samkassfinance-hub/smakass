import Map "mo:core/Map";
import Types "../types/auth";
import Principal "mo:base/Principal";

module {
  public type UserMap = Map.Map<Principal.Principal, Types.UserAccount>;

  /// Register a new user. Returns #err if caller is already registered.
  public func register(
    users : UserMap,
    caller : Principal.Principal,
    email : Text,
    financierName : Text,
    businessName : Text,
    role : Types.UserRole,
    now : Int,
  ) : Types.SimpleResult {
    if (Principal.isAnonymous(caller)) {
      return #err("Anonymous principal cannot register");
    };
    if (users.containsKey(caller)) {
      return #err("User already registered");
    };
    let account : Types.UserAccount = {
      email;
      owner = caller;
      financierName;
      businessName;
      role;
      createdAt = now;
    };
    users.add(caller, account);
    #ok;
  };

  /// Authenticate a user by caller principal. Returns profile on success.
  public func login(
    users : UserMap,
    caller : Principal.Principal,
  ) : Types.AuthResult {
    switch (users.get(caller)) {
      case null { #err("User not registered") };
      case (?account) {
        #ok({
          email = account.email;
          financierName = account.financierName;
          businessName = account.businessName;
          role = account.role;
        });
      };
    };
  };

  /// Retrieve public profile by principal.
  public func getProfile(
    users : UserMap,
    caller : Principal.Principal,
  ) : ?Types.UserProfile {
    switch (users.get(caller)) {
      case null { null };
      case (?account) {
        ?{
          email = account.email;
          financierName = account.financierName;
          businessName = account.businessName;
          role = account.role;
        };
      };
    };
  };

  /// Check whether a principal is already registered.
  public func exists(
    users : UserMap,
    caller : Principal.Principal,
  ) : Bool {
    users.containsKey(caller);
  };
};
