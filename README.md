# CodaPayments Assignment - Round Robin API

This project implements a **Round Robin API** that forwards HTTP requests to multiple backend application instances using a round-robin algorithm. It also includes a **Circuit Breaker** to handle instances that fail or respond too slowly, ensuring that requests are not sent to unavailable services.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Testing](#testing)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Circuit Breaker Details](#circuit-breaker-details)

## Project Overview

This project provides:
1. A **Round-robin request routing service** that distributes incoming HTTP POST requests across multiple application instances.
2. A **Circuit Breaker** that prevents requests from being sent to unresponsive or slow instances. It automatically retries after a cooldown period.

The service is built using **Node.js** and **Express**, and it features **Axios** for making HTTP requests and **Jest** for unit testing.

## Features

- Round-robin load balancing across multiple application instances.
- Circuit breaker functionality to handle instance failures and timeouts.
- Automatic retries when an instance fails or times out.
- Test coverage using **Jest** and **Supertest** for both unit and integration tests.

## Project Structure

```
/node_modules          

/src                   
  /api                 
    /controllers       
      - MirrorController.js
      - MirrorController.test.js
    /middlewares       
      - validateJson.js
      - validateJson.test.js
    /routes            
      - apiRoutes.js
  /services            
    - roundRobinService.js
    - roundRobinService.test.js
  /config              
    - config.js
  /utils               
    /circuit-breaker   
      - circuitBreaker.js
      - circuitBreaker.test.js
    /http-client   
      - httpClient.js
      - httpClient.test.js
  - roundRobinApi.js   
  - roundRobinApi.test.js
- instance.js        
```

## Getting Started

### Prerequisites
- **Node.js** (version 14 or higher)
- **npm** (version 6 or higher)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/coda-round-robin-api.git
    cd coda-round-robin-api
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

### Running the Application

1. Run the backend application instances on different ports:

    ```bash
    npm run start-instances
    ```
    OR
    ```bash
    node instance.js 3001
    node instance.js 3002
    node instance.js 3003
    ```

2. Run the **Round Robin API**:

    ```bash
    node src/roundRobinService.js
    ```

3. The **Round Robin API** will be accessible at `http://localhost:3000`, and it will route requests to the app instances in a round-robin manner.

## Testing

The project includes unit and integration tests using **Jest** and **Supertest**.

To run the tests:

```bash
npm test
```

This will execute all tests, including the circuit breaker logic, round-robin behavior, and error handling.

## Configuration

The application instances are configured in the `config/config.js` file. Example:

```javascript
export const appInstances = [
  'http://localhost:3001/api',
  'http://localhost:3002/api',
  'http://localhost:3003/api'
];
```

You can add or remove instances as needed. The round-robin logic will automatically adapt to the number of instances.

## API Endpoints

### `POST /api/mirror`

- **Description**: Routes the incoming request to one of the available backend instances using a round-robin approach.
- **Payload**: JSON object (any payload can be sent to the backend instance).
- **Response**: The response will be an acknowledgment with the same payload received, forwarded from one of the backend instances.

Example:

```bash
curl -X POST http://localhost:3000/api/mirror \
-H "Content-Type: application/json" \
-d '{"game": "Mobile Legends", "points": 100}'
```

## Circuit Breaker Details

The Circuit Breaker logic helps manage instance failures by:
- **Failure threshold**: After 3 consecutive failures, the circuit breaker will trip for that instance.
- **Reset timeout**: After 30 seconds, the instance will be re-enabled for requests.
- **Failure tracking**: The number of failures for each instance is tracked using a `Map`.

### Configuration (in `circuitBreaker.js`):
- `failureThreshold`: 3 failures will trip the circuit breaker.
- `resetTimeout`: 30 seconds before the circuit resets and the instance is available again.

The circuit breaker prevents requests from being sent to instances that are down or unresponsive.
