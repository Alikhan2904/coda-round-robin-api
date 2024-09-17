export const validateJson = (req, res, next) => {
  if (!req.is('application/json')) {
    return res
      .status(400)
      .json({ error: 'Invalid content type. Expected application/json.' });
  }

  try {
    JSON.parse(JSON.stringify(req.body));
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }
};
