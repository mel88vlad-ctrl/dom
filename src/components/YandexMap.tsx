import React, { useEffect, useRef, useState } from 'react';

interface MapPin {
  id: number;
  lat: number;
  lng: number;
  price: string;
  liquidity?: 'high' | 'medium' | 'low';
  type: 'property' | 'buyer';
}

interface YandexMapProps {
  pins: MapPin[];
  selectedId: number | null;
  onPinClick: (id: number) => void;
  showLiquidity: boolean;
  marketMode: 'supply' | 'demand';
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function YandexMap({ pins, selectedId, onPinClick, showLiquidity, marketMode }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadYandexMaps = () => {
      if (window.ymaps) {
        setIsLoaded(true);
        return;
      }

      // Проверяем, не загружается ли уже скрипт
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsLoaded(true));
        return;
      }

      const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
      
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        setError('Ошибка загрузки карты');
      };
      document.head.appendChild(script);
    };

    loadYandexMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    window.ymaps.ready(() => {
      const map = new window.ymaps.Map(mapRef.current, {
        center: [55.7558, 37.6173], // Москва
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl']
      });

      mapInstanceRef.current = map;
    });
  }, [isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.ymaps) return;

    const map = mapInstanceRef.current;
    map.geoObjects.removeAll();

    pins.forEach(pin => {
      const isSelected = selectedId === pin.id;
      
      let iconColor = '#4F46E5'; // indigo
      if (showLiquidity && pin.liquidity) {
        if (pin.liquidity === 'high') iconColor = '#10B981'; // green
        else if (pin.liquidity === 'medium') iconColor = '#F59E0B'; // yellow
        else iconColor = '#EF4444'; // red
      }
      if (isSelected) iconColor = '#4F46E5';

      let iconContent = '';
      let iconLayout = 'default#imageWithContent';
      
      if (pin.type === 'property') {
        iconContent = pin.price;
        
        const placemark = new window.ymaps.Placemark(
          [pin.lat, pin.lng],
          {
            iconContent: iconContent,
            balloonContent: pin.price
          },
          {
            preset: 'islands#blueStretchyIcon',
            iconColor: iconColor,
            iconContentLayout: window.ymaps.templateLayoutFactory.createClass(
              '<div style="padding: 4px 8px; font-weight: bold; font-size: 12px;">$[properties.iconContent]</div>'
            )
          }
        );

        placemark.events.add('click', () => {
          onPinClick(pin.id);
        });

        map.geoObjects.add(placemark);
      } else {
        // Покупатель
        const placemark = new window.ymaps.Placemark(
          [pin.lat, pin.lng],
          {
            balloonContent: pin.price
          },
          {
            preset: 'islands#blueCircleDotIcon',
            iconColor: iconColor
          }
        );

        placemark.events.add('click', () => {
          onPinClick(pin.id);
        });

        map.geoObjects.add(placemark);
      }
    });
  }, [pins, selectedId, showLiquidity, onPinClick]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Проверьте API ключ в .env файле
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка карты...</p>
          </div>
        </div>
      )}
    </div>
  );
}
