import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Heart, Share2, User, Clock, Send, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
    id: number;
    content: string;
    username: string;
    full_name: string;
    avatar_url: string;
    created_at: string;
}

interface Post {
    id: number;
    title: string;
    content: string;
    category: string;
    image_url?: string;
    username: string;
    full_name: string;
    avatar_url: string;
    like_count: number;
    comment_count: number;
    view_count: number;
    created_at: string;
}

const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        fetchPostDetail();
        fetchComments();
        if (isAuthenticated) {
            fetchFavoriteStatus();
        }
    }, [id, isAuthenticated]);

    const fetchPostDetail = async () => {
        try {
            const response = await fetch(`/api/community-posts/${id}`);
            const data = await response.json();
            if (data.success) {
                setPost(data.data);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/community-posts/${id}/comments`);
            const data = await response.json();
            if (data.success) {
                setComments(data.data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const fetchFavoriteStatus = async () => {
        try {
            const response = await fetch(`/api/user/favorites/post/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setIsFavorited(data.isFavorited);
            }
        } catch (error) {
            console.error('Error fetching favorite status:', error);
        }
    };

    const toggleFavorite = async () => {
        if (!isAuthenticated) {
            alert('กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด');
            return;
        }

        // Optimistic update
        const newIsFavorited = !isFavorited;
        setIsFavorited(newIsFavorited);
        if (post) {
            setPost({
                ...post,
                like_count: newIsFavorited ? post.like_count + 1 : Math.max(post.like_count - 1, 0)
            });
        }

        try {
            const response = await fetch('/api/user/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ item_type: 'post', item_id: id })
            });
            const data = await response.json();
            if (!data.success) {
                // Revert if failed
                setIsFavorited(!newIsFavorited);
                if (post) {
                    setPost({
                        ...post,
                        like_count: !newIsFavorited ? post.like_count + 1 : Math.max(post.like_count - 1, 0)
                    });
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert if error
            setIsFavorited(!newIsFavorited);
            if (post) {
                setPost({
                    ...post,
                    like_count: !newIsFavorited ? post.like_count + 1 : Math.max(post.like_count - 1, 0)
                });
            }
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        // Basic client-side validation for scripts/HTML
        const dangerousPattern = /<[^>]*>/;
        if (dangerousPattern.test(newComment)) {
            alert('ไม่อนุญาตให้ใช้ HTML tags หรือ Script ในความคิดเห็น');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/community-posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: newComment })
            });

            const data = await response.json();
            if (data.success) {
                setNewComment('');
                fetchComments(); // Refresh comments
                // Update comment count locally
                if (post) {
                    setPost({ ...post, comment_count: post.comment_count + 1 });
                }
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phayao-blue"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">ไม่พบโพสต์</p>
                    <button onClick={() => navigate('/community')} className="text-phayao-blue hover:underline">
                        กลับไปหน้าชุมชน
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/community')}
                    className="flex items-center gap-2 text-slate-600 hover:text-phayao-blue mb-6 transition"
                >
                    <ArrowLeft size={20} />
                    <span>กลับไปหน้าชุมชน</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Post Card */}
                        <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                        {post.avatar_url ? (
                                            <img src={post.avatar_url} alt={post.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-slate-400" size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{post.full_name || 'ผู้ใช้งาน'}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDate(post.created_at)}
                                        </div>
                                    </div>
                                    {post.category && (
                                        <span className="ml-auto px-3 py-1 bg-blue-50 text-phayao-blue text-sm font-medium rounded-full">
                                            {post.category}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <h1 className="text-2xl font-bold text-slate-900 mb-4">{post.title}</h1>
                                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line mb-6">
                                    {post.content}
                                </div>

                                {/* Image */}
                                {post.image_url && (
                                    <div className="mb-6 rounded-lg overflow-hidden">
                                        <img src={post.image_url} alt={post.title} className="w-full h-auto object-cover" />
                                    </div>
                                )}

                                {/* Footer Stats */}
                                <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={toggleFavorite}
                                            className={`flex items-center gap-1 transition ${isFavorited ? 'text-red-500' : 'hover:text-red-500'}`}
                                        >
                                            <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                                            <span>{post.like_count} ถูกใจ</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={20} />
                                        <span>{post.comment_count} ความคิดเห็น</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye size={20} />
                                        <span>{post.view_count || 0} ครั้ง</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 cursor-pointer hover:text-phayao-blue transition">
                                        <Share2 size={20} />
                                        <span>แชร์</span>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Comments Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MessageSquare size={20} className="text-phayao-blue" />
                                ความคิดเห็น ({comments.length})
                            </h3>

                            {/* Comment List */}
                            <div className="space-y-6 mb-8">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {comment.avatar_url ? (
                                                    <img src={comment.avatar_url} alt={comment.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="text-slate-400" size={20} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-slate-50 rounded-2xl rounded-tl-none p-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-semibold text-slate-900">{comment.full_name || 'ผู้ใช้งาน'}</span>
                                                        <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                                                    </div>
                                                    <p className="text-slate-700 whitespace-pre-line">{comment.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น!
                                    </div>
                                )}
                            </div>

                            {/* Comment Form */}
                            {isAuthenticated ? (
                                <form onSubmit={handleSubmitComment} className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-slate-400" size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="แสดงความคิดเห็น..."
                                            className="w-full p-4 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:border-phayao-blue focus:ring-1 focus:ring-phayao-blue resize-none h-24"
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || isSubmitting}
                                            className="absolute bottom-3 right-3 p-2 bg-phayao-blue text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-6 text-center">
                                    <p className="text-slate-600 mb-4">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
                                    >
                                        เข้าสู่ระบบ
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Rules Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4">กฎกติกาชุมชน</h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-2">
                                    <span className="text-phayao-blue">•</span>
                                    ใช้ถ้อยคำสุภาพ ไม่หยาบคาย
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-phayao-blue">•</span>
                                    ไม่โพสต์เนื้อหาที่ผิดกฎหมาย
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-phayao-blue">•</span>
                                    ไม่ก่อให้เกิดความขัดแย้ง
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-phayao-blue">•</span>
                                    เคารพความคิดเห็นผู้อื่น
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
