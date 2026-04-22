export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const categoryId = url.searchParams.get('id');

        if (!categoryId) {
            return new Response(JSON.stringify({ error: "Category ID is required" }), { status: 400 });
        }

        // Fetch businesses in the category with their church names
        const { results } = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b 
            LEFT JOIN churches c ON b.church_id = c.id 
            WHERE b.category = ?
            ORDER BY b.created_at DESC
        `).bind(categoryId).all();

        // Parse keywords and images for each business
        const formattedResults = results.map(biz => ({
            ...biz,
            keywords: biz.keywords ? JSON.parse(biz.keywords) : [],
            images: biz.images ? JSON.parse(biz.images) : []
        }));

        return new Response(JSON.stringify({
            success: true,
            businesses: formattedResults
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
