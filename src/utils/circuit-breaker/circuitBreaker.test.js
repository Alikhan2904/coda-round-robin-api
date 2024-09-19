import {
  isCircuitTripped,
  registerFailure,
  registerSuccess
} from './circuitBreaker';

describe('Circuit Breaker', () => {
  const instance = 'http://localhost:3001/api';
  jest.useFakeTimers();

  afterAll(() => {
    jest.clearAllTimers();
  });

  it('should not trip the circuit initially', () => {
    expect(isCircuitTripped(instance)).toBe(false);
  });

  it('should register failures correctly', () => {
    registerFailure(instance);
    expect(isCircuitTripped(instance)).toBe(false);

    registerFailure(instance);
    expect(isCircuitTripped(instance)).toBe(false);

    registerFailure(instance);
    expect(isCircuitTripped(instance)).toBe(true);
  });

  it('should reset the circuit on success', () => {
    registerFailure(instance);
    registerFailure(instance);
    registerFailure(instance);

    expect(isCircuitTripped(instance)).toBe(true);

    registerSuccess(instance);

    expect(isCircuitTripped(instance)).toBe(false);
  });

  it('should reset after timeout', () => {
    registerFailure(instance);
    registerFailure(instance);
    registerFailure(instance);

    expect(isCircuitTripped(instance)).toBe(true);

    jest.advanceTimersByTime(30000);

    expect(isCircuitTripped(instance)).toBe(false);
  });
});
