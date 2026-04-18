from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from sqlalchemy.orm import Session
import models, schemas, crud
from jose import JWTError, jwt

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# ==========================================
# 현재 로그인한 유저를 알아내는 보안 함수
# ==========================================
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # 토큰이 이상하거나 주인을 찾을 수 없을 때 뱉어낼 에러
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="로그인이 풀렸거나 유효하지 않은 토큰입니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. crud.py에서 토큰을 만들 때 썼던 비밀키(SECRET_KEY)로 암호 해제
        payload = jwt.decode(token, crud.SECRET_KEY, algorithms=[crud.ALGORITHM])
        
        # 2. 해독한 데이터 안에서 'sub'(우리가 넣었던 학번)를 꺼낸다.
        student_id: str = payload.get("sub")
        if student_id is None:
            raise credentials_exception
            
    except JWTError:
        # 토큰이 위조되었거나 만료되었으면 에러
        raise credentials_exception
        
    # 3. 해독해서 얻은 학번으로 DB에서 진짜 유저 데이터를 가져온다.
    user = crud.get_user_by_student_id(db, student_id=student_id)
    if user is None:
        raise credentials_exception
        
    # 4. 방금 로그인한 그 유저의 정보(models.User)를 반환
    return user

# 테이블 자동 생성
models.Base.metadata.create_all(bind=engine)

# React(프론트엔드) 주소에서 오는 요청을 허용 (CORS 설정)
origins = [
    "http://localhost:5173",  
    "http://localhost:3000",  
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

# ==========================================
# 1. 유저 & 인증 (User & Auth) API
# ==========================================
@app.post("/users/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """새로운 학생 또는 랩장으로 회원가입합니다. (자물쇠 없음 - 아무나 가능)"""
    db_user = crud.get_user_by_student_id(db, student_id=user.student_id)
    if db_user:
        raise HTTPException(status_code=400, detail="이미 가입된 학번입니다.")
    return crud.create_user(db=db, user=user)

@app.post("/users/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """학번(username 칸에 입력)과 비밀번호로 로그인하여 토큰을 발급받습니다. (자물쇠 없음)"""
    user = crud.authenticate_user(db, student_id=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="학번이나 비밀번호가 틀렸습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = crud.create_access_token(data={"sub": user.student_id})
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# 2. 랩실 관리 (Lab) API
# ==========================================
@app.post("/labs", response_model=schemas.LabResponse)
def create_lab(
    lab: schemas.LabCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user) # 👈 토큰에서 유저를 뽑아옴
):
    # 1. 랩실 소속 여부 등 권한 확인
    if current_user.lab_id is not None:
        raise HTTPException(status_code=400, detail="이미 소속된 랩실이 있어 새로운 랩실을 만들 수 없습니다.")
    
    # 2. 토큰에서 읽어낸 진짜 학번을 랩장 ID로 강제 고정 (프론트에서 위조 불가능)
    lab.leader_id = current_user.student_id 
    
    return crud.create_lab(db=db, lab=lab)

@app.get("/labs", response_model=list[schemas.LabResponse])
def read_all_labs(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """단순 조회는 로그인 여부(문지기)만 확인"""
    return crud.get_all_labs(db)

@app.post("/labs/members", response_model=schemas.UserResponse)
def add_lab_member(req: schemas.MemberAdd, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """랩장이 랩실에 멤버를 추가합니다."""
    # req.leader_id 대신 토큰에서 꺼낸 current_user.student_id 사용
    result = crud.add_lab_member(db, leader_id=current_user.student_id, student_id=req.student_id)
    if result == "NOT_LEADER":
        raise HTTPException(status_code=403, detail="랩장 권한이 없거나 소속된 랩실이 없습니다.")
    if result == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="추가할 학생의 학번을 찾을 수 없습니다.")
    if result == "ALREADY_IN_LAB":
        raise HTTPException(status_code=400, detail="해당 학생은 이미 랩실에 소속되어 있습니다.")
    return result

# ==========================================
# 3. 랩실 가입 신청 (Application) API
# ==========================================
@app.post("/labs/{lab_id}/applications", response_model=schemas.Application)
def apply_to_lab(lab_id: int, application: schemas.ApplicationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """학생이 특정 랩실에 가입 신청서를 제출합니다."""
    # 토큰에서 읽어낸 진짜 학번을 신청서 학번으로 강제 덮어쓰기
    application.student_id = current_user.student_id
    return crud.create_application(db=db, lab_id=lab_id, application=application)

@app.get("/labs/{lab_id}/applications", response_model=list[schemas.Application])
def read_lab_applications(lab_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """랩장이 특정 랩실에 들어온 가입 신청서 목록을 확인합니다."""
    return crud.get_applications_by_lab(db, lab_id=lab_id)

@app.put("/applications/{app_id}/status", response_model=schemas.Application)
def update_application_status(app_id: int, status_update: schemas.ApplicationUpdateStatus, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """랩장이 특정 신청서의 상태를 'approved' 또는 'rejected'로 변경합니다."""
    return crud.update_application_status(db=db, app_id=app_id, status=status_update.status)

# ==========================================
# 4. 일정 관리 (Schedule) API
# ==========================================
@app.post("/labs/{lab_id}/schedules", response_model=schemas.ScheduleResponse)
def create_schedule(lab_id: int, schedule: schemas.ScheduleCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    return crud.create_schedule(db, lab_id, schedule)

@app.get("/labs/{lab_id}/schedules", response_model=list[schemas.ScheduleResponse])
def get_schedules(lab_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    return crud.get_schedules(db, lab_id)

# ==========================================
# 5. 회비 관리 (Fee) API
# ==========================================
@app.post("/labs/{lab_id}/fees", response_model=schemas.Fee)
def create_fee(lab_id: int, fee: schemas.FeeCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """새로운 회비를 청구하고, 랩실 소속 학생들의 납부 내역(미납)을 자동 생성합니다."""
    return crud.create_fee_for_lab(db=db, lab_id=lab_id, fee=fee)

@app.get("/labs/{lab_id}/fees", response_model=list[schemas.Fee])
def read_fees(lab_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """특정 랩실의 회비 청구 목록을 조회합니다."""
    return crud.get_fees_by_lab(db, lab_id=lab_id)

@app.put("/fees/{fee_id}/pay")
def pay_fee(fee_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """학생이 납부 확인 버튼 클릭 시 처리 (학번은 토큰에서 자동 추출)"""
    # 프론트에서 학번을 안 보내줘도, 서버가 토큰을 해독해서 알아서 처리
    crud.pay_fee(db, fee_id, current_user.student_id)
    return {"message": "회비 납부 처리가 완료되었습니다!"}

@app.get("/fees/{fee_id}/payments", response_model=list[schemas.FeePaymentInfo])
def read_fee_payments(fee_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """특정 회비에 대한 학생들의 납부 현황을 조회합니다."""
    return crud.get_fee_payments(db, fee_id=fee_id)

# ==========================================
# 6. 장부 관리 (Finance) API
# ==========================================
@app.post("/labs/{lab_id}/finances", response_model=schemas.Finance)
def create_finance(lab_id: int, finance: schemas.FinanceCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """특정 랩실에 수입/지출 내역을 기록합니다."""
    return crud.create_finance_record(db=db, lab_id=lab_id, finance=finance)

@app.get("/labs/{lab_id}/finances", response_model=list[schemas.Finance])
def read_finances(lab_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """특정 랩실의 장부 내역을 조회합니다."""
    return crud.get_finances_by_lab(db, lab_id=lab_id)