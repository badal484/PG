import { Injectable, Logger } from '@nestjs/common';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { S3Service } from '../upload/s3.service';

export interface AgreementData {
  bookingId: string;
  tenantName: string;
  ownerName: string;
  propertyName: string;
  propertyAddress: string;
  bedNumber: string;
  moveInDate: string;
  moveOutDate?: string;
  monthlyRent: number;
  depositAmount: number;
  noticePeriodDays: number;
  rules?: string;
  generatedAt: string;
}

export interface ReceiptData {
  receiptNumber: string;
  tenantName: string;
  propertyName: string;
  month: string;
  amount: number;
  paymentMode: string;
  paidDate: string;
  transactionRef?: string;
}

export interface InspectionReportData {
  bookingId: string;
  tenantName: string;
  propertyName: string;
  checkoutDate: string;
  items: Array<{ label: string; status: 'OK' | 'DAMAGED' | 'MISSING'; notes?: string; charge?: number }>;
  totalDeductions: number;
  depositAmount: number;
  refundAmount: number;
  inspectedBy: string;
}

export interface PLStatementData {
  ownerName: string;
  period: string;
  properties: Array<{
    name: string;
    grossRent: number;
    commission: number;
    gst: number;
    netRent: number;
    expenses: number;
    netProfit: number;
  }>;
  totalGrossRent: number;
  totalCommission: number;
  totalExpenses: number;
  totalNetProfit: number;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly s3: S3Service) {}

  // ── Rent Agreement ───────────────────────────────────────────────────────────

  async generateAgreementPdf(data: AgreementData): Promise<Buffer> {
    const html = this.renderTemplate(AGREEMENT_TEMPLATE, data);
    const pdf = await this.htmlToPdf(html);
    this.logger.log(`Generated agreement PDF for booking ${data.bookingId}`);
    return pdf;
  }

  async generateAndUploadAgreement(data: AgreementData): Promise<string> {
    const pdf = await this.generateAgreementPdf(data);
    const key = this.s3.bookingAgreement(data.bookingId, `agreement-${Date.now()}.pdf`);
    const url = await this.s3.uploadFile(pdf, key, 'application/pdf', {
      bookingId: data.bookingId,
      type: 'agreement',
    });
    return url;
  }

  // ── Rent Receipt ─────────────────────────────────────────────────────────────

  async generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
    const html = this.renderTemplate(RECEIPT_TEMPLATE, data);
    return this.htmlToPdf(html);
  }

  async generateAndUploadReceipt(bookingId: string, data: ReceiptData): Promise<string> {
    const pdf = await this.generateReceiptPdf(data);
    const key = this.s3.rentReceipt(bookingId, `receipt-${data.receiptNumber}.pdf`);
    return this.s3.uploadFile(pdf, key, 'application/pdf', {
      bookingId,
      receiptNumber: data.receiptNumber,
    });
  }

  // ── Inspection Report ────────────────────────────────────────────────────────

  async generateInspectionReportPdf(data: InspectionReportData): Promise<Buffer> {
    const html = this.renderTemplate(INSPECTION_TEMPLATE, {
      ...data,
      damagedItems: data.items.filter((i) => i.status !== 'OK'),
    });
    return this.htmlToPdf(html);
  }

  async generateAndUploadInspectionReport(data: InspectionReportData): Promise<string> {
    const pdf = await this.generateInspectionReportPdf(data);
    const key = this.s3.bookingInspection(data.bookingId, `inspection-${Date.now()}.pdf`);
    return this.s3.uploadFile(pdf, key, 'application/pdf', {
      bookingId: data.bookingId,
      type: 'inspection',
    });
  }

  // ── P&L Statement ────────────────────────────────────────────────────────────

  async generatePLStatementPdf(data: PLStatementData): Promise<Buffer> {
    const html = this.renderTemplate(PL_TEMPLATE, {
      ...data,
      formattedDate: new Date().toLocaleDateString('en-IN'),
    });
    return this.htmlToPdf(html);
  }

  // ── Internals ────────────────────────────────────────────────────────────────

  private renderTemplate(template: string, data: object): string {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}

// ── HTML Templates ───────────────────────────────────────────────────────────

const BASE_STYLES = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #1e293b; line-height: 1.6; }
    .header { background: #1a1a2e; color: #fff; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 22px; font-weight: 900; color: #e8471c; letter-spacing: -0.5px; }
    .title { font-size: 18px; font-weight: 700; margin: 24px 0 16px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #f8fafc; font-weight: 600; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .amount { font-weight: 700; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; }
    .badge-ok { background: #dcfce7; color: #16a34a; }
    .badge-damaged { background: #fee2e2; color: #dc2626; }
    .badge-missing { background: #fef9c3; color: #ca8a04; }
  </style>
`;

const AGREEMENT_TEMPLATE = `
<!DOCTYPE html><html><head><meta charset="UTF-8">${BASE_STYLES}</head>
<body>
  <div class="header">
    <span class="logo">ROOMLY</span>
    <span>Rental Agreement · {{bookingId}}</span>
  </div>
  <div style="padding:24px">
    <div class="title">RESIDENTIAL RENTAL AGREEMENT</div>
    <div class="section">
      <div class="section-title">Parties</div>
      <table>
        <tr><td style="width:40%;font-weight:600">Landlord (Owner)</td><td>{{ownerName}}</td></tr>
        <tr><td style="font-weight:600">Tenant</td><td>{{tenantName}}</td></tr>
        <tr><td style="font-weight:600">Property</td><td>{{propertyName}}, {{propertyAddress}}</td></tr>
        <tr><td style="font-weight:600">Bed / Unit</td><td>{{bedNumber}}</td></tr>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Terms</div>
      <table>
        <tr><td style="width:40%;font-weight:600">Move-in Date</td><td>{{moveInDate}}</td></tr>
        {{#if moveOutDate}}<tr><td style="font-weight:600">Move-out Date</td><td>{{moveOutDate}}</td></tr>{{/if}}
        <tr><td style="font-weight:600">Monthly Rent</td><td class="amount">₹{{monthlyRent}}</td></tr>
        <tr><td style="font-weight:600">Security Deposit</td><td class="amount">₹{{depositAmount}}</td></tr>
        <tr><td style="font-weight:600">Notice Period</td><td>{{noticePeriodDays}} days</td></tr>
      </table>
    </div>
    {{#if rules}}
    <div class="section">
      <div class="section-title">House Rules</div>
      <p style="white-space:pre-line">{{rules}}</p>
    </div>
    {{/if}}
    <div class="section">
      <div class="section-title">Platform Terms</div>
      <p>All booking, rent collection, refund and dispute actions are governed by ROOMLY's policies available at roomly.in/terms.</p>
    </div>
    <div style="margin-top:40px;display:flex;justify-content:space-between">
      <div style="text-align:center">
        <div style="width:180px;border-bottom:1px solid #1e293b;margin-bottom:4px"> </div>
        <div style="font-size:11px;color:#64748b">Landlord Signature</div>
        <div>{{ownerName}}</div>
      </div>
      <div style="text-align:center">
        <div style="width:180px;border-bottom:1px solid #1e293b;margin-bottom:4px"> </div>
        <div style="font-size:11px;color:#64748b">Tenant Signature</div>
        <div>{{tenantName}}</div>
      </div>
    </div>
    <div class="footer">Generated by ROOMLY on {{generatedAt}} · roomly.in</div>
  </div>
</body></html>
`;

const RECEIPT_TEMPLATE = `
<!DOCTYPE html><html><head><meta charset="UTF-8">${BASE_STYLES}</head>
<body>
  <div class="header">
    <span class="logo">ROOMLY</span>
    <span>Receipt · {{receiptNumber}}</span>
  </div>
  <div style="padding:24px">
    <div class="title">RENT RECEIPT</div>
    <table>
      <tr><td style="width:40%;font-weight:600">Receipt No.</td><td>{{receiptNumber}}</td></tr>
      <tr><td style="font-weight:600">Tenant</td><td>{{tenantName}}</td></tr>
      <tr><td style="font-weight:600">Property</td><td>{{propertyName}}</td></tr>
      <tr><td style="font-weight:600">For Month</td><td>{{month}}</td></tr>
      <tr><td style="font-weight:600">Amount</td><td class="amount" style="font-size:18px;color:#16a34a">₹{{amount}}</td></tr>
      <tr><td style="font-weight:600">Payment Mode</td><td>{{paymentMode}}</td></tr>
      <tr><td style="font-weight:600">Payment Date</td><td>{{paidDate}}</td></tr>
      {{#if transactionRef}}<tr><td style="font-weight:600">Transaction Ref</td><td>{{transactionRef}}</td></tr>{{/if}}
    </table>
    <div class="footer">This is a computer-generated receipt · ROOMLY · roomly.in</div>
  </div>
</body></html>
`;

const INSPECTION_TEMPLATE = `
<!DOCTYPE html><html><head><meta charset="UTF-8">${BASE_STYLES}</head>
<body>
  <div class="header">
    <span class="logo">ROOMLY</span>
    <span>Move-out Inspection · {{bookingId}}</span>
  </div>
  <div style="padding:24px">
    <div class="title">MOVE-OUT INSPECTION REPORT</div>
    <table style="margin-bottom:24px">
      <tr><td style="width:40%;font-weight:600">Tenant</td><td>{{tenantName}}</td></tr>
      <tr><td style="font-weight:600">Property</td><td>{{propertyName}}</td></tr>
      <tr><td style="font-weight:600">Checkout Date</td><td>{{checkoutDate}}</td></tr>
      <tr><td style="font-weight:600">Inspected By</td><td>{{inspectedBy}}</td></tr>
    </table>
    <div class="section">
      <div class="section-title">Inspection Items</div>
      <table>
        <thead><tr><th>Item</th><th>Status</th><th>Notes</th><th>Charge</th></tr></thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>{{label}}</td>
            <td><span class="badge {{#if (eq status 'OK')}}badge-ok{{else if (eq status 'DAMAGED')}}badge-damaged{{else}}badge-missing{{/if}}">{{status}}</span></td>
            <td>{{notes}}</td>
            <td>{{#if charge}}₹{{charge}}{{/if}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Settlement Summary</div>
      <table>
        <tr><td style="font-weight:600">Total Deposit</td><td class="amount">₹{{depositAmount}}</td></tr>
        <tr><td style="font-weight:600">Total Deductions</td><td class="amount" style="color:#dc2626">− ₹{{totalDeductions}}</td></tr>
        <tr style="background:#f0fdf4"><td style="font-weight:700">Refund Amount</td><td class="amount" style="color:#16a34a;font-size:16px">₹{{refundAmount}}</td></tr>
      </table>
    </div>
    <div class="footer">ROOMLY Move-out Report · roomly.in</div>
  </div>
</body></html>
`;

const PL_TEMPLATE = `
<!DOCTYPE html><html><head><meta charset="UTF-8">${BASE_STYLES}</head>
<body>
  <div class="header">
    <span class="logo">ROOMLY</span>
    <span>P&amp;L Statement · {{period}}</span>
  </div>
  <div style="padding:24px">
    <div class="title">MONTHLY P&amp;L STATEMENT</div>
    <p style="margin-bottom:16px">Owner: <strong>{{ownerName}}</strong> · Period: {{period}} · Generated: {{formattedDate}}</p>
    <table>
      <thead><tr><th>Property</th><th>Gross Rent</th><th>Commission (10%)</th><th>GST</th><th>Net Rent</th><th>Expenses</th><th>Net Profit</th></tr></thead>
      <tbody>
        {{#each properties}}
        <tr>
          <td>{{name}}</td>
          <td>₹{{grossRent}}</td>
          <td style="color:#7c3aed">₹{{commission}}</td>
          <td style="color:#64748b">₹{{gst}}</td>
          <td>₹{{netRent}}</td>
          <td style="color:#dc2626">₹{{expenses}}</td>
          <td style="font-weight:700;color:#16a34a">₹{{netProfit}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr style="background:#f8fafc;font-weight:700">
          <td>Total</td>
          <td>₹{{totalGrossRent}}</td>
          <td>₹{{totalCommission}}</td>
          <td></td>
          <td></td>
          <td>₹{{totalExpenses}}</td>
          <td style="color:#16a34a">₹{{totalNetProfit}}</td>
        </tr>
      </tfoot>
    </table>
    <div class="footer">ROOMLY Financial Statement · Confidential · roomly.in</div>
  </div>
</body></html>
`;
