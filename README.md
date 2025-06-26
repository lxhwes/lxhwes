# Code Playground

Welcome to my interactive code laboratory. Here are some algorithms and patterns I find interesting:

## 🧮 Binary Search Visualization

```python
def binary_search(arr, target):
    """
    Visual representation of binary search algorithm
    Time: O(log n) | Space: O(1)
    """
    left, right = 0, len(arr) - 1
    
    print(f"Searching for: {target}")
    print(f"Array: {arr}")
    
    while left <= right:
        mid = (left + right) // 2
        spaces_left = " " * (mid * 3)
        spaces_right = " " * ((len(arr) - mid - 1) * 3)
        
        print(f"{' ' * (left * 3)}[{' '.join(map(str, arr[left:mid]))} "
              f"►{arr[mid]}◄ {' '.join(map(str, arr[mid+1:right+1]))}]")
        
        if arr[mid] == target:
            print(f"Found at index {mid}!")
            return mid
        elif arr[mid] < target:
            left = mid + 1
            print("Going right →")
        else:
            right = mid - 1
            print("Going left ←")
    
    return -1

# Example run:
# binary_search([1, 3, 5, 7, 9, 11, 13, 15], 7)
```

## 🌳 Trie Data Structure

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False
        
    def __repr__(self):
        return f"Node(children={list(self.children.keys())}, end={self.is_end})"

class Trie:
    """
    Prefix tree for efficient string operations
    Insert/Search: O(m) where m = word length
    """
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
    
    def visualize(self, node=None, prefix="", depth=0):
        if node is None:
            node = self.root
            print("Trie Structure:")
        
        if node.is_end:
            print("  " * depth + f"'{prefix}' ✓")
        
        for char, child in sorted(node.children.items()):
            print("  " * depth + f"├─ {char}")
            self.visualize(child, prefix + char, depth + 1)

# Example:
# trie = Trie()
# for word in ["cat", "car", "card", "care", "careful"]:
#     trie.insert(word)
# trie.visualize()
```

## 🔄 Consistent Hashing

```python
import hashlib
import bisect

class ConsistentHash:
    """
    Distributed hash table with minimal key redistribution
    Used in load balancing and distributed caching
    """
    def __init__(self, nodes=None, replicas=3):
        self.replicas = replicas
        self.ring = {}
        self.sorted_keys = []
        
        if nodes:
            for node in nodes:
                self.add_node(node)
    
    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)
    
    def add_node(self, node):
        for i in range(self.replicas):
            key = self._hash(f"{node}:{i}")
            self.ring[key] = node
            bisect.insort(self.sorted_keys, key)
    
    def get_node(self, key):
        if not self.ring:
            return None
        
        hash_key = self._hash(key)
        idx = bisect.bisect_right(self.sorted_keys, hash_key)
        
        if idx == len(self.sorted_keys):
            idx = 0
        
        return self.ring[self.sorted_keys[idx]]
    
    def visualize_distribution(self, keys):
        distribution = {}
        for key in keys:
            node = self.get_node(key)
            distribution[node] = distribution.get(node, 0) + 1
        
        print("Key Distribution:")
        for node, count in sorted(distribution.items()):
            bar = "█" * (count // 2)
            print(f"{node:10} │{bar} ({count})")

# Example usage with load balancing
```

## 🌐 WebSocket Connection Pool

```javascript
class WebSocketPool {
    /**
     * Connection pool manager for WebSocket connections
     * Handles reconnection, load balancing, and failover
     */
    constructor(urls, options = {}) {
        this.urls = urls;
        this.connections = new Map();
        this.activeConnections = [];
        this.options = {
            maxRetries: 3,
            retryDelay: 1000,
            heartbeatInterval: 30000,
            ...options
        };
        
        this.currentIndex = 0;
        this.init();
    }
    
    init() {
        this.urls.forEach((url, index) => {
            this.createConnection(url, index);
        });
    }
    
    createConnection(url, index) {
        const ws = new WebSocket(url);
        const connectionInfo = {
            ws,
            url,
            index,
            retries: 0,
            lastHeartbeat: Date.now()
        };
        
        ws.onopen = () => {
            console.log(`📡 Connected to ${url}`);
            this.connections.set(index, connectionInfo);
            this.activeConnections.push(connectionInfo);
            this.startHeartbeat(connectionInfo);
        };
        
        ws.onclose = () => {
            console.log(`📡 Disconnected from ${url}`);
            this.handleDisconnection(connectionInfo);
        };
        
        ws.onmessage = (event) => {
            this.handleMessage(event.data, connectionInfo);
        };
    }
    
    // Round-robin load balancing
    getNextConnection() {
        if (this.activeConnections.length === 0) {
            throw new Error('No active connections');
        }
        
        const connection = this.activeConnections[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.activeConnections.length;
        return connection;
    }
    
    send(data) {
        const connection = this.getNextConnection();
        connection.ws.send(JSON.stringify(data));
    }
    
    broadcast(data) {
        this.activeConnections.forEach(conn => {
            if (conn.ws.readyState === WebSocket.OPEN) {
                conn.ws.send(JSON.stringify(data));
            }
        });
    }
    
    visualizeConnections() {
        console.log('\n🔗 Connection Status:');
        this.connections.forEach((conn, index) => {
            const status = conn.ws.readyState === WebSocket.OPEN ? '🟢' : '🔴';
            const latency = Date.now() - conn.lastHeartbeat;
            console.log(`  ${status} ${conn.url} (${latency}ms)`);
        });
    }
}

// Usage example:
// const pool = new WebSocketPool([
//     'ws://server1.com/ws',
//     'ws://server2.com/ws', 
//     'ws://server3.com/ws'
// ]);
```

## 🔐 Rate Limiter Implementation

```python
import time
from collections import defaultdict, deque

class SlidingWindowRateLimiter:
    """
    Rate limiter using sliding window log algorithm
    Memory efficient with automatic cleanup
    """
    def __init__(self, max_requests=100, window_size=60):
        self.max_requests = max_requests
        self.window_size = window_size
        self.requests = defaultdict(deque)
        self.last_cleanup = time.time()
    
    def is_allowed(self, client_id):
        current_time = time.time()
        
        # Cleanup old entries periodically
        if current_time - self.last_cleanup > self.window_size:
            self._cleanup_old_entries(current_time)
            self.last_cleanup = current_time
        
        client_requests = self.requests[client_id]
        
        # Remove requests outside the window
        cutoff_time = current_time - self.window_size
        while client_requests and client_requests[0] < cutoff_time:
            client_requests.popleft()
        
        # Check if under limit
        if len(client_requests) < self.max_requests:
            client_requests.append(current_time)
            return True
        
        return False
    
    def get_reset_time(self, client_id):
        client_requests = self.requests[client_id]
        if not client_requests:
            return 0
        
        oldest_request = client_requests[0]
        return max(0, oldest_request + self.window_size - time.time())
    
    def visualize_usage(self, client_id):
        client_requests = self.requests[client_id]
        current_time = time.time()
        
        print(f"\n📊 Rate Limit Status for {client_id}:")
        print(f"Requests in window: {len(client_requests)}/{self.max_requests}")
        
        if client_requests:
            timeline = ["⚫"] * 60  # 60 second timeline
            for req_time in client_requests:
                pos = int((current_time - req_time))
                if 0 <= pos < 60:
                    timeline[59-pos] = "🔵"
            
            print("Timeline (last 60s): " + "".join(timeline))
            print("                     ^now")

# Example: API endpoint protection
# limiter = SlidingWindowRateLimiter(max_requests=10, window_size=60)
```

## 🎯 Current Experiments

- **Distributed Consensus**: Implementing Raft algorithm in Go
- **Event Sourcing**: Building audit-log system with PostgreSQL  
- **WebAssembly**: Compiling Rust algorithms for browser execution
- **Graph Algorithms**: Visualizing shortest path with D3.js

---

*Interactive examples above demonstrate practical algorithms and patterns I use in production systems.*