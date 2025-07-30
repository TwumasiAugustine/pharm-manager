# Debugging Guide - Pharmacy Management App

This guide provides instructions for debugging the Pharmacy Management App, particularly focusing on authentication issues and API debugging.

## API Debugging

You can enable API debugging in the browser console to get detailed logs of API requests and responses:

```javascript
// Enable API debugging
import('/src/utils/debugUtils.js').then((m) => m.enableApiDebug());

// Disable API debugging
import('/src/utils/debugUtils.js').then((m) => m.disableApiDebug());
```

## Authentication State

To check the current authentication state:

```javascript
// Check current authentication state
import('/src/utils/debugUtils.js').then((m) => m.checkAuthState());
```

This will show you:

-   Whether a session cookie exists
-   Whether the session is stored in sessionStorage
-   Whether the user has logged in before (localStorage)

## Clearing Authentication State

If you're experiencing authentication issues, you can clear the authentication state:

```javascript
// Clear all authentication state
import('/src/utils/debugUtils.js').then((m) => m.clearAuthState());
```

## Common Authentication Issues

1. **"Authentication required" errors in server logs:**

    - Check if requests are being made to protected endpoints while not authenticated
    - Verify that the client-side request interceptor is working correctly
    - Check if cookies are enabled in your browser

2. **Refresh token loop:**

    - Clear all authentication state and try logging in again
    - Check the browser console for errors during the refresh process

3. **Authentication state inconsistency:**
    - Use `checkAuthState()` to verify current state
    - Clear state with `clearAuthState()` and log in again

## Server Debugging

For server-side debugging:

1. Set `debug: true` in your server configuration:

    ```javascript
    // In your .env file
    DEBUG = true;
    ```

2. Check server logs for authentication errors and stack traces

3. Verify CORS configuration allows credentials and the correct origin

## Request Lifecycle

Understanding the request lifecycle can help with debugging:

1. **Client request interceptor:** Checks for authentication indicators before sending requests
2. **Server authentication middleware:** Validates JWT token
3. **Server response:** Returns data or authentication error
4. **Client response interceptor:** Handles token refresh if 401 status is received

By understanding this flow, you can identify where authentication issues are occurring.
