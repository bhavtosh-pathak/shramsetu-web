export function notFound(req, res) { res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }
export function errorHandler(err, _req, res, _next) {
  if (!err.status || err.status >= 500) console.error(err); // expected 4xx errors are not logged with stack traces
  if (err.code === 11000) return res.status(409).json({ message: 'A record with this information already exists.' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id or value provided.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON in request body.' });
  res.status(err.status || 500).json({ message: err.status && err.status < 500 ? err.message : (err.message || 'Unexpected server error.') });
}
