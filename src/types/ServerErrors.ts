import { StatusCodes } from 'http-status-codes';

type Errors = 'INVALID_PASSWORD' | 'INVALID_EMAIL' | 'UNAUTHORIZED' | 'INTERNAL_ERROR'

export const ServerErrors: Record<Errors, { status: StatusCodes, message: string }> = {
  INVALID_PASSWORD: {
    status: StatusCodes.BAD_REQUEST,
    message: 'Invalid password'
  },
  INVALID_EMAIL: {
    status: StatusCodes.BAD_REQUEST,
    message: 'Invalid email'
  },
  UNAUTHORIZED: {
    status: StatusCodes.UNAUTHORIZED,
    message: 'Unauthorized'
  },
  INTERNAL_ERROR: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Internal error'
  }
};
