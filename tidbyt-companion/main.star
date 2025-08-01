"""
Tidbyt companion app for Typey Site
Displays the latest typing entries from all users
"""

load("render.star", "render")
load("http.star", "http")
load("cache.star", "cache")
load("time.star", "time")
load("encoding/json.star", "json")
load("schema.star", "schema")

# Default configuration
DEFAULT_API_URL = "https://typey.site"
MAX_DISPLAY_LENGTH = 50

def main(config):
    """Main function that renders the Tidbyt display"""
    
    # Get configuration
    api_url = config.get("api_url", DEFAULT_API_URL)
    filter_by_ip = config.bool("filter_by_ip", False)
    update_interval = int(config.get("update_interval", "5"))
    
    # Get the latest entry
    entry = get_latest_entry(api_url, filter_by_ip, update_interval)
    
    if not entry:
        return render_no_data()
    
    return render_entry(entry)

def get_latest_entry(api_url, filter_by_ip, update_interval):
    """Fetch the latest typing entry from the API"""
    
    # Create cache key based on configuration
    cache_key = "latest_entry"
    if filter_by_ip:
        cache_key += "_filtered"
    
    # Check cache first
    cached_entry = cache.get(cache_key)
    if cached_entry:
        return json.decode(cached_entry)
    
    # Make API request
    url = api_url + "/api/latest-entry"
    if filter_by_ip:
        url += "?ip=current"
    
    cache_ttl = update_interval * 60  # Convert minutes to seconds
    response = http.get(url, ttl_seconds=cache_ttl)
    
    if response.status_code != 200:
        print("Failed to fetch data: %s" % response.status_code)
        return None
    
    try:
        data = response.json()
        entry = data.get("entry")
        
        if entry:
            # Cache the result
            cache.set(cache_key, json.encode(entry), ttl_seconds=cache_ttl)
            return entry
    except:
        print("Failed to parse response")
        return None
    
    return None

def render_entry(entry):
    """Render a typing entry on the display"""
    
    text = entry.get("text", "")
    timestamp = entry.get("timestamp", "")
    ip_address = entry.get("ip", "Unknown")
    
    # Truncate text if too long
    if len(text) > MAX_DISPLAY_LENGTH:
        text = text[:MAX_DISPLAY_LENGTH-3] + "..."
    
    # Format timestamp
    time_display = format_time(timestamp)
    
    return render.Root(
        child=render.Column(
            expanded=True,
            main_align="space_between",
            children=[
                # Header
                render.Row(
                    expanded=True,
                    main_align="space_between",
                    children=[
                        render.Text(
                            content="🎯 Typey",
                            color="#00ff00",
                            font="tom-thumb"
                        ),
                        render.Text(
                            content=time_display,
                            color="#888888",
                            font="tom-thumb"
                        ),
                    ],
                ),
                
                # Main content
                render.Marquee(
                    width=64,
                    child=render.Text(
                        content=text,
                        color="#ffffff",
                        font="6x13"
                    ),
                ),
                
                # Footer with IP info
                render.Text(
                    content="IP: %s" % ip_address[-8:],  # Show last 8 chars of IP
                    color="#666666",
                    font="tom-thumb"
                ),
            ],
        ),
    )

def render_no_data():
    """Render when no data is available"""
    
    return render.Root(
        child=render.Column(
            expanded=True,
            main_align="center",
            cross_align="center",
            children=[
                render.Text(
                    content="🎯 Typey Site",
                    color="#00ff00",
                    font="6x13"
                ),
                render.Text(
                    content="No entries yet",
                    color="#888888",
                    font="tom-thumb"
                ),
                render.Text(
                    content="Start typing!",
                    color="#ffffff",
                    font="tom-thumb"
                ),
            ],
        ),
    )

def format_time(timestamp):
    """Format timestamp for display"""
    
    if not timestamp:
        return "now"
    
    try:
        # Parse ISO timestamp and format for display
        parsed_time = time.parse_time(timestamp)
        return time.format(parsed_time, "15:04")
    except:
        return "now"

def get_schema():
    """Define the app configuration schema"""
    
    return schema.Schema(
        version = "1",
        fields = [
            schema.Text(
                id = "api_url",
                name = "API URL",
                desc = "The URL of your Typey Site deployment",
                icon = "globe",
                default = DEFAULT_API_URL
            ),
            schema.Toggle(
                id = "filter_by_ip",
                name = "Filter by IP",
                desc = "Show only entries from the same IP address",
                icon = "filter",
                default = False
            ),
            schema.Dropdown(
                id = "update_interval",
                name = "Update Interval",
                desc = "How often to check for new entries",
                icon = "clock",
                default = "5",
                options = [
                    schema.Option(
                        display = "1 minute",
                        value = "1"
                    ),
                    schema.Option(
                        display = "5 minutes",
                        value = "5"
                    ),
                    schema.Option(
                        display = "10 minutes",
                        value = "10"
                    ),
                    schema.Option(
                        display = "30 minutes",  
                        value = "30"
                    ),
                ]
            ),
        ]
    )