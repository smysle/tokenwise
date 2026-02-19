/**
 * optimizer.js — Cost optimization recommendation engine
 * 
 * Generates actionable suggestions based on usage patterns:
 *   - Cache optimization (sticky sessions, key rotation)
 *   - Model switching recommendations
 *   - Budget alerts
 */

'use strict';

const { PRICING } = require('./pricing');

/**
 * Cheaper alternatives map: model → suggested cheaper alternatives
 */
const CHEAPER_ALTERNATIVES = {
  'claude-opus-4-6':        ['claude-sonnet-4-6', 'claude-3.5-haiku'],
  'claude-opus-4-20250514': ['claude-sonnet-4-6', 'claude-3.5-haiku'],
  'gpt-4':                  ['gpt-4o', 'gpt-4o-mini'],
  'gpt-4-turbo':            ['gpt-4o', 'gpt-4o-mini'],
  'gpt-4o':                 ['gpt-4o-mini'],
  'gpt-5.2':                ['gpt-4o', 'gpt-4o-mini'],
  'claude-sonnet-4-6':      ['claude-3.5-haiku'],
  'claude-3.5-sonnet':      ['claude-3.5-haiku'],
};

/**
 * Generate optimization recommendations based on analysis results
 * @param {object} analysis - Output from analyzer.analyze()
 * @param {object} options - { budget: number (monthly budget in USD) }
 */
function optimize(analysis, options = {}) {
  const recommendations = [];

  // 1. Cache hit rate optimization
  recommendCacheOptimizations(analysis, recommendations);

  // 2. Model switching suggestions
  recommendModelSwitching(analysis, recommendations);

  // 3. Cache creation vs read imbalance
  recommendCacheKeyFix(analysis, recommendations);

  // 4. Budget alerts
  if (options.budget) {
    recommendBudgetAlerts(analysis, options.budget, recommendations);
  } else {
    // Default budget warning if spending seems high
    recommendDefaultBudgetCheck(analysis, recommendations);
  }

  // 5. Include anomaly-based recommendations
  for (const anomaly of analysis.anomalies || []) {
    if (anomaly.type === 'cache_drop') {
      recommendations.push({
        type: 'anomaly',
        priority: 'high',
        title: '⚠️  Cache Hit Rate Drop Detected',
        description: anomaly.message,
        action: 'Investigate if API keys were rotated, sessions changed, or prompt templates modified.',
        savings: null,
      });
    }
    if (anomaly.type === 'cost_spike') {
      recommendations.push({
        type: 'anomaly',
        priority: 'high',
        title: '🔴 Cost Spike Detected',
        description: anomaly.message,
        action: 'Review requests on this day for unusual patterns or runaway loops.',
        savings: null,
      });
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

  return recommendations;
}

/**
 * Recommend cache optimizations
 */
function recommendCacheOptimizations(analysis, recs) {
  const { cacheStats } = analysis;

  if (cacheStats.hitRate < 20 && cacheStats.totalPrompt > 10000) {
    recs.push({
      type: 'cache',
      priority: 'high',
      title: '🔥 Very Low Cache Hit Rate',
      description: `Cache hit rate is only ${cacheStats.hitRate.toFixed(1)}%. Most prompt tokens are not being cached.`,
      action: 'Enable sticky sessions to route requests to the same endpoint. Use consistent system prompts. Consider prompt caching features.',
      savings: `Potential savings: up to $${(cacheStats.savings * 3).toFixed(2)}/period with better caching`,
    });
  } else if (cacheStats.hitRate < 50 && cacheStats.totalPrompt > 5000) {
    recs.push({
      type: 'cache',
      priority: 'medium',
      title: '📊 Cache Hit Rate Below 50%',
      description: `Cache hit rate is ${cacheStats.hitRate.toFixed(1)}%. There's room for improvement.`,
      action: 'Use sticky sessions to maintain cache affinity. Keep system prompts and common prefixes consistent across requests.',
      savings: `Current cache savings: $${cacheStats.savings.toFixed(4)}. Could potentially double with optimization.`,
    });
  }
}

/**
 * Recommend cheaper model alternatives
 */
function recommendModelSwitching(analysis, recs) {
  for (const [model, stats] of Object.entries(analysis.models)) {
    const alternatives = CHEAPER_ALTERNATIVES[model];
    if (!alternatives || alternatives.length === 0) continue;

    const currentPricing = PRICING[model];
    if (!currentPricing) continue;

    for (const alt of alternatives) {
      const altPricing = PRICING[alt];
      if (!altPricing) continue;

      const savingsRatio = 1 - (altPricing.input / currentPricing.input);
      if (savingsRatio > 0.3) { // Only suggest if >30% savings
        const estimatedSavings = stats.totalCost * savingsRatio;
        if (estimatedSavings > 0.001) {
          recs.push({
            type: 'model_switch',
            priority: estimatedSavings > 0.1 ? 'medium' : 'low',
            title: `💡 Consider ${alt} instead of ${model}`,
            description: `"${model}" costs $${currentPricing.input}/M input tokens. "${alt}" costs $${altPricing.input}/M (${(savingsRatio * 100).toFixed(0)}% cheaper).`,
            action: `For simpler tasks currently using ${model}, try ${alt}. Evaluate quality vs cost trade-off for your use case.`,
            savings: `Estimated savings: $${estimatedSavings.toFixed(4)}/period if all ${model} requests switch to ${alt}`,
          });
          break; // Only suggest the best alternative per model
        }
      }
    }
  }
}

/**
 * Detect cache creation without corresponding reads
 */
function recommendCacheKeyFix(analysis, recs) {
  const { cacheStats } = analysis;

  if (cacheStats.totalCacheCreation > 5000 && cacheStats.totalCached < cacheStats.totalCacheCreation * 0.3) {
    recs.push({
      type: 'cache_keys',
      priority: 'high',
      title: '🔑 Cache Created But Not Reused',
      description: `${cacheStats.totalCacheCreation.toLocaleString()} tokens were written to cache, but only ${cacheStats.totalCached.toLocaleString()} tokens were read back. Cache is being wasted.`,
      action: 'Check if API keys are being rotated too frequently (each key may have its own cache). Ensure requests use consistent prefixes. Verify provider-side caching is enabled.',
      savings: `Wasted cache write cost: estimate based on cache_creation without reuse`,
    });
  }
}

/**
 * Budget alerts
 */
function recommendBudgetAlerts(analysis, monthlyBudget, recs) {
  const dailyTrend = Object.values(analysis.daily);
  if (dailyTrend.length === 0) return;

  const totalDays = dailyTrend.length;
  const totalCost = analysis.totalCost;
  const dailyAvg = totalCost / totalDays;
  const projectedMonthly = dailyAvg * 30;

  if (projectedMonthly > monthlyBudget) {
    const overagePercent = ((projectedMonthly / monthlyBudget) - 1) * 100;
    recs.push({
      type: 'budget',
      priority: projectedMonthly > monthlyBudget * 1.5 ? 'critical' : 'high',
      title: '💰 Budget Alert',
      description: `Projected monthly spend: $${projectedMonthly.toFixed(2)} (${overagePercent.toFixed(0)}% over $${monthlyBudget} budget)`,
      action: `Current daily average: $${dailyAvg.toFixed(4)}/day. To stay within budget, reduce to $${(monthlyBudget / 30).toFixed(4)}/day.`,
      savings: `Need to reduce by $${(projectedMonthly - monthlyBudget).toFixed(2)}/month`,
    });
  } else if (projectedMonthly > monthlyBudget * 0.8) {
    recs.push({
      type: 'budget',
      priority: 'medium',
      title: '⚠️  Approaching Budget Limit',
      description: `Projected monthly spend: $${projectedMonthly.toFixed(2)} (${((projectedMonthly / monthlyBudget) * 100).toFixed(0)}% of $${monthlyBudget} budget)`,
      action: 'Monitor spending closely. Consider implementing the optimization recommendations above.',
      savings: null,
    });
  }
}

/**
 * Default budget awareness check
 */
function recommendDefaultBudgetCheck(analysis, recs) {
  if (analysis.totalCost > 1.0) {
    const dailyTrend = Object.values(analysis.daily);
    const dailyAvg = dailyTrend.length > 0 ? analysis.totalCost / dailyTrend.length : analysis.totalCost;
    const projectedMonthly = dailyAvg * 30;

    recs.push({
      type: 'budget',
      priority: 'low',
      title: '💲 Spending Summary',
      description: `Daily average: $${dailyAvg.toFixed(4)}. Projected monthly: $${projectedMonthly.toFixed(2)}.`,
      action: 'Set a budget with --budget flag to enable budget alerts.',
      savings: null,
    });
  }
}

module.exports = { optimize };
