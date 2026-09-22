# Corepolis — Game Design

## High concept

Corepolis is a **city-builder inside a computer**.

The PC case is the world boundary. The motherboard is the city map. Hardware-inspired districts are city infrastructure rather than literal PC assembly parts.

The player is not asked to install a DIMM into DIMM_A2 or route a real SATA cable. The goal is to grow a living system city while balancing capacity, energy and heat.

## Core fantasy

> Build the system. Run the city.

The player should be able to look at the board and understand the health of the system without reading a spreadsheet.

Data should move. Power should feel scarce. Heat should spread. Bottlenecks should be visible.

## Core resources

- **Compute** — supplied by CPU/GPU districts.
- **Memory** — supplied by RAM districts.
- **Storage** — supplied by storage districts.
- **Power** — supplied by power infrastructure.
- **Cooling** — offsets thermal load.
- **Network** — limits external workload throughput.
- **Credits** — used to expand and upgrade.

## Core loop

1. Build infrastructure.
2. New workload arrives.
3. Districts generate capacity.
4. Bottlenecks appear.
5. The player expands, rebalances or replaces infrastructure.
6. A stable city attracts more workload.
7. Repeat at a larger scale.

## Visual language

Hardware is the visual vocabulary, not a strict simulator.

- CPU → compute core / central district.
- RAM → memory towers.
- GPU → parallel-compute complex.
- SSD/HDD → storage blocks.
- PSU/VRM → power plants and substations.
- Fans/radiators → cooling infrastructure.
- PCIe/data traces → highways.
- Network I/O → city gateways.

## Prototype 0.1

The first vertical slice must prove only four things:

1. the motherboard feels like a city map;
2. placing hardware-inspired districts is satisfying;
3. workload growth creates readable bottlenecks;
4. data flow makes the board feel alive.

Real brands are deliberately excluded from the first prototype.
