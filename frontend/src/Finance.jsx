import { useState } from 'react';
import { 
  Container, Typography, Paper, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Fab, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, 
  Select, MenuItem, IconButton, Menu // IconButton, Menu 추가
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

function Finance() {
  const [transactions, setTransactions] = useState([
    { id: 4, date: '2026-04-18', type: 'expense', description: '랩실 커피 캡슐 구매', amount: 35000 },
    { id: 3, date: '2026-04-15', type: 'income', description: '4월 정기 회비 (이영희)', amount: 10000 },
    { id: 2, date: '2026-04-15', type: 'income', description: '4월 정기 회비 (김철수)', amount: 10000 },
    { id: 1, date: '2026-04-01', type: 'income', description: '전월 이월 금액', amount: 150000 },
  ]);

  // --- 메뉴(수정/삭제) 관련 상태 ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // --- 모달 관련 상태 ---
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTx, setNewTx] = useState({
    type: 'expense',
    date: dayjs(),
    description: '',
    amount: ''
  });

  const totalBalance = transactions.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  const handleOpen = () => {
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewTx({ type: 'expense', date: dayjs(), description: '', amount: '' });
  };

  const handleDelete = () => {
    if (window.confirm("정말 이 내역을 삭제하시겠습니까?")) {
      setTransactions(transactions.filter(t => t.id !== selectedRow.id));
      handleMenuClose();
    }
  };

  const handleEditOpen = () => {
    setIsEditing(true);
    setNewTx({
      ...selectedRow,
      date: dayjs(selectedRow.date)
    });
    setOpen(true);
    handleMenuClose();
  };

  // 저장 (추가/수정 공용)
  const handleSubmit = () => {
    if (!newTx.description || !newTx.amount) return alert("내역과 금액을 입력하세요!");

    if (isEditing) {
      // 수정 로직
      setTransactions(transactions.map(t => 
        t.id === selectedRow.id 
          ? { ...newTx, amount: Number(newTx.amount), date: newTx.date.format('YYYY-MM-DD') } 
          : t
      ));
    } else {
      // 추가 로직
      const newItem = {
        id: Date.now(),
        date: newTx.date.format('YYYY-MM-DD'),
        type: newTx.type,
        description: newTx.description,
        amount: Number(newTx.amount)
      };
      setTransactions([newItem, ...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    handleClose();
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, ml: 1, color: 'primary.dark' }}>
        회비 및 장부 관리
      </Typography>

      {/* 요약 카드 */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1 }}>현재 랩실 공금 잔액</Typography>
          <Typography variant="h4" fontWeight="bold">{totalBalance.toLocaleString()} 원</Typography>
        </Box>
        <AccountBalanceWalletIcon sx={{ fontSize: 80, opacity: 0.2 }} />
      </Paper>

      {/* 장부 테이블 */}
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 4, background: 'rgba(255, 255, 255, 0.9)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(103, 58, 183, 0.05)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>날짜</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>내역</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>분류</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>금액</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>관리</TableCell> {/* 관리 컬럼 추가 */}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>
                  <Chip label={row.type === 'income' ? '입금' : '출금'} color={row.type === 'income' ? 'success' : 'error'} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: row.type === 'income' ? 'success.main' : 'error.main' }}>
                  {row.type === 'income' ? '+' : '-'}{row.amount.toLocaleString()} 원
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={(e) => handleMenuClick(e, row)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 팝업 메뉴 (수정/삭제) */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditOpen}>수정하기</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>삭제하기</MenuItem>
      </Menu>

      {/* 추가/수정 모달 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {isEditing ? "내역 수정" : "새 내역 추가"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>분류</InputLabel>
              <Select value={newTx.type} label="분류" onChange={(e) => setNewTx({...newTx, type: e.target.value})}>
                <MenuItem value="income">입금 (+)</MenuItem>
                <MenuItem value="expense">출금 (-)</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label="날짜" value={newTx.date} onChange={(newValue) => setNewTx({...newTx, date: newValue})} slotProps={{ textField: { fullWidth: true } }} />
            </LocalizationProvider>
            <TextField label="사용 내역" fullWidth value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})} />
            <TextField label="금액" fullWidth type="number" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">취소</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ fontWeight: 'bold' }}>
            {isEditing ? "수정 완료" : "저장하기"}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab color="primary" onClick={handleOpen} sx={{ position: 'fixed', bottom: 32, right: 32 }}>
        <AddIcon />
      </Fab>
    </Container>
  );
}

export default Finance;