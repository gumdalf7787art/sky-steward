import { verifyJWT } from '../../utils/jwt';

export async function onRequestGet({ request, env }) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: "인증이 필요합니다." }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyJWT(token);

        if (!payload || !payload.id) {
            return new Response(JSON.stringify({ error: "유효하지 않은 토큰입니다." }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch businesses for this user
        const businesses = await env.DB.prepare('SELECT * FROM businesses WHERE user_id = ? ORDER BY created_at DESC')
            .bind(payload.id)
            .all();

        return new Response(JSON.stringify({ 
            success: true, 
            businesses: businesses.results 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
