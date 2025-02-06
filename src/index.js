const http_proxy = require('http-proxy');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const os = require('os');

const proxy = http_proxy.createProxyServer({});

const getServerIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
};

const serverIp = getServerIp();

const server = http.createServer((req, res) => {
    const targetUrl = req.url.slice(1); // Remove the leading '/'
    console.log('User tried proxying request to: ' + targetUrl);

    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end(`This is not an HTTP proxy server. Please connect using an EaglercraftX client using the following format:
ws://proxyurl/ws://serverurl.

Here\'s a list of available servers:

{
    "VanillaMC": "wss://vanillamc.tech",
    "Lamp Lifesteal": "wss://mc.lamplifesteal.xyz",
    "Zyth": "wss://mc.zyth.me",
    "Asspixel": "wss://mc.asspixel.net",
    "Zentic": "wss://zentic.cc",
    "Rice Network": "wss://mc.ricenetwork.xyz",
    "Clever-Teaching": "wss://clever-teaching.com",
    "ArchMC": "wss://mc.arch.lol",
    "Hyper Network": "wss://eag.hyper-network.net",
    "Thanatos Network": "wss://web.thanatos-network.xyz",
    "CarrotCraft": "wss://eagler.carrotcraft.org",
    "FyreCraft": "wss://eagler.imcalledfyre.com",
    "Titan Network": "wss://eagler.titannetwork.top",
    "PlebMC": "wss://eagler.plebmc.top",
    "Communist MC": "wss://communistmc.xyz",
    "TeamHolyTOP": "wss://eagler.teamholy.top",
    "Blobcraft": "wss://blobcraft.club",
    "MessCraftX": "wss://x.mess.eu.org",
    "SealCraft / NootServer": "wss://mc.sealcentral.co",
    "Skyline Network": "wss://play.skylinenet.xyz",
    "Eagworld": "wss://play.eagworld.net",
    "q13x Anarchy": "wss://reading-gs.q13x.com"
}


For a more extensive list, visit https://servers.eaglercraft.com`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const targetUrl = req.url.slice(1); // Remove the leading '/'
    console.log('Client connected: ' + ws._socket.remoteAddress);
    connectToTarget(ws, targetUrl);
});

function connectToTarget(ws, targetUrl) {
    const targetWs = new WebSocket(targetUrl);
    const messageQueue = [];

    targetWs.on('open', () => {
        console.log('Connected to target WebSocket server');
        // Send any queued messages
        while (messageQueue.length > 0) {
            targetWs.send(messageQueue.shift());
        }
    });

    targetWs.on('message', (message) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });

    targetWs.on('close', () => {
        ws.close();
    });

    targetWs.on('error', (error) => {
        console.error('Error in target WebSocket connection:', error);
        ws.close();
    });

    ws.on('message', (message) => {
        if (targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(message);
        } else {
            messageQueue.push(message);
        }
    });

    ws.on('close', () => {
        targetWs.close();
    });

    ws.on('error', (error) => {
        console.error('Error in client WebSocket connection:', error);
        targetWs.close();
    });

    targetWs.on('unexpected-response', (req, res) => {
        if (res.statusCode === 308) {
            const location = res.headers.location;
            if (location) {
                console.log('Redirecting to:', location);
                connectToTarget(ws, location);
            } else {
                console.error('Redirect location not provided');
                ws.close();
            }
        } else {
            console.error('Unexpected response:', res.statusCode);
            ws.close();
        }
    });
}

server.listen(8080, () => {
    console.log('Proxy server listening on port 8080');
});