/**
 * reporter.js — Report generation (terminal, JSON, dashboard data)
 * 
 * Uses ANSI escape codes for colorful terminal output.
 * Zero external dependencies.
 */

'use strict';

const { getDailyTrend, getModelRanking } = require('./analyzer');

// ─── ANSI color helpers ────────────────────────────────────────────────────

const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  italic:  '\x1b[3m',
  under:   '\x1b[4m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
  bgRed:   '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgBlue:  '\x1b[44m',
  bgCyan:  '\x1b[46m',
};

function rgb(r, g, b) { return `\x1b[38;2;${r};${g};${b}m`; }
function bgRgb(r, g, b) { return `\x1b[48;2;${r};${g};${b}m`; }

const accent  = rgb(99, 102, 241);   // indigo
const success = rgb(34, 197, 94);     // green
const warn    = rgb(250, 204, 21);    // yellow
const danger  = rgb(239, 68, 68);     // red
const muted   = rgb(148, 163, 184);   // slate-400
const bright  = rgb(248, 250, 252);   // slate-50

// ─── Formatting helpers ────────────────────────────────────────────────────

function pad(str, len, align = 'left') {
  str = String(str);
  if (str.length >= len) return str.slice(0, len);
  const diff = len - str.length;
  if (align === 'right') return ' '.repeat(diff) + str;
  if (align === 'center') return ' '.repeat(Math.floor(diff / 2)) + str + ' '.repeat(Math.ceil(diff / 2));
  return str + ' '.repeat(diff);
}

function formatCost(cost) {
  if (cost >= 1) return `$${cost.toFixed(2)}`;
  if (cost >= 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(6)}`;
}

function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function progressBar(percent, width = 20) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  let color = success;
  if (percent < 30) color = danger;
  else if (percent < 60) color = warn;
  return `${color}${'█'.repeat(filled)}${muted}${'░'.repeat(empty)}${c.reset}`;
}

// ─── Terminal report ───────────────────────────────────────────────────────

function printBanner() {
  const banner = `
${accent}╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ${bright}${c.bold}  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗${accent}        ║
║   ${bright}  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║${accent}        ║
║   ${bright}     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║${accent}        ║
║   ${bright}     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║${accent}        ║
║   ${bright}     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║${accent}        ║
║   ${bright}     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝${accent}        ║
║   ${bright}${c.bold}         ██╗    ██╗██╗███████╗███████╗${accent}                 ║
║   ${bright}         ██║    ██║██║██╔════╝██╔════╝${accent}                 ║
║   ${bright}         ██║ █╗ ██║██║███████╗█████╗${accent}                   ║
║   ${bright}         ██║███╗██║██║╚════██║██╔══╝${accent}                   ║
║   ${bright}         ╚███╔███╔╝██║███████║███████╗${accent}                 ║
║   ${bright}          ╚══╝╚══╝ ╚═╝╚══════╝╚══════╝${accent}                 ║
║                                                            ║
║   ${muted}AI API Cost Intelligence${accent}                               ║
╚════════════════════════════════════════════════════════════╝${c.reset}
`;
  console.log(banner);
}

function printSummary(analysis) {
  const { totalCost, requestCount, cacheStats, totals } = analysis;
  const avgCost = requestCount > 0 ? totalCost / requestCount : 0;

  console.log(`\n${accent}${c.bold}📊 COST SUMMARY${c.reset}`);
  console.log(`${muted}${'─'.repeat(58)}${c.reset}`);
  
  console.log(`  ${bright}Total Spend:${c.reset}         ${c.bold}${formatCost(totalCost)}${c.reset}`);
  console.log(`  ${bright}Requests:${c.reset}            ${c.bold}${requestCount}${c.reset}`);
  console.log(`  ${bright}Avg Cost/Request:${c.reset}    ${formatCost(avgCost)}`);
  console.log(`  ${bright}Cache Savings:${c.reset}       ${success}${formatCost(cacheStats.savings)}${c.reset}`);
  console.log();

  // Cost breakdown
  console.log(`  ${muted}Cost Breakdown:${c.reset}`);
  console.log(`    Input:        ${formatCost(totals.input)}  ${muted}(prompt tokens)${c.reset}`);
  console.log(`    Output:       ${formatCost(totals.output)}  ${muted}(completion tokens)${c.reset}`);
  console.log(`    Cache Read:   ${formatCost(totals.cache_read)}  ${muted}(cached prompts)${c.reset}`);
  console.log(`    Cache Write:  ${formatCost(totals.cache_write)}  ${muted}(cache creation)${c.reset}`);
  console.log();

  // Cache hit rate
  const hitRate = cacheStats.hitRate;
  console.log(`  ${bright}Cache Hit Rate:${c.reset}  ${progressBar(hitRate)} ${hitRate.toFixed(1)}%`);
  console.log(`    ${muted}Cached: ${formatTokens(cacheStats.totalCached)} / ${formatTokens(cacheStats.totalPrompt)} prompt tokens${c.reset}`);
}

function printModelTable(analysis) {
  const models = getModelRanking(analysis);
  if (models.length === 0) return;

  console.log(`\n${accent}${c.bold}🤖 MODEL BREAKDOWN${c.reset}`);
  console.log(`${muted}${'─'.repeat(90)}${c.reset}`);

  // Header
  console.log(
    `  ${c.bold}${pad('Model', 28)}${pad('Requests', 10, 'right')}${pad('Cost', 14, 'right')}${pad('Tokens', 12, 'right')}${pad('Cache Hit', 14, 'right')}${c.reset}`
  );
  console.log(`  ${muted}${'─'.repeat(86)}${c.reset}`);

  for (const m of models) {
    const totalTokens = m.tokens.prompt + m.tokens.completion;
    const hitColor = m.cacheHitRate > 60 ? success : m.cacheHitRate > 30 ? warn : danger;
    
    console.log(
      `  ${bright}${pad(m.model, 28)}${c.reset}` +
      `${pad(String(m.requests), 10, 'right')}` +
      `${pad(formatCost(m.totalCost), 14, 'right')}` +
      `${pad(formatTokens(totalTokens), 12, 'right')}` +
      `${hitColor}${pad(m.cacheHitRate.toFixed(1) + '%', 14, 'right')}${c.reset}`
    );
  }
}

function printDailyTrend(analysis) {
  const trend = getDailyTrend(analysis);
  if (trend.length === 0) return;

  console.log(`\n${accent}${c.bold}📈 DAILY TREND${c.reset}`);
  console.log(`${muted}${'─'.repeat(70)}${c.reset}`);

  // Header
  console.log(
    `  ${c.bold}${pad('Date', 14)}${pad('Requests', 10, 'right')}${pad('Cost', 14, 'right')}${pad('Tokens', 12, 'right')}${pad('Cache Rate', 14, 'right')}${c.reset}`
  );
  console.log(`  ${muted}${'─'.repeat(66)}${c.reset}`);

  // Find max cost for sparkline
  const maxCost = Math.max(...trend.map(d => d.totalCost));

  for (const day of trend) {
    const barLen = maxCost > 0 ? Math.round((day.totalCost / maxCost) * 15) : 0;
    const bar = `${accent}${'▓'.repeat(barLen)}${muted}${'░'.repeat(15 - barLen)}${c.reset}`;
    const hitColor = day.cacheHitRate > 60 ? success : day.cacheHitRate > 30 ? warn : danger;

    console.log(
      `  ${bright}${pad(day.date, 14)}${c.reset}` +
      `${pad(String(day.requests), 10, 'right')}` +
      `${pad(formatCost(day.totalCost), 14, 'right')}` +
      `${pad(formatTokens(day.tokens), 12, 'right')}` +
      `${hitColor}${pad(day.cacheHitRate.toFixed(1) + '%', 14, 'right')}${c.reset}` +
      `  ${bar}`
    );
  }
}

function printOptimizations(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    console.log(`\n${success}${c.bold}✅ No optimization issues detected${c.reset}`);
    return;
  }

  console.log(`\n${accent}${c.bold}💡 OPTIMIZATION RECOMMENDATIONS${c.reset}`);
  console.log(`${muted}${'─'.repeat(58)}${c.reset}`);

  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    const priorityColors = {
      critical: `${c.bold}${danger}CRITICAL`,
      high:     `${c.bold}${danger}HIGH`,
      medium:   `${c.bold}${warn}MEDIUM`,
      low:      `${muted}LOW`,
    };
    const priorityLabel = priorityColors[rec.priority] || `${muted}INFO`;

    console.log(`\n  ${c.bold}${rec.title}${c.reset}  [${priorityLabel}${c.reset}]`);
    console.log(`  ${muted}${rec.description}${c.reset}`);
    console.log(`  ${bright}→ ${rec.action}${c.reset}`);
    if (rec.savings) {
      console.log(`  ${success}${rec.savings}${c.reset}`);
    }
  }
}

function printAnomalies(analysis) {
  const { anomalies } = analysis;
  if (!anomalies || anomalies.length === 0) return;

  console.log(`\n${danger}${c.bold}🚨 ANOMALIES DETECTED${c.reset}`);
  console.log(`${muted}${'─'.repeat(58)}${c.reset}`);

  for (const a of anomalies) {
    const icon = a.severity === 'alert' ? '🔴' : '⚠️';
    console.log(`  ${icon}  ${bright}${a.message}${c.reset}`);
  }
}

/**
 * Print full terminal report
 */
function printReport(analysis, recommendations) {
  printBanner();
  printSummary(analysis);
  printModelTable(analysis);
  printDailyTrend(analysis);
  printAnomalies(analysis);
  printOptimizations(recommendations);
  console.log(`\n${muted}${'─'.repeat(58)}${c.reset}`);
  console.log(`${muted}  Generated by TokenWise • https://github.com/smysle/tokenwise${c.reset}\n`);
}

/**
 * Generate JSON export
 */
function toJSON(analysis, recommendations) {
  return JSON.stringify({
    summary: {
      totalCost: analysis.totalCost,
      requestCount: analysis.requestCount,
      avgCostPerRequest: analysis.requestCount > 0 ? analysis.totalCost / analysis.requestCount : 0,
      cacheSavings: analysis.cacheStats.savings,
      cacheHitRate: analysis.cacheStats.hitRate,
    },
    costBreakdown: analysis.totals,
    models: analysis.models,
    daily: analysis.daily,
    anomalies: analysis.anomalies,
    recommendations,
  }, null, 2);
}

/**
 * Generate dashboard data (JSON for the HTML dashboard)
 */
function toDashboardData(analysis, recommendations) {
  const trend = getDailyTrend(analysis);
  const modelRanking = getModelRanking(analysis);

  return JSON.stringify({
    summary: {
      totalCost: analysis.totalCost,
      requestCount: analysis.requestCount,
      avgCostPerRequest: analysis.requestCount > 0 ? analysis.totalCost / analysis.requestCount : 0,
      cacheSavings: analysis.cacheStats.savings,
      cacheHitRate: analysis.cacheStats.hitRate,
      totalTokens: analysis.cacheStats.totalPrompt + analysis.cacheStats.totalCompletion,
    },
    costBreakdown: analysis.totals,
    cacheStats: analysis.cacheStats,
    dailyTrend: trend,
    models: modelRanking,
    anomalies: analysis.anomalies,
    recommendations: recommendations.map(r => ({
      title: r.title.replace(/[\x1b]\[[0-9;]*m/g, ''), // strip ANSI if any
      description: r.description,
      action: r.action,
      priority: r.priority,
      savings: r.savings,
      type: r.type,
    })),
  });
}

module.exports = { printReport, toJSON, toDashboardData, printBanner };
