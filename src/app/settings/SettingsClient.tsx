"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const labelStyle = { display: "block" as const, fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "6px" };
const inputStyle = { height: "42px", padding: "0 14px", background: "var(--bg)", border: "1px solid var(--border)", color: "#fff", fontSize: "14px", width: "100%" };
const btnStyle = { height: "36px", padding: "0 20px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em", cursor: "pointer" as const, transition: "all 0.12s" };
const sectionStyle = { background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "24px" };
const headingStyle = { fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "#fff", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: "16px" };

type Props = { user: { name: string; email: string; avatar: string; tier: string; hasPassword: boolean; isOAuth: boolean; hasStripe: boolean; subscription: { status: string; periodEnd: string } | null } };

export function SettingsClient({ user }: Props) {
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
        <div style={{ ...sectionStyle, marginBottom: "16px" }}>
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
