# MOSFET Wiring Guide for ESP32 Plant System

## Why MOSFETs Instead of Relays?

**Advantages of MOSFETs:**
- ⚡ **Faster switching** - Microsecond response time vs. milliseconds
- 🔇 **Silent operation** - No mechanical clicking
- 💪 **More efficient** - Less power loss, less heat
- 🎛️ **PWM capable** - Can control speed/brightness (future feature)
- 📦 **Compact** - Smaller than relay modules
- 💰 **Cheaper** - $0.50 per MOSFET vs. $3-5 for relay module

**When to use relays instead:**
- High voltage AC (110V/220V mains) - **Never use MOSFETs for AC!**
- Electrical isolation required between control and load
- Very high current (>30A continuously)

For our 5V/12V DC plant system, MOSFETs are the better choice.

---

## Understanding N-Channel MOSFETs

### The Three Pins

\`\`\`
     [Drain (D)]     ← Connects to load (device negative)
          |
     ┌────┴────┐
     │ MOSFET  │
     │         │
[Gate (G)]←────┤     ← Control signal from ESP32
     │         │
     └────┬────┘
          |
    [Source (S)]     ← Connects to ground (GND)
\`\`\`

**How it works:**
- **Gate = LOW (0V):** MOSFET is OFF, no current flows
- **Gate = HIGH (3.3V):** MOSFET turns ON, current flows from Drain to Source
- Think of it like a switch: Gate signal controls whether device turns on

---

## Complete Circuit Schematic

### Single MOSFET Circuit (per device)

\`\`\`
                    External Power Supply
                    +5V or +12V
                         │
                         │
                     [Device +]
                         │
                     [Device -]───┬───[Diode Cathode --|<|--]
                                  │                           │
                                  │                           │
                            ┌─────┴─────┐                     │
                            │   Drain   │                     │
            220Ω            │           │                     │
ESP32 GPIO ──/\/\/\────────│   Gate    │                     │
(25/26/27)                 │           │                     │
                  10kΩ     │  Source   │                     │
            ┌────/\/\/\────┴─────┬─────┘                     │
            │                    │                           │
            │                    │    [Diode Anode]──────────┘
            │                    │
           GND──────────────────GND
\`\`\`

**Component values:**
- **220Ω gate resistor** (optional) - Limits current, prevents ringing
- **10kΩ pull-down resistor** (recommended) - Prevents floating gate during boot
- **Diode** (for motors/pumps only) - 1N4007 or 1N5819 Schottky

---

## Breadboard Layout

### Connections for One Device (e.g., Water Pump)

\`\`\`
ESP32                       Breadboard                   External Power
─────                       ──────────                   ──────────────

GPIO 25 ──────220Ω──────►  MOSFET Gate
                              │
                           10kΩ
                              │
GND ────────────────────►  MOSFET Source ◄────────────  Power GND
                              │
                           MOSFET Drain
                              │
                              ├──────────────►  Pump (-)
                              │
                           [Diode]
                              │
                           Pump (+)  ◄──────────────────  Power +5V
\`\`\`

**Physical layout on breadboard:**
1. Insert MOSFET into breadboard (note pin orientation from datasheet)
2. Connect Gate to ESP32 GPIO through 220Ω resistor
3. Connect 10kΩ resistor from Gate to ground rail
4. Connect Source directly to ground rail
5. Connect Drain to device negative wire
6. Insert flyback diode across device (cathode to +, anode to -)
7. Connect device positive to external power supply +

---

## Wiring for All Three Devices

### Complete System Schematic

\`\`\`
ESP32 Board
┌─────────────────┐
│   GPIO 25 ──────┼────► Water Pump MOSFET Gate
│   GPIO 26 ──────┼────► Fan MOSFET Gate  
│   GPIO 27 ──────┼────► Grow Light MOSFET Gate
│   GND ──────────┼────► Common GND (all MOSFETs + Power Supply)
│                 │
│   GPIO 4  ──────┼────► DHT22 Data
│   GPIO 34 ──────┼────► Soil Moisture Analog
│   GPIO 21 ──────┼────► BH1750 SDA
│   GPIO 22 ──────┼────► BH1750 SCL
│   3.3V ─────────┼────► DHT22, BH1750 power
│   5V ───────────┼────► Soil Moisture power
│   GND ──────────┼────► All sensor grounds
└─────────────────┘

External 5V/12V Power Supply
     │
     ├─────► Water Pump (+)
     ├─────► Fan (+)
     ├─────► Grow Light (+)
     │
    GND ────► Common GND
\`\`\`

---

## Step-by-Step Assembly

### Parts Needed (per device)

- 1× N-Channel MOSFET (IRLZ44N, IRF520, or similar)
- 1× 220Ω resistor (optional, for gate)
- 1× 10kΩ resistor (for pull-down)
- 1× 1N4007 diode (for motors/pumps only)
- Jumper wires
- Breadboard or PCB

### Build Order

**Step 1: Identify MOSFET Pins**
- Find datasheet for your MOSFET online
- Common packages:
  - **TO-220:** Flat on back, 3 pins in a row
  - **TO-92:** Small, 3 pins bent downward

**Example pinouts (facing flat side):**
\`\`\`
IRLZ44N (TO-220):        IRF520 (TO-220):
  G   D   S                G   D   S
  │   │   │                │   │   │
┌─┴───┴───┴─┐            ┌─┴───┴───┴─┐
│  Flat side│            │  Flat side│
└───────────┘            └───────────┘
\`\`\`

**Always verify with datasheet! Pin order varies.**

---

**Step 2: Insert MOSFET into Breadboard**
- Orient MOSFET with pins accessible
- Leave space for resistors and wires

---

**Step 3: Add Gate Resistor (220Ω)**
- Connect one end to MOSFET Gate pin
- Connect other end to a free row (where ESP32 GPIO will connect)

---

**Step 4: Add Pull-Down Resistor (10kΩ)**
- Connect one end to MOSFET Gate pin (same row as gate resistor)
- Connect other end to ground rail

---

**Step 5: Connect MOSFET Source to Ground**
- Use jumper wire from Source pin to ground rail
- Ensure this ground rail connects to ESP32 GND and power supply GND

---

**Step 6: Connect ESP32 GPIO**
- Run jumper wire from ESP32 GPIO (25/26/27) to the free end of 220Ω gate resistor

---

**Step 7: Connect Device**
- Device **negative (-)** wire → MOSFET Drain pin
- Device **positive (+)** wire → External power supply +

---

**Step 8: Add Flyback Diode (for motors only)**
- **Cathode** (silver/white stripe) → Device positive (+)
- **Anode** (no stripe) → Device negative (-)
- Diode should be physically close to motor terminals
- **Skip this step for LED lights** (not needed)

---

**Step 9: Double-Check Connections**
Before powering on:
- [ ] Gate connects to ESP32 GPIO through 220Ω
- [ ] Gate has 10kΩ pull-down to GND
- [ ] Source connects to common GND
- [ ] Drain connects to device negative
- [ ] Device positive connects to external power +
- [ ] All grounds are common (ESP32, MOSFETs, power supply)
- [ ] Flyback diode polarity correct (cathode to +)

---

## MOSFET Selection Guide

### Recommended MOSFETs

| MOSFET | Voltage | Current | RDS(on) | Package | Best For |
|--------|---------|---------|---------|---------|----------|
| **IRLZ44N** | 55V | 47A | 0.028Ω | TO-220 | **General use (recommended)** |
| **IRF520** | 100V | 9.2A | 0.27Ω | TO-220 | Small pumps, fans |
| **2N7000** | 60V | 0.2A | 5Ω | TO-92 | LEDs, low power (<200mA) |
| **IRL540N** | 100V | 28A | 0.044Ω | TO-220 | High current devices |

**Key specs to check:**
- **VGS(th)** = Gate threshold voltage (must be <3V for ESP32 compatibility)
- **ID** = Maximum drain current (must exceed device current by 2× safety margin)
- **RDS(on)** = On-resistance (lower = less heat, more efficient)

**Where to buy:**
- Amazon, eBay: ~$0.50-$2 each
- Electronics stores: RadioShack, Fry's
- Online: Mouser, Digikey (bulk pricing)

---

### Device Current Requirements

Measure or estimate your device current:

**Water pump (5V mini submersible):**
- Typical: 200-500mA
- Use MOSFET rated ≥1A (IRF520 or better)

**DC Fan (5V/12V):**
- Small (40mm): 50-150mA
- Medium (80mm): 150-300mA
- Use MOSFET rated ≥1A

**LED Grow Light:**
- 5V LED strip (1m): 500-1500mA
- 12V LED array: 1-3A
- Use MOSFET rated ≥5A (IRLZ44N recommended)

**Formula:**
\`\`\`
Required MOSFET current rating = Device current × 2 (safety margin)
Example: 1A LED + 500mA pump + 200mA fan = 1.7A total
         Need MOSFET rated ≥ 3.4A → Use 5A+ MOSFET
\`\`\`

---

## Testing MOSFETs

### Before Assembly - Bench Test

**Test MOSFET with multimeter:**

1. Set multimeter to **continuity** or **diode** mode
2. Measure **Drain-to-Source** with no gate voltage:
   - Should read **open circuit** (OL or infinite resistance)
3. Touch **Gate** to **+3.3V** (from ESP32 3.3V pin):
   - Now measure Drain-to-Source again
   - Should read **low resistance** (<1Ω for good MOSFET)
4. Touch **Gate** to **GND**:
   - Drain-to-Source returns to open circuit

**If test fails:** MOSFET may be damaged or wrong type (not logic-level).

---

### After Assembly - Functional Test

**Simple test without ESP32:**

1. Build MOSFET circuit on breadboard
2. Connect device to external power (don't power ESP32 yet)
3. Manually touch GPIO wire to 3.3V:
   - Device should turn ON
4. Touch GPIO wire to GND:
   - Device should turn OFF

**If device doesn't turn on:**
- Check MOSFET pinout (Gate/Drain/Source)
- Verify external power supply is on
- Check all GND connections are common

---

## Troubleshooting

### Device Won't Turn On

**Symptom:** MOSFET stays OFF even when GPIO is HIGH

**Possible causes:**
1. **Wrong MOSFET type** - Not logic-level compatible
   - Fix: Use IRLZ44N or other logic-level MOSFET (VGS(th) <2V)

2. **Gate voltage too low** - Check with multimeter
   - Should be 3.3V when GPIO is HIGH
   - Fix: Remove gate resistor if voltage drops too much

3. **MOSFET pins backwards** - Drain/Source swapped
   - Fix: Check datasheet, verify pin order

4. **No external power** - Power supply off or disconnected
   - Fix: Check power supply is on, connected to device

5. **Bad MOSFET** - Component damaged
   - Fix: Replace with new MOSFET, test first

---

### Device Won't Turn Off

**Symptom:** Device stays ON continuously

**Possible causes:**
1. **Floating gate** - No pull-down resistor
   - Fix: Add 10kΩ resistor from Gate to GND

2. **Software bug** - GPIO not set LOW in code
   - Fix: Check code, verify `digitalWrite(pin, LOW)`

3. **Gate shorted to Drain** - Wiring error
   - Fix: Check for short circuits, rewire carefully

---

### Device Turns On/Off Randomly

**Possible causes:**
1. **Floating gate during boot** - ESP32 GPIO undefined state
   - Fix: Add or reduce pull-down resistor value (try 4.7kΩ)

2. **Electrical noise** - Interfering with gate signal
   - Fix: Keep gate wires short, add 220Ω series resistor

3. **Software issue** - Control state polling errors
   - Fix: Check Serial Monitor for errors, verify API responses

---

### MOSFET Gets Hot

**Symptom:** MOSFET too hot to touch after a few minutes

**Possible causes:**
1. **MOSFET not fully ON** - Gate voltage insufficient
   - Should be 3.3V minimum
   - Fix: Verify gate voltage, remove unnecessary resistors

2. **High RDS(on)** - Wrong MOSFET for high current
   - Fix: Upgrade to MOSFET with lower RDS(on) (IRLZ44N)

3. **Device drawing too much current** - Exceeds MOSFET rating
   - Measure current with multimeter
   - Fix: Use higher-rated MOSFET or parallel MOSFETs

4. **Short circuit** - Device or wiring problem
   - Fix: Disconnect device, check for shorts

**Normal operation:**
- MOSFET should be warm (40-50°C) under load
- Too hot to hold (>70°C) indicates a problem
- Add heatsink if needed (TO-220 MOSFETs have mounting hole)

---

## Advanced: Heatsinking

### When You Need a Heatsink

Calculate power dissipation:
\`\`\`
Power (W) = Current² × RDS(on)
Example: 2A device with MOSFET RDS(on) = 0.05Ω
         P = 2² × 0.05 = 0.2W
\`\`\`

**Guidelines:**
- <0.5W: No heatsink needed
- 0.5-2W: Small heatsink recommended
- >2W: Required heatsink with thermal compound

**Heatsink installation:**
1. Apply thermal compound to MOSFET back (flat side)
2. Attach heatsink with screw or clip
3. Ensure heatsink doesn't short adjacent components

---

## Safety Checklist

Before powering on your system:

**Electrical Safety:**
- [ ] All positive and negative wires separated (no shorts)
- [ ] MOSFETs not touching each other (insulated if close)
- [ ] Flyback diodes installed on all motors (correct polarity)
- [ ] Voltage correct for devices (5V devices get 5V, not 12V!)

**Wiring Verification:**
- [ ] Common ground between ESP32, MOSFETs, and power supply
- [ ] No loose wires or poor connections
- [ ] Gate pull-down resistors installed
- [ ] External power supply capacity adequate (2-3A minimum)

**Component Verification:**
- [ ] MOSFETs are logic-level type (IRLZ44N, IRF520, etc.)
- [ ] Diodes face correct direction (cathode stripe to +)
- [ ] Resistor values correct (220Ω gate, 10kΩ pull-down)

**First Power-On:**
- [ ] Power ESP32 separately first (via USB), verify code uploads
- [ ] Then connect external power to devices
- [ ] Monitor Serial output for errors
- [ ] Test one device at a time

---

## PCB Layout (Future Upgrade)

For a permanent installation, design a PCB:

**Schematic symbol:**
\`\`\`
┌──────────────────────────────────┐
│  ESP32 Plant Controller Board    │
│                                   │
│  [ESP32 Module]                   │
│      │  │  │                      │
│    GPIO Pins                      │
│      │  │  │                      │
│  [MOSFET 1] [MOSFET 2] [MOSFET 3]│
│      │          │          │      │
│   Pump        Fan       Light     │
│                                   │
│  [Screw Terminals for Devices]   │
│  [Power Input: 5-12V DC]          │
└──────────────────────────────────┘
\`\`\`

**PCB features:**
- Screw terminals for easy device connection
- Onboard gate resistors and pull-downs
- Flyback diodes integrated
- Status LEDs for each output
- Compact size (~10cm × 8cm)

Tools: KiCad, EasyEDA (free PCB design software)

---

## Next Steps

1. **Build your first MOSFET circuit** on breadboard
2. **Test with LED** before connecting pump/fan (safer)
3. **Upload ESP32 code** and test control from web app
4. **Add one device at a time** (pump first, then fan, then light)
5. **Monitor Serial output** for debugging
6. **Measure current draw** of each device with multimeter
7. **Consider PCB** for permanent installation

For questions or help, refer to:
- `docs/ESP32_API_GUIDE.md` - Complete API documentation
- `docs/COMPLETE_SETUP_GUIDE.md` - Full assembly instructions
- Serial Monitor output for real-time debugging

Happy building! 🌱
