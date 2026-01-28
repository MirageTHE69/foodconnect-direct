import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { MessageBubble, DateSeparator } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, conversationDetails, loading, sendMessage } = useChat(id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  // Group messages by date
  const messagesWithDates = messages.reduce<
    { type: 'date' | 'message'; date?: string; message?: typeof messages[0] }[]
  >((acc, message, index) => {
    const messageDate = new Date(message.created_at);
    const prevMessage = messages[index - 1];
    
    // Add date separator if this is the first message or different day
    if (
      index === 0 ||
      (prevMessage && !isSameDay(messageDate, new Date(prevMessage.created_at)))
    ) {
      acc.push({ type: 'date', date: message.created_at });
    }
    
    acc.push({ type: 'message', message });
    return acc;
  }, []);

  const initials = conversationDetails?.other_party_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'UN';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          
          {/* Messages Skeleton */}
          <div className="flex-1 p-4 space-y-4">
            <div className="flex justify-start">
              <Skeleton className="h-16 w-48 rounded-2xl" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-12 w-40 rounded-2xl" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-20 w-56 rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!conversationDetails) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
          <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Conversation Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This conversation doesn't exist or you don't have access
          </p>
          <Button asChild>
            <Link to="/chat">Back to Messages</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] -m-6 lg:-m-8">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="hidden lg:flex"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversationDetails.other_party_avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{conversationDetails.other_party_name}</h2>
            <p className="text-xs text-muted-foreground">Chat</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-4 space-y-2">
            {messagesWithDates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messagesWithDates.map((item, index) => {
                if (item.type === 'date' && item.date) {
                  return <DateSeparator key={`date-${index}`} date={item.date} />;
                }
                if (item.type === 'message' && item.message) {
                  return (
                    <MessageBubble
                      key={item.message.id}
                      content={item.message.content}
                      timestamp={item.message.created_at}
                      isSent={item.message.sender_id === user?.id}
                      isRead={item.message.is_read || false}
                    />
                  );
                }
                return null;
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <MessageInput onSend={handleSend} placeholder="Type your message..." />
      </div>
    </DashboardLayout>
  );
}
