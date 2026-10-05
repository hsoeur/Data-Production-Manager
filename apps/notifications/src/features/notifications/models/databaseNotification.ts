export type NotificationProcessingStatus = 'PROCESSED' | 'ERROR' | string;

export type DatabaseNotification = {
  databaseNotificationUid: string;
  entityType: string;
  entityUId: string;
  propertyName: string;
  oldValue: string | null;
  newValue: string | null;
  modifiedAt: string;
  modifiedBy: string;
  processed: NotificationProcessingStatus;
};
