export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const bizNo = url.searchParams.get("biz_no");

        if (!bizNo) {
            return new Response(JSON.stringify({ error: "사업자등록번호를 입력해주세요." }), { status: 400 });
        }

        const existing = await env.DB.prepare("SELECT id, name FROM businesses WHERE biz_no = ?")
            .bind(bizNo)
            .first();

        if (existing) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: `이미 가입된 번호입니다. (${existing.name})` 
            }), { status: 200 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "사용 가능한 사업자등록번호입니다." 
        }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
