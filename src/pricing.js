/**
 * pricing.js — Model pricing database
 * 
 * Prices are per 1M tokens in USD.
 * Sources: Official pricing pages as of 2025.
 */

'use strict';

const PRICING = {
  // Anthropic models
  'claude-opus-4-20250514': { input: 15.00, output: 75.00, cache_read: 1.50, cache_write: 18.75 },
  'claude-opus-4-6':        { input: 15.00, output: 75.00, cache_read: 1.50, cache_write: 18.75 },
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00, cache_read: 0.30, cache_write: 3.75 },
  'claude-sonnet-4-6':      { input: 3.00, output: 15.00, cache_read: 0.30, cache_write: 3.75 },
  'claude-3.5-sonnet':      { input: 3.00, output: 15.00, cache_read: 0.30, cache_write: 3.75 },
  'claude-3-haiku':         { input: 0.25, output: 1.25, cache_read: 0.03, cache_write: 0.30 },
  'claude-3.5-haiku':       { input: 0.80, output: 4.00, cache_read: 0.08, cache_write: 1.00 },

  // OpenAI models
  'gpt-4o':                 { input: 2.50, output: 10.00, cache_read: 1.25, cache_write: 2.50 },
  'gpt-4o-mini':            { input: 0.15, output: 0.60,  cache_read: 0.075, cache_write: 0.15 },
  'gpt-4-turbo':            { input: 10.00, output: 30.00, cache_read: 5.00, cache_write: 10.00 },
  'gpt-4':                  { input: 30.00, output: 60.00, cache_read: 15.00, cache_write: 30.00 },
  'gpt-3.5-turbo':          { input: 0.50, output: 1.50,  cache_read: 0.25, cache_write: 0.50 },
  'gpt-5.2':                { input: 5.00, output: 20.00, cache_read: 2.50, cache_write: 5.00 },

  // DeepSeek
  'deepseek-chat':          { input: 0.27, output: 1.10,  cache_read: 0.07, cache_write: 0.27 },
  'deepseek-reasoner':      { input: 0.55, output: 2.19,  cache_read: 0.14, cache_write: 0.55 },
};

// Aliases — map common name variants to canonical entries
const ALIASES = {
  'claude-opus':     'claude-opus-4-6',
  'claude-sonnet':   'claude-sonnet-4-6',
  'gpt4o':           'gpt-4o',
  'gpt4o-mini':      'gpt-4o-mini',
  'gpt-4o-2024':     'gpt-4o',
};

/**
 * Get pricing for a model. Falls back to a default if unknown.
 */
function getPricing(model) {
  if (PRICING[model]) return PRICING[model];
  if (ALIASES[model] && PRICING[ALIASES[model]]) return PRICING[ALIASES[model]];
  
  // Fuzzy match: try prefix matching
  for (const key of Object.keys(PRICING)) {
    if (model.startsWith(key) || key.startsWith(model)) {
      return PRICING[key];
    }
  }
  
  // Default fallback (mid-range pricing)
  return { input: 3.00, output: 15.00, cache_read: 0.30, cache_write: 3.75 };
}

/**
 * Calculate cost for a single usage record
 */
function calculateCost(record) {
  const pricing = getPricing(record.model);
  const M = 1_000_000;

  const inputCost      = ((record.prompt_tokens || 0) / M) * pricing.input;
  const outputCost     = ((record.completion_tokens || 0) / M) * pricing.output;
  const cacheReadCost  = ((record.cached_tokens || 0) / M) * pricing.cache_read;
  const cacheWriteCost = ((record.cache_creation_tokens || 0) / M) * pricing.cache_write;

  // Input cost should exclude cached tokens (they're billed at cache_read rate)
  const adjustedInputCost = (((record.prompt_tokens || 0) - (record.cached_tokens || 0)) / M) * pricing.input;

  return {
    input:       Math.max(0, adjustedInputCost),
    output:      outputCost,
    cache_read:  cacheReadCost,
    cache_write: cacheWriteCost,
    total:       Math.max(0, adjustedInputCost) + outputCost + cacheReadCost + cacheWriteCost,
    // How much would it cost without caching?
    without_cache: ((record.prompt_tokens || 0) / M) * pricing.input + outputCost + (((record.cache_creation_tokens || 0) / M) * pricing.input),
  };
}

module.exports = { PRICING, getPricing, calculateCost };
