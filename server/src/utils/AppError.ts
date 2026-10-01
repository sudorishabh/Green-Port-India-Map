class AppError extends Error {
  public errorCode: any;
  public status: number;
  constructor(errorCode: any, status: number) {
    super("An unexpected error occurred");
    this.errorCode = errorCode;
    this.status = status;
  }
}

export default AppError;
