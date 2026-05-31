import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AgreementsService } from './agreements.service';

@ApiTags('Agreements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreements: AgreementsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate agreement PDF metadata from booking' })
  generate(@Body('bookingId') bookingId: string) {
    return this.agreements.generate(bookingId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.agreements.get(id);
  }

  @Get(':id/pdf')
  pdf(@Param('id') id: string) {
    return this.agreements.pdf(id);
  }

  @Post(':id/send-for-sign')
  send(@Param('id') id: string) {
    return this.agreements.sendForSign(id);
  }

  @Public()
  @Post('digio/callback')
  callback(@Body() body: any) {
    return this.agreements.digioCallback(body);
  }
}
