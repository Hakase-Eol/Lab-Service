import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240; // 사이드바 너비

function Layout() {
  const navigate = useNavigate();

  // 사이드바에 들어갈 메뉴들
  const menuItems = [
    { text: '대시보드', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '랩실 관리', icon: <GroupIcon />, path: '/lab' },
    { text: '일정 관리', icon: <EventNoteIcon />, path: '/schedule' },
    { text: '회비 및 장부', icon: <AccountBalanceWalletIcon />, path: '/finance' },
  ];

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('안전하게 로그아웃 되었어요.');
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 왼쪽 사이드바 영역 */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #fdfbfb 0%, #f3e5f5 100%)',
            
            borderRight: 'none', // 테두리 선 제거
            boxShadow: '2px 0 5px rgba(0,0,0,0.05)', // 그림자
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 2, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            랩실 관리 시스템
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {/* 메뉴 리스트 */}
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon sx={{ color: '#555' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: '#333' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mt: 'auto' }} />
        
        {/* 하단 로그아웃 버튼 */}
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="로그아웃" sx={{ color: 'error.main', fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* 오른쪽 메인 콘텐츠 영역 */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;