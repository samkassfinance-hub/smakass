import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useState } from "react";
import { UserRole, createActor } from "../backend";
import { getOrGenerateIdentity } from "../lib/identity";
import { generateSampleData } from "../lib/sampleData";
import {
  clearSession,
  getActiveEmail,
  getAuth,
  getClients,
  getLoans,
  getPayments,
  getSession,
  getSettings,
  saveAuth,
  saveClients,
  saveLoans,
  savePayments,
  saveSession,
  saveSettings,
  setActiveEmail,
} from "../lib/storage";
import { type TranslationKey, t as translate } from "../lib/translations";

// Wrapper to inject identity into the actor
const createActorWithIdentity = (
  canisterId: any,
  uploadFile: any,
  downloadFile: any,
  options: any = {}
) => {
  const email = getActiveEmail();
  if (email) {
    const identity = getOrGenerateIdentity(email);
    options = {
      ...options,
      agentOptions: { ...options?.agentOptions, identity },
    };
  }
  return createActor(canisterId, uploadFile, downloadFile, options);
};
import type { Client, Loan, Page, Payment, PlanType, Settings } from "../types";
import {
  type SecondaryConnectionStatus,
  hasSecondaryCredentials,
  syncAllDataToSecondary,
  syncClientToSecondary,
  syncLoanToSecondary,
  syncPaymentToSecondary,
} from "../lib/secondarySupabase";

export interface AppState {
  clients: Client[];
  loans: Loan[];
  payments: Payment[];
  settings: Settings;
  currentPage: Page;
  selectedClientId: string | null;
  selectedLoanId: string | null;
  isLoggedIn: boolean;
  hasAuth: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  language: "en" | "ta";
  role: "admin" | "staff";
  // Plan / trial
  isPro: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (v: boolean) => void;
  upgradePro: (planType: PlanType) => void;
  // Actions
  navigate: (page: Page, id?: string) => void;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  register: (
    email: string,
    financierName: string,
    businessName: string,
  ) => Promise<void>;
  checkPhoneExists: (phone: string) => Promise<boolean>;
  refreshData: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  saveClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  saveLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;
  savePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  t: (key: TranslationKey) => string;
  // Secondary Supabase
  secondarySupabaseStatus: SecondaryConnectionStatus;
  syncAllToSecondary: () => Promise<void>;
}

const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000;

function ensureTrialEnd(s: Settings): Settings {
  if (!s.trialEnd) {
    return { ...s, trialEnd: Date.now() + TWO_MONTHS_MS };
  }
  return s;
}

const STAFF_ALLOWED_PAGES: Page[] = ["collection", "reports", "settings"];

export function useApp(): AppState {
  const { actor } = useActor(createActorWithIdentity as any);
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [loans, setLoans] = useState<Loan[]>(() => getLoans());
  const [payments, setPayments] = useState<Payment[]>(() => getPayments());
  const [settings, setSettings] = useState<Settings>(() => {
    const s = getSettings();
    const updated = ensureTrialEnd({ plan: "free", ...s });
    if (!s.trialEnd) saveSettings(updated);
    return updated;
  });
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const session = getSession();
    return session?.loggedIn ?? false;
  });
  const [hasAuth, setHasAuth] = useState<boolean>(() => getAuth() !== null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [secondarySupabaseStatus, setSecondarySupabaseStatus] =
    useState<SecondaryConnectionStatus>(() =>
      hasSecondaryCredentials() ? "connected" : "not_connected",
    );

  // ── Derived role ──
  const storedAuth = getAuth();
  const role: "admin" | "staff" = settings.role ?? storedAuth?.role ?? "admin";

  // ── Computed plan state ──
  const now = Date.now();
  const plan = settings.plan ?? "free";
  const planExpiry = settings.planExpiry ?? null;
  const trialEnd = settings.trialEnd ?? null;
  const isPro = plan === "pro" && planExpiry !== null && planExpiry > now;
  const isTrialActive = plan === "free" && trialEnd !== null && trialEnd > now;
  const trialDaysRemaining = trialEnd
    ? Math.max(0, Math.ceil((trialEnd - now) / 86400000))
    : 0;

  const refreshData = useCallback(() => {
    setClients(getClients());
    setLoans(getLoans());
    setPayments(getPayments());
    setSettings(getSettings());
  }, []);

  const navigate = useCallback(
    (page: Page, id?: string) => {
      // Role-gated: staff can only access allowed pages
      const resolved =
        role === "staff" && !STAFF_ALLOWED_PAGES.includes(page)
          ? "collection"
          : page;
      setCurrentPage(resolved);
      if (resolved === "client-profile") setSelectedClientId(id ?? null);
      if (resolved === "loan-detail") setSelectedLoanId(id ?? null);
    },
    [role],
  );

  const upgradePro = useCallback((planType: PlanType) => {
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      alert("Payment gateway is loading, please try again in a moment.");
      return;
    }

    const priceMap: Record<PlanType, number> = {
      monthly: 27000, // amount in paise (₹270)
      quarterly: 85000, // ₹850
      yearly: 199900, // ₹1,999
    };

    const options = {
      key: "rzp_test_dummy_key", // Replace with your actual Razorpay Key ID
      amount: priceMap[planType].toString(),
      currency: "INR",
      name: "KaasFlow SaaS",
      description: `Upgrade to ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
      image: "/favicon.ico", // Your logo
      handler: function (response: any) {
        // Payment success callback
        console.log("Payment successful:", response);
        
        const expiryMap: Record<PlanType, number> = {
          monthly: 30 * 24 * 60 * 60 * 1000,
          quarterly: 90 * 24 * 60 * 60 * 1000,
          yearly: 365 * 24 * 60 * 60 * 1000,
        };
        const expiry = Date.now() + expiryMap[planType];
        const current = getSettings();
        const updated: Settings = {
          ...current,
          plan: "pro",
          planType,
          planExpiry: expiry,
        };
        saveSettings(updated);
        setSettings(updated);
        setShowUpgradeModal(false);
        
        // Show success message
        alert(`Successfully upgraded to ${planType} plan! 🎉`);
      },
      prefill: {
        name: getSettings().financierName || "User Name",
        email: getActiveEmail() || "user@example.com",
        contact: getSettings().phone || "",
      },
      notes: {
        plan_type: planType,
        user_email: getActiveEmail() || "",
      },
      theme: {
        color: "#f59e0b" // var(--kf-amber)
      },
      modal: {
        ondismiss: function() {
          console.log("Payment popup closed by user");
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    
    rzp.on("payment.failed", function (response: any) {
      console.error("Payment failed:", response.error);
      alert(`Payment failed: ${response.error.description || "Please try again"}`);
    });
    
    rzp.open();
  }, []);

  const login = useCallback(
    async (email: string): Promise<boolean> => {
      setIsAuthLoading(true);
      setAuthError(null);
      try {
        setActiveEmail(email); // Set before actor calls to inject identity
        
        // Try backend first
        if (actor) {
          try {
            // new backend login takes no arguments since it relies on msg.caller
            const result = await (actor as any).login();
            if (result.__kind__ === "ok") {
              const profile = result.ok;
              const userRole: "admin" | "staff" =
                profile.role === UserRole.staff ? "staff" : "admin";
              const currentSettings = getSettings();
              const withTrial = ensureTrialEnd({
                plan: "free",
                ...currentSettings,
                financierName: profile.financierName,
                businessName: profile.businessName,
                phone: profile.email || email,
                role: userRole,
              });
              saveSettings(withTrial);
              saveAuth({ phone: email, pin: "google-auth", role: userRole });
              const session = {
                loggedIn: true,
                loginTime: new Date().toISOString(),
                email: email,
              };
              saveSession(session);
              generateSampleData();
              setIsLoggedIn(true);
              setSettings(withTrial);
              refreshData();
              return true;
            }
            setAuthError(result.err || "Failed to login. Please register.");
            return false;
          } catch (e) {
            console.error("Backend login error", e);
            // Fall through to localStorage
          }
        }
        
        // Offline fallback: localStorage
        const auth = getAuth();
        if (!auth || auth.phone !== email) {
          setAuthError("User not found locally. Please register.");
          return false;
        }
        
        const session = { loggedIn: true, loginTime: new Date().toISOString(), email: email };
        saveSession(session);
        generateSampleData();
        setIsLoggedIn(true);
        refreshData();
        return true;
      } finally {
        setIsAuthLoading(false);
      }
    },
    [actor, refreshData]
  );

  const logout = useCallback(() => {
    clearSession();
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
    setAuthError(null);
  }, []);

  const register = useCallback(
    async (
      email: string,
      financierName: string,
      businessName: string,
    ) => {
      setIsAuthLoading(true);
      setAuthError(null);
      try {
        setActiveEmail(email); // Set before actor calls to inject identity
        
        // Try backend registration first
        if (actor) {
          try {
            const result = await (actor as any).register(
              email,
              financierName,
              businessName,
              UserRole.admin,
            );
            if (result.__kind__ === "err") {
              setAuthError(result.err || "Registration failed.");
              return;
            }
          } catch (e) {
            console.error("Backend register error", e);
            // Fall through to localStorage only
          }
        }
        // Always save locally for offline support
        saveAuth({ phone: email, pin: "google-auth", role: "admin" });
        const newSettings: Settings = ensureTrialEnd({
          financierName,
          businessName,
          phone: email,
          language: "en",
          theme: "dark",
          plan: "free",
          planType: null,
          planExpiry: null,
          role: "admin",
        });
        saveSettings(newSettings);
        const session = { loggedIn: true, loginTime: new Date().toISOString(), email: email };
        saveSession(session);
        generateSampleData();
        setHasAuth(true);
        setIsLoggedIn(true);
        setSettings(newSettings);
        refreshData();
      } finally {
        setIsAuthLoading(false);
      }
    },
    [actor, refreshData],
  );



  const checkPhoneExists = useCallback(
    async (phone: string): Promise<boolean> => {
      // Try backend first
      if (actor) {
        try {
          return await actor.phoneExists(phone);
        } catch {
          // Fall through to localStorage
        }
      }
      const auth = getAuth();
      return auth !== null && auth.phone === phone;
    },
    [actor],
  );

  const updateSettings = useCallback((s: Partial<Settings>) => {
    const updated = { ...getSettings(), ...s };
    saveSettings(updated);
    setSettings(updated);
  }, []);

  const saveClient = useCallback((client: Client) => {
    const all = getClients();
    const idx = all.findIndex((c) => c.id === client.id);
    const next =
      idx >= 0
        ? all.map((c) => (c.id === client.id ? client : c))
        : [...all, client];
    saveClients(next);
    setClients(next);
    // Secondary Supabase sync (fire-and-forget)
    if (hasSecondaryCredentials()) {
      syncClientToSecondary(client).catch(() => {});
    }
  }, []);

  const deleteClient = useCallback((id: string) => {
    const next = getClients().filter((c) => c.id !== id);
    saveClients(next);
    setClients(next);
  }, []);

  const saveLoan = useCallback((loan: Loan) => {
    const all = getLoans();
    const idx = all.findIndex((l) => l.id === loan.id);
    const next =
      idx >= 0 ? all.map((l) => (l.id === loan.id ? loan : l)) : [...all, loan];
    saveLoans(next);
    setLoans(next);
    // Secondary Supabase sync (fire-and-forget)
    if (hasSecondaryCredentials()) {
      const allClients = getClients();
      const clientName =
        allClients.find((c) => c.id === loan.clientId)?.name || "Unknown";
      syncLoanToSecondary(loan, getPayments(), clientName).catch(() => {});
    }
  }, []);

  const deleteLoan = useCallback((id: string) => {
    const next = getLoans().filter((l) => l.id !== id);
    saveLoans(next);
    setLoans(next);
  }, []);

  const savePayment = useCallback((payment: Payment) => {
    const all = getPayments();
    const idx = all.findIndex((p) => p.id === payment.id);
    const next =
      idx >= 0
        ? all.map((p) => (p.id === payment.id ? payment : p))
        : [...all, payment];
    savePayments(next);
    setPayments(next);
    // Secondary Supabase sync (fire-and-forget)
    if (hasSecondaryCredentials()) {
      // Resolve client name via loanId
      const allLoans = getLoans();
      const allClients = getClients();
      const loan = allLoans.find((l) => l.id === payment.loanId);
      const clientName = loan
        ? allClients.find((c) => c.id === loan.clientId)?.name || "Unknown"
        : "Unknown";
      syncPaymentToSecondary(payment, clientName).catch(() => {});
    }
  }, []);

  const deletePayment = useCallback((id: string) => {
    const next = getPayments().filter((p) => p.id !== id);
    savePayments(next);
    setPayments(next);
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handler = () => refreshData();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refreshData]);

  const lang = settings.language;
  const tFn = useCallback(
    (key: TranslationKey) => translate(key, lang),
    [lang],
  );

  // Bulk sync to secondary Supabase
  const syncAllToSecondary = useCallback(async () => {
    if (!hasSecondaryCredentials()) return;
    setSecondarySupabaseStatus("syncing");
    const result = await syncAllDataToSecondary(
      getClients(),
      getLoans(),
      getPayments(),
    );
    setSecondarySupabaseStatus(result.success ? "connected" : "failed");
  }, []);

  return {
    clients,
    loans,
    payments,
    settings,
    currentPage,
    selectedClientId,
    selectedLoanId,
    isLoggedIn,
    hasAuth,
    isAuthLoading,
    authError,
    language: lang,
    role,
    isPro,
    isTrialActive,
    trialDaysRemaining,
    showUpgradeModal,
    setShowUpgradeModal,
    upgradePro,
    navigate,
    login,
    logout,
    register,
    checkPhoneExists,
    refreshData,
    updateSettings,
    saveClient,
    deleteClient,
    saveLoan,
    deleteLoan,
    savePayment,
    deletePayment,
    t: tFn,
    secondarySupabaseStatus,
    syncAllToSecondary,
  };
}
