// DTO สำหรับจัดการข้อมูลผู้ใช้งาน (Users)
// จุดประสงค์เพื่อคัดกรองข้อมูลผู้ใช้ ป้องกันไม่ให้ส่ง password_hash หรือข้อมูลที่ละเอียดอ่อนออกไป

export const formatUserDTO = (user) => {
    // ถ้าไม่มีข้อมูล ให้คืนค่า null
    if (!user) return null;

    return {
        id: user.id || user.userId, // รองรับทั้งสองชื่อฟิลด์ขึ้นอยู่กับ JWT หรือ DB
        username: user.username,
        email: user.email,
        full_name: user.full_name || null,
        phone: user.phone || null,
        avatar_url: user.avatar_url || null,
        role: user.role || 'user',
        status: user.status || 'active',
        created_at: user.created_at || undefined
    };
};
