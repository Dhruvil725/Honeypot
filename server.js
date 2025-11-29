const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - IMPORTANT for production deployment
// This allows Express to read the real IP from proxy headers
app.set('trust proxy', true);

// Enable CORS to allow requests from Netlify frontend
const cors = require('cors');
app.use(cors({
    origin: '*', // Allow all origins (you can restrict this to your Netlify URL)
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Serve the 404 page for any route
app.get('*', (req, res, next) => {
    if (req.path === '/log') {
        return next();
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Log endpoint - captures IP address only
app.post('/log', (req, res) => {
    // Get IP from multiple sources (client-side fetch or server detection)
    let ip = req.body.ip; // First try client-provided IP

    // If client didn't provide IP, detect from server side
    if (!ip) {
        // Check various headers set by proxies/load balancers
        ip = req.headers['cf-connecting-ip'] ||          // Cloudflare
            req.headers['x-real-ip'] ||                 // Nginx
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() || // Standard proxy
            req.headers['x-client-ip'] ||               // Apache
            req.ip ||                                    // Express (with trust proxy)
            req.connection.remoteAddress ||             // Direct connection
            req.socket.remoteAddress;                   // Fallback
    }

    // Clean up IPv6 localhost to IPv4 for better readability
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        ip = '127.0.0.1';
    }

    // Remove IPv6 prefix if present
    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers['referer'] || req.headers['referrer'] || 'Direct';

    const logEntry = {
        ip: ip,
        timestamp: timestamp,
        userAgent: userAgent,
        referer: referer,
        url: req.body.url || 'Unknown'
    };

    // Log to console
    console.log(`[${timestamp}] IP: ${ip} | UA: ${userAgent.substring(0, 50)}`);

    // Append to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFile('ip_logs.txt', logLine, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });

    res.status(200).json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🍯 Honeypot running on http://localhost:${PORT}`);
    console.log(`📝 IP addresses will be logged to ip_logs.txt`);
    console.log(`⚠️  All routes will display a fake 404 error page`);
    console.log(`🔒 Trust proxy: ${app.get('trust proxy')}`);
});
