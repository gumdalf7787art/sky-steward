import { verifyJWT } from "../../utils/jwt";

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const business_id = url.searchParams.get("business_id");
    const authHeader = request.headers.get("Authorization");

    if (!business_id) {
        return new Response(JSON.stringify({ error: "business_id is required" }), { status: 400 });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ isBookmarked: false }));
    }

    try {
        const token = authHeader.split(" ")[1];
        const user = await verifyJWT(token);

        if (!user) {
            return new Response(JSON.stringify({ isBookmarked: false }));
        }

        const existing = await env.DB.prepare("SELECT id FROM bookmarks WHERE user_id = ? AND business_id = ?")
            .bind(user.id, business_id)
            .first();

        return new Response(JSON.stringify({ isBookmarked: !!existing }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ isBookmarked: false }));
    }
}
