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