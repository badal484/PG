import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AlgoliaService } from '../../search/algolia.service';
import { QUEUE, JOB } from '../queues';

@Processor(QUEUE.SEARCH_SYNC)
export class SearchSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchSyncProcessor.name);

  constructor(private readonly algolia: AlgoliaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case JOB.SYNC_PROPERTY:
        await this.algolia.syncPropertyToAlgolia(job.data.propertyId as string);
        break;

      case JOB.REMOVE_PROPERTY:
        await this.algolia.removePropertyFromAlgolia(job.data.propertyId as string);
        break;

      default:
        this.logger.warn(`Unknown search-sync job: ${job.name}`);
    }
  }
}
