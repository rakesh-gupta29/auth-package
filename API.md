# Redrob API Requirements

This document describes the API endpoints that your backend should implement to work with Redrob.

## Base URL

Configure via `initAuth({ apiBaseUrl: 'https://api.redrob.io' })`

Default: `https://api.redrob.io/auth`

## Authentication Endpoints

### 1. Signup

**POST** `/auth/signup`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "emailVerified": false
  },
  "token": "jwt-token-here",
  "refreshToken": "refresh-token-here"
}
```

**Error Response (400):**
```json
{
  "message": "Email already exists"
}
```

---

### 2. Login

**POST** `/auth/login`

Authenticate user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "emailVerified": true
  },
  "token": "jwt-token-here",
  "refreshToken": "refresh-token-here"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Refresh Token

**POST** `/auth/refresh`

Refresh the authentication token using a refresh token.

**Request:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg"
  },
  "token": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid refresh token"
}
```

---

### 4. Verify Email

**POST** `/auth/verify-email`

Verify user's email address with OTP.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### 5. Regenerate OTP

**POST** `/auth/regenerate-otp`

Regenerate OTP for email verification.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email not found"
}
```

---

### 6. Google SSO

**POST** `/auth/google-sso`

Authenticate user with Google ID token.

**Request:**
```json
{
  "idToken": "google-id-token"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "emailVerified": true
  },
  "token": "jwt-token-here",
  "refreshToken": "refresh-token-here"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid Google token"
}
```

---

### 7. Password Reset Request

**POST** `/auth/password-lost`

Send password reset OTP to user's email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Email not found"
}
```

---

### 8. Password Reset

**POST** `/auth/password-reset`

Reset user's password using OTP.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### 9. Check Email

**GET** `/auth/check-email?email=user@example.com`

Check if an email address is already registered.

**Response (200):**
```json
{
  "exists": true,
  "email": "user@example.com"
}
```

**Error Response (400):**
```json
{
  "message": "Invalid email format"
}
```

---

### 10. Logout

**POST** `/auth/logout`

Logout the authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### 11. Get User Profile

**GET** `/auth/profile`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "emailVerified": true
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized"
}
```

---

### 12. Get User Details

**GET** `/user`

Get detailed user information (same as profile but from /user endpoint).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### 13. Get User Credits

**GET** `/auth/credits`

Get user's credit information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "available": 100,
  "total": 200,
  "used": 100
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized"
}
```

---

## CORS Configuration

Your API should support CORS and allow credentials:

```javascript
// Express.js example
app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true
}));
```

## Cookie Support

Redrob uses cookies for session management. Your API should:

1. Accept requests with `credentials: 'include'`
2. Set appropriate CORS headers to allow credentials
3. Handle Bearer token authentication from cookies

## Token Management

- **Access Token**: Short-lived token (7 days default) for API authentication
- **Refresh Token**: Long-lived token (30 days default) for refreshing access tokens
- Tokens are stored in HTTP-only cookies for security

## Security Notes

- All endpoints except signup, login, check-email, and password-lost should require authentication
- Use HTTPS in production
- Implement rate limiting on all authentication endpoints
- Validate and sanitize all inputs
- Use secure, HTTP-only cookies if your backend sets them
- Implement proper password hashing (bcrypt, argon2, etc.)
- OTP codes should expire after a reasonable time (5-15 minutes)
- Implement account lockout after multiple failed login attempts
- Store refresh tokens securely and implement token rotation

## Error Response Format

All error responses should follow this format:

```json
{
  "message": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting

Recommended rate limits:

- Login: 5 requests per 15 minutes per IP
- Signup: 3 requests per hour per IP
- Password reset: 3 requests per hour per email
- OTP regeneration: 3 requests per hour per email
- Check email: 10 requests per minute per IP
