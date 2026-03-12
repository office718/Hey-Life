
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, SmilePlus } from 'lucide-react';
import { Post, User, Comment } from '../types';
import { addCommentToPost, updatePostReaction } from '../services/firebaseService';

interface FeedInteractionBarProps {
    post: Post;
    currentUser: User;
}

const REACTIONS = ['🙌', '🙏', '❤️', '🔥', '💪', '✨'];

export const FeedInteractionBar: React.FC<FeedInteractionBarProps> = ({ post, currentUser }) => {
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    
    // Local state for optimistic updates
    const [localReactions, setLocalReactions] = useState<{ [key: string]: number }>(post.reactions || {});
    const [userReacted, setUserReacted] = useState<{ [key: string]: boolean }>(post.userReactions?.[currentUser.id] || {});
    const [localComments, setLocalComments] = useState<Comment[]>(post.comments || []);

    // Sync local state when post prop changes (from real-time listener)
    useEffect(() => {
        setLocalReactions(post.reactions || {});
        setUserReacted(post.userReactions?.[currentUser.id] || {});
        setLocalComments(post.comments || []);
    }, [post.reactions, post.userReactions, post.comments, currentUser.id]);

    const handleReaction = async (emoji: string) => {
        const alreadyReacted = userReacted[emoji];
        const change = alreadyReacted ? -1 : 1;

        // 1. Local Optimistic Update
        setLocalReactions(prev => ({
            ...prev,
            [emoji]: Math.max(0, (prev[emoji] || 0) + change)
        }));
        setUserReacted(prev => ({ ...prev, [emoji]: !alreadyReacted }));
        setIsEmojiPickerOpen(false);

        // 2. Database Sync
        try {
            await updatePostReaction(post.id, emoji, change, currentUser.id);
        } catch (err) {
            console.error("Failed to sync reaction", err);
            // Rollback on failure
            setLocalReactions(prev => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] || 0) - change) }));
            setUserReacted(prev => ({ ...prev, [emoji]: alreadyReacted }));
        }
    };

    const handleSendComment = async (parentId?: string) => {
        const text = commentText.trim();
        if (!text) return;

        const newComment: Comment = {
            id: Math.random().toString(36).substring(2, 15),
            user: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar
            },
            text,
            timestamp: new Date().toISOString(),
            parentId: parentId || undefined
        };

        const tempCommentText = commentText;
        const previousComments = [...localComments];
        
        // Optimistic update for comments
        setLocalComments(prev => [...prev, newComment]);
        setCommentText('');
        setReplyingTo(null);

        try {
            await addCommentToPost(post.id, newComment);
        } catch (err) {
            console.error("Failed to add comment", err);
            setCommentText(tempCommentText);
            setLocalComments(previousComments);
            alert("Failed to post comment.");
        }
    };

    const renderComments = (parentId?: string, depth = 0) => {
        const filtered = localComments.filter(c => c.parentId === parentId);
        if (filtered.length === 0) return null;

        return (
            <div className={`space-y-3 ${depth > 0 ? 'ml-6 mt-2 border-l-2 border-gray-700/30 pl-3' : ''}`}>
                {filtered.map((comment) => (
                    <div key={comment.id} className="group">
                        <div className="flex items-start space-x-2 text-xs">
                            <img src={comment.user.avatar} className="w-6 h-6 rounded-full object-cover mt-0.5" alt={comment.user.name} />
                            <div className="flex-grow">
                                <div className="bg-gray-800/50 rounded-2xl px-3 py-2 inline-block max-w-full">
                                    <span className="font-bold text-hey-church-orange-300 mr-1.5 block sm:inline">{comment.user.name}</span>
                                    <span className="text-gray-300 break-words">{comment.text}</span>
                                </div>
                                <div className="flex items-center space-x-3 mt-1 ml-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    <button 
                                        onClick={() => {
                                            setReplyingTo(comment.id);
                                            setIsCommentOpen(true);
                                            setCommentText(`@${comment.user.name} `);
                                        }}
                                        className="hover:text-hey-church-red transition-colors"
                                    >
                                        Reply
                                    </button>
                                    <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                                </div>
                                {renderComments(comment.id, depth + 1)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full">
            {/* Interaction Buttons Bar */}
            <div className="flex items-center space-x-6 p-4 border-t border-gray-700/50">
                <div className="relative">
                    <button 
                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all group"
                    >
                        <SmilePlus size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Amen</span>
                    </button>

                    {/* Emoji Picker Popover */}
                    {isEmojiPickerOpen && (
                        <div className="absolute bottom-full left-0 mb-3 bg-gray-900 border border-gray-700 rounded-full p-2 flex space-x-1.5 shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-2 z-50">
                            {REACTIONS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    className={`p-2 hover:bg-white/10 rounded-full transition-all text-xl ${userReacted[emoji] ? 'bg-hey-church-red/20 scale-110' : ''}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => {
                        setIsCommentOpen(!isCommentOpen);
                        setIsEmojiPickerOpen(false);
                        setReplyingTo(null);
                    }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all group"
                >
                    <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Comment</span>
                </button>
            </div>

            {/* Reaction Summary Pills */}
            {Object.entries(localReactions).some(([_, count]) => (count as number) > 0) && (
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {Object.entries(localReactions).map(([emoji, count]) => (count as number) > 0 ? (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                                userReacted[emoji] 
                                ? 'bg-hey-church-red/20 border-hey-church-red text-white' 
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                        >
                            <span>{emoji}</span>
                            <span>{count as number}</span>
                        </button>
                    ) : null)}
                </div>
            )}

            {/* Inline Comment Input */}
            {isCommentOpen && (
                <div className="p-4 bg-black/20 border-t border-gray-800 animate-in slide-in-from-top-2">
                    {replyingTo && (
                        <div className="flex items-center justify-between mb-2 px-2 py-1 bg-gray-800/50 rounded text-[10px] text-gray-400">
                            <span>Replying to {localComments.find(c => c.id === replyingTo)?.user.name}</span>
                            <button onClick={() => { setReplyingTo(null); setCommentText(''); }} className="text-hey-church-red">Cancel</button>
                        </div>
                    )}
                    <div className="flex items-center space-x-3">
                        <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-700" alt="Me" />
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendComment(replyingTo || undefined)}
                            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                            className="flex-grow bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-hey-church-red"
                            autoFocus
                        />
                        <button 
                            onClick={() => handleSendComment(replyingTo || undefined)}
                            disabled={!commentText.trim()}
                            className="p-2 text-hey-church-red disabled:opacity-30 disabled:text-gray-500 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Comments Display */}
            {localComments.length > 0 && (
                <div className="px-4 pb-4 max-h-80 overflow-y-auto border-t border-gray-700/30 pt-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-4">Community Conversation</p>
                    {renderComments(undefined)}
                </div>
            )}
        </div>
    );
};
