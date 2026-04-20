import { verifyJWT } from '../utils/jwt';

export async function onRequestGet({ request, env }) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyJWT(token);

        if (!payload || !payload.id) {
            return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
        }

        const user = await env.DB.prepare('SELECT id, email, nickname, phone, role FROM users WHERE id = ?').bind(payload.id).first();
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, user }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
