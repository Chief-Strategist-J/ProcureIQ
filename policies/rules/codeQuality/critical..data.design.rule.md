━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        DATA WRITING BLUEPRINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


    ━━━ 1. WRITE PATH ENTRY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        1.1  INTAKE VALIDATION
                schema validation               (types, required fields)
                format validation               (dates, enums, regex)
                size validation                 (max payload, max field length)
                encoding validation             (UTF-8, no null bytes)
                semantic validation             (business rules)
                idempotency key check           (already written?)
                deduplication window check      (seen in last N seconds?)

        1.2  WRITE CLASSIFICATION
                classify as
                    INSERT                      (new record)
                    UPDATE                      (mutate existing)
                    UPSERT                      (insert or update)
                    SOFT DELETE                 (mark deleted)
                    HARD DELETE                 (remove permanently)
                    BULK WRITE                  (batch of above)
                    APPEND                      (log, event, time-series)

        1.3  AUTHORIZATION FOR WRITE
                caller owns the resource
                caller has write scope
                caller within tenant boundary
                write not on locked / archived record
                write not on soft-deleted record


    ━━━ 2. FORMATTING & NORMALIZATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        2.1  FIELD NORMALIZATION
                trim whitespace                 (all string fields)
                normalize casing                (lowercase email, uppercase codes)
                normalize unicode               (NFC form)
                strip control characters
                normalize line endings          (LF only)
                canonicalize phone numbers      (E.164)
                canonicalize URLs               (lowercase scheme + host)
                canonicalize dates              (UTC, ISO 8601)

        2.2  TYPE COERCION
                string → int / float            (with bounds check)
                string → DateTime               (with timezone resolution)
                string → enum                   (case-insensitive match)
                null → default value            (only where semantically safe)

        2.3  ENRICHMENT BEFORE WRITE
                stamp createdAt / updatedAt     (server-side, never trust client)
                stamp createdBy / updatedBy     (from auth context)
                assign ID                       (UUID v7 / ULID preferred)
                assign version                  (1 for new, increment for update)
                assign tenantId                 (from context)
                compute derived fields          (fullName, totalAmount)
                compute checksum / hash         (for integrity verification)

        2.4  SANITIZATION
                strip HTML / scripts            (unless rich text field)
                escape special characters       (for safe storage)
                redact sensitive fields in logs (PII, secrets)
                mask before writing to non-primary stores


    ━━━ 3. WRITE TRANSACTION DESIGN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        3.1  TRANSACTION BOUNDARY
                open transaction as late as possible
                close transaction as early as possible
                never do I/O inside transaction (HTTP calls, file reads)
                never do heavy computation inside transaction
                keep critical section to DB writes only

        3.2  TRANSACTION ISOLATION
                READ COMMITTED                  (default, most writes)
                REPEATABLE READ                 (multi-step financial writes)
                SERIALIZABLE                    (conflict-sensitive operations)
                SNAPSHOT                        (MVCC, good default)

        3.3  WRITE ORDER WITHIN TRANSACTION
                write parent before children
                write lookup / reference data first
                write primary record
                write secondary / derived records
                write audit log record
                write outbox event record       (same transaction)
                commit

        3.4  OPTIMISTIC CONCURRENCY
                read version stamp before write
                include WHERE version = N in UPDATE
                IF rows affected = 0 → conflict detected
                retry with fresh read           (up to N times)
                fail with ConflictError         (if retries exhausted)

        3.5  PESSIMISTIC CONCURRENCY
                SELECT FOR UPDATE on critical rows
                hold lock for minimum time
                release in FINALLY
                timeout on lock acquire         (never wait forever)


    ━━━ 4. SHARDING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        4.1  SHARD KEY SELECTION
                high cardinality                (many distinct values)
                evenly distributed              (no hot shards)
                immutable after creation        (never change shard key)
                query-aligned                   (most queries filter by it)
                good candidates
                    tenantId
                    userId
                    region
                    entity type + id
                bad candidates
                    status                      (low cardinality, hot)
                    createdAt alone             (time-based hot spot)
                    sequential int ID           (insert hot spot)

        4.2  SHARD ROUTING
                hash-based routing              (consistent hashing)
                    hash(shardKey) % numShards
                range-based routing             (time, alphabetical)
                    shardKey BETWEEN A AND B → shard N
                directory-based routing         (lookup table)
                    lookup(shardKey) → shardId
                always route at application layer (not DB layer)

        4.3  CROSS-SHARD WRITES
                avoid cross-shard transactions  (no distributed ACID)
                use saga pattern                (compensating actions)
                use outbox + events             (eventual consistency)
                if must be atomic → use 2PC     (last resort, slow)

        4.4  SHARD REBALANCING
                add new shard
                compute new shard boundaries
                copy data range to new shard
                dual-write to old and new shard (transition period)
                verify data on new shard
                switch reads to new shard
                drain writes from old shard
                remove old shard
                never rebalance under peak load

        4.5  HOT SHARD MITIGATION
                detect hot shard via per-shard metrics
                add random suffix to hot key    (fan out)
                split hot shard into sub-shards
                cache hot shard reads           (reduce DB pressure)
                rate-limit writes to hot shard


    ━━━ 5. REPLICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        5.1  REPLICATION TOPOLOGY
                single leader                   (one write node, N read replicas)
                multi-leader                    (writes to any leader, conflict resolution needed)
                leaderless                      (writes to quorum, e.g. Cassandra)
                choose based on consistency vs availability tradeoff

        5.2  REPLICATION LAG MANAGEMENT
                monitor replication lag         (primary metric)
                read-your-own-writes
                    → read from primary immediately after write
                    → OR use version / timestamp to wait for replica
                monotonic reads
                    → sticky session to same replica
                    → OR check replica lag before reading
                alert if lag > threshold        (seconds, not minutes)

        5.3  WRITE CONSISTENCY LEVELS
                write to primary only           (fast, replica may lag)
                write to primary + 1 replica    (safer)
                write to quorum                 (majority must ack)
                write to all replicas           (slowest, strongest)
                choose per operation type

        5.4  FAILOVER
                detect primary failure          (heartbeat, health check)
                elect new primary               (Raft / Paxos / manual)
                redirect writes to new primary
                reconnect replicas to new primary
                fence old primary               (STONITH, prevent split-brain)
                verify no data loss             (compare last written LSN)

        5.5  REPLICA READS
                always read from replica for non-critical reads
                never read from replica for post-write reads (stale)
                monitor per-replica lag
                route away from lagging replica automatically


    ━━━ 6. WRITE PATTERNS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        6.1  SINGLE WRITE
                validate
                begin transaction
                write primary record
                write audit log
                write outbox event
                commit
                invalidate cache
                return written record

        6.2  BATCH WRITE
                collect N records               (bounded batch size)
                validate all records first      (fail batch or fail individual)
                bulk insert in single statement (ORDER BY shard key)
                wrap in single transaction      (if small batch)
                OR commit per chunk             (if large batch)
                track which records succeeded / failed
                return partial success report

        6.3  UPSERT
                INSERT ... ON CONFLICT UPDATE
                ensure idempotent               (same input = same output)
                use idempotency key as conflict target
                never upsert on mutable business data without version check

        6.4  APPEND-ONLY WRITE  (events, logs, time-series)
                never UPDATE or DELETE
                always INSERT new record
                include timestamp + sequence number
                partition by time range         (daily, monthly tables)
                archive old partitions          (cold storage)

        6.5  WRITE-BEHIND  (async write)
                write to in-memory store first  (fast ACK to caller)
                background worker flushes to DB
                risk: data loss on crash        (use WAL / journal)
                use only where durability can be relaxed

        6.6  WRITE-THROUGH  (sync write)
                write to DB first
                then write to cache
                cache always consistent with DB
                slower but safer

        6.7  OUTBOX PATTERN
                write domain record + outbox event in same transaction
                separate publisher reads outbox table
                publishes event to broker
                marks outbox record as published
                guarantees at-least-once event delivery
                deduplicate on consumer side


    ━━━ 7. DURABILITY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        7.1  WRITE-AHEAD LOG  (WAL)
                every write logged to WAL before applied
                WAL is append-only, sequential  (fast)
                on crash → replay WAL to recover
                WAL is the source of truth for durability

        7.2  FSYNC POLICY
                fsync on every commit           (strongest, slowest)
                fsync every N seconds           (balanced)
                no fsync                        (fastest, data loss risk)
                choose per durability requirement

        7.3  CHECKPOINTING
                periodically flush WAL to data files
                checkpoint = known good state on disk
                on recovery → start from last checkpoint + replay WAL
                monitor checkpoint frequency    (too rare = long recovery)

        7.4  REPLICATION AS DURABILITY
                write not durable until replicated to quorum
                synchronous replication         (wait for replica ACK)
                asynchronous replication        (do not wait, lag risk)
                use synchronous for financial / critical data

        7.5  BACKUP STRATEGY
                full backup                     (periodic, weekly)
                incremental backup              (daily)
                continuous backup               (WAL streaming to backup store)
                point-in-time recovery          (PITR)
                test restore regularly          (backup is useless if untested)
                store backups in separate region


    ━━━ 8. ERROR HANDLING ON WRITE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        8.1  CLASSIFY WRITE ERROR
                constraint violation            (unique, FK, not null)
                    → do not retry, fix data
                optimistic lock conflict        (version mismatch)
                    → retry with fresh read
                deadlock                        (DB detected cycle)
                    → retry immediately
                transient network error         (connection lost)
                    → retry with backoff
                disk full / out of space        (infrastructure)
                    → alert, do not retry
                timeout                         (write too slow)
                    → check if write landed before retrying
                    → use idempotency key to safely retry

        8.2  RETRY SAFETY
                ONLY retry idempotent writes
                ALWAYS use idempotency key on retry
                check if write already landed   (read before retry)
                exponential backoff + jitter
                max retry limit                 (never infinite)

        8.3  PARTIAL WRITE HANDLING
                IF batch write partially failed
                    identify succeeded records
                    identify failed records
                    retry only failed records
                    return partial success with details

        8.4  DEAD LETTER
                IF write fails after all retries
                    write to dead letter queue / table
                    include original payload + error + attempt count
                    alert on-call
                    provide replay mechanism


    ━━━ 9. MIGRATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        9.1  MIGRATION PRINCIPLES
                migrations are versioned        (sequential, numbered)
                migrations are idempotent       (safe to run twice)
                migrations are reviewed         (like code)
                migrations are tested           (on prod-like data)
                never edit a committed migration (add a new one)
                never drop column in same migration as code deploy

        9.2  SAFE MIGRATION ORDER  (expand / contract)

                PHASE 1 — EXPAND
                    add new column as nullable  (no default required)
                    add new table
                    add new index               (CONCURRENTLY)
                    deploy code that writes to BOTH old and new column
                    backfill new column         (in batches, not full table lock)

                PHASE 2 — MIGRATE
                    verify backfill complete
                    verify new column has no nulls
                    add NOT NULL constraint      (after backfill)
                    deploy code that reads from new column only

                PHASE 3 — CONTRACT
                    deploy code that no longer writes to old column
                    drop old column
                    drop old index
                    drop old table

        9.3  BACKFILL STRATEGY
                never UPDATE all rows in one statement   (table lock)
                batch by primary key range
                    UPDATE WHERE id BETWEEN N AND M
                    SLEEP between batches       (reduce DB pressure)
                track progress                  (last processed id)
                resumable                       (restart from checkpoint)
                monitor replication lag during backfill

        9.4  INDEX MIGRATION
                CREATE INDEX CONCURRENTLY       (no table lock)
                verify index built successfully
                verify query planner uses new index
                DROP old index CONCURRENTLY
                never drop index before new one is verified

        9.5  ZERO-DOWNTIME MIGRATION CHECKLIST
                no lock-acquiring ALTER TABLE on large tables
                no full table scans during migration
                replication lag monitored throughout
                rollback plan ready before starting
                feature flag gates new code path
                migration applied before code deploy
                code backward-compatible with old schema


    ━━━ 10. ROLLBACK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        10.1  TRANSACTION ROLLBACK
                IF any step in transaction fails
                    ROLLBACK entire transaction
                    no partial writes visible
                    log what failed and why
                    return error to caller

        10.2  MIGRATION ROLLBACK
                every migration has a down() function
                down() is tested before migration runs
                down() reverses exactly what up() did
                run down() on failure
                verify system healthy after down()

        10.3  SCHEMA ROLLBACK CONSTRAINTS
                can rollback ADD COLUMN          (drop it)
                can rollback ADD INDEX           (drop it)
                CANNOT rollback DROP COLUMN      (data gone)
                CANNOT rollback DROP TABLE       (data gone)
                NEVER drop without backup
                NEVER drop without retention period first

        10.4  DATA ROLLBACK
                point-in-time recovery          (restore from WAL)
                restore from backup snapshot
                replay events to known good state  (event sourcing)
                soft delete first, hard delete later  (recovery window)

        10.5  APPLICATION ROLLBACK
                deploy previous version
                previous version must be compatible with current schema
                schema is always ahead of code by one safe version
                feature flags disable new behavior without redeploy


    ━━━ 11. RECOVERY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        11.1  CRASH RECOVERY
                on restart → replay WAL from last checkpoint
                verify data files consistent with WAL
                reject / flag inconsistent records
                resume normal operation
                monitor for data anomalies post-recovery

        11.2  REPLICA RECOVERY
                replica reconnects to primary
                primary sends missing WAL segments
                replica replays WAL to catch up
                replica rejoins replication stream
                verify replica lag is zero before routing reads

        11.3  SPLIT-BRAIN RECOVERY
                detect split-brain              (two primaries)
                fence one primary              (STONITH)
                compare last written LSN on both
                designate higher LSN as winner
                reconcile or discard lower LSN writes
                investigate root cause          (network partition)

        11.4  CORRUPTION RECOVERY
                detect corruption               (checksum mismatch)
                isolate corrupted block / table
                restore from last known good backup
                replay WAL from backup point
                verify restored data integrity
                audit what data was lost

        11.5  INCOMPLETE WRITE RECOVERY
                detect via checksum / version mismatch
                check outbox for unpublished events
                check idempotency log for partial writes
                replay safe idempotent operations
                flag non-idempotent partial writes for manual review


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                     DATA MODEL DESIGN BLUEPRINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


    ━━━ 1. UNDERSTAND THE DOMAIN FIRST ━━━━━━━━━━━━━━━━━━━━━━━━━━━

        1.1  IDENTIFY ENTITIES
                what are the core nouns in the domain
                what has identity                (persisted, referenced)
                what is a value object           (no identity, just data)
                what is a lookup / reference     (static, rarely changes)
                what is an event                 (happened, immutable)

        1.2  IDENTIFY RELATIONSHIPS
                one-to-one
                one-to-many
                many-to-many                     (needs junction table)
                self-referential                 (tree, graph)
                polymorphic                      (entity belongs to multiple types)

        1.3  IDENTIFY ACCESS PATTERNS FIRST
                what queries will be most frequent
                what queries are most latency sensitive
                what is written together, read together
                what is written once, read many times
                what is written many times, rarely read
                model data to serve access patterns, not to mirror reality

        1.4  IDENTIFY BOUNDARIES
                aggregate root                  (entry point for mutations)
                consistency boundary            (what must be atomic)
                transaction boundary            (what commits together)
                service boundary                (what is owned by which service)


    ━━━ 2. ENTITY DESIGN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        2.1  IDENTITY FIELDS
                id              UUID v7 / ULID  (sortable, globally unique)
                                never sequential int for distributed systems
                                never business key as PK  (business keys change)
                version         Int             (optimistic concurrency)
                tenantId        UUID            (multi-tenancy)

        2.2  AUDIT FIELDS  (every entity)
                createdAt       DateTime UTC
                createdBy       UserId
                updatedAt       DateTime UTC
                updatedBy       UserId
                deletedAt       DateTime UTC?   (soft delete, nullable)
                deletedBy       UserId?

        2.3  BUSINESS FIELDS
                status          Enum            (state machine state)
                type            Enum            (polymorphic discriminator)
                externalId      String?         (ID from external system)
                idempotencyKey  String?         (for safe retries)

        2.4  FIELD DESIGN RULES
                prefer enums over magic strings
                prefer UTC DateTime over local time
                prefer structured fields over free-text blobs
                prefer separate fields over packed JSON (for queryability)
                use JSON / JSONB only for truly dynamic schema
                never store computed values     (derive at read time)
                exception: store computed if computation is expensive


    ━━━ 3. NORMALIZATION vs DENORMALIZATION ━━━━━━━━━━━━━━━━━━━━━━

        3.1  NORMALIZE WHEN
                data changes frequently         (update in one place)
                data is referenced from many places
                storage is a constraint
                consistency is critical
                write-heavy workload

        3.2  DENORMALIZE WHEN
                read performance is critical
                data changes rarely
                join cost is too high
                read-heavy workload
                analytics / reporting queries

        3.3  DENORMALIZATION PATTERNS
                embed child in parent           (no join needed)
                duplicate field into child      (avoid join for common read)
                precompute aggregate            (store count, sum alongside)
                materialized view               (DB-managed denormalized copy)
                read model                      (CQRS separate read store)

        3.4  NORMALIZATION FORMS
                1NF     atomic fields, no repeating groups
                2NF     no partial dependency on composite key
                3NF     no transitive dependency
                BCNF    every determinant is a candidate key
                aim for 3NF for OLTP
                deliberately denormalize for OLAP / read models


    ━━━ 4. RELATIONSHIP DESIGN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        4.1  ONE-TO-MANY
                FK on the many side             (child holds parentId)
                index the FK column             (always)
                cascade delete?                 (only if child cannot exist without parent)
                restrict delete?                (prevent orphan creation)

        4.2  MANY-TO-MANY
                junction table with own PK
                junction table FK to both sides
                junction table can carry relationship attributes
                    (e.g. UserRole has userId, roleId, assignedAt, assignedBy)
                index both FKs
                composite unique on (fk1, fk2)

        4.3  SELF-REFERENTIAL  (trees, hierarchies)
                parentId nullable FK to same table
                closure table for deep queries  (all ancestors, descendants)
                materialized path               (path = /root/child/grandchild)
                nested sets                     (lft, rgt for range queries)
                choose based on query pattern   (insert vs read frequency)

        4.4  POLYMORPHIC ASSOCIATION
                OPTION A    single table inheritance
                    type discriminator column
                    all subtypes in one table
                    nullable columns for subtype-specific fields
                    simple but sparse

                OPTION B    class table inheritance
                    base table + one table per subtype
                    join on query
                    no nulls, cleaner

                OPTION C    separate tables per type
                    no shared table
                    no polymorphic FK
                    simplest, no join
                    harder to query across types


    ━━━ 5. INDEXING STRATEGY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        5.1  ALWAYS INDEX
                primary key                     (auto)
                foreign keys                    (always, or joins are slow)
                columns used in WHERE           (high cardinality first)
                columns used in ORDER BY
                columns used in GROUP BY
                columns used in JOIN ON

        5.2  COMPOSITE INDEX DESIGN
                most selective column first
                match query column order exactly
                index covers all WHERE + ORDER BY columns  (covering index)
                avoid indexing low-cardinality columns alone  (status, boolean)

        5.3  PARTIAL INDEX
                index WHERE status = 'ACTIVE'   (only active records)
                index WHERE deletedAt IS NULL   (only live records)
                smaller, faster than full index

        5.4  INDEX TYPES
                B-tree                          (default, range queries, equality)
                Hash                            (equality only, faster)
                GIN                             (full-text, JSON, arrays)
                GiST                            (geo, range types)
                BRIN                            (time-series, append-only)

        5.5  INDEX HYGIENE
                remove unused indexes           (write overhead for no benefit)
                monitor index bloat             (vacuum regularly)
                rebuild fragmented indexes
                EXPLAIN every hot query         (verify index is used)
                alert on sequential scans on large tables


    ━━━ 6. PARTITIONING STRATEGY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        6.1  RANGE PARTITIONING
                partition by time               (daily, monthly, yearly)
                best for time-series, logs, events
                old partitions archived / dropped cleanly
                queries with time filter hit one partition only

        6.2  LIST PARTITIONING
                partition by enum value         (region, status, type)
                best for geographic or categorical splits

        6.3  HASH PARTITIONING
                partition by hash(id)
                even distribution
                best for large tables with no natural range

        6.4  PARTITION PRUNING
                queries must filter on partition key
                otherwise all partitions scanned
                always include partition key in WHERE

        6.5  PARTITION MAINTENANCE
                create future partitions in advance
                archive / detach old partitions on schedule
                monitor partition sizes
                rebalance if uneven


    ━━━ 7. MULTI-TENANCY MODEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        7.1  SHARED SCHEMA  (tenantId column on every table)
                simplest operationally
                tenantId on every table
                every query includes WHERE tenantId = ?
                row-level security enforced at DB layer
                risk of data leak if tenantId forgotten in query
                partition by tenantId for large tenants

        7.2  SHARED DB SEPARATE SCHEMA  (one schema per tenant)
                stronger isolation
                schema-per-tenant in same DB cluster
                search_path set per connection
                harder to migrate all tenants
                good for medium isolation requirements

        7.3  SEPARATE DB PER TENANT  (full isolation)
                strongest isolation
                separate DB instance per tenant
                no cross-tenant risk
                operationally expensive
                best for enterprise / regulated tenants


    ━━━ 8. TEMPORAL DATA MODEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        8.1  AUDIT HISTORY PATTERN
                on every UPDATE → INSERT old row into history table
                history table has same columns + historyId + validFrom + validTo
                current record in main table
                history in audit table

        8.2  SLOWLY CHANGING DIMENSION  (SCD)
                SCD TYPE 1      overwrite       (no history)
                SCD TYPE 2      new row per change with validFrom / validTo
                SCD TYPE 3      previous value column alongside current
                SCD TYPE 4      separate history table

        8.3  BITEMPORAL MODEL
                validFrom / validTo             (when fact was true in reality)
                recordedFrom / recordedTo       (when fact was recorded in DB)
                allows querying as-of any point in time
                allows correcting historical records


    ━━━ 9. EVENT SOURCING MODEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        9.1  EVENT STORE SCHEMA
                eventId         UUID
                streamId        UUID            (aggregate ID)
                streamType      String          (aggregate type)
                eventType       String
                eventVersion    Int             (within stream, sequential)
                globalPosition  Int             (across all streams, sequential)
                payload         JSON / bytes
                metadata        JSON            (causationId, correlationId, userId)
                occurredAt      DateTime UTC
                recordedAt      DateTime UTC

        9.2  READING STATE
                load all events for streamId
                replay in eventVersion order
                apply each event to build current state
                cache snapshot every N events   (avoid full replay)
                rebuild from snapshot + events after snapshot

        9.3  SNAPSHOT SCHEMA
                snapshotId      UUID
                streamId        UUID
                streamVersion   Int             (event version at snapshot time)
                state           JSON / bytes    (serialized aggregate state)
                takenAt         DateTime UTC


    ━━━ 10. DATA LIFECYCLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        10.1  RETENTION TIERS
                HOT             active, fully indexed, primary DB
                WARM            recent but less active, compressed, replica
                COLD            old, rarely accessed, object storage
                FROZEN          compliance archive, encrypted, offsite

        10.2  DATA MOVEMENT
                HOT → WARM      after N days of no access or by age
                WARM → COLD     after M months
                COLD → FROZEN   after compliance retention period
                automated by scheduled job
                transition logged in metadata

        10.3  DELETION POLICY
                soft delete first               (mark deletedAt)
                retain for recovery window      (7-30 days)
                hard delete after window        (automated)
                purge from all stores           (cache, search, replicas)
                purge from backups after compliance period
                log deletion with reason        (compliance)

        10.4  PII & SENSITIVE DATA
                identify PII fields at design time
                encrypt at rest
                mask in non-production
                log access to PII fields
                implement right-to-erasure
                crypto-shredding                (delete encryption key = data gone)
                never log PII in plaintext


    ━━━ 11. SCHEMA EVOLUTION RULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        SAFE CHANGES  (backward compatible)
                add nullable column
                add table
                add index
                add enum value
                increase varchar length
                add view

        UNSAFE CHANGES  (require expand/contract migration)
                rename column
                rename table
                change column type
                reduce varchar length
                remove enum value
                add NOT NULL without default

        NEVER  (destructive, require backup + extreme care)
                drop column
                drop table
                change PK
                change shard key