import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import type { Villa } from '@/types';
import { formatCurrency } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

interface VillaMapProps {
  villas: Villa[];
  onVillaClick: (villaId: string) => void;
  selectedVillaId?: string | null;
}

// Custom marker icon
const villaIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjU3MzE2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDEwYzAgNi04IDEwLTggMTBzLTgtNC04LTEwYTggOCAwIDAgMSAxNiAwWiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const selectedVillaIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y1NzMxNiIgc3Ryb2tlPSIjZjU3MzE2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDEwYzAgNi04IDEwLTggMTBzLTgtNC04LTEwYTggOCAwIDAgMSAxNiAwWiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Map bounds component
function MapBounds({ villas }: { villas: Villa[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (villas.length > 0) {
      const bounds = villas.map(v => [v.coordinates.lat, v.coordinates.lng]);
      map.fitBounds(bounds as unknown as [[number, number], [number, number]], { padding: [50, 50] });
    }
  }, [villas, map]);
  
  return null;
}

export default function VillaMap({ villas, onVillaClick, selectedVillaId }: VillaMapProps) {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: -6.2088, lng: 106.8456 });

  useEffect(() => {
    if (villas.length > 0) {
      const avgLat = villas.reduce((sum, v) => sum + v.coordinates.lat, 0) / villas.length;
      const avgLng = villas.reduce((sum, v) => sum + v.coordinates.lng, 0) / villas.length;
      setCenter({ lat: avgLat, lng: avgLng });
    }
  }, [villas]);

  if (villas.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No villas to display</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds villas={villas} />
      
      {villas.map((villa) => (
        <Marker
          key={villa.id}
          position={[villa.coordinates.lat, villa.coordinates.lng]}
          icon={selectedVillaId === villa.id ? selectedVillaIcon : villaIcon}
          eventHandlers={{
            click: () => onVillaClick(villa.id),
          }}
        >
          <Popup>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-2 min-w-[200px]"
            >
              <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                <img
                  src={villa.images[0]}
                  alt={villa.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {villa.rating}
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                {villa.title}
              </h4>
              <p className="text-sm text-gray-500 mb-2">{villa.location}</p>
              <div className="flex items-center justify-between">
                <span className="text-orange-600 font-bold">
                  {formatCurrency(villa.pricePerNight)}
                </span>
                <span className="text-xs text-gray-500">/night</span>
              </div>
              <button
                onClick={() => onVillaClick(villa.id)}
                className="mt-3 w-full py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
              >
                View Details
              </button>
            </motion.div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
