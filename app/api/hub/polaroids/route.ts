import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/hub-auth';

// Hub Supabase with service role (bypasses RLS)
function getHubAdmin() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Hub Supabase credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// GET -- load user's polaroids
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ polaroids: {} });

    const hub = getHubAdmin();
    const { data } = await hub
      .from('hub_polaroids')
      .select('slot, image_url, caption')
      .eq('user_id', user.id);

    const map: Record<string, { image_url: string; caption: string | null }> = {};
    (data || []).forEach((p: { slot: string; image_url: string; caption: string | null }) => {
      map[p.slot] = { image_url: p.image_url, caption: p.caption };
    });

    return NextResponse.json({ polaroids: map });
  } catch (error) {
    console.error('[Polaroids GET]', error);
    return NextResponse.json({ polaroids: {} });
  }
}

// POST -- upload a polaroid photo
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const slot = formData.get('slot') as string | null;

    if (!file || !slot || !['love', 'proud', 'goal'].includes(slot)) {
      return NextResponse.json({ error: 'Missing file or invalid slot' }, { status: 400 });
    }

    const hub = getHubAdmin();

    // Upload to storage
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/${slot}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await hub.storage
      .from('polaroids')
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('[Polaroids] Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = hub.storage
      .from('polaroids')
      .getPublicUrl(filePath);

    const imageUrl = `${publicUrl}?t=${Date.now()}`;

    // Upsert to database
    const { error: dbError } = await hub
      .from('hub_polaroids')
      .upsert({
        user_id: user.id,
        slot,
        image_url: imageUrl,
        caption: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,slot' });

    if (dbError) {
      console.error('[Polaroids] DB upsert error:', dbError);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ image_url: imageUrl });
  } catch (error) {
    console.error('[Polaroids POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
