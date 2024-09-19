import axios from 'axios';
import { postToInstance } from './httpClient.js';

jest.mock('axios');

describe('postToInstance', () => {
  const url = 'http://localhost:3001/api';
  const payload = { game: 'Mobile Legends' };
  const responseData = { success: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return data when axios POST request is successful', async () => {
    axios.post.mockResolvedValue({ data: responseData });

    const actual = await postToInstance(url, payload);

    expect(axios.post).toHaveBeenCalledWith(url, payload, { timeout: 5000 });
    expect(actual).toEqual(responseData);
  });

  it('should throw an error when axios POST request fails', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));

    await expect(postToInstance(url, payload)).rejects.toThrow();

    expect(axios.post).toHaveBeenCalledWith(url, payload, { timeout: 5000 });
  });

  it('should pass the payload correctly', async () => {
    axios.post.mockResolvedValue({ data: responseData });

    await postToInstance(url, payload);

    expect(axios.post).toHaveBeenCalledWith(url, payload, { timeout: 5000 });
  });

  it('should handle timeouts correctly', async () => {
    const timeoutError = {
      code: 'ECONNABORTED',
      message: 'Timeout of 5000ms exceeded'
    };
    axios.post.mockRejectedValue(timeoutError);

    await expect(postToInstance(url, payload)).rejects.toThrow();
  });
});
