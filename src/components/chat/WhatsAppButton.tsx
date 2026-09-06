interface WhatsAppButtonProps {
  hidden?: boolean;
}

const WHATSAPP_NUMBER = '919328137674';
const WHATSAPP_MESSAGE = "Hi FoodAdda, I'd like to know more about your platform.";

export function WhatsAppButton({ hidden }: WhatsAppButtonProps) {
  if (hidden) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.31.65 4.51 1.876 6.42L4 29l7.77-1.84A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.818c-1.94 0-3.83-.52-5.47-1.5l-.393-.232-4.61 1.09 1.115-4.49-.256-.41A9.77 9.77 0 0 1 5.182 15c0-5.417 4.406-9.818 10.822-9.818 5.973 0 10.818 4.401 10.818 9.818s-4.845 9.818-10.818 9.818Zm5.61-7.35c-.307-.154-1.816-.897-2.098-1-.281-.103-.486-.154-.69.154-.205.307-.79 1-.97 1.205-.178.205-.357.23-.663.077-.307-.154-1.296-.478-2.47-1.524-.913-.814-1.53-1.82-1.708-2.128-.178-.307-.019-.473.135-.626.138-.138.307-.358.46-.537.154-.18.205-.307.307-.512.103-.205.051-.384-.026-.538-.077-.154-.69-1.664-.945-2.28-.249-.598-.502-.517-.69-.527l-.588-.01c-.205 0-.538.077-.82.384-.281.307-1.074 1.05-1.074 2.56 0 1.51 1.099 2.97 1.252 3.175.154.205 2.163 3.303 5.24 4.632.732.316 1.303.505 1.748.646.735.234 1.404.2 1.933.122.59-.088 1.816-.742 2.072-1.459.256-.717.256-1.331.18-1.459-.077-.128-.282-.205-.588-.359Z" />
      </svg>
    </a>
  );
}
