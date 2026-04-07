// Vercel Edge Function — Crée une session Stripe Checkout
// La clé secrète Stripe reste côté serveur

export const config = { runtime: 'edge' };

// Correspondance distance → prix en centimes
const PRICE_MAP: Record<string, number> = {
    '5km':            499,
    '10km':           899,
    'Semi-Marathon':  1299,
    'Marathon':       1499,
};

const LABEL_MAP: Record<string, string> = {
    '5km':            'MY RUN - Programme 5km',
    '10km':           'MY RUN - Programme 10km',
    'Semi-Marathon':  'MY RUN - Programme Semi-Marathon',
    'Marathon':       'MY RUN - Programme Marathon',
};

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { distance, programId, userId } = await req.json();

        if (!distance || !programId || !userId) {
            return new Response(JSON.stringify({ error: 'Missing required fields: distance, programId, userId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const amount = PRICE_MAP[distance];
        const label = LABEL_MAP[distance];

        if (!amount || !label) {
            return new Response(JSON.stringify({ error: `Invalid distance: ${distance}` }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Déterminer l'URL de base depuis le header Origin ou Referer
        const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://www.my-run-app.fr';

        // Créer la session Stripe Checkout via l'API REST (pas besoin du SDK)
        const params = new URLSearchParams();
        params.append('mode', 'payment');
        params.append('success_url', `${origin}/?payment=success&program_id=${programId}`);
        params.append('cancel_url', `${origin}/?payment=cancelled`);
        params.append('line_items[0][price_data][currency]', 'eur');
        params.append('line_items[0][price_data][product_data][name]', label);
        params.append('line_items[0][price_data][unit_amount]', amount.toString());
        params.append('line_items[0][quantity]', '1');
        params.append('metadata[program_id]', programId);
        params.append('metadata[user_id]', userId);
        params.append('metadata[distance]', distance);

        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        const session = await stripeResponse.json();

        if (!stripeResponse.ok) {
            return new Response(JSON.stringify({
                error: session.error?.message || 'Stripe session creation failed',
            }), {
                status: stripeResponse.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
