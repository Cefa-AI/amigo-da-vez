
import { put } from '@vercel/blob';

export const config = {
    runtime: 'nodejs',
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    try {
        const filename = req.query.filename || 'unknown-file';

        const blob = await put(filename, req, {
            access: 'public',
        });

        return res.status(200).json(blob);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
