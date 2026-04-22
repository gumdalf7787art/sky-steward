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
        const denomination = formData.get("denomination");
        const address = formData.get("address");
        const address_detail = formData.get("address_detail") || "";
        const phone = formData.get("phone");
        const description = formData.get("description") || "";
        
        if (!name || !denomination || !address || !phone) {
            return new Response(JSON.stringify({ error: "필수 항목(* 표시)을 모두 입력해주세요." }), { status: 400 });
        }

        // 1. Check for duplicate address
        const existing = await env.DB.prepare("SELECT id FROM churches WHERE address = ?")
            .bind(address)
            .first();

        if (existing) {
            return new Response(JSON.stringify({ error: "이미 해당 주소로 등록된 교회가 존재합니다." }), { status: 400 });
        }

        // 2. Handle Multiple Images Upload to R2
        const imageFiles = formData.getAll("images");
        const imageKeys = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            if (file && file.size > 0) {
                const extension = file.name ? file.name.split('.').pop() : 'jpg';
                const key = `churches/${user.id}-${Date.now()}-${i}.${extension}`;
                
                await env.MY_BUCKET.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type || 'image/jpeg' }
                });
                imageKeys.push(key);
            }
        }

        const churchId = crypto.randomUUID();

        // 3. Insert Church
        // manager_name and manager_email default to current user if needed, or null
        await env.DB.prepare(`
            INSERT INTO churches (
                id, name, address, address_detail, manager_name, manager_email, 
                denomination, phone, images, description, user_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            churchId,
            name,
            address,
            address_detail,
            user.nickname, // Using registrant's nickname as manager for now
            user.email,    // Using registrant's email
            denomination,
            phone,
            JSON.stringify(imageKeys),
            description,
            user.id
        ).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "교회 등록이 완료되었습니다.",
            church_id: churchId
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
