import React, { useEffect, useRef, useState } from 'react';

// Uses OpenStreetMap tiles — completely free, no API key needed
// Renders via Leaflet loaded from CDN

export default function MapPreview({ lat, lng, accuracy, status }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const markerRef   = useRef(null);
  const circleRef   = useRef(null);
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  // Load Leaflet CSS + JS from CDN once
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }

    // CSS
    if (!document.getElementById('leaflet-css')) {
      const link  = document.createElement('link');
      link.id     = 'leaflet-css';
      link.rel    = 'stylesheet';
      link.href   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // JS
    if (!document.getElementById('leaflet-js')) {
      const script    = document.createElement('script');
      script.id       = 'leaflet-js';
      script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload   = () => setLeafletReady(true);
      document.head.appendChild(script);
    }
  }, []);

  // Init map once Leaflet is ready and container exists
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstance.current) return;

    const L = window.L;

    // Dark-styled map using CartoDB Dark Matter tiles
    mapInstance.current = L.map(mapRef.current, {
      zoomControl:       true,
      attributionControl: false,
      scrollWheelZoom:   true,
    }).setView([12.9716, 77.5946], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Attribution (small, bottom right)
    L.control.attribution({ prefix: false })
      .addAttribution('© <a href="https://carto.com/" style="color:#60a5fa">CARTO</a> © <a href="https://www.openstreetmap.org/copyright" style="color:#60a5fa">OSM</a>')
      .addTo(mapInstance.current);

  }, [leafletReady]);

  // Update marker + accuracy circle whenever coordinates change
  useEffect(() => {
    if (!leafletReady || !mapInstance.current || !lat || !lng) return;

    const L   = window.L;
    const map = mapInstance.current;

    // Remove old marker/circle
    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
    if (circleRef.current) { map.removeLayer(circleRef.current); circleRef.current = null; }

    // Custom pulsing marker icon
    const pulseIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:20px;height:20px">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:${status === 'success' ? '#2563eb' : '#f59e0b'};
            border:2.5px solid white;
            box-shadow:0 0 0 0 ${status === 'success' ? 'rgba(37,99,235,0.6)' : 'rgba(245,158,11,0.6)'};
            animation:pulse-marker 1.8s ease-out infinite;
            z-index:2;
          "></div>
          <div style="
            position:absolute;inset:-6px;border-radius:50%;
            background:${status === 'success' ? 'rgba(37,99,235,0.15)' : 'rgba(245,158,11,0.15)'};
            animation:pulse-ring 1.8s ease-out infinite;
          "></div>
        </div>
      `,
      iconSize:   [20, 20],
      iconAnchor: [10, 10],
      popupAnchor:[0, -14],
    });

    // Accuracy circle
    if (accuracy && accuracy < 5000) {
      circleRef.current = L.circle([lat, lng], {
        radius:      accuracy,
        color:       status === 'success' ? '#2563eb' : '#f59e0b',
        fillColor:   status === 'success' ? '#2563eb' : '#f59e0b',
        fillOpacity: 0.08,
        weight:      1,
        dashArray:   '4 4',
      }).addTo(map);
    }

    // Marker with popup
    markerRef.current = L.marker([lat, lng], { icon: pulseIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:'DM Mono',monospace;font-size:12px;line-height:1.8;min-width:160px">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px;color:#1e293b">
            ${status === 'success' ? '📍 Your Location' : '📍 Simulated Location'}
          </div>
          <div>Lat: <b>${lat.toFixed(6)}</b></div>
          <div>Lng: <b>${lng.toFixed(6)}</b></div>
          ${accuracy ? `<div>Accuracy: <b>±${accuracy.toFixed(0)}m</b></div>` : ''}
          <div style="font-size:10px;color:#64748b;margin-top:4px">${new Date().toLocaleTimeString()}</div>
        </div>
      `, { maxWidth: 220 })
      .openPopup();

    // Fly to location smoothly
    map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });

  }, [lat, lng, accuracy, status, leafletReady]);

  // Inject keyframes for pulsing marker
  useEffect(() => {
    if (document.getElementById('map-keyframes')) return;
    const style = document.createElement('style');
    style.id    = 'map-keyframes';
    style.textContent = `
      @keyframes pulse-marker {
        0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.6); }
        70%  { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
        100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
      }
      @keyframes pulse-ring {
        0%   { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      .leaflet-popup-content-wrapper {
        border-radius: 10px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
      }
      .leaflet-popup-tip-container { margin-top: -1px; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', height: '100%' }}>
      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0a0d14' }} />

      {/* Overlay when no location yet */}
      {!lat && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,13,20,0.85)', backdropFilter: 'blur(4px)',
          gap: 10, zIndex: 1000,
        }}>
          <div style={{ fontSize: 32 }}>🗺️</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Capture location to see map</div>
        </div>
      )}

      {/* Leaflet loading overlay */}
      {!leafletReady && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0d14', zIndex: 1001,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            border: '2px solid #1e2230', borderTopColor: '#2563eb',
            animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      )}

      {/* Coordinates badge overlay */}
      {lat && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10, zIndex: 999,
          background: 'rgba(10,13,20,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid #1e2230', borderRadius: 8,
          padding: '6px 10px', fontSize: 11,
          fontFamily: "'DM Mono', monospace", color: '#9ca3af',
          lineHeight: 1.6,
        }}>
          <div style={{ color: status === 'success' ? '#4ade80' : '#fb923c', fontWeight: 600, marginBottom: 2, fontSize: 10 }}>
            {status === 'success' ? '● LIVE' : '● SIMULATED'}
          </div>
          <div>{lat.toFixed(6)}</div>
          <div>{lng.toFixed(6)}</div>
          {accuracy && <div style={{ color: '#4b5563' }}>±{accuracy.toFixed(0)}m</div>}
        </div>
      )}
    </div>
  );
}
