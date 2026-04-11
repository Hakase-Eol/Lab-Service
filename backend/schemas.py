from pydantic import BaseModel

# 1. 회원가입할 때 프론트엔드에서 보내줘야 하는 데이터 양식 (요청)
class UserCreate(BaseModel):
    student_id: str
    password: str
    name: str

# 2. 회원가입 성공 후 프론트엔드에 돌려줄 데이터 양식 (응답 - 비밀번호 제외!)
class UserResponse(BaseModel):
    student_id: str
    name: str
    role: str

    class Config:
        from_attributes = True  # DB 모델(SQLAlchemy)을 Pydantic 모델로 부드럽게 변환해 줌