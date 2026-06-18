# Notification System Design

---

## Stage 1

### Overview
This document outlines the REST API design for a Campus Notification Platform where students receive real-time updates about Placements, Events, and Results.

### Core Actions the Platform Supports
1. Fetch all notifications for a logged-in student (paginated)
2. Fetch a single notification by ID
3. Mark a notification as read
4. Create a new notification (admin only)
5. Fetch top N priority notifications
6. Receive real-time notifications as they arrive

---

### REST API Endpoints

#### 1. GET /api/notifications
Fetch all notifications for the logged-in student with optional filters and pagination.

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
- `page` (integer, default: 1) — Page number
- `limit` (integer, default: 20) — Items per page
- `notification_type` (string, optional) — Filter by "Placement", "Result", or "Event"

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "Type": "Result",
      "Message": "mid-sem results are out",
      "Timestamp": "2026-04-22 17:51:30",
      "isRead": false
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 150
}
```

---

#### 2. GET /api/notifications/:id
Fetch a single notification by its ID.

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

**Response (200 OK):**
```json
{
  "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
  "Type": "Placement",
  "Message": "Google visiting campus next week",
  "Timestamp": "2026-04-22 17:51:30",
  "isRead": false
}
```

**Response (404 Not Found):**
```json
{
  "error": "Notification not found"
}
```

---

#### 3. PATCH /api/notifications/:id/read
Mark a specific notification as read.

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "message": "Notification marked as read",
  "ID": "d146095a-0d86-4a34-9e69-3900a14576bc"
}
```

---

#### 4. POST /api/notifications
Create a new notification (admin/system only).

**Headers:**
```json
{
  "Authorization": "Bearer <admin_jwt_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "student_id": 1042,
  "Type": "Placement",
  "Message": "Amazon pre-placement talk tomorrow",
  "notification_type": "Placement"
}
```

**Response (201 Created):**
```json
{
  "message": "Notification created successfully",
  "ID": "new-uuid-here"
}
```

---

#### 5. GET /api/notifications/priority
Fetch top N priority notifications for the logged-in student.

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

**Query Parameters:**
- `n` (integer, default: 10) — Number of top notifications to return

**Response (200 OK):**
```json
{
  "priority_notifications": [
    {
      "ID": "uuid",
      "Type": "Placement",
      "Message": "Google hiring drive",
      "Timestamp": "2026-04-22 18:00:00",
      "isRead": false,
      "priority_score": 3
    }
  ]
}
```

---

### Real-Time Notification Mechanism

I chose **WebSockets** for real-time notifications.

**Why WebSockets over polling:**
- Polling hits the server every few seconds even when there are no new notifications — wastes resources.
- WebSockets maintain a persistent connection. The server pushes new notifications to the client instantly when they arrive.

**How it works:**
1. When a student logs in, the frontend opens a WebSocket connection: `ws://server/ws?token=<jwt>`
2. The server authenticates the student using the JWT token.
3. When a new notification is created for that student, the server pushes it through the WebSocket connection immediately.
4. The frontend receives the message and updates the UI without any page refresh.

**WebSocket Message Format (Server → Client):**
```json
{
  "event": "new_notification",
  "data": {
    "ID": "uuid",
    "Type": "Placement",
    "Message": "New placement drive announced",
    "Timestamp": "2026-04-22 18:05:00"
  }
}
```

---

## Stage 2

### Recommended Database: PostgreSQL

**Why PostgreSQL?**
- Notifications have a **fixed, structured schema** (ID, student_id, type, message, timestamp, isRead) — perfect for a relational database.
- PostgreSQL supports **ENUM types** natively, which fits our notification_type field.
- Strong **ACID compliance** ensures notifications are never lost or duplicated.
- Excellent support for **indexing, partitioning, and pagination** which we will need as data grows.
- Free, open-source, and widely used in production.

---

### Database Schema

```sql
-- Enum type for notification categories
CREATE TYPE notification_type AS ENUM ('Placement', 'Result', 'Event');

-- Students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  college_roll VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookup by student and read status
CREATE INDEX idx_student_unread ON notifications(student_id, is_read, created_at DESC);
```

---

### Problems as Data Volume Increases

| Problem | Cause | Solution |
|---|---|---|
| Slow queries | Full table scans on 5M+ rows | Add composite indexes |
| High DB load | Every page load hits DB | Add caching layer (Redis) |
| Large table size | Old notifications never deleted | Archive old data to cold storage |
| Write bottleneck | 50k notifications inserted at once | Use message queue (Redis/RabbitMQ) |

---

### SQL Queries Based on Stage 1 APIs

**1. Fetch all notifications for a student (paginated):**
```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

**2. Fetch single notification by ID:**
```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE id = $1 AND student_id = $2;
```

**3. Mark notification as read:**
```sql
UPDATE notifications
SET is_read = true
WHERE id = $1 AND student_id = $2;
```

**4. Create new notification:**
```sql
INSERT INTO notifications (student_id, notification_type, message)
VALUES ($1, $2, $3)
RETURNING id;
```

**5. Fetch top N priority notifications (sorted by type weight and recency):**
```sql
SELECT id, notification_type, message, is_read, created_at,
  CASE notification_type
    WHEN 'Placement' THEN 3
    WHEN 'Result' THEN 2
    WHEN 'Event' THEN 1
  END AS priority_weight
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY priority_weight DESC, created_at DESC
LIMIT $2;
```

---

## Stage 3

### Is the Given Query Accurate?

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

**Issues:**
1. `SELECT *` — Fetches all columns including large text fields. We should select only the fields we need.
2. **No index** on `(studentID, isRead, createdAt)` — With 50,000 students and 5,000,000 notifications, this causes a **full table scan** every time.
3. `ORDER BY createdAt ASC` — Oldest first. For a notification inbox, `DESC` (newest first) makes more sense for user experience.

---

### Why Is It Slow?

With 5,000,000 rows and no index, PostgreSQL must read **every single row** to find unread notifications for student 1042. This is O(n) — linear scan. At 5M rows, this is extremely slow.

**Computation cost without index:** O(5,000,000) rows scanned per query.

---

### Fixed Query

```sql
SELECT id, notification_type, message, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = false
ORDER BY created_at DESC;
```

**Index to add:**
```sql
CREATE INDEX idx_student_unread ON notifications(student_id, is_read, created_at DESC);
```

**With this index:** PostgreSQL can jump directly to student 1042's unread notifications without scanning the entire table. Cost drops from O(5M) to O(log n + k) where k is the number of results.

---

### Should We Index Every Column?

**No. This is bad advice.**

**Why indexing every column is harmful:**
- Every index takes up **extra disk space**.
- Every `INSERT`, `UPDATE`, or `DELETE` operation must **update all indexes** — this slows down writes significantly.
- For a notification system with high write volume (notifications being created frequently), over-indexing would make writes very slow.

**Rule of thumb:** Only index columns that appear in `WHERE`, `ORDER BY`, or `JOIN` clauses in frequently executed queries.

---

### Query: Students Who Got a Placement Notification in Last 7 Days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

**With an index to support this:**
```sql
CREATE INDEX idx_type_created ON notifications(notification_type, created_at DESC);
```

---

## Stage 4

### Problem
The DB is being hit on every single page load for every student. With 50,000 students, this causes thousands of DB queries per minute, overwhelming the database.

---

### Solutions and Tradeoffs

#### Solution 1: In-Memory Cache (Redis) ✅ Recommended

**How it works:**
- When a student's notifications are fetched, store the result in Redis with a key like `notifications:student:1042` and a TTL (Time To Live) of 60 seconds.
- On the next page load within 60 seconds, serve from Redis — no DB hit.
- When a new notification is created for that student, **invalidate** (delete) their cache key so the next request fetches fresh data.

**Tradeoffs:**
| Pros | Cons |
|---|---|
| Very fast reads (microseconds) | Slight staleness (up to TTL seconds) |
| Reduces DB load by 90%+ | Extra infrastructure (Redis server) |
| Scales well | Cache invalidation logic needed |

---

#### Solution 2: Pagination (Limit/Offset)

**How it works:** Never load all notifications at once. Only fetch what the user sees (e.g., 20 per page). Already supported by our API.

**Tradeoffs:**
| Pros | Cons |
|---|---|
| Simple to implement | DB still hit on every page change |
| Reduces data transferred | `OFFSET` becomes slow on very large pages |

---

#### Solution 3: Client-Side Caching (localStorage / sessionStorage)

**How it works:** Store the last API response in the browser. On page revisit, show cached data first, then refresh in background.

**Tradeoffs:**
| Pros | Cons |
|---|---|
| Zero server load on revisit | Stale data until refresh completes |
| Simple implementation | Only works for same browser session |

---

#### Best Combined Strategy
1. Use **Redis** to cache notifications server-side (60s TTL)
2. Use **pagination** to limit data per request (20 per page)
3. Use **client-side localStorage** to show cached data instantly on revisit
4. Use **WebSockets** (from Stage 1) to push new notifications in real-time and invalidate client cache immediately

---

## Stage 5

### Shortcomings of the Given Pseudocode

```
function notify_all(student_ids, message):
    for student_id in student_ids:
        send_email(student_id, message)   # calls Email API
        save_to_db(student_id, message)  # DB insert
        push_to_app(student_id, message) # real-time push
```

**Problems:**
1. **Sequential loop** — Processing 50,000 students one by one is extremely slow. If each call takes 100ms, this takes 5,000 seconds (~1.4 hours!).
2. **No error handling** — If `send_email` fails for student 200, the loop crashes and the remaining 49,800 students never get notified.
3. **No retry mechanism** — Failed emails are lost forever with no way to retry.
4. **All-or-nothing** — DB save and email are tightly coupled. If the email API is down, we stop saving to DB too, which is wrong.
5. **No concurrency** — No parallelism, no background processing.

---

### Should DB Save and Email Happen Together?

**No. They should be independent.**

- Saving to DB is fast and reliable (internal system).
- Sending email depends on an external Email API which can fail.
- **The DB save should always succeed**, even if the email fails.
- If we tie them together in one transaction, an email failure will roll back the DB save — students won't even see the notification in the app.

---

### Redesigned Approach: Message Queue

Use a **Message Queue** (e.g., Redis Queue, RabbitMQ, or AWS SQS) with multiple workers running in parallel.

**How it works:**
1. The `notify_all` function quickly pushes all 50,000 jobs into a queue (this takes seconds, not hours).
2. Multiple **worker processes** pick up jobs from the queue in parallel.
3. Each worker: first saves to DB (always), then sends email (best-effort).
4. If email fails → job goes to a **retry queue** with automatic retry (up to 3 times).
5. After 3 failures → job goes to a **dead-letter queue** for manual review.

---

### Revised Pseudocode

```
# PRODUCER (fast — runs immediately)
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        job_queue.push({ student_id, message })  # non-blocking, very fast
    log("All jobs queued successfully")

# WORKER (runs in parallel, multiple instances)
function worker():
    while true:
        job = job_queue.pop()  # blocks until a job is available

        # Step 1: Always save to DB first (reliable, internal)
        try:
            save_to_db(job.student_id, job.message)
        except DBError as e:
            log_error("DB save failed", e)
            dead_letter_queue.push(job)  # investigate manually
            continue  # move to next job

        # Step 2: Push real-time in-app notification
        try:
            push_to_app(job.student_id, job.message)
        except Exception as e:
            log_error("Push notification failed", e)  # non-critical, continue

        # Step 3: Send email (best-effort with retry)
        try:
            send_email(job.student_id, job.message)
        except EmailError as e:
            log_error("Email failed", e)
            retry_queue.push(job, max_retries=3)  # retry up to 3 times

# RETRY WORKER
function retry_worker():
    while true:
        job = retry_queue.pop()
        if job.retry_count >= 3:
            dead_letter_queue.push(job)
            alert_admin(job)  # notify admin of persistent failure
        else:
            try:
                send_email(job.student_id, job.message)
            except:
                job.retry_count += 1
                retry_queue.push(job)
```

---

## Stage 6

### Priority Inbox: Approach and Design

#### Problem
The campus notification platform generates a high volume of notifications. Students lose track of important ones. We need to always display the top N most important **unread** notifications first.

#### Priority Rules
- **Placement** → Weight 3 (highest)
- **Result** → Weight 2
- **Event** → Weight 1 (lowest)
- Among same weight → **More recent timestamp wins**

#### Data Structure: Min-Heap

I used a **Min-Heap** of fixed size N to maintain the top N priority notifications efficiently.

**Why Min-Heap?**
- A Min-Heap always keeps the **least important** item at the top (root).
- When a new notification arrives, we compare it with the root:
  - If new notification has higher priority → replace the root with it.
  - Otherwise → discard the new one.
- This gives us **O(log N)** time per insertion, regardless of how many total notifications exist.
- Space complexity is **O(N)** — we never store more than N items.

#### How It Handles Continuous Incoming Notifications

```
New notification arrives
        ↓
Is heap size < N?
   YES → push directly into heap
   NO  → compare with min element (root)
            New > Root? → heappushpop (insert new, remove root)
            New ≤ Root? → discard new notification
```

#### Time Complexity
- **Insertion:** O(log N) per notification
- **Retrieval:** O(N log N) — sort the heap once at display time
- **Space:** O(N) — constant regardless of total notification volume

#### Implementation
See `stage_6/priority_inbox.py` for the full working implementation.
The code fetches real notifications from the live API and outputs the top 10 sorted by priority.
