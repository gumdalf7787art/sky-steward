import { verifyJWT } from "../../utils/jwt";

export async function onRequestPost(context) {
    const { request, env } = context;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyJWT(token);

    if (!user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    try {
        const formData = await request.formData();
        const name = formData.get("name");
        const bizNo = formData.get("biz_no");
        const category = formData.get("category");
        const phone = formData.get("phone");
        const address = formData.get("address");
        const churchId = formData.get("church_id");
        const imageFile = formData.get("image"); // This should be a File object

        if (!name || !bizNo || !category) {
            return new Response(JSON.stringify({ error: "필수 항목을 입력해주세요." }), { status: 400 });
        }

        // 1. Check if biz_no already exists
        const existing = await env.DB.prepare("SELECT id FROM businesses WHERE biz_no = ?")
            .bind(bizNo)
            .first();

        if (existing) {
            return new Response(JSON.stringify({ error: "이미 등록된 사업자번호입니다." }), { status: 400 });
        }

        // 2. Handle Image Upload to R2 if exists
        let imageKey = null;
        if (imageFile && imageFile.size > 0) {
            const extension = imageFile.name.split('.').pop();
            imageKey = `businesses/${user.id}-${Date.now()}.${extension}`;
            
            await env.MY_BUCKET.put(imageKey, imageFile.stream(), {
                httpMetadata: { contentType: imageFile.type }
            });
        }

        const businessId = crypto.randomUUID();

        // 3. Start Transaction-like sequence (D1 doesn't support full multi-statement transactions in all environments easily via bind, so we do sequential)
        // First insert business
        await env.DB.prepare(`
            INSERT INTO businesses (id, user_id, church_id, biz_no, name, category, address, phone, images)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            businessId, 
            user.id, 
            churchId || null, 
            bizNo, 
            name, 
            category, 
            address || "", 
            phone || "", 
            JSON.stringify(imageKey ? [imageKey] : [])
        ).run();

        // Then update user role
        await env.DB.prepare("UPDATE users SET role = 'BIZ' WHERE id = ?")
            .bind(user.id)
            .run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "사업체 등록이 완료되었습니다.",
            business_id: businessId
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
