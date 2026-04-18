import { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, Divider, List, ListItem, ListItemText, 
  Avatar, CircularProgress, Fab, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickerDay } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import api from './api';

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  // 일정이 있는 날짜인지 확인
  const isSelected =
    !props.outsideCurrentMonth && highlightedDays.indexOf(day.format('YYYY-MM-DD')) >= 0;

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        isSelected ? (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#a65cb3',
            }}
          />
        ) : undefined
      }
      sx={{
        '& .MuiBadge-badge': {
          right: '50%',
          transform: 'translateX(50%)',
          bottom: '4px',
          padding: 0,
          minWidth: 'auto',
          height: 'auto',
          pointerEvents: 'none', // 점을 클릭해도 날짜가 클릭되도록 방해 금지
        }
      }}
    >
      <PickerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

function Schedule() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [labName, setLabName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    date: dayjs()
  });

  // 일정 목록 상태
  const [schedules, setSchedules] = useState([
    { id: 1, date: dayjs().format('YYYY-MM-DD'), title: '랩실 주간 회의', description: '오후 2시, 본관 세미나실' },
    { id: 2, date: dayjs().add(3, 'day').format('YYYY-MM-DD'), title: '프로젝트 중간 점검', description: '온라인 진행' },
  ]);

  useEffect(() => {
    const fetchLabInfo = async () => {
      try {
        const response = await api.get('/labs/my-lab');
        setLabName(response.data.name);
      } catch (error) {
        setLabName('랩실');
      } finally {
        setLoading(false);
      }
    };
    fetchLabInfo();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewSchedule({ title: '', description: '', date: dayjs() });
  };

  const handleSubmit = () => {
    if (!newSchedule.title) return alert("일정 제목을 입력해주세요.");
    
    const newItem = {
      id: Date.now(),
      title: newSchedule.title,
      description: newSchedule.description,
      date: newSchedule.date.format('YYYY-MM-DD')
    };

    setSchedules([...schedules, newItem]);
    handleClose();
  };

  const selectedDateStr = selectedDate.format('YYYY-MM-DD');
  const todayEvents = schedules.filter(event => event.date === selectedDateStr);

  // 점을 찍어줄 날짜들의 목록 (문자열 배열)
  const highlightedDays = schedules.map(s => s.date);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ position: 'relative', pb: 8 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, ml: 1, color: 'primary.dark' }}>
        {labName ? `${labName} 일정 관리` : '일정 관리'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 4, background: 'rgba(255, 255, 255, 0.9)' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar 
              value={selectedDate} 
              onChange={(newDate) => setSelectedDate(newDate)} 
              slots={{ day: ServerDay }}
              slotProps={{
                day: {
                  highlightedDays: highlightedDays, // 일정이 있는 날짜 배열 전달
                },
              }}
              sx={{
                '& .MuiPickersDay-root.Mui-selected': { backgroundColor: 'primary.main' }
              }}
            />
          </LocalizationProvider>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 4, flexGrow: 1, background: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            {selectedDate.format('YYYY년 MM월 DD일')} 일정
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {todayEvents.length > 0 ? (
            <List>
              {todayEvents.map((event) => (
                <ListItem key={event.id} sx={{ px: 0 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <EventIcon />
                  </Avatar>
                  <ListItemText 
                    primary={<Typography fontWeight="bold">{event.title}</Typography>} 
                    secondary={event.description} 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
              이날은 예정된 일정이 없습니다.
            </Typography>
          )}
        </Paper>
      </Box>

      <Fab 
        color="primary" 
        onClick={handleOpen}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>새 일정 추가</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="일정 제목"
              fullWidth
              value={newSchedule.title}
              onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
            />
            <TextField
              label="상세 설명"
              fullWidth
              multiline
              rows={2}
              value={newSchedule.description}
              onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="날짜 선택"
                value={newSchedule.date}
                onChange={(newValue) => setNewSchedule({...newSchedule, date: newValue})}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">취소</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ fontWeight: 'bold' }}>추가하기</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Schedule;