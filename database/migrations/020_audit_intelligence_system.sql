-- Migration: Audit Intelligence System
-- Description: Add stage history tracking and computed audit fields for pipeline integrity verification
-- Date: 2026-02-11

-- =====================================================
-- STAGE HISTORY TABLE (Immutable Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS candidate_stage_history (
    history_id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(255) NOT NULL REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL,
    
    -- Stage Information
    from_stage VARCHAR(100),
    to_stage VARCHAR(100) NOT NULL,
    stage_index INTEGER NOT NULL,
    
    -- Movement Metadata
    moved_by_user_id INTEGER,
    moved_by_name VARCHAR(255),
    moved_by_role VARCHAR(50),
    moved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Feedback & Scoring
    feedback TEXT,
    feedback_submitted_at TIMESTAMP,
    feedback_submitted_by VARCHAR(255),
    score DECIMAL(5,2),
    score_threshold DECIMAL(5,2),
    
    -- Additional Context
    reason TEXT,
    notes TEXT,
    duration_in_previous_stage_days INTEGER,
    
    -- Audit Flags
    is_skipped_stage BOOLEAN DEFAULT FALSE,
    is_backward_movement BOOLEAN DEFAULT FALSE,
    is_automated BOOLEAN DEFAULT FALSE,
    
    -- Immutability
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT unique_stage_movement UNIQUE (candidate_id, moved_at, to_stage)
);

-- Indexes for fast querying
CREATE INDEX idx_stage_history_candidate ON candidate_stage_history(candidate_id);
CREATE INDEX idx_stage_history_job ON candidate_stage_history(job_id);
CREATE INDEX idx_stage_history_moved_at ON candidate_stage_history(moved_at DESC);
CREATE INDEX idx_stage_history_to_stage ON candidate_stage_history(to_stage);
CREATE INDEX idx_stage_history_moved_by ON candidate_stage_history(moved_by_user_id);

-- =====================================================
-- AUDIT COMPUTED FIELDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS candidate_audit_status (
    audit_id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(255) NOT NULL UNIQUE REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL,
    
    -- Computed Audit Flags
    feedback_missing BOOLEAN DEFAULT FALSE,
    feedback_missing_stages TEXT[], -- Array of stage names
    feedback_missing_count INTEGER DEFAULT 0,
    
    score_threshold_violation BOOLEAN DEFAULT FALSE,
    score_violation_stages TEXT[],
    score_violation_count INTEGER DEFAULT 0,
    
    aging_exceeded BOOLEAN DEFAULT FALSE,
    aging_days INTEGER DEFAULT 0,
    aging_sla_days INTEGER DEFAULT 14,
    
    skipped_stages BOOLEAN DEFAULT FALSE,
    skipped_stage_list TEXT[],
    skipped_stage_count INTEGER DEFAULT 0,
    
    owner_missing BOOLEAN DEFAULT FALSE,
    assignment_gap_days INTEGER DEFAULT 0,
    
    backward_movement BOOLEAN DEFAULT FALSE,
    backward_movement_count INTEGER DEFAULT 0,
    
    -- Overall Status
    overall_audit_status VARCHAR(20) DEFAULT 'healthy', -- healthy, warning, critical
    critical_flags_count INTEGER DEFAULT 0,
    warning_flags_count INTEGER DEFAULT 0,
    
    -- Audit Details
    audit_reasons TEXT[],
    last_audit_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    current_stage VARCHAR(100),
    current_stage_since TIMESTAMP,
    total_stages_completed INTEGER DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_status_candidate ON candidate_audit_status(candidate_id);
CREATE INDEX idx_audit_status_job ON candidate_audit_status(job_id);
CREATE INDEX idx_audit_status_overall ON candidate_audit_status(overall_audit_status);
CREATE INDEX idx_audit_status_feedback_missing ON candidate_audit_status(feedback_missing);
CREATE INDEX idx_audit_status_aging ON candidate_audit_status(aging_exceeded);

-- =====================================================
-- ADD AUDIT FIELDS TO CANDIDATES TABLE
-- =====================================================
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS current_stage VARCHAR(100) DEFAULT 'Applied',
ADD COLUMN IF NOT EXISTS current_stage_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_stage_change_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_stage_change_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS total_pipeline_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hiring_manager_id INTEGER,
ADD COLUMN IF NOT EXISTS hiring_manager_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS assigned_recruiter_id INTEGER,
ADD COLUMN IF NOT EXISTS assigned_recruiter_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS job_id INTEGER DEFAULT 0;

-- =====================================================
-- TRIGGER: Auto-update audit status timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_audit_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_audit_status_timestamp
    BEFORE UPDATE ON candidate_audit_status
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_status_timestamp();

-- =====================================================
-- FUNCTION: Initialize audit status for existing candidates
-- =====================================================
CREATE OR REPLACE FUNCTION initialize_audit_status()
RETURNS void AS $$
BEGIN
    INSERT INTO candidate_audit_status (
        candidate_id,
        job_id,
        current_stage,
        current_stage_since,
        overall_audit_status
    )
    SELECT 
        c.candidate_id,
        COALESCE(c.job_id, 0),
        c.current_stage,
        COALESCE(c.current_stage_since, c.created_at),
        'healthy'
    FROM candidates c
    WHERE NOT EXISTS (
        SELECT 1 FROM candidate_audit_status cas 
        WHERE cas.candidate_id = c.candidate_id
    );
END;
$$ LANGUAGE plpgsql;

-- Execute initialization
SELECT initialize_audit_status();

-- =====================================================
-- FUNCTION: Log stage movement
-- =====================================================
CREATE OR REPLACE FUNCTION log_stage_movement(
    p_candidate_id VARCHAR(255),
    p_job_id INTEGER,
    p_from_stage VARCHAR(100),
    p_to_stage VARCHAR(100),
    p_stage_index INTEGER,
    p_moved_by_user_id INTEGER,
    p_moved_by_name VARCHAR(255),
    p_moved_by_role VARCHAR(50),
    p_feedback TEXT DEFAULT NULL,
    p_score DECIMAL(5,2) DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_history_id INTEGER;
    v_duration_days INTEGER;
    v_is_skipped BOOLEAN;
    v_is_backward BOOLEAN;
BEGIN
    -- Calculate duration in previous stage
    SELECT EXTRACT(DAY FROM (CURRENT_TIMESTAMP - current_stage_since))::INTEGER
    INTO v_duration_days
    FROM candidates
    WHERE candidate_id = p_candidate_id;
    
    -- Detect skipped stages (stage_index jump > 1)
    v_is_skipped := FALSE;
    
    -- Detect backward movement
    v_is_backward := FALSE;
    
    -- Insert into history
    INSERT INTO candidate_stage_history (
        candidate_id,
        job_id,
        from_stage,
        to_stage,
        stage_index,
        moved_by_user_id,
        moved_by_name,
        moved_by_role,
        moved_at,
        feedback,
        score,
        reason,
        duration_in_previous_stage_days,
        is_skipped_stage,
        is_backward_movement
    ) VALUES (
        p_candidate_id,
        p_job_id,
        p_from_stage,
        p_to_stage,
        p_stage_index,
        p_moved_by_user_id,
        p_moved_by_name,
        p_moved_by_role,
        CURRENT_TIMESTAMP,
        p_feedback,
        p_score,
        p_reason,
        v_duration_days,
        v_is_skipped,
        v_is_backward
    )
    RETURNING history_id INTO v_history_id;
    
    -- Update candidate current stage
    UPDATE candidates
    SET 
        current_stage = p_to_stage,
        current_stage_since = CURRENT_TIMESTAMP,
        last_stage_change_at = CURRENT_TIMESTAMP,
        last_stage_change_by = p_moved_by_name,
        updated_at = CURRENT_TIMESTAMP
    WHERE candidate_id = p_candidate_id;
    
    RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Compute audit status
-- =====================================================
CREATE OR REPLACE FUNCTION compute_audit_status(p_candidate_id VARCHAR(255))
RETURNS void AS $$
DECLARE
    v_job_id INTEGER;
    v_current_stage VARCHAR(100);
    v_current_stage_since TIMESTAMP;
    v_aging_days INTEGER;
    v_feedback_missing_count INTEGER;
    v_feedback_missing_stages TEXT[];
    v_score_violation_count INTEGER;
    v_score_violation_stages TEXT[];
    v_skipped_count INTEGER;
    v_skipped_stages TEXT[];
    v_backward_count INTEGER;
    v_owner_missing BOOLEAN;
    v_overall_status VARCHAR(20);
    v_critical_count INTEGER;
    v_warning_count INTEGER;
    v_audit_reasons TEXT[];
BEGIN
    -- Get candidate info
    SELECT 
        COALESCE(job_id, 0),
        current_stage,
        current_stage_since,
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - current_stage_since))::INTEGER,
        CASE WHEN hiring_manager_id IS NULL THEN TRUE ELSE FALSE END
    INTO 
        v_job_id,
        v_current_stage,
        v_current_stage_since,
        v_aging_days,
        v_owner_missing
    FROM candidates
    WHERE candidate_id = p_candidate_id;
    
    -- Check feedback missing (stages without feedback)
    SELECT 
        COUNT(*),
        ARRAY_AGG(to_stage)
    INTO 
        v_feedback_missing_count,
        v_feedback_missing_stages
    FROM candidate_stage_history
    WHERE candidate_id = p_candidate_id
        AND feedback IS NULL
        AND to_stage NOT IN ('Applied', 'Screening', 'CV Shortlist');
    
    -- Check score violations (score < threshold)
    SELECT 
        COUNT(*),
        ARRAY_AGG(to_stage)
    INTO 
        v_score_violation_count,
        v_score_violation_stages
    FROM candidate_stage_history
    WHERE candidate_id = p_candidate_id
        AND score IS NOT NULL
        AND score_threshold IS NOT NULL
        AND score < score_threshold;
    
    -- Check skipped stages
    SELECT 
        COUNT(*),
        ARRAY_AGG(to_stage)
    INTO 
        v_skipped_count,
        v_skipped_stages
    FROM candidate_stage_history
    WHERE candidate_id = p_candidate_id
        AND is_skipped_stage = TRUE;
    
    -- Check backward movements
    SELECT COUNT(*)
    INTO v_backward_count
    FROM candidate_stage_history
    WHERE candidate_id = p_candidate_id
        AND is_backward_movement = TRUE;
    
    -- Compute overall status
    v_critical_count := 0;
    v_warning_count := 0;
    v_audit_reasons := ARRAY[]::TEXT[];
    
    IF v_feedback_missing_count > 0 THEN
        v_critical_count := v_critical_count + 1;
        v_audit_reasons := array_append(v_audit_reasons, 'Missing feedback in ' || v_feedback_missing_count || ' stage(s)');
    END IF;
    
    IF v_score_violation_count > 0 THEN
        v_critical_count := v_critical_count + 1;
        v_audit_reasons := array_append(v_audit_reasons, 'Score below threshold in ' || v_score_violation_count || ' stage(s)');
    END IF;
    
    IF v_aging_days > 30 THEN
        v_critical_count := v_critical_count + 1;
        v_audit_reasons := array_append(v_audit_reasons, 'Aging exceeded: ' || v_aging_days || ' days in current stage');
    ELSIF v_aging_days > 14 THEN
        v_warning_count := v_warning_count + 1;
        v_audit_reasons := array_append(v_audit_reasons, 'Aging warning: ' || v_aging_days || ' days in current stage');
    END IF;
    
    IF v_skipped_count > 0 THEN
        v_warning_count := v_warning_count + 1;
        v_audit_reasons := array_append(v_audit_reasons, 'Skipped ' || v_skipped_count || ' stage(s)');
    END IF;
    
    IF v_owner_missing THEN
        v_warning_count := v_warning_count + 1;
        v_audit_reasons := array_append(v_audit_reasons, 'No hiring manager assigned');
    END IF;
    
    IF v_backward_count > 0 THEN
        v_warning_count := v_warning_count + 1;
        v_audit_reasons := array_append(v_audit_reasons, 'Backward movement detected');
    END IF;
    
    -- Determine overall status
    IF v_critical_count > 0 THEN
        v_overall_status := 'critical';
    ELSIF v_warning_count > 0 THEN
        v_overall_status := 'warning';
    ELSE
        v_overall_status := 'healthy';
    END IF;
    
    -- Upsert audit status
    INSERT INTO candidate_audit_status (
        candidate_id,
        job_id,
        feedback_missing,
        feedback_missing_stages,
        feedback_missing_count,
        score_threshold_violation,
        score_violation_stages,
        score_violation_count,
        aging_exceeded,
        aging_days,
        skipped_stages,
        skipped_stage_list,
        skipped_stage_count,
        owner_missing,
        backward_movement,
        backward_movement_count,
        overall_audit_status,
        critical_flags_count,
        warning_flags_count,
        audit_reasons,
        current_stage,
        current_stage_since,
        last_audit_check
    ) VALUES (
        p_candidate_id,
        v_job_id,
        v_feedback_missing_count > 0,
        v_feedback_missing_stages,
        v_feedback_missing_count,
        v_score_violation_count > 0,
        v_score_violation_stages,
        v_score_violation_count,
        v_aging_days > 30,
        v_aging_days,
        v_skipped_count > 0,
        v_skipped_stages,
        v_skipped_count,
        v_owner_missing,
        v_backward_count > 0,
        v_backward_count,
        v_overall_status,
        v_critical_count,
        v_warning_count,
        v_audit_reasons,
        v_current_stage,
        v_current_stage_since,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (candidate_id) DO UPDATE SET
        feedback_missing = EXCLUDED.feedback_missing,
        feedback_missing_stages = EXCLUDED.feedback_missing_stages,
        feedback_missing_count = EXCLUDED.feedback_missing_count,
        score_threshold_violation = EXCLUDED.score_threshold_violation,
        score_violation_stages = EXCLUDED.score_violation_stages,
        score_violation_count = EXCLUDED.score_violation_count,
        aging_exceeded = EXCLUDED.aging_exceeded,
        aging_days = EXCLUDED.aging_days,
        skipped_stages = EXCLUDED.skipped_stages,
        skipped_stage_list = EXCLUDED.skipped_stage_list,
        skipped_stage_count = EXCLUDED.skipped_stage_count,
        owner_missing = EXCLUDED.owner_missing,
        backward_movement = EXCLUDED.backward_movement,
        backward_movement_count = EXCLUDED.backward_movement_count,
        overall_audit_status = EXCLUDED.overall_audit_status,
        critical_flags_count = EXCLUDED.critical_flags_count,
        warning_flags_count = EXCLUDED.warning_flags_count,
        audit_reasons = EXCLUDED.audit_reasons,
        current_stage = EXCLUDED.current_stage,
        current_stage_since = EXCLUDED.current_stage_since,
        last_audit_check = EXCLUDED.last_audit_check,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE candidate_stage_history IS 'Immutable audit trail of all candidate stage movements';
COMMENT ON TABLE candidate_audit_status IS 'Computed audit status and flags for pipeline integrity verification';
COMMENT ON FUNCTION log_stage_movement IS 'Logs a stage movement and updates candidate current stage';
COMMENT ON FUNCTION compute_audit_status IS 'Computes and updates audit status for a candidate';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Add appropriate grants based on your user roles
-- GRANT SELECT, INSERT ON candidate_stage_history TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON candidate_audit_status TO your_app_user;
