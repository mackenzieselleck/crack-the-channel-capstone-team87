interface ChatBubbleProps {
  text: string;
  className?: string;
}

export default function ChatBubble({ text, className }: ChatBubbleProps) {
  return (
    <div
      className={[
        'relative mb-2 max-w-[calc(100vw-8rem)] rounded-2xl border border-[#233049] bg-[#121A2B] px-4 py-3 text-sm text-[#E7ECF5] shadow-lg sm:max-w-xs',
        className ?? '',
      ].join(' ')}
    >
      {text}
      {/* Tail points left, toward the mascot docked beside this bubble */}
      <div className="absolute -left-1.5 bottom-4 h-3 w-3 rotate-45 border-b border-l border-[#233049] bg-[#121A2B]" />
    </div>
  );
}