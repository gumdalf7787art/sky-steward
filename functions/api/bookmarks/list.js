import { verifyJWT } from "../../utils/jwt";

export async function onRequestGet(context) {
    const { request, env } = context;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyJWT(token);

    if (!user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    try {
        // Fetch bookmarked businesses with details
        const { results } = await env.DB.prepare(`
            SELECT b.*, c.name as church_name, 
            (SELECT AVG(rating) FROM reviews WHERE business_id = b.id) as avg_rating,
            (SELECT COUNT(*) FROM reviews WHERE business_id = b.id) as review_count
            FROM bookmarks bm
            JOIN businesses b ON bm.business_id = b.id
            LEFT JOIN churches c ON b.church_id = c.id
            WHERE bm.user_id = ?
            ORDER BY bm.created_at DESC
        `).bind(user.id).all();

        return new Response(JSON.stringify({ success: true, bookmarks: results }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
