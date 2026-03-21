

## Plan: FoodAdda AI Chatbot Widget

A friendly, floating chat widget (bottom-right corner) available on all pages. The bot knows about FoodAdda's products, categories, hot requirements, and platform info. It responds in a warm, conversational tone.

### Components to Build

**1. Edge Function: `supabase/functions/website-bot/index.ts`**
- Receives user message + conversation history
- Queries Supabase for context: active categories, products (up to 20), hot requirements
- Sends to Lovable AI Gateway (`google/gemini-3-flash-preview`) with a friendly system prompt
- System prompt instructs the bot to be warm, helpful, use emojis occasionally, and guide users to explore the platform
- Streams response back via SSE for real-time token rendering
- Handles 429/402 errors gracefully

**2. Chat Widget: `src/components/chat/ChatBotWidget.tsx`**
- Floating green chat bubble (bottom-right) with a friendly bot icon
- Click to expand chat window (350px wide desktop, full-width mobile)
- Welcome message: "Hi there! I'm FoodAdda Bot. How can I help you today?"
- Message list with markdown rendering (`react-markdown`)
- Token-by-token streaming for real-time feel
- User messages on right (green), bot messages on left (gray) — consistent with existing chat bubbles
- Input field + send button at bottom
- Close/minimize button
- Conversation kept in React state (session only, no DB persistence)

**3. Integration: Add to `src/App.tsx`**
- Render `ChatBotWidget` globally so it appears on every page
- No auth required — works for anonymous visitors too

### System Prompt Personality
The bot will be instructed to:
- Be friendly, warm, and conversational (like a helpful food industry friend)
- Use casual language with occasional emojis
- Help users find products, suppliers, categories, and hot requirements
- Guide new users through the platform (signup, subscription, browsing)
- Answer questions about FoodAdda's services and features

### Technical Notes
- Model: `google/gemini-3-flash-preview` (fast, good for conversational Q&A)
- LOVABLE_API_KEY is already configured
- No new database tables needed
- `react-markdown` already in dependencies for rendering bot responses

