# Lokal Assessment 

## Steps to Setup :
### Step 1 : 
```
git clone <repo_url> 
```

### Step 2 : 
```
npm install
npm run dev
```

## Running the App
```
Login: Enter a valid email address on the login screen.

Send OTP: Tap the "Send OTP" button.

The OTP is visible in the browser sonsole as we have not setup the email and we cannot view the OTP directly in the UI 

Enter the 6-digit code.

Upon success, you are redirected to the Session Screen which displays:

Session start timestamp.

Live duration counter (mm:ss).

Secure logout functionality.
```
### OTP Flow
```
Length: 6 digits.

Expiry: 60 seconds.

Maximum Attempts: 3 (Account locked/reset after 3 failures).

Resend Logic: Generating a new OTP invalidates the previous code and resets the attempt counter.

Security: OTP codes are strictly restricted to the console in __DEV__ mode to prevent UI leaks.
```

## Data-Structure 
```
The OtpRecord interface acts as the blueprint for how we store sensitive authentication data in memory. Since we aren't using a backend database, this structure allows the app to perform "server-side" logic like checking if a code is expired directly on the device.

interface OtpRecord {
  code: string;           
  expiresAt: number;     
  attempts: number;       
  createdAt: number;     
}

```

## External SDK : 
```
The External SDK section explains how the app tracks user behavior and app health using Firebase Analytics.

In a real-world app, developers need to know if users are struggling to log in (e.g., if everyone is failing their OTP checks), but they must do this without compromising security.

Why Use Firebase Analytics Here?
Instead of just hoping the login works, these events send data to a dashboard so you can see:

How many users are actually trying to log in.

If there is a high failure rate (suggesting a bug or bad UI).

How long users stay active in a session.
```

## What GPT Helped With vs What I Understood and Implemented

### What GPT Helped With
```
1. GPT suggested a way to create a random 6-digit number for OTP and store it with an expiry time.
2. Provided TypeScript type definitions for OtpRecord, OtpStore, and ValidationResult
3. Gave template for OTP validation with attempt count and expiry checks.
```

### What I understood: 
```
1. Edge case handling: expired OTP, incorrect OTP, max attempts, resend flow.
2. Handling the Session screen with live timer, start time, and proper cleanup on logout
3. Custom hooks for OTP countdown and session timer.
4. Ensured no memory leaks, correct dependency arrays, and no logic inside JSX.
``` 

## FireBase console link:
```
https://console.firebase.google.com/u/0/project/lokal-assessment/overview
```
