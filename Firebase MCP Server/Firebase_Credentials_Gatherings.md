# How to Get Firebase Credentials

This guide explains how to gather Firebase credentials for  **server-side** usage, including Firebase Admin SDK, and Google Sign-In OAuth Client ID.

---

##  Prerequisites

- A Firebase project created at [https://console.firebase.google.com](https://console.firebase.google.com)
- Access to the Firebase Console and Google Cloud Console

---

## Part 1: Get Firebase Admin SDK Service Account Credentials (for server use)

### Step 1: Go to Firebase Console

1. Visit: [https://console.firebase.google.com](https://console.firebase.google.com)
2. Log in and select your project.


### Step 2: Open Project Settings

1. Click the **Gear Icon** next to "Project Overview" in the left sidebar.
2. Click on **Project settings**.


### Step 3: Generate Admin SDK Private Key

1. Navigate to the **Service Accounts** tab.
2. Click the **“Generate new private key”** button.
3. Confirm the popup by clicking **Generate**.
4. A `.json` file containing service account credentials will download automatically.

> **Secure this file carefully**. Do **not** expose it in public repos.


### Step 4: Use It in Your Backend Code

**Example (Python):**
```python
import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("path/to/your-firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
```

---


## Part 2: Get OAuth Client ID for Google Sign-In (via Firebase Auth)

### Step 1: Open Google Cloud Console

1. Visit: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Select the same project as your Firebase app.


### Step 2: Create OAuth 2.0 Client ID

1. Click **Create Credentials → OAuth client ID**
2. Choose **Web application** or **Android/iOS** depending on your use case.
3. Set the **Authorized redirect URIs**:
   - For web: `https://your-app.firebaseapp.com/__/auth/handler`

4. Click **Create**.
5. You will receive your **Client ID** and **Client Secret**.


### Step 3: Use Client ID in Firebase Auth (Google Sign-In)

**If using custom OAuth flow or FirebaseUI:**

```javascript
const provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider);
```

Firebase uses the project’s OAuth client ID under the hood if you enabled **Google Sign-In** in Firebase Console:

- Go to **Authentication > Sign-in method**
- Enable **Google** and configure the consent screen if prompted.
---
### **Video Reference**  
 **[Click here to watch the full video walkthrough of ***Firebase*** credentials gatherings](https://drive.google.com/file/d/1YJMY7ndfdji_IKORO8hqWTMqr9vs9Atc/view?usp=drive_link)**

