class Result<T> {
  private readonly success: boolean;
  private readonly data: T | null;
  private readonly error: string | null;
  private readonly errorCode: number | null;

  constructor(success: boolean, data: T | null, error: string | null, errorCode: number | null) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.errorCode = errorCode;
  }

  public isSuccess(): boolean {
    return this.success;
  }

  public getData(): T | null {
    return this.data;
  }

  public getError(): string | null {
    return this.error;
  }

  public getErrorCode(): number | null {
    return this.errorCode;
  }
}

export default Result;
