import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AlgoliaService } from './algolia.service';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService, AlgoliaService],
  exports: [SearchService, AlgoliaService],
})
export class SearchModule {}
