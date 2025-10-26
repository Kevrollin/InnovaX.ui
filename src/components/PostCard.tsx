import { Post } from '@/services/posts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Share2, MessageCircle, Eye, HelpCircle, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PostCardProps {
  post: Post;
  onFund?: () => void;
  onLike?: () => void;
  onShare?: () => void;
}

export const PostCard = ({ post, onFund, onLike, onShare }: PostCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeIcon = () => {
    switch (post.postType) {
      case 'achievements':
        return '🏆';
      case 'trends':
        return '📈';
      case 'announcements':
        return '📢';
      default:
        return '💡';
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.profilePicture || undefined} />
            <AvatarFallback>{getInitials(post.author?.fullName || 'U')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm truncate">{post.author?.fullName || 'Unknown'}</span>
              {post.isFundable && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  ✓ Verified & Fundable
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{getTypeIcon()}</span>
              <Badge variant="outline" className="text-xs">
                {post.postType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">@{post.author?.username}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <h3 className="font-semibold text-lg">{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
        
        {post.mediaUrl && post.mediaUrl.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {post.mediaUrl.slice(0, 4).map((url, idx) => (
              <div key={idx} className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img src={url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {post.isFundable ? (
          <div className="pt-2">
            <Button 
              onClick={onFund}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Fund This Post <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              Not Eligible for Funding
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This post can only be funded if created by a verified student</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className="h-8 gap-1.5 hover:text-red-500"
          >
            <Heart className="h-4 w-4" />
            <span>{post.likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="h-8 gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            <span>{post.sharesCount}</span>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span className="text-xs">{post.viewsCount}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
