export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Fetch 6 random businesses with church names
        const { results } = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b
            LEFT JOIN churches c ON b.church_id = c.id
            ORDER BY RANDOM()
            LIMIT 6
        `).all();

        return new Response(JSON.stringify({ 
            success: true, 
            businesses: results 
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
