import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatListItemProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  unreadCount?: number;
  isActive?: boolean;
}

export function ChatListItem({
  id,
  name,
  avatarUrl,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
  isActive = false,
}: ChatListItemProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Link
      to={`/chat/${id}`}
      className={cn(
        'flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0',
        isActive && 'bg-muted',
        unreadCount > 0 && 'bg-primary/5'
      )}
    >
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={avatarUrl || undefined} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn(
            'font-medium truncate',
            unreadCount > 0 && 'font-semibold'
          )}>
            {name}
          </h4>
          {lastMessageTime && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTime(lastMessageTime)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            'text-sm truncate',
            unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}>
            {lastMessage || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <Badge className="h-5 min-w-[20px] flex-shrink-0 text-xs px-1.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
