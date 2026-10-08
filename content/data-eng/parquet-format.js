export default {
  id: "parquet-format",
  name: "Apache Parquet vs CSV / JSON",
  track: "data-eng",
  category: "Storage & File Formats",
  task: ["Data Storage", "OLAP", "Big Data"],
  difficulty: "Beginner",
  summary: "An open-source, columnar storage format optimized for analytical queries (OLAP) with built-in compression and metadata stats.",
  intuition: "Spreadsheet Slicing: CSV stores row-by-row (reading 1 column requires scanning every single byte on disk). Parquet stores column-by-column, so queries only read the exact columns requested.",
  whenToUse: "The absolute standard storage format for data lakes (AWS S3, GCP Cloud Storage), Spark, DuckDB, Snowflake, BigQuery, and ML training sets.",
  whenToAvoid: "Transactional OLTP workloads where individual rows are frequently inserted, updated, or deleted one at a time (use PostgreSQL or MySQL).",
  requirements: {
    readOptimized: true,
    writeOptimized: false,
    supportsCompression: true,
    schemaEvolution: true
  },
  parameters: [
    {
      name: "compression",
      type: "string",
      default: "'SNAPPY'",
      impact: "Block-level compression algorithm.",
      tuningTip: "'SNAPPY' provides ultra-fast decompression for interactive queries; 'ZSTD' gives higher compression ratio for archiving."
    },
    {
      name: "row_group_size",
      type: "int (bytes)",
      default: "128 MB",
      impact: "Size of chunked rows written together.",
      tuningTip: "128MB to 512MB is standard for distributed systems like Spark to match HDFS/cloud block sizes."
    }
  ],
  math: {
    formula: "I/O Reduction = ∑ (Query Columns Size) / ∑ (Total Table Columns Size)",
    loss: "Column Projection & Predicate Pushdown",
    explanation: "Includes footer metadata containing min/max values for every column chunk. When a query contains `WHERE age > 65`, queries instantly skip entire 128MB row groups without reading them."
  },
  pros: [
    "Reduces cloud storage costs by up to 75-90% compared to raw CSV/JSON",
    "10x to 100x faster query execution through column projection and dictionary encoding",
    "Strict schema enforcement prevents silent data corruption"
  ],
  cons: [
    "Binary format (cannot be opened directly in a regular text editor)",
    "Append-only; updating or mutating existing rows requires rewriting the entire file"
  ],
  prerequisites: ["what-is-de"],
  related: ["data-partitioning", "warehouse-vs-lake", "lakehouse-architecture", "oltp-vs-olap"],
  diagram: `flowchart LR
  df["Table: rows × columns"] --> rg["Split into row groups (~128 MB)"]
  rg --> cc["Store each column as a column chunk"]
  cc --> enc["Dictionary + RLE encoding"]
  enc --> comp["Snappy / ZSTD compression"]
  comp --> foot["Footer: schema + min/max stats"]
  q["Query: SELECT revenue WHERE age ≥ 65"] --> foot
  foot --> skip{"Row group stats match?"}
  skip -->|"no"| sk["Skip row group"]
  skip -->|"yes"| proj["Read only revenue + age chunks"]`,
  codeSnippet: `import duckdb
import pandas as pd

# Write DataFrame to snappy compressed parquet
df = pd.DataFrame({'user_id': range(100000), 'revenue': [99.5] * 100000})
df.to_parquet('analytics.parquet', compression='snappy', index=False)

# Query column directly without loading full file into memory
con = duckdb.connect()
res = con.execute("SELECT AVG(revenue) FROM 'analytics.parquet' WHERE user_id > 50000").df()`
};
