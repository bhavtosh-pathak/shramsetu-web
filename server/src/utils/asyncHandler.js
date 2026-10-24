// Wraps async controllers so any thrown/rejected error reaches the Express error handler.
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Small helper to throw HTTP errors from controllers.
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
