# B2B DATA GLOBAL LLC — Custom Web Platform

A handcrafted, clean, unminified, multi-page website built with **pure HTML5, CSS3, and Vanilla JavaScript (ES6+)**. No third-party frameworks, build tools, or minified mystery bundles required.

---

## 🌟 What Was Built

1. **Brand Identity:**
   - **Name**: **B2B DATA GLOBAL LLC** *(customizable in HTML/CSS)*
   - **Tagline**: *Verified Intelligence · Worldwide*
   - **Color Palette**: Emerald Green (`#0e7c6b`), Deep Forest (`#062b26`), Soft Cream (`#fdfbf6`), and Metallic Gold (`#e8c34a`).

2. **Core Pages:**
   - [`index.html`](index.html): Homepage with 3D Globe, 3D Segment Mesh, 16-industry carousel, live pipeline stream, curated lists search, and FAQ accordion.
   - [`about.html`](about.html): Company overview, 75M+ metric breakdown, 4 data collection sources, interactive 7-step verification carousel, and company journey timeline.
   - [`events.html`](events.html): Complete searchable global events database with industry filters, location search, and attendee/exhibitor counts.
   - [`services.html`](services.html): Complete breakdown of 13 data services (*Email Appending, Validation, Cleansing, Enrichment, Lead Management, etc.*) and 6-step implementation methodology.
   - [`mailing-lists.html`](mailing-lists.html): 16 Industry mailing lists and C-Level executive contact directories with sample data previews.
   - [`contact.html`](contact.html): Interactive inquiry form with 4 request types (*Sample Request, Enterprise Quote, Supplier, General*), direct phone, email, and WhatsApp links.
   - [`privacy.html`](privacy.html), [`terms.html`](terms.html), [`refund.html`](refund.html): Complete legal compliance pages.

3. **Interactive JavaScript Canvas Visualizations:**
   - **3D Canvas Globe** (`js/globe.js`): Drag to rotate, spherical math projection, global city hubs, animated geodesic arcs, and traveling photons.
   - **3D Segment Mesh** (`js/mesh.js`): Interactive 3D network with depth-sorted polygonal nodes and hover highlights.
   - **Live Pipeline Stream** (`js/stream.js`): Real-time animated records moving across Source → Verify → Enrich → Deliver lanes with play/pause and speed controls.
   - **Footer Ambient Particles** (`js/stream.js`): Physics-driven canvas network with mouse repulsion.
   - **Multi-Step Requirement Modal** (`js/main.js`): Multi-step lead capture modal with exit-intent and scroll triggers.

---

## 🚀 How to Run Locally

### 1. One-Click Double Click (Windows)
Double-click on **`start-server.bat`**. It will automatically start the server and open your default browser to:
```
http://localhost:3000/
```

### 2. From PowerShell Terminal
```powershell
.\serve.ps1
```

### 3. Using VS Code Live Server
Right-click on `index.html` and select **"Open with Live Server"**.

---

## 🛠️ How to Customize Branding & Details

- **Company Name**: Open `index.html` (and other `.html` files) and search for `B2B DATA GLOBAL` to replace with your desired business name.
- **Phone & Email**: Search for `+1 (908) 320-3081` and `sales@b2bdatallc.com` to insert your team's direct contacts.
- **Colors**: Open `css/style.css` and modify the CSS variables at the top of the file under `:root`.
