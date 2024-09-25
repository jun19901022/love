import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibXV5YW5mdSIsImEiOiJ6UUZKT2tjIn0.L1s3f-7eyMZ5IplzE6K4Lg';  // 使用你的 Mapbox Access Token

const App = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]); // 用于存储标记

  useEffect(() => {
    if (map.current) return; // 防止重复初始化地图

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11', // 使用 Mapbox 默认样式
      center: [121.4737, 31.2304], // 上海坐标
      zoom: 10,
    });

    // 点击地图时添加标记
    map.current.on('click', (e) => {
      const marker = new mapboxgl.Marker()
        .setLngLat(e.lngLat)
        .addTo(map.current);

      // 创建气泡框容器，并添加上传图片功能
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      }).setDOMContent(createPopupContent(marker));

      // 设置标记的气泡框
      marker.setPopup(popup).togglePopup();

      // 添加标记到列表中
      const newMarker = { id: markers.length, marker, lngLat: e.lngLat };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    });
  }, [markers]);

  // 创建上传图片的弹出框内容
  const createPopupContent = (marker) => {
    const div = document.createElement('div');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.width = '100px';
          img.style.height = '100px';
          div.appendChild(img); // 在气泡框中显示图片
        };
        reader.readAsDataURL(file);
      }
    };

    div.appendChild(input);
    return div;
  };

  // 删除标记功能
  const removeMarker = (id) => {
    const markerToRemove = markers.find((m) => m.id === id);
    if (markerToRemove) {
      markerToRemove.marker.remove(); // 从地图上删除标记
      setMarkers(markers.filter((m) => m.id !== id)); // 从列表中删除
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 地图容器 */}
      <div ref={mapContainer} style={{ width: '75%', height: '100%' }} />

      {/* 右侧标记列表 */}
      <div style={{ width: '25%', padding: '10px', backgroundColor: '#f8f8f8', overflowY: 'auto' }}>
        <h2>Love Place Map</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {markers.map((m) => (
            <li key={m.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div>
                <strong>标记点 {m.id + 1}</strong>
                <br />
                经度: {m.lngLat.lng.toFixed(4)}, 纬度: {m.lngLat.lat.toFixed(4)}
              </div>
              <button onClick={() => removeMarker(m.id)} style={{ marginTop: '5px', padding: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px' }}>
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
