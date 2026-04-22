import { verifyJWT } from "../../utils/jwt";

export async function onRequestGet(context) {
    const { request, env, params } = context;
    const churchId = params.id;

    try {
        const church = await env.DB.prepare("SELECT * FROM churches WHERE id = ?")
            .bind(churchId)
            .first();

        if (!church) {
            return new Response(JSON.stringify({ error: "교회를 찾을 수 없습니다." }), { status: 404 });
        }

        // Fetch businesses belonging to this church
        const businesses = await env.DB.prepare(`
            SELECT b.*, c.name as church_name 
            FROM businesses b 
            LEFT JOIN churches c ON b.church_id = c.id 
            WHERE b.church_id = ?
            ORDER BY b.created_at DESC
        `).bind(churchId).all();

        return new Response(JSON.stringify({ 
            success: true, 
            church,
            businesses: businesses.results 
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestPut(context) {
    const { request, env, params } = context;
    const churchId = params.id;
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
        const existingImagesJson = formData.get("existing_images") || "[]";
        
        // Check ownership
        const original = await env.DB.prepare("SELECT user_id FROM churches WHERE id = ?")
            .bind(churchId)
            .first();
            
        if (!original || original.user_id !== user.id) {
            return new Response(JSON.stringify({ error: "수정 권한이 없습니다." }), { status: 403 });
        }

        let imageKeys = JSON.parse(existingImagesJson);

        // Handle New Images Upload
        const newImageFiles = formData.getAll("new_images");
        for (let i = 0; i < newImageFiles.length; i++) {
            const file = newImageFiles[i];
            if (file && file.size > 0) {
                const extension = file.name ? file.name.split('.').pop() : 'jpg';
                const key = `churches/${user.id}-${Date.now()}-update-${i}.${extension}`;
                await env.MY_BUCKET.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type || 'image/jpeg' }
                });
                imageKeys.push(key);
            }
        }

        // Update Church
        await env.DB.prepare(`
            UPDATE churches 
            SET name = ?, denomination = ?, address = ?, address_detail = ?, phone = ?, description = ?, images = ?
            WHERE id = ? AND user_id = ?
        `).bind(
            name, denomination, address, address_detail, phone, description, JSON.stringify(imageKeys),
            churchId, user.id
        ).run();

        return new Response(JSON.stringify({ success: true, message: "교회 정보가 성공적으로 수정되었습니다." }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const churchId = params.id;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyJWT(token);

    try {
        // Check ownership before delete
        const original = await env.DB.prepare("SELECT user_id, images FROM churches WHERE id = ?")
            .bind(churchId)
            .first();
            
        if (!original || original.user_id !== user.id) {
            return new Response(JSON.stringify({ error: "삭제 권한이 없습니다." }), { status: 403 });
        }

        // Potential: Delete images from R2? 
        // For now, simple DB delete to be safe
        await env.DB.prepare("DELETE FROM churches WHERE id = ? AND user_id = ?")
            .bind(churchId, user.id)
            .run();

        return new Response(JSON.stringify({ success: true, message: "교회가 성공적으로 삭제되었습니다." }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
