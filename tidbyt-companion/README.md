# Typey Site Tidbyt Companion App

This Tidbyt app displays the latest typing entries from your Typey Site deployment.

## Features

- Shows the most recent typing entry from all users
- Displays timestamp and IP address information
- Configurable update intervals
- Optional filtering by IP address (for same-network entries)
- Scrolling text display for long entries

## Setup

1. **Deploy your Typey Site with the API endpoints**
   - Make sure your site is deployed and accessible
   - The API endpoints should be available at `/.netlify/functions/`

2. **Install the Tidbyt app**
   ```bash
   pixlet serve main.star
   ```

3. **Configure the app**
   - Set your deployed site URL (e.g., `https://your-site.netlify.app`)
   - Choose update interval
   - Enable IP filtering if desired

4. **Push to your Tidbyt device**
   ```bash
   pixlet render main.star
   pixlet push your-device-id main.webp
   ```

## Configuration Options

- **API URL**: The base URL of your deployed Typey Site
- **Filter by IP**: When enabled, shows only entries from the same IP as the Tidbyt device
- **Update Interval**: How frequently to check for new entries (1-30 minutes)

## API Endpoints

The app expects these endpoints to be available:

- `GET /api/latest-entry` - Returns the most recent entry
- `GET /api/latest-entry?ip=current` - Returns the most recent entry from the same IP
- `POST /api/submit-entry` - Submits a new entry (used by the main app)

## Development

To test locally:

```bash
pixlet serve main.star
```

Then visit http://localhost:8080 to see the preview.

## Troubleshooting

- If no data appears, check that your API URL is correct and accessible
- Ensure your Netlify Functions are deployed and working
- Check the Tidbyt logs for any error messages
- Verify CORS headers are properly configured for cross-origin requests