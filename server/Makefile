# Cedros Login Server - Makefile
# Run `make help` for available targets

.PHONY: all help build run test lint fmt clean db-up db-down db-migrate docker-build docker-run

# Default: full local dev environment
all: db-up db-migrate
	cargo run

help:
	@echo "Cedros Login Server"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Quick Start:"
	@echo "  make          Start full local dev (postgres + migrate + run)"
	@echo ""
	@echo "Development:"
	@echo "  run           Run the server (cargo run)"
	@echo "  build         Build release binary"
	@echo "  test          Run all tests"
	@echo "  lint          Run clippy linter"
	@echo "  fmt           Format code"
	@echo "  clean         Clean build artifacts"
	@echo ""
	@echo "Database:"
	@echo "  db-up         Start PostgreSQL container"
	@echo "  db-down       Stop PostgreSQL container"
	@echo "  db-migrate    Run database migrations"
	@echo "  db-reset      Reset database (drop and recreate)"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build  Build Docker image"
	@echo "  docker-run    Run server in Docker"
	@echo "  docker-all    Start all services (postgres + server)"

# =============================================================================
# Development
# =============================================================================

run:
	cargo run

build:
	cargo build --release --all-features --locked

test:
	cargo test --all-features --locked

lint:
	cargo clippy --locked -- -D warnings

fmt:
	cargo fmt

fmt-check:
	cargo fmt -- --check

clean:
	cargo clean

# =============================================================================
# Database
# =============================================================================

db-up:
	docker-compose -f ../docker-compose.yml up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3
	@echo "PostgreSQL is ready at localhost:15432"

db-down:
	docker-compose -f ../docker-compose.yml down

db-migrate:
	sqlx migrate run

db-reset:
	sqlx database reset -y

# =============================================================================
# Docker
# =============================================================================

docker-build:
	docker build -t cedros-login-server .

docker-run: docker-build
	docker run -p 8080:8080 --env-file .env cedros-login-server

docker-all:
	docker-compose -f ../docker-compose.yml --profile full up -d

docker-stop:
	docker-compose -f ../docker-compose.yml --profile full down

# =============================================================================
# CI/CD
# =============================================================================

ci: fmt-check lint test
	@echo "All CI checks passed!"

# =============================================================================
# Quick Commands
# =============================================================================

# Run with PostgreSQL (starts db if needed)
dev: db-up
	cargo run

# Full test suite with coverage info
test-verbose:
	cargo test -- --nocapture

# Check everything compiles
check:
	cargo check --all-features --locked
