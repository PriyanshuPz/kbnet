# Makefile for KBNet Setup

# Variables
DOCKER_COMPOSE = docker-compose.yml
PRISMA_DIR = ./prisma
SEED_DIR = ./seed
API_URL = http://localhost:8000/

.PHONY: help run check-docker check-node check-files check-api check-db check-mindsdb seed done

help:
	@echo "KBNet Setup Help"
	@echo "================="
	@echo "Available commands:"
	@echo "  make help             Show this help information"
	@echo "  make run              Run the full setup and validation process"
	@echo "  make check-files      Verify required files and directories exist"
	@echo "  make check-docker     Verify Docker is installed and running"
	@echo "  make check-node       Verify Node.js and npm are installed"
	@echo "  make start-docker     Start Docker containers defined in docker-compose.yml"
	@echo "  make check-api        Verify the API is running correctly"
	@echo "  make check-mindsdb    Check if MindsDB connection is established"
	@echo "  make seed             Seed MindsDB with initial data"
	@echo "  make check-api-final  Perform final API status verification"
	@echo ""
	@echo "Full setup process:"
	@echo "  'make run' will execute all necessary steps in the correct order"
	@echo "  to set up and validate your KBNet environment."

run: check-files check-docker check-node start-docker check-api check-mindsdb seed check-api-final done

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
	docker compose -f $(DOCKER_COMPOSE) up -d
	@echo "⌛ Waiting for API to become available..."
	@sleep 5

check-api:
	@echo "🔍 Checking API status..."
	@curl -s --fail $(API_URL) | jq '.' || (echo "❌ API is not responding"; exit 1)
	@if curl -s $(API_URL) | grep -q '"status":"running"'; then \
		echo "✅ API is running and responding."; \
	else \
		echo "❌ API is not responding as expected."; exit 1; \
	fi



check-mindsdb:
	@echo "🔍 Checking if MindsDB is connected..."
	@if curl -s $(API_URL) | grep -q '"mindsDB":"connected"'; then \
		echo "✅ MindsDB is connected."; \
	else \
		echo "⚙️ MindsDB is not connected."; \
	fi


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



seed:
	@echo "🔍 Checking MindsDB is online"
	@curl -s --fail $(API_URL) | jq '.' || (echo "❌ MindsDB is not online"; exit 1)
	@if curl -s $(API_URL) | grep -q '"mindsDB":"connected"'; then \
			echo "✅ MindsDB is connected. proceeding with seeding."; \
			echo "🌱 Seeding the MindsDB..."; \
			echo "🔑 Loading environment variables..."; \
			if [ -f .env ]; then \
					echo "📋 Copying .env file to seed directory..."; \
					cp .env $(SEED_DIR)/.env && \
					cd $(SEED_DIR) && npm install && npm run seed && rm -f .env; \
			else \
					echo "⚠️ No .env file found, proceeding without environment variables"; \
					cd $(SEED_DIR) && npm install && npm run seed; \
			fi; \
			if [ $$? -ne 0 ]; then echo "❌ Seeding failed"; exit 1; fi; \
			echo "✅ MindsDB seeded successfully."; \
	else \
			echo "⚠️ MindsDB is not connected, please wait and try again after some seconds."; \
			echo "Run 'make seed' to seed MindsDB."; \
			exit 1; \
	fi