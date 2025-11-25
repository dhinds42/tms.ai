/**
 * CI Pipeline Configuration for Static Analysis & Vulnerability Scanning
 * 
 * Runs on each PR:
 * - ESLint static analysis
 * - Dependency vulnerability scan (npm audit, Snyk)
 * - SAST (CodeQL)
 * - License compliance
 */

// ============================================
// GITHUB ACTIONS WORKFLOW
// ============================================

export const GITHUB_ACTIONS_WORKFLOW = `
name: Security & Quality Analysis

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

permissions:
  contents: read
  security-events: write
  pull-requests: write

jobs:
  # ================================
  # Static Analysis (ESLint)
  # ================================
  static-analysis:
    name: Static Analysis
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: |
          npm run lint -- --format @microsoft/eslint-formatter-sarif --output-file eslint-results.sarif
        continue-on-error: true

      - name: Upload ESLint results to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: eslint-results.sarif
          wait-for-processing: true

      - name: Comment on PR with lint errors
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ ESLint found issues. Please review the Security tab for details.'
            })

  # ================================
  # Dependency Vulnerability Scan
  # ================================
  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        id: npm-audit
        run: |
          npm audit --json > npm-audit.json || true
          CRITICAL=$(cat npm-audit.json | jq '.metadata.vulnerabilities.critical // 0')
          HIGH=$(cat npm-audit.json | jq '.metadata.vulnerabilities.high // 0')
          echo "critical=$CRITICAL" >> $GITHUB_OUTPUT
          echo "high=$HIGH" >> $GITHUB_OUTPUT
          
          if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
            echo "❌ Found $CRITICAL critical and $HIGH high vulnerabilities"
            exit 1
          fi

      - name: Run Snyk vulnerability scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --sarif-file-output=snyk.sarif

      - name: Upload Snyk results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: snyk.sarif

      - name: Create vulnerability summary
        if: always()
        run: |
          echo "## 🔒 Dependency Vulnerability Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Severity | Count |" >> $GITHUB_STEP_SUMMARY
          echo "|----------|-------|" >> $GITHUB_STEP_SUMMARY
          echo "| Critical | $(cat npm-audit.json | jq '.metadata.vulnerabilities.critical // 0') |" >> $GITHUB_STEP_SUMMARY
          echo "| High | $(cat npm-audit.json | jq '.metadata.vulnerabilities.high // 0') |" >> $GITHUB_STEP_SUMMARY
          echo "| Moderate | $(cat npm-audit.json | jq '.metadata.vulnerabilities.moderate // 0') |" >> $GITHUB_STEP_SUMMARY
          echo "| Low | $(cat npm-audit.json | jq '.metadata.vulnerabilities.low // 0') |" >> $GITHUB_STEP_SUMMARY

  # ================================
  # CodeQL SAST Analysis
  # ================================
  codeql-analysis:
    name: CodeQL SAST
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript
          queries: security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:javascript"

  # ================================
  # License Compliance Check
  # ================================
  license-check:
    name: License Compliance
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check licenses
        run: |
          npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC0-1.0;Unlicense" --summary

      - name: Generate license report
        run: |
          npx license-checker --production --json > licenses.json
          echo "## 📄 License Report" >> $GITHUB_STEP_SUMMARY
          echo "Dependencies with approved licenses: $(cat licenses.json | jq 'keys | length')" >> $GITHUB_STEP_SUMMARY

  # ================================
  # Secret Scanning
  # ================================
  secret-scan:
    name: Secret Detection
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Detect secrets with Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  # ================================
  # Summary Report
  # ================================
  security-summary:
    name: Security Summary
    runs-on: ubuntu-latest
    needs: [static-analysis, dependency-scan, codeql-analysis, license-check, secret-scan]
    if: always()
    steps:
      - name: Generate summary
        run: |
          echo "# 🛡️ Security Analysis Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Check | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Static Analysis | \${{ needs.static-analysis.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Dependency Scan | \${{ needs.dependency-scan.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| CodeQL SAST | \${{ needs.codeql-analysis.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| License Check | \${{ needs.license-check.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Secret Scan | \${{ needs.secret-scan.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY

      - name: Fail if any check failed
        if: |
          needs.static-analysis.result == 'failure' ||
          needs.dependency-scan.result == 'failure' ||
          needs.codeql-analysis.result == 'failure' ||
          needs.secret-scan.result == 'failure'
        run: exit 1
`;

// ============================================
// GITLAB CI CONFIGURATION
// ============================================

export const GITLAB_CI = `
# GitLab CI Security & Quality Pipeline

stages:
  - analyze
  - scan
  - report

variables:
  NODE_VERSION: "20"

# Static Analysis
eslint:
  stage: analyze
  image: node:\${NODE_VERSION}
  script:
    - npm ci
    - npm run lint -- --format json --output-file gl-code-quality-report.json
  artifacts:
    reports:
      codequality: gl-code-quality-report.json
  rules:
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'

# Dependency Scan
dependency_scanning:
  stage: scan
  image: node:\${NODE_VERSION}
  script:
    - npm ci
    - npm audit --json > npm-audit.json || true
    - |
      CRITICAL=$(cat npm-audit.json | jq '.metadata.vulnerabilities.critical // 0')
      HIGH=$(cat npm-audit.json | jq '.metadata.vulnerabilities.high // 0')
      if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        echo "Found critical/high vulnerabilities"
        exit 1
      fi
  artifacts:
    paths:
      - npm-audit.json
  rules:
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'

# SAST with Semgrep
sast:
  stage: scan
  image: returntocorp/semgrep
  script:
    - semgrep --config=auto --sarif --output=semgrep.sarif .
  artifacts:
    reports:
      sast: semgrep.sarif
  rules:
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'

# License Compliance
license_check:
  stage: scan
  image: node:\${NODE_VERSION}
  script:
    - npm ci
    - npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC"
  rules:
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'

# Secret Detection
secret_detection:
  stage: scan
  image: 
    name: zricethezav/gitleaks
    entrypoint: [""]
  script:
    - gitleaks detect --source . --verbose
  rules:
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
`;

// ============================================
// ESLINT CONFIGURATION
// ============================================

export const ESLINT_CONFIG = `
// .eslintrc.js - Security-focused ESLint configuration
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:security/recommended',
    'plugin:sonarjs/recommended'
  ],
  plugins: ['security', 'sonarjs', 'no-secrets'],
  rules: {
    // Security rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-possible-timing-attacks': 'warn',
    
    // No hardcoded secrets
    'no-secrets/no-secrets': ['error', { tolerance: 4.5 }],
    
    // Code quality
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', 3],
    'sonarjs/no-identical-functions': 'error',
    
    // General
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
  },
  settings: {
    react: { version: 'detect' }
  }
};
`;

export default { GITHUB_ACTIONS_WORKFLOW, GITLAB_CI, ESLINT_CONFIG };