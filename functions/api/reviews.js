import { verifyJWT } from '../utils/jwt';

export async function onRequestPost({ request, env }) {
    try {
        // 1. Authentication Check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyJWT(token);

        if (!payload || !payload.id) {
            return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
        }

        // 2. Body Data Validation
        const { business_id, rating, comment } = await request.json();
        
        if (!business_id || !rating) {
            return new Response(JSON.stringify({ error: "Required fields missing (business_id, rating)" }), { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return new Response(JSON.stringify({ error: "Rating must be between 1 and 5" }), { status: 400 });
        }

        // 3. Database Insertion
        const id = crypto.randomUUID();
        const userId = payload.id;

        await env.DB.prepare(
            'INSERT INTO reviews (id, business_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
            id,
            business_id,
            userId,
            rating,
            comment || "",
            new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Review submitted successfully",
            reviewId: id
        }), { status: 201 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
