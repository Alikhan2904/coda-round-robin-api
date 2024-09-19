import { appInstances } from '../../config/config.js';
import {
  getFailureCount,
  isCircuitTripped,
  registerFailure,
  registerSuccess
} from '../../utils/circuit-breaker/circuitBreaker.js';
import { postToInstance } from '../../utils/http-client/httpClient.js';

let currentIndex = 0;

export function resetCurrentIndex() {
  currentIndex = 0;
}

function getNextAppInstance() {
  const instance = appInstances[currentIndex];
  currentIndex = (currentIndex + 1) % appInstances.length;
  return instance;
}

export const routeRequest = async payload => {
  let attempts = 0;
  while (attempts < appInstances.length) {
    const targetApp = getNextAppInstance();

    if (isCircuitTripped(targetApp)) {
      console.log(
        `Instance at ${targetApp} is temporarily unavailable due to repeated failures.`
      );
      attempts++;
      continue;
    }

    try {
      const data = await postToInstance(targetApp, payload);
      registerSuccess(targetApp);
      console.log(`Successful response from: ${targetApp}`);
      return data;
    } catch (error) {
      registerFailure(targetApp);
      attempts++;
      console.log(
        `Instance at ${targetApp} is down or unresponsive. Failure count is ${getFailureCount(
          targetApp
        )}`
      );
    }
  }
  throw new Error('All instances are down or unresponsive.');
};
