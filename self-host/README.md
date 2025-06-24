# KBNet Self-Hosted Setup Guide

<div align="center">
  <img src="../assets/kb.png" alt="KBNet Logo" width="500" />
</div>

KBNet is an interactive learning platform that creates dynamic, AI-powered knowledge maps for exploring topics in an engaging and intuitive way. This guide will help you set up KBNet on your own server.

## Overview

KBNet uses several components:

- **Platform**: Next.js frontend application
- **Server**: Node.js backend
- **Database**: PostgreSQL for data storage
- **MindsDB**: Integration for AI-powered content generation

## Setup Instructions

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/get-npm)
- [Make](https://www.gnu.org/software/make/) (for Linux/macOS, optional for Windows)
- [curl](https://curl.se/download.html)
- [jq](https://jqlang.github.io/jq/download/)

### Installation Steps

#### 1. Download the Self-Host Pack

Download the latest KBNet Self-Host Pack from the [releases page](https://github.com/PriyanshuPz/kbnet/releases).

```bash
# Download the latest release (replace X.X.X with the latest version)
curl -LO https://github.com/PriyanshuPz/kbnet/releases/download/vX.X.X/kbnet_selfhost_pack_vX.X.X.zip

# Extract the archive
unzip kbnet_selfhost_pack_vX.X.X.zip

# Navigate to the extracted directory
cd release
```

#### 2. Configure Environment Variables

Create an `.env` file by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file and update the following required variables:

- `ENCRYPTION_KEY_1`: Generate using `node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"`
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://ai.google.dev/)
- `BETTER_AUTH_SECRET`: Create a strong random string for authentication

Optional variables:

- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: For GitHub authentication
- `WIKI_ACCESS_TOKEN`: For ingesting data from Wikipedia

#### 3. Using the Makefile (Linux/macOS)

The included Makefile makes setup easy:

```bash
# Get help information
make help

# Run the full setup and validation process
make run
```

The `make run` command will:

1. Check required files and dependencies
2. Start Docker services
3. Verify API status
4. Ensure MindsDB connection
5. Seed the database
6. Perform final verification

#### 4. Manual Setup (Windows or without Make)

If you're using Windows or don't have Make installed, follow these steps:

1. **Start the Docker services**:

   ```bash
   docker-compose up -d
   ```

2. **Wait for services to initialize**:
   Wait approximately 30-60 seconds for all services to start up.

3. **Check API status**:

   ```bash
   curl http://localhost:8000/
   ```

   The response should include `"status":"running"`.

4. **Setup MindsDB with data**:

   ```bash
   # Copy .env to seed directory
   copy .env seed\.env

   # Navigate to seed directory
   cd seed

   # Install dependencies and run seeding script
   npm install
   npm run seed

   # Remove temporary .env
   del .env
   cd ..
   ```

5. **Verify setup**:
   ```bash
   curl http://localhost:8000/
   ```
   The response should include `"mindsDB":"connected"`.

### Accessing the Application

After successful setup, access the KBNet application:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)

## About KBNet Components

### Core Features

1. **Knowledge Map Exploration**

   - Create personalized knowledge maps from any topic
   - Interactive navigation with swipe gestures (UP/DOWN/LEFT/RIGHT)
   - Topic relationship types: DEEP, RELATED, SIMILAR

2. **AI-Powered Content Generation**

   - Uses MindsDB with Gemini-2.0-flash model
   - Generates topic summaries, related concepts, and learning paths

3. **Progress Tracking**
   - User stats and achievements
   - XP-based progression system
   - Streak tracking

### Technical Architecture

- **Frontend**: Next.js application (running on port 3000)
- **Backend**: Node.js server (running on port 8000)
- **Database**: PostgreSQL for storing maps, nodes, and user progress
- **MindsDB**: Provides AI capabilities through custom models and knowledge bases

## Troubleshooting

### Common Issues

1. **Docker services not starting**

   - Check Docker daemon is running: `docker info`
   - Verify ports 3000, 8000, 5432, 47334, 47335 are available

2. **MindsDB connection failure**

   - Check MindsDB logs: `docker logs kbnet_mindsdb`
   - Verify credentials in `.env` file

3. **Seeding fails**
   - Verify your Gemini API key is correct
   - Check network connectivity to Google's API

### Logs

To view logs for troubleshooting:

```bash
# Frontend logs
docker logs kbnet_platform

# Backend logs
docker logs kbnet_server

# MindsDB logs
docker logs kbnet_mindsdb

# Database logs
docker logs kbnet_database
```

## Advanced Configuration

### Custom Ports

To use different ports, modify the `docker-compose.yml` file and update the corresponding values in your `.env` file.

### Persistent Data

Docker volumes are used to persist data:

- `kbnet_db_data`: PostgreSQL database
- `kbnet_mindsdb_data`: MindsDB storage

## Updating KBNet

To update to a new version:

1. Download the latest Self-Host Pack
2. Stop the current containers: `docker compose down`
3. Replace files with the new versions
4. Start the services again: `make run` or `docker compose up -d`

## License and Support

KBNet is provided under the MIT license. For support, please open an issue on the GitHub repository.
