-------------------------- MODULE ProcureIQ_MC --------------------------
EXTENDS ProcureIQ

MC_Users == {"user_1", "user_2"}
MC_WorkTypes == {"wt_repair", "wt_inspection"}
MC_Statuses == {"new", "in_progress", "completed", "cancelled"}
MC_MaxJobs == 3

=============================================================================
