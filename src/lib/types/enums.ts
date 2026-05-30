export type UserRole = 'super_admin' | 'cs_admin' | 'dept_poc' | 'auditor' | 'viewer'

export type ResponseStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export type ReportPeriodStatus = 'open' | 'data_collection' | 'review' | 'filed' | 'closed'

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
