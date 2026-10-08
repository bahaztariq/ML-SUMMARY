export default {
  id: "apache-kafka",
  name: "Apache Kafka",
  track: "data-eng",
  category: "Streaming & Messaging",
  task: ["Streaming", "Event-Driven Architecture", "Ingestion"],
  difficulty: "Advanced",
  summary: "A distributed event streaming platform capable of handling trillions of events a day with low-latency append-only commit logs.",
  intuition: "The Central Nervous System: Producers publish events into partitioned conveyor belts (topics). Consumers read at their own pace without deleting the events.",
  whenToUse: "Real-time data ingestion, microservices decoupling, Change Data Capture (CDC), and feeding real-time ML feature pipelines.",
  whenToAvoid: "Simple synchronous request-response RPC, or when you just need a lightweight job queue with task acking (RabbitMQ or Redis may be simpler).",
  requirements: {
    realTime: true,
    highThroughput: true,
    durableStorage: true,
    orderedPerPartition: true
  },
  parameters: [
    {
      name: "partitions",
      type: "int",
      default: "1",
      impact: "Unit of parallelism within a topic.",
      tuningTip: "Kafka only guarantees strict message ordering within a single partition. More partitions allow more parallel consumer threads."
    },
    {
      name: "replication_factor",
      type: "int",
      default: "1",
      impact: "Number of broker copies storing the partition.",
      tuningTip: "Set to 3 in production across different failure zones for zero data loss."
    },
    {
      name: "acks",
      type: "string",
      default: "'all'",
      impact: "Number of acknowledgments producer requires before considering request complete.",
      tuningTip: "Use 'all' (or -1) with min.insync.replicas=2 for strict financial/audit durability."
    }
  ],
  math: {
    formula: "Throughput = Partitions × (Sequential Disk Write Speed: ~600 MB/s)",
    loss: "Zero-Copy Data Transfer (sendfile system call)",
    explanation: "Avoids copying data between kernel and user-space memory buffers, streaming data straight from the Linux OS page cache to network sockets via `sendfile()`."
  },
  pros: [
    "Insane throughput (millions of messages/sec) through sequential disk I/O and batching",
    "Consumers are fully decoupled and can replay past historical events by rewinding offsets",
    "Built-in fault tolerance and multi-datacenter replication"
  ],
  cons: [
    "Operational overhead (broker management, ZooKeeper / KRaft quorum)",
    "Strict message ordering is ONLY guaranteed within the same partition, not across topics"
  ],
  prerequisites: ["what-is-de", "batch-vs-stream"],
  related: ["cdc", "apache-spark", "feature-store", "lakehouse-architecture"],
  diagram: `flowchart LR
  subgraph topic["Topic: user-events"]
    t0[("Partition 0: append-only log")]
    t1[("Partition 1: append-only log")]
  end
  p1["Producer A"] -->|"key hash"| t0
  p2["Producer B"] -->|"key hash"| t1
  t0 -->|"replicated to followers"| rep["Broker replicas (RF=3)"]
  t0 --> c1["Consumer 1 (group: fraud)"]
  t1 --> c2["Consumer 2 (group: fraud)"]
  t0 --> c3["Consumer (group: analytics)"]
  t1 --> c3
  c1 --> off["Commit offsets"]
  c3 -.->|"rewind offset to replay"| t0`,
  codeSnippet: `from confluent_kafka import Producer, Consumer
import json

# Producer Setup
p = Producer({'bootstrap.servers': 'localhost:9092'})
event = {'user': 'alice', 'action': 'checkout', 'amount': 149.99}

p.produce('user-events', key='alice', value=json.dumps(event))
p.flush()

# Consumer reading streaming events
c = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'fraud-detection-service',
    'auto.offset.reset': 'earliest'
})
c.subscribe(['user-events'])`
};
