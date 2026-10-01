# LUMIÈRE — Master v0.dev Generation Prompt & UI Specification

This document provides the complete, copy-paste ready prompt and specification designed for **v0 by Vercel (`v0.dev`)** to generate the redesigned, unified frontend interface for **Lumière**.

It translates the findings, architecture, tokens, and operational workflows from [`docs/LUMIERE_UI_UX_PREBRAND_AUDIT.md`](file:///c:/Users/adndnys/Downloads/Lumiere-UI-main/docs/LUMIERE_UI_UX_PREBRAND_AUDIT.md) and [`docs/dsd-lumiere.md`](file:///c:/Users/adndnys/Downloads/Lumiere-UI-main/docs/dsd-lumiere.md) into an actionable prompt that produces production-ready React, Tailwind CSS, and Lucide components.

---

## Part 1: Quick Copy-Paste Prompt for v0.dev

Copy and paste the prompt below directly into **v0.dev**:

```markdown
Create a luxury, high-density enterprise operations platform for "Lumière" — a premier Event Styling & Forensic Operations Platform.

AESTHETIC IDENTITY: "Paper & Ink / Walnut Bronze & Polished Brass Gold"
- Light Theme: Warm cream parchment background (#f5f0e8), charcoal ink text (#272522), parchment card (#fbf8f2), walnut bronze primary (#9b6b3f), warm sand secondary (#e8dfd2), muted earth borders (#d8cec0), terracotta destructive (#a84d3b).
- Dark Theme: Deep espresso black (#181715), warm linen text (#f0ece1), charcoal board (#22201d), polished brass gold (#c49666), smoked bronze borders (#38342e).
- Typography: Display/Headings in elegant Serif (Cinzel / Playfair Display / Georgia), UI labels and data in crisp Sans (Montserrat / Inter), with small uppercase tracking on section eyebrows (text-[0.65rem] tracking-[0.18em] font-semibold uppercase).
- Elevation: Ambient subtle glows on active cards (box-shadow 0 0 20px -3px rgba(155,107,63,0.25) in light mode, rgba(196,150,102,0.3) in dark mode).

KEY ARCHITECTURAL REQUIREMENTS (Consolidating fragmented layouts into a Unified AppShell):
1. UNIFIED APP SHELL:
   - Left 64px collapsible icon rail with active walnut/gold indicator pills. Expandable drawer showing module groups: Strategic Oversight (Executive), Identity & Governance (Admin), Event Planning & Canvas (PM), Warehouse Floor Logistics (WOM), and Mobile Field Operations (Ground Crew).
   - Global Top Bar with:
     * Lumière wordmark with subtle serif styling
     * Role Switcher dropdown (Executive, Platform Admin, Project Manager, Warehouse Lead, Ground Crew)
     * Real-time Operational Readiness Pill ("All Systems Synchronized — Checkpoint Polling 30s")
     * Universal Command Palette search trigger ("Cmd + K" / "Search events, assets, manifests...")
     * Light/Dark mode toggle and user profile avatar with PIN security status indicator

2. ROLE-ADAPTIVE DASHBOARD VIEW (Interactive tabs / switcher):
   - VIEW A: EXECUTIVE & PORTFOLIO OVERVIEW
     * KPI Stat Cards with ambient glow: Active High-Tier Galas (4), Equipment Buffer Lockouts (12 items), Open Damage Liability ($18,450 hold), Manning SLA Compliance (98.4%).
     * Event Portfolio Distribution Chart & Live Activity Feed.
     * Quick-approval action drawer for pending damage verdicts.
   
   - VIEW B: FORENSIC DAMAGE VERIFICATION CENTER (Dual-Custody State Machine)
     * Incident triage ledger showing damage claims submitted by field crew.
     * Detail Inspector modal showing cryptographic photo proof: HAVA SHA-256 photo hash verification badge, camera EXIF metadata, GPS geotag, and damage severity.
     * Dual Sign-off gate: If photo is contested, requires TWO distinct executive sign-offs with 6-digit confirmation PIN before moving to "Repair" or "Write-off".
   
   - VIEW C: EVENT CREATION & TEMPORAL CONFLICT PREVENTION ENGINE
     * Register Event drawer with live conflict engine.
     * Dynamic Conflict Banner: If title overlap >= 75% or same venue on overlapping dates, display RED HARD BLOCK preventing save. If same date with different venue, display AMBER ADVISORY for resource contention.
   
   - VIEW D: DEFICIT REPLENISHMENT & VENDOR ROUTING
     * Asset deficit queue (e.g. 50 Burgundy Velvet Table Runners needed).
     * Reorder Requisition modal with matched vendor cards (showing supplier rating, delivery lead-time, and PO generator).

3. INTERACTION & POLISH:
   - Provide interactive state: switching roles updates the view, clicking stat cards triggers click-flash animation, clicking a damage report opens the verification modal, and searching filters the table.
   - Use Lucide icons throughout (ShieldCheck, AlertTriangle, Calendar, Layers, Truck, Users, Sparkles, Search, Sun, Moon, Hash, CheckCircle2).
   - Fully responsive: Clean desktop workstation feel with high information density, collapsing gracefully into tablet and mobile viewport shells.
```

---

## Part 2: Detailed Technical UI Specification

### 1. Color Tokens & Theme Configuration

```css
:root {
  --background: #f5f0e8;
  --foreground: #272522;
  --card: #fbf8f2;
  --card-foreground: #272522;
  --popover: #fbf8f2;
  --popover-foreground: #272522;
  --primary: #9b6b3f;
  --primary-foreground: #fbf8f2;
  --secondary: #e8dfd2;
  --secondary-foreground: #272522;
  --muted: #eee7dc;
  --muted-foreground: #756f67;
  --accent: #e8dfd2;
  --accent-foreground: #272522;
  --destructive: #a84d3b;
  --destructive-foreground: #fbf8f2;
  --border: #d8cec0;
  --input: #d8cec0;
  --ring: #9b6b3f;
  --radius: 0.5rem;
}

.dark {
  --background: #181715;
  --foreground: #f0ece1;
  --card: #22201d;
  --card-foreground: #f0ece1;
  --popover: #22201d;
  --popover-foreground: #f0ece1;
  --primary: #c49666;
  --primary-foreground: #181715;
  --secondary: #2d2924;
  --secondary-foreground: #f0ece1;
  --muted: #2a2723;
  --muted-foreground: #a69f93;
  --accent: #2d2924;
  --accent-foreground: #f0ece1;
  --destructive: #c25e4a;
  --destructive-foreground: #f0ece1;
  --border: #38342e;
  --input: #38342e;
  --ring: #c49666;
}
```

### 2. Semantic Status Badge Specification

Replace scattered hardcoded colors with a single unified component:

```tsx
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  pulse?: boolean;
}
```

### 3. Core Operational Data Contracts

```typescript
export interface LumiereEvent {
  id: string;
  title: string;
  client: string;
  venue: string;
  dateStart: string;
  dateEnd: string;
  tier: 'Diamond Signature' | 'Gold Tier' | 'Corporate Gala' | 'Intimate Soirée';
  status: 'In Production' | 'Reserved' | 'Completed' | 'Advisory Conflict' | 'Hard Block';
  allocatedAssetsCount: number;
  bufferDays: number; // 1 day local, 3 days national
}

export interface DamageException {
  id: string;
  assetId: string;
  assetName: string;
  eventTitle: string;
  reportedBy: string;
  reportedAt: string;
  photoUrl: string;
  photoSha256: string;
  exifTimestamp: string;
  gpsCoords: string;
  severity: 'Minor Scuff' | 'Structural Fracture' | 'Total Loss';
  verdict: 'Pending Review' | 'Validated' | 'Audit Hold' | 'Second Sign-off Required' | 'Dismissed';
  signOffCount: number; // Requires 2 for audit-hold resolution
  escrowHoldAmount: number;
}

export interface DeficitItem {
  id: string;
  eventId: string;
  eventName: string;
  itemName: string;
  category: string;
  quantityNeeded: number;
  quantityInWarehouse: number;
  deficitQuantity: number;
  urgency: 'Immediate Ingress' | 'High' | 'Standard';
  vendorOption: {
    name: string;
    leadTimeHours: number;
    unitCost: number;
    rating: number;
  };
  status: 'Not Purchased' | 'In Procurement' | 'Dispatched';
}
```

### 4. Interactive Workflows to Showcase in v0

1. **Role Switcher Navigation**: Switching between Executive, Admin, Project Manager, Warehouse Ops, and Ground Crew dynamically updates the active workspace and breadcrumbs without breaking layout framing.
2. **Forensic Damage Modal**: Clicking on a damage claim row opens a slide-over/modal with high-res photo preview, SHA-256 fingerprint badge, EXIF tamper-check badge, and dual-executive sign-off counter.
3. **Event Registration Conflict Checker**: Modal with Title, Venue, and Date pickers that detects date/venue overlaps and title similarities in real-time.
4. **Command Palette (`Cmd + K`)**: Keyboard listener or top-bar search bar opening a modal overlay for instant jumping across events, inventory SKUs, crew members, and manifests.
