import { Module } from '@nestjs/common';
import { PmsController } from './pms.controller';
import { PmsService } from './pms.service';

@Module({
  controllers: [PmsController],
  providers: [PmsService],
  exports: [PmsService],
})
export class PmsModule {}
