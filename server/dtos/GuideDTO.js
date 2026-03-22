// DTO สำหรับจัดการข้อมูลคู่มือ/บทความ (Guides)

export const formatGuideDTO = (guide, reqUser = null) => {
    if (!guide) return null;

    const isLoggedIn = !!reqUser;
    const isAdmin = isLoggedIn && reqUser.role === 'admin';

    const baseDTO = {
        id: guide.id,
        title: guide.title,
        content: guide.content,
        category: guide.category,
        image_url: guide.image_url ? (guide.image_url.startsWith('http') || guide.image_url.startsWith('/') ? guide.image_url : `/${guide.image_url}`) : null,
        latitude: guide.latitude || null,
        longitude: guide.longitude || null,
        is_featured: !!guide.is_featured,
        status: guide.status || 'published',
        view_count: guide.view_count || 0,
        createdAt: guide.created_at || guide.createdAt,
        permissions: {
            canEdit: isAdmin, // Guides มักสร้างโดย Admin
            canDelete: isAdmin
        }
    };

    return baseDTO;
};

export const formatGuidesDTO = (guides, reqUser = null) => {
    return guides.map(guide => formatGuideDTO(guide, reqUser));
};
