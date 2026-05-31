import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync a property to search index' })
  sync(@Body('propertyId') propertyId: string) {
    return this.search.sync(propertyId);
  }

  @Post('sync-all')
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  syncAll() {
    return this.search.syncAll();
  }

  @Get('suggest')
  suggest(@Query('q') q = '') {
    return this.search.suggest(q);
  }
}
