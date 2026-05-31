import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p className="lead">Last updated: June 2025</p>
      <p>ROOMLY (&quot;we&quot;, &quot;us&quot;) collects and processes personal data to provide our PG booking and management platform. This policy explains what we collect, why, and your rights.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Phone number and email for account creation and OTP authentication</li>
        <li>Aadhaar and PAN numbers for KYC verification (stored hashed / masked per UIDAI guidelines)</li>
        <li>Payment information processed via Razorpay (we never store card numbers)</li>
        <li>Property photos and documents uploaded by owners</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To process bookings and verify tenant identity</li>
        <li>To send rent reminders and booking confirmations via WhatsApp/SMS</li>
        <li>To resolve disputes using escrow-held deposits</li>
      </ul>
      <h2>Your rights</h2>
      <p>You can request data deletion by emailing privacy@roomly.in. We will process requests within 30 days.</p>
      <h2>Contact</h2>
      <p>privacy@roomly.in</p>
    </div>
  );
}
