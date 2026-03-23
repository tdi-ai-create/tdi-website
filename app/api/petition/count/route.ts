import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const COUNTER_OFFSET = 2147;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { count, error } = await supabase
      .from('petition_signatures')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({ count: (count || 0) + COUNTER_OFFSET });
  } catch (error) {
    console.error('Count error:', error);
    return NextResponse.json({ count: 0 });
  }
}
