import { routeRequest } from '../services/roundRobinService.js';

export const post = async (req, res) => {
  try {
    const data = await routeRequest(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'All application instances are unavailable or timed out'
    });
  }
};
