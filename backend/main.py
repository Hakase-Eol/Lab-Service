from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas, crud

app = FastAPI()

# 테이블 자동 생성
models.Base.metadata.create_all(bind=engine)

# React(프론트엔드) 주소에서 오는 요청을 허용 (CORS 설정)
origins = [
    "http://localhost:5173",  # Vite를 쓴다면 보통 5173 포트
    "http://localhost:3000",  # CRA를 쓴다면 보통 3000 포트
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "서버가 정상적으로 실행됨."}

@app.post("/users/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. 이미 가입된 학번인지 확인 (crud.py의 함수 사용)
    db_user = crud.get_user_by_student_id(db, student_id=user.student_id)
    
    # 2. 이미 있다면 400 에러 발생
    if db_user:
        raise HTTPException(status_code=400, detail="이미 가입된 학번입니다.")
    
    # 3. 없다면 새 유저로 DB에 저장 (crud.py의 함수 사용)
    return crud.create_user(db=db, user=user)

@app.post("/users/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. crud.py에 만든 함수로 검증 시도
    authenticated_user = crud.authenticate_user(db, student_id=user.student_id, password=user.password)
    
    # 2. 실패했다면 401(권한 없음) 에러 발생
    if not authenticated_user:
        raise HTTPException(status_code=401, detail="학번이나 비밀번호가 일치하지 않습니다.")
    
    # 3. 성공했다면 환영 메시지와 권한(role) 반환
    # JWT 토큰 추후 구현
    return {
        "message": f"환영해요, {authenticated_user.name}님!",
        "student_id": authenticated_user.student_id,
        "role": authenticated_user.role
    }

@app.post("/labs", response_model=schemas.LabResponse)
def create_lab(lab: schemas.LabCreate, db: Session = Depends(get_db)):
    # 1. 랩실을 만들려는 유저(학번)가 존재하는지 확인
    user = crud.get_user_by_student_id(db, student_id=lab.leader_id)
    if not user:
        raise HTTPException(status_code=404, detail="해당 학번의 유저를 찾을 수 없습니다.")
    
    # 2. 이미 다른 랩실에 소속된 사람(또는 이미 랩장인 사람)은 새로 만들 수 없게 차단
    if user.lab_id is not None:
        raise HTTPException(status_code=400, detail="이미 소속된 랩실이 있어 새로운 랩실을 만들 수 없습니다.")
    
    # 3. 모든 검사를 통과하면 랩실 생성
    return crud.create_lab(db=db, lab=lab)

@app.post("/labs/members", response_model=schemas.UserResponse)
def add_lab_member(req: schemas.MemberAdd, db: Session = Depends(get_db)):
    # crud 함수 실행
    result = crud.add_lab_member(db, leader_id=req.leader_id, student_id=req.student_id)
    
    # 결과에 따라 에러 처리
    if result == "NOT_LEADER":
        raise HTTPException(status_code=403, detail="랩장 권한이 없거나 소속된 랩실이 없습니다.")
    if result == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="추가할 학생의 학번을 찾을 수 없습니다.")
    if result == "ALREADY_IN_LAB":
        raise HTTPException(status_code=400, detail="해당 학생은 이미 랩실에 소속되어 있습니다.")
        
    # 성공하면 추가된 학생의 정보 반환
    return result

@app.get("/labs", response_model=list[schemas.LabResponse])
def read_all_labs(db: Session = Depends(get_db)):
    # crud.py에서 만든 함수로 모든 랩실 데이터를 가져옴
    labs = crud.get_all_labs(db)
    
    # 가져온 목록을 그대로 프론트엔드에 전달 (만약 없으면 빈 배열 []이 반환됨)
    return labs

# ==========================================
# 랩실 일정 API
# ==========================================
@app.post("/labs/{lab_id}/schedules", response_model=schemas.ScheduleResponse)
def create_schedule(lab_id: int, schedule: schemas.ScheduleCreate, db: Session = Depends(get_db)):
    return crud.create_schedule(db, lab_id, schedule)

@app.get("/labs/{lab_id}/schedules", response_model=list[schemas.ScheduleResponse])
def get_schedules(lab_id: int, db: Session = Depends(get_db)):
    return crud.get_schedules(db, lab_id)

# ==========================================
# 랩실 회비 API
# ==========================================
# 1. 랩장이 회비 청구
@app.post("/labs/{lab_id}/fees", response_model=schemas.FeeResponse)
def create_fee(lab_id: int, fee: schemas.FeeCreate, db: Session = Depends(get_db)):
    return crud.create_fee(db, lab_id, fee)

# 2. 학생이 납부 확인 버튼 클릭
@app.put("/fees/{fee_id}/pay")
def pay_fee(fee_id: int, student_id: str, db: Session = Depends(get_db)):
    crud.pay_fee(db, fee_id, student_id)
    return {"message": "회비 납부 처리가 완료되었습니다!"}

# 3. 랩장이 멤버들 납부 현황 조회
@app.get("/fees/{fee_id}/status")
def get_fee_status(fee_id: int, db: Session = Depends(get_db)):
    return crud.get_fee_status(db, fee_id)

# --- 장부(Finance) API ---

@app.post("/labs/{lab_id}/finances", response_model=schemas.Finance)
def create_finance(lab_id: int, finance: schemas.FinanceCreate, db: Session = Depends(get_db)):
    """특정 랩실에 수입/지출 내역을 기록합니다."""
    return crud.create_finance_record(db=db, lab_id=lab_id, finance=finance)

@app.get("/labs/{lab_id}/finances", response_model=list[schemas.Finance])
def read_finances(lab_id: int, db: Session = Depends(get_db)):
    """특정 랩실의 장부 내역을 조회합니다."""
    return crud.get_finances_by_lab(db, lab_id=lab_id)

# --- 회비 청구 (Fee) API ---

@app.post("/labs/{lab_id}/fees", response_model=schemas.Fee)
def create_fee(lab_id: int, fee: schemas.FeeCreate, db: Session = Depends(get_db)):
    """새로운 회비를 청구하고, 랩실 소속 학생들의 납부 내역(미납)을 자동 생성합니다."""
    return crud.create_fee_for_lab(db=db, lab_id=lab_id, fee=fee)

@app.get("/labs/{lab_id}/fees", response_model=list[schemas.Fee])
def read_fees(lab_id: int, db: Session = Depends(get_db)):
    """특정 랩실의 회비 청구 목록을 조회합니다."""
    return crud.get_fees_by_lab(db, lab_id=lab_id)

@app.get("/fees/{fee_id}/payments", response_model=list[schemas.FeePaymentInfo])
def read_fee_payments(fee_id: int, db: Session = Depends(get_db)):
    """특정 회비에 대한 학생들의 납부 현황을 조회합니다."""
    return crud.get_fee_payments(db, fee_id=fee_id)

# --- 랩실 가입 신청 (Application) API ---

@app.post("/labs/{lab_id}/applications", response_model=schemas.Application)
def apply_to_lab(lab_id: int, application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    """학생이 특정 랩실에 가입 신청서를 제출합니다."""
    return crud.create_application(db=db, lab_id=lab_id, application=application)

@app.get("/labs/{lab_id}/applications", response_model=list[schemas.Application])
def read_lab_applications(lab_id: int, db: Session = Depends(get_db)):
    """랩장이 특정 랩실에 들어온 가입 신청서 목록을 확인합니다."""
    return crud.get_applications_by_lab(db, lab_id=lab_id)

@app.put("/applications/{app_id}/status", response_model=schemas.Application)
def update_application_status(app_id: int, status_update: schemas.ApplicationUpdateStatus, db: Session = Depends(get_db)):
    """랩장이 특정 신청서의 상태를 'approved' 또는 'rejected'로 변경합니다."""
    return crud.update_application_status(db=db, app_id=app_id, status=status_update.status)