# Cedros Login Server - Multi-stage Docker Build
# Build: docker build -t cedros-login-server .
# Run:   docker run -p 57165:57165 --env-file .env cedros-login-server

# =============================================================================
# Stage 1: Build
# =============================================================================
FROM rust:1.97.0-slim-bookworm@sha256:cfbb0e0ef7a73e736386bfa346f1cb0503c6d162969dc9426fb37834f3f64c25 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first for dependency caching
COPY Cargo.toml Cargo.lock ./

# Create dummy sources for dependency build (lib + bin)
RUN mkdir src \
    && echo "pub fn _dummy() {}" > src/lib.rs \
    && echo "fn main() {}" > src/main.rs

# Build dependencies (this layer will be cached)
RUN cargo build --release --all-features --locked && rm -rf src

# Copy actual source code
COPY src ./src
COPY migrations ./migrations

# Touch entrypoints to invalidate the dummy build
RUN touch src/main.rs src/lib.rs

# Build the actual application
RUN cargo build --release --all-features --locked

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM debian:bookworm-slim@sha256:60eac759739651111db372c07be67863818726f754804b8707c90979bda511df

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 cedros
USER cedros

WORKDIR /app

# Copy binary from builder
COPY --from=builder --chown=cedros:cedros /app/target/release/cedros-login /app/cedros-login

# Copy migrations for runtime (if using sqlx migrations)
COPY --from=builder --chown=cedros:cedros /app/migrations /app/migrations

# Default environment variables
ENV HOST=0.0.0.0
ENV PORT=57165
ENV RUST_LOG=cedros_login=info,tower_http=info

# Expose port
EXPOSE 57165

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:57165/health || exit 1

# Run the server
CMD ["/app/cedros-login"]
