import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import Papa from 'papaparse';

mapboxgl.accessToken = 'pk.eyJ1IjoibXV5YW5mdSIsImEiOiJ6UUZKT2tjIn0.L1s3f-7eyMZ5IplzE6K4Lg';  // 使用你的 Mapbox Access Token

const App = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const iconURL = 'https://cdn-icons-png.flaticon.com/512/14024/14024999.png'; // 蓝色爱心图标

  // 使用 useCallback 定义 addMarker，避免每次渲染时重新生成
  const addMarker = useCallback((lngLat, description = '') => {
    const el = document.createElement('img');
    el.src = iconURL;
    el.style.width = '30px';
    el.style.height = '30px';

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(lngLat)
      .setPopup(new mapboxgl.Popup().setText(description))
      .addTo(map.current);

    const newMarker = { id: markers.length, marker, lngLat, description };
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

    // 保存标记到本地存储
    const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    savedMarkers.push({ lngLat, description });
    localStorage.setItem('markers', JSON.stringify(savedMarkers));
  }, [markers]);

  // 使用 useCallback 定义 handleMapClick，避免每次渲染时重新生成
  const handleMapClick = useCallback((e) => {
    const description = prompt('请输入标记的描述:');
    addMarker(e.lngLat, description);
  }, [addMarker]);

  useEffect(() => {
    if (map.current) return; // 防止重复初始化地图

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [121.4737, 31.2304], // 上海坐标
      zoom: 10,
    });

    // 从本地存储中加载标记
    const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    savedMarkers.forEach((marker) => {
      addMarker(marker.lngLat, marker.description);
    });

    // 为地图绑定点击事件
    map.current.on('click', handleMapClick);

    // 从CSV文件加载标记
    axios.get('/5.csv')  // 确保CSV文件在public目录下
      .then((response) => {
        Papa.parse(response.data, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            result.data.forEach((row) => {
              const lngLat = { lng: parseFloat(row.longitude), lat: parseFloat(row.latitude) };
              const description = row.description;
              addMarker(lngLat, description);
            });
          },
        });
      })
      .catch((error) => console.error('CSV加载错误:', error));
  }, [addMarker, handleMapClick]);

  // 删除标记的函数
  const removeMarker = (id) => {
    const markerToRemove = markers.find((m) => m.id === id);
    if (markerToRemove) {
      markerToRemove.marker.remove(); // 从地图上删除标记
      setMarkers(markers.filter((m) => m.id !== id)); // 从列表中删除

      // 更新本地存储
      const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
      const updatedMarkers = savedMarkers.filter((m) => m.lngLat !== markerToRemove.lngLat);
      localStorage.setItem('markers', JSON.stringify(updatedMarkers));
    }
  };

  // 提交留言的函数
  const handleMessageSubmit = () => {
    if (!newMessage.trim()) return;
    const messageData = { text: newMessage, time: new Date().toLocaleString() };
    const updatedMessages = [...messages, messageData];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  // 删除留言的函数
  const handleDeleteMessage = (index) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    setMessages(savedMessages);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 地图容器 */}
      <div ref={mapContainer} style={{ width: '75%', height: '100%' }} />

      {/* 右侧标记列表和留言板 */}
      <div style={{ width: '25%', padding: '10px', backgroundColor: '#f8f8f8', overflowY: 'auto' }}>
        <h2>Love Place Map</h2>

        {/* 标记点列表 */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {markers.map((m, index) => (
            <li key={m.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div>
                <strong>标记点 {index + 1}</strong>
                <br />
                描述: {m.description || '无'}
                <br />
                经度: {m.lngLat.lng.toFixed(4)}, 纬度: {m.lngLat.lat.toFixed(4)}
              </div>
              <button
                onClick={() => removeMarker(m.id)}
                style={{ marginTop: '5px', padding: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px' }}
              >
                删除
              </button>
            </li>
          ))}
        </ul>

        {/* 留言板 */}
        <h2>留言板</h2>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="输入留言"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button onClick={handleMessageSubmit} style={{ padding: '5px 10px' }}>提交留言</button>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {messages.map((message, index) => (
            <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div>{message.text}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>时间: {message.time}</div>
              <button
                onClick={() => handleDeleteMessage(index)}
                style={{ marginTop: '5px', padding: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px' }}
              >
                删除留言
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
