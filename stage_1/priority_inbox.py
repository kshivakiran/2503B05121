import heapq
import time
import uuid

class PriorityInbox:
    def __init__(self, capacity=10):
        """
        Initializes the Priority Inbox using a Min-Heap.
        A Min-Heap of size N allows us to efficiently maintain the top N highest-priority items.
        Insertion is O(log N).
        """
        self.capacity = capacity
        self.heap = []
        
        # Priority weights as per requirements: Placement > Result > Event
        self.weights = {
            "Placement": 3,
            "Result": 2,
            "Event": 1
        }
        
    def add_notification(self, type_, message, timestamp_str=None):
        """
        Adds a notification to the priority inbox.
        Priority is determined by (Weight, Timestamp).
        """
        if not timestamp_str:
            # If no timestamp provided, use current time
            # For exact parsing, we could use datetime.strptime, 
            # but for sorting, unix timestamps (floats) or ISO strings work well.
            timestamp = time.time()
        else:
            # Convert string timestamp to a sortable format (float/int)
            # Assuming format like "2026-04-22 17:50:42"
            try:
                struct_time = time.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
                timestamp = time.mktime(struct_time)
            except ValueError:
                timestamp = time.time() # fallback
            
        weight = self.weights.get(type_, 0)
        notif_id = str(uuid.uuid4())
        
        # Heap tuple structure: (weight, timestamp, notif_id, payload)
        # Python compares tuples element-by-element.
        # Since we use a Min-Heap, the smallest element is at the root.
        # The smallest element will be the one with the lowest weight, 
        # and if weights are equal, the lowest timestamp (oldest).
        entry = (weight, timestamp, notif_id, {
            "ID": notif_id,
            "Type": type_, 
            "Message": message, 
            "Timestamp": timestamp_str or time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(timestamp))
        })
        
        if len(self.heap) < self.capacity:
            heapq.heappush(self.heap, entry)
        else:
            # heappushpop pushes the new item and then pops and returns the smallest item.
            # This perfectly drops the lowest-priority notification from our top N.
            heapq.heappushpop(self.heap, entry)

    def get_top_notifications(self):
        """
        Returns the top notifications sorted by priority (Highest first).
        Retrieval is O(N log N) where N is the capacity.
        """
        # Sort the heap descending to get highest weight and newest timestamp first
        sorted_notifications = sorted(self.heap, key=lambda x: (x[0], x[1]), reverse=True)
        return [item[3] for item in sorted_notifications]


if __name__ == "__main__":
    print("=====================================================")
    print("Initializing Priority Inbox with capacity = 10")
    print("=====================================================")
    inbox = PriorityInbox(capacity=10)
    
    # Simulating an incoming stream of notifications (more than 10)
    incoming_notifications = [
        ("Event", "Annual Tech Fest announced", "2026-04-21 10:00:00"),
        ("Result", "Semester 4 Results out", "2026-04-21 11:30:00"),
        ("Placement", "Google visiting campus next week", "2026-04-21 14:00:00"),
        ("Event", "Blood Donation Drive", "2026-04-22 09:00:00"),
        ("Placement", "Amazon pre-placement talk", "2026-04-22 10:30:00"),
        ("Result", "Project phase 1 grades", "2026-04-22 12:00:00"),
        ("Placement", "Microsoft coding round", "2026-04-22 13:00:00"),
        ("Event", "Alumni meet", "2026-04-22 15:00:00"),
        ("Result", "Mid-term marks updated", "2026-04-22 16:30:00"),
        ("Event", "Library closed for maintenance", "2026-04-22 17:00:00"),
        ("Placement", "Meta internship applications open", "2026-04-22 18:00:00"),
        ("Event", "Guest lecture on AI", "2026-04-22 19:00:00"),
        ("Result", "Assignment 3 evaluation", "2026-04-22 20:00:00")
    ]
    
    print("\nSimulating receiving 13 notifications...")
    for n_type, msg, ts in incoming_notifications:
        inbox.add_notification(n_type, msg, ts)
        print(f"Received: [{n_type}] {msg} at {ts}")
        
    print("\n=====================================================")
    print("Current Top 10 Priority Notifications (Computed in Real-time):")
    print("=====================================================")
    
    top_10 = inbox.get_top_notifications()
    for idx, notif in enumerate(top_10, 1):
        print(f"{idx}. [{notif['Type'].upper()}] - {notif['Message']} (Received: {notif['Timestamp']})")
    
    print("=====================================================")
    print("Notice how 'Event' notifications are pushed out of the top 10")
    print("and 'Placement' notifications appear at the top, sorted by recency.")
