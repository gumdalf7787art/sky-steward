import { verifyJWT } from "../../utils/jwt";

export async function onRequestGet(context) {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("id");

    if (!businessId) {
        return new Response(JSON.stringify({ error: "사업체 ID가 누락되었습니다." }), { status: 400 });
    }

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
        const business = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b
            LEFT JOIN churches c ON b.church_id = c.id
            WHERE b.id = ?
        `)
            .bind(businessId)
            .first();

        if (!business) {
            return new Response(JSON.stringify({ error: "사업체를 찾을 수 없습니다." }), { status: 404 });
        }

        // Security check: Only owner can access detailed info for editing
        if (business.user_id !== user.id) {
            return new Response(JSON.stringify({ error: "본인의 사업체만 조회할 수 있습니다." }), { status: 403 });
        }

        const menus = await env.DB.prepare("SELECT * FROM menus WHERE business_id = ? ORDER BY created_at ASC")
            .bind(businessId)
            .all();

        return new Response(JSON.stringify({ 
            success: true, 
            business,
            menus: menus.results || [] 
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
