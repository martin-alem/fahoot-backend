export interface IEmailOption {
    to: string;
    subject: string;
    message: string;
}
export interface ITextOption {
    to: string;
    channel: string;
}
export declare enum NotificationType {
    EMAIL = "email"
}
export interface INotification {
    type: NotificationType;
    payload: IEmailOption | ITextOption;
}
