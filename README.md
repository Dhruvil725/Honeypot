# Simple Honeypot

A minimal honeypot that displays a fake 404 error page and logs visitor IP addresses.

## Features

- **Simple 404 Error Page**: All routes display a convincing 404 error page
- **Public IP Logging**: Captures real public IP addresses (not localhost)
- **Multiple Detection Methods**: Uses both client-side and server-side IP detection for reliability
- **Production Ready**: Works when deployed on hosting platforms

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The honeypot will run on `http://localhost:3000`

## How It Works

### Client-Side IP Detection
- The page tries multiple IP detection APIs (ipify, my-ip.io, ipapi.co)
- Sends the detected public IP to the backend
- Works even behind NAT/routers

### Server-Side IP Detection (Fallback)
- If client-side fails, server detects IP from request headers
- Supports multiple proxy headers: Cloudflare, Nginx, Apache, etc.
- Automatically handles IPv6 addresses

### Flow
1. User visits any URL (e.g., `http://yoursite.com/anything`)
2. They see a fake 404 error page
3. JavaScript fetches their public IP from external service
4. IP is sent to `/log` endpoint
5. Server logs IP with timestamp and user agent

## Deployment

### Important: When deploying to production

The `trust proxy` setting is **already enabled** in `server.js`. This is crucial for:
- Heroku
- Render
- Railway
- Vercel
- Any service behind a load balancer or proxy

### Verify IP Detection Works

After deployment, test by visiting your site from different devices/networks:
```bash
# Check logs
cat ip_logs.txt
```

You should see different public IPs from each visitor.

### Environment Variables

```bash
PORT=3000  # Optional, defaults to 3000
```

## Log Format

Each entry in `ip_logs.txt` contains:
```json
{
  "ip": "123.45.67.89",
  "timestamp": "2025-11-29T12:00:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "referer": "https://google.com",
  "url": "Unknown"
}
```

## Files

- `index.html` - Fake 404 error page with client-side IP detection
- `server.js` - Express server with production-ready IP logging
- `ip_logs.txt` - Log file (created automatically)

## Troubleshooting

### Getting localhost IPs (::1 or 127.0.0.1)?
- This is normal when testing on your own computer
- Deploy to a real server to capture visitor IPs

### Client-side IP detection not working?
- Some ad blockers may block IP detection APIs
- Server-side fallback will still work
- The code tries 4 different IP services for reliability

### Still seeing wrong IPs after deployment?
- Make sure your hosting platform is configured correctly
- Check if you need to enable "trust proxy" settings
- Contact your hosting provider about proxy headers
