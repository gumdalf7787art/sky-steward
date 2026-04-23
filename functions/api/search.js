export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get('q');

        if (!query || query.trim().length === 0) {
            return new Response(JSON.stringify({ 
                success: true, 
                byName: [], 
                byChurch: [], 
                byKeyword: [] 
            }), { status: 200 });
        }

        const strippedQuery = query.replace(/\s+/g, '');
        const searchTerm = `%${strippedQuery}%`;

        // optional: get userId from token
        let userId = null;
        const authHeader = request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const { verifyJWT } = await import("../utils/jwt");
            const user = await verifyJWT(authHeader.split(" ")[1]);
            if (user) userId = user.id;
        }

        // 1. Search by Business Name (Whitespace insensitive)
        const byName = await env.DB.prepare(`
            SELECT b.*, c.name as church_name, 
                   (SELECT 1 FROM bookmarks WHERE user_id = ? AND business_id = b.id) as isBookmarked
            FROM businesses b 
            LEFT JOIN churches c ON b.church_id = c.id 
            WHERE REPLACE(b.name, ' ', '') LIKE ? OR REPLACE(b.ceo_name, ' ', '') LIKE ?
            ORDER BY b.created_at DESC
        `).bind(userId, searchTerm, searchTerm).all();

        // 2. Search by Church Name (Whitespace insensitive)
        const byChurch = await env.DB.prepare(`
            SELECT b.*, c.name as church_name,
                   (SELECT 1 FROM bookmarks WHERE user_id = ? AND business_id = b.id) as isBookmarked
            FROM businesses b 
            JOIN churches c ON b.church_id = c.id 
            WHERE REPLACE(c.name, ' ', '') LIKE ?
            ORDER BY b.created_at DESC
        `).bind(userId, searchTerm).all();

        // 3. Search by Keyword (Description, Category, Keywords, OR Church Name)
        const byKeyword = await env.DB.prepare(`
            SELECT b.*, c.name as church_name,
                   (SELECT 1 FROM bookmarks WHERE user_id = ? AND business_id = b.id) as isBookmarked
            FROM businesses b 
            LEFT JOIN churches c ON b.church_id = c.id 
            WHERE (
                REPLACE(b.description, ' ', '') LIKE ? OR 
                REPLACE(b.category, ' ', '') LIKE ? OR 
                REPLACE(b.keywords, ' ', '') LIKE ? OR 
                REPLACE(b.ceo_name, ' ', '') LIKE ?
            )
            ORDER BY b.created_at DESC
        `).bind(userId, searchTerm, searchTerm, searchTerm, searchTerm).all();

        // 4. Search Churches themselves (Whitespace insensitive)
        const byChurchList = await env.DB.prepare(`
            SELECT * FROM churches 
            WHERE REPLACE(name, ' ', '') LIKE ?
            ORDER BY created_at DESC
        `).bind(searchTerm).all();

        return new Response(JSON.stringify({
            success: true,
            results: {
                byName: byName.results,
                byChurch: byChurch.results,
                byKeyword: byKeyword.results,
                byChurchList: byChurchList.results,
                total: byName.results.length + byChurch.results.length + byKeyword.results.length + byChurchList.results.length
            }
        }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
