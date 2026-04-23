import { verifyJWT } from "../../utils/jwt";

export async function onRequestPost(context) {
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
        const { business_id } = await request.json();
        if (!business_id) {
            return new Response(JSON.stringify({ error: "business_id is required" }), { status: 400 });
        }

        // Check if already bookmarked
        const existing = await env.DB.prepare("SELECT id FROM bookmarks WHERE user_id = ? AND business_id = ?")
            .bind(user.id, business_id)
            .first();

        if (existing) {
            // Remove bookmark
            await env.DB.prepare("DELETE FROM bookmarks WHERE id = ?").bind(existing.id).run();
            return new Response(JSON.stringify({ success: true, isBookmarked: false }), {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            // Add bookmark
            const id = crypto.randomUUID();
            await env.DB.prepare("INSERT INTO bookmarks (id, user_id, business_id) VALUES (?, ?, ?)")
                .bind(id, user.id, business_id)
                .run();
            return new Response(JSON.stringify({ success: true, isBookmarked: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
