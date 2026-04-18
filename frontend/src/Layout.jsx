import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Typography, Divider, Avatar 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import api from './api';

const drawerWidth = 260;

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 사용자 및 랩실 정보 상태
  const [userInfo, setUserInfo] = useState({
    name: '홍길동', // api에서 가져올 이름
    labName: '그래픽스',
    role: '랩원' // '랩장' 또는 '랩원'
  });

  useEffect(() => {
    // const fetchUser = async () => {
    //   const res = await api.get('/auth/me');
    //   setUserInfo({ name: res.data.name, labName: res.data.labName, role: res.data.role });
    // };
    // fetchUser();
  }, []);

  const menuItems = [
    { text: '대시보드', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '랩실 관리', icon: <GroupsIcon />, path: '/lab' },
    { text: '일정 확인하기', icon: <EventNoteIcon />, path: '/schedule' },
    { text: '회비 및 장부', icon: <AccountBalanceWalletIcon />, path: '/finance' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            borderRight: 'none',
            background: 'linear-gradient(180deg, #fdfbfb 0%, #f3e5f5 100%)'
          },
        }}
      >
        {/* 서비스 로고 부분 */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            랩실 관리 시스템
          </Typography>
        </Box>

        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(103, 58, 183, 0.05)',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40, mb: 0.5 }}>
              {userInfo.name[0]}
            </Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                반가워요, {userInfo.name}님!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userInfo.labName} {userInfo.role}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mx: 2, mb: 1 }} />

        {/* 메뉴 리스트 */}
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{ 
                  borderRadius: 2,
                  '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } },
                  '&.Mui-selected:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* 로그아웃 버튼 (하단 고정) */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <ListItemButton onClick={() => navigate('/')} sx={{ borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="로그아웃" />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* 우측 메인 콘텐츠 영역 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;