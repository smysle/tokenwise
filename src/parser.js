/**
 * parser.js — Multi-format API usage log parser
 * 
 * Supports:
 *   - NewAPI format (JSON with model, prompt_tokens, completion_tokens, cached_tokens, etc.)
 *   - OpenAI format (usage object nested in response)
 *   - Anthropic format (usage object with input_tokens/output_tokens)
 * 
 * All formats are normalized to a standard UsageRecord:
 * {
 *   timestamp: ISO string,
 *   model: string,
 *   prompt_tokens: number,
 *   completion_tokens: number,
 *   cached_tokens: number,
 *   cache_creation_tokens: number,
 * }
 */

'use strict';

/**
 * Detect the format of a single record
 */
function detectFormat(record) {
  // Anthropic format: has input_tokens / output_tokens at top level or in usage
  if (record.type === 'message' || record.content?.[0]?.type === 'text') {
    return 'anthropic';
  }
  if (record.usage?.input_tokens !== undefined && record.model?.startsWith('claude')) {
    return 'anthropic';
  }

  // OpenAI format: has usage.prompt_tokens nested in a response-like object
  if (record.object === 'chat.completion' || record.choices) {
    return 'openai';
  }
  if (record.usage?.prompt_tokens !== undefined && !record.prompt_tokens) {
    return 'openai';
  }

  // NewAPI / flat format: has prompt_tokens at top level
  if (record.prompt_tokens !== undefined || record.model) {
    return 'newapi';
  }

  return 'unknown';
}

/**
 * Parse a NewAPI format record
 */
function parseNewAPI(record) {
  return {
    timestamp:              record.timestamp || record.created_at || new Date().toISOString(),
    model:                  record.model || 'unknown',
    prompt_tokens:          record.prompt_tokens || 0,
    completion_tokens:      record.completion_tokens || 0,
    cached_tokens:          record.cached_tokens || 0,
    cache_creation_tokens:  record.cache_creation_tokens || 0,
  };
}

/**
 * Parse an OpenAI format record
 */
function parseOpenAI(record) {
  const usage = record.usage || {};
  return {
    timestamp:              record.created ? new Date(record.created * 1000).toISOString() : (record.timestamp || new Date().toISOString()),
    model:                  record.model || 'unknown',
    prompt_tokens:          usage.prompt_tokens || 0,
    completion_tokens:      usage.completion_tokens || 0,
    cached_tokens:          usage.prompt_tokens_details?.cached_tokens || 0,
    cache_creation_tokens:  0, // OpenAI doesn't separate cache creation
  };
}

/**
 * Parse an Anthropic format record
 */
function parseAnthropic(record) {
  const usage = record.usage || {};
  return {
    timestamp:              record.timestamp || record.created_at || new Date().toISOString(),
    model:                  record.model || 'unknown',
    prompt_tokens:          usage.input_tokens || 0,
    completion_tokens:      usage.output_tokens || 0,
    cached_tokens:          usage.cache_read_input_tokens || 0,
    cache_creation_tokens:  usage.cache_creation_input_tokens || 0,
  };
}

/**
 * Parse a single record, auto-detecting format
 */
function parseRecord(record) {
  const format = detectFormat(record);
  switch (format) {
    case 'newapi':    return parseNewAPI(record);
    case 'openai':    return parseOpenAI(record);
    case 'anthropic': return parseAnthropic(record);
    default:          return parseNewAPI(record); // best-effort fallback
  }
}

/**
 * Parse an array of records or a file content string
 * Accepts: JSON array, newline-delimited JSON, or single object
 */
function parseLog(input) {
  let data;

  if (typeof input === 'string') {
    input = input.trim();
    // Try JSON array first
    try {
      data = JSON.parse(input);
    } catch {
      // Try newline-delimited JSON (JSONL)
      data = input
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    }
  } else {
    data = input;
  }

  // Single object → wrap in array
  if (!Array.isArray(data)) {
    data = [data];
  }

  return data.map(parseRecord);
}

module.exports = { parseLog, parseRecord, detectFormat };
