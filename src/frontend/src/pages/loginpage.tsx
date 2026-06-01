import type { PageProps } from "../App";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import GoogleLoginButton from "../components/Auth/GoogleLoginButton";

export default function LoginPage({ app }: PageProps) {
  const { t, language, updateSettings } = app;
  const { isDark } = useTheme();
  const isTamil = language === "ta";

  const logoSrc = "/assets/generated/kaasflow-logo-transparent.dim_120x120.png";

  const AuthHeader = () => (
    <div className="auth-brand-area">
      <img src={logoSrc} alt="KaasFlow" className="auth-logo-img" />
      <div className="auth-brand-name">
        Kaas<span className="auth-brand-accent">Flow</span>
      </div>
      <p className="auth-brand-tagline">
        {isTamil
          ? "நிதி மேலாண்மை எளிதாக்கப்பட்டது"
          : "Finance management, simplified"}
      </p>
    </div>
  );

  return (
    <div className="auth-page" data-ocid="login.page">
      <div className="auth-theme-toggle-floating">
        <ThemeToggle />
      </div>

      <div className="auth-lang-toggle" data-ocid="login.language_toggle">
        <button
          type="button"
          data-ocid="login.lang_en"
          className={`lang-btn ${language === "en" ? "active" : ""}`}
          onClick={() => updateSettings({ language: "en" })}
        >
          EN
        </button>
        <button
          type="button"
          data-ocid="login.lang_ta"
          className={`lang-btn ${language === "ta" ? "active" : ""}`}
          onClick={() => updateSettings({ language: "ta" })}
        >
          தமிழ்
        </button>
      </div>

      <div className="auth-card auth-card-animate">
        <AuthHeader />

        <h2 className={`auth-title ${isTamil ? "tamil-text" : ""}`}>
          {isTamil ? "வணக்கம்!" : "Welcome Back"}
        </h2>
        <p className={`auth-subtitle ${isTamil ? "tamil-text" : ""}`}>
          {isTamil ? "தொடர Google-ல் உள்நுழையவும்" : "Sign in with Google to continue"}
        </p>

        <div className="auth-form-section flex flex-col items-center py-6">
          <GoogleLoginButton />
        </div>

        <div className="auth-register-hint mt-6">
          <span className={`auth-register-hint-text ${isTamil ? "tamil-text" : ""}`}>
            {isTamil ? "உங்கள் தரவு பாதுகாப்பானது" : "Your data is strictly isolated"}
          </span>
          <span className={`auth-register-hint-sub ${isTamil ? "tamil-text" : ""}`}>
            {isTamil
              ? "ஒவ்வொரு பயனருக்கும் தனிப்பட்ட தரவு"
              : "Every account has entirely separate data"}
          </span>
        </div>

        <div className={`auth-theme-indicator ${isDark ? "dark" : "light"}`}>
          <span>{isDark ? "🌙" : "☀️"}</span>
          <span className={isTamil ? "tamil-text" : ""}>
            {isDark ? t("darkMode") : t("lightMode")}
          </span>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

function AuthFooter() {
  return (
    <p className="auth-footer-text">
      © {new Date().getFullYear()}. Built with love using{" "}
      <a
        href={`https://caffeine.ai?utm_source=caffeine-footer`}
        target="_blank"
        rel="noreferrer"
        className="auth-footer-link"
      >
        caffeine.ai
      </a>
    </p>
  );
}
