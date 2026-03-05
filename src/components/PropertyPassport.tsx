import React, { useState } from 'react';
import { 
  MapPin, Building2, Ruler, Maximize, ArrowUpRight, 
  CheckCircle2, ShieldCheck, FileText, TrendingUp, 
  Users, Clock, AlertCircle, ChevronRight, Star, 
  Train, Coffee, BookOpen, Activity, DollarSign,
  History, Award, ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyPassportProps {
  onBack?: () => void;
}

export default function PropertyPassport({ onBack }: PropertyPassportProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'history' | 'infrastructure'>('overview');
  const [offerAmount, setOfferAmount] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 pb-20">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">ул. Остоженка, 11</h1>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Паспорт подтвержден
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">Кадастровый номер: 77:01:0001001:1234</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-bold transition-colors">
            Поделиться
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
            Следить за объектом
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Info & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Image Gallery Mock */}
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
            <div className="col-span-3 row-span-2 relative group cursor-pointer">
              <img src="https://picsum.photos/seed/apt1_main/800/600" alt="Main" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/30">
                  12 Фото
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/30 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> Фото проверены AI
                </span>
              </div>
            </div>
            <div className="col-span-1 row-span-1 relative overflow-hidden">
              <img src="https://picsum.photos/seed/apt1_2/400/300" alt="Room 1" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" referrerPolicy="no-referrer" />
            </div>
            <div className="col-span-1 row-span-1 relative overflow-hidden">
              <img src="https://picsum.photos/seed/apt1_3/400/300" alt="Room 2" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                <span className="text-white font-bold">+9</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-800 pb-px">
            {[
              { id: 'overview', label: 'Обзор', icon: Building2 },
              { id: 'analytics', label: 'Аналитика и Оценка', icon: TrendingUp },
              { id: 'history', label: 'История сделок', icon: History },
              { id: 'infrastructure', label: 'Инфраструктура', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Basic Info Grid */}
                <section>
                  <h2 className="text-xl font-bold mb-4">Базовые характеристики</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Комнатность</p>
                      <p className="text-xl font-black">3-комн.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Площадь</p>
                      <p className="text-xl font-black">120 м²</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Этаж</p>
                      <p className="text-xl font-black">4 из 7</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Высота потолков</p>
                      <p className="text-xl font-black">3.2 м</p>
                    </div>
                  </div>
                </section>

                {/* Building Info */}
                <section>
                  <h2 className="text-xl font-bold mb-4">О здании</h2>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
                      <div className="p-5 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Год постройки</span>
                          <span className="font-medium">1912 (Кап. ремонт 2018)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Тип дома</span>
                          <span className="font-medium">Кирпичный, Доходный дом</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Перекрытия</span>
                          <span className="font-medium">Железобетонные</span>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Парковка</span>
                          <span className="font-medium">Подземная (2 места)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Лифт</span>
                          <span className="font-medium">1 пассажирский</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">УК</span>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer">ТСЖ "Остоженка 11"</span>
                        </div>
                      </div>
                    </div>
                    {/* Building Rating */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                          <span className="text-xl font-black text-green-700 dark:text-green-400">8.9</span>
                        </div>
                        <div>
                          <p className="font-bold">Рейтинг дома</p>
                          <p className="text-xs text-gray-500">На основе 24 отзывов жильцов</p>
                        </div>
                      </div>
                      <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Смотреть отзывы</button>
                    </div>
                  </div>
                </section>

                {/* Verified Documents */}
                <section>
                  <h2 className="text-xl font-bold mb-4">Проверенные документы</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-900/50">
                      <div className="mt-0.5"><ShieldCheck className="w-5 h-5 text-green-500" /></div>
                      <div>
                        <p className="font-bold text-sm">Выписка ЕГРН</p>
                        <p className="text-xs text-gray-500 mt-1">Проверено Росреестром 12.05.2026</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-900/50">
                      <div className="mt-0.5"><ShieldCheck className="w-5 h-5 text-green-500" /></div>
                      <div>
                        <p className="font-bold text-sm">Собственник</p>
                        <p className="text-xs text-gray-500 mt-1">Подтвержден через Госуслуги</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="mt-0.5"><FileText className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <p className="font-bold text-sm">Тех. паспорт</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 cursor-pointer hover:underline">Запросить доступ</p>
                      </div>
                    </div>
                  </div>
                </section>

              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-indigo-300" />
                    <h2 className="text-lg font-bold text-indigo-100">AI Оценка Стоимости</h2>
                  </div>
                  <div className="flex items-end gap-4 mb-6">
                    <span className="text-5xl font-black tracking-tight">46.2 <span className="text-2xl text-indigo-300">млн ₽</span></span>
                    <span className="text-lg font-medium text-green-400 flex items-center mb-1">+4.5% <TrendingUp className="w-4 h-4 ml-1"/></span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                    <div>
                      <p className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Диапазон оценки</p>
                      <p className="font-bold">44.5 - 48.0 млн ₽</p>
                    </div>
                    <div>
                      <p className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Средняя цена за м²</p>
                      <p className="font-bold">385 000 ₽/м²</p>
                    </div>
                    <div>
                      <p className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Точность AI</p>
                      <p className="font-bold text-green-400">Высокая (94%)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-gray-400"/> Ликвидность объекта</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Ожидаемый срок продажи</span>
                          <span className="font-bold text-green-600">14 - 21 день</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm text-gray-500 mb-1">Спрос в этой локации</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">142 <span className="text-sm font-medium text-gray-500">покупателя ищут сейчас</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-3">
                      <TrendingUp className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Рынок на подъеме</h3>
                    <p className="text-sm text-gray-500">Цены в районе Хамовники выросли на 12% за последний год. Спрос превышает предложение.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold mb-6 text-lg">История сделок и листингов</h3>
                  
                  <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-3 space-y-8">
                    <div className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-indigo-600 rounded-full -left-[9px] top-1 ring-4 ring-white dark:ring-gray-800"></div>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">СЕЙЧАС (12 Мая 2026)</p>
                      <p className="font-bold text-gray-900 dark:text-white">Объект выставлен на продажу</p>
                      <p className="text-sm text-gray-500 mt-1">Начальная цена: 45 000 000 ₽</p>
                    </div>
                    
                    <div className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-gray-800"></div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Октябрь 2021</p>
                      <p className="font-bold text-gray-900 dark:text-white">Сделка купли-продажи (Росреестр)</p>
                      <p className="text-sm text-gray-500 mt-1">Оценочная стоимость: ~32 000 000 ₽</p>
                    </div>

                    <div className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-gray-800"></div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Август 2018</p>
                      <p className="font-bold text-gray-900 dark:text-white">Завершен капитальный ремонт</p>
                      <p className="text-sm text-gray-500 mt-1">Зарегистрирована перепланировка</p>
                    </div>

                    <div className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-gray-800"></div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Март 2010</p>
                      <p className="font-bold text-gray-900 dark:text-white">Сделка купли-продажи (Росреестр)</p>
                      <p className="text-sm text-gray-500 mt-1">Ипотека погашена в 2015 г.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'infrastructure' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500">
                        <Train className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Метро Кропоткинская</p>
                        <p className="text-xs text-gray-500">Сокольническая линия</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">5 мин</p>
                      <p className="text-xs text-gray-500">пешком (400м)</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Школа №1529</p>
                        <p className="text-xs text-gray-500">Топ-50 школ Москвы</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">3 мин</p>
                      <p className="text-xs text-gray-500">пешком (250м)</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-500">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Парк Горького</p>
                        <p className="text-xs text-gray-500">Парк культуры и отдыха</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">12 мин</p>
                      <p className="text-xs text-gray-500">пешком (1.1км)</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center text-orange-500">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Азбука Вкуса</p>
                        <p className="text-xs text-gray-500">Супермаркет 24/7</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">2 мин</p>
                      <p className="text-xs text-gray-500">пешком (150м)</p>
                    </div>
                  </div>
                </div>
                
                {/* Map Placeholder */}
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg font-bold text-sm shadow-lg z-10">
                    Интерактивная карта района
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Market Mechanics (Offers & Agents) */}
        <div className="space-y-6">
          
          {/* Status & Price Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                  В продаже
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4"/> 2 дня на рынке</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-1">45 000 000 ₽</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">375 000 ₽ за м²</p>

              <button className="w-full py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2 mb-3">
                <DollarSign className="w-5 h-5" /> Сделать оффер
              </button>
              <button className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold transition-colors">
                Записаться на просмотр
              </button>
            </div>

            {/* Order Book (Offers) */}
            <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center justify-between">
                <span>Стакан офферов</span>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">3 активных</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-900/50 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-bold">44 500 000 ₽</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Покупатель #842</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">43 800 000 ₽</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Покупатель #115</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">42 000 000 ₽</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Покупатель #903</span>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 mt-4">Офферы видны всем участникам рынка. Это создает прозрачную конкуренцию.</p>
            </div>
          </div>

          {/* Open Listing Agents */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Авторизованные агенты</h3>
              <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded">Open Listing</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Собственник работает по открытому договору. Вы можете обратиться к любому из агентов.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Agent" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-sm">Михаил С.</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" /> 4.9 (120 сделок)
                    </div>
                  </div>
                </div>
                <button className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                  Написать
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Agent" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-sm">Елена В.</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" /> 4.8 (85 сделок)
                    </div>
                  </div>
                </div>
                <button className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                  Написать
                </button>
              </div>
            </div>
            
            <button className="w-full mt-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Я агент, хочу продавать этот объект
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
