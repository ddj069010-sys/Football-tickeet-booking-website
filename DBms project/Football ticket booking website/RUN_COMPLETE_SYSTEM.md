# How to Run GoalBooker Full System

## 1. Prerequisites
- Node.js (v16+)
- MySQL Server installed and running
- MySQL Workbench (optional, for viewing DB)

## 2. Database Setup
1. Open MySQL Workbench or your favorite SQL client.
2. Run the code in `backend/database_schema.sql` to create the `goalbooker` database and tables.
3. The schema includes sample data for stadiums, matches, and the default admin.

## 3. Backend Setup
1. Open a terminal in the `backend` folder.
2. Ensure `.env` is configured correctly (DB credentials, JWT secrets).
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Verification: Open `http://localhost:5000/api/health` in your browser. You should see `{"status":"OK","database":"connected"}`.

## 4. Admin Frontend Setup
1. Open another terminal in the `goalbooker-admin` folder.
2. Run:
   ```bash
   npm install
   npm start
   ```
3. Login using: **Admin** / **Ishtiyaq**.

## 5. User Frontend Setup
1. Open a third terminal in the `goalbooker-user` (or the folder containing the user React app).
2. Run:
   ```bash
   npm install
   npm start
   ```

## 6. Functional Testing
- **Register**: Create a user account.
- **Book**: Select a match, pick seats, and proceed to payment.
- **Mock Payment**: Choose 'Credit Card' or 'UPI' to confirm your booking.
- **Admin**: Log in to manage matches, upload images, or block users.
- **Locks**: Disable a match in Admin to see pending bookings automatically cancelled.
