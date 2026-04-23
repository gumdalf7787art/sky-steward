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
        const query = `
            SELECT b.*, c.name as church_name
            FROM bookmarks bm
            JOIN businesses b ON bm.business_id = b.id
            LEFT JOIN churches c ON b.church_id = c.id
            WHERE bm.user_id = ?
            ORDER BY bm.created_at DESC
        `;
        
        const { results } = await env.DB.prepare(query)
            .bind(user.id)
            .all();

        return new Response(JSON.stringify({ success: true, bookmarks: results }));
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
