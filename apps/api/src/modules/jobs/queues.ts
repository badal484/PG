export const QUEUE = {
  NOTIFICATION: 'notification',
  SEARCH_SYNC: 'search-sync',
  RECEIPT: 'receipt',
  RENT_RECORD: 'rent-record',
  ESCROW_RELEASE: 'escrow-release',
  ANALYTICS: 'analytics',
} as const;

export const JOB = {
  SEND_WHATSAPP: 'send-whatsapp',
  SEND_SMS: 'send-sms',
  SEND_EMAIL: 'send-email',
  SYNC_PROPERTY: 'sync-property',
  REMOVE_PROPERTY: 'remove-property',
  GENERATE_RECEIPT: 'generate-receipt',
  CREATE_MONTHLY_RECORDS: 'create-monthly-records',
  RELEASE_ESCROW: 'release-escrow',
  COMPUTE_ANALYTICS: 'compute-analytics',
} as const;
