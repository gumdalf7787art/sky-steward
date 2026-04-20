export async function onRequestGet(context) {
    const { env } = context;

    try {
        const { results } = await env.DB.prepare("SELECT id, name FROM churches ORDER BY name ASC").all();

        return new Response(JSON.stringify({ churches: results }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
