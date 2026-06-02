import { createClient } from '@supabase/supabase-js';

// Sonnet pricing (per million tokens)
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
  // Fallback for unknown models
  default: { input: 3.0, output: 15.0 },
};

let cachedClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (cachedClient) return cachedClient;
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cachedClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return cachedClient;
}

function estimateCostCents(model: string, inputTokens: number, outputTokens: number): number {
  const prices = PRICING[model] || PRICING.default;
  return (inputTokens * prices.input + outputTokens * prices.output) / 1_000_000 * 100;
}

/**
 * Log an AI API call for cost tracking. Fire-and-forget -- never blocks the response.
 */
export function logAIUsage(params: {
  userId?: string | null;
  endpoint: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  metadata?: Record<string, unknown>;
}) {
  // Fire and forget -- don't await, don't block
  try {
    const client = getClient();
    if (!client) return;

    const costCents = estimateCostCents(params.model, params.inputTokens, params.outputTokens);

    const row: Record<string, unknown> = {
      user_id: params.userId || null,
      endpoint: params.endpoint,
      model: params.model,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      cost_cents: costCents,
      metadata: params.metadata || {},
    };

    (client as any)
      .from('hub_ai_usage')
      .insert(row)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) console.warn('[AI Usage] Log failed:', error.message);
      });
  } catch {
    // Never let logging break the actual feature
  }
}
