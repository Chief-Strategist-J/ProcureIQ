export interface NotificationReceivedEvent {
  notificationId: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: string;
}
