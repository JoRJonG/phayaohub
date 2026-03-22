// DTO สำหรับจัดการข้อมูลโพสต์ในชุมชน (Community Posts)
// จุดประสงค์เพื่อคัดกรองข้อมูลและเพิ่มข้อมูลสิทธิ์การจัดการโพสต์ตามระดับสิทธิ์ของผู้ใช้งาน

export const formatCommunityPostDTO = (post, reqUser = null) => {
    // 1. ตรวจสอบสถานะการเข้าระบบ
    const isLoggedIn = !!reqUser;
    
    // 2. ตรวจสอบว่าเป็นเจ้าของโพสต์หรือ Admin หรือไม่
    const isOwner = isLoggedIn && (reqUser.id === post.user_id || reqUser.role === 'admin');

    // 3. จัดรูปแบบข้อมูลที่จะส่งให้ Client
    const baseDTO = {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        image_url: post.image_url || null,
        status: post.status || 'active',
        created_at: post.created_at,
        view_count: post.view_count,
        comment_count: post.comment_count,
        is_favorited: !!post.is_favorited, // แปลงเป็น Boolean (ถ้ามีข้อมูล)
        author: {
            id: post.user_id,
            full_name: post.full_name || 'ผู้ใช้ไม่ระบุตัวตน',
            avatar_url: post.avatar_url || null,
        },
        permissions: {
            canEdit: isOwner,
            canDelete: isOwner
        }
    };

    return baseDTO;
};

export const formatCommunityPostsDTO = (posts, reqUser = null) => {
    return posts.map(post => formatCommunityPostDTO(post, reqUser));
};
