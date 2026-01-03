# Helper: Connecting DBeaver to Neon & Migrating Data

This guide covers how to take your **existing tables** in DBeaver (Localhost) and move them to **Neon** (Cloud).

---

## Part 1: Connect DBeaver to Neon
1.  **Get Credentials from Neon**:
    *   In the **Connection Details** dialog (as seen in your screenshot), look at the **Connection string**.
    *   **Crucial**: Click the **Show password** (Eye icon 👁️) at the bottom to reveal the password in the string.
    *   The string looks like: `postgres://[USER]:[PASSWORD]@[HOST]/[DATABASE]...`
    *   **Copy the specific parts**:
        *   **Host**: Everything between `@` and `/` (e.g., `ep-flat-bonus-....aws.neon.tech`).
        *   **User**: Everything between `//` and `:` (e.g., `neondb_owner`).
        *   **Password**: Everything between `:` and `@`.
        *   **Database**: The word after `/` (e.g., `neondb`).

2.  **Create Connection in DBeaver**:
    *   Open DBeaver.
    *   Click **New Database Connection** (Plug icon 🔌).
    *   Select **PostgreSQL**.
    *   **Host**: Paste the Host you copied.
    *   **Database**: `neondb`.
    *   **Username**: Paste the User.
    *   **Password**: Paste the Password.
    *   **SSL**: Go to the "SSL" or "Driver properties" tab -> set `sslmode` to `require`.
    *   Click **Test Connection**.

Now you have two connections in DBeaver:
1.  `Localhost` (Your old data).
2.  `Neon` (New, empty).

---

## Part 2: Moving Tables (Schema & Data)
The easiest way to move everything is generating an SQL script.

### Step 1: Export from Local
1.  In DBeaver, expand your **Localhost** connection -> **Databases** -> your DB -> **Schemas** -> **public**.
2.  **Select all your tables** (hold Shift or Ctrl to click `users`, `groups`, `bills`, etc.).
3.  Right-click on the selected tables -> **Generate SQL** -> **DDL**.
4.  A window appears with code like `CREATE TABLE...`.
5.  **Copy all that code**.

### Step 2: Import to Neon
1.  In DBeaver, right-click on your **Neon** connection -> **SQL Editor** -> **Open SQL Script**.
2.  **Paste** the code you copied.
3.  **Execute** the script (Orange Play button or `Ctrl + Enter` to run all).
4.  Refresh the Neon connection (right-click -> Refresh). You should see your tables appear!

### Step 3 (Optional): Moving Data
If you want to keep your existing users/expenses but don't want to re-type them:
1.  Right-click on a Table (e.g., `users`) in **Localhost**.
2.  **Export Data** -> **SQL**.
3.  Next -> Copy the generated `INSERT INTO...` statements.
4.  Go to **Neon SQL Editor** -> Paste & Run.
