# SMS Hardware

The Commons SMS interface (`ModemInterface.ts`) communicates with a USB cellular modem over a serial port using AT commands. This document covers hardware selection, SIM setup, and connecting the hardware to the software.

## Recommended Hardware

### Waveshare SIM7600G-H 4G Dongle

This is the tested and recommended device.

- **Chip:** SIM7600G-H
- **Bands:** Global (works with US carriers — T-Mobile, AT&T, etc.)
- **Connection:** USB (shows up as serial ports on Linux)
- **SIM slot:** Nano SIM, built into the dongle
- **AT commands:** Fully supported
- **GNSS:** Built-in GPS/GNSS (not needed for SMS but available)

Available at: [Waveshare](https://www.waveshare.com) or Amazon (~$78)

### What to Avoid

- **WiFi dongles** — create a hotspot or connect to a network; do not expose AT commands
- **SIM800C-based modules** — 2G only; US carriers (AT&T, T-Mobile) have shut down 2G networks
- **M.2 adapter boards without a module** — require purchasing the cellular module separately

## SIM Card

You need a nano SIM with SMS enabled. Cheap prepaid options:

- **T-Mobile prepaid** — pay-as-you-go plans include SMS
- **AT&T prepaid** — similar options
- **Mint Mobile** — month-to-month, inexpensive

You do not need a data plan unless you also want internet access through the dongle.

## Linux Setup

### 1. Plug in the dongle

After inserting the SIM and plugging in via USB:

```bash
# Confirm the device is recognized
lsusb

# Check which serial ports appeared
ls /dev/ttyUSB*
```

The SIM7600 exposes multiple ports. The AT command port is typically `/dev/ttyUSB2`.

### 2. Fix permissions (if needed)

If you get a permission denied error:

```bash
sudo usermod -aG dialout $USER
# Log out and back in for the group change to take effect
```

### 3. Test AT commands manually

```bash
# Confirm the modem responds
echo -e "AT\r\n" > /dev/ttyUSB2

# Or use minicom for interactive testing
sudo apt install minicom
minicom -D /dev/ttyUSB2 -b 115200
```

Type `AT` and press Enter — you should see `OK`. Type `AT+CMGF=1` to enable text mode.

### 4. Find the correct port

If `/dev/ttyUSB2` does not respond, try `/dev/ttyUSB0`, `ttyUSB1`, etc. Each port on the SIM7600 serves a different function:

| Port | Function |
|------|----------|
| ttyUSB0 | DM (diagnostic) |
| ttyUSB1 | NMEA (GPS data) |
| ttyUSB2 | AT commands ← use this |
| ttyUSB3 | PPP / data |

## Software Integration

Instantiate `ModemInterface` with the correct port path:

```ts
import { ModemInterface } from "./sms/ModemInterface.js";

const modem = new ModemInterface("/dev/ttyUSB2");
modem.start();
```

The port path can be made configurable via an environment variable or CLI flag to avoid hardcoding it.

### Environment variable approach

```ts
const port = process.env.MODEM_PORT ?? "/dev/ttyUSB2";
const modem = new ModemInterface(port);
modem.start();
```

Then run with:

```bash
MODEM_PORT=/dev/ttyUSB2 node dist/index.js
```

## How It Works

Once running, the modem interface:

1. Opens the serial port and sets the modem to text mode (`AT+CMGF=1`)
2. Enables unsolicited new-message notifications (`AT+CNMI=1,1,0,0,0`)
3. When a message arrives, reads it (`AT+CMGR=<index>`), deletes it (`AT+CMGD=<index>`), and passes it to `SmsHandler`
4. `SmsHandler` parses the command (BAL, SEND, POST, etc.) and returns a reply
5. The reply is sent back via `AT+CMGS="<number>"`

From a user's perspective: they text the SIM's phone number, and the server responds automatically.
