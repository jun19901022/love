import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';  // 用来上传图片到 Cloudinary

mapboxgl.accessToken = 'pk.eyJ1IjoibXV5YW5mdSIsImEiOiJ6UUZKT2tjIn0.L1s3f-7eyMZ5IplzE6K4Lg';  // 使用你的 Mapbox Access Token

const App = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]); // 用于存储标记
  const [messages, setMessages] = useState([]); // 用于存储留言板内容
  const [newMessage, setNewMessage] = useState(''); // 新留言输入框的值

  // 创建蓝色小爱心图标的函数
  const createHeartIcon = () => {
    const img = document.createElement('img');
    img.src = 'https://cdn-icons-png.flaticon.com/512/1402/14024999.png'; // 蓝色小爱心图标的 URL
    img.style.width = '30px';
    img.style.height = '30px';
    return img;
  };

  // 创建上传图片的弹出框内容
  const createPopupContent = useCallback((marker) => {
    const div = document.createElement('div');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', '19901022'); // Cloudinary Upload Preset
        axios.post('https://api.cloudinary.com/v1_1/dgoohpjdm/image/upload', formData)
          .then((response) => {
            const img = document.createElement('img');
            img.src = response.data.secure_url;
            img.style.width = '100px';
            img.style.height = '100px';
            div.appendChild(img); // 在气泡框中显示图片
          })
          .catch((error) => {
            console.error('上传失败:', error);
          });
      }
    };

    div.appendChild(input);
    return div;
  }, []);

  useEffect(() => {
    if (map.current) return; // 防止重复初始化地图

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11', // 使用默认 Mapbox 样式
      center: [121.4737, 31.2304], // 上海坐标
      zoom: 10,
    });

    map.current.on('click', (e) => {
      const marker = new mapboxgl.Marker({ element: createHeartIcon() })
        .setLngLat(e.lngLat)
        .addTo(map.current);

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      }).setDOMContent(createPopupContent(marker));

      marker.setPopup(popup).togglePopup();

      const newMarker = { id: markers.length, marker, lngLat: e.lngLat };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    });
  }, [markers.length, createPopupContent]);

  // 删除标记功能
  const removeMarker = (id) => {
    const markerToRemove = markers.find((m) => m.id === id);
    if (markerToRemove) {
      markerToRemove.marker.remove(); // 从地图上删除标记
      setMarkers(markers.filter((m) => m.id !== id)); // 从列表中删除
    }
  };

  // 提交留言板新消息
  const handleSubmitMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, newMessage]);
      setNewMessage(''); // 清空输入框
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
          {markers.map((m, index) => (
            <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div>
                <strong>标记点 {index + 1}</strong>
                <br />
                经度: {m.lngLat.lng.toFixed(4)}, 纬度: {m.lngLat.lat.toFixed(4)}
              </div>
              <button onClick={() => removeMarker(m.id)} style={{ marginTop: '5px', padding: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px' }}>
                删除
              </button>
            </li>
          ))}
        </ul>

        {/* 留言板 */}
        <h2>留言板</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {messages.map((message, index) => (
            <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              {message}
            </li>
          ))}
        </ul>

        {/* 留言输入框 */}
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="请输入留言"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button onClick={handleSubmitMessage} style={{ padding: '5px 10px' }}>
          提交留言
        </button>
      </div>
    </div>
  );
};

export default App;
