import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
  showTimestamp?: boolean;
}

export function MessageBubble({
  content,
  timestamp,
  isSent,
  isRead = false,
  showTimestamp = true,
}: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  return (
    <div
      className={cn(
        'flex w-full',
        isSent ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 break-words',
          isSent
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {showTimestamp && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-xs',
              isSent ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
            )}
          >
            <span>{formatTime(timestamp)}</span>
            {isSent && (
              isRead ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMMM d, yyyy');
  };

  return (
    <div className="flex items-center justify-center my-4">
      <span className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full">
        {formatDate(date)}
      </span>
    </div>
  );
}
