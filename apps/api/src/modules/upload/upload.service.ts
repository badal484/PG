import { BadRequestException, Injectable } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

  createUpload(kind: string, body: any) {
    const maxBytes = kind === 'photo' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const contentType = body.contentType ?? '';
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(contentType)) {
      throw new BadRequestException({ code: 'UPLOAD_TYPE_NOT_ALLOWED', message: 'Unsupported file type' });
    }
    if (body.size && Number(body.size) > maxBytes) {
      throw new BadRequestException({ code: 'UPLOAD_TOO_LARGE', message: 'File exceeds allowed size' });
    }
    const key = `${kind}/${Date.now()}-${body.fileName ?? 'upload'}`;
    const bucket = process.env.AWS_S3_BUCKET ?? 'nestify-local';
    const cloudFrontBase = process.env.CLOUDFRONT_URL ?? `https://${bucket}.s3.amazonaws.com`;
    return { key, bucket, url: `${cloudFrontBase}/${key}`, maxBytes };
  }

  async delete(key: string) {
    if (process.env.AWS_S3_BUCKET) {
      await this.s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    }
    return { deleted: true, key };
  }
}
