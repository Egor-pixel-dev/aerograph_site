import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle2, RotateCcw, Plus, Camera, ArrowRight, Menu, Search, Settings, Palette, Clock, Shield, Bell, Moon, Sun, X, UserCircle, Users, Megaphone, Phone, Bookmark, ChevronLeft, MessageSquare, Zap, Globe, Volume2, Image } from 'lucide-react';
import { ChatCard } from './components/ChatCard';
import { ChatWindow } from './components/ChatWindow';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null); // Текущий юзер
  const [usersList, setUsersList] = useState<any[]>([]);     // Все юзеры с сервера 
  const [currentPage, setCurrentPage] = useState<'register' | 'login' | 'forgot' | 'main'>('register');
  const [currentStep, setCurrentStep] = useState(0);
    const SERVER_URL = 'https://aerograph-base.onrender.com';
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null as string | null,
    loginEmail: '',
    loginPassword: '',
    resetEmail: ''
  });

  useEffect(() => {
    if (currentPage === 'main' && currentUser) {
      // Запрашиваем всех пользователей с сервера
      fetch(`${SERVER_URL}/api/users`)
        .then(res => res.json())
        .then(data => {
          // Исключаем из списка контактов самих себя
          const otherUsers = data.filter((u: any) => u.id !== currentUser.id);
          setUsersList(otherUsers);
        })
        .catch(err => console.error('Ошибка загрузки пользователей:', err));
    }
  }, [currentPage, currentUser]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState<string | null>(null);
  const [resetTimer, setResetTimer] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Settings state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [appTheme, setAppTheme] = useState('default');
  const [accentColor, setAccentColor] = useState('#06b6d4');
  const [messageDelay, setMessageDelay] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [fontSize, setFontSize] = useState(14);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyAddress, setProxyAddress] = useState('');
  const [soundNotif, setSoundNotif] = useState(true);
  const [visualNotif, setVisualNotif] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [compressImages, setCompressImages] = useState(false);

  // Profile state
  const [bio, setBio] = useState('Привет! Я использую Aerograph.');
  const [chatBackground, setChatBackground] = useState<string>('');

  // Test chat data - will be populated by server
  const [chats] = useState([
    { id: 1, name: 'TestUser', lastMessage: 'Тестовое сообщение', time: '14:23', unread: 1, avatar: '👤' },
  ]);

  const themes = [
    { id: 'default', name: 'По умолчанию', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'frutiger', name: 'Frutiger Aero', preview: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)' },
    { id: 'cyberpunk', name: 'Cyberpunk', preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'forest', name: 'Forest', preview: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #ff512f 0%, #f09819 100%)' },
    { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)' },
  ];

  const accentColors = [
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 0) {
      // Validate all fields before proceeding
      const newErrors: Record<string, string> = {};
      newErrors.username = validateField('username', formData.username);
      newErrors.email = validateField('email', formData.email);
      newErrors.password = validateField('password', formData.password);
      newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);

      const hasErrors = Object.values(newErrors).some(error => error !== '');
      if (hasErrors) {
        setErrors(newErrors);
        return;
      }

      setCurrentStep(1);
    } else {
          // ТУТ ОТПРАВЛЯЕМ НА СЕРВЕР (РЕГИСТРАЦИЯ)
    try {
      const res = await fetch(`${SERVER_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log('Зарегистрирован:', data);
        setCurrentPage('main');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData({ ...formData, avatar: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleResetPassword = () => {
    if (resetTimer > 0) return;

    console.log('Reset password for:', formData.resetEmail);
    setResetTimer(30);

    const interval = setInterval(() => {
      setResetTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (value.length < 3) {
          return 'Минимум 3 символа';
        }
        if (/\s/.test(value)) {
          return 'Пробелы не разрешены';
        }
        return '';
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Некорректный email';
        }
        return '';
      case 'password':
        if (value.length < 8) {
          return 'Минимум 8 символов';
        }
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
          return 'Нужны буквы и цифры';
        }
        return '';
      case 'confirmPassword':
        if (value !== formData.password) {
          return 'Пароли не совпадают';
        }
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (name: string, value: string) => {
    setFocusedField(null);
    const error = validateField(name, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
      setShake(name);
      setTimeout(() => setShake(null), 500);
    }
  };

  const inputFields = [
    {
      name: 'username',
      type: 'text',
      placeholder: 'Никнейм',
      icon: User,
      value: formData.username
    },
    {
      name: 'email',
      type: 'email',
      placeholder: 'Электронная почта',
      icon: Mail,
      value: formData.email
    },
    {
      name: 'password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Пароль',
      icon: Lock,
      value: formData.password,
      showToggle: true,
      toggleState: showPassword,
      onToggle: () => setShowPassword(!showPassword)
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: 'Повторите пароль',
      icon: RotateCcw,
      value: formData.confirmPassword
    }
  ];

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Main page render
  if (currentPage === 'main') {
    return (
      <div className="h-screen w-full flex bg-gray-50 relative overflow-hidden">
        {/* Side menu drawer */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />

              {/* Menu panel */}
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
              >
                {/* Menu Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center">
                      <UserCircle size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{formData.username || 'Пользователь'}</p>
                      <p className="text-sm text-gray-500">{formData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-2">
                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveModal('profile');
                      setMenuOpen(false);
                    }}
                    className="w-full px-6 py-4 flex items-center gap-4 text-gray-900 transition-colors"
                  >
                    <UserCircle size={24} className="text-gray-600" />
                    <span className="font-medium">Мой профиль</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 flex items-center gap-4 text-gray-900 transition-colors"
                  >
                    <Users size={24} className="text-gray-600" />
                    <span className="font-medium">Создать группу</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 flex items-center gap-4 text-gray-900 transition-colors"
                  >
                    <Megaphone size={24} className="text-gray-600" />
                    <span className="font-medium">Создать канал</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 flex items-center gap-4 text-gray-900 transition-colors"
                  >
                    <User size={24} className="text-gray-600" />
                    <span className="font-medium">Контакты</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 flex items-center gap-4 text-gray-900 transition-colors"
                  >
                    <Phone size={24} className="text-gray-600" />
                    <span className="font-medium">Звонки</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 flex items-center gap-4 text-gray-900 transition-colors"
                  >
                    <Bookmark size={24} className="text-gray-600" />
                    <span className="font-medium">Избранное</span>
                  </motion.button>

                  <div className="h-px bg-gray-200 my-2" />

                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveModal('settings');
                      setMenuOpen(false);
                    }}
                    className="w-full px-6 py-4 flex items-center gap-4 text-gray-900 transition-colors"
                  >
                    <Settings size={24} className="text-gray-600" />
                    <span className="font-medium">Настройки</span>
                  </motion.button>

                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Moon size={24} className="text-gray-600" />
                      <span className="font-medium text-gray-900">Ночной режим</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: theme === 'dark' ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-6 h-6 bg-white rounded-full shadow"
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Left sidebar - Chats */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`bg-white border-r border-gray-200 flex flex-col ${
            isMobile
              ? selectedChat
                ? 'hidden'
                : 'w-full'
              : 'w-96'
          }`}
        >
          {/* Header with menu and search */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-gray-700" />
              </motion.button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Поиск"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Chats list */}
{/* Chats list */}
<div className="flex-1 overflow-y-auto">
  {usersList
    .filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((user, index) => (
      <ChatCard
        key={user.id}
        id={user.id}
        name={user.username}
        lastMessage="Начать чат" // Пока заглушка
        time=""
        unread={0}
        // Если аватар начинается с data:image (картинка), показываем img, иначе текст (например '👤')
        avatar={user.avatar.startsWith('data:') 
          ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> 
          : user.avatar}
        isSelected={selectedChat === user.id}
        onClick={() => setSelectedChat(user.id)} // selectedChat теперь хранит ID пользователя
        animationDelay={index * 0.05}
      />
    ))}
</div>
        </motion.div>

        {/* Modal Windows */}
        <AnimatePresence>
          {activeModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveModal(null)}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                >
                  {/* Profile Modal */}
                  {activeModal === 'profile' && (
                    <>
                      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setActiveModal(null); setMenuOpen(true); }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronLeft size={24} className="text-gray-600" />
                          </motion.button>
                          <h2 className="text-2xl font-semibold text-gray-900">Мой профиль</h2>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setActiveModal(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X size={24} className="text-gray-600" />
                        </motion.button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden">
                              {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <UserCircle size={64} className="text-white" />
                              )}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleAvatarClick}
                              className="absolute bottom-0 right-0 p-3 bg-cyan-500 text-white rounded-full shadow-lg"
                            >
                              <Camera size={20} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Username */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Имя пользователя</label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>

                        {/* Bio */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">О себе</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            maxLength={70}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                          />
                          <p className="text-sm text-gray-500 mt-1">{bio.length}/70</p>
                        </div>

                        {/* Save button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold shadow-lg"
                        >
                          Сохранить изменения
                        </motion.button>
                      </div>
                    </>
                  )}

                  {/* Settings Modal */}
                  {activeModal === 'settings' && (
                    <>
                      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setActiveModal(null); setMenuOpen(true); }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronLeft size={24} className="text-gray-600" />
                          </motion.button>
                          <h2 className="text-2xl font-semibold text-gray-900">Настройки</h2>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setActiveModal(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X size={24} className="text-gray-600" />
                        </motion.button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* App Themes */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Palette size={20} className="text-cyan-500" />
                            Темы оформления
                          </h3>
                          <div className="grid grid-cols-3 gap-3">
                            {themes.map((t) => (
                              <motion.button
                                key={t.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setAppTheme(t.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  appTheme === t.id ? 'border-cyan-500 shadow-lg' : 'border-gray-200'
                                }`}
                              >
                                <div
                                  className="h-16 rounded-lg mb-2"
                                  style={{ background: t.preview }}
                                />
                                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Accent Color */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Акцентовый цвет</h3>
                          <div className="flex gap-3">
                            {accentColors.map((color) => (
                              <motion.button
                                key={color}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setAccentColor(color)}
                                className={`w-12 h-12 rounded-full border-4 transition-all ${
                                  accentColor === color ? 'border-gray-900' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Mode */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Moon size={20} className="text-cyan-500" />
                            Режим отображения
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setTheme('light')}
                              className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                                theme === 'light' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                              }`}
                            >
                              <Sun size={24} />
                              <span className="font-medium">Светлая</span>
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setTheme('dark')}
                              className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                                theme === 'dark' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                              }`}
                            >
                              <Moon size={24} />
                              <span className="font-medium">Тёмная</span>
                            </motion.button>
                          </div>
                        </div>

                        {/* Chat Settings */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare size={20} className="text-cyan-500" />
                            Настройки чатов
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Размер шрифта: {fontSize}px</span>
                              </div>
                              <div className="relative">
                                <input
                                  type="range"
                                  min="12"
                                  max="20"
                                  value={fontSize}
                                  onChange={(e) => setFontSize(Number(e.target.value))}
                                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                  style={{
                                    background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${((fontSize - 12) / 8) * 100}%, #e5e7eb ${((fontSize - 12) / 8) * 100}%, #e5e7eb 100%)`
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Задержка сообщений: {messageDelay}с</span>
                              </div>
                              <div className="relative">
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  value={messageDelay}
                                  onChange={(e) => setMessageDelay(Number(e.target.value))}
                                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                  style={{
                                    background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${(messageDelay / 10) * 100}%, #e5e7eb ${(messageDelay / 10) * 100}%, #e5e7eb 100%)`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Animation Settings */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-cyan-500" />
                            Анимации
                          </h3>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Скорость анимаций: {animationSpeed}/10</span>
                            </div>
                            <div className="relative">
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={animationSpeed}
                                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${((animationSpeed - 1) / 9) * 100}%, #e5e7eb ${((animationSpeed - 1) / 9) * 100}%, #e5e7eb 100%)`
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Медленно</span>
                              <span>Быстро</span>
                            </div>
                          </div>
                        </div>

                        {/* Media Settings */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Image size={20} className="text-cyan-500" />
                            Медиа
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">Автозагрузка медиа</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setAutoDownload(!autoDownload)}
                                className={`w-12 h-6 rounded-full transition-all duration-300`}
                                style={{ backgroundColor: autoDownload ? accentColor : '#d1d5db' }}
                              >
                                <motion.div
                                  animate={{ x: autoDownload ? 24 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="w-6 h-6 bg-white rounded-full shadow"
                                />
                              </motion.button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">Сжимать изображения</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCompressImages(!compressImages)}
                                className={`w-12 h-6 rounded-full transition-all duration-300`}
                                style={{ backgroundColor: compressImages ? accentColor : '#d1d5db' }}
                              >
                                <motion.div
                                  animate={{ x: compressImages ? 24 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="w-6 h-6 bg-white rounded-full shadow"
                                />
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Notifications */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-cyan-500" />
                            Уведомления
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Volume2 size={20} className="text-gray-600" />
                                <span className="font-medium text-gray-900">Звуковые</span>
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSoundNotif(!soundNotif)}
                                className={`w-12 h-6 rounded-full transition-all duration-300`}
                                style={{ backgroundColor: soundNotif ? accentColor : '#d1d5db' }}
                              >
                                <motion.div
                                  animate={{ x: soundNotif ? 24 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="w-6 h-6 bg-white rounded-full shadow"
                                />
                              </motion.button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Bell size={20} className="text-gray-600" />
                                <span className="font-medium text-gray-900">Визуальные</span>
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setVisualNotif(!visualNotif)}
                                className={`w-12 h-6 rounded-full transition-all duration-300`}
                                style={{ backgroundColor: visualNotif ? accentColor : '#d1d5db' }}
                              >
                                <motion.div
                                  animate={{ x: visualNotif ? 24 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="w-6 h-6 bg-white rounded-full shadow"
                                />
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Chat Background */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Image size={20} className="text-cyan-500" />
                            Фон чата
                          </h3>
                          <div className="space-y-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e: Event) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setChatBackground(e.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                              className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors flex items-center gap-3"
                            >
                              <Image size={20} className="text-gray-600" />
                              <span className="font-medium text-gray-900">
                                {chatBackground ? 'Изменить фон' : 'Выбрать фон'}
                              </span>
                            </motion.button>
                            {chatBackground && (
                              <motion.button
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setChatBackground('')}
                                className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-red-50 transition-colors"
                              >
                                <span className="font-medium text-red-600">Удалить фон</span>
                              </motion.button>
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-gray-200 my-4" />

                        {/* Proxy */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Globe size={20} className="text-cyan-500" />
                            Прокси
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">Использовать прокси</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setProxyEnabled(!proxyEnabled)}
                                className={`w-12 h-6 rounded-full transition-all duration-300`}
                                style={{ backgroundColor: proxyEnabled ? accentColor : '#d1d5db' }}
                              >
                                <motion.div
                                  animate={{ x: proxyEnabled ? 24 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="w-6 h-6 bg-white rounded-full shadow"
                                />
                              </motion.button>
                            </div>
                            {proxyEnabled && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <input
                                  type="text"
                                  value={proxyAddress}
                                  onChange={(e) => setProxyAddress(e.target.value)}
                                  placeholder="socks5://proxy.example.com:1080"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                  style={{ focusRing: accentColor }}
                                />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Logout */}
                        <div className="pt-4 border-t border-gray-200">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setCurrentPage('register');
                              setActiveModal(null);
                            }}
                            className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                          >
                            Выйти из аккаунта
                          </motion.button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

{/* Right side - Chat area */}
<div className={`flex-1 flex flex-col min-h-0 ${isMobile && !selectedChat ? 'hidden' : ''}`}>
  {selectedChat ? (
    <ChatWindow
      targetUser={usersList.find(u => u.id === selectedChat)}
      currentUser={currentUser}
      onBack={isMobile ? () => setSelectedChat(null) : undefined}
      isMobile={isMobile}
      chatBackground={chatBackground}
    />
  ) : (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 min-h-0">
      <div className="text-center text-gray-400">
        <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
        <p className="text-xl font-medium">Выберите чат для начала общения</p>
      </div>
    </div>
  )}
</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Card container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <motion.div
          className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {currentPage === 'register' && currentStep === 0 ? (
              <motion.div
                key="step-1"
                initial={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 p-8 text-white">
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold mb-2"
                  >
                    Регистрация
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-white/80"
                  >
                    Создайте свой аккаунт
                  </motion.p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {inputFields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 4), duration: 0.5 }}
                className="relative"
              >
                <div className="relative">
                  <field.icon
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                    size={20}
                    style={{
                      color: focusedField === field.name ? '#0ea5e9' : '#111827'
                    }}
                  />
                  <motion.input
                    type={field.type}
                    name={field.name}
                    value={field.value}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => handleBlur(field.name, field.value)}
                    placeholder={field.placeholder}
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                      errors[field.name]
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-cyan-500'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                    animate={shake === field.name ? {
                      x: [0, -10, 10, -10, 10, 0],
                    } : {}}
                    transition={shake === field.name ? { duration: 0.5 } : { duration: 0.2 }}
                  />
                  {field.showToggle && (
                    <button
                      type="button"
                      onClick={field.onToggle}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors duration-300"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {field.toggleState ? <Eye size={20} /> : <EyeOff size={20} />}
                      </motion.div>
                    </button>
                  )}
                </div>
                <motion.div
                  className={`absolute -bottom-0.5 left-0 h-0.5 ${
                    errors[field.name]
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: focusedField === field.name || errors[field.name] ? '100%' : 0 }}
                  transition={{ duration: 0.3 }}
                />
                {errors[field.name] && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 ml-1"
                  >
                    {errors[field.name]}
                  </motion.p>
                )}
              </motion.div>
            ))}

            {/* Submit button */}
            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              Зарегистрироваться
            </motion.button>

            {/* Sign in link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center text-gray-600 mt-4"
            >
              Уже есть аккаунт?{' '}
              <motion.button
                type="button"
                onClick={() => {
                  setCurrentPage('login');
                  setFormData({ ...formData, loginEmail: formData.email });
                }}
                className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Войти
              </motion.button>
            </motion.p>
          </form>
              </motion.div>
            ) : currentPage === 'register' && currentStep === 1 ? (
              <motion.div
                key="step-2"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 p-8 text-white">
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold mb-2"
                  >
                    Профиль
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-white/80"
                  >
                    Выберите фото профиля
                  </motion.p>
                </div>

                {/* Avatar selection */}
                <div className="p-8 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                    className="relative"
                  >
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-16 h-16 text-blue-300" />
                      )}
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleAvatarClick}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg flex items-center justify-center"
                    >
                      <Plus size={24} />
                    </motion.button>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-gray-500 mt-6 text-center"
                  >
                    Нажмите на плюс, чтобы выбрать фото
                  </motion.p>

                  {/* Navigation buttons */}
                  <div className="w-full flex items-center justify-between mt-12">
                    <motion.button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch(`${SERVER_URL}/api/register`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              username: formData.username,
                              email: formData.email,
                              password: formData.password,
                              avatar: '👤' // Ставим стандартную аватарку, так как юзер пропустил выбор
                            })
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setCurrentUser(data.user); 
                            setCurrentPage('main');    
                          } else {
                            alert(data.error);
                            setCurrentStep(0); // Если ошибка (например, email занят), возвращаем на первый шаг
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      whileHover={{ x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
                    >
                      Пропустить
                    </motion.button>

                    <motion.button
                      type="button"
onClick={async () => {
  if (formData.avatar) {
    try {
      const res = await fetch(`${SERVER_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user); // Сохраняем кто вошел
        setCurrentPage('main');    // Идем в мессенджер
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  }
}}
                      disabled={!formData.avatar}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      whileHover={formData.avatar ? { scale: 1.05, x: 5 } : {}}
                      whileTap={formData.avatar ? { scale: 0.95 } : {}}
                      className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
                        formData.avatar
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Далее
                      <AnimatePresence>
                        {formData.avatar && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <ArrowRight size={20} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : currentPage === 'login' ? (
              <motion.div
                key="login"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 p-8 text-white">
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold mb-2"
                  >
                    Вход
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-white/80"
                  >
                    Войдите в свой аккаунт
                  </motion.p>
                </div>

                {/* Login Form */}
                <form onSubmit={async (e) => { 
  e.preventDefault(); 
  try {
    const res = await fetch(`${SERVER_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.loginEmail,
        password: formData.loginPassword
      })
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentUser(data.user); // Сохраняем кто вошел
      setCurrentPage('main');    // Идем в мессенджер
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
  }
}} className="p-8 space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                        size={20}
                        style={{
                          color: focusedField === 'loginEmail' ? '#0ea5e9' : '#111827'
                        }}
                      />
                      <input
                        type="text"
                        name="loginEmail"
                        value={formData.loginEmail}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('loginEmail')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Почта или никнейм"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    <motion.div
                      className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: focusedField === 'loginEmail' ? '100%' : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                        size={20}
                        style={{
                          color: focusedField === 'loginPassword' ? '#0ea5e9' : '#111827'
                        }}
                      />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        name="loginPassword"
                        value={formData.loginPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('loginPassword')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Пароль"
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors duration-300"
                      >
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          {showLoginPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </motion.div>
                      </button>
                    </div>
                    <motion.div
                      className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: focusedField === 'loginPassword' ? '100%' : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Войти
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-center text-gray-600 mt-4"
                  >
                    <motion.button
                      type="button"
                      onClick={() => {
                        setCurrentPage('forgot');
                        setFormData({ ...formData, resetEmail: formData.loginEmail || formData.email });
                      }}
                      className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Забыли пароль?
                    </motion.button>
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center text-gray-600 mt-2"
                  >
                    Нет аккаунта?{' '}
                    <motion.button
                      type="button"
                      onClick={() => setCurrentPage('register')}
                      className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Зарегистрироваться
                    </motion.button>
                  </motion.p>
                </form>
              </motion.div>
            ) : currentPage === 'forgot' ? (
              <motion.div
                key="forgot"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 p-8 text-white">
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold mb-2"
                  >
                    Восстановление
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-white/80"
                  >
                    Восстановите доступ к аккаунту
                  </motion.p>
                </div>

                {/* Reset Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="p-8 space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                        size={20}
                        style={{
                          color: focusedField === 'resetEmail' ? '#0ea5e9' : '#111827'
                        }}
                      />
                      <input
                        type="email"
                        name="resetEmail"
                        value={formData.resetEmail}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('resetEmail')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Электронная почта"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    <motion.div
                      className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: focusedField === 'resetEmail' ? '100%' : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={resetTimer > 0}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    whileHover={resetTimer === 0 ? { scale: 1.05, y: -2 } : {}}
                    whileTap={resetTimer === 0 ? { scale: 0.98 } : {}}
                    className={`w-full mt-6 py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                      resetTimer > 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-white hover:shadow-xl'
                    }`}
                  >
                    {resetTimer > 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        Отправить
                        <span className="text-sm text-gray-400">({resetTimer}с)</span>
                      </span>
                    ) : (
                      'Отправить'
                    )}
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-center text-gray-600 mt-4"
                  >
                    <motion.button
                      type="button"
                      onClick={() => setCurrentPage('login')}
                      className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Вернуться к входу
                    </motion.button>
                  </motion.p>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
