import { kv } from '@vercel/kv';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req, res) {
    const { entity } = req.query;

    if (!entity) {
        return res.status(400).send('Entity required');
    }

    const key = `base44_${entity}`;

    try {
        if (req.method === 'GET') {
            const data = await kv.get(key) || [];
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const body = req.body;
            const currentData = await kv.get(key) || [];

            // Se for array (substituição total) ou item único (append)
            let newData;
            if (Array.isArray(body)) {
                newData = body;
            } else {
                newData = [...currentData, body];
            }

            await kv.set(key, newData);

            return res.status(200).json(body);
        }

        return res.status(405).send('Method not allowed');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
