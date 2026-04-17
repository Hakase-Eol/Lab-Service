from pydantic import BaseModel
from datetime import date

# 1. 회원가입할 때 프론트엔드에서 보내줘야 하는 데이터 양식 (요청)
class UserCreate(BaseModel):
    student_id: str
    password: str
    name: str

# 2. 회원가입 성공 후 프론트엔드에 돌려줄 데이터 양식 (응답 - 비밀번호 제외)
class UserResponse(BaseModel):
    student_id: str
    name: str
    role: str

    class Config:
        from_attributes = True  # DB 모델(SQLAlchemy)을 Pydantic 모델로 부드럽게 변환해 줌

# 3. 로그인할 때 프론트엔드에서 보내줘야 하는 데이터 양식
class UserLogin(BaseModel):
    student_id: str
    password: str

# 4. 랩실 생성 요청 양식
class LabCreate(BaseModel):
    name: str
    field: str           # 연구 분야
    description: str     # 랩실 설명
    leader_id: str       # 랩실을 만드는 사람의 학번

# 5. 랩실 생성 응답 양식
class LabResponse(BaseModel):
    lab_id: int
    name: str
    field: str
    leader_id: str

    class Config:
        from_attributes = True

# 6. 랩실 멤버 추가 요청 양식
class MemberAdd(BaseModel):
    leader_id: str     # 초대를 보내는 랩장의 학번
    student_id: str    # 랩실에 추가할 학생의 학번

# --- 일정 관련 양식 ---
class ScheduleCreate(BaseModel):
    title: str
    date: str

class ScheduleResponse(BaseModel):
    schedule_id: int
    lab_id: int
    title: str
    date: str
    class Config: from_attributes = True

# --- 회비 관련 양식 ---
class FeeCreate(BaseModel):
    title: str
    amount: int

class FeeResponse(BaseModel):
    fee_id: int
    lab_id: int
    title: str
    amount: int
    class Config: from_attributes = True

# --- 장부 스키마 ---
class FinanceBase(BaseModel):
    type: str  # "income"(수입) 또는 "expense"(지출)
    amount: int
    description: str | None = None
    record_date: date

class FinanceCreate(FinanceBase):
    pass

class Finance(FinanceBase):
    finance_id: int
    lab_id: int

    class Config:
        from_attributes = True

# --- 회비 청구 (Fee) 스키마 ---
class FeeBase(BaseModel):
    title: str
    amount: int

class FeeCreate(FeeBase):
    pass

class Fee(FeeBase):
    fee_id: int
    lab_id: int

    class Config:
        from_attributes = True

# 회비 납부 현황 조회용 스키마
class FeePaymentInfo(BaseModel):
    payment_id: int
    fee_id: int
    student_id: str
    is_paid: bool

    class Config:
        from_attributes = True