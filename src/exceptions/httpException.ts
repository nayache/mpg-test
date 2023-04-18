export class HttpException extends Error {
    public status: number
    public message: string
    constructor(status: number = 500, message: string = "Internal Server Error") {
      super(message as string)
      this.status = status;
      this.message = message;
    }
  }