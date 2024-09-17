export const instanceFailures = new Map();
const failureThreshold = 3;
const resetTimeout = 30000;

export const isCircuitTripped = instance => {
  return instanceFailures.get(instance) >= failureThreshold;
};

export const registerFailure = instance => {
  instanceFailures.set(instance, instanceFailures.get(instance) + 1 || 1);

  if (instanceFailures.get(instance) >= failureThreshold) {
    setTimeout(() => {
      instanceFailures.delete(instance);
    }, resetTimeout);
  }
};

export const registerSuccess = instance => {
  instanceFailures.delete(instance);
};
