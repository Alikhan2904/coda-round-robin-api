import { post } from './MirrorController.js';
import { routeRequest } from '../services/roundRobinService.js';

jest.mock('../services/roundRobinService.js');

describe('MirrorController', () => {
  describe('POST', () => {
    const payload = { game: 'Mobile Legends' };
    const req = { body: payload };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    it('should return 200 and the response data when service call is successful', async () => {
      const mockData = { payload };
      routeRequest.mockResolvedValue(mockData);

      await post(req, res);

      expect(routeRequest).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should return 500 and an error message when service call fails', async () => {
      routeRequest.mockRejectedValue(
        new Error('All instances are down or unresponsive.')
      );

      await post(req, res);

      expect(routeRequest).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'All application instances are unavailable or timed out.'
      });
    });
  });
});
