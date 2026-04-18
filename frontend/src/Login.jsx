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
      
      // 로그인 성공 시 알림을 띄우고 대시보드 화면으로 이동
      alert('로그인 성공!');
      navigate('/dashboard'); 
    } catch (error) {
      alert('로그인 실패: 학번이나 비밀번호를 확인해주세요.');
      console.error(error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {/* Paper는 그림자가 지는 깔끔한 카드 모양을 만들어줘 */}
      <Paper elevation={3} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          랩실 관리 시스템
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="학번"
            autoFocus
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
          >
            로그인
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;