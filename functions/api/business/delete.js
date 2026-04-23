import { verifyJWT } from "../../utils/jwt";

export async function onRequestPost({ request, env }) {
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

        // 1. Check ownership
        const business = await env.DB.prepare("SELECT user_id FROM businesses WHERE id = ?")
            .bind(businessId)
            .first();

        if (!business) {
            return new Response(JSON.stringify({ error: "Business not found" }), { status: 404 });
        }

        if (business.user_id !== user.id) {
            return new Response(JSON.stringify({ error: "You don't have permission to delete this business" }), { status: 403 });
        }

        // 2. Delete related data (manually since no CASCADE)
        // Order: Menus, Bookmarks, Reviews, then Business
        const batch = [
            env.DB.prepare("DELETE FROM menus WHERE business_id = ?").bind(businessId),
            env.DB.prepare("DELETE FROM bookmarks WHERE business_id = ?").bind(businessId),
            env.DB.prepare("DELETE FROM reviews WHERE business_id = ?").bind(businessId),
            env.DB.prepare("DELETE FROM businesses WHERE id = ?").bind(businessId)
        ];

        await env.DB.batch(batch);

        return new Response(JSON.stringify({ success: true, message: "사업체가 삭제되었습니다." }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
