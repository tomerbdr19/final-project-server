import { StatusCodes } from 'http-status-codes';

type Errors =
    | 'INVALID_PASSWORD'
    | 'INVALID_EMAIL'
    | 'UNAUTHORIZED'
    | 'INTERNAL_ERROR'
    | 'UNSUPPORTED_FILE'
    | 'NOT_FOUND';

export const ServerErrors: Record<
    Errors,
    { status: StatusCodes; error: string }
> = {
    INVALID_PASSWORD: {
        status: StatusCodes.BAD_REQUEST,
        error: 'Invalid password'
    },
    INVALID_EMAIL: {
        status: StatusCodes.BAD_REQUEST,
        error: 'Invalid email'
    },
    UNAUTHORIZED: {
        status: StatusCodes.UNAUTHORIZED,
        error: 'Unauthorized'
    },
    INTERNAL_ERROR: {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: 'Internal error'
    },
    UNSUPPORTED_FILE: {
        status: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
        error: 'unsupported file'
    },
    NOT_FOUND: {
        status: StatusCodes.NOT_FOUND,
        error: 'not found'
    }
};
