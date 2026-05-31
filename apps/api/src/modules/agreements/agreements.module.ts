import { Module } from '@nestjs/common';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from './agreements.service';
import { PdfService } from './pdf.service';
import { S3Service } from '../upload/s3.service';

@Module({
  controllers: [AgreementsController],
  providers: [AgreementsService, PdfService, S3Service],
  exports: [AgreementsService, PdfService],
})
export class AgreementsModule {}
