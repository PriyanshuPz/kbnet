[![wakatime](https://wakatime.com/badge/user/a4c237dc-fe02-47f0-97b5-c25292afe1cf/project/ffe875ce-f33d-45ec-81d8-dade826b4901.svg)](https://wakatime.com/badge/user/a4c237dc-fe02-47f0-97b5-c25292afe1cf/project/ffe875ce-f33d-45ec-81d8-dade826b4901)

## KbNet Overview

<div align="center">
  <img src="assets/kb.png" alt="KbNet Logo" width="500" />
  
</div>

KBNet is an interactive learning platform that creates dynamic, AI-powered knowledge maps for users to explore topics in an engaging and intuitive way. The project uses MindsDB for AI capabilities and follows a modern web architecture.

## Core Features

### 1. Knowledge Map Exploration

- Users can create personalized knowledge maps starting from any topic
- Interactive navigation using swipe gestures (UP/DOWN/LEFT/RIGHT)
- Three types of topic relationships:
  - DEEP: More detailed exploration of current topic
  - RELATED: Connected but different concepts
  - SIMILAR: Alternative approaches or perspectives

### 2. AI-Powered Content Generation

- Uses `MindsDB` integration with Gemini-2.0-flash model
- Dynamically generates:
  - Topic summaries
  - Related concepts
  - Learning paths
- Knowledge base (`KB_NAME`) for contextual information

### 3. Progress Tracking

- User stats and achievements system
- XP-based progression:
  - Start map: 50 XP
  - Visit node: 5 XP
  - Return to node: 2 XP
  - Daily streak bonus: 20 XP
- Badges for accomplishments
- Streak tracking system

### 4. Map Summaries

- AI-generated summaries of exploration paths
- Journal-style narratives of learning journeys
- 24-hour cooldown between summary generations
- Status tracking (PENDING/IN_PROGRESS/COMPLETED/FAILED)

## Technical Architecture

### Frontend

- Built with Next.js
- Located in platform
- Features:
  - Interactive map visualization
  - Progress tracking dashboard
  - User achievements display
  - Summary generation interface

### Backend

- Node.js server in server
- Key controllers:
  - Map generation and navigation
  - User statistics tracking
  - Achievement system
  - Summary generation

### Database Schema

Main tables:

- Maps: User's learning journeys
- Nodes: Individual topics
- Navigation Steps: User's exploration path
- Node Relationships: Topic connections
- Map Summaries: Generated learning narratives

### AI Integration

- MindsDB for AI processing
- Multiple data sources:
  - Wikipedia
  - HackerNews
  - YouTube
- Custom prompts for different node types
- Specialized summary generation agent

## Developer Features

- Turborepo monorepo setup
- TypeScript throughout
- ESLint and Prettier configuration
- Remote caching support
- Shared component library
- Development and production environment configurations

## Project Status

The project appears to be actively maintained by Priyanshu Verma, with ongoing development and improvements. It's part of the Quira Quest initiative, aimed at creating innovative AI-powered educational tools.

## Notable Technical Decisions

1. Use of MindsDB for AI processing
2. Monorepo architecture with shared packages
3. Real-time WebSocket updates for user interactions
4. Separation of platform and server applications
5. TypeScript for type safety across the codebase

This project represents a sophisticated implementation of AI-powered educational technology, focusing on interactive and personalized learning experiences.
