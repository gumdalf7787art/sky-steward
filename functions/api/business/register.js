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
        const ceoName = formData.get("ceo_name");
        const bizNo = formData.get("biz_no");
        const category = formData.get("category");
        const phone = formData.get("phone");
        const showPhone = formData.get("show_phone") === "true" ? 1 : 0;
        const address = formData.get("address");
        const address_detail = formData.get("address_detail") || "";
        const churchId = formData.get("church_id");
        const keywords = formData.get("keywords"); // Expecting JSON string
        const description = formData.get("description");
        
        // Social Links
        const website = formData.get("website") || "";
        const youtube = formData.get("youtube") || "";
        const blog = formData.get("blog") || "";
        const instagram = formData.get("instagram") || "";

        // New Detailed Info (Advanced Info)
        const operatingHours = formData.get("operating_hours") || "";
        const parkingInfo = formData.get("parking_info") || "";

        if (!name || !bizNo || !category || !ceoName || !phone || !address) {
            return new Response(JSON.stringify({ error: "필수 항목(* 표시)을 모두 입력해주세요." }), { status: 400 });
        }

        // 1. Check if biz_no already exists
        const existing = await env.DB.prepare("SELECT id FROM businesses WHERE biz_no = ?")
            .bind(bizNo)
            .first();

        if (existing) {
            return new Response(JSON.stringify({ error: "이미 등록된 사업자번호입니다." }), { status: 400 });
        }

        // 2. Handle Image Uploads to R2
        const businessId = crypto.randomUUID();

        // 2a. Main Business Images
        const imageFiles = formData.getAll("images");
        const imageKeys = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            if (file && file.size > 0) {
                const extension = file.name ? file.name.split('.').pop() : 'jpg';
                const key = `businesses/${user.id}-${Date.now()}-main-${i}.${extension}`;
                await env.MY_BUCKET.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type || 'image/jpeg' }
                });
                imageKeys.push(key);
            }
        }

        // 2b. Menu Board Image
        const menuBoardFile = formData.get("menu_board");
        let menuBoardKey = null;
        if (menuBoardFile && menuBoardFile.size > 0) {
            const extension = menuBoardFile.name ? menuBoardFile.name.split('.').pop() : 'jpg';
            menuBoardKey = `businesses/${user.id}-${Date.now()}-menuboard.${extension}`;
            await env.MY_BUCKET.put(menuBoardKey, menuBoardFile.stream(), {
                httpMetadata: { contentType: menuBoardFile.type || 'image/jpeg' }
            });
        }

        // 3. Insert business with all fields
            INSERT INTO businesses (
                id, user_id, church_id, biz_no, name, category, address, address_detail, phone, 
                images, ceo_name, show_phone, keywords, description,
                website, youtube, blog, instagram,
                operating_hours, parking_info, menu_board_image
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            businessId, user.id, churchId || null, bizNo, name, category, address, address_detail, phone, 
            JSON.stringify(imageKeys), ceoName, showPhone, keywords || "[]", description || "",
            website, youtube, blog, instagram,
            operatingHours, parkingInfo, menuBoardKey
        ).run();

        // 4. Handle Individual Menus (Max 10)
        const menusJson = formData.get("menus");
        if (menusJson) {
            const menuItems = JSON.parse(menusJson); // [{name, price, description, hasImage}]
            const menuImageFiles = formData.getAll("menu_images");
            let imageIdx = 0;

            for (const item of menuItems) {
                let itemImageKey = null;
                if (item.hasImage && menuImageFiles[imageIdx]) {
                    const file = menuImageFiles[imageIdx];
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
