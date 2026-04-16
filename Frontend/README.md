# Tour Planner — Frontend

A web-based tour planning application built with **Angular 21** and **Leaflet**.
Users can create, manage and log bike, hike, running and vacation tours with
interactive map routing via OpenRouteService.

## Prerequisites

- **Node.js** (v18 or higher) and **npm**
- An **OpenRouteService API key** (free at [openrouteservice.org/dev/#/signup](https://openrouteservice.org/dev/#/signup))

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API key

Copy the environment template and add your OpenRouteService API key:

```bash
cp src/environments/environment.template.ts src/environments/environment.ts
```

Then open `src/environments/environment.ts` and replace the placeholder:

```ts
export const environment = {
  orsApiKey: 'YOUR_API_KEY_HERE'  // ← paste your key here
};
```

> **Important:** `environment.ts` is in `.gitignore` and will not be committed.
> This keeps the API key out of version control as required by the project specification.

### 3. Start the development server

```bash
ng serve
```

If you don't have Angular CLI installed globally, use:

```bash
npx ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.
The app reloads automatically when you change source files.

## Demo Login

For development, the following mock users are available:

| Username | Password |
|----------|----------|
| `admin`  | `admin`  |
| `user`   | `user`   |

## Project Structure

```
src/app/
├── components/
│   ├── auth/                  # Login / Register screen
│   ├── dashboard/             # Main layout (list + map + bottom panel)
│   ├── tour-list/             # Sidebar with tour cards and search
│   ├── tour-detail/           # Tour info + logs (bottom panel)
│   ├── tour-form/             # Create / edit tour form
│   ├── tour-log-form/         # Create / edit log form
│   └── shared/
│       ├── map-display/       # Reusable Leaflet map component
│       └── popup/             # Reusable confirmation / info popup
├── models/
│   ├── tour.ts                # Tour interface + TransportType enum
│   └── tour_log.ts            # TourLog interface + Difficulty enum
├── services/
│   ├── auth.ts                # Authentication service (mock)
│   ├── tour.ts                # Tour + Log CRUD, search, import/export
│   └── open-route.service.ts  # OpenRouteService API (geocoding, routing)
├── mock_data/
│   ├── mock_tours.ts          # Sample tours
│   └── mock_tour_logs.ts      # Sample logs
└── environments/
    └── environment.template.ts  # API key template (committed)
```

## Features

- User authentication (login / register)
- Tour CRUD with name, description, from, to, transport type, image URL
- Interactive Leaflet map with sepia-tinted tiles
- Geocoding (place name → coordinates) and reverse geocoding (map click → name)
- Auto-route calculation via OpenRouteService with live map preview
- Tour log CRUD with date, distance, time, difficulty, rating, comment
- Automatically computed tour attributes (popularity, child-friendliness)
- Full-text search across tours and logs (including computed values)
- Tour export as JSON
- Reusable components (map-display, popup)
- Responsive design (desktop, tablet, mobile)

## Building

```bash
ng build
```

Build output is stored in `dist/`. Production builds are optimized automatically.

## Running Tests

```bash
ng test
```

Uses [Vitest](https://vitest.dev/) as the test runner.

## Technologies

- Angular 21 (standalone components, signals, zoneless change detection)
- Leaflet + OpenRouteService API
- TypeScript
- SCSS with CSS custom properties

## Git Repository

See the git history for the full development timeline.
The repository is linked in the submitted `README.txt` on Moodle.
