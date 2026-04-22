export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get("q");

        if (!query || query.length < 2) {
            return new Response(JSON.stringify({ churches: [] }), { status: 200 });
        }

        // Search churches by name or address
        const churches = await env.DB.prepare(
            "SELECT id, name, address FROM churches WHERE name LIKE ? OR address LIKE ? LIMIT 20"
        )
        .bind(`%${query}%`, `%${query}%`)
        .all();

        return new Response(JSON.stringify({ 
            success: true, 
            churches: churches.results 
        }), { 
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
