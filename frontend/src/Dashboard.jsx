import { 
  Typography, Paper, Box, List, ListItem, 
  ListItemText, Avatar, Divider, Chip 
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupsIcon from '@mui/icons-material/Groups';
import dayjs from 'dayjs';

function Dashboard() {
  const userName = '홍길동'; 
  const totalBalance = 150000;
  const memberCount = 8;

  const upcomingSchedules = [
    { id: 1, date: dayjs().format('YYYY-MM-DD'), title: '랩실 주간 회의' },
    { id: 2, date: dayjs().add(3, 'day').format('YYYY-MM-DD'), title: '프로젝트 중간 점검' },
  ];

  const recentTransactions = [
    { id: 1, date: '2026-04-18', type: 'expense', description: '랩실 커피 캡슐 구매', amount: 35000 },
    { id: 2, date: '2026-04-15', type: 'income', description: '4월 정기 회비 (이영희)', amount: 10000 },
    { id: 3, date: '2026-04-15', type: 'income', description: '4월 정기 회비 (김철수)', amount: 10000 },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1100px', mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}> 
      
      {/* 환영 배너 */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.dark', mb: 1 }}>
          환영합니다, {userName}님!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          오늘도 활기찬 하루 보내세요. 현재 랩실 현황을 요약해 드릴게요.
        </Typography>
      </Box>

      {/* 상단 요약 위젯 영역 (가로 전체를 3등분) */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3, 
          mb: 4
        }}
      >
        {/* 요약 위젯 1: 총 잔액 */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)', color: 'white', boxShadow: '0 4px 20px rgba(103, 58, 183, 0.15)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
            <AccountBalanceWalletIcon fontSize="large" />
            <Typography variant="h6" fontWeight="bold">랩실 공금 잔액</Typography>
          </Box>
          <Typography variant="h3" fontWeight="bold" textAlign="right">
            {totalBalance.toLocaleString()} 원
          </Typography>
        </Paper>

        {/* 요약 위젯 2: 랩실 인원 */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main', mb: 3 }}>
            <GroupsIcon fontSize="large" />
            <Typography variant="h6" fontWeight="bold">우리 랩실 인원</Typography>
          </Box>
          <Typography variant="h3" fontWeight="bold" textAlign="right" color="text.primary">
            총 {memberCount} 명
          </Typography>
        </Paper>

        {/* 요약 위젯 3: 오늘 일정 수 */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'info.main', mb: 3 }}>
            <EventIcon fontSize="large" />
            <Typography variant="h6" fontWeight="bold">오늘 예정된 일정</Typography>
          </Box>
          <Typography variant="h3" fontWeight="bold" textAlign="right" color="text.primary">
            {upcomingSchedules.filter(s => s.date === dayjs().format('YYYY-MM-DD')).length} 개
          </Typography>
        </Paper>
      </Box>

      {/* 하단 리스트 영역 (가로 전체를 2등분) */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3 
        }}
      >
        {/* 다가오는 일정 리스트 */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            다가오는 일정
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            {upcomingSchedules.map((schedule) => (
              <ListItem key={schedule.id} sx={{ px: 0, py: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 40, height: 40 }}>
                  <EventIcon fontSize="small" sx={{ color: 'primary.dark' }} />
                </Avatar>
                <ListItemText 
                  primary={<Typography fontWeight="bold">{schedule.title}</Typography>} 
                  secondary={schedule.date} 
                />
                {schedule.date === dayjs().format('YYYY-MM-DD') && (
                  <Chip label="오늘" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                )}
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* 최근 장부 내역 */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            최근 장부 내역
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            {recentTransactions.map((tx) => (
              <ListItem key={tx.id} sx={{ px: 0, py: 1.5 }}>
                <ListItemText 
                  primary={<Typography fontWeight="bold">{tx.description}</Typography>} 
                  secondary={tx.date} 
                />
                <Typography 
                  fontWeight="bold" 
                  color={tx.type === 'income' ? 'success.main' : 'error.main'}
                >
                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} 원
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard;