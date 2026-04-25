import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll fails in Server Components (read-only context) — safe to ignore
          }
        },
      },
    }
  );
}

export type DashboardSession = {
  userId: string;
  email: string;
  role: 'tdi' | 'admin';
  schoolId: string | undefined;
};

export async function getDashboardSession(): Promise<DashboardSession | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const isTDI = user.email?.toLowerCase().endsWith('@teachersdeserveit.com');

  return {
    userId: user.id,
    email: user.email ?? '',
    role: isTDI ? 'tdi' : 'admin',
    schoolId: undefined,
  };
}
