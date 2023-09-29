export interface IPaginationResult<T> {
    results: T[];
    total: number;
    totalPages: number;
}
export interface IPaginationOption {
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}
