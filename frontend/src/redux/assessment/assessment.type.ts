export type AttendanceStatus = "present" | "absent" | "exempt";
export type MarkWorkflowStatus = "draft" | "submitted" | "verified";

export interface ICandidateStudent {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
}

export interface ICandidate {
  id: number;
  exam_type: number;
  student: ICandidateStudent;
  is_eligible: boolean;
}

export interface IMarkRow {
  candidate: number;
  student: ICandidateStudent;
  attendance_status: AttendanceStatus;
  obtained_mark: string | number | null;
  remark: string;
  workflow_status: MarkWorkflowStatus;
}

export interface IMarkInput {
  candidate: number;
  attendance_status: AttendanceStatus;
  obtained_mark: string | number | null;
  remark?: string;
}

export interface IMarkSheet {
  exam: {
    id: number;
    name: string;
    subject: string;
    total_mark: number;
    pass_mark: number;
    exam_type: number;
  };
  rows: IMarkRow[];
}

export interface IReviewExam {
  exam: number;
  name: string;
  subject: string;
  entered: number;
  verified: number;
  expected: number;
}

export interface IAssessmentReview {
  exam_type: number;
  exam_type_name: string;
  candidate_count: number;
  exam_count: number;
  expected_marks: number;
  entered_marks: number;
  draft_marks: number;
  submitted_marks: number;
  verified_marks: number;
  missing_marks: number;
  ready_to_publish: boolean;
  exams: IReviewExam[];
}

export interface IGradeBand {
  id?: number;
  minimum_percentage: string | number;
  maximum_percentage: string | number;
  grade: string;
  grade_point: string | number;
}

export interface IGradeScale {
  id: number;
  name: string;
  is_default: boolean;
  is_active: boolean;
  bands: IGradeBand[];
}

export interface IGradeScaleWrite {
  name: string;
  is_default: boolean;
  bands: IGradeBand[];
}

export interface IPublication {
  id: number;
  exam_type: number;
  exam_type_name: string;
  batch_name: string;
  version: number;
  status: "published" | "superseded";
  message: string;
  show_rank: boolean;
  published_at: string;
  published_by: number;
}

export interface IOutcomeLine {
  id: number;
  exam: number;
  exam_name: string;
  subject: string;
  subject_code: string;
  attendance_status: AttendanceStatus;
  obtained_mark: string | null;
  total_mark: string;
  pass_mark: string;
  percentage: string | null;
  grade: string;
  grade_point: string | null;
  has_passed: boolean;
}

export interface IOutcome {
  id: number;
  publication: IPublication;
  student: ICandidateStudent;
  total_obtained: string;
  total_possible: string;
  percentage: string;
  grade: string;
  grade_point: string;
  has_passed: boolean;
  rank: number | null;
  lines: IOutcomeLine[];
  created_at: string;
}

export interface IChild extends ICandidateStudent {
  relationship: string;
}
