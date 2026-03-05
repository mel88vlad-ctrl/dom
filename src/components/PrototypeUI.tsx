import React, { useState, useEffect } from 'react';
import { Search, Filter, Home, Building, DollarSign, ChevronDown, CheckCircle2, X, ShieldCheck, Users, Activity, Layers, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PropertyPassport from './PropertyPassport';
import AuthModal from './AuthModal';
import { propertiesAPI, offersAPI, getAuthToken } from '../services/api';

const MOCK_PROPERTIES = [
  {
    id: 1,
    address: 'ул. Остоженка, 11',
    price: '45 000 000 ₽',
    rooms: 3,
    area: 120,
    floor: '4/7',
    image: 'https://picsum.photos/seed/apt1/400/300',
    lat: 55.741,
    lng: 37.598,
    bids: 3,
    topBid: '44.5 млн ₽',
    liquidity: 'high' // green
  },
  {
    id: 2,
    address: 'Пресненская наб., 8с1',
    price: '85 000 000 ₽',
    rooms: 4,
    area: 155,
    floor: '45/70',
    image: 'https://picsum.photos/seed/apt2/400/300',
    lat: 55.747,
    lng: 37.539,
    bids: 1,
    topBid: '80 млн ₽',
    liquidity: 'medium' // yellow
  },
  {
    id: 3,
    address: 'Ленинский пр-т, 38',
    price: '22 500 000 ₽',
    rooms: 2,
    area: 65,
    floor: '12/22',
    image: 'https://picsum.photos/seed/apt3/400/300',
    lat: 55.708,
    lng: 37.575,
    bids: 5,
    topBid: '23 млн ₽',
    liquidity: 'low' // red
  }
];

const MOCK_BUYERS = [
  {
    id: 101,
    name: 'Алексей М.',
    budget: 'до 25 000 000 ₽',
    request: 'Ищу 2-комн. квартиру, от 60 м², рядом с парком Горького.',
    status: 'Одобрена ипотека',
    lat: 55.731,
    lng: 37.601
  },
  {
    id: 102,
    name: 'Екатерина В.',
    budget: 'до 90 000 000 ₽',
    request: 'Видовая квартира в Сити, от 100 м², высокий этаж.',
    status: 'Наличные',
    lat: 55.750,
    lng: 37.535
  },
  {
    id: 103,
    name: 'Семья Ивановых',
    budget: 'до 15 000 000 ₽',
    request: '3-комн. для семьи с детьми, рядом с хорошей школой.',
    status: 'Материнский капитал',
    lat: 55.715,
    lng: 37.560
  }
];

export default function PrototypeUI() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [activeView, setActiveView] = useState<'map' | 'passport'>('map');
  
  // New state for toggling modes
  const [marketMode, setMarketMode] = useState<'supply' | 'demand'>('supply');
  const [showLiquidity, setShowLiquidity] = useState(false);

  // Auth state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data state
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  // Load properties from API
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await propertiesAPI.search({
        limit: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      if (result.success && result.data) {
        // Transform API data to match UI format
        const transformedProperties = result.data.map((prop: any) => ({
          id: prop.id,
          address: `${prop.address?.street || ''}, ${prop.address?.house_number || ''}`,
          price: `${(prop.listing_price || 0).toLocaleString('ru-RU')} ₽`,
          rooms: prop.rooms,
          area: prop.area,
          floor: `${prop.floor}/${prop.total_floors}`,
          image: `https://picsum.photos/seed/${prop.id}/400/300`,
          lat: prop.address?.lat || 55.751,
          lng: prop.address?.lng || 37.618,
          bids: prop.offers_count || 0,
          topBid: prop.top_offer ? `${(prop.top_offer / 1_000_000).toFixed(1)} млн ₽` : 'Нет офферов',
          liquidity: prop.liquidity_score > 7 ? 'high' : prop.liquidity_score > 4 ? 'medium' : 'low',
          cadastral_number: prop.cadastral_number,
          listing_id: prop.listing_id,
        }));

        setProperties(transformedProperties);
      } else {
        // Fallback to mock data if API returns no data
        setProperties(MOCK_PROPERTIES);
      }
    } catch (err: any) {
      console.error('Failed to load properties:', err);
      setError('Не удалось загрузить объекты. Используются демо-данные.');
      // Use mock data as fallback
      setProperties(MOCK_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setIsOfferModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const selectedProperty = properties.find(p => p.id === selectedItem);
      if (!selectedProperty) return;

      await offersAPI.create({
        listing_id: selectedProperty.listing_id || selectedProperty.id,
        property_id: selectedProperty.id,
        amount: parseFloat(offerAmount),
        financing_type: 'cash',
      });

      setOfferSuccess(true);
      setTimeout(() => {
        setIsOfferModalOpen(false);
        setOfferSuccess(false);
        setOfferAmount('');
        loadProperties(); // Reload to get updated offer counts
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create offer:', err);
      alert('Не удалось создать оффер: ' + err.message);
    }
  };

  if (activeView === 'passport') {
    return <PropertyPassport onBack={() => setActiveView('map')} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">TrueDom</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">Купить</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">Снять</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">Оценка AI</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Город, адрес, метро, район..." 
              className="pl-10 pr-4 py-2 w-80 bg-gray-100 dark:bg-gray-900 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
          {isAuthenticated ? (
            <button className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {currentUser?.first_name?.[0] || 'U'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Войти
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - List */}
        <div className="w-full md:w-[450px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 z-10 shadow-xl h-full">
          
          {/* Market Toggle (Supply vs Demand) */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
              <button 
                onClick={() => setMarketMode('supply')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${marketMode === 'supply' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
              >
                Объекты (Supply)
              </button>
              <button 
                onClick={() => setMarketMode('demand')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${marketMode === 'demand' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
              >
                <Users className="w-4 h-4" /> Покупатели (Demand)
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex gap-2 overflow-x-auto no-scrollbar">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4" /> Фильтры
            </button>
            {marketMode === 'supply' ? (
              <>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700">
                  Цена <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700">
                  Комнатность <ChevronDown className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700">
                  Бюджет <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700">
                  Статус <ChevronDown className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">{error}</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {marketMode === 'supply' 
                    ? `Найдено ${properties.length} объектов` 
                    : 'Найдено 3 активных покупателя'}
                </p>
                
                {marketMode === 'supply' ? (
                  properties.map((prop) => (
                <div 
                  key={prop.id}
                  onClick={() => setActiveView('passport')}
                  onMouseEnter={() => setSelectedItem(prop.id)}
                  onMouseLeave={() => setSelectedItem(null)}
                  className={`group flex flex-col bg-white dark:bg-gray-800 border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    selectedItem === prop.id 
                      ? 'border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-none ring-1 ring-indigo-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={prop.image} alt={prop.address} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> Проверено в Росреестре
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{prop.price}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{prop.address}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300 mb-4">
                      <span className="flex items-center gap-1"><Building className="w-4 h-4 text-gray-400" /> {prop.rooms} комн.</span>
                      <span>{prop.area} м²</span>
                      <span>Этаж {prop.floor}</span>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 mb-4 flex justify-between items-center border border-indigo-100 dark:border-indigo-800/50">
                      <div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Стакан офферов</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{prop.bids} предложений</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Лучшая цена</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{prop.topBid}</p>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(prop.id);
                        if (!isAuthenticated) {
                          setIsAuthModalOpen(true);
                        } else {
                          setIsOfferModalOpen(true);
                        }
                      }}
                      className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" /> Предложить свою цену
                    </button>
                  </div>
                </div>
              ))
            ) : (
              MOCK_BUYERS.map((buyer) => (
                <div 
                  key={buyer.id}
                  onMouseEnter={() => setSelectedItem(buyer.id)}
                  onMouseLeave={() => setSelectedItem(null)}
                  className={`group flex flex-col bg-white dark:bg-gray-800 border rounded-2xl p-5 transition-all duration-200 cursor-pointer ${
                    selectedItem === buyer.id 
                      ? 'border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-none ring-1 ring-indigo-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{buyer.name}</h3>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{buyer.budget}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">
                      {buyer.status}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    "{buyer.request}"
                  </p>

                  <button className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl font-semibold transition-colors text-sm">
                    Предложить объект
                  </button>
                </div>
              ))
            )}
              </>
            )}
          </div>
        </div>

        {/* Right Area - Map Mockup */}
        <div className="flex-1 relative bg-[#e5e3df] dark:bg-[#1a1a1a] h-full">
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">+</span>
            </button>
            <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">-</span>
            </button>
          </div>

          {/* Map Pins */}
          {marketMode === 'supply' ? (
            properties.map((prop, index) => {
              const top = `${30 + index * 20}%`;
              const left = `${40 + (index % 2 === 0 ? 10 : -10)}%`;
              const isSelected = selectedItem === prop.id;
              
              // Liquidity colors
              let liquidityColor = 'bg-white border-indigo-600 text-indigo-900 dark:bg-gray-800 dark:text-white dark:border-indigo-500';
              let pointerColor = 'bg-white border-indigo-600 dark:bg-gray-800 dark:border-indigo-500';
              
              if (showLiquidity) {
                if (prop.liquidity === 'high') {
                  liquidityColor = 'bg-green-500 border-green-600 text-white';
                  pointerColor = 'bg-green-500 border-green-600';
                } else if (prop.liquidity === 'medium') {
                  liquidityColor = 'bg-yellow-500 border-yellow-600 text-white';
                  pointerColor = 'bg-yellow-500 border-yellow-600';
                } else {
                  liquidityColor = 'bg-red-500 border-red-600 text-white';
                  pointerColor = 'bg-red-500 border-red-600';
                }
              }

              if (isSelected) {
                liquidityColor = 'bg-indigo-600 border-white text-white dark:border-gray-900';
                pointerColor = 'bg-indigo-600 border-white dark:border-gray-900';
              }

              return (
                <div 
                  key={prop.id}
                  className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10"
                  style={{ top, left }}
                  onMouseEnter={() => setSelectedItem(prop.id)}
                  onMouseLeave={() => setSelectedItem(null)}
                >
                  <div className={`relative flex flex-col items-center transition-transform duration-300 ${isSelected ? 'scale-110 z-20' : 'scale-100'}`}>
                    <div className={`px-3 py-1.5 rounded-full font-bold text-sm shadow-lg border-2 whitespace-nowrap ${liquidityColor}`}>
                      {prop.price.split(' ')[0]} млн ₽
                    </div>
                    <div className={`w-3 h-3 rotate-45 -mt-1.5 border-r-2 border-b-2 ${pointerColor}`}></div>
                  </div>
                </div>
              );
            })
          ) : (
            MOCK_BUYERS.map((buyer, index) => {
              const top = `${25 + index * 25}%`;
              const left = `${35 + (index % 2 === 0 ? 20 : -5)}%`;
              const isSelected = selectedItem === buyer.id;

              return (
                <div 
                  key={buyer.id}
                  className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10"
                  style={{ top, left }}
                  onMouseEnter={() => setSelectedItem(buyer.id)}
                  onMouseLeave={() => setSelectedItem(null)}
                >
                  <div className={`relative flex flex-col items-center transition-transform duration-300 ${isSelected ? 'scale-110 z-20' : 'scale-100'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 ${
                      isSelected 
                        ? 'bg-indigo-600 border-white text-white dark:border-gray-900' 
                        : 'bg-white border-indigo-600 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400 dark:border-indigo-500'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <div className="absolute top-full mt-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 whitespace-nowrap z-30">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{buyer.budget}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Map Layers Control */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4 text-sm font-medium">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><Layers className="w-4 h-4"/> Слои:</span>
            <button 
              onClick={() => setShowLiquidity(false)}
              className={`${!showLiquidity ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600'}`}
            >
              Цены
            </button>
            <button 
              onClick={() => {
                setMarketMode('supply');
                setShowLiquidity(true);
              }}
              className={`flex items-center gap-1 ${showLiquidity ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600'}`}
            >
              <Activity className="w-4 h-4" /> Ликвидность
            </button>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <AnimatePresence>
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {offerSuccess ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Оффер отправлен!</h3>
                  <p className="text-gray-500 dark:text-gray-400">Собственник получил уведомление. Ваш оффер добавлен в стакан предложений.</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Сделать оффер</h3>
                    <button onClick={() => setIsOfferModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleOfferSubmit} className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ваша цена (₽)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          required
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder="Например, 44 000 000" 
                          className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₽</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Текущая цена: 45 000 000 ₽. Лучший оффер: 44 500 000 ₽.</p>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                        Делая оффер, вы подтверждаете серьезность намерений. В случае согласия продавца, система сгенерирует предварительный договор.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setIsOfferModalOpen(false)} className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Отмена
                      </button>
                      <button type="submit" className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        Отправить
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
