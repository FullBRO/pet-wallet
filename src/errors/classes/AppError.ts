type Visibility = "public" | "private"

class AppError extends Error{
    readonly visibility: Visibility;
    readonly code?: string ;

    constructor(message: string, opts: {visibility?: Visibility, code?: string} = {}){
        super(message);
        this.name = "AppError";
        this.visibility = opts.visibility ?? "private";
        this.code = JSON.parse(JSON.stringify(opts.code))
    }
}

export const userError = (message: string, code?: string) =>
  new AppError(message, { visibility: "public", code: JSON.parse(JSON.stringify(code)) });

export const internalError = (message = "Internal error", code?: string) =>
  new AppError(message, { visibility: "private", code: JSON.parse(JSON.stringify(code)) });
