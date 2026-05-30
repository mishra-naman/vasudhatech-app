export type UserRole = 'super_admin' | 'cs_admin' | 'dept_poc' | 'auditor' | 'viewer'

export type ResponseStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export type ReportPeriodStatus = 'open' | 'data_collection' | 'review' | 'assurance' | 'filed' | 'closed'

export type AssignmentStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected'

export type IndicatorCategory = 'essential' | 'leadership' | 'core' | 'comprehensive'

export type ResponseType =
  | 'text'
  | 'number'
  | 'percentage'
  | 'yes_no'
  | 'select'
  | 'multi_select'
  | 'table'
  | 'file_upload'
  | 'date'
  | 'rich_text'

export type FrameworkCode = 'BRSR' | 'GRI' | 'TCFD' | 'CSR' | 'SASB' | 'CDP'
