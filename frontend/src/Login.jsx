import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Container, Paper } from '@mui/material';
import api from './api';

function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', studentId);
      formData.append('password', password);
      const response = await api.post('/users/login', formData);
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard'); 
    } catch (error) {
      alert('로그인 실패: 학번이나 비밀번호를 확인해주세요.');
    }
  };

  return (
    // 전체 화면 배경에 페일 퍼플 그라데이션 적용
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      background: 'linear-gradient(180deg, #fdfbfb 0%, #f3e5f5 100%)' 
    }}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} sx={{ 
          padding: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          borderRadius: 4, // 둥글게 만들어 부드러운 느낌 추가
          backgroundColor: 'rgba(255, 255, 255, 0.9)' // 살짝 투명하게
        }}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
            🎓
          </Typography>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
            랩실 관리 시스템
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="학번 (Student ID)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              variant="outlined"
              color="primary"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              color="primary"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 4, mb: 2, py: 1.5, 
                fontWeight: 'bold', 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)' // 보라색 그림자
              }}
            >
              로그인하기
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;