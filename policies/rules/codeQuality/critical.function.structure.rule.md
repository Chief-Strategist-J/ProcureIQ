FUNCTION functionName<T, R>(params) -> Result<R, Error>


    ━━━ 1. VALIDATE INPUT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        null / undefined checks
        empty string / empty collection checks
        type checks
        range checks         (min, max, bounds)
        format checks        (regex, enum membership)
        cross-field checks   (startDate < endDate)
        authorization        (role, ownership, scope)
        rate limit           (per user, per IP, per tenant)
        quota check          (usage limits)
        feature flags        (is this feature on for this user)
        circuit breaker      (is downstream healthy)
        idempotency key      (already processed this request?)


    ━━━ 2. INITIALIZE STATE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        result               = Result<R>.empty()
        intermediate         = Collection<T>.empty()
        futures              = List<Future<R>>.empty()
        retryCount           = 0
        startTime            = now()
        traceId              = generateTraceId()
        spanId               = tracer.startSpan(traceId)
        correlationId        = context.correlationId ?? generateId()
        requestId            = generateRequestId()


    ━━━ 3. ACQUIRE RESOURCES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        distributed lock     (on key, with TTL)
        semaphore            (cap concurrency)
        connection pool slot (DB, HTTP, message broker)
        thread slot          (from executor pool)
        file handle          (if I/O bound)
        memory budget check  (fail before OOM)


    ━━━ 4. LOAD DEPENDENCIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        config / feature config
        secrets / credentials  (from vault, not hardcoded)

        check L1 cache (in-memory)    → return if hit
        check L2 cache (Redis/remote) → return if hit

        fetch primary data source     (DB, blob, file)
        fetch secondary data source   (replica, shard)
        fetch external service A      (REST, gRPC)
        fetch external service B
        fetch reference / lookup data (enums, mappings)

        deserialize / unmarshal all fetched data
        bind to strongly typed models


    ━━━ 5. ASSERT PRE-CONDITIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        data exists and is not empty
        version matches expected version
        schema matches expected schema
        checksum / hash is valid
        timestamps are sane             (not in future, not expired)
        state machine is in valid state (e.g. order is PENDING not CLOSED)
        no conflicting in-flight operations exist


    ━━━ 6. CONCURRENCY SETUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        spawn background threads        (fire and forget tasks)
        define async futures            (parallel I/O calls)

        AWAIT ALL futures               (need all results)
            or
        AWAIT ANY future                (need fastest result)
            or
        AWAIT WITH timeout              (bounded wait)

        collect results from futures
        handle partial failures         (which futures failed, fallback)


    ━━━ 7. CORE PIPELINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        source          load into pipeline
        filter          drop invalid / irrelevant items
        deduplicate     remove duplicates
        sort            order if needed
        map             transform each item         (1 → 1)
        flatMap         expand each item            (1 → many)
        enrich          join with lookup / side data
        group           bucket by key
        window          bucket by time range
        reduce          fold into single value
        aggregate       compute counts, sums, stats
        paginate        slice if result is large
        collect         materialize into final structure


    ━━━ 8. BRANCHING LOGIC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        IF strategy A
            execute path A
        ELSE IF strategy B
            execute path B
        ELSE
            execute default path

        IF partial results acceptable
            continue with what succeeded
        ELSE
            fail entire operation


    ━━━ 9. HOOKS / CALLBACKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        run pre-processing hook         (caller-injected logic before)
        run user-supplied callback      (transform, enrich, override)
        run post-processing hook        (caller-injected logic after)
        run middleware chain            (ordered interceptors)


    ━━━ 10. ASSERT POST-CONDITIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        result is not null
        result size is within bounds
        result shape matches expected schema
        business rules pass             (no negative balance, no overlap)
        referential integrity holds     (foreign keys valid)
        output checksum matches
        no data was silently dropped


    ━━━ 11. RETRY LOGIC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        IF transient error
            WAIT exponentialBackoff(retryCount) + jitter
            INCREMENT retryCount
            IF retryCount < maxRetries
                GOTO step 4 or step 7 (whichever failed)
            ELSE
                give up, propagate error

        IF non-transient error
            do not retry
            propagate immediately


    ━━━ 12. COMMIT SIDE EFFECTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        BEGIN TRANSACTION

            write to primary DB
            write to secondary / replica store
            write to audit log table
            invalidate / update L1 cache
            invalidate / update L2 cache
            publish domain event        (Kafka, SQS, EventBridge)
            publish integration event   (for external consumers)
            notify webhooks
            send notifications          (email, push, SMS)
            update search index
            schedule follow-up job      (queue async work)

        COMMIT TRANSACTION


    ━━━ 13. OBSERVE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        log structured audit entry      (who, what, when, result)
        emit success metric             (counter, histogram)
        emit latency metric             (now - startTime)
        emit throughput metric          (items processed)
        finish trace span               (with status OK)
        record to dashboards / SLO sink
        send alert if SLO breached


    ━━━ 14. CLEANUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        ALWAYS (in FINALLY):

            ROLLBACK TRANSACTION        (if not committed)
            RELEASE distributed lock
            RELEASE semaphore
            CLOSE DB connections
            CLOSE HTTP connections
            CANCEL pending futures
            KILL background threads
            FLUSH buffers / streams
            NULL out intermediates      (help GC)
            RECORD final span status    (OK or ERROR)


    RETURN Result<R>


END FUNCTION