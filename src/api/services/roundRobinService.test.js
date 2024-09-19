import {
  getFailureCount,
  isCircuitTripped,
  registerFailure,
  registerSuccess
} from '../../utils/circuit-breaker/circuitBreaker.js';
import { postToInstance } from '../../utils/httpClient.js';
import { resetCurrentIndex, routeRequest } from './roundRobinService.js';

jest.mock('../../utils/httpClient.js');
jest.mock('../../utils/circuit-breaker/circuitBreaker.js');

describe('roundRobinService', () => {
  const mockAPIs = [
    'http://localhost:3001/api',
    'http://localhost:3002/api',
    'http://localhost:3003/api'
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    resetCurrentIndex();
  });

  it('should send the request to the first available API', async () => {
    postToInstance.mockResolvedValue({ success: true });
    isCircuitTripped.mockReturnValueOnce(false);

    const result = await routeRequest({ game: 'Mobile Legends' });

    expect(registerSuccess).toHaveBeenCalled();
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[0], {
      game: 'Mobile Legends'
    });
    expect(result).toEqual({ success: true });
  });

  it('should retry and send the request to the next API if the first one fails', async () => {
    postToInstance
      .mockRejectedValueOnce(new Error('First API failed'))
      .mockResolvedValueOnce({ success: true });
    getFailureCount.mockReturnValueOnce(1);
    isCircuitTripped.mockReturnValue(false);

    const result = await routeRequest({ game: 'Mobile Legends' });

    expect(registerFailure).toHaveBeenCalledWith(mockAPIs[0]);
    expect(registerSuccess).toHaveBeenCalledWith(mockAPIs[1]);

    expect(postToInstance).toHaveBeenCalledTimes(2);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[0], {
      game: 'Mobile Legends'
    });
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[1], {
      game: 'Mobile Legends'
    });
    expect(result).toEqual({ success: true });
  });

  it('should handle timeouts and retry the request on the next available API', async () => {
    const timeoutError = {
      code: 'ECONNABORTED',
      message: 'Timeout of 2000ms exceeded'
    };

    postToInstance.mockRejectedValueOnce(timeoutError);
    postToInstance.mockResolvedValueOnce({ success: true });
    getFailureCount.mockReturnValueOnce(1);

    const result = await routeRequest({ game: 'Mobile Legends' });

    expect(registerFailure).toHaveBeenCalledWith(mockAPIs[0]);
    expect(registerSuccess).toHaveBeenCalledWith(mockAPIs[1]);

    expect(postToInstance).toHaveBeenCalledTimes(2);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[0], {
      game: 'Mobile Legends'
    });
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[1], {
      game: 'Mobile Legends'
    });
    expect(result).toEqual({ success: true });
  });

  it('should try the next instance if the circuit is tripped for an instance', async () => {
    isCircuitTripped.mockReturnValueOnce(true);

    postToInstance
      .mockRejectedValueOnce(new Error('First API failed'))
      .mockResolvedValueOnce({ success: true });
    getFailureCount.mockReturnValueOnce(3);

    const result = await routeRequest({ game: 'Mobile Legends' });

    expect(registerFailure).toHaveBeenCalledWith(mockAPIs[1]);
    expect(registerSuccess).toHaveBeenCalledWith(mockAPIs[2]);

    expect(postToInstance).toHaveBeenCalledTimes(2);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[1], {
      game: 'Mobile Legends'
    });
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[2], {
      game: 'Mobile Legends'
    });
    expect(result).toEqual({ success: true });
  });

  it('should fail after all APIs timeout', async () => {
    const timeoutError = {
      code: 'ECONNABORTED',
      message: 'Timeout of 2000ms exceeded'
    };

    postToInstance.mockRejectedValue(timeoutError);
    getFailureCount
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(3);

    await expect(routeRequest({ game: 'Mobile Legends' })).rejects.toThrow(
      'All instances are down or unresponsive'
    );

    expect(postToInstance).toHaveBeenCalledTimes(3);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[0], {
      game: 'Mobile Legends'
    });
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[1], {
      game: 'Mobile Legends'
    });
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[2], {
      game: 'Mobile Legends'
    });
  });
});
