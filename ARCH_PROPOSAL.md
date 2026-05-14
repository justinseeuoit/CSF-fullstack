# FarmTracker Architecture Proposal: Authentication & Authorization 

## 1. Problem Statement
The current system operates without any authentication or authorization mechanisms. Any user can perform destructive actions, affecting security, data integrity, and operational trust.

**The API is currently fully public:**
- `POST /api/animals`
- `PUT /api/animals/:id`
- `DELETE /api/animals/:id`
- `POST /api/animals/:id/health-events`
- `POST /api/animals/:id/weights`
- `POST /api/paddocks`

---

## 2. Proposed Architecture
**Goal:** Introduce a secure identity management system with role-based access control (RBAC).

### Recommendations
- **Authentication:** JWT (JSON Web Tokens) for stateless sessions.
- **Hashing:** `bcrypt` for secure password storage.
- **Middleware:** Express-based auth and role validation.
- **Database:** SQLite (extended with `users` and `audit_logs` tables).

### Proposed Roles
| Role | Permissions |
| :--- | :--- |
| **Admin** | Full access (User management, deletions, configuration). |
| **Worker** | Create/update animals, health events, and weights. |
| **Viewer** | Read-only access to all data. |

---

## 3. Project Structure
```text
backend/
├── middleware/
│   ├── auth.js       # Verifies JWT and attaches user to request
│   └── authorize.js  # Checks user role permissions
├── services/
│   ├── auth.service.js
│   └── user.service.js
├── routes/
│   ├── auth.js       # Login and account routes
│   ├── animals.js
│   └── paddocks.js
└── utils/
    └── jwt.js        # Sign/Verify logic
```

---

## 4. Database Schema
Users Table
```SQL
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'worker', 'viewer')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Audit Logs (Recommended)
```SQL
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Authentication Flow
**Login Sequence**
1. **Request**: `POST /api/auth/login` with credentials.
2. **Verification**: Backend compares hashed password via `bcrypt`.
3. **Token Generation**: Backend signs a JWT containing `id`, `username`, and `role`.
4. **Response**: Returns JWT to client.

JWT Structure
```JSON
{
  "sub": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1715520000,
  "exp": 1715520900
}
```

---

## 6. Implementation Details
**Middleware Logic**
* `requireAuth`: Reads the `Authorization: Bearer <token>` header. If valid, populates `req.user`.
* `authorize(...roles)`: Restricts access to specific roles.

Example Route Protection:

```JavaScript
router.delete('/:id', requireAuth, authorize('admin'), deleteAnimal);
```
**Security Improvements**
*   **Environment Variables**: Use .env for JWT_SECRET.
*   **Security Headers**: Implement helmet for HTTP header security.
*   **Rate Limiting**: Protect /api/auth/login from brute force attacks.
*   **CORS**: Restrict API access to trusted frontend origins.

---

## 7. Migration Plan
1. **Phase 1**: Database migration (Users table) and Login API implementation.

2. **Phase 2**: Integrate `requireAuth` middleware across all mutation routes.

3. **Phase 3** Frontend update (Login page, token storage in `localStorage`, and header injection).

4. **Phase 4**: Advanced features (Role-based access, Audit logging, Refresh tokens).

---

## 8. Priority Implementation Order
1. users table
2. password hashing
3. JWT login
4. auth middleware
5. protect destructive routes
6. frontend login page
7. role-based authorization
8. audit logging

---

## 9. Summary of Impact
This architecture transforms FarmTracker from a public utility into a production-ready enterprise tool, ensuring that every change to livestock or paddock data is attributed to a verified user.