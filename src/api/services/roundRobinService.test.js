import {
  getFailureCount,
  isCircuitTripped,
  registerFailure,
  registerSuccess
} from '../../utils/circuit-breaker/circuitBreaker.js';
import { postToInstance } from '../../utils/http-client/httpClient.js';
import { resetCurrentIndex, routeRequest } from './roundRobinService.js';

jest.mock('../../utils/http-client/httpClient.js');
jest.mock('../../utils/circuit-breaker/circuitBreaker.js');

describe('roundRobinService', () => {
  const payload = { game: 'Mobile Legends' };
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
    postToInstance.mockResolvedValue(payload);
    isCircuitTripped.mockReturnValueOnce(false);

    const result = await routeRequest(payload);

    expect(registerSuccess).toHaveBeenCalled();
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[0], payload);
    expect(result).toEqual(payload);
  });

  it('should retry and send the request to the next API if the first one fails', async () => {
    postToInstance
      .mockRejectedValueOnce(new Error('First API failed'))
      .mockResolvedValueOnce(payload);
    getFailureCount.mockReturnValueOnce(1);
    isCircuitTripped.mockReturnValue(false);

    const result = await routeRequest(payload);

    expect(registerFailure).toHaveBeenCalledWith(mockAPIs[0]);
    expect(registerSuccess).toHaveBeenCalledWith(mockAPIs[1]);

    expect(postToInstance).toHaveBeenCalledTimes(2);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[0], payload);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[1], payload);
    expect(result).toEqual(payload);
  });

  it('should handle timeouts and retry the request on the next available API', async () => {
    const timeoutError = {
      code: 'ECONNABORTED',
      message: 'Timeout of 2000ms exceeded'
    };

    postToInstance.mockRejectedValueOnce(timeoutError);
    postToInstance.mockResolvedValueOnce(payload);
    getFailureCount.mockReturnValueOnce(1);

    const result = await routeRequest(payload);

    expect(registerFailure).toHaveBeenCalledWith(mockAPIs[0]);
    expect(registerSuccess).toHaveBeenCalledWith(mockAPIs[1]);

    expect(postToInstance).toHaveBeenCalledTimes(2);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[0], payload);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[1], payload);
    expect(result).toEqual(payload);
  });

  it('should try the next instance if the circuit is tripped for an instance', async () => {
    isCircuitTripped.mockReturnValueOnce(true);

    postToInstance
      .mockRejectedValueOnce(new Error('First API failed'))
      .mockResolvedValueOnce(payload);
    getFailureCount.mockReturnValueOnce(3);

    const result = await routeRequest(payload);

    expect(registerFailure).toHaveBeenCalledWith(mockAPIs[1]);
    expect(registerSuccess).toHaveBeenCalledWith(mockAPIs[2]);

    expect(postToInstance).toHaveBeenCalledTimes(2);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[1], payload);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[2], payload);
    expect(result).toEqual(payload);
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

    await expect(routeRequest(payload)).rejects.toThrow(
      'All instances are down or unresponsive.'
    );

    expect(postToInstance).toHaveBeenCalledTimes(3);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[0], payload);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[1], payload);
    expect(postToInstance).toHaveBeenCalledWith(mockAPIs[2], payload);
  });
});
