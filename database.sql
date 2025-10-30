-- Create database
CREATE DATABASE LearningSystem;
GO

USE LearningSystem;
GO

-- Create Users table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Role VARCHAR(20) CHECK (Role IN ('student', 'instructor', 'admin')),
    Avatar VARCHAR(500),
    Bio TEXT,
    Phone VARCHAR(20),
    Address TEXT,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive', 'banned')),
    LastLoginAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Courses table
CREATE TABLE Courses (
    CourseID INT IDENTITY(1,1) PRIMARY KEY,
    InstructorID INT FOREIGN KEY REFERENCES Users(UserID),
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    Thumbnail VARCHAR(500),
    Price DECIMAL(10,2),
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived')),
    Level VARCHAR(20) CHECK (Level IN ('beginner', 'intermediate', 'advanced')),
    Duration INT,
    Categories VARCHAR(500),
    Tags VARCHAR(500),
    Language VARCHAR(50),
    Requirements TEXT,
    AutoCertificate BIT DEFAULT 0,
    Rating DECIMAL(3,2),
    EnrollmentCount INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Lessons table
CREATE TABLE Lessons (
    LessonID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    Content TEXT,
    Duration INT,
    OrderIndex INT DEFAULT 0,
    IsPreview BIT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Enrollments table
CREATE TABLE Enrollments (
    EnrollmentID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'completed', 'cancelled')),
    Progress DECIMAL(5,2) DEFAULT 0,
    EnrolledAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    LastAccessedAt DATETIME,
    ExpiresAt DATETIME,
    Notes TEXT
);

-- Create Progress table
CREATE TABLE Progress (
    ProgressID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    LessonID INT FOREIGN KEY REFERENCES Lessons(LessonID),
    Status VARCHAR(20) DEFAULT 'not-started' CHECK (Status IN ('not-started', 'in-progress', 'completed')),
    Progress DECIMAL(5,2) DEFAULT 0,
    Score DECIMAL(5,2),
    TimeSpent INT,
    LastAccessDate DATETIME,
    CompletedDate DATETIME
);

-- Create Quizzes table
CREATE TABLE Quizzes (
    QuizID INT IDENTITY(1,1) PRIMARY KEY,
    LessonID INT FOREIGN KEY REFERENCES Lessons(LessonID),
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    Duration INT,
    PassingScore FLOAT DEFAULT 70,
    AttemptsAllowed INT DEFAULT 1,
    ShuffleQuestions BIT DEFAULT 0,
    ShowAnswers VARCHAR(20) DEFAULT 'after_submit' CHECK (ShowAnswers IN ('never', 'after_submit', 'after_deadline', 'after_all_attempts')),
    IsPublished BIT DEFAULT 0,
    AvailableFrom DATETIME,
    AvailableUntil DATETIME,
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived', 'deleted')),
    TotalPoints INT DEFAULT 0,
    TimeLimit INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    LastModifiedBy INT FOREIGN KEY REFERENCES Users(UserID)
);

-- Create Questions table
CREATE TABLE Questions (
    QuestionID INT IDENTITY(1,1) PRIMARY KEY,
    QuizID INT FOREIGN KEY REFERENCES Quizzes(QuizID),
    QuestionType VARCHAR(20) DEFAULT 'single' CHECK (QuestionType IN ('single', 'multiple', 'points', 'text', 'matching')),
    QuestionText TEXT NOT NULL,
    ExplanationText TEXT,
    Points FLOAT DEFAULT 1,
    PartialCredit BIT DEFAULT 0,
    OrderIndex INT DEFAULT 0,
    IsRequired BIT DEFAULT 1,
    TimeLimit INT,
    ImageURL VARCHAR(500),
    VideoURL VARCHAR(500),
    AudioURL VARCHAR(500),
    Difficulty VARCHAR(20) DEFAULT 'medium' CHECK (Difficulty IN ('easy', 'medium', 'hard')),
    Tags VARCHAR(500),
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive', 'deleted')),
    Metadata NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    LastModifiedBy INT FOREIGN KEY REFERENCES Users(UserID)
);

-- Create Options table
CREATE TABLE Options (
    OptionID INT IDENTITY(1,1) PRIMARY KEY,
    QuestionID INT FOREIGN KEY REFERENCES Questions(QuestionID),
    Text VARCHAR(1000) NOT NULL,
    IsCorrect BIT DEFAULT 0,
    ExplanationText TEXT,
    OrderIndex INT DEFAULT 0,
    Points FLOAT DEFAULT 0,
    FeedbackText TEXT,
    IsImage BIT DEFAULT 0,
    ImageURL VARCHAR(500),
    AudioURL VARCHAR(500),
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive', 'deleted')),
    Metadata NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
    LastModifiedAt DATETIME DEFAULT GETDATE(),
    LastModifiedBy INT FOREIGN KEY REFERENCES Users(UserID)
);

-- Create Results table
CREATE TABLE Results (
    ResultID INT IDENTITY(1,1) PRIMARY KEY,
    QuizID INT FOREIGN KEY REFERENCES Quizzes(QuizID),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    AttemptNumber INT DEFAULT 1,
    Score FLOAT,
    EarnedPoints FLOAT,
    TotalPoints FLOAT,
    TimeTaken INT,
    Status VARCHAR(20) DEFAULT 'in_progress' CHECK (Status IN ('in_progress', 'completed', 'expired', 'cancelled')),
    Details NVARCHAR(MAX),
    Answers NVARCHAR(MAX),
    FeedbackNotes TEXT,
    ReviewedBy INT FOREIGN KEY REFERENCES Users(UserID),
    ReviewedAt DATETIME,
    StartedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    ExpiresAt DATETIME,
    IP VARCHAR(45),
    UserAgent VARCHAR(500),
    Metadata NVARCHAR(MAX)
);

-- Create Certificates table
CREATE TABLE Certificates (
    CertificateID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    IssueDate DATETIME DEFAULT GETDATE(),
    ExpiryDate DATETIME,
    CertificateNumber VARCHAR(100) UNIQUE,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'revoked', 'expired')),
    Title VARCHAR(200),
    Description TEXT,
    Metadata NVARCHAR(MAX)
);

-- Create Files table
CREATE TABLE Files (
    FileID INT IDENTITY(1,1) PRIMARY KEY,
    Type VARCHAR(50) CHECK (Type IN ('image', 'document', 'video', 'audio')),
    URL VARCHAR(500) NOT NULL,
    Name VARCHAR(200),
    Size INT,
    MimeType VARCHAR(100),
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'deleted')),
    UploadedBy INT FOREIGN KEY REFERENCES Users(UserID),
    UploadedAt DATETIME DEFAULT GETDATE()
);

-- Create RevenueShare table
CREATE TABLE RevenueShare (
    ShareID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    InstructorID INT FOREIGN KEY REFERENCES Users(UserID),
    Percentage DECIMAL(5,2) DEFAULT 70,
    EffectiveFrom DATETIME DEFAULT GETDATE(),
    EffectiveUntil DATETIME,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive'))
);

-- Create Transactions table
CREATE TABLE Transactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    Amount DECIMAL(10,2),
    Currency VARCHAR(3) DEFAULT 'USD',
    Status VARCHAR(20) DEFAULT 'pending' CHECK (Status IN ('pending', 'completed', 'failed', 'refunded')),
    PaymentMethod VARCHAR(50),
    PaymentDetails NVARCHAR(MAX),
    TransactionDate DATETIME DEFAULT GETDATE(),
    RefundDate DATETIME,
    Notes TEXT
);

-- Create Comments table
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ParentID INT FOREIGN KEY REFERENCES Comments(CommentID),
    Type VARCHAR(20) CHECK (Type IN ('lesson', 'discussion')),
    ReferenceID INT,
    Content TEXT NOT NULL,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'hidden', 'deleted')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create ForumPosts table
CREATE TABLE ForumPosts (
    PostID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    Title VARCHAR(200) NOT NULL,
    Content TEXT NOT NULL,
    Tags VARCHAR(500),
    Views INT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'hidden', 'deleted')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Ratings table
CREATE TABLE Ratings (
    RatingID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Review TEXT,
    Status VARCHAR(20) DEFAULT 'pending' CHECK (Status IN ('pending', 'approved', 'rejected')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Notifications table
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Type VARCHAR(50) CHECK (Type IN ('system', 'course', 'quiz', 'comment', 'payment')),
    Title VARCHAR(200),
    Message TEXT,
    ReferenceType VARCHAR(50),
    ReferenceID INT,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME
);

-- Create Schedules table
CREATE TABLE Schedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    Title VARCHAR(200),
    Description TEXT,
    StartTime DATETIME,
    EndTime DATETIME,
    RecurrenceRule VARCHAR(500),
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'cancelled')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Announcements table
CREATE TABLE Announcements (
    AnnouncementID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT FOREIGN KEY REFERENCES Courses(CourseID),
    Title VARCHAR(200) NOT NULL,
    Content TEXT NOT NULL,
    Priority VARCHAR(20) CHECK (Priority IN ('low', 'medium', 'high')),
    StartDate DATETIME,
    EndDate DATETIME,
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived')),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Assignments table
CREATE TABLE Assignments (
    AssignmentID INT IDENTITY(1,1) PRIMARY KEY,
    LessonID INT FOREIGN KEY REFERENCES Lessons(LessonID),
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    Instructions TEXT,
    DueDate DATETIME,
    MaxPoints FLOAT DEFAULT 100,
    PassingScore FLOAT DEFAULT 60,
    AllowLateSubmission BIT DEFAULT 0,
    LateSubmissionDeadline DATETIME,
    LateSubmissionPenalty FLOAT DEFAULT 0,
    AttachmentRequired BIT DEFAULT 0,
    MaxFileSize INT,
    AllowedFileTypes VARCHAR(500),
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published', 'archived', 'deleted')),
    RubricData NVARCHAR(MAX),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Submissions table
CREATE TABLE Submissions (
    SubmissionID INT IDENTITY(1,1) PRIMARY KEY,
    AssignmentID INT FOREIGN KEY REFERENCES Assignments(AssignmentID),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Content TEXT,
    AttachmentURL VARCHAR(500),
    SubmissionDate DATETIME DEFAULT GETDATE(),
    Status VARCHAR(20) DEFAULT 'submitted' CHECK (Status IN ('draft', 'submitted', 'late', 'graded', 'returned')),
    Score FLOAT,
    Feedback TEXT,
    GradedBy INT FOREIGN KEY REFERENCES Users(UserID),
    GradedAt DATETIME,
    RubricScore NVARCHAR(MAX),
    IsLate BIT DEFAULT 0,
    LateSubmissionMinutes INT,
    FinalScore FLOAT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create Indexes
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Role ON Users(Role);
CREATE INDEX IX_Users_Status ON Users(Status);

CREATE INDEX IX_Courses_InstructorID ON Courses(InstructorID);
CREATE INDEX IX_Courses_Status ON Courses(Status);
CREATE INDEX IX_Courses_Categories ON Courses(Categories);

CREATE INDEX IX_Lessons_CourseID ON Lessons(CourseID);
CREATE INDEX IX_Lessons_OrderIndex ON Lessons(OrderIndex);
CREATE INDEX IX_Lessons_Status ON Lessons(Status);

CREATE INDEX IX_Enrollments_UserID ON Enrollments(UserID);
CREATE INDEX IX_Enrollments_CourseID ON Enrollments(CourseID);
CREATE INDEX IX_Enrollments_Status ON Enrollments(Status);

CREATE INDEX IX_Progress_UserID ON Progress(UserID);
CREATE INDEX IX_Progress_LessonID ON Progress(LessonID);
CREATE INDEX IX_Progress_Status ON Progress(Status);

CREATE INDEX IX_Quizzes_LessonID ON Quizzes(LessonID);
CREATE INDEX IX_Quizzes_Status ON Quizzes(Status);
CREATE INDEX IX_Quizzes_IsPublished ON Quizzes(IsPublished);

CREATE INDEX IX_Questions_QuizID ON Questions(QuizID);
CREATE INDEX IX_Questions_Type ON Questions(QuestionType);
CREATE INDEX IX_Questions_Status ON Questions(Status);
CREATE INDEX IX_Questions_Difficulty ON Questions(Difficulty);

CREATE INDEX IX_Options_QuestionID ON Options(QuestionID);
CREATE INDEX IX_Options_IsCorrect ON Options(IsCorrect);
CREATE INDEX IX_Options_Status ON Options(Status);

CREATE INDEX IX_Results_QuizID ON Results(QuizID);
CREATE INDEX IX_Results_UserID ON Results(UserID);
CREATE INDEX IX_Results_Status ON Results(Status);

CREATE INDEX IX_Certificates_UserID ON Certificates(UserID);
CREATE INDEX IX_Certificates_CourseID ON Certificates(CourseID);
CREATE INDEX IX_Certificates_Status ON Certificates(Status);

CREATE INDEX IX_Transactions_UserID ON Transactions(UserID);
CREATE INDEX IX_Transactions_CourseID ON Transactions(CourseID);
CREATE INDEX IX_Transactions_Status ON Transactions(Status);

CREATE INDEX IX_ForumPosts_UserID ON ForumPosts(UserID);
CREATE INDEX IX_ForumPosts_CourseID ON ForumPosts(CourseID);
CREATE INDEX IX_ForumPosts_Status ON ForumPosts(Status);

CREATE INDEX IX_Comments_UserID ON Comments(UserID);
CREATE INDEX IX_Comments_ReferenceID ON Comments(ReferenceID);
CREATE INDEX IX_Comments_Status ON Comments(Status);

CREATE INDEX IX_Notifications_UserID ON Notifications(UserID);
CREATE INDEX IX_Notifications_Type ON Notifications(Type);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);

CREATE INDEX IX_Ratings_UserID ON Ratings(UserID);
CREATE INDEX IX_Ratings_CourseID ON Ratings(CourseID);
CREATE INDEX IX_Ratings_Status ON Ratings(Status);

CREATE INDEX IX_Assignments_LessonID ON Assignments(LessonID);
CREATE INDEX IX_Assignments_Status ON Assignments(Status);
CREATE INDEX IX_Assignments_DueDate ON Assignments(DueDate);

CREATE INDEX IX_Submissions_AssignmentID ON Submissions(AssignmentID);
CREATE INDEX IX_Submissions_UserID ON Submissions(UserID);
CREATE INDEX IX_Submissions_Status ON Submissions(Status);
CREATE INDEX IX_Submissions_SubmissionDate ON Submissions(SubmissionDate);
GO