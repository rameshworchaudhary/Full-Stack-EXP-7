# Secure API: Experiment 2.3.2

Extends the existing Spring Boot 3.3.4 / Java 17 secure API with encrypted third-party credentials and refresh-token lifecycle management. The current dashboard and its API paths are retained.

## Architecture and storage

Controllers validate DTOs and call services; services apply auth, encryption and rotation rules; Spring Data repositories persist records. Passwords remain BCrypt hashes. Access JWTs are signed by `JWT_SECRET` and expire after 15 minutes by default. Refresh tokens are random opaque values returned at login; MySQL stores only their SHA-256 hashes with user, creation/expiry timestamps, revocation state, and a link to the replacement token. Rotation is transactional and marks the old token revoked. Reuse, expired tokens, and revoked tokens receive HTTP 401. Logout revokes the submitted active token.

OAuth access/refresh tokens are encrypted before persistence with AES-256-GCM. Each value gets a fresh 96-bit random nonce; the database field is Base64 of nonce plus ciphertext and authentication tag. The AES key is Base64 decoded from the environment and must be exactly 32 bytes. Credential list responses contain metadata only.

Hibernate `ddl-auto=update` creates/updates `refresh_tokens` and `oauth_credentials` in the configured MySQL database. No migration framework is present, so no separate migration files were added. Back up the database before deploying schema changes.

## Configuration

Set secrets in the process environment or a deployment secret manager; Spring Boot does not load `.env` automatically. Do not commit a `.env` file or real keys. Generate keys, for example in PowerShell:

```powershell
$env:AES_SECRET_KEY = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:DB_PASSWORD = 'your-mysql-password'
$env:DB_HOST = 'localhost'
$env:DB_PORT = '3306'
$env:DB_NAME = 'secure_api'
$env:DB_USERNAME = 'root'
$env:JWT_ACCESS_EXPIRATION = '900000'
$env:JWT_REFRESH_EXPIRATION = '604800000'
$env:SEED_DEMO_USERS = 'false'
```

`JWT_SECRET` is interpreted as UTF-8 text and must be at least 32 bytes. `AES_SECRET_KEY` must be valid Base64 that decodes to 32 bytes. Rotating either key requires a planned token/session invalidation or encrypted credential re-encryption.

## APIs

- `POST /api/auth/register` (existing)
- `POST /api/auth/login` returns `token` (legacy alias), `accessToken`, `refreshToken`, `tokenType`, `expiresIn`, username and role.
- `POST /api/auth/refresh` body: `{"refreshToken":"..."}`. Returns a new access/refresh pair and invalidates the submitted refresh token.
- `POST /api/auth/logout` body: `{"refreshToken":"..."}`. Returns 204 after revocation.
- `POST /api/admin/oauth-credentials` (ADMIN only): provider, accountIdentifier, accessToken, optional refreshToken. Returns metadata only.
- `GET /api/admin/oauth-credentials` (ADMIN only): metadata only; encrypted or decrypted credential values are never returned.

All pre-existing user, teacher, mark, and admin APIs retain their routes and JWT RBAC behavior. Send access tokens as `Authorization: Bearer <access-token>`.

## Run and verify

Start MySQL and set the environment variables above, then from `secure-api-backend`:

```powershell
mvn clean
mvn test
mvn spring-boot:run
```

The test profile uses an in-memory H2 database strictly for automated tests. The application default remains MySQL.

### Postman sequence

1. Register a user or sign in with an existing account at `/api/auth/login`; save both returned tokens.
2. Call a USER endpoint with the access token. Use the refresh token at `/api/auth/refresh`; save the replacement pair.
3. Retry refresh with the old token; expect 401. Refresh the replacement token to continue a session.
4. Call `/api/auth/logout` with the current refresh token; expect 204. Reusing it at refresh should return 401.
5. Sign in as ADMIN, then POST test OAuth values to `/api/admin/oauth-credentials`; GET the list and confirm responses contain metadata only. USER access should return 403.
6. Inspect MySQL `refresh_tokens.token_hash` and `oauth_credentials.encrypted_access_token` to confirm they differ from submitted plaintext. The test suite also checks rotation, logout, access control, and encrypted storage.

Demo account seeding is disabled by default. For a local practical, set `SEED_DEMO_USERS=true` and provide `DEMO_ADMIN_PASSWORD` and `DEMO_USER_PASSWORD`; the initializer skips each account whose password is absent. The automated test profile supplies isolated test-only credentials.

## Security notes

Refresh tokens are bearer credentials; store them securely on the client and send only over TLS. AES-GCM authenticates stored values as well as encrypting them. Keep encryption and signing keys outside source control, restrict database access, and avoid logging secrets. Passwords continue to use BCrypt and are never AES encrypted.
