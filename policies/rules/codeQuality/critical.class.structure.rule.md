━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        FUNCTION ANATOMY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FUNCTION functionName<T, R, E extends Error>(
    param1:   T,
    param2:   Type,
    options:  Options<T>       = defaultOptions,
    callback: Func<T, R>       = null,
    context:  Context          = globalContext,
    policy:   RetryPolicy      = defaultPolicy,
    timeout:  Duration         = 30s
) -> Result<R, E>


    ━━━ 1. VALIDATE INPUT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        1.1  EXISTENCE CHECKS
                param is not null
                param is not undefined
                param is not empty string
                collection is not empty
                pointer is not dangling

        1.2  TYPE CHECKS
                param is correct primitive type
                param is correct object type
                generic T satisfies constraint
                param implements required interface

        1.3  FORMAT CHECKS
                string matches regex pattern
                string is valid enum member
                string is valid UUID / URL / email
                date string is parseable
                JSON is well-formed

        1.4  RANGE & BOUND CHECKS
                number >= min
                number <= max
                string.length <= maxLength
                collection.size <= maxSize
                date is not in past
                date is not beyond max horizon

        1.5  CROSS-FIELD CONSISTENCY
                startDate < endDate
                minPrice <= maxPrice
                quantity <= availableStock
                parent exists if child references it

        1.6  BUSINESS RULE PRE-CHECKS
                entity is in correct state to accept this operation
                no conflicting operation in flight
                idempotency key not already processed
                request not a duplicate within dedup window

        1.7  SECURITY CHECKS
                caller is authenticated
                caller has required role / permission
                caller owns the resource
                caller has correct scope (OAuth)
                token is not expired
                token has not been revoked

        1.8  INFRASTRUCTURE CHECKS
                rate limit not exceeded         (per user)
                rate limit not exceeded         (per tenant)
                rate limit not exceeded         (per IP)
                quota not exhausted             (monthly, daily)
                feature flag is enabled         (for this user / tenant)
                kill switch is not active
                circuit breaker is closed       (downstream is healthy)
                request size within payload limit


    ━━━ 2. INITIALIZE STATE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        2.1  RESULT CONTAINERS
                result              = Result<R>.empty()
                intermediate        = Collection<T>.empty()
                partialResults      = Map<Key, R>.empty()
                errors              = List<E>.empty()
                warnings            = List<Warning>.empty()

        2.2  CONTROL FLOW STATE
                retryCount          = 0
                retryDelay          = policy.initialDelay
                attemptId           = generateId()
                shouldAbort         = false
                isCommitted         = false

        2.3  OBSERVABILITY STATE
                startTime           = now()
                checkpointTime      = now()
                traceId             = context.traceId ?? generateTraceId()
                spanId              = tracer.startSpan("functionName", traceId)
                correlationId       = context.correlationId ?? generateId()
                requestId           = generateRequestId()
                sessionId           = context.sessionId

        2.4  RESOURCE HANDLES  (all null, acquired later)
                dbConnection        = null
                cacheConnection     = null
                lockHandle          = null
                semaphoreHandle     = null
                streamHandle        = null
                threadHandles       = List.empty()
                futureHandles       = List.empty()


    ━━━ 3. ACQUIRE RESOURCES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        3.1  LOCKING
                acquire distributed lock        (on resource key, with TTL)
                acquire optimistic lock         (read version stamp)
                acquire pessimistic row lock    (SELECT FOR UPDATE)
                acquire read lock               (shared, if read-only path)
                acquire write lock              (exclusive, if mutating)

        3.2  CONCURRENCY CONTROLS
                acquire semaphore slot          (cap total concurrency)
                acquire thread from pool        (bounded executor)
                acquire bulkhead slot           (isolate this operation class)

        3.3  CONNECTIONS
                acquire DB connection from pool
                acquire cache connection from pool
                acquire message broker connection
                acquire HTTP connection         (keep-alive, pooled)
                open file handle                (if file I/O)
                open stream                     (if streaming data)

        3.4  MEMORY & COMPUTE
                check available heap            (fail before OOM)
                reserve memory budget           (for large payloads)
                check CPU throttle              (backpressure if overloaded)


    ━━━ 4. LOAD DEPENDENCIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        4.1  CONFIGURATION
                load static config              (feature settings, thresholds)
                load dynamic config             (runtime-updated flags)
                load secrets                    (from vault, never hardcoded)
                load tenant-specific overrides
                merge config with defaults

        4.2  CACHE LOOKUP  (ordered by speed)
                check L1 cache  (in-process / in-memory)
                    → RETURN early if hit
                check L2 cache  (Redis / Memcached / CDN)
                    → RETURN early if hit
                check L3 cache  (DB materialized view / read replica)
                    → RETURN early if hit
                record cache miss metric

        4.3  PRIMARY DATA
                fetch from primary DB           (main store)
                fetch from read replica         (if read-heavy)
                fetch from shard               (if sharded)
                fetch from partition            (if partitioned)
                deserialize raw bytes → typed model
                decrypt fields                  (if encrypted at rest)
                decompress fields               (if compressed)

        4.4  SECONDARY / RELATED DATA
                fetch related entities          (joins or separate queries)
                fetch reference data            (lookup tables, enums)
                fetch historical data           (audit, versioning)
                fetch aggregated data           (precomputed stats)

        4.5  EXTERNAL SERVICES
                call service A                  (REST / gRPC / GraphQL)
                call service B
                call service C
                set per-call timeout
                pass traceId / correlationId in headers
                handle 4xx vs 5xx distinctly

        4.6  DESERIALIZATION & BINDING
                unmarshal JSON / Protobuf / Avro
                bind to strongly typed models
                coerce types                    (string → int, epoch → DateTime)
                apply field-level defaults


    ━━━ 5. ASSERT PRE-CONDITIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        5.1  DATA INTEGRITY
                fetched data is not null
                fetched collection is not empty
                checksum / hash matches
                digital signature is valid
                data is not corrupted / truncated

        5.2  VERSION & SCHEMA
                entity version == expected version  (optimistic lock check)
                schema version == expected schema
                API contract version is compatible
                migration has been applied

        5.3  STATE MACHINE
                entity is in a valid state for this operation
                no conflicting state transition in progress
                predecessor steps have completed

        5.4  TEMPORAL
                data is not stale beyond acceptable threshold
                timestamps are monotonically increasing where expected
                no future-dated records in unexpected positions

        5.5  REFERENTIAL INTEGRITY
                all foreign keys resolve
                all referenced entities exist
                no orphaned records


    ━━━ 6. CONCURRENCY & PARALLELISM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        6.1  BACKGROUND THREADS  (fire and forget)
                SPAWN thread → backgroundTask A     (no result needed)
                SPAWN thread → backgroundTask B
                track thread handles for cleanup

        6.2  PARALLEL FUTURES  (results needed)
                future A = ASYNC fetchEnrichment<T>(data)
                future B = ASYNC fetchEnrichment<T>(external)
                future C = ASYNC computeExpensive<T>(param)

        6.3  AWAIT STRATEGY
                AWAIT ALL   futures              (need every result)
                AWAIT ANY   futures              (need fastest)
                AWAIT FIRST N futures            (partial results ok)
                AWAIT WITH  timeout              (bounded wait)
                AWAIT WITH  fallback             (use default if slow)

        6.4  PARTIAL FAILURE HANDLING
                IF future A failed AND result is not critical
                    use fallback value for A
                IF future B failed AND result is critical
                    cancel remaining futures
                    GOTO error handling

        6.5  BACKPRESSURE
                IF downstream is slow
                    apply backpressure to caller
                    buffer up to maxBufferSize
                    drop or block beyond buffer


    ━━━ 7. CORE PIPELINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        7.1  INGEST
                source data from DB / stream / file / memory
                batch if large                  (chunked reads)
                paginate if needed
                normalize encoding              (UTF-8, line endings)

        7.2  CLEAN
                strip nulls / empty fields
                trim whitespace
                normalize casing
                sanitize input                  (strip HTML, scripts)
                handle encoding issues

        7.3  FILTER
                drop items failing predicate
                drop duplicates                 (by key or hash)
                drop items outside time window
                drop items below threshold

        7.4  SORT & PARTITION
                sort by key / timestamp / priority
                partition into buckets          (by type, tenant, shard)
                window into time buckets        (tumbling, sliding, session)

        7.5  TRANSFORM / MAP                    (1 → 1)
                apply business transformation per item
                apply field mapping             (rename, restructure)
                apply unit conversion
                apply formatting rules

        7.6  EXPAND / FLATMAP                   (1 → many)
                explode nested collections
                generate derived records

        7.7  ENRICH
                join with reference data        (lookup by key)
                join with future results        (async enrichment)
                join with ML model output
                join with computed fields

        7.8  AGGREGATE / REDUCE
                group by key
                count, sum, average, min, max
                compute percentiles
                compute rolling windows
                fold into single result

        7.9  SHAPE OUTPUT
                project to output schema        (drop internal fields)
                encrypt sensitive fields
                compress if large
                paginate if needed
                serialize to wire format


    ━━━ 8. BRANCHING STRATEGY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        8.1  FEATURE / EXPERIMENT BRANCHING
                IF feature flag X → path A
                IF experiment bucket Y → path B
                ELSE → default path

        8.2  DATA-DRIVEN BRANCHING
                IF data.type == A → strategy A
                IF data.type == B → strategy B
                ELSE → fallback strategy

        8.3  PARTIAL SUCCESS POLICY
                IF partial results acceptable
                    continue with succeeded items
                    log dropped items
                ELSE
                    fail entire operation

        8.4  FALLBACK CHAIN
                TRY primary source
                IF fails → TRY secondary source
                IF fails → TRY cached stale data
                IF fails → return degraded response
                IF fails → fail hard


    ━━━ 9. HOOKS & MIDDLEWARE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        9.1  MIDDLEWARE CHAIN  (ordered, bidirectional)
                → auth middleware
                → logging middleware
                → tracing middleware
                → caching middleware
                → core logic
                ← caching middleware
                ← logging middleware
                ← auth middleware

        9.2  LIFECYCLE HOOKS
                onBeforeValidate    hook
                onAfterValidate     hook
                onBeforeLoad        hook
                onAfterLoad         hook
                onBeforeExecute     hook
                onAfterExecute      hook
                onBeforeCommit      hook
                onAfterCommit       hook
                onError             hook
                onFinally           hook

        9.3  CALLER CALLBACKS
                run pre-processing  callback     (caller logic before core)
                run transform       callback     (caller-supplied mapping)
                run filter          callback     (caller-supplied predicate)
                run post-processing callback     (caller logic after core)

        9.4  PLUGIN / EXTENSION POINTS
                load registered plugins
                call plugin.execute(context)
                collect plugin results
                merge plugin results with core result


    ━━━ 10. ASSERT POST-CONDITIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        10.1  STRUCTURAL
                result is not null
                result is not empty
                result matches expected schema
                result size is within bounds
                all required fields are present

        10.2  BUSINESS RULES
                no negative balances
                no overlapping intervals
                totals reconcile
                no constraint violations

        10.3  INTEGRITY
                output checksum matches
                referential integrity intact
                no data silently dropped
                counts match                    (input count vs output count)

        10.4  SECURITY
                no sensitive fields leaked into output
                output is properly masked / redacted
                no PII in logs


    ━━━ 11. RETRY & RESILIENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        11.1  CLASSIFY ERROR
                transient?                      (network blip, timeout, 503)
                non-transient?                  (404, 400, auth failure)
                idempotent operation?           (safe to retry)
                non-idempotent?                 (do not retry blindly)

        11.2  RETRY LOOP
                IF transient AND idempotent AND retryCount < maxRetries
                    WAIT exponentialBackoff(retryCount) + random jitter
                    INCREMENT retryCount
                    record retry metric
                    GOTO step 4 or 7             (whichever failed)

        11.3  GIVE UP
                IF retries exhausted
                    open circuit breaker if threshold hit
                    propagate error with full context

        11.4  FALLBACK
                IF all retries failed
                    serve stale cache
                    serve degraded response
                    queue for async retry
                    alert on-call


    ━━━ 12. COMMIT SIDE EFFECTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        12.1  TRANSACTION BOUNDARY
                BEGIN TRANSACTION

        12.2  PERSISTENCE
                    write to primary DB
                    write to secondary / replica store
                    write to time-series store       (metrics, events)
                    write to document store
                    write to search index
                    write to data warehouse / lake   (analytics)
                    write audit log record

        12.3  CACHE UPDATES
                    invalidate L1 cache entry
                    invalidate L2 cache entry
                    write new value to L1
                    write new value to L2
                    set TTL on cache entry

        12.4  EVENTING
                    publish domain event             (internal consumers)
                    publish integration event        (external consumers)
                    publish to message queue         (Kafka / SQS / RabbitMQ)
                    publish change data capture      (CDC stream)

        12.5  NOTIFICATIONS
                    send email notification
                    send push notification
                    send SMS
                    call webhooks                    (registered callbacks)
                    update real-time socket          (WebSocket / SSE)

        12.6  ASYNC WORK
                    enqueue follow-up background job
                    schedule delayed job             (at specific time)
                    trigger downstream workflow

                COMMIT TRANSACTION


    ━━━ 13. OBSERVE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        13.1  LOGGING
                log structured audit entry       (who, what, when, where, result)
                log performance checkpoint times
                log input shape                  (not values, just shape)
                log output shape
                log warnings collected

        13.2  METRICS
                emit success counter
                emit error counter               (by error type)
                emit latency histogram           (now - startTime)
                emit throughput counter          (items processed)
                emit retry counter
                emit cache hit / miss ratio
                emit queue depth                 (if async)

        13.3  TRACING
                finish span with status OK
                attach span attributes           (tenantId, userId, entityId)
                link to parent span
                record span events               (checkpoints inside span)

        13.4  ALERTING
                IF latency > SLO threshold       → alert
                IF error rate > threshold        → alert
                IF queue depth > threshold       → alert
                IF circuit breaker opened        → alert


    ━━━ 14. CLEANUP  (ALWAYS in FINALLY) ━━━━━━━━━━━━━━━━━━━━━━━━

        14.1  TRANSACTION SAFETY
                IF not isCommitted
                    ROLLBACK TRANSACTION

        14.2  LOCKS & SEMAPHORES
                RELEASE distributed lock
                RELEASE optimistic lock
                RELEASE semaphore slot
                RELEASE bulkhead slot

        14.3  CONNECTIONS
                CLOSE DB connection             → return to pool
                CLOSE cache connection          → return to pool
                CLOSE HTTP connection           → return to pool
                CLOSE message broker connection → return to pool
                CLOSE file handle
                FLUSH and CLOSE stream

        14.4  THREADS & FUTURES
                CANCEL pending futures
                KILL background threads
                AWAIT thread termination        (with timeout)
                DRAIN thread pool queue         (if owned)

        14.5  MEMORY
                NULL intermediate collections
                NULL large temporary objects
                RELEASE native memory           (if applicable)
                TRIGGER GC hint                 (if applicable)

        14.6  OBSERVABILITY CLOSE
                finish trace span               (with OK or ERROR status)
                flush buffered log entries
                flush buffered metrics
                record final duration


    RETURN Result<R>


END FUNCTION




━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         CLASS ANATOMY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLASS ClassName<T, R>
    IMPLEMENTS  InterfaceA<T>, InterfaceB<R>
    EXTENDS     ParentClass<T>
    MIXIN       SerializableMixin, AuditableMixin


    ━━━ 1. CONSTANTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        MAX_RETRIES         : Int       = 3
        DEFAULT_TIMEOUT     : Duration  = 30s
        SCHEMA_VERSION      : String    = "v2"
        CACHE_TTL           : Duration  = 60s
        MAX_BATCH_SIZE      : Int       = 1000


    ━━━ 2. STATIC / CLASS-LEVEL STATE ━━━━━━━━━━━━━━━━━━━━━━━━━━━

        instanceCount       : Int               (shared across all instances)
        registry            : Map<Id, Self>      (instance registry)
        defaultConfig       : Config             (shared config)
        sharedCache         : Cache<K, R>        (shared cache)
        logger              : Logger             (shared logger)


    ━━━ 3. INSTANCE FIELDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        3.1  IDENTITY
                id              : UUID
                name            : String
                version         : Int
                createdAt       : DateTime
                updatedAt       : DateTime
                createdBy       : UserId
                tenantId        : TenantId

        3.2  CORE DOMAIN STATE
                status          : StatusEnum
                data            : T
                metadata        : Map<String, Any>
                tags            : Set<String>

        3.3  RELATIONSHIPS  (see relationship section below)
                parent          : ParentClass<T>
                children        : List<ChildClass>
                peers           : List<Self>
                owner           : Owner

        3.4  INFRASTRUCTURE CONCERNS
                config          : Config
                context         : Context
                traceId         : TraceId
                lockHandle      : LockHandle
                connectionPool  : Pool<Connection>

        3.5  CACHES & COMPUTED
                _cachedResult   : R?             (lazy computed, nullable)
                _isDirty        : Bool           (has unsaved changes)
                _isLoaded       : Bool           (dependencies loaded)
                _isInitialized  : Bool


    ━━━ 4. CONSTRUCTOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        4.1  PRIMARY CONSTRUCTOR
                CONSTRUCTOR(params) ->
                    validate params
                    call super constructor
                    assign identity fields
                    assign core fields
                    apply defaults
                    wire dependencies
                    register instance          (in static registry)
                    emit created event
                    log instantiation

        4.2  SECONDARY CONSTRUCTORS / FACTORY METHODS
                STATIC fromJSON(json)           → deserialize
                STATIC fromDB(row)              → hydrate from DB row
                STATIC fromEvent(event)         → rebuild from event
                STATIC fromProto(proto)         → deserialize Protobuf
                STATIC clone(other)             → copy constructor
                STATIC empty()                  → null object pattern
                STATIC default()                → default instance

        4.3  BUILDER PATTERN  (for complex construction)
                STATIC builder()                → returns Builder<Self>
                    builder.withParam1(v)
                    builder.withParam2(v)
                    builder.withOptions(v)
                    builder.build()             → validated Self


    ━━━ 5. LIFECYCLE METHODS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        5.1  INITIALIZATION
                init()
                    load dependencies
                    establish connections
                    warm up caches
                    start background workers
                    set _isInitialized = true

        5.2  ACTIVATION / DEACTIVATION
                activate()                      (enable processing)
                deactivate()                    (pause, not destroy)
                suspend()                       (temporarily halt)
                resume()                        (resume from suspended)

        5.3  RESET
                reset()
                    clear state
                    reset counters
                    clear caches
                    keep identity

        5.4  DESTRUCTION
                destroy() / close() / dispose()
                    flush pending work
                    commit or rollback open transactions
                    release all resources
                    deregister from registry
                    emit destroyed event
                    null all references


    ━━━ 6. CORE METHODS  (domain behavior) ━━━━━━━━━━━━━━━━━━━━━━

        each core method follows full FUNCTION ANATOMY above

        6.1  COMMANDS  (mutate state)
                create(params)      → Result<Self, E>
                update(params)      → Result<Self, E>
                delete()            → Result<Void, E>
                execute(command)    → Result<R, E>
                apply(event)        → Result<Self, E>   (event sourcing)

        6.2  QUERIES  (read, no mutation)
                get(id)             → Result<T, E>
                find(criteria)      → Result<List<T>, E>
                exists(id)          → Bool
                count(criteria)     → Int
                search(query)       → Result<Page<T>, E>

        6.3  COMPUTED PROPERTIES
                isValid()           → Bool
                isEmpty()           → Bool
                isExpired()         → Bool
                canTransitionTo(state) → Bool
                toSummary()         → Summary<T>
                toDTO()             → DTO<T>


    ━━━ 7. STATE MACHINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        7.1  STATES
                DRAFT
                PENDING
                ACTIVE
                SUSPENDED
                COMPLETED
                FAILED
                ARCHIVED

        7.2  TRANSITIONS
                DRAFT       → PENDING        (onSubmit)
                PENDING     → ACTIVE         (onApprove)
                PENDING     → FAILED         (onReject)
                ACTIVE      → SUSPENDED      (onSuspend)
                SUSPENDED   → ACTIVE         (onResume)
                ACTIVE      → COMPLETED      (onComplete)
                ANY         → ARCHIVED       (onArchive)

        7.3  TRANSITION GUARDS
                canTransitionTo(nextState)
                    check current state is valid source
                    check business rules for transition
                    check authorization for transition

        7.4  TRANSITION SIDE EFFECTS
                onEnter(state)      (run when entering a state)
                onExit(state)       (run when leaving a state)
                onTransition(from, to, event)


    ━━━ 8. SERIALIZATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        toJSON()                    → JSON
        toProto()                   → Protobuf
        toAvro()                    → Avro
        toDTO()                     → DTO<T>            (API layer)
        toDocument()                → Document          (DB layer)
        toEvent()                   → DomainEvent       (event layer)
        toString()                  → human readable
        toDebugString()             → full detail debug


    ━━━ 9. EQUALITY, HASHING, COMPARISON ━━━━━━━━━━━━━━━━━━━━━━━━

        equals(other)               → Bool              (by identity / value)
        hashCode()                  → Int               (stable, consistent with equals)
        compareTo(other)            → Int               (-1, 0, 1)
        isSameIdentity(other)       → Bool              (same ID, maybe different version)
        isSameValue(other)          → Bool              (deep value equality)


    ━━━ 10. OBSERVABILITY METHODS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        getMetrics()                → Metrics
        getHealthStatus()           → HealthStatus
        getDiagnostics()            → Diagnostics
        getAuditLog()               → List<AuditEntry>
        emitHeartbeat()
        reportToMonitoring()


END CLASS




━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                     CLASS HIERARCHY ANATOMY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


    ━━━ 1. INTERFACE LAYER  (pure contracts, no state) ━━━━━━━━━━━

        INTERFACE Identifiable<ID>
            getId()             → ID
            getVersion()        → Int

        INTERFACE Auditable
            getCreatedAt()      → DateTime
            getCreatedBy()      → UserId
            getUpdatedAt()      → DateTime
            getUpdatedBy()      → UserId

        INTERFACE Serializable<F>
            serialize()         → F
            STATIC deserialize(F) → Self

        INTERFACE Validatable
            validate()          → Result<Void, List<Error>>
            isValid()           → Bool

        INTERFACE Lifecycle
            init()
            destroy()

        INTERFACE Observable
            subscribe(event, handler)
            unsubscribe(event, handler)
            emit(event, payload)

        INTERFACE Repository<T, ID>
            findById(ID)        → Result<T, E>
            findAll(criteria)   → Result<List<T>, E>
            save(T)             → Result<T, E>
            delete(ID)          → Result<Void, E>
            exists(ID)          → Bool


    ━━━ 2. ABSTRACT BASE LAYER  (shared state + partial impl) ━━━━

        ABSTRACT CLASS BaseEntity<ID, T>
            IMPLEMENTS Identifiable<ID>, Auditable, Validatable

            id              : ID                    (protected)
            version         : Int                   (protected)
            createdAt       : DateTime              (protected)
            updatedAt       : DateTime              (protected)

            ABSTRACT validate()                     (subclass must impl)
            ABSTRACT toDTO()                        (subclass must impl)

            equals(other)                           (impl by id comparison)
            hashCode()                              (impl by id hash)
            toString()                              (impl by id + type)
            markUpdated()                           (set updatedAt = now())
            incrementVersion()


        ABSTRACT CLASS BaseService<T, ID>
            IMPLEMENTS Lifecycle

            repository      : Repository<T, ID>     (protected)
            logger          : Logger                (protected)
            tracer          : Tracer                (protected)
            config          : Config                (protected)

            ABSTRACT executeCore(params)            (subclass must impl)

            init()                                  (impl: wire deps)
            destroy()                               (impl: release deps)
            withTransaction(fn)                     (shared tx wrapper)
            withRetry(fn, policy)                   (shared retry wrapper)
            withCircuitBreaker(fn)                  (shared CB wrapper)
            emitMetric(name, value)
            startSpan(name)


        ABSTRACT CLASS BaseRepository<T, ID>
            IMPLEMENTS Repository<T, ID>

            connection      : Connection            (protected)
            tableName       : String                (protected, abstract)
            mapper          : RowMapper<T>          (protected, abstract)

            ABSTRACT mapRow(row) → T                (subclass must impl)
            ABSTRACT tableName() → String           (subclass must impl)

            findById(id)                            (impl: SELECT WHERE id)
            findAll(criteria)                       (impl: SELECT WHERE criteria)
            save(entity)                            (impl: INSERT or UPDATE)
            delete(id)                              (impl: DELETE WHERE id)
            exists(id)                              (impl: SELECT COUNT)
            withTransaction(fn)
            buildQuery(criteria)


    ━━━ 3. MIXIN LAYER  (composable cross-cutting behavior) ━━━━━━

        MIXIN CacheableMixin<K, V>
            cache           : Cache<K, V>
            cacheTTL        : Duration
            getFromCache(K) → V?
            setInCache(K, V)
            invalidateCache(K)
            invalidateAll()

        MIXIN AuditableMixin
            auditLog        : List<AuditEntry>
            recordAudit(action, actor, before, after)
            getAuditHistory() → List<AuditEntry>

        MIXIN RetryableMixin
            retryPolicy     : RetryPolicy
            withRetry(fn)   → Result

        MIXIN ObservableMixin
            listeners       : Map<Event, List<Handler>>
            on(event, handler)
            off(event, handler)
            emit(event, payload)

        MIXIN SerializableMixin<F>
            toJSON()        → JSON
            toProto()       → Protobuf
            fromJSON(JSON)  → Self

        MIXIN SoftDeletableMixin
            deletedAt       : DateTime?
            deletedBy       : UserId?
            softDelete()
            restore()
            isDeleted()     → Bool


    ━━━ 4. CONCRETE CLASS LAYER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        CLASS Order
            EXTENDS     BaseEntity<OrderId, Order>
            IMPLEMENTS  Serializable<JSON>
            MIXIN       CacheableMixin, AuditableMixin, SoftDeletableMixin

            lineItems   : List<LineItem>
            total       : Money
            status      : OrderStatus

            validate()                              (impl required by abstract)
            toDTO()                                 (impl required by abstract)
            addLineItem(item)
            removeLineItem(itemId)
            calculateTotal()
            submit()
            cancel()


        CLASS OrderService
            EXTENDS     BaseService<Order, OrderId>
            MIXIN       RetryableMixin, ObservableMixin

            executeCore(params)                     (impl required by abstract)
            createOrder(params)
            updateOrder(params)
            cancelOrder(id)
            getOrderHistory(customerId)


        CLASS OrderRepository
            EXTENDS     BaseRepository<Order, OrderId>
            MIXIN       CacheableMixin

            tableName()                             (impl: "orders")
            mapRow(row)                             (impl: row → Order)
            findByCustomer(customerId)
            findByStatus(status)
            findByDateRange(start, end)


    ━━━ 5. CLASS RELATIONSHIPS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        5.1  INHERITANCE   (IS-A)
                Child EXTENDS Parent
                    child inherits all fields and methods
                    child can override methods
                    child can extend with new fields
                    use when child truly IS a parent
                    prefer shallow hierarchies         (max 2-3 levels)

        5.2  INTERFACE IMPLEMENTATION   (CAN-DO)
                Class IMPLEMENTS Interface
                    class promises to fulfill contract
                    class can implement many interfaces
                    decouples caller from concrete type
                    use for cross-cutting capabilities

        5.3  COMPOSITION   (HAS-A, preferred over inheritance)
                Class HAS-A Dependency
                    dependency is injected, not created
                    class delegates behavior to dependency
                    class is not coupled to concrete type
                    use when behavior can be swapped

        5.4  AGGREGATION   (HAS-MANY, weak ownership)
                Order HAS-MANY LineItems
                    order references line items
                    line items can exist without order
                    lifecycle is independent
                    deletion of order does not cascade

        5.5  COMPOSITION   (HAS-MANY, strong ownership)
                Document HAS-MANY Pages
                    document owns pages
                    pages cannot exist without document
                    lifecycle is shared
                    deletion of document cascades to pages

        5.6  DEPENDENCY    (USES-A, transient)
                Service USES Repository
                    service calls repository methods
                    repository is injected
                    no ownership, no lifecycle coupling

        5.7  ASSOCIATION   (KNOWS-ABOUT)
                Customer KNOWS-ABOUT Order
                    customer holds reference to orders
                    bidirectional or unidirectional
                    no lifecycle coupling

        5.8  DEPENDENCY INJECTION PATTERNS
                constructor injection               (preferred, explicit)
                property injection                  (for optional deps)
                method injection                    (for per-call deps)
                service locator                     (last resort)


    ━━━ 6. LAYERED ARCHITECTURE FLOW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        REQUEST
            ↓
        INTERFACE LAYER         (Controller / API Handler)
            validate HTTP input
            authenticate
            authorize
            map to command / query
            ↓
        APPLICATION LAYER        (Service / Use Case)
            orchestrate
            transaction boundary
            emit events
            ↓
        DOMAIN LAYER             (Entity / Aggregate / Domain Service)
            enforce business rules
            state transitions
            domain events
            ↓
        INFRASTRUCTURE LAYER     (Repository / External / Cache)
            DB read / write
            cache read / write
            external service calls
            message publishing
            ↑
        RESPONSE
            map domain → DTO
            serialize
            return to caller


    ━━━ 7. DEPENDENCY RULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Interface Layer     → depends on → Application Layer
        Application Layer   → depends on → Domain Layer
        Domain Layer        → depends on → NOTHING (pure)
        Infrastructure Layer → depends on → Domain Layer (interfaces only)

        NEVER:
            Domain    → Infrastructure     (domain must not know DB)
            Domain    → Application        (domain must not call services)
            Lower     → Higher             (no upward dependency)


    ━━━ 8. OBJECT LIFECYCLE IN A SYSTEM ━━━━━━━━━━━━━━━━━━━━━━━━━

        BIRTH
            constructed via constructor or factory
            validated
            persisted
            event emitted                   (EntityCreated)

        ACTIVE LIFE
            loaded from DB / cache on demand
            mutated via commands
            version incremented on each change
            events emitted on each change
            persisted after each mutation

        TRANSITION
            state machine governs valid transitions
            guards checked before transition
            side effects run on transition
            audit log updated

        SOFT DELETE
            marked as deleted
            hidden from normal queries
            audit preserved
            can be restored

        HARD DELETE
            removed from primary store
            cascades to owned children
            event emitted                   (EntityDeleted)
            cache invalidated
            search index updated

        ARCHIVAL
            moved to archive store
            removed from hot path
            retained for compliance


END HIERARCHY