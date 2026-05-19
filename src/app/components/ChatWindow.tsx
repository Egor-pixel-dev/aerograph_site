import { motion, AnimatePresence } from 'motion/react';
import { Phone, Video, MoreVertical, Smile, Image as ImageIcon, Paperclip, Send, X, Plus, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'https://aerograph-base.onrender.com';

interface Message {
  id: string;
  text: string;
  time: string;
  senderId: string;
}

interface ChatWindowProps {
  targetUser: any;
  currentUser: any;
  onBack?: () => void;
  isMobile?: boolean;
  chatBackground?: string;
}

export function ChatWindow({ targetUser, currentUser, onBack, isMobile = false, chatBackground }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [stickersOpen, setStickersOpen] = useState(false);
  const [gifsOpen, setGifsOpen] = useState(false);
  const [createStickerOpen, setCreateStickerOpen] = useState(false);
  const [stickerImage, setStickerImage] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const chatId = currentUser && targetUser 
    ? [currentUser.id, targetUser.id].sort().join('_') 
    : 'default_chat';

  // ЗАГРУЗКА ИСТОРИИ И СОКЕТЫ
  useEffect(() => {
    if (!currentUser || !targetUser) return;

    fetch(`${SERVER_URL}/api/messages/${chatId}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error(err));

    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.emit('join_chat', chatId);

    newSocket.on('receive_message', (msg: Message) => {
      setMessages((prev: Message[]) => [...prev, msg]);
      
      // ВОТ ТУТ МЫ ПОКАЗЫВАЕМ БРАУЗЕРНОЕ УВЕДОМЛЕНИЕ, если пришло новое сообщение не от нас
      if (msg.senderId !== currentUser.id && "Notification" in window && Notification.permission === "granted") {
        new Notification(targetUser.username, {
          body: msg.text,
          icon: targetUser.avatar.startsWith('data:') ? undefined : undefined // Можно добавить иконку
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatId, currentUser, targetUser]);

  // ОТПРАВКА СООБЩЕНИЯ
  const handleSendMessage = () => {
    if (!message.trim() || !socket || !currentUser) return;

    const msgData = {
      chatId,
      text: message,
      senderId: currentUser.id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', msgData);
    setMessage('');
  };

  const stickers = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '😍', '🤔', '👏', '🙌', '💯', '✨'];
  const gifs = Array(12).fill('https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif');

  const handleStickerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setStickerImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const avatarEl = targetUser?.avatar?.startsWith('data:') 
    ? <img src={targetUser.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" /> 
    : targetUser?.avatar || '👤';

  if (!targetUser) return null;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={24} className="text-gray-600" />
            </motion.button>
          )}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-xl overflow-hidden">
            {avatarEl}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{targetUser.username}</h3>
            {/* MVP Статус - Пока просто хардкод "В сети" */}
            <p className="text-xs text-green-500 font-medium">В сети</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone size={20} className="text-gray-600" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video size={20} className="text-gray-600" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical size={20} className="text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: chatBackground ? `url(${chatBackground})` : 'none',
          backgroundColor: chatBackground ? 'transparent' : '#f0f2f5',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {messages.map((msg: Message) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isMine
                    ? 'bg-cyan-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-cyan-100' : 'text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sticker Panel - Desktop Left */}
      {!isMobile && (
        <AnimatePresence>
          {stickersOpen && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 bottom-16 w-80 h-96 bg-white rounded-tr-2xl shadow-2xl border border-gray-200 flex flex-col z-20"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Стикеры</h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setStickersOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-4 gap-3">
                  {stickers.map((sticker, i) => (
                    <motion.button key={i} onClick={() => { setMessage(message + sticker); setStickersOpen(false); }} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="text-4xl p-3 hover:bg-gray-100 rounded-lg transition-colors">
                      {sticker}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="p-3 border-t border-gray-200">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCreateStickerOpen(true)} className="w-full py-2 bg-cyan-500 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <Plus size={18} /> Создать свой стикер
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* GIF Panel - Desktop Right */}
      {!isMobile && (
        <AnimatePresence>
          {gifsOpen && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 bottom-16 w-80 h-96 bg-white rounded-tl-2xl shadow-2xl border border-gray-200 flex flex-col z-20"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">GIF</h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setGifsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-2">
                  {gifs.map((gif, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-cyan-200 to-blue-200 flex items-center justify-center text-xs text-gray-600">GIF {i + 1}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Sticker/GIF Panel */}
      {isMobile && (
        <AnimatePresence>
          {(stickersOpen || gifsOpen) && (
            <motion.div
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-16 left-0 right-0 h-64 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 flex flex-col z-20"
            >
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => { setStickersOpen(true); setGifsOpen(false); }} className={`px-4 py-2 rounded-lg font-medium transition-colors ${stickersOpen ? 'bg-cyan-500 text-white' : 'text-gray-600'}`}>Стикеры</button>
                  <button onClick={() => { setGifsOpen(true); setStickersOpen(false); }} className={`px-4 py-2 rounded-lg font-medium transition-colors ${gifsOpen ? 'bg-cyan-500 text-white' : 'text-gray-600'}`}>GIF</button>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setStickersOpen(false); setGifsOpen(false); }} className="p-1"><X size={20} /></motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {stickersOpen && (
                  <div className="grid grid-cols-6 gap-2">
                    {stickers.map((sticker, i) => (
                      <button key={i} onClick={() => { setMessage(message + sticker); setStickersOpen(false); }} className="text-3xl p-2">{sticker}</button>
                    ))}
                  </div>
                )}
                {gifsOpen && (
                  <div className="grid grid-cols-3 gap-2">
                    {gifs.slice(0, 9).map((gif, i) => (
                      <div key={i} className="aspect-square bg-gradient-to-br from-cyan-200 to-blue-200 rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Create Sticker Modal */}
      <AnimatePresence>
        {createStickerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateStickerOpen(false)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Создать стикер</h3>
              {!stickerImage ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleStickerUpload} className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-cyan-500 transition-colors">
                  <ImageIcon size={48} className="text-gray-400" />
                  <p className="text-gray-600">Выберите изображение</p>
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <div className="relative"><img src={stickerImage} alt="Sticker" className="w-full h-64 object-contain bg-gray-100 rounded-lg" /></div>
                  <div className="flex gap-2"><button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Обрезать</button><button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Фильтры</button></div>
                  <div className="flex gap-2"><button onClick={() => setStickerImage(null)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button><button className="flex-1 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">Сохранить</button></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 shrink-0">
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setStickersOpen(!stickersOpen); setGifsOpen(false); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile size={24} className="text-gray-600" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setGifsOpen(!gifsOpen); setStickersOpen(false); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ImageIcon size={24} className="text-gray-600" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip size={24} className="text-gray-600" />
          </motion.button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Написать сообщение..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <motion.button onClick={handleSendMessage} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-colors">
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
