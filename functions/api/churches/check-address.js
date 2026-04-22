export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const { address } = await request.json();
        
        if (!address) {
            return new Response(JSON.stringify({ error: "주소가 누락되었습니다." }), { status: 400 });
        }

        const existing = await env.DB.prepare("SELECT id, name FROM churches WHERE address = ?")
            .bind(address)
            .first();

        return new Response(JSON.stringify({ 
            isDuplicate: !!existing,
            churchName: existing ? existing.name : null
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
