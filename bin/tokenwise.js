#!/usr/bin/env node

/**
 * tokenwise — CLI entry point
 * AI API Cost Intelligence Tool
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

// Resolve paths relative to package root (one level up from bin/)
const ROOT = path.resolve(__dirname, '..');
const srcPath = (f) => path.join(ROOT, 'src', f);

const { parseLog } = require(srcPath('parser.js'));
const { analyze, getDailyTrend, getModelRanking } = require(srcPath('analyzer.js'));
const { optimize } = require(srcPath('optimizer.js'));
const { printReport, toDashboardData, printBanner } = require(srcPath('reporter.js'));

// ─── ANSI helpers ──────────────────────────────────────────────────────────

const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  magenta: '\x1b[35m',
  gray:    '\x1b[90m',
  white:   '\x1b[37m',
};

// ─── Help text ─────────────────────────────────────────────────────────────

function showHelp() {
  printBanner();
  console.log(`
${c.bold}USAGE${c.reset}
  ${c.cyan}tokenwise${c.reset} <command> [options]

${c.bold}COMMANDS${c.reset}
  ${c.green}analyze${c.reset} <logfile>      Analyze API usage log and print cost report
  ${c.green}optimize${c.reset} <logfile>     Generate optimization recommendations
  ${c.green}dashboard${c.reset} <logfile>    Launch interactive web dashboard (port 3000)
  ${c.green}demo${c.reset}                   Run analysis on built-in sample data

${c.bold}OPTIONS${c.reset}
  ${c.yellow}--help, -h${c.reset}             Show this help message
  ${c.yellow}--version, -v${c.reset}          Show version number
  ${c.yellow}--json${c.reset}                 Output as JSON (analyze/optimize)
  ${c.yellow}--port${c.reset} <number>        Dashboard port (default: 3000)
  ${c.yellow}--budget${c.reset} <number>      Monthly budget in USD for alerts

${c.bold}EXAMPLES${c.reset}
  ${c.gray}# Quick demo with sample data${c.reset}
  ${c.cyan}tokenwise demo${c.reset}

  ${c.gray}# Analyze your API usage log${c.reset}
  ${c.cyan}tokenwise analyze api-log.json${c.reset}

  ${c.gray}# Get optimization suggestions${c.reset}
  ${c.cyan}tokenwise optimize api-log.json --budget 50${c.reset}

  ${c.gray}# Launch the web dashboard${c.reset}
  ${c.cyan}tokenwise dashboard api-log.json --port 8080${c.reset}

${c.dim}  https://github.com/smysle/tokenwise${c.reset}
`);
}

function showVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  console.log(`tokenwise v${pkg.version}`);
}

// ─── Argument parsing ──────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    command: null,
    file: null,
    json: false,
    port: 3000,
    budget: null,
    help: false,
    version: false,
  };

  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--version' || arg === '-v') {
      args.version = true;
    } else if (arg === '--json') {
      args.json = true;
    } else if (arg === '--port' && argv[i + 1]) {
      args.port = parseInt(argv[++i], 10) || 3000;
    } else if (arg === '--budget' && argv[i + 1]) {
      args.budget = parseFloat(argv[++i]) || null;
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  if (positional.length > 0) args.command = positional[0];
  if (positional.length > 1) args.file = positional[1];

  return args;
}

// ─── File loading ──────────────────────────────────────────────────────────

function loadLogFile(filePath) {
  // Resolve relative to cwd
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`${c.bold}\x1b[31mError:${c.reset} File not found: ${resolved}`);
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(resolved, 'utf8');
    return parseLog(raw);
  } catch (err) {
    console.error(`${c.bold}\x1b[31mError:${c.reset} Failed to parse ${resolved}: ${err.message}`);
    process.exit(1);
  }
}

// ─── Commands ──────────────────────────────────────────────────────────────

function cmdAnalyze(file, options) {
  const records = loadLogFile(file);
  const analysis = analyze(records);
  const recommendations = optimize(analysis, { budget: options.budget });

  if (options.json) {
    const { toJSON } = require(srcPath('reporter.js'));
    console.log(toJSON(analysis, recommendations));
  } else {
    printReport(analysis, recommendations);
  }
}

function cmdOptimize(file, options) {
  const records = loadLogFile(file);
  const analysis = analyze(records);
  const recommendations = optimize(analysis, { budget: options.budget });

  if (options.json) {
    console.log(JSON.stringify(recommendations, null, 2));
    return;
  }

  printBanner();
  console.log(`\n${c.bold}${c.cyan}💡 OPTIMIZATION REPORT${c.reset}`);
  console.log(`${c.gray}${'─'.repeat(58)}${c.reset}`);
  console.log(`${c.dim}  Analyzed ${analysis.requestCount} requests across ${Object.keys(analysis.models).length} models${c.reset}\n`);

  if (recommendations.length === 0) {
    console.log(`  ${c.green}${c.bold}✅ No optimization issues found. Your usage looks great!${c.reset}\n`);
    return;
  }

  const priorityColors = {
    critical: '\x1b[31m',
    high: '\x1b[31m',
    medium: '\x1b[33m',
    low: '\x1b[90m',
  };

  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    const pColor = priorityColors[rec.priority] || c.gray;
    console.log(`  ${c.bold}${i + 1}. ${rec.title}${c.reset}  [${pColor}${c.bold}${rec.priority.toUpperCase()}${c.reset}]`);
    console.log(`     ${c.gray}${rec.description}${c.reset}`);
    console.log(`     ${c.white}→ ${rec.action}${c.reset}`);
    if (rec.savings) {
      console.log(`     ${c.green}${rec.savings}${c.reset}`);
    }
    console.log();
  }

  console.log(`${c.gray}${'─'.repeat(58)}${c.reset}`);
  console.log(`${c.dim}  ${recommendations.length} recommendation(s) generated by TokenWise${c.reset}\n`);
}

function cmdDashboard(file, options) {
  const records = loadLogFile(file);
  const analysis = analyze(records);
  const recommendations = optimize(analysis, { budget: options.budget });
  const dashboardData = toDashboardData(analysis, recommendations);

  const dashboardHtml = fs.readFileSync(path.join(ROOT, 'dashboard', 'index.html'), 'utf8');
  const port = options.port;

  const server = http.createServer((req, res) => {
    if (req.url === '/api/data') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(dashboardData);
    } else if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(dashboardHtml);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(port, () => {
    console.log(`
${c.bold}${c.cyan}🖥️  TokenWise Dashboard${c.reset}
${c.gray}${'─'.repeat(40)}${c.reset}
  ${c.green}${c.bold}➜${c.reset}  Local:   ${c.cyan}http://localhost:${port}${c.reset}
  ${c.dim}  Data:    ${path.resolve(file)}${c.reset}
  ${c.dim}  Records: ${analysis.requestCount} requests${c.reset}
${c.gray}${'─'.repeat(40)}${c.reset}
  ${c.dim}Press Ctrl+C to stop${c.reset}
`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`${c.bold}\x1b[31mError:${c.reset} Port ${port} is already in use. Try --port <number>`);
    } else {
      console.error(`${c.bold}\x1b[31mError:${c.reset} ${err.message}`);
    }
    process.exit(1);
  });
}

function cmdDemo() {
  const sampleFile = path.join(ROOT, 'sample-data', 'usage.json');
  if (!fs.existsSync(sampleFile)) {
    console.error(`${c.bold}\x1b[31mError:${c.reset} Sample data not found at ${sampleFile}`);
    process.exit(1);
  }
  console.log(`${c.dim}  Running demo with sample data...${c.reset}\n`);
  cmdAnalyze(sampleFile, { json: false, budget: null });
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.version) {
    showVersion();
    return;
  }

  if (args.help || !args.command) {
    showHelp();
    return;
  }

  switch (args.command) {
    case 'analyze':
      if (!args.file) {
        console.error(`${c.bold}\x1b[31mError:${c.reset} Please specify a log file: tokenwise analyze <logfile>`);
        process.exit(1);
      }
      cmdAnalyze(args.file, args);
      break;

    case 'optimize':
      if (!args.file) {
        console.error(`${c.bold}\x1b[31mError:${c.reset} Please specify a log file: tokenwise optimize <logfile>`);
        process.exit(1);
      }
      cmdOptimize(args.file, args);
      break;

    case 'dashboard':
      if (!args.file) {
        console.error(`${c.bold}\x1b[31mError:${c.reset} Please specify a log file: tokenwise dashboard <logfile>`);
        process.exit(1);
      }
      cmdDashboard(args.file, args);
      break;

    case 'demo':
      cmdDemo();
      break;

    default:
      console.error(`${c.bold}\x1b[31mError:${c.reset} Unknown command "${args.command}". Run ${c.cyan}tokenwise --help${c.reset} for usage.`);
      process.exit(1);
  }
}

main();
