export enum LEVEL {
  INFO = 'INFO',
  WARN = 'WARN',
  CRITICAL = 'CRITICAL',
}

export interface ILog {
  event: string;
  level: LEVEL;
  description: string;
  hostIP: string;
  hostName: string;
  requestURI?: string;
  requestMethod?: string;
  userAgent?: string;
}
