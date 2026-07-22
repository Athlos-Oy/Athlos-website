// Generates the DC-Air Chairside Quick Reference card PDF (A4).
import QRCode from "qrcode";
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const qrDataUri = await QRCode.toDataURL("https://athlos.fi/dc-air-training?k=AthDTrai2006", {
  errorCorrectionLevel: "M", margin: 1, width: 320,
  color: { dark: "#0d1620", light: "#ffffff" },
});

const logoB64 = readFileSync("Z:/Athlos-website/scripts/chairside-card-logo.png").toString("base64");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:"Segoe UI",Arial,sans-serif; color:#263035; width:210mm; height:297mm; padding:11mm 12mm; }
  .head { display:flex; align-items:center; justify-content:space-between; border-bottom:3px solid #0d1620; padding-bottom:4mm; margin-bottom:4.5mm; }
  .head img { height:16mm; }
  .head .t { text-align:right; }
  .head h1 { font-size:19pt; letter-spacing:-0.01em; color:#0d1620; }
  .head p { font-size:9.5pt; color:#68737b; }
  .tag { display:inline-block; font-size:7pt; font-weight:700; letter-spacing:0.08em; color:#1c6ea4; text-transform:uppercase; margin-bottom:1mm; }
  h2 { font-size:11.5pt; color:#0d1620; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2.2mm; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:4mm; }
  .panel { border:1.2pt solid #d7dde1; border-radius:3mm; padding:4.5mm 5mm; margin-bottom:5mm; }

  .led-row { display:flex; align-items:center; gap:2.5mm; padding:2.1mm 0; border-bottom:0.6pt solid #eef1f3; font-size:9.6pt; }
  .led-row:last-child { border-bottom:none; }
  .dot { width:4.2mm; height:4.2mm; border-radius:50%; flex-shrink:0; border:0.6pt solid rgba(0,0,0,0.15); }
  .g { background:#3fb960; } .g2 { background:linear-gradient(90deg,#3fb960 50%,#e8ecef 50%); }
  .y { background:#f4c430; } .off { background:#e8ecef; } .b { background:#43a1d8; }
  .led-row b { width:30mm; flex-shrink:0; }

  .prob { padding:2.8mm 0; border-bottom:0.6pt solid #eef1f3; }
  .prob:last-child { border-bottom:none; }
  .prob h3 { font-size:10.5pt; color:#0d1620; margin-bottom:0.8mm; }
  .prob h3 .n { display:inline-block; width:5.5mm; height:5.5mm; line-height:5.5mm; text-align:center; background:#0d1620; color:#fff; border-radius:50%; font-size:8pt; margin-right:1.6mm; }
  .prob p { font-size:9.4pt; line-height:1.42; color:#3d4850; padding-left:7.1mm; }
  .prob p b { color:#0d1620; }

  .rules { display:grid; grid-template-columns:1fr 1fr; gap:1.8mm 5mm; font-size:9.4pt; }
  .rules div { padding-left:4.5mm; position:relative; line-height:1.4; }
  .rules div::before { content:"✓"; position:absolute; left:0; color:#1c6ea4; font-weight:700; }
  .rules div.no::before { content:"✕"; color:#c0392b; }

  .foot { display:flex; align-items:center; gap:6mm; border:1.2pt solid #d7dde1; border-radius:3mm; padding:4.5mm 5mm; }
  .foot img.qr { width:30mm; height:30mm; }
  .foot .c { font-size:9.6pt; line-height:1.55; }
  .foot .c b { font-size:9.5pt; color:#0d1620; }
  .foot .c .url { color:#1c6ea4; font-weight:600; }
  .vers { text-align:right; font-size:7pt; color:#8c959b; margin-top:2.5mm; }
</style></head><body>
  <div class="head">
    <img src="data:image/png;base64,${logoB64}" alt="Athlos">
    <div class="t">
      <div class="tag">DC-Air&reg; &middot; Chairside Quick Reference</div>
      <h1>Keep this card next to your X-ray unit</h1>
      <p>The five most common issues &mdash; solved in under a minute</p>
    </div>
  </div>

  <div class="grid">
    <div class="panel">
      <h2>What is the light telling you?</h2>
      <div class="led-row"><span class="dot g2"></span><b>Double green flash</b><span>Connected &mdash; ready to use</span></div>
      <div class="led-row"><span class="dot y"></span><b>Flashing yellow</b><span>Battery low &mdash; dock 15 min</span></div>
      <div class="led-row"><span class="dot y"></span><b>Steady yellow</b><span>Error / battery empty &mdash; dock &amp; charge</span></div>
      <div class="led-row"><span class="dot off"></span><b>Light off</b><span>Asleep &mdash; dock 10 s to wake</span></div>
      <div class="led-row"><span class="dot b"></span><b>Dock steady blue</b><span>Powered &mdash; sensor charging</span></div>
    </div>
    <div class="panel">
      <h2>Golden rules</h2>
      <div class="rules">
        <div>New sheath for every patient</div>
        <div>Dock after every use</div>
        <div>Wait 3 s after undocking</div>
        <div>Hold sensor outside mouth during transfer</div>
        <div>Launch TWAIN only after docking</div>
        <div>Dock overnight, PC on</div>
        <div class="no">Never dock during image transfer</div>
        <div class="no">Never autoclave or submerge</div>
      </div>
    </div>
  </div>

  <div class="panel">
    <h2>Top 5 problems &mdash; what to do</h2>
    <div class="prob"><h3><span class="n">1</span>No image after exposure</h3>
      <p><b>Do not retake.</b> The image is saved in the sensor. In TWAIN, press <b>&ldquo;Download Last Image&rdquo;</b>. If frozen: restart TWAIN, then Download Last Image.</p></div>
    <div class="prob"><h3><span class="n">2</span>Wireless connection keeps dropping</h3>
      <p>Screw the <b>antenna</b> on firmly. Keep the dock <b>in front of the patient</b> (&plusmn;45&deg;), never behind the head. Hold the sensor <b>outside the mouth</b> during transfer.</p></div>
    <div class="prob"><h3><span class="n">3</span>Battery low (yellow flashing)</h3>
      <p>Dock <b>15 minutes</b> &mdash; enough for a full mouth series. Battery empty (light off): dock <b>25 minutes</b> before use.</p></div>
    <div class="prob"><h3><span class="n">4</span>Sensor does not respond</h3>
      <p>It is asleep. Place it on the docking station and <b>wait 10 seconds</b> &mdash; then check TWAIN shows &ldquo;Ready&rdquo;.</p></div>
    <div class="prob"><h3><span class="n">5</span>Image looks grainy / noisy</h3>
      <p>Under-exposure. Use <b>70 kV</b> for adults and increase the exposure time slightly.</p></div>
  </div>

  <div class="foot">
    <img class="qr" src="${qrDataUri}" alt="QR">
    <div class="c">
      <b>Need more? Scan the code.</b><br>
      Positioning videos, all answers and full guides &mdash; the QR code signs you in automatically.<br>
      <span class="url">athlos.fi/dc-air-training</span> &nbsp;&middot;&nbsp; support@athlos.fi
    </div>
  </div>
  <div class="vers">DC-Air&reg; Chairside Quick Reference &middot; v1 &middot; July 2026 &middot; Athlos Oy &middot; Not a replacement for the IFU</div>
</body></html>`;

writeFileSync("Z:/Athlos-website/scripts/card-preview.tmp.html", html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file:///Z:/Athlos-website/scripts/card-preview.tmp.html", { waitUntil: "networkidle" });
await page.pdf({
  path: "C:/Users/EVANGE~1.SPA/AppData/Local/Temp/claude/--fs-Userdata-evangelos-spartiotis/10affb49-da01-4676-a7e5-1a6148063595/scratchpad/upload-staging/docs/DC-Air_Chairside_Quick_Reference_2026-07.pdf",
  format: "A4", printBackground: true,
});
await browser.close();
console.log("PDF generated");
