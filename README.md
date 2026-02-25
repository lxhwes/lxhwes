```typescript
// node.ts -- a minimal service mesh primitive

export interface Node<T = unknown> {
  readonly id: string;
  readonly addr: string;
  readonly joined: number;
  heartbeat(): Promise<number>;
  send<M>(peer: Node, msg: Message<M>): Promise<Ack>;
}

export type Message<T> = {
  readonly kind: string;
  readonly payload: T;
  readonly ts: number;
  readonly ttl: number;
};

export type Ack = { received: number; latency: number };

/**
 * Consistency modes for distributed reads.
 * Default to eventual -- strong only when you prove you need it.
 */
export type Consistency = "eventual" | "session" | "strong";

export interface ClusterConfig {
  readonly name: string;
  readonly seeds: string[];
  readonly consistency: Consistency;
  readonly heartbeatMs: number;
  readonly maxPeers: number;
  readonly gossipFanout: number;

  // The simplest thing that could possibly work.
  // Add complexity only when the failure mode demands it.
  readonly failureDetector: "phi-accrual";
}

const defaults: ClusterConfig = {
  name: "howes.dev",
  seeds: ["tcp://0.0.0.0:9400"],
  consistency: "eventual",
  heartbeatMs: 1000,
  maxPeers: 128,
  gossipFanout: 3,
  failureDetector: "phi-accrual",
};

/**
 * A reliable abstraction is worth more than a clever optimization.
 */
export function createCluster(
  overrides: Partial<ClusterConfig> = {}
): ClusterConfig {
  return { ...defaults, ...overrides };
}
```

---

<sub>Alex Howes -- alex@howes.dev</sub>
