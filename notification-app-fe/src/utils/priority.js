export class PriorityInbox {
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.items = []; // Sorted descending (highest priority at index 0)
    this.weights = {
      Placement: 3,
      Result: 2,
      Event: 1,
    };
  }

  addNotification(notification) {
    const weight = this.weights[notification.Type] || 0;
    const timestamp = new Date(notification.Timestamp).getTime() || Date.now();
    const entry = { weight, timestamp, data: notification };

    // Insert while maintaining sorted order (highest weight/timestamp first)
    const insertIndex = this.items.findIndex(
      (item) =>
        item.weight < entry.weight ||
        (item.weight === entry.weight && item.timestamp < entry.timestamp)
    );

    if (insertIndex === -1) {
      if (this.items.length < this.capacity) {
        this.items.push(entry);
      }
    } else {
      this.items.splice(insertIndex, 0, entry);
      if (this.items.length > this.capacity) {
        this.items.pop(); // Remove the lowest priority item
      }
    }
  }

  getTopNotifications() {
    return this.items.map((item) => item.data);
  }
}
