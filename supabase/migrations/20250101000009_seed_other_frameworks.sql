-- Migration 008b: Seed GRI, TCFD, CSR, SASB, CDP + datapoint_mappings
BEGIN;

-- ============================================================
-- GRI — Global Reporting Initiative
-- ============================================================

-- GRI 302 Energy
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'GRI-302', 'GRI 302: Energy', '300', 1, 'Energy consumption within and outside the organization'
FROM public.frameworks f WHERE f.code = 'GRI';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-302-1', 'Energy consumption within the organization', 'core', 'number', 'GJ', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-302';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-302-4', 'Reduction of energy consumption', 'core', 'number', 'GJ', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-302';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-302-1a', 'Total non-renewable fuel consumption (GJ)', 'Fuels for heating, cooling, electricity generation', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-302' AND i.code = 'GRI-302-1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-302-1b', 'Total renewable fuel consumption (GJ)', 'number', true, true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-302' AND i.code = 'GRI-302-1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-302-1c', 'Electricity consumption (GJ)', 'number', true, true, 'Operations', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-302' AND i.code = 'GRI-302-1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-302-1g', 'Total energy consumption within the organization (GJ)', 'Sum of all energy consumed', 'number', true, true, 'Operations', 4
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-302' AND i.code = 'GRI-302-1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'GRI-302-4a', 'Reductions in energy consumption achieved (GJ)', 'number', false, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-302' AND i.code = 'GRI-302-4';

-- GRI 303 Water
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'GRI-303', 'GRI 303: Water and Effluents', '300', 2, 'Water withdrawal, consumption, and discharge'
FROM public.frameworks f WHERE f.code = 'GRI';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-303-3', 'Water withdrawal', 'core', 'number', 'ML', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-303';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-303-5', 'Water consumption', 'core', 'number', 'ML', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-303';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-303-3a', 'Total water withdrawal from all areas (ML)', 'Convert from KL: divide by 1000', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-303' AND i.code = 'GRI-303-3';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-303-5a', 'Total water consumption (ML)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-303' AND i.code = 'GRI-303-5';

-- GRI 305 Emissions
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'GRI-305', 'GRI 305: Emissions', '300', 3, 'Direct and indirect GHG emissions'
FROM public.frameworks f WHERE f.code = 'GRI';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-305-1', 'Direct (Scope 1) GHG emissions', 'core', 'number', 'tCO2e', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-305';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-305-2', 'Energy indirect (Scope 2) GHG emissions', 'core', 'number', 'tCO2e', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-305';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-305-3', 'Other indirect (Scope 3) GHG emissions', 'core', 'number', 'tCO2e', 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-305';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-305-1a', 'Direct (Scope 1) GHG emissions (tCO2e)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-305' AND i.code = 'GRI-305-1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-305-2a', 'Energy indirect (Scope 2) GHG emissions (tCO2e)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-305' AND i.code = 'GRI-305-2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'GRI-305-3a', 'Scope 3 GHG emissions (tCO2e)', 'number', false, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-305' AND i.code = 'GRI-305-3';

-- GRI 306 Waste
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'GRI-306', 'GRI 306: Waste', '300', 4, 'Waste generation and management'
FROM public.frameworks f WHERE f.code = 'GRI';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-306-3', 'Waste generated', 'core', 'number', 'MT', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-306';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-306-3a', 'Total waste generated (MT)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-306' AND i.code = 'GRI-306-3';

-- GRI 401 Employment
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'GRI-401', 'GRI 401: Employment', '400', 5, 'Employee benefits and new hires'
FROM public.frameworks f WHERE f.code = 'GRI';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-401-2', 'Benefits provided to full-time employees', 'core', 'yes_no', null, 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-401';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'GRI-401-2a', 'Are life insurance, health care, disability benefits provided to all full-time employees?', 'yes_no', true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-401' AND i.code = 'GRI-401-2';

-- GRI 403 OHS
INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'GRI-403', 'GRI 403: Occupational Health and Safety', '400', 6, 'Work-related injuries and diseases'
FROM public.frameworks f WHERE f.code = 'GRI';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'GRI-403-9', 'Work-related injuries', 'core', 'number', 'Count', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-403';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-403-9a', 'Fatalities as a result of work-related injury (employees)', 'number', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-403' AND i.code = 'GRI-403-9';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'GRI-403-9b', 'High-consequence work-related injuries (excluding fatalities)', 'number', true, true, 'HR', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND p.code = 'GRI-403' AND i.code = 'GRI-403-9';

-- ============================================================
-- TCFD — Task Force on Climate-related Financial Disclosures
-- ============================================================

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'TCFD-G', 'Governance', 'Governance', 1, 'Board oversight and management role in climate-related risks'
FROM public.frameworks f WHERE f.code = 'TCFD';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'TCFD-G1', 'Board Oversight', 'core', 'rich_text', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-G';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'TCFD-G2', 'Management Role', 'core', 'rich_text', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-G';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-G1a', 'Describe the board''s oversight of climate-related risks and opportunities', 'rich_text', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-G' AND i.code = 'TCFD-G1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-G2a', 'Describe management''s role in assessing and managing climate-related risks and opportunities', 'rich_text', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-G' AND i.code = 'TCFD-G2';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'TCFD-S', 'Strategy', 'Strategy', 2, 'Climate risks/opportunities, impacts, and scenario analysis'
FROM public.frameworks f WHERE f.code = 'TCFD';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'TCFD-S1', 'Climate Risks & Opportunities', 'core', 'rich_text', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-S';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'TCFD-S2', 'Scenario Analysis', 'core', 'rich_text', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-S';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-S1a', 'Describe the climate-related risks and opportunities identified over short, medium, and long term', 'rich_text', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-S' AND i.code = 'TCFD-S1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-S1b', 'Describe the impact of climate-related risks and opportunities on the organization''s businesses, strategy, and financial planning', 'rich_text', true, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-S' AND i.code = 'TCFD-S1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-S2a', 'Has the organization used climate scenario analysis to assess resilience of its strategy?', 'yes_no', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-S' AND i.code = 'TCFD-S2';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-S2b', 'Describe the climate scenarios used in your analysis (e.g., 1.5°C, 2°C, 4°C)', 'rich_text', false, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-S' AND i.code = 'TCFD-S2';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'TCFD-R', 'Risk Management', 'Risk Management', 3, 'Identification, management, and integration of climate risks'
FROM public.frameworks f WHERE f.code = 'TCFD';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'TCFD-R1', 'Risk Identification Process', 'core', 'rich_text', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-R';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-R1a', 'Describe processes for identifying and assessing climate-related risks', 'rich_text', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-R' AND i.code = 'TCFD-R1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-R1b', 'Describe how climate-related risk processes are integrated into overall risk management', 'rich_text', true, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-R' AND i.code = 'TCFD-R1';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'TCFD-M', 'Metrics & Targets', 'Metrics & Targets', 4, 'GHG emissions, targets, internal carbon price'
FROM public.frameworks f WHERE f.code = 'TCFD';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'TCFD-MT-A', 'GHG Emissions', 'core', 'number', 'tCO2e', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-M';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'TCFD-MT-B', 'Climate Targets', 'core', 'rich_text', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-M';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'TCFD-MT-A1', 'Total Scope 1 GHG emissions (tCO2e)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-M' AND i.code = 'TCFD-MT-A';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'TCFD-MT-A2', 'Total Scope 2 GHG emissions (tCO2e)', 'number', true, true, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-M' AND i.code = 'TCFD-MT-A';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-MT-A3', 'Total Scope 3 GHG emissions (tCO2e)', 'number', false, 'Operations', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-M' AND i.code = 'TCFD-MT-A';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-MT-B1', 'Describe the targets set and performance against targets to manage climate-related risks', 'rich_text', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-M' AND i.code = 'TCFD-MT-B';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'TCFD-MT-B2', 'Does the entity use an internal carbon price?', 'yes_no', false, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND p.code = 'TCFD-M' AND i.code = 'TCFD-MT-B';

-- ============================================================
-- CSR (India) — Companies Act 2013, Section 135
-- ============================================================

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'CSR-COMM', 'CSR Committee', 'Committee', 1, 'Committee composition and meeting details'
FROM public.frameworks f WHERE f.code = 'CSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'CSR-C1', 'Committee Composition', 'essential', 'rich_text', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-COMM';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'CSR-C1', 'Names and designations of CSR Committee members', 'rich_text', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-COMM' AND i.code = 'CSR-C1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'CSR-C2', 'Number of CSR Committee meetings held during the year', 'number', true, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-COMM' AND i.code = 'CSR-C1';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'CSR-FIN', 'CSR Financial Details', 'Financial', 2, 'CSR obligation, expenditure, and unspent amount'
FROM public.frameworks f WHERE f.code = 'CSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'CSR-F1', 'CSR Obligation & Spend', 'essential', 'number', 'INR Lakh', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-FIN';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'CSR-F1', 'Net profit for CSR calculation (average of last 3 years, INR Lakh)', 'Used to compute 2% obligation', 'number', true, true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-FIN' AND i.code = 'CSR-F1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'CSR-F2', 'Prescribed CSR obligation amount (INR Lakh)', 'number', true, true, 'Finance', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-FIN' AND i.code = 'CSR-F1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'CSR-F3', 'Total amount spent on CSR during the year (INR Lakh)', 'number', true, true, 'Finance', 3
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-FIN' AND i.code = 'CSR-F1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'CSR-F4', 'Unspent CSR amount (INR Lakh)', 'number', true, 'Finance', 4
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-FIN' AND i.code = 'CSR-F1';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'CSR-PROJ', 'CSR Projects', 'Projects', 3, 'Project details, impact assessment, and SDG mapping'
FROM public.frameworks f WHERE f.code = 'CSR';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'CSR-P1', 'Project Details', 'essential', 'rich_text', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-PROJ';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'CSR-P1', 'Details of CSR projects undertaken (name, area, amount, SDG)', 'rich_text', true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-PROJ' AND i.code = 'CSR-P1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'CSR-P2', 'Was an impact assessment conducted for CSR projects?', 'yes_no', false, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CSR' AND p.code = 'CSR-PROJ' AND i.code = 'CSR-P1';

-- ============================================================
-- SASB — Cross-Industry Standards
-- ============================================================

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'SASB-ENV', 'Environment', 'Environment', 1, 'GHG emissions, energy management, water, waste'
FROM public.frameworks f WHERE f.code = 'SASB';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'SASB-GHG', 'GHG Emissions', 'core', 'number', 'tCO2e', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-ENV';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'SASB-E', 'Energy Management', 'core', 'number', 'GJ', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-ENV';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'SASB-W', 'Water Management', 'core', 'number', 'KL', 3
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-ENV';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'SASB-GHG-1', 'Total Scope 1 GHG emissions (tCO2e)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-ENV' AND i.code = 'SASB-GHG';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'SASB-GHG-2', 'Percentage of GHG emissions covered under emissions-limiting regulations (%)', 'percentage', false, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-ENV' AND i.code = 'SASB-GHG';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'SASB-E-1', 'Total energy consumed (GJ)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-ENV' AND i.code = 'SASB-E';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'SASB-E-2', 'Percentage of energy from renewable sources (%)', 'percentage', false, 'Operations', 2
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-ENV' AND i.code = 'SASB-E';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'SASB-W-1', 'Total water withdrawn (KL)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-ENV' AND i.code = 'SASB-W';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'SASB-SOC', 'Social Capital', 'Social', 2, 'Data privacy, product quality, labor practices, H&S, diversity'
FROM public.frameworks f WHERE f.code = 'SASB';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'SASB-DP', 'Data Privacy & Security', 'core', 'number', 'Count', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-SOC';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'SASB-HR', 'H&S Management', 'core', 'number', 'Rate', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-SOC';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'SASB-DP-1', 'Number of data breaches involving personally identifiable information (PII)', 'number', true, 'IT & Security', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-SOC' AND i.code = 'SASB-DP';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'SASB-HR-1', 'Total recordable incident rate (TRIR) for direct employees', 'number', true, true, 'HR', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND p.code = 'SASB-SOC' AND i.code = 'SASB-HR';

-- ============================================================
-- CDP — Carbon Disclosure Project
-- ============================================================

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'CDP-C1', 'C1: Governance', 'Climate', 1, 'Board and management oversight of climate change'
FROM public.frameworks f WHERE f.code = 'CDP';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'CDP-C1.1', 'Board Oversight', 'core', 'yes_no', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'CDP-C1.1', 'Is there board-level oversight of climate-related issues?', 'yes_no', true, 'Finance', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C1' AND i.code = 'CDP-C1.1';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'CDP-C4', 'C4: Targets and Performance', 'Climate', 2, 'Emissions reduction targets and progress'
FROM public.frameworks f WHERE f.code = 'CDP';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, sort_order)
SELECT p.id, 'CDP-C4.1', 'Emission Reduction Targets', 'core', 'rich_text', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C4';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, default_dept, sort_order)
SELECT i.id, 'CDP-C4.1', 'Describe your absolute or intensity emission reduction targets and progress', 'rich_text', true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C4' AND i.code = 'CDP-C4.1';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'CDP-C6', 'C6: Emissions Data', 'Climate', 3, 'Scope 1, 2, and 3 GHG emissions'
FROM public.frameworks f WHERE f.code = 'CDP';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'CDP-C6.1', 'Scope 1 Emissions', 'core', 'number', 'tCO2e', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C6';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'CDP-C6.3', 'Scope 2 Emissions', 'core', 'number', 'tCO2e', 2
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C6';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'CDP-C6.1', 'Total gross global Scope 1 emissions (tCO2e)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C6' AND i.code = 'CDP-C6.1';

INSERT INTO public.questions (indicator_id, code, text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'CDP-C6.3', 'Total gross global Scope 2 emissions — market-based (tCO2e)', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C6' AND i.code = 'CDP-C6.3';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'CDP-C8', 'C8: Energy', 'Climate', 4, 'Energy consumption and mix'
FROM public.frameworks f WHERE f.code = 'CDP';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'CDP-C8.2', 'Energy Consumption', 'core', 'number', 'MWh', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C8';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'CDP-C8.2a', 'Total energy consumption (MWh)', 'Convert from GJ: multiply by 277.778', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-C8' AND i.code = 'CDP-C8.2';

INSERT INTO public.principles (framework_id, code, name, section, sort_order, description)
SELECT f.id, 'CDP-W1', 'W1: Current State', 'Water', 5, 'Water withdrawal and stress'
FROM public.frameworks f WHERE f.code = 'CDP';

INSERT INTO public.indicators (principle_id, code, name, category, data_type, unit, sort_order)
SELECT p.id, 'CDP-W1.2', 'Water Withdrawal', 'core', 'number', 'ML', 1
FROM public.principles p JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-W1';

INSERT INTO public.questions (indicator_id, code, text, help_text, response_type, is_required, is_assurable, default_dept, sort_order)
SELECT i.id, 'CDP-W1.2a', 'Total water withdrawals from all sources (ML)', 'Convert from KL: divide by 1000', 'number', true, true, 'Operations', 1
FROM public.indicators i JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND p.code = 'CDP-W1' AND i.code = 'CDP-W1.2';

-- ============================================================
-- CROSS-FRAMEWORK DATAPOINT MAPPINGS
-- 6 key datapoints from CLAUDE.md architecture rules
-- ============================================================

-- scope_1_ghg: BRSR P6E6 → GRI 305-1a → TCFD MT-A1 → CDP C6.1 → SASB GHG-1
INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_1_ghg', q.id, 'BRSR', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND q.code = 'P6E6';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_1_ghg', q.id, 'GRI', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND q.code = 'GRI-305-1a';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_1_ghg', q.id, 'TCFD', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND q.code = 'TCFD-MT-A1';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_1_ghg', q.id, 'CDP', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND q.code = 'CDP-C6.1';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_1_ghg', q.id, 'SASB', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND q.code = 'SASB-GHG-1';

-- scope_2_ghg: BRSR P6E8 → GRI 305-2a → TCFD MT-A2 → CDP C6.3
INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_2_ghg', q.id, 'BRSR', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND q.code = 'P6E8';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_2_ghg', q.id, 'GRI', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND q.code = 'GRI-305-2a';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_2_ghg', q.id, 'TCFD', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'TCFD' AND q.code = 'TCFD-MT-A2';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'scope_2_ghg', q.id, 'CDP', 1, 'tCO2e'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND q.code = 'CDP-C6.3';

-- total_energy: BRSR P6E4 (TJ canonical) → GRI 302-1g (GJ, ×1000) → CDP C8.2a (MWh, ×277.778)
INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'total_energy', q.id, 'BRSR', 1, 'TJ'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND q.code = 'P6E4';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'total_energy', q.id, 'GRI', 1000, 'GJ'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND q.code = 'GRI-302-1g';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'total_energy', q.id, 'CDP', 277777.778, 'MWh'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND q.code = 'CDP-C8.2a';

-- water_withdrawal: BRSR P6E12 (KL canonical) → GRI 303-3a (ML, ÷1000) → CDP W1.2a (ML, ÷1000)
INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'water_withdrawal', q.id, 'BRSR', 1, 'KL'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND q.code = 'P6E12';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'water_withdrawal', q.id, 'GRI', 0.001, 'ML'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND q.code = 'GRI-303-3a';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'water_withdrawal', q.id, 'CDP', 0.001, 'ML'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'CDP' AND q.code = 'CDP-W1.2a';

-- total_waste: BRSR P6E18 → GRI 306-3a (both MT, no conversion)
INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'total_waste', q.id, 'BRSR', 1, 'MT'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND q.code = 'P6E18';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'total_waste', q.id, 'GRI', 1, 'MT'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND q.code = 'GRI-306-3a';

-- fatalities_employees: BRSR P3E8 → GRI 403-9a
INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'fatalities_employees', q.id, 'BRSR', 1, 'Count'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND q.code = 'P3E8';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'fatalities_employees', q.id, 'GRI', 1, 'Count'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'GRI' AND q.code = 'GRI-403-9a';

-- data_breach: BRSR P9E3 → SASB DP-1
INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'data_breach_count', q.id, 'BRSR', 1, 'Count'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'BRSR' AND q.code = 'P9E3';

INSERT INTO public.datapoint_mappings (datapoint_key, question_id, framework_code, conversion_factor, conversion_from_unit)
SELECT 'data_breach_count', q.id, 'SASB', 1, 'Count'
FROM public.questions q JOIN public.indicators i ON q.indicator_id = i.id
JOIN public.principles p ON i.principle_id = p.id
JOIN public.frameworks f ON p.framework_id = f.id
WHERE f.code = 'SASB' AND q.code = 'SASB-DP-1';

COMMIT;
