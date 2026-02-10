import { SupabaseClient } from '@supabase/supabase-js';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

export async function getUniqueSlug(
  supabase: SupabaseClient,
  baseName: string
): Promise<string> {
  const baseSlug = generateSlug(baseName);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const { data } = await supabase
      .from('partnerships')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
