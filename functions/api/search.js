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

        const searchTerm = `%${query}%`;

        // 1. Search by Business Name
        const byName = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b 
            LEFT JOIN churches c ON b.church_id = c.id 
            WHERE b.name LIKE ?
            ORDER BY b.created_at DESC
        `).bind(searchTerm).all();

        // 2. Search by Church Name
        const byChurch = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b 
            JOIN churches c ON b.church_id = c.id 
            WHERE c.name LIKE ?
            ORDER BY b.created_at DESC
        `).bind(searchTerm).all();

        // 3. Search by Keyword (Description, Category, Keywords, OR Church Name)
        const byKeyword = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b 
            LEFT JOIN churches c ON b.church_id = c.id 
            WHERE (b.description LIKE ? OR b.category LIKE ? OR b.keywords LIKE ? OR c.name LIKE ?)
            ORDER BY b.created_at DESC
        `).bind(searchTerm, searchTerm, searchTerm, searchTerm).all();

        return new Response(JSON.stringify({
            success: true,
            results: {
                byName: byName.results,
                byChurch: byChurch.results,
                byKeyword: byKeyword.results,
                total: byName.results.length + byChurch.results.length + byKeyword.results.length
            }
        }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
