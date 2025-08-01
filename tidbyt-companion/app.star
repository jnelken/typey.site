"""
Tidbyt app configuration for Typey Site companion
"""

load("render.star", "render")
load("schema.star", "schema")

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
                default = "https://typey.site"
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