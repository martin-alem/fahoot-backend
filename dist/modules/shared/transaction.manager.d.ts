import { ClientSession, Connection } from 'mongoose';
export declare class TransactionManager {
    private session;
    private readonly connection;
    constructor(connection: Connection);
    startSession(): Promise<ClientSession>;
    startTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    endSession(): Promise<void>;
    abortTransaction(): Promise<void>;
    getSession(): ClientSession;
}
