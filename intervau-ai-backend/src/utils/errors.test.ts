import { AppError } from '../utils/errors';

describe('AppError', () => {
  it('should create an error with message and status code', () => {
    const error = new AppError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it('should set isOperational to false if not specified', () => {
    const error = new AppError('Test error', 500, false);
    expect(error.isOperational).toBe(false);
  });
});
