export enum LEVEL {
  INFO = 'INFO',
  WARN = 'WARN',
  CRITICAL = 'CRITICAL',
}

export interface ILog {
  event: string;
  level: LEVEL;
  description: string;
}
