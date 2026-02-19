/**
 * pricing.js — Model pricing database
 * 
 * Prices are per 1M tokens in USD.
 * Sources: Official pricing pages, updated 2026-02-20.
 * Cache multipliers (Anthropic): write=1.25x, read=0.1x of base input
 * Cache multipliers (OpenAI): write=1x, read=0.5x of base input (varies)
 */

'use strict';

const PRICING = {
  // ═══════════════════════════════════════════════════════════════
  // Anthropic (Claude) — https://platform.claude.com/docs/en/about-claude/pricing
  // ═══════════════════════════════════════════════════════════════
  'claude-opus-4-6':          { input: 5.00,  output: 25.00, cache_read: 0.50,  cache_write: 6.25 },
  'claude-opus-4-5':          { input: 5.00,  output: 25.00, cache_read: 0.50,  cache_write: 6.25 },
  'claude-opus-4-5-20251101': { input: 5.00,  output: 25.00, cache_read: 0.50,  cache_write: 6.25 },
  'claude-opus-4-1':          { input: 15.00, output: 75.00, cache_read: 1.50,  cache_write: 18.75 },
  'claude-opus-4':            { input: 15.00, output: 75.00, cache_read: 1.50,  cache_write: 18.75 },
  'claude-opus-4-20250514':   { input: 15.00, output: 75.00, cache_read: 1.50,  cache_write: 18.75 },
  'claude-opus-3':            { input: 15.00, output: 75.00, cache_read: 1.50,  cache_write: 18.75 },
  'claude-sonnet-4-6':        { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-sonnet-4-5':        { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-sonnet-4-5-20241022': { input: 3.00, output: 15.00, cache_read: 0.30, cache_write: 3.75 },
  'claude-sonnet-4':          { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-sonnet-4-20250514': { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-sonnet-3.7':        { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-3.5-sonnet':        { input: 3.00,  output: 15.00, cache_read: 0.30,  cache_write: 3.75 },
  'claude-haiku-4-5':         { input: 1.00,  output: 5.00,  cache_read: 0.10,  cache_write: 1.25 },
  'claude-haiku-4.5':         { input: 1.00,  output: 5.00,  cache_read: 0.10,  cache_write: 1.25 },
  'claude-3.5-haiku':         { input: 0.80,  output: 4.00,  cache_read: 0.08,  cache_write: 1.00 },
  'claude-3-haiku':           { input: 0.25,  output: 1.25,  cache_read: 0.03,  cache_write: 0.30 },

  // ═══════════════════════════════════════════════════════════════
  // OpenAI (GPT) — https://openai.com/api/pricing/
  // ═══════════════════════════════════════════════════════════════
  'gpt-5.2':                  { input: 1.75,  output: 14.00, cache_read: 0.875, cache_write: 1.75 },
  'gpt-5.2-pro':              { input: 21.00, output: 168.00, cache_read: 10.50, cache_write: 21.00 },
  'gpt-5.1':                  { input: 1.25,  output: 10.00, cache_read: 0.625, cache_write: 1.25 },
  'gpt-5':                    { input: 1.25,  output: 10.00, cache_read: 0.625, cache_write: 1.25 },
  'gpt-5-mini':               { input: 0.25,  output: 2.00,  cache_read: 0.125, cache_write: 0.25 },
  'gpt-5-nano':               { input: 0.05,  output: 0.40,  cache_read: 0.025, cache_write: 0.05 },
  'gpt-5-pro':                { input: 15.00, output: 120.00, cache_read: 7.50, cache_write: 15.00 },
  'gpt-5.3-codex':            { input: 1.25,  output: 10.00, cache_read: 0.625, cache_write: 1.25 },
  'gpt-5.3-codex-spark':      { input: 1.25,  output: 10.00, cache_read: 0.625, cache_write: 1.25 },
  'gpt-5.2-codex':            { input: 1.25,  output: 10.00, cache_read: 0.625, cache_write: 1.25 },
  'gpt-5.1-codex':            { input: 1.25,  output: 10.00, cache_read: 0.625, cache_write: 1.25 },
  'gpt-5-codex':              { input: 1.25,  output: 10.00, cache_read: 0.625, cache_write: 1.25 },
  'gpt-5.1-codex-mini':       { input: 0.25,  output: 2.00,  cache_read: 0.125, cache_write: 0.25 },
  'codex-mini-latest':        { input: 1.50,  output: 6.00,  cache_read: 0.75,  cache_write: 1.50 },
  'gpt-5-search-api':         { input: 1.25,  output: 10.00, cache_read: 0.625, cache_write: 1.25 },
  'gpt-4.1':                  { input: 2.00,  output: 8.00,  cache_read: 1.00,  cache_write: 2.00 },
  'gpt-4.1-mini':             { input: 0.40,  output: 1.60,  cache_read: 0.20,  cache_write: 0.40 },
  'gpt-4.1-nano':             { input: 0.10,  output: 0.40,  cache_read: 0.05,  cache_write: 0.10 },
  'gpt-4o':                   { input: 2.50,  output: 10.00, cache_read: 1.25,  cache_write: 2.50 },
  'gpt-4o-mini':              { input: 0.15,  output: 0.60,  cache_read: 0.075, cache_write: 0.15 },
  'gpt-4-turbo':              { input: 10.00, output: 30.00, cache_read: 5.00,  cache_write: 10.00 },
  'gpt-4':                    { input: 30.00, output: 60.00, cache_read: 15.00, cache_write: 30.00 },
  'gpt-3.5-turbo':            { input: 0.50,  output: 1.50,  cache_read: 0.25,  cache_write: 0.50 },

  // ═══════════════════════════════════════════════════════════════
  // OpenAI Reasoning (o-series)
  // ═══════════════════════════════════════════════════════════════
  'o4-mini':                  { input: 1.10,  output: 4.40,  cache_read: 0.55,  cache_write: 1.10 },
  'o4-mini-deep-research':    { input: 2.00,  output: 8.00,  cache_read: 1.00,  cache_write: 2.00 },
  'o3':                       { input: 2.00,  output: 8.00,  cache_read: 1.00,  cache_write: 2.00 },
  'o3-pro':                   { input: 20.00, output: 80.00, cache_read: 10.00, cache_write: 20.00 },
  'o3-deep-research':         { input: 10.00, output: 40.00, cache_read: 5.00,  cache_write: 10.00 },
  'o3-mini':                  { input: 1.10,  output: 4.40,  cache_read: 0.55,  cache_write: 1.10 },
  'o1':                       { input: 15.00, output: 60.00, cache_read: 7.50,  cache_write: 15.00 },
  'o1-pro':                   { input: 150.00, output: 600.00, cache_read: 75.00, cache_write: 150.00 },
  'o1-mini':                  { input: 1.10,  output: 4.40,  cache_read: 0.55,  cache_write: 1.10 },

  // ═══════════════════════════════════════════════════════════════
  // Google (Gemini) — https://ai.google.dev/pricing
  // ═══════════════════════════════════════════════════════════════
  'gemini-3-pro':             { input: 2.00,  output: 12.00, cache_read: 0.50,  cache_write: 2.00 },
  'gemini-3-flash':           { input: 0.50,  output: 3.00,  cache_read: 0.13,  cache_write: 0.50 },
  'gemini-3-flash-preview':   { input: 0.50,  output: 3.00,  cache_read: 0.13,  cache_write: 0.50 },
  'gemini-2.5-pro':           { input: 1.25,  output: 10.00, cache_read: 0.31,  cache_write: 1.25 },
  'gemini-2.5-flash':         { input: 0.30,  output: 2.50,  cache_read: 0.08,  cache_write: 0.30 },
  'gemini-2.5-flash-lite':    { input: 0.10,  output: 0.40,  cache_read: 0.03,  cache_write: 0.10 },
  'gemini-2.0-flash':         { input: 0.10,  output: 0.40,  cache_read: 0.03,  cache_write: 0.10 },
  'gemini-2.0-flash-lite':    { input: 0.075, output: 0.30,  cache_read: 0.02,  cache_write: 0.075 },

  // ═══════════════════════════════════════════════════════════════
  // xAI (Grok) — https://docs.x.ai/docs/models
  // ═══════════════════════════════════════════════════════════════
  'grok-4':                   { input: 3.00,  output: 15.00, cache_read: 0.75,  cache_write: 3.00 },
  'grok-4.1':                 { input: 2.00,  output: 10.00, cache_read: 0.50,  cache_write: 2.00 },
  'grok-4.1-fast':            { input: 0.20,  output: 0.50,  cache_read: 0.05,  cache_write: 0.20 },
  'grok-4-fast':              { input: 0.20,  output: 0.50,  cache_read: 0.05,  cache_write: 0.20 },
  'grok-4.20-beta':           { input: 2.00,  output: 10.00, cache_read: 0.50,  cache_write: 2.00 },
  'grok-3':                   { input: 3.00,  output: 15.00, cache_read: 0.75,  cache_write: 3.00 },
  'grok-3-mini':              { input: 0.30,  output: 0.50,  cache_read: 0.08,  cache_write: 0.30 },
  'grok-code-fast-1':         { input: 0.20,  output: 1.50,  cache_read: 0.05,  cache_write: 0.20 },

  // ═══════════════════════════════════════════════════════════════
  // DeepSeek — https://api-docs.deepseek.com/quick_start/pricing
  // ═══════════════════════════════════════════════════════════════
  'deepseek-chat':            { input: 0.27,  output: 1.10,  cache_read: 0.07,  cache_write: 0.27 },
  'deepseek-reasoner':        { input: 0.55,  output: 2.19,  cache_read: 0.14,  cache_write: 0.55 },
  'deepseek-v3':              { input: 0.28,  output: 0.42,  cache_read: 0.07,  cache_write: 0.28 },
  'deepseek-v3.2':            { input: 0.28,  output: 0.42,  cache_read: 0.07,  cache_write: 0.28 },
  'deepseek-v3.2-speciale':   { input: 0.28,  output: 0.42,  cache_read: 0.07,  cache_write: 0.28 },

  // ═══════════════════════════════════════════════════════════════
  // Chinese Models
  // ═══════════════════════════════════════════════════════════════
  // Qwen (Alibaba)
  'qwen-max':                 { input: 1.20,  output: 6.00,  cache_read: 0.30,  cache_write: 1.20 },
  'qwen3-max':                { input: 1.20,  output: 6.00,  cache_read: 0.30,  cache_write: 1.20 },
  'qwen3.5':                  { input: 1.20,  output: 6.00,  cache_read: 0.30,  cache_write: 1.20 },

  // Zhipu (GLM)
  'glm-5':                    { input: 1.00,  output: 3.20,  cache_read: 0.25,  cache_write: 1.00 },

  // MiniMax
  'minimax-m2':               { input: 0.30,  output: 1.20,  cache_read: 0.08,  cache_write: 0.30 },
  'minimax-m2.5':             { input: 0.30,  output: 1.20,  cache_read: 0.08,  cache_write: 0.30 },
  'minimax-m2.5-lightning':   { input: 0.30,  output: 1.20,  cache_read: 0.08,  cache_write: 0.30 },

  // Kimi (Moonshot)
  'kimi-k2.5':                { input: 0.60,  output: 3.00,  cache_read: 0.15,  cache_write: 0.60 },
  'kimi-k2':                  { input: 0.60,  output: 3.00,  cache_read: 0.15,  cache_write: 0.60 },
  'kimi-k2-thinking':         { input: 0.60,  output: 3.00,  cache_read: 0.15,  cache_write: 0.60 },

  // ═══════════════════════════════════════════════════════════════
  // Mistral — https://mistral.ai/products/pricing
  // ═══════════════════════════════════════════════════════════════
  'mistral-large':            { input: 2.00,  output: 6.00,  cache_read: 0.50,  cache_write: 2.00 },
  'mistral-medium':           { input: 0.40,  output: 1.20,  cache_read: 0.10,  cache_write: 0.40 },
  'mistral-small':            { input: 0.10,  output: 0.30,  cache_read: 0.03,  cache_write: 0.10 },

  // ═══════════════════════════════════════════════════════════════
  // Meta (Llama) — pricing via inference providers
  // ═══════════════════════════════════════════════════════════════
  'llama-4-maverick':         { input: 0.20,  output: 0.60,  cache_read: 0.05,  cache_write: 0.20 },
  'llama-4-scout':            { input: 0.10,  output: 0.30,  cache_read: 0.03,  cache_write: 0.10 },
  'llama-3.3-70b':            { input: 0.10,  output: 0.30,  cache_read: 0.03,  cache_write: 0.10 },

  // ═══════════════════════════════════════════════════════════════
  // Perplexity
  // ═══════════════════════════════════════════════════════════════
  'sonar-pro':                { input: 3.00,  output: 15.00, cache_read: 0.75,  cache_write: 3.00 },
  'sonar':                    { input: 1.00,  output: 1.00,  cache_read: 0.25,  cache_write: 1.00 },
};

// Aliases — map common name variants to canonical entries
const ALIASES = {
  'claude-opus':          'claude-opus-4-6',
  'claude-sonnet':        'claude-sonnet-4-6',
  'claude-haiku':         'claude-haiku-4-5',
  'gpt4o':                'gpt-4o',
  'gpt4o-mini':           'gpt-4o-mini',
  'gpt-4o-2024':          'gpt-4o',
  'deepseek-v3.2':        'deepseek-v3',
  'gemini-flash':         'gemini-3-flash',
  'gemini-pro':           'gemini-3-pro',
  'grok':                 'grok-4.1',
  'grok-fast':            'grok-4.1-fast',
  'perplexity/sonar-pro': 'sonar-pro',
  'perplexity/sonar':     'sonar',
};

/**
 * Get pricing for a model. Falls back to a default if unknown.
 */
function getPricing(model) {
  if (!model) return getDefault();
  const m = model.toLowerCase().trim();
  
  if (PRICING[m]) return PRICING[m];
  if (ALIASES[m] && PRICING[ALIASES[m]]) return PRICING[ALIASES[m]];
  
  // Strip provider prefix (e.g., "openai/gpt-5.2" -> "gpt-5.2")
  const stripped = m.includes('/') ? m.split('/').pop() : m;
  if (PRICING[stripped]) return PRICING[stripped];
  if (ALIASES[stripped] && PRICING[ALIASES[stripped]]) return PRICING[ALIASES[stripped]];
  
  // Fuzzy match: try prefix matching
  for (const key of Object.keys(PRICING)) {
    if (stripped.startsWith(key) || key.startsWith(stripped)) {
      return PRICING[key];
    }
  }
  
  return getDefault();
}

function getDefault() {
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
    without_cache: ((record.prompt_tokens || 0) / M) * pricing.input + outputCost + (((record.cache_creation_tokens || 0) / M) * pricing.input),
  };
}

/**
 * Get all available model names
 */
function listModels() {
  return Object.keys(PRICING);
}

module.exports = { PRICING, ALIASES, getPricing, calculateCost, listModels };
