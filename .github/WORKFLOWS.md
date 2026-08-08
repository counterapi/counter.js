# GitHub Actions Workflows

This repository uses two GitHub Actions workflows for different purposes:

## 🔄 CI Workflow (`.github/workflows/main.yml`)

**Trigger**: Every push and pull request to `main` or `develop` branches

**Purpose**: Continuous Integration testing

**Jobs**:
- **Test**: Runs tests on Node.js 20.x and 22.x
- **Security**: Runs security audit

**What it does**:
- ✅ Installs dependencies
- ✅ Runs linting
- ✅ Runs type checking  
- ✅ Runs test suite with coverage
- ✅ Builds the project
- ✅ Uploads coverage to Codecov
- ✅ Runs security audit

## 🚀 Release & Publish Workflow (`.github/workflows/release.yml`)

**Trigger**: Manual dispatch (you trigger it manually)

**Purpose**: Create new releases with automatic versioning and NPM publishing

**What it does**:
- ✅ Runs full CI pipeline (tests, linting, building)
- ✅ Bumps version in package.json (patch/minor/major)
- ✅ Creates git commit and tag
- ✅ Publishes to NPM registry
- ✅ Generates changelog from commits
- ✅ Creates GitHub release with package assets

## Workflow Sequence

```mermaid
graph TD
    A[Code Push/PR] --> B[CI Workflow]
    B --> C{Tests Pass?}
    C -->|Yes| D[✅ Ready for Release]
    C -->|No| E[❌ Fix Issues]
    
    F[Manual Release Trigger] --> G[Release & Publish Workflow]
    G --> H[Tests & Version Bump]
    H --> I[Git Tag & NPM Publish]
    I --> J[GitHub Release Created]
    I --> K[Package Available on NPM]
    
    style B fill:#e1f5fe
    style G fill:#f3e5f5
```

## Release Process

1. **Development**: Code changes trigger CI workflow
2. **Ready to Release**: Use manual release & publish workflow 
3. **Complete Process**: Single workflow handles versioning, NPM publish, and GitHub release

## Benefits of This Structure

- **🔒 Separation of Concerns**: CI separate from release process
- **🚀 Fast CI**: CI runs quickly without publish overhead
- **🎯 Manual Control**: You choose when to release
- **⚡ Single Process**: Everything happens in one workflow
- **🛡️ Safety**: Tests run before publishing
- **📦 Complete**: Handles versioning, NPM, and GitHub releases together 