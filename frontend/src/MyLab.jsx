import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Divider, Grid, Avatar, Chip, CircularProgress } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import api from './api';

function MyLab() {
  const [labInfo, setLabInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabInfo = async () => {
      try {
        const response = await api.get('/labs/my-lab');
        setLabInfo(response.data);
      } catch (error) {
        console.error("랩실 정보를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabInfo();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!labInfo) {
    return (
      // Box를 사용해서 화면의 남은 공간 정중앙에 배치되도록 설정
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '70vh' // 화면 높이의 70% 정도를 차지하게 해서 수직 중앙 정렬
      }}>
        <Typography variant="h5" sx={{ color: '#9e9e9e', fontWeight: 'bold', mb: 2 }}>
          아직 소속된 랩실이 없어요.
        </Typography>
        <Typography variant="body1" sx={{ color: '#bdbdbd' }}>
          랩실을 새로 개설하거나 기존 랩실에 가입해 보세요!
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      {/* 1. 랩실 기본 정보 카드 */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, mb: 4, background: 'rgba(255, 255, 255, 0.9)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <GroupIcon />
          </Avatar>
          <Typography variant="h4" fontWeight="bold">
            {labInfo.name}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {labInfo.description || "랩실 설명이 없습니다."}
        </Typography>
        <Divider />
        <Box sx={{ mt: 2 }}>
          <Chip label={`생성일: ${new Date(labInfo.created_at).toLocaleDateString()}`} variant="outlined" sx={{ mr: 1 }} />
          <Chip label={`멤버 수: ${labInfo.members?.length || 0}명`} color="primary" variant="outlined" />
        </Box>
      </Paper>

      {/* 2. 멤버 목록 섹션 */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, ml: 1 }}>
        👥 우리 랩실 멤버들
      </Typography>
      <Grid container spacing={3}>
        {labInfo.members?.map((member) => (
          <Grid item xs={12} sm={6} key={member.id}>
            <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {member.name} ({member.student_id})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.is_admin ? "관리자" : "멤버"}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default MyLab;