import { useState } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { useChat } from '@/hooks/useChat';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MessageSquare, Loader2 } from 'lucide-react';

export default function Chat() {
  const { conversations, loading } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.other_party_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Your conversations with buyers and suppliers
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-lg">No conversations yet</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                  {searchQuery
                    ? 'No conversations match your search'
                    : 'Start a conversation by contacting a supplier or buyer'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conversation) => (
                  <ChatListItem
                    key={conversation.id}
                    id={conversation.id}
                    name={conversation.other_party_name}
                    avatarUrl={conversation.other_party_avatar}
                    lastMessage={conversation.last_message?.content}
                    lastMessageTime={conversation.last_message?.created_at}
                    unreadCount={conversation.unread_count}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
