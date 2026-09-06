import { useState } from 'react';
import { ChatBotWidget } from '@/components/chat/ChatBotWidget';
import { WhatsAppButton } from '@/components/chat/WhatsAppButton';

/**
 * Stacks the WhatsApp button above the AI chat bot's floating icon. The
 * chat window opens in the same bottom-right spot the WhatsApp button
 * occupies, so it hides while the chat is open to avoid overlapping it.
 */
export function FloatingWidgets() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <WhatsAppButton hidden={chatOpen} />
      <ChatBotWidget onOpenChange={setChatOpen} />
    </>
  );
}
