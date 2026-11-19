# VoltBridge — KSRTC Charging Management Prototype

A front-end demonstration for a wireless EV-bus charging and invoice-routing workflow.

## Run
1. Extract the ZIP.
2. Open `index.html` in Chrome, Edge, or Firefox.
3. No installation or server is required.

## Demo features
- Central network overview with charging KPIs and recent sessions.
- Charging records with search, depot/status filters, and CSV export.
- Depot accounts and individual depot manager views.
- Bus unique-code lookup mapped to its registered bus number and depot.
- Simulated charging event: enter a bus code, energy and rate to generate an invoice and route it to the mapped depot.
- Responsive layout for desktop and mobile.

## Demo bus codes
- `KSRTC-KNR-2048` — Kannur Depot
- `KSRTC-EKM-1172` — Ernakulam Depot
- `KSRTC-TVM-3021` — Thiruvananthapuram Depot
- `KSRTC-KKD-8810` — Kozhikode Depot

## Important prototype note
This is a browser-only UI prototype. Sample records and bus mappings are stored in `app.js`; changes are held in memory and reset on refresh. It does not connect to KSRTC systems, real QR scanners, payment gateways, or a central database. A production version would require authenticated APIs, a database, role-based depot access, invoice storage, and secure audit logging.

**BUILD FOR KSRTC BY MeshMango technologies**
