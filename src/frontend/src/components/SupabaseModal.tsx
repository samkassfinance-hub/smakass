/**
 * SupabaseModal ΓÇö Premium modal for connecting a secondary Supabase project.
 * Mobile-first, matches KaasFlow design language.
 */
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Copy,
  Database,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type SecondaryConnectionStatus,
  TABLE_CREATION_SQL,
  checkTablesExist,
  clearSecondaryCredentials,
  createTemporaryClient,
  getSecondaryCredentials,
  hasSecondaryCredentials,
  isValidSupabaseUrl,
  saveSecondaryCredentials,
  syncAllDataToSecondary,
  testConnection,
} from "../lib/secondarySupabase";
import type { Client, Loan, Payment } from "../types";

/* ΓöÇΓöÇ Props ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTamil: boolean;
  clients: Client[];
  loans: Loan[];
  payments: Payment[];
  onStatusChange?: (status: SecondaryConnectionStatus) => void;
}

/* ΓöÇΓöÇ Status badge colors ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const STATUS_CONFIG: Record<
  SecondaryConnectionStatus,
  { color: string; bg: string; border: string; label: string; labelTa: string }
> = {
  connected: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
    label: "Connected",
    labelTa: "α«çα«úα»êα«òα»ìα«òα«¬α»ìα«¬α«ƒα»ìα«ƒα«ñα»ü",
  },
  not_connected: {
    color: "var(--kf-text-muted)",
    bg: "var(--kf-input-bg)",
    border: "var(--kf-input-border)",
    label: "Not Connected",
    labelTa: "α«çα«úα»êα«òα»ìα«òα«¬α»ìα«¬α«ƒα«╡α«┐α«▓α»ìα«▓α»ê",
  },
  invalid: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
    label: "Invalid Credentials",
    labelTa: "α«ñα«╡α«▒α«╛α«⌐ α«Üα«╛α«⌐α»ìα«▒α»üα«òα«│α»ì",
  },
  syncing: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    label: "Syncing...",
    labelTa: "α«Æα«ñα»ìα«ñα«┐α«Üα»êα«òα»ìα«òα«┐α«▒α«ñα»ü...",
  },
  failed: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
    label: "Connection Failed",
    labelTa: "α«çα«úα»êα«¬α»ìα«¬α»ü α«ñα»ïα«▓α»ìα«╡α«┐",
  },
};

export default function SupabaseModal({
  isOpen,
  onClose,
  isTamil,
  clients,
  loans,
  payments,
  onStatusChange,
}: SupabaseModalProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [status, setStatus] = useState<SecondaryConnectionStatus>("not_connected");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [tablesReady, setTablesReady] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load existing credentials on open
  useEffect(() => {
    if (isOpen) {
      const creds = getSecondaryCredentials();
      if (creds) {
        setUrl(creds.url);
        setAnonKey(creds.anonKey);
        setStatus("connected");
      } else {
        setUrl("");
        setAnonKey("");
        setStatus("not_connected");
      }
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowSql(false);
      setTablesReady(false);
    }
  }, [isOpen]);

  // Notify parent of status changes
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const updateStatus = useCallback(
    (s: SecondaryConnectionStatus) => {
      setStatus(s);
    },
    [],
  );

  /* ΓöÇΓöÇ Connect handler ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const handleConnect = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!url.trim() || !anonKey.trim()) {
      setErrorMsg(
        isTamil
          ? "URL α««α«▒α»ìα«▒α»üα««α»ì Anon Key α«çα«░α«úα»ìα«ƒα»êα«»α»üα««α»ì α«ëα«│α»ìα«│α«┐α«ƒα«╡α»üα««α»ì"
          : "Please enter both URL and Anon Key",
      );
      return;
    }

    if (!isValidSupabaseUrl(url.trim())) {
      setErrorMsg(
        isTamil
          ? "α«ñα«╡α«▒α«╛α«⌐ Supabase URL α«╡α«ƒα«┐α«╡α««α»ì"
          : "Invalid Supabase URL. Must be https://your-project.supabase.co",
      );
      updateStatus("invalid");
      return;
    }

    setLoading(true);
    updateStatus("syncing");

    // Test connection
    const result = await testConnection(url.trim(), anonKey.trim());
    if (!result.success) {
      setErrorMsg(result.error || (isTamil ? "α«çα«úα»êα«¬α»ìα«¬α»ü α«ñα»ïα«▓α»ìα«╡α«┐" : "Connection failed"));
      updateStatus("invalid");
      setLoading(false);
      return;
    }

    // Check tables
    const client = createTemporaryClient(url.trim(), anonKey.trim());
    const tables = await checkTablesExist(client);
    const allTablesExist = tables.clients && tables.loans && tables.payments;

    if (!allTablesExist) {
      // Show SQL creation instructions
      setShowSql(true);
      setTablesReady(false);

      const missingTables = [];
      if (!tables.clients) missingTables.push("clients");
      if (!tables.loans) missingTables.push("loans");
      if (!tables.payments) missingTables.push("payments");

      setErrorMsg(
        isTamil
          ? `α«çα«¿α»ìα«ñ α«àα«ƒα»ìα«ƒα«╡α«úα»êα«òα«│α»ì α«òα«╛α«úα«¬α»ìα«¬α«ƒα«╡α«┐α«▓α»ìα«▓α»ê: ${missingTables.join(", ")}. α«òα»Çα«┤α»ç α«ëα«│α»ìα«│ SQL-α«É α«çα«»α«òα»ìα«òα«╡α»üα««α»ì.`
          : `Tables missing: ${missingTables.join(", ")}. Run the SQL below in your Supabase dashboard.`,
      );

      // Still save credentials ΓÇö tables can be created later
      saveSecondaryCredentials({ url: url.trim(), anonKey: anonKey.trim() });
      updateStatus("failed");
      setLoading(false);
      return;
    }

    // All good ΓÇö save and start syncing
    saveSecondaryCredentials({ url: url.trim(), anonKey: anonKey.trim() });
    setTablesReady(true);
    updateStatus("syncing");

    // Bulk sync existing data
    const syncResult = await syncAllDataToSecondary(clients, loans, payments);
    if (syncResult.success) {
      updateStatus("connected");
      setSuccessMsg(
        isTamil
          ? "α«╡α»åα«▒α»ìα«▒α«┐α«òα«░α««α«╛α«ò α«çα«úα»êα«òα»ìα«òα«¬α»ìα«¬α«ƒα»ìα«ƒα«ñα»ü! α«ñα«░α«╡α»ü α«Æα«ñα»ìα«ñα«┐α«Üα»êα«╡α«┐α«▓α»ì α«ëα«│α»ìα«│α«ñα»ü Γ£ô"
          : "Successfully connected! Data is syncing Γ£ô",
      );
    } else {
      updateStatus("connected");
      setSuccessMsg(
        isTamil
          ? "α«çα«úα»êα«òα»ìα«òα«¬α»ìα«¬α«ƒα»ìα«ƒα«ñα»ü! α«ñα«░α«╡α»ü α«¬α«┐α«⌐α»ìα«⌐α«úα«┐α«»α«┐α«▓α»ì α«Æα«ñα»ìα«ñα«┐α«Üα»êα«òα»ìα«òα«¬α»ìα«¬α«ƒα»üα««α»ì."
          : "Connected! Data will sync in the background.",
      );
    }
    setLoading(false);
  };

  /* ΓöÇΓöÇ Disconnect handler ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const handleDisconnect = () => {
    clearSecondaryCredentials();
    setUrl("");
    setAnonKey("");
    updateStatus("not_connected");
    setErrorMsg(null);
    setTablesReady(false);
    setShowSql(false);
    setSuccessMsg(
      isTamil ? "α«ñα»üα«úα»ìα«ƒα«┐α«òα»ìα«òα«¬α»ìα«¬α«ƒα»ìα«ƒα«ñα»ü Γ£ô" : "Disconnected successfully Γ£ô",
    );
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  /* ΓöÇΓöÇ Test handler ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const handleTest = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const result = await testConnection(
      url.trim() || "",
      anonKey.trim() || "",
    );
    if (result.success) {
      setSuccessMsg(
        isTamil ? "α«çα«úα»êα«¬α»ìα«¬α»ü α«╡α»åα«▒α»ìα«▒α«┐α«òα«░α««α«╛α«⌐α«ñα»ü Γ£ô" : "Connection test passed Γ£ô",
      );

      // Also check tables
      const client = createTemporaryClient(url.trim(), anonKey.trim());
      const tables = await checkTablesExist(client);
      const allExist = tables.clients && tables.loans && tables.payments;
      setTablesReady(allExist);
      if (!allExist) {
        setShowSql(true);
        const missing = [];
        if (!tables.clients) missing.push("clients");
        if (!tables.loans) missing.push("loans");
        if (!tables.payments) missing.push("payments");
        setErrorMsg(
          isTamil
            ? `α«àα«ƒα»ìα«ƒα«╡α«úα»êα«òα«│α»ì α«çα«▓α»ìα«▓α»ê: ${missing.join(", ")}`
            : `Missing tables: ${missing.join(", ")}. Create them using the SQL below.`,
        );
      }
    } else {
      setErrorMsg(result.error || (isTamil ? "α«çα«úα»êα«¬α»ìα«¬α»ü α«ñα»ïα«▓α»ìα«╡α«┐" : "Test failed"));
      updateStatus("invalid");
    }
    setLoading(false);
  };

  /* ΓöÇΓöÇ Copy SQL ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(TABLE_CREATION_SQL);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = TABLE_CREATION_SQL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  const isConnected = hasSecondaryCredentials() && status === "connected";
  const statusConf = STATUS_CONFIG[status];

  return (
    <div
      className="supabase-modal-overlay"
      data-ocid="supabase_modal.overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        ref={modalRef}
        className="supabase-modal-box"
        data-ocid="supabase_modal.box"
      >
        {/* ΓöÇΓöÇ Header ΓöÇΓöÇ */}
        <div className="supabase-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="supabase-modal-icon">
              <Database size={20} />
            </div>
            <div>
              <h2 className="supabase-modal-title">
                {isTamil ? "Supabase α«çα«úα»êα«¬α»ìα«¬α»ü" : "Connect Supabase"}
              </h2>
              <p className="supabase-modal-subtitle">
                {isTamil
                  ? "α«ëα«Öα»ìα«òα«│α»ì α«ñα«⌐α«┐α«¬α»ìα«¬α«ƒα»ìα«ƒ α««α»çα«òα«òα»ìα«òα«úα«┐α«⌐α«┐ α«Üα»çα««α«┐α«¬α»ìα«¬α»ü"
                  : "Your private cloud storage"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="supabase-modal-close"
            onClick={onClose}
            data-ocid="supabase_modal.close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ΓöÇΓöÇ Status badge ΓöÇΓöÇ */}
        <div
          className="supabase-status-badge"
          style={{
            color: statusConf.color,
            background: statusConf.bg,
            borderColor: statusConf.border,
          }}
        >
          <span
            className={`supabase-status-dot ${status === "connected" ? "pulse-connected" : ""} ${status === "syncing" ? "pulse-syncing" : ""}`}
            style={{ background: statusConf.color }}
          />
          {status === "syncing" && (
            <Loader2
              size={13}
              style={{ animation: "supabaseSpin 1s linear infinite" }}
            />
          )}
          {isTamil ? statusConf.labelTa : statusConf.label}
        </div>

        {/* ΓöÇΓöÇ Info message ΓöÇΓöÇ */}
        <div className="supabase-info-card">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <ShieldCheck
              size={18}
              style={{ color: "var(--kf-amber)", flexShrink: 0, marginTop: 2 }}
            />
            <p className="supabase-info-text">
              {isTamil
                ? "α«ëα«Öα»ìα«òα«│α»ì α«¿α«┐α«ñα«┐ α«ñα«░α«╡α»üα«òα»ìα«òα»ü α«ëα«Öα»ìα«òα«│α»ì α«Üα»èα«¿α»ìα«ñ α«ñα«⌐α«┐α«¬α»ìα«¬α«ƒα»ìα«ƒ α«Üα»çα««α«┐α«¬α»ìα«¬α«òα«ñα»ìα«ñα»êα«¬α»ì α«¬α«»α«⌐α»ìα«¬α«ƒα»üα«ñα»ìα«ñ α«╡α«┐α«░α»üα««α»ìα«¬α«┐α«⌐α«╛α«▓α»ì, α«ëα«Öα»ìα«òα«│α»ì α«ñα«⌐α«┐α«¬α»ìα«¬α«ƒα»ìα«ƒ α«ñα«░α«╡α»ê α«¬α«╛α«ñα»üα«òα«╛α«¬α»ìα«¬α«╛α«ò α«çα«úα»êα«òα»ìα«òα«▓α«╛α««α»ì. α«çα«úα»êα«òα»ìα«òα«¬α»ìα«¬α«ƒα»ìα«ƒα«╡α»üα«ƒα«⌐α»ì, α«Äα«ñα«┐α«░α»ìα«òα«╛α«▓ α«ñα«░α«╡α»ü α«àα«⌐α»êα«ñα»ìα«ñα»üα««α»ì α«ñα«╛α«⌐α«╛α«òα«╡α»ç α«ëα«Öα»ìα«òα«│α»ì α«ñα«⌐α«┐α«¬α»ìα«¬α«ƒα»ìα«ƒ α«Üα»çα««α«┐α«¬α»ìα«¬α«òα«ñα»ìα«ñα«┐α«▓α»ì α«Æα«ñα»ìα«ñα«┐α«Üα»êα«òα»ìα«òα«¬α»ìα«¬α«ƒα»üα««α»ì."
                : "If you would like to use your own private storage for your finance data, you can connect your personal data securely. Once connected, all future data will automatically sync to your private storage."}
            </p>
          </div>
          <div className="supabase-contact-row">
            <span>
              {isTamil ? "α«çα«¿α»ìα«ñ α«Üα»çα«╡α»ê α«ñα»çα«╡α»êα«¬α»ìα«¬α«ƒα»ìα«ƒα«╛α«▓α»ì:" : "If you need this service:"}
            </span>
            <div className="supabase-contact-links">
              <a
                href="https://wa.me/917904987242"
                target="_blank"
                rel="noopener noreferrer"
                className="supabase-contact-chip whatsapp"
              >
                <span>≡ƒô▒</span> WhatsApp: 7904987242
                <ExternalLink size={10} />
              </a>
              <a
                href="mailto:mohansampath098@gmail.com"
                className="supabase-contact-chip email"
              >
                <span>Γ£ë∩╕Å</span> mohansampath098@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* ΓöÇΓöÇ Input fields ΓöÇΓöÇ */}
        <div className="supabase-form-section">
          <div className="form-group">
            <label className="form-label" htmlFor="sb-url">
              <Cloud size={12} style={{ display: "inline", marginRight: 4 }} />
              {isTamil ? "Supabase α«ñα«┐α«ƒα»ìα«ƒ URL" : "Supabase Project URL"}
            </label>
            <input
              id="sb-url"
              data-ocid="supabase_modal.url_input"
              type="url"
              className="form-input"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErrorMsg(null);
              }}
              disabled={loading}
              style={{ fontSize: "0.85rem" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sb-key">
              <Link2 size={12} style={{ display: "inline", marginRight: 4 }} />
              {isTamil ? "Supabase Anon Key" : "Supabase Anon Key"}
            </label>
            <input
              id="sb-key"
              data-ocid="supabase_modal.key_input"
              type="password"
              className="form-input"
              placeholder={
                isTamil
                  ? "α«ëα«Öα»ìα«òα«│α»ì α«¬α»èα«ñα»ü anon key α«ëα«│α»ìα«│α«┐α«ƒα«╡α»üα««α»ì"
                  : "Enter your public anon key"
              }
              value={anonKey}
              onChange={(e) => {
                setAnonKey(e.target.value);
                setErrorMsg(null);
              }}
              disabled={loading}
              style={{ fontSize: "0.85rem", fontFamily: "monospace" }}
            />
          </div>
        </div>

        {/* ΓöÇΓöÇ Error/Success messages ΓöÇΓöÇ */}
        {errorMsg && (
          <div className="supabase-msg error" data-ocid="supabase_modal.error">
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div
            className="supabase-msg success"
            data-ocid="supabase_modal.success"
          >
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ΓöÇΓöÇ SQL Creation Block ΓöÇΓöÇ */}
        {showSql && (
          <div className="supabase-sql-section">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--kf-amber)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                ≡ƒôï{" "}
                {isTamil
                  ? "Supabase SQL α«Äα«ƒα«┐α«ƒα»ìα«ƒα«░α«┐α«▓α»ì α«çα«»α«òα»ìα«òα«╡α»üα««α»ì"
                  : "Run in Supabase SQL Editor"}
              </span>
              <button
                type="button"
                className="supabase-copy-btn"
                onClick={handleCopySql}
                data-ocid="supabase_modal.copy_sql"
              >
                {sqlCopied ? (
                  <>
                    <CheckCircle2 size={12} /> {isTamil ? "α«¿α«òα«▓α»åα«ƒα»üα«òα»ìα«òα«¬α»ìα«¬α«ƒα»ìα«ƒα«ñα»ü" : "Copied!"}
                  </>
                ) : (
                  <>
                    <Copy size={12} /> {isTamil ? "α«¿α«òα«▓α»åα«ƒα»ü" : "Copy SQL"}
                  </>
                )}
              </button>
            </div>
            <pre className="supabase-sql-block">
              <code>{TABLE_CREATION_SQL}</code>
            </pre>
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--kf-text-muted)",
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              {isTamil
                ? "α««α»çα«▓α»ç α«ëα«│α»ìα«│ SQL-α«É α«¿α«òα«▓α»åα«ƒα»üα«ñα»ìα«ñα»ü, α«ëα«Öα»ìα«òα«│α»ì Supabase Dashboard > SQL Editor-α«▓α»ì α«Æα«ƒα»ìα«ƒα«┐, Run α«òα«┐α«│α«┐α«òα»ì α«Üα»åα«»α»ìα«»α»üα«Öα»ìα«òα«│α»ì. α«¬α«┐α«▒α«òα»ü α««α»Çα«úα»ìα«ƒα»üα««α»ì Connect α«òα«┐α«│α«┐α«òα»ì α«Üα»åα«»α»ìα«»α»üα«Öα»ìα«òα«│α»ì."
                : "Copy the SQL above, go to your Supabase Dashboard ΓåÆ SQL Editor ΓåÆ New Query, paste it, and click Run. Then click Connect again."}
            </p>
          </div>
        )}

        {/* ΓöÇΓöÇ Action buttons ΓöÇΓöÇ */}
        <div className="supabase-actions">
          <button
            type="button"
            data-ocid="supabase_modal.connect_button"
            className="btn-primary"
            onClick={handleConnect}
            disabled={loading || (!url.trim() && !anonKey.trim())}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading || (!url.trim() && !anonKey.trim()) ? 0.55 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  style={{ animation: "supabaseSpin 1s linear infinite" }}
                />
                {isTamil ? "α«çα«úα»êα«òα»ìα«òα«┐α«▒α«ñα»ü..." : "Connecting..."}
              </>
            ) : (
              <>
                <Zap size={16} />
                {isTamil ? "α«çα«úα»ê" : "Connect"}
              </>
            )}
          </button>

          <div
            style={{ display: "flex", gap: 8 }}
          >
            <button
              type="button"
              data-ocid="supabase_modal.test_button"
              className="btn-secondary"
              onClick={handleTest}
              disabled={loading || !url.trim() || !anonKey.trim()}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: loading || !url.trim() || !anonKey.trim() ? 0.55 : 1,
              }}
            >
              <RefreshCw size={14} />
              {isTamil ? "α«Üα»ïα«ñα«⌐α»ê" : "Test"}
            </button>

            <button
              type="button"
              data-ocid="supabase_modal.disconnect_button"
              className="btn-secondary"
              onClick={handleDisconnect}
              disabled={loading || !isConnected}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: loading || !isConnected ? 0.55 : 1,
                color: isConnected ? "var(--kf-danger)" : undefined,
                borderColor: isConnected ? "rgba(239,68,68,0.3)" : undefined,
              }}
            >
              <Unplug size={14} />
              {isTamil ? "α«ñα»üα«úα»ìα«ƒα«┐" : "Disconnect"}
            </button>
          </div>
        </div>

        {/* ΓöÇΓöÇ Connected features list ΓöÇΓöÇ */}
        {isConnected && tablesReady && (
          <div className="supabase-connected-info">
            <div className="supabase-feature-row">
              <CheckCircle2 size={14} style={{ color: "var(--kf-success)" }} />
              <span>
                {isTamil
                  ? "α«╡α«╛α«ƒα«┐α«òα»ìα«òα»êα«»α«╛α«│α«░α»ìα«òα«│α»ì α«Æα«ñα»ìα«ñα«┐α«Üα»êα«╡α»ü"
                  : "Clients syncing"}
              </span>
            </div>
            <div className="supabase-feature-row">
              <CheckCircle2 size={14} style={{ color: "var(--kf-success)" }} />
              <span>
                {isTamil ? "α«òα«ƒα«⌐α»ìα«òα«│α»ì α«Æα«ñα»ìα«ñα«┐α«Üα»êα«╡α»ü" : "Loans syncing"}
              </span>
            </div>
            <div className="supabase-feature-row">
              <CheckCircle2 size={14} style={{ color: "var(--kf-success)" }} />
              <span>
                {isTamil
                  ? "α«¬α«úα««α»ì α«Üα»åα«▓α»üα«ñα»ìα«ñα»üα«ñα«▓α»ì α«Æα«ñα»ìα«ñα«┐α«Üα»êα«╡α»ü"
                  : "Payments syncing"}
              </span>
            </div>
            <div className="supabase-feature-row">
              <ShieldCheck size={14} style={{ color: "var(--kf-amber)" }} />
              <span>
                {isTamil
                  ? "α««α»üα«┤α»ü α«òα»üα«▒α«┐α«»α«╛α«òα»ìα«òα««α»ì α«¬α«»α«⌐α»ìα«¬α«ƒα»üα«ñα»ìα«ñα«¬α»ìα«¬α«ƒα»üα«òα«┐α«▒α«ñα»ü"
                  : "Credentials stored securely"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
