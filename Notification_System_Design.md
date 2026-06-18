# Stage 1

## Notification System Design: Priority Inbox

To address the challenge of users losing track of important notifications due to high volume, we have implemented a **Priority Inbox** mechanism. The goal is to always display the top $n$ (e.g., 10) most important unread notifications based on a combination of weight and recency.

### Priority Definition
Priority is determined by two factors:
1. **Weight (Category):**
   - `Placement` has the highest priority (Weight = 3)
   - `Result` has medium priority (Weight = 2)
   - `Event` has the lowest priority (Weight = 1)
2. **Recency:**
   - Among notifications with the *same* weight, the one with the most recent timestamp has a higher priority.

### Data Structure & Algorithm
Because notifications stream in continuously, sorting a massive array of all unread notifications every time a new one arrives would be highly inefficient $O(M \log M)$ where $M$ is the total number of notifications.

Instead, we use a **Min-Heap (Priority Queue)** of a fixed size $n$ (where $n=10$) to maintain the top notifications efficiently.

#### How it works:
1. **State:** We maintain a Min-Heap capped at size $10$.
2. **Insertion (New Notification Arrives):**
   - When a new notification arrives, we determine its priority tuple: `(weight, timestamp, unique_id, payload)`.
   - If the heap has fewer than 10 items, we simply push the new notification into the heap. Time complexity: $O(\log n)$.
   - If the heap already has 10 items, we push the new notification and immediately pop the smallest item (the one with the lowest priority). The `heapq.heappushpop()` operation does this efficiently in $O(\log n)$ time.
   - Because it's a Min-Heap, the "smallest" element at the root is always the notification with the lowest weight and oldest timestamp among the top 10. Thus, any incoming notification with a higher priority will displace the lowest-priority notification in the top 10.

#### Retrieval:
When the user opens the Priority Inbox, we simply extract the $n$ items from the heap and sort them in descending order to display the highest priority first. This takes $O(n \log n)$ time. Since $n$ is a small constant (e.g., 10), this retrieval is practically $O(1)$.

### Complexity Analysis
- **Time Complexity for insertion:** $O(\log n)$ per notification, where $n$ is the capacity of the priority inbox (e.g., 10). This means the system can handle a massive, continuous stream of notifications with near-instantaneous updates.
- **Space Complexity:** $O(n)$ where $n$ is the capacity, because we only ever store at most 10 items in memory at any given time, regardless of how many thousands of notifications have been processed.

This approach ensures that the top 10 notifications are maintained efficiently and correctly at all times without the need for expensive database queries or massive in-memory sorting operations.
