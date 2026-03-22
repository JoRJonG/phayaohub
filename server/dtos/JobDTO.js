// DTO สำหรับจัดการข้อมูลประกาศงาน (Jobs)
// จุดประสงค์เพื่อคัดกรองข้อมูลที่จะส่งกลับไปยัง Client ตามระดับสิทธิ์ของผู้ใช้งาน (ผู้เยี่ยมชม, ผู้ใช้ที่เข้าระบบ, เจ้าของประกาศ)

export const formatJobDTO = (job, reqUser = null) => {
    // 1. ตรวจสอบสถานะการเข้าระบบ
    const isLoggedIn = !!reqUser;
    
    // 2. ตรวจสอบว่าเป็นเจ้าของโพสต์หรือ Admin หรือไม่
    const isOwner = isLoggedIn && (reqUser.id === job.user_id || reqUser.role === 'admin');

    // 3. กำหนดข้อมูลพื้นฐานที่จะเปิดเผยให้ทุกคนเห็นได้
    const baseDTO = {
        id: job.id,
        category: {
            id: job.category_id,
            name: job.category_name,
            slug: job.category_slug,
        },
        title: job.title,
        company_name: job.company_name,
        description: job.description,
        job_type: job.job_type,
        salary: {
            min: job.salary_min,
            max: job.salary_max,
            type: job.salary_type,
        },
        location: job.location,
        requirements: job.requirements || null,
        benefits: job.benefits || null,
        status: job.status || 'open',
        created_at: job.created_at,
        view_count: job.view_count,
        poster: {
            id: job.user_id,
            full_name: job.poster_full_name || null,
        },
        permissions: {
            canEdit: isOwner,
            canDelete: isOwner
        }
    };

    // 4. กรณีที่เข้าระบบแล้ว จะสามารถดูข้อมูลติดต่อได้ (หรือถ้าเป็นเจ้าของก็ดูได้)
    if (isLoggedIn || isOwner) {
        // Only include contact fields if they were fetched in the SQL query
        baseDTO.contact = {
            email: job.contact_email !== undefined ? job.contact_email : null,
            phone: job.contact_phone !== undefined ? job.contact_phone : null,
            line: job.contact_line !== undefined ? job.contact_line : null
        };
    } else {
        baseDTO.contact = null; // ซ่อนข้อมูลติดต่อสำหรับผู้ที่ไม่ได้เข้าระบบ
    }

    return baseDTO;
};

export const formatJobsDTO = (jobs, reqUser = null) => {
    return jobs.map(job => formatJobDTO(job, reqUser));
};
