// API Configuration
// Change this to switch between localhost and local network IP
// For localhost: 'http://localhost:8000'
// For local network: 'http://192.168.137.142:8000' (replace with your IP)

// Option 1: Use environment variable if set, otherwise use localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Option 2: Uncomment one of these to hardcode:
// const API_BASE_URL = 'http://localhost:8000';  // For local development
// const API_BASE_URL = 'http://192.168.137.142:8000';  // For local network access

export default API_BASE_URL;

