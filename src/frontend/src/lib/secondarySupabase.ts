/**
 * Secondary Supabase Connection System
 * ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
 * Manages an optional user-owned Supabase database connection.
 * The primary Supabase/backend is NEVER touched by this module.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
export type SecondaryConnectionStatus =
  | "connected"
  | "not_connected"
  | "invalid"
  | "syncing"
  | "failed";

export interface SecondaryCredentials {
  url: string;
  anonKey: string;
}

interface SyncResult {
  success: boolean;
  error?: string;
}

/* ΓöÇΓöÇ Constants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const STORAGE_KEY = "kf_secondary_supabase";
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 500;

/* ΓöÇΓöÇ Credential helpers (Base64 obfuscation) ΓöÇΓöÇΓöÇΓöÇ */
function encode(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return btoa(text);
  }
}

function decode(encoded: string): string {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return atob(encoded);
  }
}

export function saveSecondaryCredentials(creds: SecondaryCredentials): void {
  const payload = JSON.stringify({
    u: encode(creds.url),
    k: encode(creds.anonKey),
  });
  localStorage.setItem(STORAGE_KEY, encode(payload));
}

export function getSecondaryCredentials(): SecondaryCredentials | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(decode(raw)) as { u: string; k: string };
    return {
      url: decode(payload.u),
      anonKey: decode(payload.k),
    };
  } catch {
    return null;
  }
}

export function clearSecondaryCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
  cachedClient = null;
}

export function hasSecondaryCredentials(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/* ΓöÇΓöÇ Client management ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
let cachedClient: SupabaseClient | null = null;

export function getSecondaryClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  const creds = getSecondaryCredentials();
  if (!creds) return null;
  try {
    cachedClient = createClient(creds.url, creds.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return cachedClient;
  } catch {
    return null;
  }
}

export function createTemporaryClient(
  url: string,
  anonKey: string,
): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/* ΓöÇΓöÇ URL Validation ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
export function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname.endsWith(".supabase.co") ||
        parsed.hostname.endsWith(".supabase.in") ||
        parsed.hostname.includes("supabase"))
    );
  } catch {
    return false;
  }
}

/* ΓöÇΓöÇ Connection testing ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
export async function testConnection(
  url: string,
  anonKey: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidSupabaseUrl(url)) {
    return { success: false, error: "Invalid Supabase URL format" };
  }
  if (!anonKey || anonKey.length < 20) {
    return { success: false, error: "Invalid anon key" };
  }
  try {
    const client = createTemporaryClient(url, anonKey);
    // Try a simple REST health check ΓÇö query a system table
    const { error } = await client.from("clients").select("id").limit(1);
    // If the table doesn't exist yet, that's OK ΓÇö the connection itself works
    if (error && !error.message.includes("does not exist") && !error.message.includes("relation")) {
      // Check if it's an auth/permission error vs table-not-found
      if (error.message.includes("Invalid API key") || error.message.includes("invalid") || error.code === "PGRST301") {
        return { success: false, error: "Invalid API key or URL" };
      }
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

/* ΓöÇΓöÇ Table creation SQL ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
export const TABLE_CREATION_SQL = `
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text,
  address text,
  occupation text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client text,
  principal numeric,
  emi numeric,
  paid numeric,
  remaining numeric,
  status text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text,
  client text,
  amount numeric,
  mode text,
  note text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Enable Row Level Security (allow all for anon key)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 5. Policies: allow full access for anon
CREATE POLICY "Allow all on clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on loans" ON loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
`.trim();

/* ΓöÇΓöÇ Table checking ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
export async function checkTablesExist(
  client: SupabaseClient,
): Promise<{ clients: boolean; loans: boolean; payments: boolean }> {
  const results = { clients: false, loans: false, payments: false };

  for (const table of ["clients", "loans", "payments"] as const) {
    try {
      const { error } = await client.from(table).select("id").limit(1);
      results[table] = !error || !error.message.includes("does not exist");
    } catch {
      results[table] = false;
    }
  }

  return results;
}

/* ΓöÇΓöÇ Retry wrapper ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries - 1) {
        await new Promise((r) =>
          setTimeout(r, RETRY_BASE_MS * Math.pow(2, attempt)),
        );
      }
    }
  }
  throw lastError;
}

/* ΓöÇΓöÇ Sync functions ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

/** Deterministic String-to-UUID helper to resolve type mismatch with Postgres uuid columns */
function stringToUUID(str: string): string {
  if (!str) return "00000000-0000-0000-0000-000000000000";
  
  // If it's already a valid UUID, return it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str.toLowerCase();
  }
  
  // Hash the string deterministically to generate a valid version 4 UUID shape
  let h1 = 0x811c9dc5;
  let h2 = 0xc9dc5811;
  let h3 = 0x5811c9dc;
  let h4 = 0x11c9dc58;
  
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    h1 = (h1 ^ charCode) * 16777619;
    h2 = (h2 ^ (charCode + i)) * 16777619;
    h3 = (h3 ^ (charCode * (i + 1))) * 16777619;
    h4 = (h4 ^ (charCode - i)) * 16777619;
  }
  
  const hex = (val: number) => (val >>> 0).toString(16).padStart(8, "0");
  const rawHex = hex(h1) + hex(h2) + hex(h3) + hex(h4);
  
  const part1 = rawHex.substring(0, 8);
  const part2 = rawHex.substring(8, 12);
  const part3 = "4" + rawHex.substring(13, 16);
  const variant = (parseInt(rawHex.substring(16, 17), 16) & 0x3 | 0x8).toString(16);
  const part4 = variant + rawHex.substring(17, 20);
  const part5 = rawHex.substring(20, 32);
  
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

/** Map app Client → secondary Supabase clients row */
function mapClientForSync(client: {
  id: string;
  name: string;
  phone: string;
  address?: string;
  occ?: string;
  createdAt: string;
}) {
  return {
    id: stringToUUID(client.id),
    name: client.name,
    phone: client.phone,
    address: client.address || "",
    occupation: client.occ || "",
    created_at: client.createdAt,
  };
}

/** Map app Loan → secondary Supabase loans row */
function mapLoanForSync(
  loan: {
    id: string;
    clientId: string;
    amount: number;
    emi: number;
    status: string;
  },
  payments: { loanId: string; amount: number }[],
  clientName: string,
) {
  const paid = payments
    .filter((p) => p.loanId === loan.id)
    .reduce((sum, p) => sum + p.amount, 0);
  const totalDue = loan.emi * 1; // simplified — emi * months
  const remaining = Math.max(0, loan.amount - paid);

  return {
    id: stringToUUID(loan.id),
    client: clientName,
    principal: loan.amount,
    emi: loan.emi,
    paid,
    remaining,
    status: loan.status,
    created_at: new Date().toISOString(),
  };
}

/** Map app Payment → secondary Supabase payments row */
function mapPaymentForSync(
  payment: {
    id: string;
    amount: number;
    date: string;
    mode: string;
    note?: string;
  },
  clientName: string,
) {
  return {
    id: stringToUUID(payment.id),
    date: payment.date,
    client: clientName,
    amount: payment.amount,
    mode: payment.mode,
    note: payment.note || "",
    created_at: new Date().toISOString(),
  };
}

export async function syncClientToSecondary(client: {
  id: string;
  name: string;
  phone: string;
  address?: string;
  occ?: string;
  createdAt: string;
}): Promise<SyncResult> {
  const supabase = getSecondaryClient();
  if (!supabase) return { success: false, error: "Not connected" };

  try {
    await withRetry(async () => {
      const row = mapClientForSync(client);
      const { error } = await supabase.from("clients").upsert(row, {
        onConflict: "id",
      });
      if (error) throw error;
    });
    return { success: true };
  } catch (err) {
    console.warn("[SecondarySupabase] Client sync failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}

export async function syncLoanToSecondary(
  loan: {
    id: string;
    clientId: string;
    amount: number;
    emi: number;
    status: string;
  },
  allPayments: { loanId: string; amount: number }[],
  clientName: string,
): Promise<SyncResult> {
  const supabase = getSecondaryClient();
  if (!supabase) return { success: false, error: "Not connected" };

  try {
    await withRetry(async () => {
      const row = mapLoanForSync(loan, allPayments, clientName);
      const { error } = await supabase.from("loans").upsert(row, {
        onConflict: "id",
      });
      if (error) throw error;
    });
    return { success: true };
  } catch (err) {
    console.warn("[SecondarySupabase] Loan sync failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}

export async function syncPaymentToSecondary(
  payment: {
    id: string;
    amount: number;
    date: string;
    mode: string;
    note?: string;
  },
  clientName: string,
): Promise<SyncResult> {
  const supabase = getSecondaryClient();
  if (!supabase) return { success: false, error: "Not connected" };

  try {
    await withRetry(async () => {
      const row = mapPaymentForSync(payment, clientName);
      const { error } = await supabase.from("payments").upsert(row, {
        onConflict: "id",
      });
      if (error) throw error;
    });
    return { success: true };
  } catch (err) {
    console.warn("[SecondarySupabase] Payment sync failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}

/**
 * Bulk sync ALL data to secondary Supabase.
 * Used after initial connection or reconnection.
 */
export async function syncAllDataToSecondary(
  clients: {
    id: string;
    name: string;
    phone: string;
    address?: string;
    occ?: string;
    createdAt: string;
  }[],
  loans: {
    id: string;
    clientId: string;
    amount: number;
    emi: number;
    status: string;
  }[],
  payments: {
    id: string;
    loanId: string;
    amount: number;
    date: string;
    mode: string;
    note?: string;
  }[],
): Promise<SyncResult> {
  const supabase = getSecondaryClient();
  if (!supabase) return { success: false, error: "Not connected" };

  try {
    // Sync clients
    if (clients.length > 0) {
      const clientRows = clients.map(mapClientForSync);
      const { error: cErr } = await supabase
        .from("clients")
        .upsert(clientRows, { onConflict: "id" });
      if (cErr) console.warn("[SecondarySupabase] Bulk client sync error:", cErr);
    }

    // Build client name map
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    // Sync loans
    if (loans.length > 0) {
      const loanRows = loans.map((loan) =>
        mapLoanForSync(loan, payments, clientMap.get(loan.clientId) || "Unknown"),
      );
      const { error: lErr } = await supabase
        .from("loans")
        .upsert(loanRows, { onConflict: "id" });
      if (lErr) console.warn("[SecondarySupabase] Bulk loan sync error:", lErr);
    }

    // Sync payments ΓÇö we need to map loanId ΓåÆ clientId ΓåÆ clientName
    if (payments.length > 0) {
      const loanClientMap = new Map(loans.map((l) => [l.id, l.clientId]));
      const paymentRows = payments.map((p) => {
        const clientId = loanClientMap.get(p.loanId) || "";
        const clientName = clientMap.get(clientId) || "Unknown";
        return mapPaymentForSync(p, clientName);
      });
      const { error: pErr } = await supabase
        .from("payments")
        .upsert(paymentRows, { onConflict: "id" });
      if (pErr)
        console.warn("[SecondarySupabase] Bulk payment sync error:", pErr);
    }

    return { success: true };
  } catch (err) {
    console.warn("[SecondarySupabase] Bulk sync failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}
