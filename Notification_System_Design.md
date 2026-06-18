# Notification System Design (Stages 1-6)

## Stage 1

Here is my REST API design to show notifications to logged-in students. The core actions are getting all notifications, getting priority ones, and marking them as read.

**1. Get all notifications (with pagination)**
- **Endpoint:** `GET /notifications?limit=20&page=1&notification_type=Placement`
- **Headers:** `{ "Authorization": "Bearer token" }`
- **Response:**
```json
{
  "notifications": [
    {
      "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "Type": "Result",
      "Message": "mid-sem results are out",
      "Timestamp": "2026-04-22 17:51:30"
    }
  ]
}
```

**2. Get priority notifications**
- **Endpoint:** `GET /notifications/priority?top=10`
- **Headers:** `{ "Authorization": "Bearer token" }`
- **Response:** Same JSON format as above.

**3. Mark as read**
- **Endpoint:** `PATCH /notifications/:id/read`
- **Headers:** `{ "Authorization": "Bearer token" }`
- **Response:** `{ "status": "success" }`

**Real-time notifications mechanism:**
I will use WebSockets for real-time notifications. When the student logs in, the React frontend opens a WebSocket connection to the server. If the college posts a new Placement or Event, the server instantly pushes the JSON data through the WebSocket so the UI updates without needing to refresh the page.

---

## Stage 2

**Database Choice:** PostgreSQL
**Why:** Notifications have a fixed structure (ID, type, message, timestamp), so a relational database works perfectly. PostgreSQL is reliable and great for writing structured queries.

**DB Schema:**
```sql
CREATE TABLE notifications (
  id VARCHAR(50) PRIMARY KEY,
  student_id INT,
  type VARCHAR(20), -- Placement, Result, Event
  message TEXT,
  timestamp TIMESTAMP,
  is_read BOOLEAN DEFAULT false
);
```

**Problems with data volume and solutions:**
When the table hits millions of rows, fetching notifications will become very slow because the database has to scan the whole table (full table scan). 
To solve this, I would:
1. Add Indexes on `student_id` and `is_read` so we can quickly find a student's unread messages.
2. Delete or archive very old notifications (like older than 1 year) so the table doesn't get too heavy.

---

## Stage 3

**Is the given query accurate?**
The query works but it is bad for performance. `SELECT *` grabs every single column which wastes memory. It also sorts by oldest first (`createdAt ASC`), but users usually want to see their newest notifications first.

**Why is it slow?**
Because there are 5,000,000 rows and no index. The database has to check every single row one by one to see if `studentID = 1042`.

**What I would change:**
I would change the query to fetch only what's needed and sort by newest first:
```sql
SELECT id, type, message, timestamp 
FROM notifications 
WHERE student_id = 1042 AND is_read = false 
ORDER BY timestamp DESC;
```
Then, I would add a composite index on `(student_id, is_read)` to make the lookup very fast. The cost drops from scanning 5 million rows to just looking up a few rows in an index tree.

**Should we index every column?**
No, that's bad advice. Indexes take up extra hard drive space. Also, every time a new notification is inserted, the database has to update all those indexes, which makes writing data very slow.

**Query for placement notifications in the last 7 days:**
```sql
SELECT DISTINCT student_id 
FROM notifications 
WHERE type = 'Placement' 
AND timestamp >= NOW() - INTERVAL 7 DAY;
```

---

## Stage 4

**Solution for overwhelmed database:**
If the database is crashing because of too many page loads, I suggest using an In-Memory Cache like Redis.

**How it works:**
When a student opens the app, we fetch their notifications from PostgreSQL and save a copy in Redis for 60 seconds. If they reload the page 5 times in that minute, we just return the data from Redis. The database is not hit at all. 

**Tradeoffs:**
- **Pros:** Redis reads data from RAM so it's incredibly fast. The database load will drop massively.
- **Cons:** If a new notification arrives within that 60 seconds, the student won't see it until the cache expires, meaning the data might be slightly stale. We also have to manage an extra server for Redis.

---

## Stage 5

**Shortcomings of the given pseudocode:**
1. **It is sequential and blocks:** It loops through 50,000 students one by one. If sending one email takes 0.5 seconds, the loop will take 7 hours to finish!
2. **If it fails, it breaks completely:** If the email API crashes at student 200, the program throws an error and the remaining 49,800 students get nothing.
3. **Saving to DB and Emailing are coupled:** The email API might be down, but our database is fine. We shouldn't stop saving notifications to our DB just because the email failed.

**Redesign for speed and reliability:**
I will use a Message Queue (like RabbitMQ or Redis Queue) and background workers. 

1. The `notify_all` function just pushes 50,000 job tickets into the queue. This takes a few seconds.
2. We run multiple "Workers" in the background that pull jobs from the queue in parallel.
3. The DB save happens first because it's reliable. Then the email is attempted. If the email fails, we put the job back in a "retry queue" to try again later without crashing the whole process.

**Revised Pseudocode:**
```python
function notify_all(student_ids, message):
    # Just push to a background queue instantly
    for student_id in student_ids:
        job_queue.push({ "id": student_id, "msg": message })

# Background worker running in parallel
function worker():
    while True:
        job = job_queue.pop()
        
        # Always save to our database first
        save_to_db(job.id, job.msg)
        push_to_app(job.id, job.msg)
        
        # Then try external email
        try:
            send_email(job.id, job.msg)
        except Exception:
            retry_queue.push(job) # Try again later if email fails
```

---

## Stage 6

**Priority Inbox Explanation:**

To show the top 10 most important notifications efficiently, I wrote a Python script (`stage_6/priority_inbox.py`) that uses a **Min-Heap** data structure. 

**Why Min-Heap?**
If a new notification comes in, we need to know if it belongs in the top 10. If we just sort a giant list every time, it takes `O(N log N)` which is slow.
With a Min-Heap of size 10, the lowest priority notification is always kept at the very top. 

When a new notification arrives:
1. I calculate its weight (Placement=3, Result=2, Event=1).
2. I compare it to the top of the Min-Heap.
3. If it is more important, I pop the old one out and push the new one in.

This takes `O(log 10)` time per insertion, which is basically instant, no matter how many thousands of notifications keep coming in. The memory used is only `O(10)` because we only store the top 10 items at any time.

*Note: The actual Python code and screenshots for this stage are saved in the `stage_6` folder.*
