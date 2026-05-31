import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type S3Folder =
  | 'properties/{id}/photos'
  | 'properties/{id}/tours360'
  | 'properties/{id}/videos'
  | 'bookings/{id}/agreements'
  | 'bookings/{id}/inspection'
  | 'kyc/{id}'
  | 'expenses/{id}'
  | 'receipts/{id}';

const PRIVATE_PREFIXES = ['kyc/', 'bookings/'];

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION ?? 'ap-south-1' });
  private readonly bucket = process.env.AWS_S3_BUCKET ?? 'roomly-assets';
  private readonly cfBase = process.env.CLOUDFRONT_URL ?? `https://${process.env.AWS_S3_BUCKET ?? 'roomly-assets'}.s3.amazonaws.com`;

  // ── Upload ───────────────────────────────────────────────────────────────────

  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata: Record<string, string> = {},
  ): Promise<string> {
    const isPrivate = PRIVATE_PREFIXES.some((p) => key.startsWith(p));

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
      ACL: isPrivate ? ObjectCannedACL.private : ObjectCannedACL.public_read,
    }));

    const url = isPrivate
      ? `s3://${this.bucket}/${key}`
      : `${this.cfBase}/${key}`;

    this.logger.log(`Uploaded ${key} (${buffer.length} bytes, ${isPrivate ? 'private' : 'public'})`);
    return url;
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      this.logger.log(`Deleted S3 object: ${key}`);
    } catch (err) {
      this.logger.error(`S3 delete failed for ${key}: ${(err as Error).message}`);
    }
  }

  // ── Signed URL ───────────────────────────────────────────────────────────────

  async getSignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expirySeconds });
  }

  // ── Key builders ─────────────────────────────────────────────────────────────

  propertyPhoto(propertyId: string, filename: string): string {
    return `properties/${propertyId}/photos/${filename}`;
  }

  propertyTour360(propertyId: string, filename: string): string {
    return `properties/${propertyId}/tours360/${filename}`;
  }

  propertyVideo(propertyId: string, filename: string): string {
    return `properties/${propertyId}/videos/${filename}`;
  }

  bookingAgreement(bookingId: string, filename: string): string {
    return `bookings/${bookingId}/agreements/${filename}`;
  }

  bookingInspection(bookingId: string, filename: string): string {
    return `bookings/${bookingId}/inspection/${filename}`;
  }

  kycDocument(userId: string, filename: string): string {
    return `kyc/${userId}/${filename}`;
  }

  expenseReceipt(propertyId: string, filename: string): string {
    return `expenses/${propertyId}/${filename}`;
  }

  rentReceipt(bookingId: string, filename: string): string {
    return `receipts/${bookingId}/${filename}`;
  }

  publicUrl(key: string): string {
    return `${this.cfBase}/${key}`;
  }
}
