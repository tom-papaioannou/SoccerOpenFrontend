# Tactics Management Feature

This document describes the tactics management feature implementation for the FootballOpenFrontend application.

## Overview

The tactics feature provides a complete CRUD (Create, Read, Update, Delete) interface for managing team tactics.

## Files Changed

### 1. Type Definitions
- **`src/app/models/tactic.model.ts`** (NEW)
  - `Tactic` interface: Main data model
  - `CreateTacticRequest` interface: DTO for creating tactics
  - `UpdateTacticRequest` interface: DTO for updating tactics

### 2. Service Layer
- **`src/app/services/tactics.service.ts`** (ENHANCED)
  - `getAllTactics()`: Get all tactics across teams
  - `getTactics(teamId)`: Get tactics for a specific team
  - `getTactic(id)`: Get a single tactic by ID
  - `createTactic(tactic)`: Create a new tactic
  - `updateTactic(id, tactic)`: Update an existing tactic
  - `deleteTactic(id)`: Delete a tactic
  - Error handling with `catchError`
  - Caching with `shareReplay(1)`
  - All methods return RxJS `Observable`

### 3. Component Layer
- **`src/app/components/team/tactics/tactics.ts`** (ENHANCED)
  - Standalone component using Angular 20.3.0 patterns
  - Signal-based state management
  - Reactive forms with validation
  - OnPush change detection
  - Proper subscription management with `takeUntilDestroyed`

- **`src/app/components/team/tactics/tactics.html`** (ENHANCED)
  - List view using DataTable component
  - Create/edit form with FormTextfield components
  - Delete confirmation dialog
  - Loading and error states
  - Responsive design with Tailwind CSS

- **`src/app/components/team/tactics/tactics.css`** (ENHANCED)
  - Container styling
  - Form spacing utilities

- **`src/app/components/team/tactics/tactics.spec.ts`** (ENHANCED)
  - Updated test setup with HttpClient testing providers

## API Endpoints

The service uses the following REST endpoints (base URL: `https://localhost:7201`):

- `GET /api/tactics` - List all tactics
- `GET /api/tactics/team/{teamId}` - List tactics for a team
- `GET /api/tactics/{id}` - Get single tactic
- `POST /api/tactics` - Create tactic
- `PUT /api/tactics/{id}` - Update tactic
- `DELETE /api/tactics/{id}` - Delete tactic

## Component Features

### List View
- Displays tactics in a sortable table
- Shows name, formation, and description
- Edit and delete actions per row
- "New Tactic" button to create tactics

### Create/Edit Form
- Name field (required, min 3 characters)
- Formation field (optional)
- Description field (optional)
- Form validation
- Disabled submit when invalid
- Cancel button to close form

### Delete Functionality
- Confirmation dialog before deletion
- Removes tactic from list on success
- Error handling on failure

### State Management
- Loading indicators during API calls
- Error messages displayed to user
- Optimistic UI updates where appropriate

## Technology Stack

- **Framework**: Angular 20.3.0 (standalone components)
- **Forms**: Reactive Forms with FormBuilder
- **State**: Angular Signals
- **Subscription Management**: takeUntilDestroyed (DestroyRef)
- **Change Detection**: OnPush
- **HTTP**: HttpClient with RxJS Observables
- **UI**: Angular Material + Tailwind CSS
- **Table**: Custom DataTable component
- **Form Fields**: Custom FormTextfield component

## Routing

The tactics component is accessible via the route:
- `/team/tactics` (child route of team)

## Assumptions

1. API endpoints follow the `/api/{resource}` pattern
2. Backend returns JSON matching the `Tactic` interface
3. Authentication/authorization is handled by existing guards
4. Team ID context is provided when needed (currently uses getAllTactics for listing)

## Future Enhancements

Potential improvements:
1. Team-specific filtering
2. Advanced formation builder UI
3. Pagination for large datasets
4. Search and filtering
5. Import/export tactics
6. Tactical diagrams visualization
