import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Building2, DollarSign, FileText, Settings, LogOut, TrendingUp, AlertCircle } from 'lucide-react';
import { getAuthToken, authAPI, propertiesAPI } from '../services/api';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'offers'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalOffers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/');
        return;
      }

      const result = await authAPI.getCurrentUser();
      if (result.success && result.data) {
        // Проверяем, что пользователь - агент или админ
        if (result.data.role !== 'agent' && result.data.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        setUser(result.data);
        
        // Загружаем статистику
        const propsResult = await propertiesAPI.search({ limit: 1000 });
        if (propsResult.success && propsResult.data) {
          setStats({
            totalUsers: 3, // TODO: добавить API для подсчета пользователей
            totalProperties: propsResult.data.length,
            totalOffers: propsResult.data.reduce((sum: number, p: any) => sum + (p.offers_count || 0), 0),
            totalRevenue: 0,
          });
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 dark:text-white">TrueDom</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Админ-панель</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Обзор</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Пользователи</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'properties'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Объекты</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'offers'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">Офферы</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'overview' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Обзор системы</h1>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Пользователей</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalProperties}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Объектов</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalOffers}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Офферов</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {(stats.totalRevenue / 1_000_000).toFixed(1)}M ₽
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Оборот</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Быстрые действия</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Перейти на карту</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Просмотр объектов</p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Экспорт данных</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Скачать отчет</p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Настройки</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Конфигурация системы</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Управление пользователями</h1>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-5 h-5" />
                  <p>Функционал в разработке</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Управление объектами</h1>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-5 h-5" />
                  <p>Функционал в разработке</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Управление офферами</h1>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-5 h-5" />
                  <p>Функционал в разработке</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
