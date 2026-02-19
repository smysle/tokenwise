/**
 * analyzer.js — Cost analysis engine
 * 
 * Features:
 *   - Total cost calculation (input/output/cache_read/cache_write breakdown)
 *   - Cache hit rate calculation
 *   - Per-model grouped statistics
 *   - Time-series trend analysis (daily)
 *   - Anomaly detection (e.g. sudden cache hit rate drops)
 */

'use strict';

const { calculateCost, getPricing } = require('./pricing');

/**
 * Analyze a list of standardized usage records
 * Returns a comprehensive analysis object
 */
function analyze(records) {
  if (!records || records.length === 0) {
    return { 
      totalCost: 0, requestCount: 0, models: {}, daily: {}, anomalies: [],
      totals: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
      cacheStats: { hitRate: 0, totalCached: 0, totalPrompt: 0, savings: 0 },
    };
  }

  const totals = { input: 0, output: 0, cache_read: 0, cache_write: 0, total: 0, without_cache: 0 };
  const models = {};
  const daily = {};
  let totalPromptTokens = 0;
  let totalCachedTokens = 0;
  let totalCacheCreation = 0;
  let totalCompletionTokens = 0;

  for (const record of records) {
    const cost = calculateCost(record);

    // Accumulate totals
    totals.input       += cost.input;
    totals.output      += cost.output;
    totals.cache_read  += cost.cache_read;
    totals.cache_write += cost.cache_write;
    totals.total       += cost.total;
    totals.without_cache += cost.without_cache;

    totalPromptTokens     += record.prompt_tokens || 0;
    totalCachedTokens     += record.cached_tokens || 0;
    totalCacheCreation    += record.cache_creation_tokens || 0;
    totalCompletionTokens += record.completion_tokens || 0;

    // Per-model stats
    const model = record.model || 'unknown';
    if (!models[model]) {
      models[model] = {
        requests: 0,
        totalCost: 0,
        costs: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        tokens: { prompt: 0, completion: 0, cached: 0, cache_creation: 0 },
        cacheHitRate: 0,
      };
    }
    const m = models[model];
    m.requests++;
    m.totalCost += cost.total;
    m.costs.input       += cost.input;
    m.costs.output      += cost.output;
    m.costs.cache_read  += cost.cache_read;
    m.costs.cache_write += cost.cache_write;
    m.tokens.prompt       += record.prompt_tokens || 0;
    m.tokens.completion   += record.completion_tokens || 0;
    m.tokens.cached       += record.cached_tokens || 0;
    m.tokens.cache_creation += record.cache_creation_tokens || 0;

    // Daily aggregation
    const day = (record.timestamp || '').slice(0, 10) || 'unknown';
    if (!daily[day]) {
      daily[day] = { requests: 0, totalCost: 0, tokens: 0, cachedTokens: 0 };
    }
    daily[day].requests++;
    daily[day].totalCost += cost.total;
    daily[day].tokens += (record.prompt_tokens || 0) + (record.completion_tokens || 0);
    daily[day].cachedTokens += record.cached_tokens || 0;
  }

  // Calculate per-model cache hit rates
  for (const model of Object.keys(models)) {
    const m = models[model];
    m.cacheHitRate = m.tokens.prompt > 0
      ? (m.tokens.cached / m.tokens.prompt) * 100
      : 0;
  }

  // Calculate daily cache hit rates
  for (const day of Object.keys(daily)) {
    const d = daily[day];
    d.cacheHitRate = d.tokens > 0 ? (d.cachedTokens / d.tokens) * 100 : 0;
  }

  // Cache stats
  const cacheHitRate = totalPromptTokens > 0
    ? (totalCachedTokens / totalPromptTokens) * 100
    : 0;
  const cacheSavings = totals.without_cache - totals.total;

  // Anomaly detection
  const anomalies = detectAnomalies(daily, models);

  return {
    requestCount: records.length,
    totalCost: totals.total,
    totals,
    models,
    daily,
    anomalies,
    cacheStats: {
      hitRate: cacheHitRate,
      totalCached: totalCachedTokens,
      totalPrompt: totalPromptTokens,
      totalCacheCreation: totalCacheCreation,
      totalCompletion: totalCompletionTokens,
      savings: Math.max(0, cacheSavings),
    },
  };
}

/**
 * Detect anomalies in usage patterns
 */
function detectAnomalies(daily, models) {
  const anomalies = [];
  const days = Object.keys(daily).sort();

  // Check for sudden cache hit rate drops
  for (let i = 1; i < days.length; i++) {
    const prev = daily[days[i - 1]];
    const curr = daily[days[i]];
    if (prev.cacheHitRate > 40 && curr.cacheHitRate < prev.cacheHitRate * 0.5) {
      anomalies.push({
        type: 'cache_drop',
        severity: 'warning',
        day: days[i],
        message: `Cache hit rate dropped from ${prev.cacheHitRate.toFixed(1)}% to ${curr.cacheHitRate.toFixed(1)}% on ${days[i]}`,
      });
    }
  }

  // Check for cost spikes (> 2x average)
  if (days.length >= 3) {
    const costs = days.map(d => daily[d].totalCost);
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    for (let i = 0; i < days.length; i++) {
      if (costs[i] > avgCost * 2.5 && costs[i] > 0.01) {
        anomalies.push({
          type: 'cost_spike',
          severity: 'alert',
          day: days[i],
          message: `Cost spike on ${days[i]}: $${costs[i].toFixed(4)} (avg: $${avgCost.toFixed(4)})`,
        });
      }
    }
  }

  // Check for models with very low cache utilization despite cache_creation
  for (const [model, stats] of Object.entries(models)) {
    if (stats.tokens.cache_creation > 1000 && stats.tokens.cached < stats.tokens.cache_creation * 0.2) {
      anomalies.push({
        type: 'low_cache_reuse',
        severity: 'warning',
        model,
        message: `Model "${model}" created ${stats.tokens.cache_creation.toLocaleString()} cache tokens but only read ${stats.tokens.cached.toLocaleString()} — cache is being wasted`,
      });
    }
  }

  return anomalies;
}

/**
 * Get sorted daily entries for trend display
 */
function getDailyTrend(analysis) {
  return Object.entries(analysis.daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));
}

/**
 * Get models sorted by cost (descending)
 */
function getModelRanking(analysis) {
  return Object.entries(analysis.models)
    .sort(([, a], [, b]) => b.totalCost - a.totalCost)
    .map(([model, data]) => ({ model, ...data }));
}

module.exports = { analyze, getDailyTrend, getModelRanking };
