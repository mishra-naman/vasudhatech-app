-- Migration 008a: Seed BRSR framework — complete question bank
BEGIN;

-- ============================================================
-- FRAMEWORKS
-- ============================================================
INSERT INTO public.frameworks (code, name, version, country, regulator, description) VALUES
  ('BRSR', 'Business Responsibility and Sustainability Reporting', '2.0', 'IN', 'SEBI',
   'Mandatory sustainability reporting framework for top 1000 listed companies in India'),
  ('GRI',  'Global Reporting Initiative Standards', '2021', 'Global', 'GRI',
   'Global standards for sustainability reporting used by thousands of organizations worldwide'),
  ('TCFD', 'Task Force on Climate-related Financial Disclosures', '2021', 'Global', 'TCFD/ISSB',
   'Framework for climate-related financial risk disclosure for investors'),
  ('CSR',  'Corporate Social Responsibility (India)', '2020', 'IN', 'MCA',
   'Mandatory CSR reporting under Companies Act 2013, Section 135'),
  ('SASB', 'Sustainability Accounting Standards Board', '2023', 'Global', 'IFRS Foundation',
   'Industry-specific sustainability disclosure standards'),
  ('CDP',  'Carbon Disclosure Project', '2023', 'Global', 'CDP',
   'Global disclosure system for environmental impact — climate, water, forests')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- BRSR SECTION A — General Disclosures
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'SEC-A', 'Section A: General Disclosures', 'A', 1,
       'General information about the company including products, employees, and CSR details'
FROM public.frameworks f WHERE f.code = 'BRSR';

-- Section A Indicators
INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'A-I1', 'Company Information', 'essential', 'text', null, 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'A-I2', 'Products & Services', 'essential', 'text', null, 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'A-I3', 'Operations', 'essential', 'text', null, 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'A-I4', 'Employees & Workers', 'essential', 'number', null, 4
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'A-I5', 'CSR Details', 'essential', 'number', 'INR Crore', 5
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A';

-- Section A Questions
INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A1', 'Corporate Identity Number (CIN)', 'text', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A2', 'Registered office address', null, 'text', true, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I1';

INSERT INTO public.questions (indicator_id, code, text, response_type, options, is_required, default_dept, sort_order)
SELECT i.id, 'A3', 'Stock exchange(s) where shares are listed', 'multi_select',
       '["NSE","BSE","Both","Not Listed"]'::jsonb, true, 'Finance', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A4', 'Financial year for which reporting is being done (start date)', null, 'date', true, 'Finance', 4
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A5', 'Financial year for which reporting is being done (end date)', null, 'date', true, 'Finance', 5
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I1';

INSERT INTO public.questions (indicator_id, code, text, response_type, options, is_required, default_dept, sort_order)
SELECT i.id, 'A6', 'Reporting boundary', 'select',
       '["Standalone","Consolidated"]'::jsonb, true, 'Finance', 6
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A7', 'Details of products/services (top 3 by turnover)', 'List the top 3 products or services by contribution to turnover', 'rich_text', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I2';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A8', 'Total number of plants/offices in India', null, 'number', true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I3';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A9', 'Total number of plants/offices outside India', null, 'number', true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I3';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A10', 'Total number of markets served (countries)', null, 'number', true, 'Operations', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I3';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'A11', 'Total permanent employees (male)', null, 'number', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I4';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'A12', 'Total permanent employees (female)', 'number', true, true, 'HR', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I4';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'A13', 'Total permanent workers (male)', 'number', true, true, 'HR', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I4';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'A14', 'Total permanent workers (female)', 'number', true, true, 'HR', 4
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I4';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A15', 'Average number of differently abled employees (permanent)', null, 'number', false, 'HR', 5
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I4';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A16', 'Turnover rate of employees (male %)', 'Percentage of permanent employees who left during the year', 'percentage', false, 'HR', 6
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I4';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A17', 'Turnover rate of employees (female %)', 'percentage', false, 'HR', 7
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I4';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A18', 'Number of women directors on board', null, 'number', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I4';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A19', 'Total amount spent on CSR (INR Crore)', 'Actual expenditure on CSR activities during the year', 'number', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I5';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'A20', 'Prescribed CSR obligation amount (INR Crore)', '2% of average net profits of last 3 years', 'number', true, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-A' AND i.code = 'A-I5';

-- ============================================================
-- BRSR SECTION B — Management & Process Disclosures
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'SEC-B', 'Section B: Management and Process Disclosures', 'B', 2,
       'Policy and governance disclosures for each of the 9 BRSR principles'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'B-I1', 'Policy Coverage', 'essential', 'yes_no', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-B';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'B-I2', 'Governance & Oversight', 'essential', 'yes_no', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-B';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'B1', 'Does the entity have a policy covering each of the 9 BRSR principles?', 'yes_no', true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-B' AND i.code = 'B-I1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'B2', 'URL of sustainability / BRSR policy document', 'Publicly available URL', 'text', false, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-B' AND i.code = 'B-I1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'B3', 'Is a board-level committee responsible for BRSR oversight?', 'yes_no', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-B' AND i.code = 'B-I2';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'B4', 'Name of highest authority responsible for implementation', null, 'text', true, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-B' AND i.code = 'B-I2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'B5', 'Is the BRSR reviewed/assured by an external agency?', 'yes_no', false, 'Finance', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'SEC-B' AND i.code = 'B-I2';

-- ============================================================
-- BRSR SECTION C — Principle P1: Ethics & Transparency
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P1', 'Principle 1: Businesses should conduct and govern themselves with integrity and in a manner that is Ethical, Transparent and Accountable', 'C', 3,
       'Ethics, anti-corruption, conflict of interest, regulatory compliance'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P1-E1', 'Ethics Training', 'essential', 'percentage', '%', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P1-E2', 'Fines & Penalties', 'essential', 'number', 'INR', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'P1-E3', 'Anti-Corruption Policies', 'essential', 'yes_no', 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P1-L1', 'Conflict of Interest', 'leadership', 'number', 'Count', 4
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P1E1', 'Percentage of employees trained on anti-corruption and anti-bribery policies', 'Include all permanent employees', 'percentage', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1' AND i.code = 'P1-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P1E2', 'Percentage of business partners trained on anti-corruption and anti-bribery', 'percentage', false, 'Procurement', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1' AND i.code = 'P1-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P1E3', 'Number of instances of ethical violations reported', 'Include all substantiated cases reported through whistle-blower or ethics hotline', 'number', true, true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1' AND i.code = 'P1-E2';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P1E4', 'Total monetary fines paid for non-compliance (INR)', null, 'number', true, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1' AND i.code = 'P1-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P1E5', 'Does the entity have an anti-corruption and anti-bribery policy?', 'yes_no', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1' AND i.code = 'P1-E3';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P1L1', 'Number of directors with confirmed conflict of interest cases', null, 'number', false, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P1' AND i.code = 'P1-L1';

-- ============================================================
-- BRSR P2: Sustainable Products & Value Chain
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P2', 'Principle 2: Businesses should provide goods and services in a manner that is sustainable and safe', 'C', 4,
       'Sustainable sourcing, R&D, recycling, EPR'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P2-E1', 'R&D & Capex', 'essential', 'percentage', '%', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P2';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'P2-E2', 'Sustainable Sourcing', 'essential', 'yes_no', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P2';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P2-L1', 'EPR & Recycling', 'leadership', 'percentage', '%', 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P2';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P2E1', 'R&D expenditure as % of total turnover', null, 'percentage', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P2' AND i.code = 'P2-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P2E2', 'Capex invested for improvement of environmental and social impacts (%)', null, 'percentage', false, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P2' AND i.code = 'P2-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P2E3', 'Does the entity have a sustainable procurement policy?', 'yes_no', true, 'Procurement', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P2' AND i.code = 'P2-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P2L1', 'Percentage of products reclaimed/recycled at end of life', 'percentage', false, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P2' AND i.code = 'P2-L1';

-- ============================================================
-- BRSR P3: Employee Wellbeing & Safety
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P3', 'Principle 3: Businesses should respect and promote the well-being of all employees, including those in their value chains', 'C', 5,
       'Benefits coverage, grievances, unions, H&S training, LTIFR, fatalities'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P3-E1', 'Employee Benefits', 'essential', 'percentage', '%', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P3-E2', 'Health & Safety', 'essential', 'number', 'Count/Rate', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P3-E3', 'Fatalities', 'essential', 'number', 'Count', 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P3-E4', 'Grievances', 'essential', 'number', 'Count', 4
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P3-L1', 'Retention & Well-being', 'leadership', 'percentage', '%', 5
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E1', 'Coverage of health insurance benefits for permanent employees (%)', null, 'percentage', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E2', 'Coverage of provident fund / retirement benefits (%)', 'percentage', true, true, 'HR', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P3E3', 'Coverage of maternity/paternity benefits (%)', 'percentage', true, 'HR', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E4', 'Percentage of employees covered by H&S training', null, 'percentage', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E2';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E5', 'Lost Time Injury Frequency Rate (LTIFR) for employees', 'Per million man-hours worked', 'number', true, true, 'HR', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E6', 'LTIFR for contract workers', 'number', false, true, 'HR', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E7', 'Number of recordable work-related injuries (employees)', 'number', true, true, 'HR', 4
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E8', 'Work-related fatalities — employees (count)', 'number', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E3';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E9', 'Work-related fatalities — contract workers (count)', 'number', true, true, 'HR', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E3';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P3E10', 'Number of employee grievances filed', 'Include all formal grievances raised during the year', 'number', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E4';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P3E11', 'Number of employee grievances resolved', 'number', true, 'HR', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-E4';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P3L1', 'Median remuneration of employees vs. CEO pay ratio', 'number', false, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P3' AND i.code = 'P3-L1';

-- ============================================================
-- BRSR P4: Stakeholder Engagement
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P4', 'Principle 4: Businesses should respect the interests of and be responsive to all its stakeholders', 'C', 6,
       'Stakeholder identification, engagement, vulnerable groups'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'P4-E1', 'Stakeholder Identification', 'essential', 'yes_no', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P4';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'P4-E2', 'Stakeholder Engagement', 'essential', 'rich_text', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P4';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P4E1', 'Has the entity identified its key stakeholder groups?', 'yes_no', true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P4' AND i.code = 'P4-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P4E2', 'List of key stakeholder groups and engagement mechanisms', 'Describe the type of engagement (surveys, meetings, grievances, etc.) for each group', 'rich_text', true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P4' AND i.code = 'P4-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P4E3', 'Are vulnerable and marginalized groups included in stakeholder engagement?', 'yes_no', true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P4' AND i.code = 'P4-E2';

-- ============================================================
-- BRSR P5: Human Rights
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P5', 'Principle 5: Businesses should respect and promote human rights', 'C', 7,
       'Training, minimum wages, POSH complaints, discrimination, child labor'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P5-E1', 'Human Rights Training', 'essential', 'percentage', '%', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P5-E2', 'POSH Compliance', 'essential', 'number', 'Count', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'P5-E3', 'Child & Forced Labour', 'essential', 'yes_no', 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P5E1', 'Percentage of employees trained on human rights policies', 'percentage', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5' AND i.code = 'P5-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P5E2', 'Are all employees paid at or above minimum wage?', 'yes_no', true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5' AND i.code = 'P5-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P5E3', 'Number of POSH (Sexual Harassment) complaints filed', null, 'number', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5' AND i.code = 'P5-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P5E4', 'Number of POSH complaints resolved within timeline', 'number', true, true, 'HR', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5' AND i.code = 'P5-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P5E5', 'Does the entity have a policy prohibiting child and forced labour?', 'yes_no', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5' AND i.code = 'P5-E3';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P5E6', 'Number of instances of child labour or forced labour reported', 'number', true, true, 'HR', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P5' AND i.code = 'P5-E3';

-- ============================================================
-- BRSR P6: Environment
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P6', 'Principle 6: Businesses should respect and make efforts to protect and restore the environment', 'C', 8,
       'Energy, GHG emissions, water, waste, biodiversity, EIA'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P6-E1', 'Energy Consumption', 'essential', 'number', 'TJ', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P6-E2', 'GHG Emissions — Scope 1', 'essential', 'number', 'tCO2e', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P6-E3', 'GHG Emissions — Scope 2', 'essential', 'number', 'tCO2e', 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P6-E4', 'GHG Emissions — Scope 3', 'essential', 'number', 'tCO2e', 4
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P6-E5', 'GHG Intensity', 'essential', 'number', 'tCO2e/Cr INR', 5
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P6-E6', 'Water Withdrawal & Consumption', 'essential', 'number', 'KL', 6
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P6-E7', 'Waste Generated', 'essential', 'number', 'MT', 7
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'P6-E8', 'Environmental Compliance', 'essential', 'yes_no', 8
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P6-L1', 'Renewable Energy', 'leadership', 'percentage', '%', 9
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6';

-- P6 Energy Questions
INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E1', 'Total energy consumed from non-renewable sources (TJ)', 'Include coal, oil, natural gas, diesel', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E2', 'Total energy consumed from renewable sources (TJ)', 'Include solar, wind, biomass, hydro', 'number', true, true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E3', 'Total energy sold or exported (TJ)', 'number', false, false, 'Operations', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E4', 'Total energy consumed (TJ)', 'Sum of renewable + non-renewable minus exported', 'number', true, true, 'Operations', 4
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E5', 'Energy intensity per rupee of turnover (TJ/INR Crore)', null, 'number', true, true, 'Operations', 5
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E1';

-- P6 Scope 1 GHG
INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E6', 'Total Scope 1 GHG emissions (tCO2e)', 'Direct emissions from owned/controlled sources', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, options, is_required, default_dept, sort_order)
SELECT i.id, 'P6E7', 'GHG emissions methodology/standard used for Scope 1', 'select',
       '["GHG Protocol Corporate Standard","ISO 14064-1","IPCC AR5","IPCC AR6","Other"]'::jsonb,
       true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E2';

-- P6 Scope 2 GHG
INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E8', 'Total Scope 2 GHG emissions (tCO2e)', 'Indirect emissions from purchased electricity, heat, steam', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E3';

-- P6 Scope 3 GHG
INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6E9', 'Total Scope 3 GHG emissions (tCO2e)', 'All other indirect emissions in value chain', 'number', false, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E4';

-- P6 GHG Intensity
INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E10', 'GHG intensity per rupee of turnover (tCO2e/INR Crore)', null, 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E5';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6E11', 'Total Scope 1 + Scope 2 GHG emissions (tCO2e)', 'number', true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E5';

-- P6 Water
INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E12', 'Total water withdrawal from all sources (KL)', 'Include surface water, groundwater, municipal, rainwater', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E6';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E13', 'Total water consumption (KL)', 'number', true, true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E6';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6E14', 'Total water discharged (KL)', 'number', false, 'Operations', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E6';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6E15', 'Water intensity per rupee of turnover (KL/INR Crore)', null, 'number', true, 'Operations', 4
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E6';

-- P6 Waste
INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E16', 'Total hazardous waste generated (MT)', 'Include all categories of hazardous waste under HW Rules', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E7';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E17', 'Total non-hazardous waste generated (MT)', 'number', true, true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E7';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P6E18', 'Total waste generated (all categories, MT)', 'number', true, true, 'Operations', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E7';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6E19', 'Waste recovered through recycling (MT)', 'number', false, 'Operations', 4
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E7';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6E20', 'Waste sent to landfill (MT)', 'number', false, 'Operations', 5
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E7';

-- P6 Environmental Compliance
INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6E21', 'Is the entity compliant with all applicable environmental regulations?', 'yes_no', true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E8';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6E22', 'Number of environmental non-compliance notices received', 'number', true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-E8';

-- P6 Renewable Energy (Leadership)
INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6L1', 'Percentage of total energy from renewable sources (%)', 'percentage', false, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-L1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P6L2', 'Does the entity have science-based GHG reduction targets?', 'yes_no', false, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P6' AND i.code = 'P6-L1';

-- ============================================================
-- BRSR P7: Policy Advocacy
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P7', 'Principle 7: Businesses, when engaging in influencing public and regulatory policy, should do so in a manner that is responsible and transparent', 'C', 9,
       'Trade associations, anti-competitive conduct, policy advocacy'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'P7-E1', 'Trade Associations', 'essential', 'rich_text', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P7';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P7-E2', 'Anti-Competitive Conduct', 'essential', 'number', 'Count', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P7';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P7E1', 'Names of trade associations/industry chambers the entity is a member of', 'rich_text', false, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P7' AND i.code = 'P7-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P7E2', 'Number of anti-competitive/anti-trust cases filed against the entity', 'number', true, true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P7' AND i.code = 'P7-E2';

-- ============================================================
-- BRSR P8: Inclusive Growth
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P8', 'Principle 8: Businesses should promote inclusive growth and equitable development', 'C', 10,
       'CSR spend, SIA, local/MSME sourcing'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P8-E1', 'CSR Implementation', 'essential', 'number', 'INR Crore', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P8';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P8-E2', 'Local Sourcing', 'essential', 'percentage', '%', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P8';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P8E1', 'Total CSR expenditure for current year (INR Crore)', 'number', true, true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P8' AND i.code = 'P8-E1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P8E2', 'Describe the CSR projects undertaken', 'List top 3 projects by spend with SDG alignment', 'rich_text', true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P8' AND i.code = 'P8-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P8E3', 'Percentage of procurement from local MSMEs (%)', 'percentage', false, 'Procurement', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P8' AND i.code = 'P8-E2';

-- ============================================================
-- BRSR P9: Consumer Responsibility
-- ============================================================
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'P9', 'Principle 9: Businesses should engage with and provide value to their consumers in a responsible manner', 'C', 11,
       'Consumer complaints, data privacy, product recalls, cyber security'
FROM public.frameworks f WHERE f.code = 'BRSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P9-E1', 'Consumer Complaints', 'essential', 'number', 'Count', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P9';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'P9-E2', 'Data Privacy & Security', 'essential', 'yes_no', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P9';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'P9-L1', 'Product Recalls', 'leadership', 'number', 'Count', 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P9';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P9E1', 'Number of consumer complaints received', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P9' AND i.code = 'P9-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'P9E2', 'Number of consumer complaints resolved', 'number', true, true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P9' AND i.code = 'P9-E1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P9E3', 'Number of data breach incidents reported', 'number', true, 'IT & Security', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P9' AND i.code = 'P9-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P9E4', 'Does the entity have a data privacy policy compliant with applicable law?', 'yes_no', true, 'IT & Security', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P9' AND i.code = 'P9-E2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'P9L1', 'Number of product recalls initiated', 'number', false, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND p.code = 'P9' AND i.code = 'P9-L1';

COMMIT;
