import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { polygonAreaM2 } from '../lib/geo';

export interface DrawnPolygon {
  type: 'Polygon';
  coordinates: number[][][];
  areaM2: number;
}

interface DrawControlProps {
  onCreated: (polygon: DrawnPolygon) => void;
  onCleared?: () => void;
}

export function DrawControl({ onCreated, onCleared }: DrawControlProps) {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: true,
          showArea: true,
          shapeOptions: { color: '#0f2657', fillColor: '#2563eb' },
        },
        rectangle: { shapeOptions: { color: '#0f2657', fillColor: '#2563eb' } },
        marker: false,
        circle: false,
        circlemarker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    function toPolygon(layer: L.Layer): DrawnPolygon {
      const geoJson = (layer as L.Polygon).toGeoJSON();
      const coordinates = (geoJson.geometry as GeoJSON.Polygon).coordinates;
      const ring = coordinates[0] as [number, number][];
      return { type: 'Polygon', coordinates, areaM2: polygonAreaM2(ring) };
    }

    function handleCreated(e: L.LeafletEvent) {
      drawnItems.clearLayers();
      const layer = (e as L.DrawEvents.Created).layer;
      drawnItems.addLayer(layer);
      onCreated(toPolygon(layer));
    }

    function handleEdited(e: L.LeafletEvent) {
      const layers = (e as L.DrawEvents.Edited).layers;
      layers.eachLayer((layer) => onCreated(toPolygon(layer)));
    }

    function handleDeleted() {
      onCleared?.();
    }

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}
