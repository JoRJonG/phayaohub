// DTO สำหรับจัดการข้อมูลรูปแบบโปรไฟล์จัดหางาน (Job Profiles)
// คัดกรองข้อมูลส่วนตัวและข้อมูลติดต่อสำหรับผู้เยี่ยมชมทั่วไป

export const formatJobProfileDTO = (profile, reqUser = null) => {
    if (!profile) return null;

    const isLoggedIn = !!reqUser;
    const isOwner = isLoggedIn && (reqUser.id === profile.user_id || reqUser.role === 'admin');

    const baseDTO = {
        id: profile.id,
        // ซ่อนชื่อเต็มหรือแสดงแค่ตัวย่อถ้าไม่ได้ login (หรือขึ้นอยู่กับ business logic โน่นนี่นั่น)
        // เพื่อความเรียบง่าย จะแสดง full_name แต่ซ่อน contact info ไว้
        full_name: profile.full_name,
        photo_url: profile.photo_url || null,
        experience: profile.experience || null,
        education: profile.education || null,
        skills: profile.skills || null,
        view_count: profile.view_count || 0,
        createdAt: profile.created_at || profile.createdAt,
        permissions: {
            canEdit: isOwner,
            canDelete: isOwner
        }
    };

    // แสดงข้อมูลติดต่อเฉพาะเมื่อเข้าสู่ระบบแล้ว
    if (isLoggedIn) {
        baseDTO.contact = {
            email: profile.email || null,
            phone: profile.phone || null,
            address: profile.address || null,
        };
        // แสดง resume เฉพาะคนที่เข้าสู่ระบบ
        baseDTO.resume_url = profile.resume_url || null;
    } else {
        baseDTO.contact = null;
        baseDTO.resume_url = null;
    }

    return baseDTO;
};

export const formatJobProfilesDTO = (profiles, reqUser = null) => {
    return profiles.map(profile => formatJobProfileDTO(profile, reqUser));
};
