# Tactics Management Feature

This document describes the tactics management feature implementation for the FootballOpenFrontend application.

## Overview

The tactics feature provides an interface for managing team tactics, aligned with the actual backend API implementation.

## Files Changed

### 1. Type Definitions
- **`src/app/models/tactic.model.ts`** (UPDATED)
  - `Tactic` interface: Main data model (TeamID, Name, isMain)
  - `CreateTacticRequest` interface: DTO for creating tactics (requires TeamID, Name, isMain)
  - `PlayerTactic` interface: Player positioning within tactics
  - `AddPlayerTacticRequest` interface: DTO for adding players to tactics

### 2. Service Layer
- **`src/app/services/tactics.service.ts`** (UPDATED TO MATCH BACKEND)
  - `getTeamTactics(teamID)`: Get tactics for a specific team
  - `createTeamTactic(tactic)`: Create a new tactic
  - `getPlayerTactics(tacticID)`: Get player tactics for a tactic
  - `addPlayerTactic(playerTactic)`: Add a player to a tactic
  - Error handling with `catchError`
  - Caching with `shareReplay(1)` for GET requests
  - All methods return RxJS `Observable`

### 3. Component Layer
- **`src/app/components/team/tactics/tactics.ts`** (UPDATED)
  - Standalone component using Angular 20.3.0 patterns
  - Signal-based state management
  - Reactive forms with validation
  - OnPush change detection
  - Proper subscription management with `takeUntilDestroyed`
  - MatCheckbox for isMain field
  - **Note**: Edit and delete functionality removed (not supported by backend)

- **`src/app/components/team/tactics/tactics.html`** (UPDATED)
  - List view using DataTable component
  - Create form with Name input and isMain checkbox
  - Loading and error states
  - Responsive design with Tailwind CSS
  - **Note**: Formation and Description fields removed

- **`src/app/components/team/tactics/tactics.css`** (NO CHANGES)
  - Container styling
  - Form spacing utilities

- **`src/app/components/team/tactics/tactics.spec.ts`** (NO CHANGES)
  - Test setup with HttpClient testing providers

## API Endpoints

The service uses the following REST endpoints (base URL: `https://localhost:7201`):

### Team Tactics Endpoints
- `GET /api/tactics/getTeamTactics/{teamID}` - Get all tactics for a team
- `POST /api/tactics/createTeamTactic` - Create a new tactic

### Player Tactics Endpoints
- `GET /api/tactics/getPlayerTactics/{tacticID}` - Get player tactics for a tactic
- `POST /api/tactics/addPlayerTactic` - Add a player to a tactic position

## Backend API Details

Based on `TacticsController.cs`:

### Get Team Tactics
```csharp
[HttpGet("getTeamTactics/{teamID}")]
public async Task<IActionResult> GetTeamTactics(Guid teamID)
```
Returns: `List<Tactic>`

### Create Team Tactic
```csharp
[HttpPost("createTeamTactic")]
public async Task<IActionResult> CreateTeamTactic([FromBody] Tactic newTactic)
```
Validates that team exists before creating.
Returns: Created `Tactic`

### Get Player Tactics
```csharp
[HttpGet("getPlayerTactics/{tacticID}")]
public async Task<IActionResult> GetPlayerTactics(Guid tacticID)
```
Returns: `List<PlayerTactic>`

### Add Player Tactic
```csharp
[HttpPost("addPlayerTactic")]
public async Task<IActionResult> AddPlayerTactic([FromBody] PlayerTactic newPlayerTactic)
```
Automatically removes existing player at same position before adding.
Returns: Added `PlayerTactic`

## Data Models

### Tactic (Backend C# Class)
```csharp
public class Tactic
{
    public Guid TacticID { get; set; }
    public Guid TeamID { get; set; }
    [ForeignKey("TeamID")]
    public virtual Team? Team { get; set; }
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    public bool isMain { get; set; }
}
```

### Tactic (Frontend TypeScript Interface)
```typescript
interface Tactic {
  TacticID?: string;
  TeamID: string;      // Required - GUID
  Name: string;        // Required - 1-100 characters
  isMain: boolean;     // Main tactic flag
}
```

### PlayerTactic
```typescript
interface PlayerTactic {
  PlayerTacticID?: string;
  TacticID: string;      // Required - GUID
  PlayerID?: string;     // GUID
  PlayerPosition: string;
}
```

## Component Features

### List View
- Displays tactics in a sortable table
- Shows Name and isMain status
- Create button to add new tactics
- **No edit or delete** (not supported by backend)

### Create Form
- Name field (required, 1-100 characters)
- isMain checkbox (default: false)
- Form validation
- Disabled submit when invalid
- Cancel button to close form

### State Management
- Loading indicators during API calls
- Error messages displayed to user
- Signal-based reactive state

## Technology Stack

- **Framework**: Angular 20.3.0 (standalone components)
- **Forms**: Reactive Forms with FormBuilder
- **State**: Angular Signals
- **Subscription Management**: takeUntilDestroyed (DestroyRef)
- **Change Detection**: OnPush
- **HTTP**: HttpClient with RxJS Observables
- **UI**: Angular Material + Tailwind CSS
- **Table**: Custom DataTable component
- **Form Fields**: Custom FormTextfield component + MatCheckbox

## Routing

The tactics component is accessible via the route:
- `/team/tactics` (child route of team)

## Current Limitations

1. **TeamID**: Currently hardcoded as a placeholder (`00000000-0000-0000-0000-000000000000`). 
   - **TODO**: Update to get actual team ID from route params or authentication service.

2. **No Update/Delete**: Backend API does not provide endpoints for updating or deleting tactics.
   - If needed in the future, backend API must be enhanced first.

3. **Player Tactics**: Service methods exist but not yet integrated in UI.
   - Can be added in future enhancement.

## Usage

### Creating a Tactic
1. Navigate to `/team/tactics`
2. Click "New Tactic" button
3. Fill in Name (required, 1-100 characters)
4. Optionally check "Set as main tactic"
5. Click "Create"
6. Tactic appears in the list

### Backend Requirements
- Team with matching TeamID must exist
- Backend validates team existence before creation
- Name must be 1-100 characters (validated both frontend and backend)

## Future Enhancements

Potential improvements:
1. Get TeamID from route or auth service (instead of hardcoded)
2. Player tactics management UI
3. Request backend to add update/delete endpoints if needed
4. Formation diagram visualization
5. Import/export tactics
6. Bulk operations
