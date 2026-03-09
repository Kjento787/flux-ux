import { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Reply, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  user_id: string;
  content_id: number;
  content_type: string;
  comment_text: string;
  parent_id: string | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

interface CommentsSectionProps {
  contentId: number;
  contentType: 'movie' | 'tv';
}

export const CommentsSection = ({ contentId, contentType }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
      await fetchComments();
    };
    init();
  }, [contentId, contentType]);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching comments:', error); setLoading(false); return; }

    const userIds = [...new Set(data?.map(c => c.user_id) || [])];
    const { data: profiles } = await supabase
      .from('public_profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    const commentsWithProfiles = data?.map(comment => ({
      ...comment,
      profile: profileMap.get(comment.user_id),
    })) || [];

    const parentComments = commentsWithProfiles.filter(c => !c.parent_id);
    const replies = commentsWithProfiles.filter(c => c.parent_id);
    const commentsWithReplies = parentComments.map(parent => ({
      ...parent,
      replies: replies.filter(r => r.parent_id === parent.id),
    }));

    setComments(commentsWithReplies);
    setLoading(false);
  };

  const handleSubmitComment = async (parentId: string | null = null) => {
    if (!currentUserId) { toast.error('Please sign in to comment'); return; }
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('comments').insert({
      user_id: currentUserId,
      content_id: contentId,
      content_type: contentType,
      comment_text: text.trim(),
      parent_id: parentId,
    });

    if (error) { toast.error('Failed to post comment'); }
    else {
      toast.success(parentId ? 'Reply posted' : 'Comment posted');
      if (parentId) { setReplyText(''); setReplyTo(null); }
      else { setNewComment(''); }
      await fetchComments();
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) { toast.error('Failed to delete comment'); }
    else { toast.success('Comment deleted'); await fetchComments(); }
  };

  const CommentItem = ({ comment, isReply = false, index = 0 }: { comment: Comment; isReply?: boolean; index?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={cn(
        "flex gap-3",
        isReply ? "ml-10 mt-3 pl-4 border-l-2 border-border/30" : ""
      )}
    >
      <Avatar className="h-9 w-9 flex-shrink-0 border border-border/40">
        <AvatarImage src={comment.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
          {comment.profile?.display_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{comment.profile?.display_name || 'Anonymous'}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground/85 whitespace-pre-wrap break-words leading-relaxed">
          {comment.comment_text}
        </p>
        <div className="flex items-center gap-1 mt-2">
          {!isReply && currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-primary rounded-lg"
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          {currentUserId === comment.user_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem
                  className="text-destructive rounded-lg"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Reply input */}
        <AnimatePresence>
          {replyTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex gap-2"
            >
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] text-sm rounded-xl bg-secondary/30 border-border/30 focus:border-primary/40"
                maxLength={1000}
              />
              <Button
                size="sm"
                onClick={() => handleSubmitComment(comment.id)}
                disabled={submitting || !replyText.trim()}
                className="rounded-xl shadow-glow"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {comment.replies?.map((reply, i) => (
          <CommentItem key={reply.id} comment={reply} isReply index={i} />
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold font-display">Discussion</h3>
        <span className="text-sm text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/60">
          {comments.length}
        </span>
      </div>

      {/* New comment */}
      {currentUserId ? (
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0 border border-border/40">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[80px] rounded-xl bg-card/60 border-border/30 focus:border-primary/40 backdrop-blur-sm"
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{newComment.length}/1000</span>
              <Button
                onClick={() => handleSubmitComment()}
                disabled={submitting || !newComment.trim()}
                className="rounded-xl shadow-glow gap-2"
              >
                <Send className="h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 rounded-2xl bg-card/40 border border-border/20">
          <p className="text-muted-foreground text-sm">Sign in to join the discussion</p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-9 w-9 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded-lg w-24" />
                <div className="h-4 bg-muted rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-card/30 border border-border/15">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary/60" />
          </div>
          <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment, i) => (
            <CommentItem key={comment.id} comment={comment} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};
