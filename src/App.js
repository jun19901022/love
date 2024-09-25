import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoibXV5YW5mdSIsImEiOiJ6UUZKT2tjIn0.L1s3f-7eyMZ5IplzE6K4Lg';  // 使用你的 Mapbox Access Token

const App = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState(() => {
    const savedMarkers = localStorage.getItem('markers');
    return savedMarkers ? JSON.parse(savedMarkers) : [];
  });
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [newMessage, setNewMessage] = useState('');

  // 蓝色小爱心图标的 URL，确保你在 public 文件夹下有这个图片
  const heartIconUrl = '/blue-heart.png'; 

  useEffect(() => {
    if (map.current) return; // 防止重复初始化地图

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11', // 使用 Mapbox 默认样式
      center: [121.4737, 31.2304], // 上海坐标
      zoom: 10,
    });

    // 从 localStorage 中加载标记并显示在地图上
    markers.forEach((m) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${heartIconUrl})`;
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundSize = 'cover';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(m.lngLat)
        .setPopup(new mapboxgl.Popup().setText(m.description))
        .addTo(map.current);

      m.markerInstance = marker; // 记住 marker 实例
    });

    // 点击地图时添加标记
    map.current.on('click', (e) => {
      const description = prompt('请输入该标记的描述:');
      if (!description) return;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${heartIconUrl})`;
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundSize = 'cover';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(e.lngLat)
        .setPopup(new mapboxgl.Popup().setText(description))
        .addTo(map.current);

      // 将新标记添加到 state
      const newMarker = { id: markers.length, markerInstance: marker, lngLat: e.lngLat, description };
      const updatedMarkers = [...markers, newMarker];
      setMarkers(updatedMarkers);
      localStorage.setItem('markers', JSON.stringify(updatedMarkers));
    });
  }, [markers]);

  // 处理提交留言
  const handleSubmitMessage = () => {
    if (newMessage.trim() !== '') {
      const messageWithTime = {
        text: newMessage,
        time: new Date().toLocaleString(),
      };
      const updatedMessages = [...messages, messageWithTime];
      setMessages(updatedMessages);
      setNewMessage('');
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
    }
  };

  // 删除特定留言
  const handleDeleteMessage = (indexToDelete) => {
    const updatedMessages = messages.filter((_, index) => index !== indexToDelete);
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  // 删除特定标记
  const handleDeleteMarker = (idToDelete) => {
    const updatedMarkers = markers.filter((m) => m.id !== idToDelete);
    const markerToDelete = markers.find((m) => m.id === idToDelete);
    if (markerToDelete) {
      markerToDelete.markerInstance.remove(); // 从地图上删除标记
    }
    setMarkers(updatedMarkers);
    localStorage.setItem('markers', JSON.stringify(updatedMarkers)); // 更新 localStorage
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '75%', height: '100%' }} />

      <div style={{ width: '25%', padding: '10px', backgroundColor: '#f8f8f8', overflowY: 'auto' }}>
        <h2>Love Place Map</h2>
        {/* 右侧标记列表 */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {markers.map((m, index) => (
            <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div>
                <strong>标记点 {index + 1}</strong>
                <br />
                经度: {m.lngLat.lng.toFixed(4)}, 纬度: {m.lngLat.lat.toFixed(4)}
                <br />
                描述: {m.description}
              </div>
              <button onClick={() => handleDeleteMarker(m.id)} style={{ marginTop: '5px', padding: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px' }}>
                删除标记
              </button>
            </li>
          ))}
        </ul>

        {/* 留言板 */}
        <h2>留言板</h2>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="请输入留言"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button onClick={handleSubmitMessage} style={{ padding: '5px 10px' }}>
          发送留言
        </button>
        <ul>
          {messages.map((message, index) => (
            <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div>{message.text}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>时间: {message.time}</div>
              <button onClick={() => handleDeleteMessage(index)} style={{ marginTop: '5px', padding: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px' }}>
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
