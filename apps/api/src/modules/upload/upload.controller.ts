import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('photo')
  @ApiOperation({ summary: 'Create property photo upload metadata' })
  photo(@Body() body: any) {
    return this.upload.createUpload('photo', body);
  }

  @Post('document')
  document(@Body() body: any) {
    return this.upload.createUpload('document', body);
  }

  @Post('expense-receipt')
  receipt(@Body() body: any) {
    return this.upload.createUpload('expense-receipt', body);
  }

  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.upload.delete(key);
  }
}
