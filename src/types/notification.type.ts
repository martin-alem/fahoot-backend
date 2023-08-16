export interface IEmailOption {
  to: string;
  subject: string;
  message: string;
}

export interface ITextOption {
  to: string;
  channel: string;
}

export enum NotificationType {
  EMAIL = 'email',
}

export interface INotification {
  type: NotificationType;
  payload: IEmailOption | ITextOption;
}
