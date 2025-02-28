# API Environment Comparison Tool

A powerful tool for testing and comparing API responses across different environments. This application allows you to send requests to multiple target environments simultaneously and easily compare the differences in responses.

![API Environment Comparison Tool](https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80)

## Features

- **Multi-environment Testing**: Send requests to multiple environments simultaneously
- **Side-by-side Comparison**: Compare responses between environments
- **Difference Highlighting**: Automatically detect and highlight differences in JSON responses
- **Environment Management**: Configure and manage different target environments
- **Request Collections**: Organize API requests into collections for better management
- **Request Builder**: Comprehensive request builder with support for headers, params, auth, and body
- **Response Analysis**: View response status, time, size, headers, and body

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/api-environment-comparison-tool.git
cd api-environment-comparison-tool
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Managing Environments

The tool comes with two default environments:

- **Target A**: Represented with a green indicator
- **Target B**: Represented with a blue indicator

Each environment can have:
- Custom variables
- Authentication tokens
- Environment-specific URLs for each request

### Working with Collections

1. **Browse Collections**: Use the sidebar to browse through your API collections
2. **Select a Request**: Click on any request to load it in the main panel
3. **Configure Request**: Modify the request method, URLs, parameters, headers, authentication, and body as needed

### Sending Requests

1. **Select Target Environments**: Choose which environments to send the request to
2. **Send Request**: Click the "Send" button to execute the request against all selected environments
3. **View Responses**: Responses will appear in the bottom panel with tabs for each environment

### Comparing Responses

1. **View Individual Responses**: Click on environment tabs to view individual responses
2. **Compare Mode**: Click the "Compare" tab to enter comparison mode
3. **View Differences**: The tool will automatically highlight differences between responses:
   - Added items (green)
   - Removed items (red)
   - Changed values (yellow)

### Customizing Requests

- **URL Parameters**: Add query parameters in the "Params" tab
- **Headers**: Configure request headers in the "Headers" tab
- **Authentication**: Set up authentication in the "Auth" tab
- **Request Body**: Configure the request body in the "Body" tab

## Development

### Project Structure

```
src/
├── components/         # React components
│   ├── EnvironmentSelector.tsx
│   ├── RequestPanel.tsx
│   ├── ResponsePanel.tsx
│   └── Sidebar.tsx
├── types.ts            # TypeScript interfaces
├── utils/              # Utility functions
│   └── compareJson.ts
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

### Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Technologies Used

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and development server
- **Lucide React**: Icon library

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.