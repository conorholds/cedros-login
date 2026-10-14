# Cedros Login - Development Makefile
.DEFAULT_GOAL := dev
.PHONY: dev dev-ui dev-server build build-ui build-server build-react-native test test-ui test-server test-server-wasm test-react-native test-scripts test-contracts lint lint-ui lint-server lint-react-native security-audit security-audit-versions cedros-validate cedros-db-concurrency-reference cedros-package cedros-runtime cedros-package-copy fmt fmt-check db-up db-down db-migrate db-reset clean install publish-ui publish-server publish-react-native publish-all publish-source publish-packages test-publish-source test-dependency-security help

SERVER_PORT ?= 57165

# Start both frontend and backend for local dev
dev:
	@make -j2 dev-ui dev-server

dev-ui:
	cd ui && npm run dev

dev-server:
	cd server && PORT=$(SERVER_PORT) cargo run

# Build everything
build:
	@make build-ui build-server build-react-native

build-ui:
	cd ui && npm run build

build-server:
	cd server && cargo build --release --locked

build-react-native:
	cd react-native && npm run build

# Testing (quiet mode - only shows failures and summary)
test:
	@make test-ui test-server test-server-wasm test-react-native test-scripts test-contracts test-dependency-security

test-ui:
	cd ui && npm test -- --reporter=dot

test-server:
	cd server && cargo test --quiet --locked

test-server-wasm:
	cd server-wasm && cargo test --quiet --locked

test-react-native:
	cd react-native && sh -c 'count=$$(find src -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) | wc -l | tr -d " "); \
		if [ "$$count" -eq 0 ]; then echo "No react-native tests found under react-native/src"; exit 1; fi; \
		npm test'

test-scripts:
	node --test scripts/system-performance-smoke.test.mjs scripts/publish-source.test.mjs

test-contracts:
	@make cedros-validate

# Linting/formatting
lint:
	@make lint-ui lint-server lint-react-native

lint-ui:
	cd ui && npm run lint
	cd ui && npm run check:i18n
	cd ui && npm run check:autosave

lint-server:
	cd server && cargo clippy --locked -- -D warnings

lint-react-native:
	cd react-native && npm run lint

security-audit:
	./scripts/security-audit.sh all

security-audit-versions:
	./scripts/security-audit.sh versions

# Validate Cedros extension metadata, integration maps, and contracts.
cedros-validate:
	node --test scripts/cedros-package-forbidden-references.test.mjs
	node --test scripts/validate-cedros-automation-jobs.test.mjs
	node --test scripts/validate-cedros-wasm-abi.test.mjs
	node scripts/validate-contracts.mjs
	node scripts/validate-cedros-login-relying-party-contract.mjs
	node scripts/validate-cedros-login-identity-profile-contract.mjs
	node scripts/validate-cedros-database-concurrency-contract.mjs
	node scripts/run-cedros-database-concurrency-reference.mjs
	node scripts/validate-cedros-extension-shell.mjs
	node scripts/validate-cedros-admin-pages.mjs
	node scripts/validate-cedros-dashboard-cards.mjs
	node scripts/validate-cedros-public-pages.mjs
	node scripts/validate-cedros-visual-builder.mjs
	node scripts/validate-cedros-forms-docs.mjs
	node scripts/validate-cedros-onboarding.mjs
	node scripts/validate-cedros-analytics-events.mjs
	node scripts/validate-cedros-site-brain-logging.mjs
	node --test scripts/validate-cedros-ai-surface.test.mjs
	node scripts/validate-cedros-ai-surface.mjs
	node scripts/validate-cedros-automation-jobs.mjs
	node scripts/validate-cedros-release-readiness.mjs

# Executable reference semantics for the host-owned concurrency acceptance vectors.
cedros-db-concurrency-reference:
	node scripts/validate-cedros-database-concurrency-contract.mjs
	node scripts/run-cedros-database-concurrency-reference.mjs

cedros-package:
	node scripts/package-cedros-extension.mjs
	node scripts/build-cedros-login-runtime-tarball.mjs
	node scripts/validate-cedros-package-archive.mjs

# Build the React runtime tarball locally (dist/cedros-login-react-X.Y.Z.tgz)
# so Cedros platform can consume it via file dependency, vendored workspace, or
# any other trusted channel without `npm publish`.
cedros-runtime:
	node scripts/build-cedros-login-runtime-tarball.mjs

# Rebuild the extension upload ZIP and copy it into the main cedros-login
# working directory (default ~/Workspace/cedros/cedros-login).
# Override the destination with CEDROS_MAIN_DIR=/some/path.
cedros-package-copy:
	node scripts/deploy-cedros-extension.mjs

fmt:
	cd ui && npm run format
	cd server && cargo fmt

# Check formatting without modifying
fmt-check:
	cd ui && npm run format:check
	cd server && cargo fmt -- --check

# Database (for local Postgres)
db-up:
	docker-compose up -d postgres

db-down:
	docker-compose down

db-migrate:
	cd server && sqlx migrate run

db-reset:
	cd server && sqlx database reset -y

# Install dependencies
install:
	cd ui && npm ci
	cd react-native && npm ci

# Clean build artifacts
clean:
	cd ui && rm -rf dist node_modules
	cd server && cargo clean

# Prepare UI for publish (doesn't actually publish)
publish-ui:
	./scripts/publish-ui.sh

publish-ui-version:
	./scripts/publish-ui.sh $(VERSION)

# Prepare server for publish
publish-server:
	./scripts/publish-server.sh

publish-server-version:
	./scripts/publish-server.sh $(VERSION)

# Prepare React Native for publish
publish-react-native:
	./scripts/publish-react-native.sh

publish-react-native-version:
	./scripts/publish-react-native.sh $(VERSION)

# Public GitHub source preparation is separate from registry package preparation.
publish-source:
	./scripts/publish.sh $(VERSION) $(PUBLISH_ARGS)

publish-all: publish-source

publish-packages:
	$(MAKE) publish-ui publish-server publish-react-native

test-publish-source:
	node --test scripts/publish-source.test.mjs

# Requires the locked UI and native dependencies; tests both security backports.
test-dependency-security:
	node --test scripts/dependency-security.test.mjs ui/scripts/formatter-security.test.mjs react-native/scripts/formatter-security.test.mjs

# Help
help:
	@echo "Cedros Login Development Commands:"
	@echo ""
	@echo "  make              - Start UI and server (default)"
	@echo "  make dev          - Start UI and server in parallel"
	@echo "  make dev-ui       - Start UI dev server only"
	@echo "  make dev-server   - Start backend server only"
	@echo "  make build        - Build UI, server, and React Native packages"
	@echo "  make test         - Run all tests"
	@echo "  make test-server-wasm - Run Cedros extension server Wasm tests"
	@echo "  make lint         - Run linters"
	@echo "  make security-audit - Run cargo-audit and Semgrep security scans"
	@echo "  make security-audit-versions - Check security scan tool availability"
	@echo "  make cedros-validate - Validate Cedros extension metadata and handoff maps"
	@echo "  make cedros-package  - Build the inventory ZIP and runtime tarball (no npm publish)"
	@echo "  make cedros-runtime  - Build the runtime tarball only (no npm publish)"
	@echo "  make cedros-package-copy - Build and copy the upload ZIP into the main cedros-login dir"
	@echo "  make fmt          - Format code"
	@echo "  make db-up        - Start Postgres container"
	@echo "  make db-migrate   - Run database migrations"
	@echo "  make clean        - Remove build artifacts"
	@echo "  make publish-source - Prepare the existing public source checkout"
	@echo "  make publish-all   - Alias for publish-source"
	@echo "  make publish-packages - Prepare standalone registry packages"
	@echo "  make test-publish-source - Test source publication guards"
	@echo "  make test-dependency-security - Test resolved security fixes"
	@echo "  make install      - Install UI dependencies"
