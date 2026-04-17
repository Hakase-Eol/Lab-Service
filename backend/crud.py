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
        password=user.password, # 원래는 암호화해야 하지만 테스트용으로 그대로 저장
        name=user.name
    )
    db.add(db_user)      # DB에 추가
    db.commit()          # 실제 저장
    db.refresh(db_user)  # 저장된 최신 상태로 새로고침
    return db_user

# 3. 로그인 검증하기 (Read & Check)
def authenticate_user(db: Session, student_id: str, password: str):
    # 먼저 학번으로 학생을 서치
    user = get_user_by_student_id(db, student_id)
    
    # 1. 학번이 DB에 없으면 False(실패) 반환
    if not user:
        return False
    
    # 2. 학번은 있는데 비밀번호가 다르면 False(실패) 반환 
    if user.password != password:
        return False
    
    # 3. 둘 다 맞으면 찾은 유저 정보를 그대로 반환
    return user

# 4. 랩실 생성 및 랩장 권한 부여 (Create & Update)
def create_lab(db: Session, lab: schemas.LabCreate):
    # 1) 새로운 랩실 데이터를 DB에 저장
    db_lab = models.Lab(
        name=lab.name,
        field=lab.field,
        description=lab.description,
        leader_id=lab.leader_id
    )
    db.add(db_lab)
    db.commit()
    db.refresh(db_lab) # 생성된 랩실의 ID(lab_id)를 받아옴
    
    # 2) 랩실을 만든 유저를 찾아서 정보를 수정(Update)
    user = get_user_by_student_id(db, lab.leader_id)
    if user:
        user.role = "leader"          # 권한을 랩장으로 승급
        user.lab_id = db_lab.lab_id   # 소속 랩실 지정
        db.commit()
        db.refresh(user)
        
    return db_lab

# 5. 랩실 멤버 추가하기 (Update)
def add_lab_member(db: Session, leader_id: str, student_id: str):
    # 1. 요청한 사람이 진짜 랩장이 맞는지, 랩실이 있는지 확인
    leader = get_user_by_student_id(db, leader_id)
    if not leader or leader.role != "leader" or leader.lab_id is None:
        return "NOT_LEADER"
    
    # 2. 추가할 학생이 DB에 존재하는지 확인
    student = get_user_by_student_id(db, student_id)
    if not student:
        return "NOT_FOUND"
    
    # 3. 추가할 학생이 이미 다른 랩실(또는 내 랩실)에 소속되어 있는지 확인
    if student.lab_id is not None:
        return "ALREADY_IN_LAB"
        
    # 4. 모든 검사를 통과하면 학생의 lab_id를 랩장의 lab_id로 업데이트
    student.lab_id = leader.lab_id
    db.commit()
    db.refresh(student)
    
    return student

# 6. 전체 랩실 목록 조회 (Read)
def get_all_labs(db: Session):
    return db.query(models.Lab).all() # Lab 테이블의 모든 데이터를 반환.

# --- [일정 기능] ---
def create_schedule(db: Session, lab_id: int, sched: schemas.ScheduleCreate):
    db_sched = models.Schedule(lab_id=lab_id, title=sched.title, date=sched.date)
    db.add(db_sched)
    db.commit()
    db.refresh(db_sched)
    return db_sched

def get_schedules(db: Session, lab_id: int):
    return db.query(models.Schedule).filter(models.Schedule.lab_id == lab_id).all()

# --- [회비 기능] ---
def create_fee(db: Session, lab_id: int, fee: schemas.FeeCreate):
    # 1. 랩실 전체 회비 청구서 생성
    db_fee = models.Fee(lab_id=lab_id, title=fee.title, amount=fee.amount)
    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)
    
    # 2. 해당 랩실에 소속된 모든 학생 찾기
    members = db.query(models.User).filter(models.User.lab_id == lab_id).all()
    
    # 3. 모든 학생에게 '미납(is_paid=False)' 상태로 납부 내역 자동 생성
    for member in members:
        db_payment = models.FeePayment(fee_id=db_fee.fee_id, student_id=member.student_id, is_paid=False)
        db.add(db_payment)
    db.commit()
    return db_fee

# 학생이 직접 회비를 냈다고 체크하는 기능
def pay_fee(db: Session, fee_id: int, student_id: str):
    payment = db.query(models.FeePayment).filter(models.FeePayment.fee_id == fee_id, models.FeePayment.student_id == student_id).first()
    if payment:
        payment.is_paid = True # 납부 완료 처리
        db.commit()
    return payment

# 랩장이 누가 냈는지 안 냈는지 확인하는 기능
def get_fee_status(db: Session, fee_id: int):
    payments = db.query(models.FeePayment).filter(models.FeePayment.fee_id == fee_id).all()
    result = []
    for p in payments:
        user = get_user_by_student_id(db, p.student_id) # 유저 이름 가져오기
        result.append({
            "student_id": p.student_id,
            "student_name": user.name if user else "알 수 없음",
            "is_paid": "✅ 납부완료" if p.is_paid else "❌ 미납"
        })
    return result

# --- 장부(Finance) CRUD ---

# 장부 내역 추가
def create_finance_record(db: Session, lab_id: int, finance: schemas.FinanceCreate):
    db_finance = models.Finance(
        lab_id=lab_id,
        type=finance.type,
        amount=finance.amount,
        description=finance.description,
        record_date=finance.record_date
    )
    db.add(db_finance)
    db.commit()
    db.refresh(db_finance)
    return db_finance

# 특정 랩실의 장부 내역 전체 조회
def get_finances_by_lab(db: Session, lab_id: int):
    return db.query(models.Finance).filter(models.Finance.lab_id == lab_id).all()