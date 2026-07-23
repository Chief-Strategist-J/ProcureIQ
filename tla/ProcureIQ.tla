---------------------------- MODULE ProcureIQ ----------------------------
EXTENDS Integers, Sequences, FiniteSets

CONSTANTS 
    Users,
    WorkTypes,
    Statuses,
    MaxJobs

VARIABLES
    userState,
    workOrders,
    appointments,
    jobs,
    notifications,
    auditLogs

vars == <<userState, workOrders, appointments, jobs, notifications, auditLogs>>

Init ==
    /\ userState = [u \in Users |-> "unauthenticated"]
    /\ workOrders = [wo \in {} |-> [workType |-> "", status |-> "", priority |-> 1]]
    /\ appointments = [ap \in {} |-> [workOrder |-> 1, status |-> ""]]
    /\ jobs = {}
    /\ notifications = << >>
    /\ auditLogs = << >>

AuthenticateUser(u) ==
    /\ userState[u] = "unauthenticated"
    /\ userState' = [userState EXCEPT ![u] = "authenticated"]
    /\ auditLogs' = Append(auditLogs, [event |-> "LOGIN_SUCCESS", user |-> u])
    /\ UNCHANGED <<workOrders, appointments, jobs, notifications>>

CreateWorkOrder(u, id, wt, prio) ==
    /\ userState[u] = "authenticated"
    /\ id \notin DOMAIN workOrders
    /\ wt \in WorkTypes
    /\ prio \in 1..5
    /\ workOrders' = [x \in (DOMAIN workOrders \cup {id}) |-> IF x = id THEN [workType |-> wt, status |-> "new", priority |-> prio] ELSE workOrders[x]]
    /\ auditLogs' = Append(auditLogs, [event |-> "WORK_ORDER_CREATED", id |-> id])
    /\ UNCHANGED <<userState, appointments, jobs, notifications>>

UpdateWorkOrderStatus(u, id, newStatus) ==
    /\ userState[u] = "authenticated"
    /\ id \in DOMAIN workOrders
    /\ newStatus \in Statuses
    /\ workOrders[id].status /= newStatus
    /\ workOrders' = [workOrders EXCEPT ![id].status = newStatus]
    /\ auditLogs' = Append(auditLogs, [event |-> "WORK_ORDER_UPDATED", id |-> id, status |-> newStatus])
    /\ UNCHANGED <<userState, appointments, jobs, notifications>>

ScheduleAppointment(u, apId, woId) ==
    /\ userState[u] = "authenticated"
    /\ woId \in DOMAIN workOrders
    /\ apId \notin DOMAIN appointments
    /\ appointments' = [x \in (DOMAIN appointments \cup {apId}) |-> IF x = apId THEN [workOrder |-> woId, status |-> "scheduled"] ELSE appointments[x]]
    /\ notifications' = Append(notifications, [recipient |-> u, type |-> "APPOINTMENT_SCHEDULED", id |-> apId])
    /\ auditLogs' = Append(auditLogs, [event |-> "APPOINTMENT_SCHEDULED", id |-> apId])
    /\ UNCHANGED <<userState, workOrders, jobs>>

ScheduleJob(jId) ==
    /\ Cardinality(jobs) < MaxJobs
    /\ jId \notin jobs
    /\ jobs' = jobs \cup {jId}
    /\ auditLogs' = Append(auditLogs, [event |-> "JOB_SCHEDULED", id |-> jId])
    /\ UNCHANGED <<userState, workOrders, appointments, notifications>>

CompleteJob(jId) ==
    /\ jId \in jobs
    /\ jobs' = jobs \ {jId}
    /\ auditLogs' = Append(auditLogs, [event |-> "JOB_COMPLETED", id |-> jId])
    /\ UNCHANGED <<userState, workOrders, appointments, notifications>>

Next ==
    \/ \E u \in Users : AuthenticateUser(u)
    \/ \E u \in Users, id \in 1..2, wt \in WorkTypes, prio \in 1..2 : CreateWorkOrder(u, id, wt, prio)
    \/ \E u \in Users, id \in DOMAIN workOrders, s \in Statuses : UpdateWorkOrderStatus(u, id, s)
    \/ \E u \in Users, apId \in 1..2, woId \in DOMAIN workOrders : ScheduleAppointment(u, apId, woId)
    \/ \E jId \in 1..2 : ScheduleJob(jId)
    \/ \E jId \in jobs : CompleteJob(jId)

TypeInvariant ==
    /\ \A u \in Users : userState[u] \in {"unauthenticated", "authenticated"}
    /\ \A apId \in DOMAIN appointments : appointments[apId].workOrder \in DOMAIN workOrders
    /\ Cardinality(jobs) <= MaxJobs

Spec == Init /\ [][Next]_vars
=============================================================================
