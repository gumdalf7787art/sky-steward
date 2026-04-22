import { verifyJWT } from "../../utils/jwt";

export async function onRequestGet(context) {
    const { request, env, params } = context;
    const businessId = params.id;

    if (!businessId) {
        return new Response(JSON.stringify({ error: "사업체 ID가 필요합니다." }), { status: 400 });
    }

    try {
        // 1. Fetch Business & Church Info
        const business = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b
            LEFT JOIN churches c ON b.church_id = c.id
            WHERE b.id = ?
        `).bind(businessId).first();

        if (!business) {
            return new Response(JSON.stringify({ error: "사업체를 찾을 수 없습니다." }), { status: 404 });
        }

        // 2. Fetch Menus
        const menus = await env.DB.prepare(`
            SELECT * FROM menus WHERE business_id = ? ORDER BY created_at ASC
        `).bind(businessId).all();

        // 3. Fetch Reviews
        const reviews = await env.DB.prepare(`
            SELECT r.*, u.nickname as user_nickname, u.profile_image as user_image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.business_id = ?
            ORDER BY r.created_at DESC
        `).bind(businessId).all();

        // Calculate Average Rating
        const ratingStats = await env.DB.prepare(`
            SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
            FROM reviews
            WHERE business_id = ?
        `).bind(businessId).first();

        return new Response(JSON.stringify({
            success: true,
            business,
            menus: menus.results,
            reviews: reviews.results,
            stats: {
                avgRating: ratingStats.avg_rating || 0,
                reviewCount: ratingStats.review_count || 0
            }
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
