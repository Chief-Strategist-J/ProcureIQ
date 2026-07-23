------------------------ MODULE ProcureIQ_Backend ------------------------
EXTENDS Integers, Sequences, FiniteSets

CONSTANTS 
    Users,
    WorkTypes,
    Statuses,
    MaxJobs,
    MaxNotifications

VARIABLES
    userState,
    authTokens,
    workOrders,
    appointments,
    serviceResources,
    skills,
    resourceSkills,
    jobs,
    workflows,
    notifications,
    campaigns,
    reminders,
    identityAssignments,
    auditLogs

vars == <<userState, authTokens, workOrders, appointments, serviceResources, skills, resourceSkills, jobs, workflows, notifications, campaigns, reminders, identityAssignments, auditLogs>>

Init ==
    /\ userState = [u \in Users |-> "unauthenticated"]
    /\ authTokens = [u \in Users |-> "none"]
    /\ workOrders = [wo \in {} |-> {}]
    /\ appointments = [ap \in {} |-> {}]
    /\ serviceResources = [sr \in {} |-> {}]
    /\ skills = {}
    /\ resourceSkills = [rs \in {} |-> {}]
    /\ jobs = [j \in {} |-> {}]
    /\ workflows = [wf \in {} |-> {}]
    /\ notifications = << >>
    /\ campaigns = [c \in {} |-> {}]
    /\ reminders = [r \in {} |-> {}]
    /\ identityAssignments = {}
    /\ auditLogs = << >>

AuthenticateUser(u, token) ==
    /\ userState[u] = "unauthenticated"
    /\ userState' = [userState EXCEPT ![u] = "authenticated"]
    /\ authTokens' = [authTokens EXCEPT ![u] = token]
    /\ auditLogs' = Append(auditLogs, [event |-> "LOGIN", user |-> u])
    /\ UNCHANGED <<workOrders, appointments, serviceResources, skills, resourceSkills, jobs, workflows, notifications, campaigns, reminders, identityAssignments>>

LogoutUser(u) ==
    /\ userState[u] = "authenticated"
    /\ userState' = [userState EXCEPT ![u] = "unauthenticated"]
    /\ authTokens' = [authTokens EXCEPT ![u] = "none"]
    /\ auditLogs' = Append(auditLogs, [event |-> "LOGOUT", user |-> u])
    /\ UNCHANGED <<workOrders, appointments, serviceResources, skills, resourceSkills, jobs, workflows, notifications, campaigns, reminders, identityAssignments>>

CreateWorkOrder(u, id, wt, prio) ==
    /\ userState[u] = "authenticated"
    /\ id \notin DOMAIN workOrders
    /\ wt \in WorkTypes
    /\ prio \in 1..5
    /\ workOrders' = workOrders @@ (id |-> [workType |-> wt, status |-> "new", priority |-> prio])
    /\ auditLogs' = Append(auditLogs, [event |-> "WORK_ORDER_CREATE", id |-> id])
    /\ UNCHANGED <<userState, authTokens, appointments, serviceResources, skills, resourceSkills, jobs, workflows, notifications, campaigns, reminders, identityAssignments>>

UpdateWorkOrderStatus(u, id, newStatus) ==
    /\ userState[u] = "authenticated"
    /\ id \in DOMAIN workOrders
    /\ newStatus \in Statuses
    /\ workOrders[id].status /= newStatus
    /\ workOrders' = [workOrders EXCEPT ![id].status = newStatus]
    /\ auditLogs' = Append(auditLogs, [event |-> "WORK_ORDER_UPDATE", id |-> id, status |-> newStatus])
    /\ UNCHANGED <<userState, authTokens, appointments, serviceResources, skills, resourceSkills, jobs, workflows, notifications, campaigns, reminders, identityAssignments>>

CreateServiceResource(u, srId, name, type) ==
    /\ userState[u] = "authenticated"
    /\ srId \notin DOMAIN serviceResources
    /\ serviceResources' = serviceResources @@ (srId |-> [name |-> name, type |-> type, active |-> TRUE])
    /\ auditLogs' = Append(auditLogs, [event |-> "RESOURCE_CREATE", id |-> srId])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, skills, resourceSkills, jobs, workflows, notifications, campaigns, reminders, identityAssignments>>

CreateSkill(u, skId, name) ==
    /\ userState[u] = "authenticated"
    /\ skId \notin skills
    /\ skills' = skills \cup {skId}
    /\ auditLogs' = Append(auditLogs, [event |-> "SKILL_CREATE", id |-> skId])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, serviceResources, resourceSkills, jobs, workflows, notifications, campaigns, reminders, identityAssignments>>

AssignResourceSkill(u, rsId, srId, skId, level) ==
    /\ userState[u] = "authenticated"
    /\ srId \in DOMAIN serviceResources
    /\ skId \in skills
    /\ rsId \notin DOMAIN resourceSkills
    /\ resourceSkills' = resourceSkills @@ (rsId |-> [resource |-> srId, skill |-> skId, level |-> level])
    /\ auditLogs' = Append(auditLogs, [event |-> "RESOURCE_SKILL_ASSIGN", id |-> rsId])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, serviceResources, skills, jobs, workflows, notifications, campaigns, reminders, identityAssignments>>

ScheduleAppointment(u, apId, woId) ==
    /\ userState[u] = "authenticated"
    /\ woId \in DOMAIN workOrders
    /\ apId \notin DOMAIN appointments
    /\ appointments' = appointments @@ (apId |-> [workOrder |-> woId, status |-> "scheduled"])
    /\ notifications' = Append(notifications, [recipient |-> u, type |-> "APPOINTMENT_SCHEDULED", id |-> apId])
    /\ auditLogs' = Append(auditLogs, [event |-> "APPOINTMENT_SCHEDULED", id |-> apId])
    /\ UNCHANGED <<userState, authTokens, workOrders, serviceResources, skills, resourceSkills, jobs, workflows, campaigns, reminders, identityAssignments>>

AssignAppointmentResource(u, apId, srId) ==
    /\ userState[u] = "authenticated"
    /\ apId \in DOMAIN appointments
    /\ srId \in DOMAIN serviceResources
    /\ appointments' = [appointments EXCEPT ![apId].status = "assigned"]
    /\ auditLogs' = Append(auditLogs, [event |-> "APPOINTMENT_ASSIGNED", apId |-> apId, srId |-> srId])
    /\ UNCHANGED <<userState, authTokens, workOrders, serviceResources, skills, resourceSkills, jobs, workflows, notifications, campaigns, reminders, identityAssignments>>

CreateJob(u, jId, name, cron) ==
    /\ userState[u] = "authenticated"
    /\ jId \notin DOMAIN jobs
    /\ jobs' = jobs @@ (jId |-> [name |-> name, cron |-> cron, status |-> "active"])
    /\ auditLogs' = Append(auditLogs, [event |-> "JOB_CREATED", id |-> jId])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, serviceResources, skills, resourceSkills, workflows, notifications, campaigns, reminders, identityAssignments>>

UpdateJobStatus(u, jId, status) ==
    /\ userState[u] = "authenticated"
    /\ jId \in DOMAIN jobs
    /\ jobs' = [jobs EXCEPT ![jId].status = status]
    /\ auditLogs' = Append(auditLogs, [event |-> "JOB_UPDATED", id |-> jId, status |-> status])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, serviceResources, skills, resourceSkills, workflows, notifications, campaigns, reminders, identityAssignments>>

CreateWorkflow(u, wfId, name) ==
    /\ userState[u] = "authenticated"
    /\ wfId \notin DOMAIN workflows
    /\ workflows' = workflows @@ (wfId |-> [name |-> name, status |-> "active"])
    /\ auditLogs' = Append(auditLogs, [event |-> "WORKFLOW_CREATED", id |-> wfId])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, serviceResources, skills, resourceSkills, jobs, notifications, campaigns, reminders, identityAssignments>>

CreateCampaign(u, cId, orgId, name) ==
    /\ userState[u] = "authenticated"
    /\ cId \notin DOMAIN campaigns
    /\ campaigns' = campaigns @@ (cId |-> [orgId |-> orgId, name |-> name, status |-> "active"])
    /\ auditLogs' = Append(auditLogs, [event |-> "CAMPAIGN_CREATED", id |-> cId])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, serviceResources, skills, resourceSkills, jobs, workflows, notifications, reminders, identityAssignments>>

CreateReminder(u, rId, title, priority) ==
    /\ userState[u] = "authenticated"
    /\ rId \notin DOMAIN reminders
    /\ reminders' = reminders @@ (rId |-> [title |-> title, priority |-> priority, status |-> "PENDING"])
    /\ auditLogs' = Append(auditLogs, [event |-> "REMINDER_CREATED", id |-> rId])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, serviceResources, skills, resourceSkills, jobs, workflows, notifications, campaigns, identityAssignments>>

AssignIdentityRole(u, orgId, targetUser, roleId) ==
    /\ userState[u] = "authenticated"
    /\ <<orgId, targetUser, roleId>> \notin identityAssignments
    /\ identityAssignments' = identityAssignments \cup {<<orgId, targetUser, roleId>>}
    /\ auditLogs' = Append(auditLogs, [event |-> "ROLE_ASSIGNED", orgId |-> orgId, targetUser |-> targetUser, roleId |-> roleId])
    /\ UNCHANGED <<userState, authTokens, workOrders, appointments, serviceResources, skills, resourceSkills, jobs, workflows, notifications, campaigns, reminders>>

Next ==
    \/ \E u \in Users, t \in {"tok1", "tok2"} : AuthenticateUser(u, t)
    \/ \E u \in Users : LogoutUser(u)
    \/ \E u \in Users, id \in 1..100, wt \in WorkTypes, prio \in 1..5 : CreateWorkOrder(u, id, wt, prio)
    \/ \E u \in Users, id \in DOMAIN workOrders, s \in Statuses : UpdateWorkOrderStatus(u, id, s)
    \/ \E u \in Users, srId \in 1..100, name \in {"TechA", "TechB"}, type \in {"technician"} : CreateServiceResource(u, srId, name, type)
    \/ \E u \in Users, skId \in 1..100, name \in {"SkillA"} : CreateSkill(u, skId, name)
    \/ \E u \in Users, rsId \in 1..100, srId \in DOMAIN serviceResources, skId \in skills, lvl \in 1..5 : AssignResourceSkill(u, rsId, srId, skId, lvl)
    \/ \E u \in Users, apId \in 1..100, woId \in DOMAIN workOrders : ScheduleAppointment(u, apId, woId)
    \/ \E u \in Users, apId \in DOMAIN appointments, srId \in DOMAIN serviceResources : AssignAppointmentResource(u, apId, srId)
    \/ \E u \in Users, jId \in 1..100, name \in {"JobA"}, cron \in {"0 0 * * *"} : CreateJob(u, jId, name, cron)
    \/ \E u \in Users, jId \in DOMAIN jobs, st \in {"active", "paused"} : UpdateJobStatus(u, jId, st)
    \/ \E u \in Users, wfId \in 1..100, name \in {"WfA"} : CreateWorkflow(u, wfId, name)
    \/ \E u \in Users, cId \in 1..100, orgId \in 1..10, name \in {"CampA"} : CreateCampaign(u, cId, orgId, name)
    \/ \E u \in Users, rId \in 1..100, title \in {"RemA"}, prio \in {"HIGH", "LOW"} : CreateReminder(u, rId, title, prio)
    \/ \E u \in Users, orgId \in 1..10, targetUser \in Users, roleId \in 1..5 : AssignIdentityRole(u, orgId, targetUser, roleId)

TypeInvariant ==
    /\ \A u \in Users : userState[u] \in {"unauthenticated", "authenticated"}
    /\ \A apId \in DOMAIN appointments : appointments[apId].workOrder \in DOMAIN workOrders
    /\ \A rsId \in DOMAIN resourceSkills : resourceSkills[rsId].resource \in DOMAIN serviceResources

Spec == Init /\ [][Next]_vars
=============================================================================
