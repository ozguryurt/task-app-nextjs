-- Apply once after 007_add_task_collaboration.sql on existing installations.
CREATE TABLE project_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    project_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) DEFAULT NULL,
    target_date DATE DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_milestone_name (project_id, name),
    INDEX idx_milestones_team_project (team_id, project_id),
    INDEX idx_milestones_target_date (target_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE tasks
    ADD COLUMN milestone_id INT DEFAULT NULL AFTER project_id,
    ADD INDEX idx_milestone_id (milestone_id),
    ADD CONSTRAINT fk_tasks_milestone FOREIGN KEY (milestone_id) REFERENCES project_milestones(id) ON DELETE SET NULL;
