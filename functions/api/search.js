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

        // 1. Search by Business Name (Whitespace insensitive)
        const byName = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b 
            LEFT JOIN churches c ON b.church_id = c.id 
            WHERE REPLACE(b.name, ' ', '') LIKE ? OR REPLACE(b.ceo_name, ' ', '') LIKE ?
            ORDER BY b.created_at DESC
        `).bind(searchTerm, searchTerm).all();

        // 2. Search by Church Name (Whitespace insensitive)
        const byChurch = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b 
            JOIN churches c ON b.church_id = c.id 
            WHERE REPLACE(c.name, ' ', '') LIKE ?
            ORDER BY b.created_at DESC
        `).bind(searchTerm).all();

        // 3. Search by Keyword (Description, Category, Keywords, OR Church Name)
        const byKeyword = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b 
            LEFT JOIN churches c ON b.church_id = c.id 
            WHERE (
                REPLACE(b.description, ' ', '') LIKE ? OR 
                REPLACE(b.category, ' ', '') LIKE ? OR 
                REPLACE(b.keywords, ' ', '') LIKE ? OR 
                REPLACE(c.name, ' ', '') LIKE ? OR
                REPLACE(b.ceo_name, ' ', '') LIKE ?
            )
            ORDER BY b.created_at DESC
        `).bind(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm).all();

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
