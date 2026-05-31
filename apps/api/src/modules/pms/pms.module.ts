import { Module } from '@nestjs/common';
import { PmsController, PmsRootController } from './pms.controller';
import { PmsService } from './pms.service';

@Module({
  controllers: [PmsRootController, PmsController],
  providers: [PmsService],
  exports: [PmsService],
})
export class PmsModule {}
