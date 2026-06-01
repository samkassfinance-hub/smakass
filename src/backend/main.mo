import Map "mo:core/Map";
import Types "types/auth";
import AuthMixin "mixins/auth-api";
import Principal "mo:base/Principal";

actor {
  let users : Map.Map<Principal.Principal, Types.UserAccount> = Map.empty<Principal.Principal, Types.UserAccount>();
  include AuthMixin(users);
};
