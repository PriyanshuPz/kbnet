# KbNet Platform

This is the KbNet platform, an interactive learning platform that creates dynamic, AI-powered knowledge maps for users to explore topics in an engaging and intuitive way. The project uses MindsDB for AI capabilities and follows a modern web architecture.

# Setup Instructions

This frontend is built with Next.js and the backend is a Node.js server. To set up the platform, follow these steps:
create a `.env` file in this directory with the following variables:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:8000
DATABASE_URL=postgresql://mindsdb:mindsdb@localhost:5432/mindsdb

BETTER_AUTH_SECRET=auth-token
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

Now, follow the instructions in the [MAIN README](../../README.md) file to set up the MindsDB server and the database.
