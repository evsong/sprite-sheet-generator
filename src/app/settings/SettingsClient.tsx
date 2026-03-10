"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const labelStyle = { display: "block" as const, fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "6px" };
const inputStyle = { height: "42px", padding: "0 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "#fff", fontSize: "14px", width: "100%" };
const btnStyle = { height: "36px", padding: "0 20px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em", cursor: "pointer" as const, transition: "all 0.12s" };
const sectionStyle = { background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "24px" };
const headingStyle = { fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "#fff", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: "16px" };

type AiUsageData = { used: number; limit: number; history: { date: string; count: number }[]; resetsAt: string };
type Props = { user: { name: string; email: string; avatar: string; tier: string; hasPassword: boolean; isOAuth: boolean; hasStripe: boolean; subscription: { status: string; periodEnd: string } | null }; aiUsage: AiUsageData };

export function SettingsClient({ user, aiUsage }: Props) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [msg, setMsg] = useState("");
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [delConfirm, setDelConfirm] = useState("");

  const openPortal = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const startCheckout = async (tier: string) => {
    const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const saveProfile = async () => {
    setMsg("");
    const res = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, avatar }) });
    setMsg(res.ok ? "Saved" : "Failed");
  };

  const changePassword = async () => {
    setPwdMsg("");
    const res = await fetch("/api/user/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }) });
    const data = await res.json();
    setPwdMsg(res.ok ? "Password updated" : data.error);
    if (res.ok) { setCurPwd(""); setNewPwd(""); }
  };

  const deleteAccount = async () => {
    if (delConfirm !== "DELETE") return;
    await fetch("/api/user/delete", { method: "DELETE" });
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", paddingTop: "calc(var(--nav-h) + 40px)" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px 80px" }}>
        <Link href="/" style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "24px", display: "block" }}>
          ← Back
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Settings</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", marginBottom: "32px" }}>
          {user.email} · <span style={{ color: "var(--cyan)" }}>{user.tier}</span>
        </p>

        {/* Profile */}
        <div style={{ ...sectionStyle, marginBottom: "16px" }}>
          <h2 style={headingStyle}>Profile</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label style={labelStyle}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Avatar URL</label>
              <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." style={inputStyle} />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={saveProfile} style={{ ...btnStyle, background: "#fff", color: "#000", border: "1px solid #fff" }}>Save</button>
              {msg && <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: msg === "Saved" ? "#22C55E" : "#EF4444" }}>{msg}</span>}
            </div>
          </div>
        </div>

        {/* AI Usage */}
        <div style={{ ...sectionStyle, marginBottom: "16px" }}>
          <h2 style={headingStyle}>AI Usage</h2>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
            <span style={{ color: aiUsage.used >= aiUsage.limit ? "#EF4444" : "#fff" }}>
              {aiUsage.used} / {aiUsage.limit}
            </span>
            {" generations used today"}
            <span style={{ marginLeft: "8px", fontSize: "10px", color: "var(--cyan)", background: "rgba(6,182,212,0.1)", padding: "1px 6px" }}>{user.tier}</span>
          </div>
          {/* Progress bar */}
          <div style={{ height: "6px", background: "var(--bg)", border: "1px solid var(--border)", marginBottom: "8px" }}>
            <div style={{
              height: "100%",
              width: `${Math.min((aiUsage.used / Math.max(aiUsage.limit, 1)) * 100, 100)}%`,
              background: aiUsage.used >= aiUsage.limit ? "#EF4444" : aiUsage.used >= aiUsage.limit * 0.75 ? "#F59E0B" : "var(--cyan)",
              transition: "width 0.3s",
            }} />
          </div>
          {aiUsage.used >= aiUsage.limit ? (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#EF4444", marginBottom: "12px" }}>Daily limit reached</p>
          ) : (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "12px" }}>
              Resets at {new Date(aiUsage.resetsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC
            </p>
          )}
          {/* 7-day history */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", marginBottom: "4px" }}>Last 7 days</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "64px" }}>
            {aiUsage.history.map((day) => {
              const maxCount = Math.max(...aiUsage.history.map((d) => d.count), 1);
              const pct = (day.count / maxCount) * 100;
              return (
                <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--text-muted)" }}>{day.count || ""}</span>
                  <div style={{ width: "100%", minHeight: day.count > 0 ? "4px" : "1px", height: `${Math.max(pct, 2)}%`, background: day.count > 0 ? "var(--cyan)" : "var(--border)", opacity: day.count > 0 ? 1 : 0.4, transition: "height 0.3s" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--text-muted)" }}>{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Password */}
        {user.hasPassword && !user.isOAuth && (
          <div style={{ ...sectionStyle, marginBottom: "16px" }}>
            <h2 style={headingStyle}>Change Password</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label style={labelStyle}>Current Password</label>
                <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 6 characters" style={inputStyle} />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={changePassword} style={{ ...btnStyle, background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" }}>Update Password</button>
                {pwdMsg && <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: pwdMsg === "Password updated" ? "#22C55E" : "#EF4444" }}>{pwdMsg}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Billing */}
        <div id="billing" style={{ ...sectionStyle, marginBottom: "16px" }}>
          <h2 style={headingStyle}>Billing</h2>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
            <span>Tier: <span style={{ color: "var(--cyan)" }}>{user.tier}</span></span>
            {user.subscription && (
              <span> · {user.subscription.status} · Renews {new Date(user.subscription.periodEnd).toLocaleDateString()}</span>
            )}
          </div>
          {user.hasStripe ? (
            <button onClick={openPortal} style={{ ...btnStyle, background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" }}>Manage Subscription</button>
          ) : user.tier === "FREE" ? (
            <div className="flex gap-2">
              <button onClick={() => startCheckout("PRO")} style={{ ...btnStyle, background: "#fff", color: "#000", border: "1px solid #fff" }}>Upgrade to Pro</button>
              <button onClick={() => startCheckout("TEAM")} style={{ ...btnStyle, background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" }}>Upgrade to Team</button>
            </div>
          ) : null}
        </div>

        {/* Delete Account */}
        <div style={{ ...sectionStyle, borderColor: "rgba(239,68,68,0.3)" }}>
          <h2 style={{ ...headingStyle, color: "#EF4444" }}>Delete Account</h2>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
            This action is permanent. Type DELETE to confirm.
          </p>
          <div className="flex gap-3">
            <input value={delConfirm} onChange={e => setDelConfirm(e.target.value)} placeholder="Type DELETE" style={{ ...inputStyle, maxWidth: "200px" }} />
            <button onClick={deleteAccount} disabled={delConfirm !== "DELETE"} style={{ ...btnStyle, background: delConfirm === "DELETE" ? "#EF4444" : "transparent", color: delConfirm === "DELETE" ? "#fff" : "#666", border: "1px solid rgba(239,68,68,0.3)" }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
