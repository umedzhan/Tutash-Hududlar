import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { LatLngExpression } from 'leaflet';
import type { Region } from '../types';
import { REGION_STATUS_COLOR, REGION_STATUS_LABEL } from '../lib/status';
import { DrawControl, type DrawnPolygon } from './DrawControl';

const TERMIZ_CENTER: LatLngExpression = [37.224, 67.278];

function toLatLngs(coordinates: number[][][]): LatLngExpression[] {
  return coordinates[0].map(([lng, lat]) => [lat, lng]);
}

function FitBounds({ regions }: { regions: Region[] }) {
  const map = useMap();
  useEffect(() => {
    if (regions.length === 0) return;
    const allPoints = regions.flatMap((r) => toLatLngs(r.geometry.coordinates));
    if (allPoints.length > 0) {
      map.fitBounds(allPoints as [number, number][], { padding: [30, 30] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions.length]);
  return null;
}

interface MapViewProps {
  regions: Region[];
  height?: string;
  selectable?: boolean;
  selectedId?: string | null;
  onSelect?: (region: Region) => void;
  drawable?: boolean;
  onPolygonDrawn?: (polygon: DrawnPolygon) => void;
  onPolygonCleared?: () => void;
}

export function MapView({
  regions,
  height = '360px',
  selectable = false,
  selectedId,
  onSelect,
  drawable = false,
  onPolygonDrawn,
  onPolygonCleared,
}: MapViewProps) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-lg">
      <MapContainer center={TERMIZ_CENTER} zoom={16} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds regions={regions} />
        {drawable && onPolygonDrawn && <DrawControl onCreated={onPolygonDrawn} onCleared={onPolygonCleared} />}
        {regions.map((region) => {
          const isSelected = region._id === selectedId;
          return (
            <Polygon
              key={region._id}
              positions={toLatLngs(region.geometry.coordinates)}
              pathOptions={{
                color: isSelected ? '#0f2657' : REGION_STATUS_COLOR[region.status],
                fillColor: REGION_STATUS_COLOR[region.status],
                fillOpacity: isSelected ? 0.75 : 0.5,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={selectable ? { click: () => onSelect?.(region) } : undefined}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">{region.address}</p>
                  <p>Maydon: {region.areaM2} m²</p>
                  <p>Holati: {REGION_STATUS_LABEL[region.status]}</p>
                  {selectable && (
                    <button
                      onClick={() => onSelect?.(region)}
                      className="mt-2 rounded bg-brand px-2 py-1 text-xs text-white"
                    >
                      Tanlash
                    </button>
                  )}
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}
