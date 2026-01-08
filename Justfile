# Justfile for UbiCity v0.3
# Modern build orchestration for Deno + ReScript + WASM

# Default recipe
default:
    @just --list

# Setup development environment
setup:
    @echo "🔧 Setting up UbiCity development environment..."
    @echo "Installing Deno (if not installed)..."
    @command -v deno || curl -fsSL https://deno.land/install.sh | sh
    @echo "Checking for Rust..."
    @command -v cargo || (echo "Please install Rust: https://rustup.rs" && exit 1)
    @echo "Checking for ReScript..."
    @command -v rescript || npm install -g rescript
    @echo "Installing wasm-pack..."
    @command -v wasm-pack || cargo install wasm-pack
    @echo "✅ Setup complete!"

# Build all components
build: build-rescript build-wasm
    @echo "✅ Build complete!"

# Build ReScript to JavaScript
build-rescript:
    @echo "🔨 Building ReScript..."
    rescript build

# Build WASM from Rust
build-wasm:
    @echo "🦀 Building WASM..."
    cd wasm && cargo build --release --target wasm32-unknown-unknown
    @echo "🎯 Optimizing WASM..."
    wasm-opt -Oz -o wasm/pkg/ubicity_bg.wasm wasm/target/wasm32-unknown-unknown/release/ubicity_wasm.wasm || echo "wasm-opt not found, skipping optimization"

# Watch ReScript for changes
watch-rescript:
    rescript build -w

# Run all tests
test:
    deno test --allow-read --allow-write tests/

# Run tests in watch mode
test-watch:
    deno test --watch --allow-read --allow-write tests/

# Run benchmarks
bench:
    deno bench --allow-read --allow-write benchmarks/

# Format code
fmt:
    deno fmt
    rescript format -all

# Lint code
lint:
    deno lint

# Type check
check:
    deno check src/**/*.ts

# Clean build artifacts
clean:
    @echo "🧹 Cleaning build artifacts..."
    rescript clean
    rm -rf wasm/target
    rm -rf lib
    rm -rf coverage
    @echo "✅ Clean complete!"

# Compile to standalone executables
compile: build
    @echo "📦 Compiling standalone executables..."
    deno compile --allow-read --allow-write --output ./bin/ubicity src/cli.ts
    deno compile --allow-read --allow-write --output ./bin/ubicity-capture src/capture.ts
    @echo "✅ Executables created in ./bin/"

# Run the CLI
cli *ARGS:
    deno run --allow-read --allow-write src/cli.ts {{ARGS}}

# Capture an experience
capture MODE="quick":
    deno run --allow-read --allow-write src/capture.ts {{MODE}}

# Generate visualization
viz:
    deno run --allow-read --allow-write src/visualize.ts

# Generate report
report:
    deno run --allow-read --allow-write src/cli.ts report

# Show stats
stats:
    deno run --allow-read --allow-write src/cli.ts stats

# Development server with watch
dev:
    deno run --watch --allow-read --allow-write src/cli.ts

# Cache all dependencies
cache:
    deno cache --reload src/index.ts

# Show dependency tree
deps:
    deno info src/index.ts

# Update Deno dependencies
update:
    deno cache --reload src/index.ts

# Run all quality checks
qa: fmt lint check test
    @echo "✅ All quality checks passed!"

# CI/CD pipeline
ci: build qa compile
    @echo "✅ CI pipeline complete!"

# Create release build
release: clean build compile
    @echo "🎉 Release build complete!"
    @echo "Executables in ./bin/"
    @ls -lh ./bin/
