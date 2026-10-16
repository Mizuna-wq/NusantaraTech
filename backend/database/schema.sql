-- NusantaraTech Recruitment - schema MySQL
-- Jalankan: mysql -u root -p < backend/database/schema.sql
-- Jika DB_NAME di .env diubah, ubah juga nama database di bawah ini.

CREATE DATABASE IF NOT EXISTS recruitment_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE recruitment_db;

-- Akun login untuk candidate dan HR/admin
CREATE TABLE users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('candidate', 'admin') NOT NULL DEFAULT 'candidate',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- Data tambahan candidate (nama, email, HP tetap di tabel users)
CREATE TABLE candidate_profiles (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  address    VARCHAR(255) NULL,
  city       VARCHAR(100) NULL,
  education  VARCHAR(255) NULL,
  skills     TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profiles_user (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Info file CV. File aslinya ada di backend/uploads/cv/
-- Candidate boleh punya beberapa baris (riwayat); yang aktif ditandai is_current = 1.
-- Baris lama dipertahankan karena bisa masih dipakai oleh lamaran yang sudah terkirim.
CREATE TABLE cv_files (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_profile_id INT UNSIGNED NOT NULL,
  original_filename    VARCHAR(255) NOT NULL,
  stored_filename      VARCHAR(255) NOT NULL,
  file_path            VARCHAR(255) NOT NULL,
  mime_type            VARCHAR(100) NOT NULL,
  file_size            INT UNSIGNED NOT NULL,
  is_current           TINYINT(1) NOT NULL DEFAULT 1,
  uploaded_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cv_stored_filename (stored_filename),
  KEY idx_cv_profile (candidate_profile_id),
  CONSTRAINT fk_cv_profile FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Lowongan kerja / internship
CREATE TABLE jobs (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title            VARCHAR(150) NOT NULL,
  department       VARCHAR(100) NOT NULL,
  description      TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  qualifications   TEXT NOT NULL,
  benefits         TEXT NULL,
  location         VARCHAR(100) NOT NULL,
  employment_type  ENUM('full_time', 'part_time', 'contract', 'internship') NOT NULL,
  salary_min       INT UNSIGNED NULL,
  salary_max       INT UNSIGNED NULL,
  deadline         DATE NULL,
  status           ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
  created_by       INT UNSIGNED NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_jobs_status (status),
  KEY idx_jobs_department (department),
  KEY idx_jobs_location (location),
  CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB;

-- Lamaran. UNIQUE (user_id, job_id) mencegah melamar lowongan yang sama dua kali.
-- note_internal hanya boleh dilihat HR.
CREATE TABLE applications (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  job_id        INT UNSIGNED NOT NULL,
  cv_file_id    INT UNSIGNED NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  cover_letter  TEXT NULL,
  status        ENUM('submitted', 'screening', 'interview', 'technical_test', 'accepted', 'rejected')
                NOT NULL DEFAULT 'submitted',
  note_internal TEXT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_applications_user_job (user_id, job_id),
  KEY idx_applications_job_status (job_id, status),
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs (id),
  CONSTRAINT fk_applications_cv FOREIGN KEY (cv_file_id) REFERENCES cv_files (id)
) ENGINE=InnoDB;

-- Riwayat perubahan status, dipakai untuk timeline di sisi candidate.
-- old_status NULL berarti baris pertama (saat lamaran dikirim).
-- note adalah catatan yang boleh dilihat candidate.
CREATE TABLE application_status_history (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id INT UNSIGNED NOT NULL,
  old_status     ENUM('submitted', 'screening', 'interview', 'technical_test', 'accepted', 'rejected') NULL,
  new_status     ENUM('submitted', 'screening', 'interview', 'technical_test', 'accepted', 'rejected') NOT NULL,
  changed_by     INT UNSIGNED NOT NULL,
  note           TEXT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_history_application (application_id),
  CONSTRAINT fk_history_application FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
  CONSTRAINT fk_history_changed_by FOREIGN KEY (changed_by) REFERENCES users (id)
) ENGINE=InnoDB;
