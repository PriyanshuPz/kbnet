# Makefile for KBNet Setup

# Variables
DOCKER_COMPOSE = docker-compose.yml
PRISMA_DIR = ./prisma
SEED_DIR = ./seed
API_URL = http://localhost:8000/

.PHONY: help run check-docker check-node check-files check-api check-db check-mindsdb prisma-push seed done

help:
	@echo "Usage:"
	@echo "  make help             Show available commands"
	@echo "  make run              Run the full setup and validation process"

run: check-files check-docker check-node start-docker check-api check-db prisma-push check-mindsdb seed check-api-final done

check-files:
	@echo "✅ Checking required files..."
	@if [ ! -f $(DOCKER_COMPOSE) ]; then echo "❌ Missing docker-compose.yml"; exit 1; fi
	@if [ ! -d $(PRISMA_DIR) ]; then echo "❌ Missing prisma directory"; exit 1; fi
	@if [ ! -d $(SEED_DIR) ]; then echo "❌ Missing seed directory"; exit 1; fi
	@echo "✅ All required files are present."

check-docker:
	@echo "🔍 Checking Docker installation..."
	@which docker > /dev/null || (echo "❌ Docker is not installed or not in PATH"; exit 1)
	@docker info > /dev/null || (echo "❌ Cannot access Docker daemon. Is it running?"; exit 1)
	@echo "✅ Docker is installed and running."

check-node:
	@echo "🔍 Checking Node.js and npm installation..."
	@which node > /dev/null || (echo "❌ Node.js is not installed or not in PATH"; exit 1)
	@which npm > /dev/null || (echo "❌ npm is not installed or not in PATH"; exit 1)
	@echo "✅ Node.js and npm are available."

start-docker:
	@echo "🚀 Starting Docker services..."
	docker-compose -f $(DOCKER_COMPOSE) up -d
	@echo "⌛ Waiting for API to become available..."
	@sleep 5

check-api:
	@echo "🔍 Checking API status..."
	@curl -s --fail $(API_URL) | jq '.' || (echo "❌ API is not responding"; exit 1)

check-db:
	@echo "🔍 Checking if database is connected..."
	@if curl -s $(API_URL) | grep -q '"database":"connected"'; then \
		echo "✅ Database is connected."; \
	else \
		echo "❌ Database is not connected."; exit 1; \
	fi

prisma-push:
	@echo "🔄 Running Prisma DB push..."
	export DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2-)
	@if [ -z "$$DATABASE_URL" ]; then echo "❌ DATABASE_URL is not set in .env file"; exit 1; fi
	@echo "Using DATABASE_URL: $$DATABASE_URL"
	@echo "Running Prisma DB push..."
	npx prisma db push --skip-generate

check-mindsdb:
	@echo "🔍 Checking if MindsDB is connected..."
	@if curl -s $(API_URL) | grep -q '"mindsDB":"connected"'; then \
		echo "✅ MindsDB is already connected."; \
	else \
		echo "⚙️ MindsDB is not connected. Running seed script..."; \
		node seed/src/index.js; \
	fi

seed:
	@echo "✅ Seed process completed (if required)."

check-api-final:
	@echo "🔄 Final API status check..."
	@curl -s --fail $(API_URL) | jq '.' || (echo "❌ API is not responding"; exit 1)
	@if curl -s $(API_URL) | grep -q '"mindsDB":"connected"'; then \
		echo "✅ Setup successful. MindsDB is connected."; \
	else \
		echo "❌ MindsDB connection failed after seeding."; exit 1; \
	fi

done:
	@echo "🎉 Setup completed successfully! You can now access the application at http://localhost:3000"
