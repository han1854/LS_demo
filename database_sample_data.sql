USE LSdemo_db;
GO

-- Insert Categories
INSERT INTO Categories (Name, Slug, Description, ParentID, Status)
VALUES 
    (N'Ngoại ngữ', 'ngoai-ngu', N'Các khóa học ngoại ngữ', NULL, 'active'),
    (N'Tiếng Anh', 'tieng-anh', N'Khóa học tiếng Anh các cấp độ', 1, 'active'),
    (N'Tiếng Nhật', 'tieng-nhat', N'Khóa học tiếng Nhật từ cơ bản đến nâng cao', 1, 'active'),
    (N'Kỹ năng mềm', 'ky-nang-mem', N'Các khóa học về kỹ năng mềm', NULL, 'active'),
    (N'Marketing', 'marketing', N'Khóa học về Digital Marketing', NULL, 'active'),
    (N'Thiết kế', 'thiet-ke', N'Các khóa học về thiết kế và sáng tạo', NULL, 'active');

-- Insert Users
INSERT INTO Users (Username, Email, Password, FirstName, LastName, Role, Bio)
VALUES
    ('admin', 'admin@learnspace.com', '$2b$10$abcdefghijklmnopqrstuv', N'Admin', N'System', 'admin', N'System Administrator'),
    ('instructor1', 'instructor1@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', N'Sarah', N'Johnson', 'instructor', N'Giảng viên tiếng Anh với 8 năm kinh nghiệm, chứng chỉ TESOL'),
    ('instructor2', 'instructor2@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', N'Yamamoto', N'Kenji', 'instructor', N'Giảng viên tiếng Nhật bản ngữ, N1 JLPT'),
    ('student1', 'student1@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', N'Nguyễn', N'Văn A', 'student', N'Đam mê học ngoại ngữ'),
    ('student2', 'student2@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', N'Trần', N'Thị B', 'student', N'Người sáng tạo nội dung');

-- Insert Courses
INSERT INTO Courses (CategoryID, InstructorID, Title, Slug, Description, Price, Status, Duration)
VALUES
    (2, 2, N'IELTS 7.0 - Lộ trình hoàn chỉnh', 'ielts-7-lo-trinh-hoan-chinh', N'Khóa học IELTS từ 0-7.0 với phương pháp độc quyền', 1499000, 'published', 4800),
    (2, 2, N'Tiếng Anh giao tiếp thương mại', 'tieng-anh-giao-tiep-thuong-mai', N'Tiếng Anh cho người đi làm và doanh nghiệp', 899000, 'published', 2400),
    (3, 3, N'JLPT N5 - Nhập môn tiếng Nhật', 'jlpt-n5-nhap-mon-tieng-nhat', N'Khóa học tiếng Nhật cho người mới bắt đầu', 799000, 'published', 3600),
    (4, 2, N'Kỹ năng thuyết trình chuyên nghiệp', 'ky-nang-thuyet-trinh-chuyen-nghiep', N'Làm chủ nghệ thuật thuyết trình trước đám đông', 699000, 'published', 1800),
    (5, 2, N'Digital Marketing Master', 'digital-marketing-master', N'Chiến lược Marketing Online toàn diện', 1299000, 'published', 3600);

-- Insert Lessons
INSERT INTO Lessons (CourseID, Title, Description, Duration, OrderIndex, IsPreview, Status)
VALUES
    (1, N'Tổng quan về IELTS', N'Giới thiệu cấu trúc bài thi và chiến lược học', 30, 1, 1, 'published'),
    (1, N'IELTS Listening Skills', N'Kỹ năng nghe và các dạng câu hỏi thường gặp', 45, 2, 0, 'published'),
    (1, N'IELTS Reading Techniques', N'Chiến thuật làm bài đọc hiệu quả', 60, 3, 0, 'published'),
    (2, N'Business Email Writing', N'Kỹ năng viết email tiếng Anh chuyên nghiệp', 40, 1, 1, 'published'),
    (2, N'Meeting & Presentation', N'Từ vựng và cấu trúc cho cuộc họp', 50, 2, 0, 'published');

-- Insert Enrollments
INSERT INTO Enrollments (UserID, CourseID, Status, Progress)
VALUES
    (4, 1, 'active', 35.5),
    (4, 2, 'active', 20.0),
    (5, 1, 'active', 15.0),
    (5, 3, 'active', 10.0);

-- Insert Progress
INSERT INTO Progress (UserID, CourseID, LessonID, Status, Progress, TimeSpent)
VALUES
    (4, 1, 1, 'completed', 100, 30),
    (4, 1, 2, 'in-progress', 50, 20),
    (5, 1, 1, 'completed', 100, 35),
    (5, 3, 1, 'in-progress', 30, 15);

-- Insert Quizzes
INSERT INTO Quizzes (LessonID, Title, Description, Duration, PassingScore, CreatedBy)
VALUES
    (1, N'IELTS Overview Quiz', N'Kiểm tra kiến thức về cấu trúc bài thi IELTS', 30, 70, 2),
    (3, N'Reading Comprehension Test', N'Bài kiểm tra kỹ năng đọc hiểu IELTS', 45, 70, 2);

-- Insert Questions
INSERT INTO Questions (QuizID, QuestionType, QuestionText, Points)
VALUES
    (1, 'single', N'IELTS Academic và General Training khác nhau ở phần nào?', 1),
    (1, 'multiple', N'Chọn các kỹ năng được đánh giá trong IELTS:', 2),
    (2, 'single', N'Thời gian làm bài Reading trong IELTS là bao lâu?', 1);

-- Insert Options
INSERT INTO Options (QuestionID, Text, IsCorrect)
VALUES
    (1, N'Reading và Writing', 1),
    (1, N'Listening và Speaking', 0),
    (2, N'Listening', 1),
    (2, N'Reading', 1),
    (2, N'Dancing', 0),
    (3, N'60 phút', 1),
    (3, N'45 phút', 0);

-- Insert Ratings
INSERT INTO Ratings (UserID, CourseID, Rating, Review)
VALUES
    (4, 1, 5, N'Khóa học rất hay và dễ hiểu'),
    (5, 1, 4, N'Nội dung phong phú, giảng viên nhiệt tình'),
    (4, 2, 5, N'Tuyệt vời, đã học được nhiều điều mới');

-- Insert Comments
INSERT INTO Comments (UserID, LessonID, Content)
VALUES
    (4, 1, N'Bài giảng rất chi tiết và dễ hiểu'),
    (5, 1, N'Cám ơn giảng viên đã giải thích rõ ràng'),
    (4, 2, N'Phần này hơi khó, cần giải thích thêm');

-- Insert ForumPosts
INSERT INTO ForumPosts (UserID, CourseID, Title, Content)
VALUES
    (4, 1, N'Cách luyện Speaking tại nhà', N'Mọi người có phương pháp nào hay để luyện Speaking khi học một mình không?'),
    (5, 1, N'Chia sẻ kinh nghiệm thi IELTS', N'Mình vừa thi IELTS được 7.0, chia sẻ một số kinh nghiệm cho các bạn');

-- Insert Certificates
INSERT INTO Certificates (UserID, CourseID, CertificateNumber, CompletionDate)
VALUES
    (4, 2, 'CERT-HTML-001', GETDATE()),
    (5, 1, 'CERT-JS-001', GETDATE());

-- Insert Transactions
INSERT INTO Transactions (UserID, CourseID, Amount, Status, PaymentMethod)
VALUES
    (4, 1, 799000, 'completed', 'momo'),
    (4, 2, 499000, 'completed', 'vnpay'),
    (5, 1, 799000, 'completed', 'bank_transfer'),
    (5, 3, 899000, 'completed', 'momo');

-- Insert RevenueShare
INSERT INTO RevenueShare (CourseID, InstructorID, Percentage)
VALUES
    (1, 2, 70),
    (2, 2, 70),
    (3, 2, 70),
    (4, 3, 70),
    (5, 3, 70);

-- Insert Notifications
INSERT INTO Notifications (UserID, Type, Title, Message)
VALUES
    (4, 'course', N'Bài học mới đã được thêm', N'Khóa học JavaScript có bài học mới'),
    (5, 'quiz', N'Nhắc nhở làm bài kiểm tra', N'Bạn có bài kiểm tra cần hoàn thành'),
    (2, 'system', N'Thông báo hệ thống', N'Cập nhật nội dung khóa học');

-- Insert Schedules
INSERT INTO Schedules (UserID, CourseID, Title, StartTime, EndTime)
VALUES
    (4, 1, N'Học JavaScript', DATEADD(day, 1, GETDATE()), DATEADD(day, 1, DATEADD(hour, 2, GETDATE()))),
    (5, 1, N'Học React', DATEADD(day, 2, GETDATE()), DATEADD(day, 2, DATEADD(hour, 2, GETDATE())));

-- Insert Announcements
INSERT INTO Announcements (CourseID, Title, Content, Priority, CreatedBy)
VALUES
    (1, N'Cập nhật nội dung khóa học', N'Thêm các bài tập thực hành mới', 'high', 2),
    (2, N'Thông báo bảo trì hệ thống', N'Hệ thống sẽ bảo trì vào cuối tuần', 'medium', 1);

GO