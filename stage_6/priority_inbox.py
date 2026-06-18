import heapq
import urllib.request
import json
from datetime import datetime

# ─────────────────────────────────────────
# Priority weights (Placement > Result > Event)
# ─────────────────────────────────────────
WEIGHTS = {
    "Placement": 3,
    "Result":    2,
    "Event":     1,
}

# ─────────────────────────────────────────
# Live API endpoint
# ─────────────────────────────────────────
API_URL = "http://4.224.186.213/evaluation-service/notifications"


def fetch_notifications(page=1, limit=20):
    """Fetch notifications from the live API."""
    url = f"{API_URL}?page={page}&limit={limit}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            # API returns { "notifications": [...] } OR a plain list
            if isinstance(data, list):
                return data
            return data.get("notifications", [])
    except Exception as e:
        print(f"[Warning] Could not fetch page {page}: {e}")
        return []


def get_all_notifications():
    """Fetch multiple pages to get enough notifications for prioritization."""
    all_notifications = []
    print("Fetching notifications from live API...")
    for page in range(1, 4):   # fetch pages 1, 2, 3 (up to 60 notifications)
        notifications = fetch_notifications(page=page, limit=20)
        if not notifications:
            break
        all_notifications.extend(notifications)
        print(f"  Page {page}: fetched {len(notifications)} notifications")
    print(f"Total fetched: {len(all_notifications)} notifications\n")
    return all_notifications


class PriorityInbox:
    """
    Maintains the top N highest-priority notifications using a Min-Heap.

    A Min-Heap of size N keeps the lowest-priority item at the root.
    When a new notification arrives:
      - If heap has room  → push directly
      - If heap is full   → compare with root; replace if new one is better
    This gives O(log N) per insertion and O(N) space.
    """

    def __init__(self, capacity=10):
        self.capacity = capacity
        self.heap = []          # Min-Heap: smallest priority at root
        self.counter = 0        # tie-breaker to avoid comparing dicts

    def add(self, notification):
        """Add a notification and maintain only top N."""
        type_  = notification.get("Type", "Event")
        ts_str = notification.get("Timestamp", "")

        weight = WEIGHTS.get(type_, 0)

        # Parse timestamp to a float for comparison
        try:
            ts = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S").timestamp()
        except ValueError:
            ts = 0.0

        # Heap entry: (weight, timestamp, counter, notification)
        # Python's heapq is a min-heap, so lower values are popped first.
        # We store positive weight/timestamp so the LOWEST priority is at root.
        entry = (weight, ts, self.counter, notification)
        self.counter += 1

        if len(self.heap) < self.capacity:
            heapq.heappush(self.heap, entry)
        else:
            # heappushpop: push new, then pop the smallest (lowest priority)
            heapq.heappushpop(self.heap, entry)

    def get_top(self):
        """Return notifications sorted highest priority first."""
        # Sort descending: highest weight first, then newest timestamp first
        sorted_items = sorted(self.heap, key=lambda x: (x[0], x[1]), reverse=True)
        return [item[3] for item in sorted_items]


def main():
    print("=" * 60)
    print("   CAMPUS NOTIFICATIONS — PRIORITY INBOX (Top 10)")
    print("=" * 60)
    print()

    # Step 1: Fetch from live API
    all_notifications = get_all_notifications()

    if not all_notifications:
        print("No notifications received from API. Using sample data for demo.\n")
        # Fallback sample data so the script still demonstrates correctly
        all_notifications = [
            {"ID": "a1", "Type": "Event",     "Message": "Annual Tech Fest",        "Timestamp": "2026-04-21 10:00:00"},
            {"ID": "a2", "Type": "Result",    "Message": "Semester 4 Results",      "Timestamp": "2026-04-21 11:30:00"},
            {"ID": "a3", "Type": "Placement", "Message": "Google campus visit",     "Timestamp": "2026-04-21 14:00:00"},
            {"ID": "a4", "Type": "Event",     "Message": "Blood Donation Drive",    "Timestamp": "2026-04-22 09:00:00"},
            {"ID": "a5", "Type": "Placement", "Message": "Amazon pre-placement",    "Timestamp": "2026-04-22 10:30:00"},
            {"ID": "a6", "Type": "Result",    "Message": "Project phase 1 grades",  "Timestamp": "2026-04-22 12:00:00"},
            {"ID": "a7", "Type": "Placement", "Message": "Microsoft coding round",  "Timestamp": "2026-04-22 13:00:00"},
            {"ID": "a8", "Type": "Event",     "Message": "Alumni meet",             "Timestamp": "2026-04-22 15:00:00"},
            {"ID": "a9", "Type": "Result",    "Message": "Mid-term marks updated",  "Timestamp": "2026-04-22 16:30:00"},
            {"ID": "b1", "Type": "Event",     "Message": "Library closed",          "Timestamp": "2026-04-22 17:00:00"},
            {"ID": "b2", "Type": "Placement", "Message": "Meta internship open",    "Timestamp": "2026-04-22 18:00:00"},
            {"ID": "b3", "Type": "Event",     "Message": "Guest lecture on AI",     "Timestamp": "2026-04-22 19:00:00"},
            {"ID": "b4", "Type": "Result",    "Message": "Assignment 3 evaluated",  "Timestamp": "2026-04-22 20:00:00"},
        ]

    # Step 2: Feed all notifications into the Priority Inbox
    inbox = PriorityInbox(capacity=10)
    for notif in all_notifications:
        inbox.add(notif)

    # Step 3: Display top 10
    top_10 = inbox.get_top()

    print(f"{'Rank':<5} {'Type':<12} {'Message':<40} {'Timestamp'}")
    print("-" * 80)
    for rank, notif in enumerate(top_10, start=1):
        type_   = notif.get("Type", "N/A")
        message = notif.get("Message", "N/A")
        ts      = notif.get("Timestamp", "N/A")
        print(f"{rank:<5} {type_:<12} {message:<40} {ts}")

    print("-" * 80)
    print(f"\nTotal notifications processed : {len(all_notifications)}")
    print(f"Priority Inbox capacity       : 10")
    print(f"Algorithm                     : Min-Heap  |  Insertion: O(log N)  |  Space: O(N)")
    print()
    print("Priority Rule: Placement (3) > Result (2) > Event (1), then newest first.")
    print("=" * 60)


if __name__ == "__main__":
    main()
