import request from 'supertest';
import express from 'express';
import apiRoutes from './api/routes/apiRoutes';
import axios from 'axios';

jest.mock('axios');

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('Round Robin API', () => {
  const mockData = { game: 'Mobile Legends', gamerID: 'GYUTDTE', points: 20 };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should forward requests to different instances in round-robin', async () => {
    axios.post.mockResolvedValueOnce({ data: mockData });
    axios.post.mockResolvedValueOnce({ data: mockData });
    axios.post.mockResolvedValueOnce({ data: mockData });

    const res1 = await request(app).post('/api/mirror').send(mockData);
    expect(res1.status).toBe(200);
    expect(res1.body).toEqual(mockData);

    const res2 = await request(app).post('/api/mirror').send(mockData);
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual(mockData);

    const res3 = await request(app).post('/api/mirror').send(mockData);
    expect(res3.status).toBe(200);
    expect(res3.body).toEqual(mockData);

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api', mockData, { timeout: 5000 });
    expect(axios.post).toHaveBeenCalledWith('http://localhost:3002/api', mockData, { timeout: 5000 });
    expect(axios.post).toHaveBeenCalledWith('http://localhost:3003/api', mockData, { timeout: 5000 });
  });

  it('should return a 500 error if all instances are down', async () => {
    axios.post.mockRejectedValueOnce(new Error('Instance 1 down'));
    axios.post.mockRejectedValueOnce(new Error('Instance 2 down'));
    axios.post.mockRejectedValueOnce(new Error('Instance 3 down'));

    const res = await request(app).post('/api/mirror').send(mockData);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty(
      'error',
      'All application instances are unavailable or timed out.'
    );
  });
});
