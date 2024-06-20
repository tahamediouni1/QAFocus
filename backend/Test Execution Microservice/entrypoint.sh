#!/bin/bash
# Start the virtual frame buffer in the background
Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99

# Start Chrome with the --no-sandbox flag
google-chrome --no-sandbox &

# Execute the main command (e.g., start Flask app)
exec "$@"
