# H3lium: Autonomous AI Agent Role & Intent Security Console

> **"Allowed is not the same as appropriate."**
> Conventional security tools verify whether an autonomous AI agent's credentials or API badges are valid. H3lium continuously checks whether each specific action fits the agent's declared role and assigned task across the multi-agent chain, responding with the minimal required containment.

---

## Simulation Engine Approach

H3lium runs on a deterministic, seeded, in-browser simulation engine with zero external backend dependencies. Every metric, chart, graph, and alert is computed in real time from simulated agent events evaluated across eight parallel anomaly detectors: **Role Compliance**, **Statistical Baseline (Z-score)**, **Markov Sequence Model**, **Taint & Intent Check**, **Peer Comparison**, **Chain & Graph Lineage**, **Long-Window Drift (CUSUM/EWMA)**, and **Honeytoken Canary Tripwires**. Risk scores are dynamically boosted upon taint co-occurrence, adjusted by agent trust coefficients, and mapped onto a graduated 4-tier Response Ladder (Observe → Step-Up → Restrict / Safe Mode → Isolate). The application displays an honest notice ("Simulation mode: no real agents connected") while faithfully executing the exact detection algorithms and cryptographic SHA-256 hash chaining of an enterprise gateway.

---

## Key Features & Capabilities

1. **Overview Dashboard**:
   - Live computed KPIs: Agents Monitored, Active Alerts, Actions Blocked, Fleet Trust Score, and Mean Time-To-Contain (MTTC).
   - Real-time agent event stream with live filters (agent, decision, risk score).
   - Sequential risk score telemetry charts and detector fire frequency breakdowns.

2. **Agents Directory**:
   - 8 autonomous agent profiles (Procurement, Research, Web Browsing, HR, Finance, Support, Code Review, Scheduler).
   - Real-time trust scores with 12-event sparklines.
   - Interactive Agent Inspector with SVG Radar Chart (Observed vs Golden Baseline) and containment controls (Safe Mode, Isolate, Rotate Credentials, Purge Context, Reassign Work).

3. **Attack Lab Simulator**:
   - 6 Interactive threat scenarios:
     1. *Indirect Prompt Injection via Supplier PDF*
     2. *Data Exfiltration to Unknown Domain*
     3. *Slow Low-and-Slow Behavioral Creep (CUSUM Drift)*
     4. *Multi-Agent Chain Taint Propagation*
     5. *Honeytoken Decoy Touch*
     6. *Legitimate Authorized Change (Grace Window)*
   - Master **"Protection ON / OFF"** toggle: Witness the live difference between prompt injection succeeding (data exfiltration, unauthorized payroll reads) versus immediate containment.
   - Animated 6-stage evaluation pipeline strip with stage-by-stage decision illumination.

4. **Alerts & Explainability**:
   - Radial animated risk gauge and weighted factor contribution breakdown.
   - Root ingestion vector identification, baseline comparison, blast-radius listing, and interactive timeline scrubber.
   - "Mark False Positive" workflow that recalibrates detector weights downwards and logs the adjustment delta.

5. **Human-in-the-Loop Approval Queue**:
   - Gated review for medium-risk actions with SLA countdown badges and real resume/drop execution.

6. **Chain & Provenance Graph**:
   - Interactive SVG canvas with zoom, pan, and node inspector.
   - One-click "Trace to Root Cause" and "Highlight Blast Radius" filters.
   - Live "Quarantine Source Document" toggle severing trust edges.

7. **Policy Gateway & Manifest Editor**:
   - Live YAML manifest preview reflecting instant form edits.
   - Sliders for the 3 response ladder thresholds with real-time "What would have happened to the last events" re-calculation.
   - Sliders for each of the 8 detector weights.
   - "Register Authorized Change" CAB form granting temporary grace windows.
   - Honeytoken canary and session-key gating controls.

8. **Cryptographic Hash-Chained Audit Ledger**:
   - Browser Web Crypto API SHA-256 hash chaining on every state change.
   - "Verify Integrity" button calculating consensus across all blocks.
   - "Simulate Tampering" button modifying a historical record to demonstrate chain failure detection.
   - "Export as JSON" and "Export as CSV" file downloads.

9. **Production Architecture & System Topology**:
   - Interactive system map detailing the distributed enterprise architecture (FastAPI, Redis Streams, Ray Clusters, Temporal.io, ImmuDB).

10. **Benchmark Test Results (Scorecard)**:
    - Back-to-back automated execution of all 6 scenarios calculating detection rate (100%), false positive count (0), and MTTC latency.

11. **Guided Incident Walkthrough**:
    - Step-by-step guided story narrating the indirect prompt injection containment sequence across real screens.

12. **Global Utilities**:
    - Command Palette (`Cmd+K` / `Ctrl+K`).
    - Toast notifications with action undo.
    - Dark / Light mode toggle.
    - Simulation speed control (0.5x, 1x, 2x, 4x).

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```
