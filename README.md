# WebSocket Proxy Server

This project implements a WebSocket proxy server using the `http-proxy` and `ws` libraries. It sets up an HTTP server that proxies requests to a target server and handles WebSocket connections.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd eag-proxy
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the WebSocket proxy server, run the following command:

```
npm start
```

The server will listen for incoming HTTP and WebSocket connections and proxy them to the target server specified in the `src/index.js` file.

Connect to it via an EaglercraftX client through direct connect using the following format:

```
ws://proxyurl/wss://eagurl
```

Alternatively, get a list of servers from it as an http server:

```
http://proxyurl
```

## Warnings

Servers like Zentic may block proxy connections due to connecting directly from IP, please proceed with caution.



## Dependencies

- `http-proxy`
- `ws`
- `url`
- `http`
- `os`

## License

This project is licensed under the MIT License.