# PPP Price Converter

A web application that converts prices across different countries using Purchasing Power Parity (PPP) data. This application helps users understand the relative value of money across different economies by adjusting prices based on the cost of living and purchasing power in each country.

## Tech Stack

- **Vue.js 3** with Composition API and TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS 4.x** for styling
- **Vue Router 4** for navigation
- **Docker** for containerization

## Project Structure

```
.
├── frontend/              # Vue.js frontend application
│   ├── src/
│   │   ├── assets/       # Static assets
│   │   ├── components/   # Vue components
│   │   │   ├── common/   # Reusable UI components
│   │   │   ├── converter/# Conversion-specific components
│   │   │   └── layout/   # Layout components
│   │   ├── composables/  # Composition API logic
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Utility functions
│   │   ├── services/     # API services
│   │   ├── stores/       # State management
│   │   ├── views/        # Page components
│   │   ├── router/       # Vue Router configuration
│   │   ├── styles/       # Global styles
│   │   ├── App.vue       # Root component
│   │   └── main.ts       # Application entry point
│   ├── Dockerfile        # Docker configuration for frontend
│   └── package.json      # Node.js dependencies
└── docker-compose.yml    # Docker Compose configuration

```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Docker and Docker Compose (optional)

### Local Development (without Docker)

1. Clone the repository:
```bash
git clone https://github.com/thdelmas/PPP-Price-Converter.git
cd PPP-Price-Converter
```

2. Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

3. Copy the environment example file and configure:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Docker Development

1. Clone the repository:
```bash
git clone https://github.com/thdelmas/PPP-Price-Converter.git
cd PPP-Price-Converter
```

2. Start the application using Docker Compose:
```bash
docker-compose up
```

The application will be available at `http://localhost:5173`

To rebuild the containers:
```bash
docker-compose up --build
```

To stop the containers:
```bash
docker-compose down
```

## Available Scripts

In the `frontend` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type check with TypeScript

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_PPP_API_KEY=your_api_key_here
VITE_CURRENCY_API_KEY=your_api_key_here
VITE_APP_VERSION=1.0.0
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## License

[License information here]
