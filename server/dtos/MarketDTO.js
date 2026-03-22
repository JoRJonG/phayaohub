// DTO สำหรับจัดการข้อมูลสินค้าในตลาด (Market Items)
// จุดประสงค์เพื่อคัดกรองข้อมูลที่จะส่งกลับไปยัง Client ตามระดับสิทธิ์ของผู้ใช้งาน (ผู้เยี่ยมชม, ผู้ใช้ที่เข้าระบบ, เจ้าของโพสต์)

export const formatMarketItemDTO = (item, reqUser = null) => {
    // 1. ตรวจสอบสถานะการเข้าระบบ
    const isLoggedIn = !!reqUser;
    
    // 2. ตรวจสอบว่าเป็นเจ้าของโพสต์หรือ Admin หรือไม่
    const isOwner = isLoggedIn && (reqUser.id === item.user_id || reqUser.role === 'admin');

    // 3. กำหนดข้อมูลพื้นฐานที่จะเปิดเผยให้ทุกคนเห็นได้
    const baseDTO = {
        id: item.id,
        category: {
            id: item.category_id,
            name: item.category_name,
            slug: item.category_slug,
        },
        title: item.title,
        description: item.description,
        price: item.price,
        condition_type: item.condition_type,
        location: item.location,
        status: item.status,
        created_at: item.created_at,
        view_count: item.view_count,
        primary_image: item.primary_image || null,
        seller: {
            id: item.user_id,
            full_name: item.seller_full_name,
        },
        permissions: {
            canEdit: isOwner,
            canDelete: isOwner
        }
    };

    // 4. กรณีที่เข้าระบบแล้ว จะสามารถดูข้อมูลติดต่อได้ (หรือถ้าเป็นเจ้าของก็ดูได้)
    if (isLoggedIn || isOwner) {
        baseDTO.contact = {
            phone: item.contact_phone || null,
            line: item.contact_line || null
        };
    } else {
        baseDTO.contact = null; // ซ่อนข้อมูลติดต่อสำหรับผู้ที่ไม่ได้เข้าระบบ
    }

    return baseDTO;
};

export const formatMarketItemsDTO = (items, reqUser = null) => {
    return items.map(item => formatMarketItemDTO(item, reqUser));
};
