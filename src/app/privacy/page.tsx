import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy Policy — SpriteForge",
  description: "How SpriteForge collects, uses, and protects your data.",
};

const h2 = { fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "#fff", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginTop: "32px", marginBottom: "12px" };
const p = { fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.8, marginBottom: "12px" };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 120px)", paddingTop: "calc(var(--nav-h) + 40px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 80px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
            Privacy Policy
          </h1>
          <p style={{ ...p, marginBottom: "32px" }}>Last updated: February 20, 2026</p>

          <h2 style={h2}>1. Information We Collect</h2>
          <p style={p}>When you create an account, we collect your email address, display name, and avatar URL. When you use the editor, your project data (sprite configurations, uploaded images) is stored in our systems. We also collect basic usage analytics such as page views and feature usage to improve the service.</p>

          <h2 style={h2}>2. How We Use Your Information</h2>
          <p style={p}>We use your information to: provide and maintain the SpriteForge service; process your transactions and manage your subscription; send transactional emails (password resets, account notifications); improve our product based on aggregated usage patterns. We do not sell your personal data to third parties.</p>

          <h2 style={h2}>3. Data Storage and Security</h2>
          <p style={p}>Your data is stored on secure servers provided by Vercel and Neon (PostgreSQL). All data transmission is encrypted via HTTPS/TLS. We implement industry-standard security measures to protect against unauthorized access, alteration, or destruction of your data.</p>

          <h2 style={h2}>4. Third-Party Services</h2>
          <p style={p}>We use the following third-party services: Creem (payment processing as Merchant of Record); Resend (transactional email delivery); Vercel (hosting); Neon (database). Each service has its own privacy policy governing their handling of your data.</p>

          <h2 style={h2}>5. Cookies</h2>
          <p style={p}>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect your ability to use the service.</p>

          <h2 style={h2}>6. Your Rights</h2>
          <p style={p}>You have the right to: access your personal data through your account settings; update or correct your information at any time; delete your account and all associated data from the Settings page; export your project data. To exercise these rights, visit your account settings or contact us at support@spriteforge.online.</p>

          <h2 style={h2}>7. Data Retention</h2>
          <p style={p}>We retain your data for as long as your account is active. When you delete your account, all personal data and project data is permanently removed from our systems within 30 days.</p>

          <h2 style={h2}>8. Children&apos;s Privacy</h2>
          <p style={p}>SpriteForge is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>

          <h2 style={h2}>9. Changes to This Policy</h2>
          <p style={p}>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.</p>

          <h2 style={h2}>10. Contact</h2>
          <p style={p}>If you have questions about this privacy policy, contact us at support@spriteforge.online.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
