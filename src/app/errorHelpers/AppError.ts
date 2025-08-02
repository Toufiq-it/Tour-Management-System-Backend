

class AppError extends Error {
    public statueCode: number;

    constructor(statusCode: number, message: string, stack = ''){
        super(message) // throw new Error("something worng!")
        this.statueCode = statusCode

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default AppError;