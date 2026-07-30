---------------------------- MODULE NavigationTracing ----------------------------
EXTENDS Integers, Sequences

CONSTANTS
    Routes,
    Users

VARIABLES
    currentRoute,
    traceLog

vars == <<currentRoute, traceLog>>

Init ==
    /\ currentRoute = "/"
    /\ traceLog = << >>

Navigate(u, targetRoute) ==
    /\ targetRoute \in Routes
    /\ currentRoute /= targetRoute
    /\ traceLog' = Append(traceLog, [
            user |-> u, 
            source |-> currentRoute, 
            destination |-> targetRoute,
            eventName |-> "navigation.click"
       ])
    /\ currentRoute' = targetRoute

Next ==
    \E u \in Users, r \in Routes : Navigate(u, r)

Spec == Init /\ [][Next]_vars
=============================================================================
