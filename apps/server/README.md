# KbNet Server

This is the KbNet server, which provides the backend functionality for the KbNet platform. It handles knowledge map management, AI content generation, and progress tracking.

# Setup Instructions

This server is built with Node.js and uses MindsDB for AI capabilities. To set up the server, follow these steps:

1. Create a `.env` file in this directory with the following variables:

```env
MINDSDB_HOST=http://localhost:47334
MINDSDB_USERNAME=mindsdb
MINDSDB_PASSWORD=mindsdb


GEMINI_API_KEY=AIza...
WIKI_ACCESS_TOKEN="ey..."

# same as frontend environment variables
BETTER_AUTH_SECRET=ZqjXF3fPMkwfiIXAIGsVVl52MyMwJ2G7
BETTER_AUTH_URL=http://localhost:3000

DATABASE_URL=postgresql://mindsdb:mindsdb@localhost:5432/mindsdb
```

Now, follow the instructions in the [MAIN README](../../README.md) file to set up the MindsDB server and the database.
