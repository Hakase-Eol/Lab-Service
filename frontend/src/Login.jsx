import { useState } from 'react';
import api from './api';

function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 백엔드가 OAuth2 형식을 쓰기 때문에 URLSearchParams로 변환해서 전송해야 함
      const formData = new URLSearchParams();
      formData.append('username', studentId);
      formData.append('password', password);

      const response = await api.post('/users/login', formData);
      
      // 로그인 성공 시 localStorage에 토큰 저장
      localStorage.setItem('token', response.data.access_token);
      alert('로그인 성공! 토큰을 발급받았습니다.');
    } catch (error) {
      alert('로그인 실패: 학번이나 비밀번호를 확인해주세요.');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', width: '300px', margin: '20px auto' }}>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="학번" 
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)} 
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="password" 
            placeholder="비밀번호" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>로그인</button>
      </form>
    </div>
  );
}

export default Login;