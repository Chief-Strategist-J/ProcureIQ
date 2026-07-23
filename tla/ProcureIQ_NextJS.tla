----------------------- MODULE ProcureIQ_NextJS -----------------------
EXTENDS Integers, Sequences, FiniteSets

CONSTANTS 
    Users,
    Routes

VARIABLES
    currentRoute,
    authStore,
    themeState,
    sidebarOpen,
    activeWorkOrderFilter,
    notificationDrawerOpen,
    unreadNotificationCount,
    modalState,
    formDrafts,
    networkStatus

vars == <<currentRoute, authStore, themeState, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, modalState, formDrafts, networkStatus>>

Init ==
    /\ currentRoute = "/login"
    /\ authStore = [user |-> "none", token |-> "none", isAuthenticated |-> FALSE]
    /\ themeState = "dark"
    /\ sidebarOpen = TRUE
    /\ activeWorkOrderFilter = "all"
    /\ notificationDrawerOpen = FALSE
    /\ unreadNotificationCount = 0
    /\ modalState = "closed"
    /\ formDrafts = [f \in {} |-> {}]
    /\ networkStatus = "online"

ClientLoginSuccess(user, token) ==
    /\ authStore.isAuthenticated = FALSE
    /\ authStore' = [user |-> user, token |-> token, isAuthenticated |-> TRUE]
    /\ currentRoute' = "/dashboard"
    /\ UNCHANGED <<themeState, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, modalState, formDrafts, networkStatus>>

ClientLogout ==
    /\ authStore.isAuthenticated = TRUE
    /\ authStore' = [user |-> "none", token |-> "none", isAuthenticated |-> FALSE]
    /\ currentRoute' = "/login"
    /\ UNCHANGED <<themeState, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, modalState, formDrafts, networkStatus>>

NavigateToRoute(route) ==
    /\ authStore.isAuthenticated = TRUE
    /\ route \in Routes
    /\ currentRoute' = route
    /\ UNCHANGED <<authStore, themeState, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, modalState, formDrafts, networkStatus>>

ToggleSidebar ==
    /\ sidebarOpen' = ~sidebarOpen
    /\ UNCHANGED <<currentRoute, authStore, themeState, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, modalState, formDrafts, networkStatus>>

ToggleTheme ==
    /\ themeState' = IF themeState = "dark" THEN "light" ELSE "dark"
    /\ UNCHANGED <<currentRoute, authStore, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, modalState, formDrafts, networkStatus>>

ToggleNotificationDrawer ==
    /\ notificationDrawerOpen' = ~notificationDrawerOpen
    /\ UNCHANGED <<currentRoute, authStore, themeState, sidebarOpen, activeWorkOrderFilter, unreadNotificationCount, modalState, formDrafts, networkStatus>>

OpenModal(modalName) ==
    /\ modalState = "closed"
    /\ modalState' = modalName
    /\ UNCHANGED <<currentRoute, authStore, themeState, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, formDrafts, networkStatus>>

CloseModal ==
    /\ modalState /= "closed"
    /\ modalState' = "closed"
    /\ UNCHANGED <<currentRoute, authStore, themeState, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, formDrafts, networkStatus>>

UpdateFormDraft(formId, data) ==
    /\ formDrafts' = formDrafts @@ (formId |-> data)
    /\ UNCHANGED <<currentRoute, authStore, themeState, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, modalState, networkStatus>>

SetNetworkStatus(status) ==
    /\ networkStatus' = status
    /\ UNCHANGED <<currentRoute, authStore, themeState, sidebarOpen, activeWorkOrderFilter, notificationDrawerOpen, unreadNotificationCount, modalState, formDrafts>>

Next ==
    \/ \E u \in Users, t \in {"tok1"} : ClientLoginSuccess(u, t)
    \/ ClientLogout
    \/ \E r \in Routes : NavigateToRoute(r)
    \/ ToggleSidebar
    \/ ToggleTheme
    \/ ToggleNotificationDrawer
    \/ \E m \in {"createWorkOrderModal", "assignResourceModal"} : OpenModal(m)
    \/ CloseModal
    \/ \E f \in {"workOrderForm"}, d \in {"draftData"} : UpdateFormDraft(f, d)
    \/ \E s \in {"online", "offline"} : SetNetworkStatus(s)

TypeInvariant ==
    /\ authStore.isAuthenticated \in {TRUE, FALSE}
    /\ themeState \in {"dark", "light"}
    /\ sidebarOpen \in {TRUE, FALSE}
    /\ notificationDrawerOpen \in {TRUE, FALSE}
    /\ networkStatus \in {"online", "offline"}

Spec == Init /\ [][Next]_vars
=============================================================================
