import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const distance = url.searchParams.get('distance') || '';
    const country = url.searchParams.get('country') || '';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '15'), 50);

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: 'Config manquante' }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        let builder = supabase
            .from('races')
            .select('*')
            .gte('date', new Date().toISOString().split('T')[0]) // Seulement les courses futures
            .order('date', { ascending: true })
            .limit(limit);

        // Filtre par distance
        if (distance) {
            builder = builder.eq('distance', distance);
        }

        // Filtre par pays
        if (country) {
            builder = builder.eq('country_code', country.toUpperCase());
        }

        // Recherche textuelle
        if (query) {
            builder = builder.or(`name.ilike.%${query}%,city.ilike.%${query}%`);
        }

        const { data, error } = await builder;

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ races: data || [] }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600', // Cache 1h
            },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
