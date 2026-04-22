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
        const churches = await env.DB.prepare(`
            SELECT * FROM churches 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `).bind(user.id).all();

        return new Response(JSON.stringify({ 
            success: true, 
            churches: churches.results 
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
