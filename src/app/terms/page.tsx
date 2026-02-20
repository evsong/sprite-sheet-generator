import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Terms of Service — SpriteForge",
  description: "Terms and conditions for using SpriteForge.",
};

const h2 = { fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "#fff", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginTop: "32px", marginBottom: "12px" };
const p = { fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.8, marginBottom: "12px" };

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 120px)", paddingTop: "calc(var(--nav-h) + 40px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 80px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
            Terms of Service
          </h1>
          <p style={{ ...p, marginBottom: "32px" }}>Last updated: February 20, 2026</p>

          <h2 style={h2}>1. Acceptance of Terms</h2>
          <p style={p}>By accessing or using SpriteForge, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service.</p>

          <h2 style={h2}>2. Description of Service</h2>
          <p style={p}>SpriteForge is a browser-based sprite sheet generation tool for game developers. The service allows you to upload images, arrange sprites, preview animations, and export sprite sheets in various formats.</p>

          <h2 style={h2}>3. Accounts</h2>
          <p style={p}>You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account. You are responsible for all activity that occurs under your account.</p>

          <h2 style={h2}>4. Subscription and Payments</h2>
          <p style={p}>Paid plans are billed on a recurring basis through our payment partner Creem. You can cancel your subscription at any time from your account settings. Upon cancellation, you retain access until the end of your current billing period. Prices are subject to change with 30 days notice.</p>

          <h2 style={h2}>5. Refund Policy</h2>
          <p style={p}>We offer refunds within 7 days of purchase if you are not satisfied with the service. To request a refund, contact us at support@spriteforge.online. Refunds are processed through our payment partner and may take 5-10 business days to appear.</p>

          <h2 style={h2}>6. Intellectual Property</h2>
          <p style={p}>You retain all rights to the content you upload and create using SpriteForge. We do not claim ownership of your sprites, images, or exported files. The SpriteForge service, including its design, code, and branding, is our intellectual property.</p>

          <h2 style={h2}>7. Acceptable Use</h2>
          <p style={p}>You agree not to: use the service for any illegal purpose; upload malicious files or attempt to compromise the service; resell or redistribute the service without authorization; use automated tools to scrape or overload the service.</p>

          <h2 style={h2}>8. Limitation of Liability</h2>
          <p style={p}>SpriteForge is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.</p>

          <h2 style={h2}>9. Termination</h2>
          <p style={p}>We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time from the Settings page. Upon termination, your data will be permanently deleted.</p>

          <h2 style={h2}>10. Changes to Terms</h2>
          <p style={p}>We may update these terms from time to time. We will notify you of material changes by posting the updated terms on this page. Continued use of the service after changes constitutes acceptance of the new terms.</p>

          <h2 style={h2}>11. Contact</h2>
          <p style={p}>For questions about these terms, contact us at support@spriteforge.online.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
