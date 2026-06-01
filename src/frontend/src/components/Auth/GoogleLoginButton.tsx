import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useApp } from "../../hooks/useApp";

export default function GoogleLoginButton() {
  const { login, register, updateSettings } = useApp();
  const [error, setError] = useState<string | null>(null);

  // We should ideally load this from env, but providing a placeholder since it's a breakdown request
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential;
      if (!token) throw new Error("No credential received");

      const decoded: any = jwtDecode(token);
      const email = decoded.email;
      const name = decoded.name || "User";

      if (!email) throw new Error("No email found in token");

      // First try to login
      // We now pass the email which sets the active session and injects the proper Identity for msg.caller
      const loginSuccess = await login(email);

      if (!loginSuccess) {
        // Automatically register the user if login fails (not found)
        await register(email, name, "My Business");
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError("Failed to authenticate with Google. Please try again.");
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
    setError("Google Login was unsuccessful. Please try again.");
  };

  return (
    <div className="google-auth-wrapper flex flex-col items-center justify-center gap-4 w-full">
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          theme="outline"
          shape="pill"
        />
      </GoogleOAuthProvider>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
