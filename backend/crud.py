from sqlalchemy.orm import Session
import models, schemas

# 1. 특정 학번(student_id)으로 학생 찾기 (Read)
def get_user_by_student_id(db: Session, student_id: str):
    return db.query(models.User).filter(models.User.student_id == student_id).first()

# 2. 새로운 학생 DB에 저장하기 (Create)
def create_user(db: Session, user: schemas.UserCreate):
    # Pydantic 양식(user)을 DB 뼈대(models.User)에 맞춰서 조립
    db_user = models.User(
        student_id=user.student_id,
        password=user.password, # 원래는 암호화해야 하지만 지금은 테스트용으로 그대로 저장!
        name=user.name
    )
    db.add(db_user)      # DB에 추가
    db.commit()          # 실제 저장 (도장 쾅!)
    db.refresh(db_user)  # 저장된 최신 상태로 새로고침
    return db_user