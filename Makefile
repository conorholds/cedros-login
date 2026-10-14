.DEFAULT_GOAL := help
.PHONY: help install dev-server build build-ui build-server build-react-native build-wasm test test-ui test-server test-server-wasm test-react-native test-contracts test-dependency-security lint lint-ui lint-server lint-react-native fmt fmt-check cedros-validate security-audit
SERVER_PORT ?= 57165

install:
	cd ui && npm ci
	cd react-native && npm ci

dev-server:
	cd server && PORT=$(SERVER_PORT) cargo run

build:
	$(MAKE) build-ui build-server build-react-native

build-ui:
	cd ui && npm run build

build-server:
	cd server && cargo build --release --locked

build-react-native:
	cd react-native && npm run build

build-wasm:
	cargo build --manifest-path server-wasm/Cargo.toml --target wasm32-wasip2 --release --locked

test:
	$(MAKE) test-ui test-server test-server-wasm test-react-native test-contracts test-dependency-security

test-ui:
	cd ui && npm test

test-server:
	cd server && cargo test --locked

test-server-wasm:
	cd server-wasm && cargo test --locked

test-react-native:
	cd react-native && npm test

test-contracts: cedros-validate

cedros-validate:
	node scripts/validate-contracts.mjs

test-dependency-security:
	node --test scripts/dependency-security.test.mjs ui/scripts/formatter-security.test.mjs react-native/scripts/formatter-security.test.mjs

lint:
	$(MAKE) lint-ui lint-server lint-react-native

lint-ui:
	cd ui && npm run lint
	cd ui && npm run check:i18n
	cd ui && npm run check:autosave

lint-server:
	cd server && cargo clippy --locked -- -D warnings

lint-react-native:
	cd react-native && npm run lint

fmt:
	cd ui && npm run format
	cd server && cargo fmt

fmt-check:
	cd ui && npm run format:check
	cd server && cargo fmt -- --check

security-audit:
	cd ui && npm audit
	cd react-native && npm audit
	cd server && cargo audit --ignore RUSTSEC-2023-0071
	cd server-wasm && cargo audit

help:
	@echo "Cedros Login source commands (run builds and tests sequentially)"
	@echo "  install, dev-server, build, build-ui, build-server, build-react-native, build-wasm"
	@echo "  test, test-ui, test-server, test-server-wasm, test-react-native, test-contracts"
	@echo "  test-dependency-security, lint, fmt, fmt-check, cedros-validate, security-audit"
