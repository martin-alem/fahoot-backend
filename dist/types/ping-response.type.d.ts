export interface PingResponse {
    status: 'success' | 'failure';
    message: string;
    timestamp: string;
}
