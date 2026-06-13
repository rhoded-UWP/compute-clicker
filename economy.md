# Scale or Die AI — Economy Design

## Overview

**Scale or Die AI** is an incremental/clicker game inspired by Cookie Clicker, but focused on teaching introductory computer science vocabulary and computing scale. The player begins by manually clicking a keyboard to generate code. Code earns money. Money buys better hardware, faster memory, larger storage, GPUs, servers, racks, and eventually full-scale AI data centers.

The educational goal is to indirectly teach concepts such as:

- Bytes, kilobytes, megabytes, gigabytes, terabytes, petabytes, and exabytes
- RAM versus storage versus VRAM
- CPU clock speed, cores, and parallelism
- GPU acceleration and AI workloads
- Servers, racks, clusters, and data centers
- Cooling, power usage, megawatts, and gigawatts
- Bottlenecks and tradeoffs in real computing systems

The tone should be playful, but the systems should feel authentic enough that students build useful intuition.

---

## Core Fantasy

The player starts as a student tapping a keyboard to produce tiny programs. Code earns money. Money buys better hardware. Better hardware produces more code, trains larger models, unlocks bigger storage vocabulary, and eventually turns into an AI infrastructure empire.

Main score:

```text
Compute Coins = Code Output x Compute Multiplier x Market Value
```

Visible educational stats:

```text
Storage: KB -> MB -> GB -> TB -> PB -> EB
RAM: MB -> GB -> TB
Speed: Hz -> MHz -> GHz -> TFLOPS -> PFLOPS
Scale: laptop -> workstation -> server rack -> data center -> hyperscale AI campus
Power: watts -> kilowatts -> megawatts -> gigawatts
```

---

## Main Resources

| Resource | What It Teaches | Early Game | Late Game |
|---|---:|---:|---:|
| Code Lines | Output and automation | Lines of code | Generated apps and models |
| Storage | KB, MB, GB, TB, PB | Save files | Massive datasets |
| RAM | Active working memory | 4 MB, 16 MB, 64 MB | 512 GB, 1 TB, 8 TB |
| Compute | Processing speed | Keystrokes/sec | TFLOPS, PFLOPS |

The player earns money from code, but **RAM and storage should limit what jobs they can run**. This keeps the units meaningful instead of decorative.

Example unlock requirements:

```text
Can run "Hello World":
Needs 1 KB storage, 1 MB RAM

Can run "Image Classifier":
Needs 10 GB storage, 8 GB RAM, GPU

Can train "Tiny Language Model":
Needs 500 GB storage, 128 GB RAM, 1 GPU

Can train "CampusGPT":
Needs 50 TB storage, 2 TB RAM, GPU cluster
```

---

## Core Earning Formula

A simple version:

```text
coins_per_second =
base_code_rate
x click_multiplier
x cpu_multiplier
x memory_multiplier
x gpu_multiplier
x automation_multiplier
x project_value
```

Where:

```text
base_code_rate = manual_clicks_per_second + auto_code_per_second
```

A strong first implementation:

```text
coins_per_second = code_per_second x project_value x efficiency
```

And:

```text
efficiency = min(1, RAM_available / RAM_required)
           x min(1, storage_available / storage_required)
           x cooling_factor
           x power_factor
```

This is useful pedagogically because students learn that a faster CPU does not help much if RAM, storage, cooling, or power becomes the bottleneck.

---

## Upgrade Cost Formula

Use exponential scaling similar to Cookie Clicker:

```text
next_cost = base_cost x growth_rate ^ owned
```

Suggested growth rates:

| Upgrade Type | Growth Rate | Reason |
|---|---:|---|
| Keyboard/click upgrades | 1.12 | Cheap, satisfying early |
| CPU upgrades | 1.17 | Main progression |
| RAM upgrades | 1.20 | Bottleneck control |
| Storage upgrades | 1.18 | Dataset gates |
| GPU upgrades | 1.25 | Powerful and expensive |
| Server racks | 1.30 | Major milestone |
| Data centers | 1.40 | Late-game scaling |

Example:

```text
RAM Stick cost = 50 x 1.20 ^ number_owned
```

The first few are affordable, but scaling gets serious.

---

## Hardware Progression Levels

### Level 1: Keyboard Basement

Theme: The player manually types code.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| Mechanical Keyboard | +1 code/click | input device |
| Syntax Highlighting | +10% code value | IDE |
| Copy/Paste | +1 auto code/sec | automation |
| Rubber Duck Debugger | +5% efficiency | debugging |

Unlocks:

- Bytes
- Kilobytes
- Source files

Flavor text:

> Your first program fits in a few kilobytes. It is mostly semicolons and optimism.

---

### Level 2: Dorm Room PC

Theme: Basic personal computer.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| 8-bit CPU | +2 code/sec | CPU, clock cycle |
| 64 KB RAM | Unlocks bigger programs | RAM |
| 1 MB Disk | Stores more projects | storage |
| Compiler | x2 project value | compilation |

Unlocks:

- KB to MB
- RAM limits
- CPU speed

Example display:

```text
Current CPU: 4 MHz
Current RAM: 64 KB
Current Storage: 1 MB
```

---

### Level 3: Lab Workstation

Theme: A real CS student machine.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| Multi-core CPU | +25% per core | cores, threads |
| 16 GB RAM | Unlocks datasets | gigabyte |
| SSD Upgrade | +15% load speed | solid-state drive |
| Unit Tests | +10% reliability | testing |

Unlocks:

- Gigabytes
- GHz
- Multicore processing

Formula:

```text
cpu_multiplier = cores x clock_speed_GHz x architecture_bonus
```

Example:

```text
4 cores x 3.2 GHz x 1.0 = 12.8 compute units
```

---

### Level 4: First GPU

Theme: The player discovers parallel processing.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| Entry GPU | Unlocks graphics jobs | GPU |
| CUDA-ish Toolkit | x2 GPU output | parallelism |
| VRAM Upgrade | Supports larger models | VRAM |
| Matrix Multiplier | Boosts AI jobs | tensors |

Teaching distinction:

```text
RAM = system working memory
VRAM = GPU working memory
Storage = long-term saved data
```

This distinction is important because students often confuse RAM, storage, and GPU memory.

---

### Level 5: Server Closet

Theme: One machine is no longer enough.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| First Server | +100 code/sec | server |
| 64 GB ECC RAM | Fewer crashes | ECC memory |
| RAID Storage | Storage multiplier | redundancy |
| Ethernet Switch | Server synergy | networking |
| UPS Battery | Prevents outage losses | uptime |

Unlocks:

- Terabytes
- Server uptime
- Networking

Formula:

```text
server_output = server_count x average_compute x uptime
```

Where:

```text
uptime = 0.95 + reliability_upgrades
```

Cap uptime around `0.999` or `0.9999` to introduce "three nines" and "four nines."

---

### Level 6: Server Rack

Theme: Hardware now comes in racks.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| 42U Rack | Unlocks rack slots | rack unit |
| Rack-mounted Servers | +compute | cluster |
| Top-of-rack Switch | Boosts networking | bandwidth |
| Hot Aisle/Cold Aisle | Cooling bonus | airflow |
| Fiber Uplink | Data transfer bonus | latency |

Unlocks:

- 10 TB
- 100 TB
- Bandwidth
- Latency

Rack capacity mechanic:

```text
rack_capacity = 42 units
server_size = 2U
max_servers_per_rack = 21
```

This teaches that computing systems are physically constrained.

---

### Level 7: Mini Data Center

Theme: Compute becomes infrastructure.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| Cooling System | Reduces heat penalty | cooling |
| Power Distribution Unit | Supports more racks | PDU |
| Backup Generator | Improves uptime | redundancy |
| Petabyte Storage Array | Unlocks large AI jobs | petabyte |
| GPU Cluster | Huge AI multiplier | cluster computing |

Unlocks:

- Petabytes
- Megawatts
- Clusters

Power formula:

```text
power_required_kW =
servers x server_kW
+ GPUs x gpu_kW
+ cooling_kW
```

Cooling formula:

```text
cooling_kW = IT_power_kW x cooling_ratio
```

Early cooling ratio might be `0.8`. Later upgrades reduce it to `0.3` or `0.2`.

---

### Level 8: AI Training Facility

Theme: The player trains increasingly ambitious models.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| HBM Memory GPUs | Boosts AI jobs | high-bandwidth memory |
| Model Parallelism | Lets huge models fit | distributed computing |
| Checkpoint Storage | Prevents training loss | checkpoint |
| Dataset Pipeline | Increases project value | data pipeline |
| Liquid Cooling | Improves power efficiency | thermal design |

Unlocks:

- TFLOPS
- PFLOPS
- HBM
- AI accelerators

AI job formula:

```text
training_value =
dataset_size_TB x model_size_billions x gpu_compute_TFLOPS x efficiency
```

This does not need to be scientifically exact. It needs to teach that larger models need more data, more memory, more compute, more power, and more money.

---

### Level 9: Hyperscale Data Center

Theme: The limiting factor is electricity.

| Purchase | Effect | Vocabulary |
|---|---:|---|
| Substation | Unlocks megawatt scaling | electrical grid |
| Water-efficient Cooling | Reduces cooling cost | sustainability |
| 100,000 GPU Campus | Massive multiplier | hyperscale |
| Regional Fiber Ring | Boosts data movement | backbone network |
| Power Purchase Agreement | Lowers energy cost | PPA |

Unlocks:

- Megawatts to gigawatts
- Exabytes
- Grid planning

Late-game formula:

```text
net_profit =
compute_revenue
- electricity_cost
- cooling_cost
- maintenance_cost
```

Electricity cost:

```text
electricity_cost = power_MW x 1000 x hours x price_per_kWh
```

Example:

```text
10 MW x 1000 x 24 x $0.08 = $19,200/day
```

This is a strong teaching moment: the cloud is not magic. It is someone else's electric bill.

---

## Purchase Categories

To keep the game understandable, split purchases into two main tabs.

### Producers

These directly generate code, money, or compute.

| Producer | Starts At | Produces |
|---|---:|---|
| Keyboard | $10 | Code per click |
| Script Bot | $50 | Auto code/sec |
| CPU Core | $200 | Compute/sec |
| RAM Stick | $125 | Unlocks larger jobs |
| SSD | $500 | Storage capacity |
| GPU | $5,000 | AI compute |
| Server | $50,000 | Large compute/sec |
| Rack | $500,000 | Server capacity |
| Data Center | $50,000,000 | Massive scaling |
| AI Campus | $10,000,000,000 | Late-game absurdity |

### Multipliers

These improve efficiency, value, or capacity.

| Multiplier | Effect |
|---|---|
| Better Compiler | x2 code value |
| Cache Optimization | +20% CPU efficiency |
| More RAM Channels | +25% memory bandwidth |
| Parallel Algorithms | x2 GPU jobs |
| Load Balancer | +15% server efficiency |
| Liquid Cooling | Reduces heat penalty |
| Fiber Backbone | +30% cluster scaling |
| Power Optimization | Lowers electricity cost |
| Reliability Engineering | Improves uptime |

---

## Bottleneck System

This is where the game becomes educational.

Each project has requirements:

```text
Project:
name
storage_required
ram_required
compute_required
base_reward
```

The player can run a project only if they meet the requirements. Alternatively, the project can run slowly if the player is underpowered.

```text
project_speed =
min(1, RAM / RAM_required)
x min(1, storage / storage_required)
x min(1, compute / compute_required)
```

Example projects:

```text
Tiny Website
Needs: 10 MB storage, 64 MB RAM
Reward: $5/sec

Image Classifier
Needs: 20 GB storage, 8 GB RAM, GPU
Reward: $2,000/sec

Campus Chatbot
Needs: 5 TB storage, 256 GB RAM, 8 GPUs
Reward: $1,000,000/sec
```

Lessons:

- More storage does not fix insufficient RAM.
- More RAM does not fix a weak GPU.
- More GPUs do not fix bad cooling.
- Every system eventually develops a bottleneck.

Computer science: the art of discovering your newest bottleneck.

---

## Unit Unlock Ladder

Use the game to slowly reveal units.

| Milestone | Unit Introduced | Flavor |
|---|---|---|
| 1,000 bytes | KB | Your code no longer fits on a napkin. |
| 1,000 KB | MB | You can store images now. Mostly blurry ones. |
| 1,000 MB | GB | Welcome to modern RAM. |
| 1,000 GB | TB | You have entered server territory. |
| 1,000 TB | PB | Your dataset has its own weather system. |
| 1,000 PB | EB | At this point, your backup needs a backup. |

Optional CS mode:

```text
1 KiB = 1024 bytes
1 MiB = 1024 KiB
1 GiB = 1024 MiB
```

Optional marketing mode:

```text
1 KB = 1000 bytes
1 MB = 1000 KB
1 GB = 1000 MB
```

This creates a useful discussion about binary units versus decimal units.

---

## Example Upgrade List

| Upgrade | Cost | Effect | Teaches |
|---|---:|---|---|
| Better Keyboard | $15 | +1 code/click | input |
| Text Editor | $100 | x1.5 click value | tools |
| 4 MB RAM | $250 | Unlocks larger scripts | RAM |
| 100 MB Hard Drive | $500 | Stores projects | storage |
| 1 GHz CPU | $2,000 | +100 compute/sec | clock speed |
| Dual Core CPU | $8,000 | x2 CPU output | parallelism |
| 16 GB RAM | $25,000 | Unlocks apps | gigabytes |
| 1 TB SSD | $100,000 | Unlocks datasets | terabytes |
| First GPU | $500,000 | Unlocks AI jobs | GPU |
| 24 GB VRAM GPU | $2,000,000 | Bigger models | VRAM |
| Server Rack | $50,000,000 | Unlocks racks | scaling |
| Petabyte Array | $5,000,000,000 | Huge datasets | petabytes |
| AI Data Center | $1,000,000,000,000 | Megawatt compute | infrastructure |

---

## Prestige System

When the player reaches data center scale, let them "publish a breakthrough paper" and restart with permanent bonuses.

Prestige currency: **Research Points**

Earned from:

```text
research_points = log10(total_compute_generated)
```

Spend on:

| Research Upgrade | Effect |
|---|---|
| Algorithms | More output with same hardware |
| Data Structures | Lower RAM requirements |
| Operating Systems | Better multitasking |
| Networking | Better cluster scaling |
| Machine Learning | Better AI job value |
| Cybersecurity | Reduces outage events |
| Sustainability | Reduces power and cooling costs |

This lets CS topics act as meta-upgrades instead of being crammed into the click loop.

---

## Random Events

Random events help vocabulary stick.

| Event | Effect |
|---|---|
| Memory Leak | RAM efficiency drops for 60 seconds |
| Cache Hit Streak | CPU output doubles briefly |
| Disk Full | Storage-limited projects pause |
| GPU Driver Update | 50% chance of boost, 50% chance of chaos |
| Cooling Failure | Heat penalty rises |
| Power Spike | Data center costs increase |
| Grant Funding | Free research points |
| Stack Overflow Blessing | Debugging time reduced |

---

## First Prototype Scope

Start with only these player stats:

```text
money
code_per_click
auto_code_per_second
storage_bytes
ram_bytes
compute_units
```

Initial purchases:

```text
Keyboard: increases code_per_click
Script Bot: increases auto_code_per_second
CPU: increases compute_units
RAM: increases ram_bytes
Storage: increases storage_bytes
Compiler: increases code value
```

Initial projects:

```text
Hello World
Personal Website
Mobile App
Image Classifier
Tiny Chatbot
Campus AI Assistant
```

Reward formula:

```text
money_per_second =
auto_code_per_second
x code_value
x project_multiplier
x bottleneck_efficiency
```

Bottleneck efficiency:

```text
bottleneck_efficiency =
min(1, RAM / required_RAM)
x min(1, storage / required_storage)
x min(1, compute / required_compute)
```

This gives the game a playable loop, meaningful upgrades, and authentic CS vocabulary without turning it into a spreadsheet wearing a fake mustache.

---

## Design Notes

The most important design principle is that **hardware upgrades should feel useful but incomplete by themselves**.

A player should eventually learn:

- CPU speed matters, but not without enough memory.
- RAM matters, but not without enough compute.
- Storage matters, but stored data is different from active memory.
- GPUs are powerful because they process many operations in parallel.
- Servers introduce reliability, networking, and scaling problems.
- Data centers are not just bigger computers. They are physical infrastructure.
- Late-game AI computing is constrained by money, power, cooling, and logistics.

The game should let players discover these ideas by hitting bottlenecks, buying upgrades, and watching their production change.
