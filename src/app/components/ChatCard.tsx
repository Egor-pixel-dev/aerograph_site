import { motion } from 'motion/react';

interface ChatCardProps {
  id: string | number; // Поменял на string | number, так как Date.now() возвращает число, а потом мы его переводим в строку
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: React.ReactNode; // Аватарка теперь может быть <img>
  isSelected: boolean;
  isOnline: boolean;     // Добавили
  onClick: () => void;
  animationDelay?: number;
}

export function ChatCard({
  name,
  lastMessage,
  time,
  unread,
  avatar,
  isSelected,
  isOnline,
  onClick,
  animationDelay = 0
}: ChatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Контейнер аватарки с точкой */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-2xl overflow-hidden">
            {avatar}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{time}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
            {unread > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full flex-shrink-0">
                {unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
