-- Tạo database mới (tên khớp với `config/db.config.js` mặc định)
CREATE DATABASE LSdemo_db;
GO

USE LSdemo_db;
GO

-- Tạo bảng Categories (Danh mục khóa học)
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug VARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(MAX),
    ParentID INT,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ParentID) REFERENCES Categories(CategoryID)
);

-- Tạo bảng Users (Người dùng)
-- Lưu ý: Email / FirstName / LastName là tùy chọn (NULL) theo cấu hình model
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FirstName NVARCHAR(50) NULL,
    LastName NVARCHAR(50) NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (Role IN ('student', 'instructor', 'admin')),
    Avatar VARCHAR(255),
    Bio NVARCHAR(MAX),
    PhoneNumber VARCHAR(20),
    Address NVARCHAR(255),
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive', 'banned')),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Tạo bảng Courses (Khóa học)
CREATE TABLE Courses (
    CourseID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT NOT NULL,
    InstructorID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Slug VARCHAR(200) NOT NULL UNIQUE,
    Description NVARCHAR(MAX),
    Category NVARCHAR(100) NULL,
    ThumbnailURL VARCHAR(255),
    Price DECIMAL(10,2) NOT NULL DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived')),
    Duration INT, -- Tổng thời gian khóa học (phút)
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (InstructorID) REFERENCES Users(UserID)
);

-- Tạo bảng Lessons (Bài học)
CREATE TABLE Lessons (
    LessonID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Content NVARCHAR(MAX),
    VideoURL VARCHAR(500),
    Duration INT, -- Thời lượng bài học (phút)
    OrderIndex INT NOT NULL DEFAULT 0,
    IsPreview BIT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Tạo bảng Enrollments (Đăng ký khóa học)
CREATE TABLE Enrollments (
    EnrollmentID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'completed', 'cancelled')),
    Progress DECIMAL(5,2) DEFAULT 0,
    EnrolledAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    LastAccessDate DATETIME,
    ExpiresAt DATETIME,
    Notes NVARCHAR(MAX),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Tạo bảng Progress (Tiến độ học tập)
CREATE TABLE Progress (
    ProgressID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    LessonID INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'not-started' CHECK (Status IN ('not-started', 'in-progress', 'completed')),
    Progress DECIMAL(5,2) DEFAULT 0,
    TimeSpent INT DEFAULT 0, -- Thời gian đã học (phút)
    LastAccessDate DATETIME,
    CompletionDate DATETIME,
    Score INT,
    Notes NVARCHAR(MAX),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (LessonID) REFERENCES Lessons(LessonID)
);

-- Unique constraint to ensure one progress row per user/course/lesson
ALTER TABLE Progress
ADD CONSTRAINT UQ_UserCourseLesson UNIQUE (UserID, CourseID, LessonID);

-- Tạo bảng Assignments (Bài tập)
CREATE TABLE Assignments (
    AssignmentID INT IDENTITY(1,1) PRIMARY KEY,
    LessonID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Instructions NVARCHAR(MAX),
    DueDate DATETIME,
    MaxScore DECIMAL(8,2) DEFAULT 100,
    PassingScore FLOAT DEFAULT 60,
    AllowLateSubmission BIT DEFAULT 0,
    LateSubmissionDeadline DATETIME,
    LateSubmissionPenalty FLOAT DEFAULT 0,
    AttachmentRequired BIT DEFAULT 0,
    MaxFileSize INT,
    RequiredFiles VARCHAR(500),
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived')),
    RubricData NVARCHAR(MAX),
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (LessonID) REFERENCES Lessons(LessonID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- Tạo bảng Submissions (Nộp bài tập)
CREATE TABLE Submissions (
    SubmissionID INT IDENTITY(1,1) PRIMARY KEY,
    AssignmentID INT NOT NULL,
    UserID INT NOT NULL,
    FileURL VARCHAR(500),
    FileName NVARCHAR(255),
    FileSize INT,
    FileType VARCHAR(50),
    Comment NVARCHAR(MAX),
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'submitted', 'late', 'graded', 'returned')),
    Score DECIMAL(5,2),
    Feedback NVARCHAR(MAX),
    GradedBy INT,
    GradedAt DATETIME,
    IsLate BIT DEFAULT 0,
    SubmittedAt DATETIME DEFAULT GETDATE(),
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (GradedBy) REFERENCES Users(UserID)
);

-- Tạo bảng Quizzes (Bài kiểm tra)
CREATE TABLE Quizzes (
    QuizID INT IDENTITY(1,1) PRIMARY KEY,
    LessonID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Instructions NVARCHAR(MAX),
    Duration INT NOT NULL DEFAULT 30, -- Default duration in minutes
    TimeLimit INT NULL, -- Optional time limit per attempt (minutes)
    PassingScore FLOAT DEFAULT 70,
    AttemptsAllowed INT DEFAULT 1,
    ShuffleQuestions BIT DEFAULT 0,
    ShowAnswers VARCHAR(20) DEFAULT 'after_submit' CHECK (ShowAnswers IN ('never', 'after_submit', 'after_deadline', 'after_all_attempts')),
    IsPublished BIT DEFAULT 0,
    AvailableFrom DATETIME NULL,
    AvailableUntil DATETIME NULL,
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived', 'deleted')),
    TotalPoints INT DEFAULT 0,
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    LastModifiedBy INT NULL,
    FOREIGN KEY (LessonID) REFERENCES Lessons(LessonID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (LastModifiedBy) REFERENCES Users(UserID)
);

-- Tạo bảng Questions (Câu hỏi)
CREATE TABLE Questions (
    QuestionID INT IDENTITY(1,1) PRIMARY KEY,
    QuizID INT NOT NULL,
    QuestionType VARCHAR(20) NOT NULL CHECK (QuestionType IN ('single', 'multiple', 'points', 'text', 'matching')),
    QuestionText NVARCHAR(MAX) NOT NULL,
    ExplanationText NVARCHAR(MAX),
    Points FLOAT DEFAULT 1,
    PartialCredit BIT DEFAULT 0,
    OrderIndex INT DEFAULT 0,
    IsRequired BIT DEFAULT 1,
    TimeLimit INT NULL,
    ImageURL VARCHAR(500) NULL,
    VideoURL VARCHAR(500) NULL,
    AudioURL VARCHAR(500) NULL,
    Difficulty VARCHAR(20) DEFAULT 'medium' CHECK (Difficulty IN ('easy','medium','hard')),
    Tags VARCHAR(500) NULL,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active','inactive','deleted')),
    Metadata NVARCHAR(MAX) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT NULL,
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    LastModifiedBy INT NULL,
    FOREIGN KEY (QuizID) REFERENCES Quizzes(QuizID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (LastModifiedBy) REFERENCES Users(UserID)
);

-- Tạo bảng Options (Lựa chọn cho câu hỏi)
CREATE TABLE Options (
    OptionID INT IDENTITY(1,1) PRIMARY KEY,
    QuestionID INT NOT NULL,
    Text NVARCHAR(1000) NOT NULL,
    IsCorrect BIT DEFAULT 0,
    ExplanationText NVARCHAR(MAX) NULL,
    OrderIndex INT DEFAULT 0,
    Points FLOAT DEFAULT 0,
    FeedbackText NVARCHAR(MAX) NULL,
    IsImage BIT DEFAULT 0,
    ImageURL VARCHAR(500) NULL,
    AudioURL VARCHAR(500) NULL,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active','inactive','deleted')),
    Metadata NVARCHAR(MAX) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT NULL,
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    LastModifiedBy INT NULL,
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (LastModifiedBy) REFERENCES Users(UserID)
);

-- Tạo bảng Results (Kết quả kiểm tra)
CREATE TABLE Results (
    ResultID INT IDENTITY(1,1) PRIMARY KEY,
    QuizID INT NOT NULL,
    UserID INT NOT NULL,
    AttemptNumber INT DEFAULT 1,
    Score FLOAT NULL,
    EarnedPoints FLOAT NULL,
    TotalPoints FLOAT NULL,
    TimeTaken INT NULL,
    Status VARCHAR(20) DEFAULT 'in_progress' CHECK (Status IN ('in_progress', 'completed', 'expired', 'cancelled')),
    Details NVARCHAR(MAX), -- JSON
    Answers NVARCHAR(MAX), -- JSON chứa câu trả lời
    FeedbackNotes NVARCHAR(MAX),
    ReviewedBy INT NULL,
    ReviewedAt DATETIME NULL,
    StartedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    ExpiresAt DATETIME,
    IP VARCHAR(45),
    UserAgent VARCHAR(500),
    Metadata NVARCHAR(MAX),
    FOREIGN KEY (QuizID) REFERENCES Quizzes(QuizID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- rest of file unchanged
-- Tạo bảng Ratings (Đánh giá)
CREATE TABLE Ratings (
    RatingID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Review NVARCHAR(MAX),
    Status VARCHAR(20) DEFAULT 'pending' CHECK (Status IN ('pending', 'approved', 'rejected')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Tạo bảng Comments (Bình luận)
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    LessonID INT NULL,
    ParentID INT NULL,
    Type VARCHAR(20) DEFAULT 'lesson' CHECK (Type IN ('lesson', 'discussion')),
    ReferenceID INT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'hidden', 'deleted')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (LessonID) REFERENCES Lessons(LessonID),
    FOREIGN KEY (ParentID) REFERENCES Comments(CommentID)
);

-- Tạo bảng ForumPosts (Bài viết diễn đàn)
CREATE TABLE ForumPosts (
    PostID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Tags NVARCHAR(500),
    Views INT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'hidden', 'deleted')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Tạo bảng Certificates (Chứng chỉ)
CREATE TABLE Certificates (
    CertificateID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    CertificateNumber VARCHAR(100) NOT NULL UNIQUE,
    CompletionDate DATETIME,
    IssueDate DATETIME DEFAULT GETDATE(),
    ExpiryDate DATETIME,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'revoked', 'expired')),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Tạo bảng Transactions (Giao dịch)
CREATE TABLE Transactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'VND',
    Status VARCHAR(20) DEFAULT 'pending' CHECK (Status IN ('pending', 'completed', 'failed', 'refunded')),
    PaymentMethod VARCHAR(50),
    PaymentDetails NVARCHAR(MAX),
    TransactionDate DATETIME DEFAULT GETDATE(),
    RefundDate DATETIME,
    Notes NVARCHAR(MAX),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Tạo bảng RevenueShare (Chia sẻ doanh thu)
CREATE TABLE RevenueShare (
    ShareID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    InstructorID INT NOT NULL,
    Percentage DECIMAL(5,2) DEFAULT 70,
    EffectiveFrom DATETIME DEFAULT GETDATE(),
    EffectiveUntil DATETIME,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive')),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (InstructorID) REFERENCES Users(UserID)
);

-- Tạo bảng Notifications (Thông báo)
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Type VARCHAR(50) NOT NULL CHECK (Type IN ('system', 'course', 'quiz', 'assignment', 'comment', 'payment', 'achievement', 'submission_graded')),
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX),
    ReferenceType VARCHAR(50),
    ReferenceID INT,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Tạo bảng Files (Tệp tin)
CREATE TABLE Files (
    FileID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    LessonID INT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileType VARCHAR(50),
    FilePath NVARCHAR(500) NOT NULL,
    FileSize INT,
    UploadedBy INT NULL,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'deleted')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (LessonID) REFERENCES Lessons(LessonID)
);

-- Tạo bảng Schedules (Lịch học)
CREATE TABLE Schedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    RecurrenceRule VARCHAR(500),
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'cancelled')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Tạo bảng Announcements (Thông báo khóa học)
CREATE TABLE Announcements (
    AnnouncementID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Priority VARCHAR(20) DEFAULT 'medium' CHECK (Priority IN ('low', 'medium', 'high')),
    StartDate DATETIME,
    EndDate DATETIME,
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived')),
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- Indexes for newly added tables
CREATE INDEX IX_Ratings_UserID ON Ratings(UserID);
CREATE INDEX IX_Ratings_CourseID ON Ratings(CourseID);
CREATE INDEX IX_Ratings_Status ON Ratings(Status);

CREATE INDEX IX_Comments_UserID ON Comments(UserID);
CREATE INDEX IX_Comments_LessonID ON Comments(LessonID);
CREATE INDEX IX_Comments_Status ON Comments(Status);

CREATE INDEX IX_ForumPosts_UserID ON ForumPosts(UserID);
CREATE INDEX IX_ForumPosts_CourseID ON ForumPosts(CourseID);
CREATE INDEX IX_ForumPosts_Status ON ForumPosts(Status);

CREATE INDEX IX_Certificates_UserID ON Certificates(UserID);
CREATE INDEX IX_Certificates_CourseID ON Certificates(CourseID);
CREATE INDEX IX_Certificates_Status ON Certificates(Status);

CREATE INDEX IX_Transactions_UserID ON Transactions(UserID);
CREATE INDEX IX_Transactions_CourseID ON Transactions(CourseID);
CREATE INDEX IX_Transactions_Status ON Transactions(Status);

CREATE INDEX IX_RevenueShare_CourseID ON RevenueShare(CourseID);
CREATE INDEX IX_RevenueShare_InstructorID ON RevenueShare(InstructorID);

CREATE INDEX IX_Notifications_UserID ON Notifications(UserID);
CREATE INDEX IX_Notifications_Type ON Notifications(Type);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);

CREATE INDEX IX_Files_UserID ON Files(UserID);
CREATE INDEX IX_Files_LessonID ON Files(LessonID);
CREATE INDEX IX_Files_Status ON Files(Status);

CREATE INDEX IX_Schedules_UserID ON Schedules(UserID);
CREATE INDEX IX_Schedules_CourseID ON Schedules(CourseID);
CREATE INDEX IX_Schedules_Status ON Schedules(Status);

CREATE INDEX IX_Announcements_CourseID ON Announcements(CourseID);
CREATE INDEX IX_Announcements_Status ON Announcements(Status);
CREATE INDEX IX_Announcements_CreatedBy ON Announcements(CreatedBy);
CREATE INDEX IX_Announcements_Priority ON Announcements(Priority);

-- Indexes for Questions and Options (defined in models)
CREATE INDEX IX_Questions_QuizID ON Questions(QuizID);
CREATE INDEX IX_Questions_OrderIndex ON Questions(OrderIndex);
CREATE INDEX IX_Questions_Status ON Questions(Status);
CREATE INDEX IX_Questions_Difficulty ON Questions(Difficulty);
CREATE INDEX IX_Questions_Type ON Questions(QuestionType);

CREATE INDEX IX_Options_QuestionID ON Options(QuestionID);
CREATE INDEX IX_Options_OrderIndex ON Options(OrderIndex);
CREATE INDEX IX_Options_Status ON Options(Status);
CREATE INDEX IX_Options_IsCorrect ON Options(IsCorrect);

GO