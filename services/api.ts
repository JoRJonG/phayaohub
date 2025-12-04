// Get API base URL from environment or use relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function for auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic fetch wrapper
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
};

// --- Public Data APIs ---

export const getFeaturedProducts = async (limit = 12) => {
    return fetchAPI(`/api/market-items?limit=${limit}`);
};

export const getFeaturedGuides = async (limit = 4) => {
    return fetchAPI(`/api/guides?limit=${limit}&sort=latest`);
};

export const getGuides = async (params: string = '') => {
    return fetchAPI(`/api/guides?${params}`);
};

export const getLatestJobs = async (limit = 10) => {
    return fetchAPI(`/api/jobs?limit=${limit}`);
};

export const getTrendingPosts = async (limit = 10) => {
    return fetchAPI(`/api/community-posts?limit=${limit}`);
};

// --- User APIs ---

export const getUserActivities = async () => {
    return fetchAPI('/api/user/activities', {
        headers: getAuthHeaders(),
    });
};

export const getUserProfile = async () => {
    return fetchAPI('/api/auth/me', {
        headers: getAuthHeaders(),
    });
};

export const updateUserProfile = async (data: any) => {
    return fetchAPI('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

export const changePassword = async (data: any) => {
    return fetchAPI('/api/auth/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

// --- Market Item APIs ---

export const getMarketItems = async (params: string = '') => {
    return fetchAPI(`/api/market-items?${params}`);
};

export const createMarketItem = async (data: any) => {
    return fetchAPI('/api/market-items', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

export const updateMarketItemStatus = async (id: number, status: string) => {
    return fetchAPI(`/api/user/market-items/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
};

export const deleteMarketItem = async (id: number) => {
    return fetchAPI(`/api/user/market-items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
};

// --- Job APIs ---

export const getJobs = async (params: string = '') => {
    return fetchAPI(`/api/jobs?${params}`);
};

export const createJob = async (data: any) => {
    return fetchAPI('/api/jobs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

export const updateJobStatus = async (id: number, status: string) => {
    return fetchAPI(`/api/user/jobs/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
};

export const deleteJob = async (id: number) => {
    return fetchAPI(`/api/user/jobs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
};

// --- Community Post APIs ---

export const getPosts = async (params: string = '') => {
    return fetchAPI(`/api/community-posts?${params}`);
};

export const createPost = async (data: any) => {
    return fetchAPI('/api/community-posts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

export const updatePostStatus = async (id: number, status: string) => {
    return fetchAPI(`/api/user/posts/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
};

export const deletePost = async (id: number) => {
    return fetchAPI(`/api/user/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
};

// --- Upload APIs ---

export const uploadSingleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Note: fetchAPI wrapper sets Content-Type to application/json by default, 
    // but for FormData we need to let the browser set it (with boundary).
    // So we use raw fetch here or modify fetchAPI to handle FormData.
    // Using raw fetch for simplicity here to avoid Content-Type conflict.
    const token = localStorage.getItem('token');
    const headers: any = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload/single`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return await response.json();
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const uploadMultipleFiles = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    const token = localStorage.getItem('token');
    const headers: any = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload/multiple`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return await response.json();
    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }
};
