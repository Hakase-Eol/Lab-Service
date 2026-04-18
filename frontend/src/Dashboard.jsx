import { Typography, Container, Box } from '@mui/material';

function Dashboard() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          🎉 환영합니다!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          로그인에 성공하여 메인 대시보드에 들어왔습니다.
          이제 여기에 랩실 정보와 일정, 회비 내역을 예쁘게 채워 넣을 거예요!
        </Typography>
      </Box>
    </Container>
  );
}

export default Dashboard;