/**
 * pricing.js — Model pricing database
 * 
 * Prices are per 1M tokens in USD.
 * Sources: Official pricing pages, updated 2026-02-20.
 */

'use strict';

const PRICING = {
  // ═══ Anthropic (Claude) ═══
  'claude-opus-4-6':          { input: 5.00,  output: 25.00, cache_read: 0.50,  cache_write: 6.25 },
  'claude-opus-4-20250514':   { input: 15.00, output: 75.00, cache_read: 1.50,  cache_write: 18.75 },
  'claude-opus-4':            { input: 15.00, output: 75.00, cache_read: 1.50,  cache_write: 18.75 },
  'claude-sonnet-4-6':        { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-sonnet-4-20250514': { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-sonnet-4':          { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-3.5-sonnet':        { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-3.5-haiku':         { input: 0.80,  output: 4.00,  cache_read: 0.08,  cache_write: 1.00 },
  'claude-3-haiku':           { input: 0.25,  output: 1.25,  cache_read: 0.03,  cache_write: 0.30 },

  // ═══ OpenAI (GPT) ═══
  'gpt-5.2':                  { input: 1.75,  output: 14.00, cache_read: 0.44,  cache_write: 1.75 },
  'gpt-5.2-pro':              { input: 21.00, output: 168.00, cache_read: 5.25, cache_write: 21.00 },
  'gpt-5.1':                  { input: 1.25,  output: 10.00, cache_read: 0.31,  cache_write: 1.25 },
  'gpt-5':                    { input: 1.25,  output: 10.00, cache_read: 0.31,  cache_write: 1.25 },
  'gpt-5-mini':               { input: 0.25,  output: 2.00,  cache_read: 0.06,  cache_write: 0.25 },
  'gpt-5-nano':               { input: 0.05,  output: 0.40,  cache_read: 0.01,  cache_write: 0.05 },
  'gpt-5-pro':                { input: 15.00, output: 120.00, cache_read: 3.75, cache_write: 15.00 },
  'gpt-5.1-codex':            { input: 1.25,  output: 10.00, cache_read: 0.31,  cache_write: 1.25 },
  'gpt-5.3-codex':            { input: 1.25,  output: 10.00, cache_read: 0.31,  cache_write: 1.25 },
  'gpt-4.1':                  { input: 2.00,  output: 8.00,  cache_read: 0.50,  cache_write: 2.00 },
  'gpt-4.1-mini':             { input: 0.40,  output: 1.60,  cache_read: 0.10,  cache_write: 0.40 },
  'gpt-4.1-nano':             { input: 0.10,  output: 0.40,  cache_read: 0.03,  cache_write: 0.10 },
  'gpt-4o':                   { input: 2.50,  output: 10.00, cache_read: 1.25,  cache_write: 2.50 },
  'gpt-4o-mini':              { input: 0.15,  output: 0.60,  cache_read: 0.075, cache_write: 0.15 },
  'gpt-4-turbo':              { input: 10.00, output: 30.00, cache_read: 5.00,  cache_write: 10.00 },
  'gpt-4':                    { input: 30.00, output: 60.00, cache_read: 15.00, cache_write: 30.00 },
  'gpt-3.5-turbo':            { input: 0.50,  output: 1.50,  cache_read: 0.25,  cache_write: 0.50 },

  // ═══ OpenAI Reasoning ═══
  'o4-mini':                  { input: 1.10,  output: 4.40,  cache_read: 0.28,  cache_write: 1.10 },
  'o3':                       { input: 2.00,  output: 8.00,  cache_read: 0.50,  cache_write: 2.00 },
  'o3-pro':                   { input: 20.00, output: 80.00, cache_read: 5.00,  cache_write: 20.00 },
  'o3-mini':                  { input: 1.10,  output: 4.40,  cache_read: 0.28,  cache_write: 1.10 },
  'o1':                       { input: 15.00, output: 60.00, cache_read: 3.75,  cache_write: 15.00 },
  'o1-mini':                  { input: 1.10,  output: 4.40,  cache_read: 0.28,  cache_write: 1.10 },

  // ═══ Google (Gemini) ═══
  'gemini-3-pro':             { input: 2.00,  output: 12.00, cache_read: 0.50,  cache_write: 2.00 },
  'gemini-3-flash':           { input: 0.50,  output: 3.00,  cache_read: 0.13,  cache_write: 0.50 },
  'gemini-3-flash-preview':   { input: 0.50,  output: 3.00,  cache_read: 0.13,  cache_write: 0.50 },
  'gemini-2.5-pro':           { input: 1.25,  output: 10.00, cache_read: 0.31,  cache_write: 1.25 },
  'gemini-2.5-flash':         { input: 0.15,  output: 0.60,  cache_read: 0.04,  cache_write: 0.15 },

  // ═══ xAI (Grok) ═══
  'grok-4.1':                 { input: 2.00,  output: 10.00, cache_read: 0.50,  cache_write: 2.00 },
  'grok-4.1-fast':            { input: 0.20,  output: 0.50,  cache_read: 0.05,  cache_write: 0.20 },
  'grok-4.20-beta':           { input: 2.00,  output: 10.00, cache_read: 0.50,  cache_write: 2.00 },

  // ═══ DeepSeek ═══
  'deepseek-chat':            { input: 0.27,  output: 1.10,  cache_read: 0.07,  cache_write: 0.27 },
  'deepseek-reasoner':        { input: 0.55,  output: 2.19,  cache_read: 0.14,  cache_write: 0.55 },
  'deepseek-v3':              { input: 0.28,  output: 0.42,  cache_read: 0.07,  cache_write: 0.28 },

  // ═══ Chinese Models ═══
  'qwen-max':                 { input: 1.20,  output: 6.00,  cache_read: 0.30,  cache_write: 1.20 },
  'qwen3.5':                  { input: 1.20,  output: 6.00,  cache_read: 0.30,  cache_write: 1.20 },
  'glm-5':                    { input: 1.00,  output: 3.20,  cache_read: 0.25,  cache_write: 1.00 },
  'minimax-m2':               { input: 0.30,  output: 1.20,  cache_read: 0.08,  cache_write: 0.30 },
  'kimi-k2.5':                { input: 0.60,  output: 3.00,  cache_read: 0.15,  cache_write: 0.60 },

  // ═══ Mistral ═══
  'mistral-large':            { input: 2.00,  output: 6.00,  cache_read: 0.50,  cache_write: 2.00 },
  'mistral-medium':           { input: 0.40,  output: 1.20,  cache_read: 0.10,  cache_write: 0.40 },
  'mistral-small':            { input: 0.10,  output: 0.30,  cache_read: 0.03,  cache_write: 0.10 },
};

// Aliases — map common name variants to canonical entries
const ALIASES = {
  'claude-opus':       'claude-opus-4-6',
  'claude-sonnet':     'claude-sonnet-4-6',
  'gpt4o':             'gpt-4o',
  'gpt4o-mini':        'gpt-4o-mini',
  'gpt-4o-2024':       'gpt-4o',
  'deepseek-v3.2':     'deepseek-v3',
  'qwen3-max':         'qwen-max',
  'gemini-flash':      'gemini-3-flash',
  'gemini-pro':        'gemini-3-pro',
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
