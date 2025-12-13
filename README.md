# GameLog

A comprehensive game logging and tracking platform.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update values
3. Start services: `docker-compose up -d`
4. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

## Development

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

## Production

```bash
docker-compose -f docker-compose.yml up --build
```
