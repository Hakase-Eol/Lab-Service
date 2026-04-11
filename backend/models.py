from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime, func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    student_id = Column(String(20), primary_key=True, index=True) # 학번이 PK
    password = Column(String(100), nullable=False) # 평문 저장
    name = Column(String(50), nullable=False)
    role = Column(String(20), default="student") # student, leader, admin 등
    lab_id = Column(Integer, ForeignKey("labs.lab_id"), nullable=True)

    # 관계 설정 (N:1, 1:N 등을 객체로 쉽게 접근하기 위함)
    lab = relationship("Lab", foreign_keys=[lab_id], back_populates="members")
    applications = relationship("Application", back_populates="applicant")

class Lab(Base):
    __tablename__ = "labs"

    lab_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    field = Column(String(100), nullable=False)
    description = Column(Text)
    leader_id = Column(String(20), ForeignKey("users.student_id"), nullable=True)
    capacity = Column(Integer, nullable=False, default=10)

    members = relationship("User", foreign_keys=[User.lab_id], back_populates="lab")
    applications = relationship("Application", back_populates="lab")
    schedules = relationship("Schedule", back_populates="lab")
    finances = relationship("Finance", back_populates="lab")

class Application(Base):
    __tablename__ = "applications"

    app_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(20), ForeignKey("users.student_id"), nullable=False)
    lab_id = Column(Integer, ForeignKey("labs.lab_id"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), default="pending") # pending, approved, rejected
    applied_at = Column(DateTime, default=func.now())

    applicant = relationship("User", back_populates="applications")
    lab = relationship("Lab", back_populates="applications")

class Schedule(Base):
    __tablename__ = "schedules"

    schedule_id = Column(Integer, primary_key=True, autoincrement=True)
    lab_id = Column(Integer, ForeignKey("labs.lab_id"), nullable=False)
    title = Column(String(200), nullable=False)
    event_date = Column(Date, nullable=False)

    lab = relationship("Lab", back_populates="schedules")
    attendances = relationship("Attendance", back_populates="schedule")

class Attendance(Base):
    __tablename__ = "attendances"

    attendance_id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_id = Column(Integer, ForeignKey("schedules.schedule_id"), nullable=False)
    student_id = Column(String(20), ForeignKey("users.student_id"), nullable=False)
    status = Column(String(20), nullable=False) # present, absent, late

    schedule = relationship("Schedule", back_populates="attendances")

class Finance(Base):
    __tablename__ = "finances"

    finance_id = Column(Integer, primary_key=True, autoincrement=True)
    lab_id = Column(Integer, ForeignKey("labs.lab_id"), nullable=False)
    type = Column(String(20), nullable=False) # income, expense
    amount = Column(Integer, nullable=False)
    description = Column(Text)
    record_date = Column(Date, nullable=False)

    lab = relationship("Lab", back_populates="finances")