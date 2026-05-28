# Security Spec

## Data Invariants
- Anyone can read collections as they are public data for the church app.
- Only admins can write to collections.
- We will assume a specific userId as the admin for now, or anyone who is authenticated with a specific Firebase auth UID. Since we don't have a rigid admin system yet, let's keep writes restricted to authenticated users for now or check against an `admins` collection. But for simplicity, we will assume any authenticated user is an admin for this example, or we will check for an admin email. Wait, the skill says:
`// Bootstrapped Admin: Include User email from runtime as an admin if the application has an "admin" feature.`
Since my user email is `calipherrndlovu@gmail.com`, I will bootstrap this email. But wait, `request.auth.token.email` can be spoofed if not verified. We will check `request.auth.token.email_verified == true`.

## Dirty Dozen Payloads
- TBD.

## Test Runner
- TBD.
