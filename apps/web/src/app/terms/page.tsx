import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Terms of Service</h1>
      <p className="lead">Last updated: June 2025</p>
      <p>By using ROOMLY you agree to these terms. If you don&apos;t agree, please stop using the platform.</p>
      <h2>For Tenants</h2>
      <ul>
        <li>You must complete KYC verification before a booking is confirmed.</li>
        <li>Deposits are held in escrow and released after move-out inspection.</li>
        <li>Rent must be paid by the due date to avoid late fees.</li>
        <li>False information during KYC will result in account suspension.</li>
      </ul>
      <h2>For Owners</h2>
      <ul>
        <li>Properties must be accurately represented. Misrepresentation leads to removal.</li>
        <li>A 10% platform commission is charged on all rent collected.</li>
        <li>Deposits cannot be withheld without documented damage evidence.</li>
        <li>Owners must respond to admin verification requests within 7 days.</li>
      </ul>
      <h2>Disputes</h2>
      <p>ROOMLY admin team mediates deposit disputes. Admin decisions are binding on both parties.</p>
      <h2>Contact</h2>
      <p>support@roomly.in</p>
    </div>
  );
}
