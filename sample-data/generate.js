/**
 * sample-data/generate.js — Generate realistic sample usage data
 * Run: node sample-data/generate.js > sample-data/usage.json
 */

'use strict';

const models = [
  { name: 'claude-opus-4-6', weight: 0.15, promptRange: [2000, 50000], completionRange: [500, 4000] },
  { name: 'claude-sonnet-4-6', weight: 0.45, promptRange: [1000, 30000], completionRange: [200, 3000] },
  { name: 'gpt-5.2', weight: 0.25, promptRange: [1500, 25000], completionRange: [300, 2500] },
  { name: 'gpt-4o-mini', weight: 0.15, promptRange: [500, 10000], completionRange: [100, 1500] },
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(items) {
  const r = Math.random();
  let cum = 0;
  for (const item of items) {
    cum += item.weight;
    if (r <= cum) return item;
  }
  return items[items.length - 1];
}

function generateRecords(count = 100) {
  const records = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const model = weightedPick(models);
    
    // Spread over last 7 days, with more recent days having more requests
    const daysAgo = Math.floor(Math.random() * 7);
    const weight = 1 - (daysAgo / 10); // more recent = more likely
    if (Math.random() > weight && daysAgo > 3) continue; // skip some old ones
    
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(rand(8, 23), rand(0, 59), rand(0, 59), 0);

    const promptTokens = rand(model.promptRange[0], model.promptRange[1]);
    const completionTokens = rand(model.completionRange[0], model.completionRange[1]);

    // Cache simulation: ~60% chance of some caching, higher for sonnet
    const hasCaching = Math.random() < (model.name.includes('sonnet') ? 0.75 : 0.55);
    let cachedTokens = 0;
    let cacheCreationTokens = 0;

    if (hasCaching) {
      if (Math.random() < 0.6) {
        // Cache hit — significant portion of prompt was cached
        cachedTokens = Math.floor(promptTokens * (0.3 + Math.random() * 0.6));
      } else {
        // Cache creation — writing new cache
        cacheCreationTokens = Math.floor(promptTokens * (0.4 + Math.random() * 0.4));
        // Sometimes also a partial cache hit
        if (Math.random() < 0.3) {
          cachedTokens = Math.floor(promptTokens * (0.1 + Math.random() * 0.2));
        }
      }
    }

    records.push({
      timestamp: date.toISOString(),
      model: model.name,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cached_tokens: cachedTokens,
      cache_creation_tokens: cacheCreationTokens,
    });
  }

  // Sort by timestamp
  records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return records;
}

// If run directly, output to stdout
if (require.main === module) {
  const records = generateRecords(110);
  console.log(JSON.stringify(records, null, 2));
}

module.exports = { generateRecords };
