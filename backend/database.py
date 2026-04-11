import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# .env 파일 불러오기
load_dotenv()

# DB 주소 가져오기
SQLALCHEMY_DATABASE_URL = os.getenv("DB_URL")

# MySQL 연결 엔진 생성
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# DB 세션(대화 창구) 만들기
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 모든 모델의 뼈대가 될 베이스 클래스
Base = declarative_base()

# API가 호출될 때마다 DB를 열고 닫아줄 의존성 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()