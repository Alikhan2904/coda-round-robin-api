import { validateJson } from './validateJson.js';

describe('validateJson middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      is: jest.fn().mockReturnValue(true)
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next() if the payload is valid JSON', () => {
    req.body = { game: 'Mobile Legends' };
    req.headers = { 'content-type': 'application/json' };

    validateJson(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if the Content-Type is not application/json', () => {
    req.headers = { 'content-type': 'text/plain' };
    req.is = jest.fn().mockReturnValue(false);

    validateJson(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid content type. Expected application/json.'
    });
  });

  it('should return 400 if the payload is invalid JSON', () => {
    req.body = 'invalid json';
    req.headers = { 'content-type': 'application/json' };

    JSON.parse = jest.fn().mockImplementation(() => {
      throw new Error('Invalid JSON');
    });

    validateJson(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid JSON payload.' });
  });
});
