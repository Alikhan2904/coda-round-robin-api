import { appInstances } from '../../config/config.js';
import { postToInstance } from '../../utils/httpClient.js';

let currentIndex = 0;

const instanceFailures = {};

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

    try {
      const data = await postToInstance(targetApp, payload);
      instanceFailures[targetApp] = 0;

      console.log('Successful response from:', targetApp);
      return data;
    } catch (error) {
      console.log(
        `Instance at ${targetApp} is slow or down. Failure count: ${instanceFailures[targetApp]}`
      );
      instanceFailures[targetApp] = (instanceFailures[targetApp] || 0) + 1;
      attempts++;
    }
  }
  throw new Error('All instances are down or unresponsive');
};
