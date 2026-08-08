# CounterAPI Browser Example

This is a simple example of how to use CounterAPI in a browser environment.

## Features

- Increment and decrement a counter
- Get a counter's current value
- Reset a counter to zero
- Get counter statistics
- View the raw API responses
- Customizable workspace and counter name

## Usage

1. Build the CounterAPI library first:

```bash
# From the project root
npm run build
```

2. Serve the example using a web server:

```bash
# Using Python's built-in HTTP server
cd examples/browser
python -m http.server 8000

# Or using Node.js and http-server (npm install -g http-server)
cd examples/browser
http-server -p 8000
```

3. Open your browser and navigate to http://localhost:8000

## How It Works

The example demonstrates:

1. Loading the CounterAPI library in a browser environment
   - Uses a local build during development
   - Uses the CDN in production

2. Creating a Counter client instance
   - Uses the workspace parameter

3. Making API calls:
   - `up()` - Increments a counter
   - `down()` - Decrements a counter
   - `get()` - Gets a counter's current value
   - `reset()` - Resets a counter to zero
   - `stats()` - Gets counter statistics

4. Handling API responses and errors

## Code Structure

- **HTML/UI** - Provides a simple interface with inputs and buttons
- **JavaScript** - Loads the library and handles user interactions
- **CSS** - Basic styling for a pleasant user experience

## Notes

- The example uses async/await for API calls
- Error handling is implemented to show any API errors
- The workspace and counter name can be changed on the fly 