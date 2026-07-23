// DC-Air Training Center — searchable answer bank.
// Every answer is a faithful summary of the official docs; `source` deep-links
// to the exact page. Content sources:
//   guide = DC-Air User Q&A and Troubleshooting Guide (2026.1)
//   ifu   = DC-Air Instructions for Use (0000679 Rev. 18)
// `keywords` feed the fuzzy search only — include synonyms, layman phrasings
// and likely misspellings from non-native English speakers.

const CATEGORIES = [
  { key: "connection", label: "Connection & pairing", icon: "signal" },
  { key: "battery", label: "Battery, charging & lights", icon: "battery" },
  { key: "image", label: "Image problems", icon: "image" },
  { key: "usage", label: "Taking X-rays & daily use", icon: "workflow" },
  { key: "cleaning", label: "Cleaning & disinfection", icon: "clean" },
  { key: "service", label: "Damage, service & support", icon: "wrench" },
];

const FAQ = [
  // ---------------------------------------------------------------- connection
  {
    id: "ble-drops",
    category: "connection",
    question: "The wireless (BLE) connection keeps dropping",
    keywords:
      "bluetooth blutooth wifi wireles conection disconect lost signal weak drop cut interrupt unstable range pairing",
    steps: [
      "Check the <strong>antenna</strong> is screwed firmly onto the docking station.",
      "Dock the sensor and <strong>charge at least 45 minutes</strong> — a depleted battery switches the sensor off mid-transfer.",
      "Place the dock <strong>in front of the patient or within ±45°</strong>, never behind the head. Keep a clear line of sight.",
      "Hold the sensor <strong>outside the mouth</strong> during image transfer.",
      "After a drop, the dock retries <strong>3 times within 30 seconds</strong> — give it that time before doing anything.",
      "If it does not recover, restart TWAIN / your imaging software and reconnect the dock.",
    ],
    note: "If drops continue with good placement, a charged battery and a firm antenna, collect the log file and contact support.",
    source: { doc: "guide", page: 8 },
    images: [
      { src: "/dc-air-training/assets/twain/twain-scanning.webp", caption: "TWAIN shows “Scanning” (blue) while reconnecting — give it up to 30 s" },
    ],
  },
  {
    id: "dock-placement",
    category: "connection",
    question: "Where should the docking station be placed?",
    keywords: "position dock station location distance behind head base place setup put",
    steps: [
      "<strong>In front of the patient</strong>, or within ±45° — with a clear line of sight to the sensor during transfer.",
      "No more than <strong>2.5 m (8 ft)</strong> from the dental chair.",
      "<strong>Avoid</strong> placing it behind the patient's head or neck — obstacles degrade the Bluetooth signal.",
      "Never attempt an exposure with the dock behind a wall or in a different room.",
    ],
    source: { doc: "ifu", page: 19 },
  },
  {
    id: "pairing",
    category: "connection",
    question: "How do I pair the sensor, or move it to another room?",
    keywords: "pair pairing conect another room operatory move relocate different new dock swap link",
    steps: [
      "Place the sensor on the docking station of that room.",
      "Wait for the <strong>“Sensor docked”</strong> status in TWAIN. It may briefly show “Busy” first — that is normal.",
      "Wait <strong>3 more seconds</strong> before lifting the sensor off.",
      "Repeat this every time a sensor moves to a different operatory.",
    ],
    source: { doc: "ifu", page: 19 },
    images: [
      { src: "/dc-air-training/assets/twain/twain-docked.webp", caption: "TWAIN shows “Docked” while the sensor is on the station" },
    ],
  },
  {
    id: "dock-not-recognised",
    category: "connection",
    question: "Dock or sensor not showing in Windows Device Manager",
    keywords: "device manager usb not found recognised recognized detected enumerate missing computer pc see",
    steps: [
      "Reconnect the dock <strong>directly to a PC USB port</strong> — no hub, no extension cable.",
      "In Device Manager, show hidden devices and remove <strong>ghost device entries</strong>, then reconnect.",
      "Ask the clinic's IT to <strong>verify / update the PC BIOS and chipset drivers</strong>.",
      "Both the sensor and the dock must appear as recognised USB devices.",
    ],
    note: "If the dock still does not appear after a direct reconnection, contact support with the log file.",
    source: { doc: "guide", page: 10 },
  },
  {
    id: "usb-hubs",
    category: "connection",
    question: "Can I use a USB hub, extension cable or a tablet?",
    keywords: "hub extension long cable laptop tablet mac virtual machine supported requirements computer",
    steps: [
      "No. Connect the dock <strong>straight into a PC USB port</strong> with the supplied USB-C to USB-A cable.",
      "<strong>Not supported:</strong> USB hubs/extensions, cables over 2 m, tablets, virtual machines, and non-Windows computers.",
      "Low-power Pentium/Celeron processors are not supported — an <strong>Intel Core i5 6th gen or higher</strong> (or equivalent) is recommended.",
    ],
    source: { doc: "guide", page: 3 },
  },

  // ------------------------------------------------------------------ battery
  {
    id: "led-meanings",
    category: "battery",
    question: "What do the lights (LEDs) mean?",
    keywords: "led light lights blink flash green yellow blue color colour indicator meaning status lamp",
    steps: [
      "<strong>Sensor — double green flash:</strong> BLE connected, ready to use (just undocked).",
      "<strong>Sensor — flashing yellow:</strong> battery low — dock for at least 15 minutes.",
      "<strong>Sensor — steady yellow:</strong> error, almost always a depleted or empty battery. Dock and charge.",
      "<strong>Sensor — off:</strong> asleep or switched off — dock to wake and charge.",
      "<strong>Dock — pulsing blue:</strong> powered, sensor charging.",
    ],
    source: { doc: "guide", page: 5 },
  },
  {
    id: "battery-low",
    category: "battery",
    question: "Battery is low / sensor light flashing yellow",
    keywords: "batery low empty flashing yelow warning critical alarm power dead died wont turn on",
    steps: [
      "Place the sensor on the docking station for <strong>at least 15 minutes</strong> — that is enough charge for one full mouth series (FMX).",
      "If the light has stopped flashing entirely (battery empty), dock and <strong>wait at least 25 minutes</strong> before removing the sensor.",
      "When TWAIN shows the “Battery level critical” alarm, dock immediately — ignoring it can lead to an exposure without an image.",
    ],
    source: { doc: "ifu", page: 16 },
  },
  {
    id: "charging",
    category: "battery",
    question: "How long does charging take, and how many X-rays per charge?",
    keywords: "charge charging time hours how long full recharge capacity exposures many last duration overnight",
    steps: [
      "A <strong>20-minute</strong> charge allows about <strong>40 exposures</strong> in sequence.",
      "A full recharge from empty takes about <strong>2.5 hours</strong>.",
      "A fully charged sensor takes at least <strong>150 exposures</strong> continuously (one every 40 s).",
      "Habit that prevents all battery problems: <strong>dock after every use</strong> and leave the sensor <strong>docked overnight</strong> with the PC on so the USB port stays powered.",
    ],
    source: { doc: "ifu", page: 21 },
  },
  {
    id: "battery-drop-normal",
    category: "battery",
    question: "Battery dropped from 100% to 75% after one X-ray — is that normal?",
    keywords: "batery percent drop 75 100 level fast quickly normal drain twain shows",
    steps: [
      "Yes — this is <strong>normal</strong> and does not indicate a problem.",
      "TWAIN shows the battery in broad steps only: <strong>100%, 75%, 50% and 10%</strong>.",
      "At 50%, continue use but dock between patients. At 10%, dock and charge before continuing.",
    ],
    source: { doc: "guide", page: 5 },
  },
  {
    id: "battery-zero",
    category: "battery",
    question: "TWAIN shows 0% battery right after a reset",
    keywords: "zero 0 percent fake reset wrong reading level restart",
    steps: [
      "A 0% reading right after a reset is <strong>not real</strong>.",
      "<strong>Wait about 60 seconds</strong> — the true battery level follows.",
      "The battery reading is accurate only when the docking protocol is followed. If in doubt: dock, charge, then trust the TWAIN status.",
    ],
    source: { doc: "guide", page: 12 },
  },
  {
    id: "sleep-mode",
    category: "battery",
    question: "Sensor went to sleep / does not respond",
    keywords: "sleep asleep standby wake unresponsive not responding off dead nothing endo mode timeout turn turns on start starting",
    steps: [
      "The sensor enters sleep after a period of inactivity to preserve battery — this is normal.",
      "To wake it: place it on the docking station and <strong>leave it there for 10 seconds</strong>.",
      "For long procedures there is a special <strong>“ENDO” mode</strong> that prevents the sensor from sleeping.",
    ],
    source: { doc: "ifu", page: 21 },
  },

  // -------------------------------------------------------------------- image
  {
    id: "noisy-image",
    category: "image",
    question: "Image is noisy, grainy or low contrast",
    keywords: "noise noisy grainy grain quality bad poor dark contrast underexposed exposure median unclear unsharp blurry",
    steps: [
      "This is under-exposure — the median level is too low.",
      "For adults, use <strong>70 kV</strong> where applicable.",
      "Adjust the exposure time so the <strong>median</strong> in the log file reaches <strong>≥ 300, ideally &gt; 350</strong>.",
    ],
    note: "If graininess persists at correct exposure, send the log file and the affected .bin images to support.",
    source: { doc: "guide", page: 8 },
  },
  {
    id: "line-artifacts",
    category: "image",
    question: "Lines or artifacts in the image",
    keywords: "line lines stripe artifact artefact pattern corruption calibration second sensor two",
    steps: [
      "Usual cause: a wrong or corrupted <strong>calibration-file</strong> association — common when a second DC-Air is added to the practice.",
      "Delete the temporary calibration files under <strong>C:\\ProgramData\\AthlosDCAirTwain\\calibrations</strong> on <strong>every PC</strong> in the practice.",
      "Dock the sensor, restart TWAIN, and continue — the correct calibration downloads automatically.",
    ],
    note: "If it persists, send the .bin files and log file to support; request an RMA if needed.",
    source: { doc: "guide", page: 8 },
  },
  {
    id: "no-image",
    category: "image",
    question: "I shot an X-ray but no image appeared",
    keywords: "no image nothing appears blank missing not received transfer failed shot xray took screen empty waiting",
    steps: [
      "<strong>Do not retake yet</strong> — the image is almost certainly saved in the sensor's memory (XRAM).",
      "Check the <strong>Image Pending</strong> flag and use <strong>“Download Last Image”</strong> in TWAIN.",
      "If TWAIN or the imaging software froze: close and restart them, then Download Last Image.",
      "If it is the USB side: unplug the dock, <strong>wait 5 s</strong>, plug back in, then Download Last Image.",
      "Retaking wastes a frame and exposes the patient to unnecessary dose.",
    ],
    source: { doc: "guide", page: 7 },
  },
  {
    id: "xram",
    category: "image",
    question: "What is XRAM / the Image Pending flag?",
    keywords: "xram memory onboard stored image pending flag download last recover retake",
    steps: [
      "XRAM is onboard memory that safely keeps the <strong>last acquired image</strong> — even if the software crashes or BLE drops.",
      "The <strong>Image Pending</strong> flag tells you an image is waiting in XRAM, so you do not retake unnecessarily.",
      "The image is lost only if the sensor switches off (timeout or empty battery). A new trigger replaces the previous image.",
      "Use “Download Last Image” whenever the flag is active, an image did not appear, or you just restarted frozen software.",
    ],
    source: { doc: "guide", page: 7 },
  },
  {
    id: "no-trigger",
    category: "image",
    question: "X-rays were shot but the sensor did not trigger",
    keywords: "trigger no exposure not detect fire shoot nothing happened activate xray",
    steps: [
      "Confirm TWAIN is not frozen: close it and any open connections, then restart and reopen.",
      "Use <strong>Download Last Image</strong> if applicable.",
      "Check alignment: feed the cone through the alignment ring and bring the cone edge <strong>up to the bite block</strong> — shooting from too far away prevents triggering.",
    ],
    note: "If there is still no trigger with correct alignment and responsive TWAIN, collect the log file for support.",
    source: { doc: "guide", page: 8 },
  },
  {
    id: "black-white",
    category: "image",
    question: "Images are consistently black or white",
    keywords: "black white blank all dark bright broken hardware failure every completely",
    steps: [
      "This indicates a <strong>hardware failure</strong> — causes include a too-strong bite, drops, autoclaving, washing, submersion, UV disinfection, or use without a sheath.",
      "<strong>Stop using the sensor.</strong>",
      "Collect the log file and the affected .bin images.",
      "Contact Athlos for an <strong>RMA evaluation</strong>.",
    ],
    source: { doc: "guide", page: 9 },
  },
  {
    id: "slow-transfer",
    category: "image",
    question: "Image transfer is slow",
    keywords: "slow transfer long time takes wait preview seconds minute speed lag",
    steps: [
      "With a clear line of sight to the dock, the preview arrives in about <strong>4–8 seconds</strong>.",
      "If the sensor stays <strong>inside a closed mouth</strong>, transfer can take up to 30 seconds — hold the sensor <strong>outside the mouth</strong> during transfer.",
      "Check dock placement: in front / ±45°, not behind the patient's head.",
    ],
    source: { doc: "ifu", page: 21 },
  },

  // -------------------------------------------------------------------- usage
  {
    id: "daily-workflow",
    category: "usage",
    question: "What is the correct daily workflow?",
    keywords: "workflow routine steps order daily use how take xray procedure sequence correct",
    steps: [
      "Undock and <strong>wait 3 seconds</strong> before using the sensor.",
      "Check the LEDs: <strong>double green flash</strong> on the sensor, slow blue pulse on the dock.",
      "Insert the sensor into a <strong>new protective sheath</strong> — a fresh one for every patient.",
      "Mount on the correct holder, attach the stick and alignment ring, and position gently.",
      "Feed the cone through the alignment ring until it almost touches the bite block, then expose.",
      "<strong>Hold the sensor outside the mouth</strong> until transfer completes (~6 s).",
      "<strong>Dock the sensor</strong> after use and between patients — always.",
    ],
    source: { doc: "guide", page: 4 },
    images: [
      { src: "/dc-air-training/assets/twain/twain-ready.webp", caption: "Expose only when TWAIN shows the green “Ready” state" },
    ],
  },
  {
    id: "exposure-settings",
    category: "usage",
    question: "What exposure settings should I use?",
    keywords: "settings exposure kv ma time values generator setup parameters adult recommended tube",
    steps: [
      "Compatible generators: <strong>60–70 kV</strong>, tube current <strong>2–10 mA</strong> (wall-mounted, wheeled or handheld).",
      "Typical wall-mounted generator at 6–8 mA with a 20 cm (8″) cone: exposure time <strong>0.2–0.25 s</strong> for any position.",
      "Thanks to HDR, <strong>one setting works for an entire FMX</strong> — no need to adjust per position.",
      "For ultra-high-definition images you may expose up to 0.5 s.",
    ],
    source: { doc: "ifu", page: 21 },
  },
  {
    id: "pediatric",
    category: "usage",
    question: "What settings for children (pediatric use)?",
    keywords: "child children kid pediatric paediatric young small patient dose reduce settings",
    steps: [
      "<strong>Reduce the exposure</strong> according to the pediatric protocols of your X-ray generator's manufacturer.",
      "Follow the <strong>ALARA</strong> principle — only the dose necessary for a clinically adequate image.",
      "Use professional judgement on the patient's anatomy and oral cavity size; if the sensor cannot be positioned with minimal discomfort, do not use it for that patient.",
      "Example dose table (MyRay RXDC F15) is in the IFU.",
    ],
    source: { doc: "ifu", page: 22 },
  },
  {
    id: "sheaths",
    category: "usage",
    question: "Do I need a new sheath for every patient?",
    keywords: "sheath sheat barrier cover sleeve bag protective reuse new patient hygiene hygienic disposable",
    steps: [
      "<strong>Yes — a new sheath for every patient</strong>, always covering the sensor.",
      "Never use the sensor in a patient's mouth without an approved barrier.",
      "Never reuse a sheath between patients. Only use intact bags; remove and dispose after each use.",
      "Dispose of used barriers as biomedical waste per normal dental office procedure.",
    ],
    source: { doc: "ifu", page: 20 },
  },
  {
    id: "dock-timing",
    category: "usage",
    question: "How quickly can I dock and undock the sensor?",
    keywords: "dock undock fast quick timing seconds redock rapid picking place speed",
    steps: [
      "Keep the sensor docked <strong>at least 3 seconds</strong> before undocking.",
      "Wait <strong>at least 5 seconds</strong> after undocking before redocking.",
      "<strong>Never dock during image transfer</strong> — it can freeze or crash the software or leave the dock stuck.",
      "Rapid docking/undocking can crash software and freeze the USB driver — patience gives stable performance.",
    ],
    source: { doc: "guide", page: 9 },
  },
  {
    id: "exposure-interval",
    category: "usage",
    question: "How much time do I need between exposures?",
    keywords: "interval between exposures shots series fmx template fast consecutive next wait corruption",
    steps: [
      "Rule: <strong>Transfer Time + Processing Time must be shorter than the interval between exposures</strong>.",
      "Allow more time on older PCs / laptops — data corruption occurs when shooting too fast.",
      "Never proceed to the next exposure before the previous image has transferred to the imaging software.",
      "If an image did not transfer, check XRAM with <strong>Download Last Image</strong> — do not re-shoot first.",
    ],
    source: { doc: "guide", page: 13 },
  },
  {
    id: "holders",
    category: "usage",
    question: "Which holder do I use for each position?",
    keywords: "holder holders positioning position anterior posterior bitewing endo occlusal which choose kit stick ring",
    steps: [
      "Watch the <strong>positioning videos</strong> in the library above — each video covers one holder and clinical situation, from anterior to bitewing and endodontic.",
      "Position the sensor in the holder per the holder manufacturer's instructions.",
      "The list of recommended sensor holders is in IFU Appendix E.",
    ],
    source: { doc: "ifu", page: 37 },
  },
  {
    id: "imaging-software",
    category: "usage",
    question: "Does DC-Air include an imaging software?",
    keywords:
      "imaging software included come with viewer program missing no software free twain only interface "
      + "which where open launch start folder shortcut exe acquire xray button separate need",
    steps: [
      "Athlos supplies the <strong>TWAIN interface</strong> — the driver-level bridge that connects DC-Air to imaging software. It is not a separate imaging program.",
      "Your existing <strong>imaging software opens TWAIN by itself</strong>, usually from its acquire / X-ray button. <strong>Never open TWAIN manually</strong> from a folder, desktop shortcut or .exe — it is always launched by the imaging software.",
      "If your clinic does not have an imaging software, <strong>contact us</strong> — we can provide a very simple imaging software <strong>free of charge</strong>.",
    ],
    link: { href: "#contact", label: "Contact us about imaging software" },
    images: [
      { src: "/dc-air-training/assets/twain/twain-ready.webp", caption: "The TWAIN interface, opened by your imaging software" },
    ],
  },
  {
    id: "how-twain-works",
    category: "usage",
    question: "How does TWAIN work with DC-Air?",
    keywords:
      "twain how works work interface driver datasource status screen ui docked scanning connecting ready "
      + "green blue state meaning looks acquire flow explain understand stuck stays hangs forever long",
    steps: [
      "TWAIN is the standard interface between DC-Air and your imaging software. Your <strong>imaging software opens it</strong> from its acquire / X-ray button — you never open TWAIN from a folder yourself.",
      "While the sensor sits on the station, TWAIN shows <strong>DOCKED</strong> — the sensor is charging. Lift it off and wait 3 seconds.",
      "<strong>SCANNING</strong> (blue glow) — the dock is connecting to the sensor over Bluetooth. Give it a moment; no exposures yet.",
      "<strong>READY</strong> (green glow) — the sensor is connected and waiting for X-rays. <strong>Only expose when you see the green Ready state.</strong>",
      "After the exposure, TWAIN transfers the image and hands it to your imaging software automatically.",
    ],
    note: "The battery % and signal strength (dB) are shown next to the serial number — battery may drop 100% → 75% after one exposure, which is normal.",
    source: { doc: "guide", page: 5 },
    images: [
      { src: "/dc-air-training/assets/twain/twain-docked.webp", caption: "Docked — charging on the station" },
      { src: "/dc-air-training/assets/twain/twain-scanning.webp", caption: "Scanning — connecting over Bluetooth" },
      { src: "/dc-air-training/assets/twain/twain-ready.webp", caption: "Ready — green, safe to expose" },
    ],
  },
  {
    id: "software-integrations",
    category: "usage",
    question: "Does DC-Air work with my imaging software?",
    keywords:
      "integration integrate compatible compatibility works with imaging software program bridge twain "
      + "cadi dentrix ascend dexis dtx studio eaglesoft open dental oryx sota xdr xv capture "
      + "romexis sidexis carestream vixwin apteryx curve mediadent cliniview scanora demo",
    steps: [
      "Yes — almost certainly. DC-Air connects through the standard <strong>TWAIN</strong> interface used by virtually all dental imaging software.",
      "Short acquisition demo videos are available for the most common ones: CADI, Dentrix Ascend, Dexis 10, DTX Studio, Eaglesoft, Open Dental, Oryx Imaging, SOTA Image, XDR and XV Capture.",
      "If your software is not on that list, it almost certainly still works — contact us and we will confirm it for your setup.",
    ],
    link: { href: "#integrations", label: "Watch the integration demo videos" },
  },
  {
    id: "installation",
    category: "usage",
    question: "How do I install the system for the first time?",
    keywords: "install installation setup first time new start begin twain order antenna",
    steps: [
      "Fit the <strong>antenna</strong> firmly onto the docking station.",
      "Confirm the PC runs <strong>Windows</strong> (no tablets, no virtual machines).",
      "Connect the dock with the supplied cable <strong>directly to a PC USB port</strong>.",
      "<strong>Dock the sensor</strong>, confirm the dock LED is blue and both devices appear in Device Manager.",
      "Only then open TWAIN <strong>through your imaging software</strong> (its acquire / X-ray button) — never directly from a folder. The order matters: <strong>TWAIN after docking</strong>.",
      "If the status is not “Ready”, charge for at least 1 hour and re-check.",
    ],
    source: { doc: "guide", page: 3 },
  },
  {
    id: "calibration",
    category: "usage",
    question: "Calibration — new PC or “calibration file not found”",
    keywords: "calibration calibrate file not found error new computer pc changed cloud download udi",
    steps: [
      "The sensor is factory-calibrated; the calibration file downloads automatically from the Athlos cloud.",
      "When connecting to a new PC: <strong>dock the sensor and wait 30 seconds</strong> for the download.",
      "The practice needs internet access for this — without it, contact Technical Support to send the calibration files.",
      "If the file is not found or does not match the sensor's UDI, TWAIN shows an error — dock and wait, then restart TWAIN.",
    ],
    source: { doc: "ifu", page: 19 },
  },
  {
    id: "software-freeze",
    category: "usage",
    question: "TWAIN or imaging software froze / total system failure",
    keywords: "freeze frozen stuck crash hang software twain imaging not responding restart failure fail",
    steps: [
      "Place the sensor on the docking station.",
      "Close TWAIN, then exit the DC-Air service from the task bar (right-click → “Close DC-Air service”; use Task Manager if unresponsive).",
      "Close the imaging software.",
      "Unplug the dock's USB cable, <strong>wait 10 seconds</strong>, reconnect.",
      "Restart the imaging software and relaunch TWAIN.",
      "Dock the sensor and retrieve the last image with <strong>Download Last Image</strong> — do not retake.",
    ],
    source: { doc: "ifu", page: 18 },
  },
  {
    id: "rogue-triggers",
    category: "usage",
    question: "Sensor triggers by itself without X-rays",
    keywords: "self trigger rogue false ghost random itself spontaneous image without",
    steps: [
      "An isolated rogue trigger is rare and not, by itself, a fault.",
      "If rogue triggers occur <strong>at least once a day</strong>, contact Athlos customer care.",
      "Provide the log file and the .bin images from that day and the previous couple of days; request an RMA.",
    ],
    source: { doc: "guide", page: 9 },
  },

  // ----------------------------------------------------------------- cleaning
  {
    id: "disinfectants",
    category: "cleaning",
    question: "Which disinfectants are approved?",
    keywords: "disinfectant approved wipes clean product alcohol isopropyl cavi wipe allowed chemical",
    steps: [
      "<strong>CaviWipes™ (original)</strong> — Metrex Research",
      "<strong>ADVANTACLEAR™</strong> Surface Disinfectant Wipes — Hu-Friedy",
      "<strong>OPTIM® 1 Wipes</strong> — COLTENE SciCan",
      "<strong>Opti-Cide3®</strong> Surface Wipes — Micro-Scientific",
      "<strong>Isopropyl alcohol (70%)</strong>",
      "Unapproved disinfectants (e.g. acetone) can damage the device and void the warranty.",
    ],
    source: { doc: "ifu", page: 25 },
  },
  {
    id: "cleaning-protocol",
    category: "cleaning",
    question: "How do I clean and disinfect the sensor?",
    keywords: "clean cleaning disinfect disinfection protocol sterilize sterilise wash sanitize after patient how",
    steps: [
      "Remove and discard the sheath before removing gloves; place the sensor on a disposable-lined tray.",
      "Remove gloves, wash hands, put on new gloves.",
      "If visibly soiled, clean with a soapy cloth or recommended wipe and dry with a lint-free cloth.",
      "Wipe thoroughly <strong>at least 30 seconds</strong> with an approved disinfectant wipe. Repeat with a fresh wipe.",
      "Place the sensor on the docking station to charge, and store in a clean environment.",
      "Clean after <strong>every patient</strong>.",
    ],
    source: { doc: "ifu", page: 25 },
  },
  {
    id: "never-do",
    category: "cleaning",
    question: "What must I NEVER do to the sensor?",
    keywords: "never forbidden autoclave submerge water liquid uv wash laundry damage warranty acetone rules prohibited",
    steps: [
      "<strong>Never submerge</strong> the sensor in any liquid.",
      "<strong>Never autoclave</strong> — autoclave sterilisers permanently damage the device.",
      "<strong>Never use a UV chamber</strong>, and never wash or machine-wash the sensor.",
      "<strong>Never scrub the docking-station tabs</strong> — they will break.",
      "Never use forbidden disinfectants such as <strong>acetone</strong>.",
      "Never use the sensor in the mouth <strong>without a protective sheath</strong>.",
      "These mistakes are the most common causes of hardware failure — and they <strong>void the warranty</strong>.",
    ],
    source: { doc: "guide", page: 11 },
  },
  {
    id: "dock-cleaning",
    category: "cleaning",
    question: "How do I clean the docking station?",
    keywords: "dock station clean tabs clips pins contact wipe base charger",
    steps: [
      "The dock does not need routine cleaning — clean only if soiled or after patient contact, with the same approved wipes as the sensor.",
      "Disinfect the tabs <strong>non-invasively only</strong>: spray or a very gentle soft wipe.",
      "<strong>Never scrub, flex or bend the tabs</strong> or the spring-loaded contact pins — broken-by-scrubbing tabs are not covered by warranty.",
      "Never submerge or autoclave the dock.",
    ],
    source: { doc: "ifu", page: 26 },
  },

  // ------------------------------------------------------------------ service
  {
    id: "dropped",
    category: "service",
    question: "The sensor was dropped — what now?",
    keywords: "drop dropped fell floor fall damage crack dent inspect broken hit",
    steps: [
      "Inspect the housing before every use. <strong>Do not use the sensor</strong> if there are open cracks or punch-through dents.",
      "If damage is visible, remove the sensor from service and contact Athlos — improper functionality may result.",
      "Note the drop and any cleaning agents used; support will ask for this with an RMA.",
    ],
    source: { doc: "ifu", page: 14 },
  },
  {
    id: "front-cover",
    category: "service",
    question: "The sensor's front cover came off",
    keywords: "cover front came off detached open loose case shell housing",
    steps: [
      "Usual cause: a drop (often more than one), or submersion in a forbidden disinfectant such as acetone.",
      "<strong>Stop using the sensor.</strong> Note any drops and the cleaning agents used.",
      "Covers can be <strong>replaced at Athlos for a fee</strong> if the sensor was not internally damaged — contact Athlos to arrange assessment.",
    ],
    source: { doc: "guide", page: 9 },
  },
  {
    id: "broken-tabs",
    category: "service",
    question: "Docking-station tabs are broken",
    keywords: "tabs clips broken snap bent dock holder loose sensor falls",
    steps: [
      "Normal docking never breaks the tabs — the cause is essentially always <strong>harsh scrubbing</strong>, which is forbidden.",
      "Contact Athlos for a replacement dock.",
      "Going forward: disinfect the tabs non-invasively only (spray or very gentle soft wipe).",
    ],
    source: { doc: "guide", page: 10 },
  },
  {
    id: "support-info",
    category: "service",
    question: "What should I send when contacting support?",
    keywords: "support contact rma report problem fault information send email what need help ticket",
    steps: [
      "<strong>Date and approximate time</strong> of the issue — the single most useful item.",
      "What happened, in your own words; whether an image was received; whether Image Pending appeared.",
      "Sensor <strong>serial number</strong> and docking-station info.",
      "The <strong>log file</strong> from the PC (C:\\ProgramData\\AthlosDCAirTwain\\logs).",
      "Repository <strong>.bin files</strong> showing the issue, plus files from 2–3 days before.",
      "For physical damage: description of the cleaning process and photos.",
      "Send everything to <strong>support@athlos.fi</strong> or through your distributor.",
    ],
    source: { doc: "guide", page: 11 },
  },
  {
    id: "log-file",
    category: "service",
    question: "Where is the log file and how do I read it?",
    keywords: "log file location find read logs folder programdata error",
    steps: [
      "The Athlos log file is at <strong>C:\\ProgramData\\AthlosDCAirTwain\\logs</strong>.",
      "Most entries are plain English — match the <strong>timestamp</strong> of a complaint to the log entry.",
      "Key quality indicator: <strong>median</strong> should be &gt; 300, ideally &gt; 350.",
      "BLE signal should never be worse than <strong>−85 dB</strong>, ideally better than −75 dB during transfer.",
    ],
    source: { doc: "guide", page: 12 },
  },
  {
    id: "battery-replace",
    category: "service",
    question: "Can I replace the battery myself?",
    keywords: "battery replace change open compartment service repair swap yourself",
    steps: [
      "<strong>No.</strong> The battery is changeable only by authorized service personnel.",
      "Do not try to open the device — all battery repairs must be performed by service.",
      "If there is a service problem, contact your dealer service representative or DC-Air Technical Support.",
    ],
    source: { doc: "ifu", page: 24 },
  },
  {
    id: "pacemaker",
    category: "service",
    question: "Is the dock safe near pacemakers?",
    keywords: "pacemaker magnet icd implant safety distance heart defibrillator",
    steps: [
      "The docking station contains a <strong>magnet</strong> for coupling the sensor.",
      "Keep the docking station <strong>at least 15 cm (6″)</strong> from pacemakers or ICDs.",
    ],
    source: { doc: "ifu", page: 15 },
  },
  {
    id: "warranty",
    category: "service",
    question: "What voids the warranty?",
    keywords: "warranty void guarantee covered claim broken cause",
    steps: [
      "Damage from <strong>forbidden handling</strong>: submerging, autoclaving, UV chambers, washing, scrubbing the dock tabs, acetone, or use without a sheath.",
      "Damage resulting from <strong>drops</strong> may also void the warranty.",
      "When in doubt, contact Athlos for an assessment before continuing use.",
    ],
    source: { doc: "guide", page: 11 },
  },
];

export default { categories: CATEGORIES, faq: FAQ };
