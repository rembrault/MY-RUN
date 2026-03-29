// Vercel Serverless Function — Proxy OpenAI
// La clé API reste côté serveur, jamais exposée au navigateur

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await req.json();

        // Validation basique : on n'accepte que les messages
        if (!body.messages || !Array.isArray(body.messages)) {
            return new Response(JSON.stringify({ error: 'Invalid request: messages array required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Appel OpenAI côté serveur avec des limites strictes
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: body.model || 'gpt-4o-mini',
                messages: body.messages,
                max_tokens: Math.min(body.max_tokens || 600, 800), // Plafond à 800
                temperature: body.temperature ?? 0.7,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return new Response(JSON.stringify({
                error: `OpenAI error: ${(err as any).error?.message || response.statusText}`,
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
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
