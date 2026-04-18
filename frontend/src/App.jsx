import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // 테마 도구 불러오기
import Login from './Login';
import Dashboard from './Dashboard';
import Layout from './Layout';

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
    fontFamily: 'Pretendard, sans-serif', // 폰트도 깔끔하게 설정 (있다면 적용됨)
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}> {/* 테마를 하위 컴포넌트들에 전달 */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;