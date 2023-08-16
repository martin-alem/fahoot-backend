export interface PaginationResult<T> {
  results: T[];
  total: number;
  totalPages: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}
