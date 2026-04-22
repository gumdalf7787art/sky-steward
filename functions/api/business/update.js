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
        const businessId = formData.get("id");
        
        if (!businessId) {
            return new Response(JSON.stringify({ error: "사업체 ID가 누락되었습니다." }), { status: 400 });
        }

        // Check ownership
        const existingRecord = await env.DB.prepare("SELECT user_id FROM businesses WHERE id = ?")
            .bind(businessId)
            .first();

        if (!existingRecord) {
            return new Response(JSON.stringify({ error: "사업체를 찾을 수 없습니다." }), { status: 404 });
        }

        if (existingRecord.user_id !== user.id) {
            return new Response(JSON.stringify({ error: "본인의 사업체만 수정할 수 있습니다." }), { status: 403 });
        }

        const name = formData.get("name");
        const ceoName = formData.get("ceo_name");
        const bizNo = formData.get("biz_no");
        const category = formData.get("category");
        const phone = formData.get("phone");
        const showPhone = formData.get("show_phone") === "true" ? 1 : 0;
        const address = formData.get("address");
        const churchId = formData.get("church_id");
        const keywords = formData.get("keywords");
        const description = formData.get("description");
        
        const website = formData.get("website") || "";
        const youtube = formData.get("youtube") || "";
        const blog = formData.get("blog") || "";
        const instagram = formData.get("instagram") || "";

        if (!name || !bizNo || !category || !ceoName || !phone || !address) {
            return new Response(JSON.stringify({ error: "필수 항목(* 표시)을 모두 입력해주세요." }), { status: 400 });
        }

        // Handle Images
        // existing_images_json should be an array of keys that the user wants to KEEP
        const existingImagesJson = formData.get("existing_images") || "[]";
        let finalImageKeys = JSON.parse(existingImagesJson);

        // Upload NEW images
        const newImageFiles = formData.getAll("new_images");
        for (let i = 0; i < newImageFiles.length; i++) {
            const file = newImageFiles[i];
            if (file && file.size > 0) {
                const extension = file.name ? file.name.split('.').pop() : 'jpg';
                const key = `businesses/${user.id}-${Date.now()}-${i}.${extension}`;
                
                await env.MY_BUCKET.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type || 'image/jpeg' }
                });
                finalImageKeys.push(key);
            }
        }

        // Final Representative Image handling (the frontend should have ordered them appropriately or we just take the first)
        // If the user reordered, finalImageKeys should already be in the correct order.

        await env.DB.prepare(`
            UPDATE businesses SET
                church_id = ?, biz_no = ?, name = ?, category = ?, address = ?, phone = ?, 
                images = ?, ceo_name = ?, show_phone = ?, keywords = ?, description = ?,
                website = ?, youtube = ?, blog = ?, instagram = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `).bind(
            churchId || null, 
            bizNo, 
            name, 
            category, 
            address, 
            phone, 
            JSON.stringify(finalImageKeys),
            ceoName,
            showPhone,
            keywords || "[]",
            description || "",
            website,
            youtube,
            blog,
            instagram,
            businessId,
            user.id
        ).run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "사업체 정보가 수정되었습니다."
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
