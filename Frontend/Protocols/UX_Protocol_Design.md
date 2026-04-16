# Tour Planner — Intermediate Submission Protocol

## 1. UX Description

The Tour Planner is a web-based single-page application built with Angular. It follows a two-screen flow: **Login/Register** for authentication, then the **Dashboard** where all tour planning happens.

---

## 2. Initial Wireframes

The original wireframes were created at the start of the project to define the basic layout and feature placement.

### Initial Dashboard Wireframe (Desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│ [■] Tour Planner    Plan Route   Get Routes   Impr.  [Login][Reg]│
├──────────────────────────┬───────────────────────────────────────┤
│                          │                                       │
│  Plan your Route:        │                                       │
│                          │              ╲    ╱                   │
│  From: [____________]    │               ╲  ╱                    │
│                          │                ╲╱                     │
│  To:   [____________]    │                ╱╲                     │
│                          │               ╱  ╲                    │
│                          │              ╱    ╲                   │
│                          │         (Map Placeholder)             │
│                          │                                       │
│                          │                                       │
│                          │                                       │
│  [Add] [Update] [Delete] [Modify]                                │
└──────────────────────────┴───────────────────────────────────────┘
```

### Initial Dashboard Wireframe (Mobile)

```
┌─────────────────────────┐
│ [■] Tour Planner        │
│  Plan Route  Get Routes │
│  Impr.  [Login] [Reg]   │
├─────────────────────────┤
│                         │
│  Plan your Route:       │
│                         │
│  From: [____________]   │
│                         │
│  To:   [____________]   │
│                         │
│                         │
│  [Add]                  │
│  [Update]               │
│  [Delete]               │
│  [Modify]               │
│                         │
└─────────────────────────┘
```

---

## 3. Design Evolution — What Changed and Why

The initial wireframes defined a simple two-panel layout (form left, map right) with navigation links in the top bar. During development, several design decisions evolved the UI significantly:

### 3.1 Login Screen — Added

The initial wireframe had Login/Register buttons in the top bar as navigation links. We moved authentication to a **dedicated full-screen Login/Register page** with a centered card layout. This provides a cleaner onboarding experience and separates auth from the main app.

### 3.2 Dashboard Layout — From 2-Panel to List + Map + Bottom Drawer

**Initial concept:** Form inputs on the left, map on the right, CRUD buttons at the bottom.

**Problem:** This mixes the tour list, tour creation form, and tour details into a single left panel. There is no clear separation between browsing existing tours and creating new ones. The map also has no route visualization.

**Final layout:**
- **Left sidebar** — dedicated scrollable tour list with search, transport type icons, and inline stats. This replaces the flat form + button approach with a proper content browser.
- **Center** — interactive Leaflet map showing the actual route with markers and route lines. The map is always visible and takes the majority of the screen.
- **Bottom panel** — slides up from the bottom when a tour is selected or a form is opened. Contains tour details (info + logs side by side) or the create/edit forms. This approach keeps the map visible while viewing details.

**Why bottom panel instead of right column:** The original 3-column approach (list | map | detail) compressed the map too much and made the detail panel too narrow for addresses and log tables. The bottom panel gives horizontal space for a proper layout and keeps the map fully visible above.

### 3.3 Tour Selection — Toggle Behavior

The initial wireframe had no concept of selecting a tour from a list. We added:
- Click a tour card → bottom panel slides up with details
- Click the same tour again → panel closes, tour is deselected
- This toggle makes browsing tours feel lightweight and non-committal.

### 3.4 Map Interaction — Click to Set Points

The initial wireframe had simple text inputs for From/To. We kept text inputs but added:
- **Geocoding on blur** — type a place name, leave the field, coordinates are resolved automatically
- **Map click mode** — when the tour form is open, clicking the map sets start (first click) and destination (second click), with reverse geocoding filling the text fields
- **Live route calculation** — as soon as both points are set, the route is calculated and drawn on the map in real-time

### 3.5 Visual Theme — Cartographer's Atlas

The initial wireframe used a generic dark UI. We developed a "Cartographer's Atlas" design theme:
- Dark leather-brown backgrounds for immersion
- Brass/gold accents for interactive elements (buttons, highlights, selected states)
- Ruby red for destructive actions and the log form (visual distinction from the tour form)
- Sepia CSS filter on map tiles for an aged-map look
- Serif typography (Cinzel, Cormorant Garamond, IM Fell English) for a cartographic feel
- SVG icons instead of emoji for consistency and scalability

### 3.6 Responsive Design

The initial wireframes showed a basic responsive stacking. The final implementation uses:
- **Desktop (>1024px):** sidebar (380px) + map (flex) side by side, bottom panel (480px) pushes map up
- **Tablet (768–1024px):** sidebar narrows to 320px
- **Mobile (<768px):** sidebar and map stack vertically, map collapses when bottom panel is open, dashboard becomes scrollable

---

## 4. Final Wireframes

### Login / Register Screen

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ┌───────────────────────────────┐              │
│              │      [Compass Rose Logo]      │              │
│              │       TOUR PLANNER            │              │
│              │    Sign in to your atlas       │              │
│              │                               │              │
│              │   ┌─────────┬───────────┐     │              │
│              │   │  LOGIN  │ REGISTER  │     │              │
│              │   └─────────┴───────────┘     │              │
│              │                               │              │
│              │   USERNAME                    │              │
│              │   ┌───────────────────────┐   │              │
│              │   │ [user] Enter username │   │              │
│              │   └───────────────────────┘   │              │
│              │                               │              │
│              │   PASSWORD                    │              │
│              │   ┌───────────────────────┐   │              │
│              │   │ [lock] Enter password │   │              │
│              │   └───────────────────────┘   │              │
│              │                               │              │
│              │   ┌───────────────────────┐   │              │
│              │   │      SIGN IN  →       │   │              │
│              │   └───────────────────────┘   │              │
│              └───────────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard — No Tour Selected

```
┌──────────────────────────────────────────────────────────────────┐
│ [Compass] TOUR PLANNER                                  [LOGOUT] │
├──────────────────┬───────────────────────────────────────────────┤
│ TOURS        [+] │                                               │
│                  │                                               │
│ [Search...]      │                                               │
│                  │                                               │
│ ┌──────────────┐ │                                               │
│ │[bike] Wien   │ │                                               │
│ │ Wien → Graz  │ │              LEAFLET MAP                      │
│ │ 200km  8h  3 │ │         (sepia-tinted tiles)                  │
│ └──────────────┘ │                                               │
│ ┌──────────────┐ │           route drawn when                    │
│ │[hike] Trail  │ │           tour is selected                    │
│ │ Ibk → Hafel. │ │                                               │
│ │ 12km  4h  5  │ │                                               │
│ └──────────────┘ │                                               │
│ ┌──────────────┐ │                                               │
│ │[run] Donau   │ │                                               │
│ └──────────────┘ │                                               │
│ ┌- - - - - - -┐  │                                               │
│ │    + Add     │  │                                               │
│ └- - - - - - -┘  │                                               │
├──────────────────┴───────────────────────────────────────────────┤
│                    (no bottom panel — nothing selected)          │
└──────────────────────────────────────────────────────────────────┘
```

### Dashboard — Tour Selected (Bottom Panel Open)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Compass] TOUR PLANNER                                  [LOGOUT] │
├──────────────────┬───────────────────────────────────────────────┤
│ TOURS        [+] │                                               │
│ [Search...]      │         LEAFLET MAP (shrunk)                  │
│ ┌──────────────┐ │         route + markers visible               │
│ │▸ Wien → Graz │ │                                               │
│ └──────────────┘ │                                               │
│ ┌──────────────┐ │                                               │
│ │  Trail       │ │                                               │
│ └──────────────┘ │                                               │
├──────────────────┴──────────────────────────┬─────[Close]────────┤
│  WIEN → GRAZ                                │ LOGS (3)     [+Add]│
│  [Bike]  [Export] [Edit] [Delete]           │                    │
│                                              │ 12.Mär 2025  ★★★★ │
│  Classic Austrian road trip through...       │ 205km 9h  MEDIUM   │
│                                              │                    │
│  ┌──────┐ ┌──────┐ ┌──────┐                 │ 05.Feb 2025  ★★★   │
│  │ From │ │  To  │ │ Dist │                  │ 198km 8h30 EASY    │
│  │ Wien │ │ Graz │ │200km │                  │                    │
│  ├──────┤ ├──────┤ ├──────┤                  │ 14.Jan 2025  ★★    │
│  │ Time │ │ Pop  │ │Child │                  │ 210km 10h  HARD    │
│  │  8h  │ │  3   │ │ 2/5  │                  │                    │
│  └──────┘ └──────┘ └──────┘                 │                    │
└──────────────────────────────────────────────┴────────────────────┘
```

### Tour Form (in Bottom Panel)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Compass] TOUR PLANNER                                  [LOGOUT] │
├──────────────────┬───────────────────────────────────────────────┤
│ TOURS        [+] │    MAP (interactive — click to set points)    │
│ [Search...]      │    HUD: [● set start] [● set destination]    │
│ ┌──────────────┐ │                                               │
│ │  Tour cards  │ │                                               │
│ └──────────────┘ │                                               │
├──────────────────┴──────────────────────────┬─────[Close]────────┤
│  NEW TOUR                             [X]  │                     │
│                                             │                     │
│  Tour Name          Transport Type          │  Route Stats:       │
│  [____________]     [Bike][Hike]            │  ┌──────┬─────┐    │
│                     [Run ][Vac ]            │  │ Dist │Time │    │
│  From          To                           │  │12 km │2h30 │    │
│  [________] ● [________] ●                 │  └──────┴─────┘    │
│                                             │                     │
│  Description (optional)    Image (optional) │  Calculating...     │
│  [____________________]   [______________] │                     │
│                                             │                     │
│  [Cancel]  [═══ CREATE TOUR ═══]           │                     │
└─────────────────────────────────────────────┴─────────────────────┘
```

---

## 5. UI Flow

```
   ┌──────────────────┐
   │  LOGIN / REGISTER │
   │     (full page)   │
   └────────┬─────────┘
            │ successful login
            ▼
   ┌──────────────────────────────────────┐
   │   DASHBOARD                          │
   │   ┌───────────┬────────────────┐     │
   │   │ Tour List │   Leaflet Map  │     │
   │   └───────────┴────────────────┘     │
   │                                      │
   │   (click tour → panel slides up)     │
   │   (click again → panel closes)       │
   └──────────────┬───────────────────────┘
                  │
    ┌─────────────┼──────────────┐
    │             │              │
    ▼             ▼              ▼
┌────────┐  ┌─────────┐  ┌──────────┐
│ Detail │  │Tour Form│  │ Log Form │
│(bottom)│  │(bottom) │  │ (bottom) │
└────┬───┘  └────┬────┘  └────┬─────┘
     │           │             │
     └─── Save / Cancel ──────┘
                 │
                 ▼
         back to Dashboard
         (map always visible)
```

---

## 6. Design Decisions Summary

| Decision | Rationale |
|---|---|
| Dedicated login page | Cleaner than nav-bar auth buttons; separates auth from app |
| Tour list as sidebar | Browsable index instead of flat form; supports search and selection |
| Bottom panel instead of right column | More horizontal space for content; map stays visible above |
| Toggle selection | Click to open, click again to close — lightweight browsing |
| Map click for coordinates | Faster than typing addresses; visual confirmation of points |
| Auto-route calculation | Immediate feedback; no manual "calculate" button needed |
| Sepia map filter | Thematic consistency with cartographer design |
| SVG icons over emoji | Consistent sizing, scalable, no platform-dependent rendering |
| In-flow bottom panel (not overlay) | Map remains clickable for setting From/To during tour creation |
| Responsive stacking | Mobile: list dominates, map shrinks, panel scrollable |
