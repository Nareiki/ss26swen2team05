# Crosscheck Against Provided Checklist

Legend:

- `DONE` = implemented in current backend
- `PARTIAL` = partially implemented backend-side
- `MISSING` = not implemented yet

## UI / MVVM Items

- Correct data binding between UI elements and view model properties -> `MISSING` (frontend out of scope)
- UI responds to window size changes -> `MISSING`
- Defines reusable UI component -> `MISSING`

## Tours

- Create/modify/delete tour (also in DAL) -> `DONE`
- Tours have required attributes incl. image and list management -> `DONE` (image path + upload endpoint)
- Tours have computed attributes -> `DONE` (popularity, child-friendliness)
- Tour details show all attributes + map image data -> `PARTIAL` (all backend attributes + route geojson data; frontend map rendering not included)
- Validate user input (no crash on wrong input) -> `PARTIAL` (guard validation + global exception handler; no FluentValidation layer yet)

## Tour Logs

- Create/modify/delete tour log (also in DAL) -> `DONE`
- Tour log has required attributes -> `DONE`
- Tour logs shown in list of selected tour -> `DONE` (API supports list by tour)
- Validate user input (no crash on wrong input) -> `PARTIAL` (same reasoning as tours)

## Full-Text Search

- Search in tours, tour logs, and computed attributes -> `DONE`
- List tours according to current search -> `DONE` (returns matching tours + logs)

## Import/Export

- Export tour data -> `DONE`
- Import tour data -> `DONE`

## Mandatory Unique Feature

- Unique feature present -> `DONE` (tour recommendations endpoint based on child-friendliness + popularity)

## Non-Functional Requirements

- Layers call methods of immediate lower layer -> `DONE`
- Layers define own exceptions (no implementation-specific exceptions) -> `PARTIAL` (uses common domain/argument/invalid-op exceptions; no custom exception hierarchy yet)
- Uses OpenRouteService Directions API -> `DONE` (with fallback)
- Uses leaflet for map -> `MISSING` (frontend concern)
- All tour data except image stored in DB -> `DONE`
- All configuration stored outside code -> `PARTIAL` (code reads external config; ensure secrets are only env/local secrets)
- Logs exceptions/errors/technical info -> `PARTIAL` (log4net wired, but no enriched structured logging policy yet)
- Quality unit tests -> `PARTIAL` (core tests present; coverage can be expanded)

## Protocol / Documentation

- Architecture description (layers, class diagrams) -> `PARTIAL` (layer documentation done; diagrams not yet added)
- Use cases (use-case + sequence diagrams) -> `PARTIAL` (textual flows, no UML diagrams yet)
- UX wireframes -> `MISSING` (frontend/UX artifact)
- Library decisions and lessons learned -> `PARTIAL`
- Implemented design patterns -> `DONE` (DI, repository, use-case/application service)
- Unit test decisions -> `PARTIAL`
- Unique feature description -> `DONE`
- Tracked time -> `MISSING`
- Link to git -> `MISSING` (not embedded yet)

## Recommended Next Steps to Reach Full Checklist Compliance

1. Add Angular frontend (MVVM, responsive behavior, reusable component, Leaflet map rendering).
2. Add formal UML/use-case/sequence/wireframe artifacts.
3. Introduce explicit validation layer (e.g., FluentValidation) and custom exception model.
4. Expand unit and integration tests (API-level + persistence-level).
5. Add protocol metadata (time tracking + repo link) into a project report.

