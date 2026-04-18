import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // 테마 도구 불러오기
import Login from './Login';
import Dashboard from './Dashboard';
import MyLab from './MyLab';
import Schedule from './Schedule';
import Layout from './Layout';
import Finance from './Finance';

const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // 메인 보라색
      light: '#e1bee7', // 연한 보라색
      dark: '#7b1fa2',
    },
    background: {
      default: '#fdfbfb', // 기본 배경색 (매우 연한 보라/회색 톤)
    },
  },
  typography: {
    fontFamily: 'Pretendard, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lab" element={<MyLab />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/finance" element={<Finance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;