# GoalBooker System Architecture and Request Flow

## Core Data Flow
User → API → Controller → Service → Database → Response

## Component Overview
- **API Router (`server/routes`)**: Parses incoming endpoints and validates base requests.
- **Controller (`server/controllers`)**: Orchestrates primary business logic. Example: `ticketController.js` manages transactions.
- **Service (`server/services`)**: Provides abstract wrappers simulating interfaces. Example: `bookingService.js` extends `BookingInterface`.
- **Database (`server/config/db.js`)**: Wrapped database pool utilizing strict transactions and Query Logging overrides.
- **Models (`server/models`)**: Class-based schema representations (`UserModel`, `SeatModel`, etc.) implementing OOP principles like Inheritance (`AdminModel`).

## Security & Reliability Features added
1. **Global Error Handling**: Catch blocks forward a new `CustomError` class to centralized router middleware.
2. **Real-time Seat Locking**: `locked_until` datetime protects seats during active selections to avoid race conditions securely.
3. **Soft Deletes**: Uses an `is_deleted` boolean to preserve referential integrity constraints across the database.
4. **Audit Trails**: Every destructive or important action (like cancelling a ticket or deleting a user) is logged to `audit_logs`.

## Safe Booking Implementation
Inside the booking flow, the following ordered logic determines success:
- **Step 1:** Validate match data via centralized utility.
- **Step 2:** Check seat availability using `FOR UPDATE` lock and `locked_until` verification.
- **Step 3:** Insert payment securely into the database.
- **Step 4:** Create ticket tracking the reference values.
- **Step 5:** Explicitly update seat `is_booked` status.
