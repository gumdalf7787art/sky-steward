import { verifyJWT } from '../../utils/jwt';

export async function onRequestPut({ request, env, params }) {
    try {
        const reviewId = params.id;
        
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyJWT(token);

        if (!payload || !payload.id) {
            return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
        }

        const { rating, comment } = await request.json();
        
        if (!rating) {
            return new Response(JSON.stringify({ error: "Required fields missing (rating)" }), { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return new Response(JSON.stringify({ error: "Rating must be between 1 and 5" }), { status: 400 });
        }

        // Verify ownership
        const existing = await env.DB.prepare('SELECT user_id FROM reviews WHERE id = ?').bind(reviewId).first();
        if (!existing) {
            return new Response(JSON.stringify({ error: "Review not found" }), { status: 404 });
        }
        if (existing.user_id !== payload.id) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
        }

        await env.DB.prepare(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?'
        ).bind(
            rating,
            comment || "",
            reviewId
        ).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Review updated successfully"
        }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function onRequestDelete({ request, env, params }) {
    try {
        const reviewId = params.id;
        
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyJWT(token);

        if (!payload || !payload.id) {
            return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
        }

        // Verify ownership
        const existing = await env.DB.prepare('SELECT user_id FROM reviews WHERE id = ?').bind(reviewId).first();
        if (!existing) {
            return new Response(JSON.stringify({ error: "Review not found" }), { status: 404 });
        }
        if (existing.user_id !== payload.id) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
        }

        await env.DB.prepare(
            'DELETE FROM reviews WHERE id = ?'
        ).bind(reviewId).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Review deleted successfully"
        }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
