import {
  isCircuitTripped,
  registerFailure,
  registerSuccess
} from './circuitBreaker';

describe('Circuit Breaker', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('should not trip the circuit initially', () => {
    expect(isCircuitTripped('instance1')).toBe(false);
  });

  it('should register failures correctly', () => {
    registerFailure('instance1');
    expect(isCircuitTripped('instance1')).toBe(false);

    registerFailure('instance1');
    expect(isCircuitTripped('instance1')).toBe(false);

    registerFailure('instance1');
    expect(isCircuitTripped('instance1')).toBe(true);
  });

  it('should reset the circuit on success', () => {
    registerFailure('instance1');
    registerFailure('instance1');
    registerFailure('instance1');

    expect(isCircuitTripped('instance1')).toBe(true);

    registerSuccess('instance1');

    expect(isCircuitTripped('instance1')).toBe(false);
  });

  it('should reset after timeout', () => {
    jest.useFakeTimers();

    registerFailure('instance1');
    registerFailure('instance1');
    registerFailure('instance1');

    expect(isCircuitTripped('instance1')).toBe(true);

    jest.advanceTimersByTime(30000);

    expect(isCircuitTripped('instance1')).toBe(false);
  });
});
