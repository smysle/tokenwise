# 🔍 TokenWise

> **Open-source AI API cost intelligence** — track spending, optimize caching, compare models.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-green.svg)](https://nodejs.org/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Cost Breakdown** | Per-request, per-model, and daily cost analysis with input/output/cache split |
| 🎯 **Cache Intelligence** | Cache hit rate tracking, savings calculation, and waste detection |
| ⚡ **Model Comparison** | Side-by-side cost comparison across Claude, GPT, Gemini, DeepSeek |
| 💡 **Optimization Engine** | Smart recommendations: model switching, cache tuning, budget alerts |
| 🚨 **Anomaly Detection** | Automatic detection of cost spikes and cache performance drops |
| 🖥️ **Web Dashboard** | Beautiful dark-themed dashboard with Chart.js visualizations |
| 📄 **Multi-Format Parser** | Supports NewAPI, OpenAI, and Anthropic log formats |
| 🚀 **Zero Dependencies** | Pure Node.js — no npm install needed |

---

## 🚀 Quick Start

```bash
# Install globally
npm install -g tokenwise

# Run the demo with built-in sample data
tokenwise demo

# Analyze your own API usage log
tokenwise analyze your-api-log.json

# Get optimization recommendations
tokenwise optimize your-api-log.json

# Launch the interactive web dashboard
tokenwise dashboard your-api-log.json
```

---

## 📋 CLI Commands

| Command | Description |
|---------|-------------|
| `tokenwise analyze <logfile>` | Analyze usage log and print a detailed cost report to the terminal |
| `tokenwise optimize <logfile>` | Generate optimization recommendations based on usage patterns |
| `tokenwise dashboard <logfile>` | Start a local web server (default port 3000) with an interactive dashboard |
| `tokenwise demo` | Run analysis on built-in sample data to see TokenWise in action |

### Options

| Flag | Description |
|------|-------------|
| `--help, -h` | Show help message |
| `--version, -v` | Show version number |
| `--json` | Output results as JSON (works with `analyze` and `optimize`) |
| `--port <number>` | Set dashboard port (default: `3000`) |
| `--budget <number>` | Set monthly budget in USD to enable budget alerts |

### Examples

```bash
# Analyze with budget alerts
tokenwise analyze logs.json --budget 100

# Export analysis as JSON
tokenwise analyze logs.json --json > report.json

# Dashboard on a custom port
tokenwise dashboard logs.json --port 8080

# Pipe optimization results
tokenwise optimize logs.json --json | jq '.[] | select(.priority == "high")'
```

---

## 🖥️ Dashboard

The web dashboard provides a real-time visualization of your API costs:

- **Summary Cards** — Total spend, average cost per request, cache savings, cache hit rate
- **Cost Trend Chart** — Daily spending and request volume over time
- **Model Comparison** — Stacked bar chart of costs by model and category
- **Cache Performance** — Doughnut chart showing cache hit/miss/creation breakdown
- **Cost Breakdown** — Visual split of input, output, cache read, and cache write costs
- **Model Details Table** — Full breakdown with per-model cache hit rates
- **Optimization Panel** — Actionable recommendations with priority levels

```bash
tokenwise dashboard your-log.json
# ➜ Open http://localhost:3000
```

---

## 📄 Supported Log Formats

TokenWise auto-detects your log format:

### NewAPI / Flat Format
```json
{
  "timestamp": "2026-02-14T01:36:52.000Z",
  "model": "claude-opus-4-6",
  "prompt_tokens": 49862,
  "completion_tokens": 2373,
  "cached_tokens": 0,
  "cache_creation_tokens": 27996
}
```

### OpenAI Format
```json
{
  "object": "chat.completion",
  "model": "gpt-4o",
  "created": 1708905412,
  "usage": {
    "prompt_tokens": 1500,
    "completion_tokens": 500,
    "prompt_tokens_details": { "cached_tokens": 800 }
  }
}
```

### Anthropic Format
```json
{
  "type": "message",
  "model": "claude-sonnet-4-6",
  "usage": {
    "input_tokens": 2000,
    "output_tokens": 800,
    "cache_read_input_tokens": 1200,
    "cache_creation_input_tokens": 0
  }
}
```

Supports JSON arrays, single objects, and newline-delimited JSON (JSONL).

---

## 💰 Supported Model Pricing

Prices are per **1M tokens** in USD.

### Anthropic (Claude)

| Model | Input | Output | Cache Read | Cache Write |
|-------|------:|-------:|-----------:|------------:|
| claude-opus-4 | $15.00 | $75.00 | $1.50 | $18.75 |
| claude-sonnet-4 | $3.00 | $15.00 | $0.30 | $3.75 |
| claude-3.5-sonnet | $3.00 | $15.00 | $0.30 | $3.75 |
| claude-3.5-haiku | $0.80 | $4.00 | $0.08 | $1.00 |
| claude-3-haiku | $0.25 | $1.25 | $0.03 | $0.30 |

### OpenAI (GPT)

| Model | Input | Output | Cache Read | Cache Write |
|-------|------:|-------:|-----------:|------------:|
| gpt-5.2 | $5.00 | $20.00 | $2.50 | $5.00 |
| gpt-4o | $2.50 | $10.00 | $1.25 | $2.50 |
| gpt-4o-mini | $0.15 | $0.60 | $0.075 | $0.15 |
| gpt-4-turbo | $10.00 | $30.00 | $5.00 | $10.00 |
| gpt-4 | $30.00 | $60.00 | $15.00 | $30.00 |
| gpt-3.5-turbo | $0.50 | $1.50 | $0.25 | $0.50 |

### DeepSeek

| Model | Input | Output | Cache Read | Cache Write |
|-------|------:|-------:|-----------:|------------:|
| deepseek-chat | $0.27 | $1.10 | $0.07 | $0.27 |
| deepseek-reasoner | $0.55 | $2.19 | $0.14 | $0.55 |

Unknown models use a mid-range fallback pricing ($3.00/$15.00 per 1M tokens).

---

## 🏗️ Architecture

```
tokenwise/
├── bin/
│   └── tokenwise.js        # CLI entry point
├── src/
│   ├── parser.js            # Multi-format log parser
│   ├── pricing.js           # Model pricing database
│   ├── analyzer.js          # Cost analysis engine
│   ├── optimizer.js         # Optimization recommendation engine
│   └── reporter.js          # Terminal & JSON report generation
├── dashboard/
│   └── index.html           # Single-file web dashboard (Chart.js)
├── sample-data/
│   └── usage.json           # Sample API usage log for demo
└── package.json
```

**Zero dependencies.** Everything runs on Node.js built-in modules. The dashboard uses Chart.js via CDN.

---

## 🤝 Contributing

Contributions are welcome! Here are some ways to help:

1. **Add more models** — Update `src/pricing.js` with new model pricing
2. **New log formats** — Extend `src/parser.js` to support more API providers
3. **Dashboard features** — Improve `dashboard/index.html` with new visualizations
4. **Optimization rules** — Add smarter recommendations to `src/optimizer.js`

```bash
# Clone the repo
git clone https://github.com/smysle/tokenwise.git
cd tokenwise

# Run the demo
node bin/tokenwise.js demo

# Test with your own data
node bin/tokenwise.js analyze your-log.json
```

---

## 📄 License

[MIT](LICENSE) © 2026
