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
        const { businessId } = await request.json();
        if (!businessId) {
            return new Response(JSON.stringify({ error: "Business ID is required" }), { status: 400 });
        }

        // Check if already bookmarked
        const existing = await env.DB.prepare("SELECT id FROM bookmarks WHERE user_id = ? AND business_id = ?")
            .bind(user.id, businessId)
            .first();

        if (existing) {
            // Remove bookmark
            await env.DB.prepare("DELETE FROM bookmarks WHERE id = ?")
                .bind(existing.id)
                .run();
            return new Response(JSON.stringify({ success: true, bookmarked: false, message: "관심 항목에서 삭제되었습니다." }));
        } else {
            // Add bookmark
            const bookmarkId = crypto.randomUUID();
            await env.DB.prepare("INSERT INTO bookmarks (id, user_id, business_id) VALUES (?, ?, ?)")
                .bind(bookmarkId, user.id, businessId)
                .run();
            return new Response(JSON.stringify({ success: true, bookmarked: true, message: "관심 항목에 추가되었습니다." }));
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
