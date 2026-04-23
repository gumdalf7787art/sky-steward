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
        const existingRecord = await env.DB.prepare("SELECT user_id, images, menu_board_image FROM businesses WHERE id = ?")
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
        const address_detail = formData.get("address_detail") || "";
        const churchId = formData.get("church_id");
        const keywords = formData.get("keywords");
        const description = formData.get("description");
        
        const website = formData.get("website") || "";
        const youtube = formData.get("youtube") || "";
        const blog = formData.get("blog") || "";
        const instagram = formData.get("instagram") || "";

        // Advanced Info
        const operatingHours = formData.get("operating_hours") || "";
        const parkingInfo = formData.get("parking_info") || "";

        if (!name || !bizNo || !category || !ceoName || !phone || !address) {
            return new Response(JSON.stringify({ error: "필수 항목(* 표시)을 모두 입력해주세요." }), { status: 400 });
        }

        // 1. Handle Main Images
        const existingImagesJson = formData.get("existing_images") || "[]";
        let finalImageKeys = JSON.parse(existingImagesJson); // [key1, key2, ...]

        const newImageFiles = formData.getAll("new_images");
        for (let i = 0; i < newImageFiles.length; i++) {
            const file = newImageFiles[i];
            if (file && file.size > 0) {
                const extension = file.name ? file.name.split('.').pop() : 'jpg';
                const key = `businesses/${user.id}-${Date.now()}-main-${i}.${extension}`;
                await env.MY_BUCKET.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type || 'image/jpeg' }
                });
                finalImageKeys.push(key);
            }
        }

        // 2. Handle Menu Board Image
        let menuBoardKey = formData.get("existing_menu_board"); // Use existing if not changed
        const newMenuBoardFile = formData.get("new_menu_board");
        if (newMenuBoardFile && newMenuBoardFile.size > 0) {
            const extension = newMenuBoardFile.name ? newMenuBoardFile.name.split('.').pop() : 'jpg';
            menuBoardKey = `businesses/${user.id}-${Date.now()}-menuboard.${extension}`;
            await env.MY_BUCKET.put(menuBoardKey, newMenuBoardFile.stream(), {
                httpMetadata: { contentType: newMenuBoardFile.type || 'image/jpeg' }
            });
        } else if (formData.get("remove_menu_board") === "true") {
            menuBoardKey = null;
        }

        // 3. Update Business table
        await env.DB.prepare(`
            UPDATE businesses SET
                church_id = ?, biz_no = ?, name = ?, category = ?, address = ?, address_detail = ?, phone = ?, 
                images = ?, ceo_name = ?, show_phone = ?, keywords = ?, description = ?,
                website = ?, youtube = ?, blog = ?, instagram = ?,
                operating_hours = ?, parking_info = ?, menu_board_image = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `).bind(
            churchId || null, bizNo, name, category, address, address_detail, phone, 
            JSON.stringify(finalImageKeys), ceoName, showPhone, keywords || "[]", description || "",
            website, youtube, blog, instagram,
            operatingHours, parkingInfo, menuBoardKey,
            businessId, user.id
        ).run();

        // 4. Handle Menus (Delete current and re-insert)
        const menusJson = formData.get("menus");
        if (menusJson) {
            // First, delete current menus
            await env.DB.prepare("DELETE FROM menus WHERE business_id = ?").bind(businessId).run();

            const menuItems = JSON.parse(menusJson); // [{id?, name, price, description, hasImage, isExisting, existingKey}]
            const newMenuImages = formData.getAll("menu_images");
            let imageIdx = 0;

            for (const item of menuItems) {
                let itemImageKey = item.existingKey || null;

                if (item.hasImage && !item.isExisting && newMenuImages[imageIdx]) {
                    const file = newMenuImages[imageIdx];
                    const extension = file.name ? file.name.split('.').pop() : 'jpg';
                    itemImageKey = `menus/${businessId}-${Date.now()}-${imageIdx}.${extension}`;
                    await env.MY_BUCKET.put(itemImageKey, file.stream(), {
                        httpMetadata: { contentType: file.type || 'image/jpeg' }
                    });
                    imageIdx++;
                }

                await env.DB.prepare(`
                    INSERT INTO menus (id, business_id, name, price, description, image_key)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).bind(
                    crypto.randomUUID(), businessId, item.name, item.price || "", 
                    item.description || "", itemImageKey
                ).run();
            }
        }

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
