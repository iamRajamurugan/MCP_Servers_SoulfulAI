# Firebase MCP

***What is Firebase?***

**Firebase** is a comprehensive development platform by Google offering services like authentication, real-time databases, Firestore, cloud functions, and more. It enables developers to build scalable apps with built-in backend functionality.

---

### How is Firebase MCP Used?

- The **Firebase MCP Server** acts as an MCP-compatible backend for AI tools (e.g., Claude Desktop, Cursor IDE).
- It provides structured access to:
  - Firebase Authentication
  - Firestore document databases
- Users (clients like Claude) interact with Firebase using **natural language** via standardized MCP tool calls.

---

## MAIN FEATURES OF ***Firebase MCP***

---

### 1. Create User  
**Capability**: `create_user`  
**Description**: Creates a new user in Firebase Authentication using email and password.  
**Example**: *Create a user with email "user@example.com" and password "securepassword123"*

---

### 2. Get Users  
**Capability**: `get_users`  
**Description**: Lists all registered users in Firebase Auth.  
**Example**: *List all users in the system*

---

### 3. Get User  
**Capability**: `get_user`  
**Description**: Fetches information for a specific user based on user ID or email.  
**Example**: *Get user details for "user123"*

---

### 4. Update User  
**Capability**: `update_user`  
**Description**: Updates a user’s email, password, or display name.  
**Example**: *Update the display name for user123 to "John Doe"*

---

### 5. Delete User  
**Capability**: `delete_user`  
**Description**: Deletes a specific user from Firebase Auth.  
**Example**: *Delete user with ID "user123"*

---

### 6. Verify Email  
**Capability**: `verify_email`  
**Description**: Generates an email verification link for a Firebase user.  
**Example**: *Send verification email to user123*

---

### 7. Reset Password  
**Capability**: `reset_password`  
**Description**: Creates a password reset link for a specified user.  
**Example**: *Send password reset link to user@example.com*

---

### 8. Get Collections  
**Capability**: `get_collections`  
**Description**: Lists all top-level Firestore collections.  
**Example**: *Show me all Firestore collections*

---

### 9. Get Documents  
**Capability**: `get_documents`  
**Description**: Lists all documents within a specified Firestore collection.  
**Example**: *List all documents in "users" collection*

---

### 10. Get Document  
**Capability**: `get_document`  
**Description**: Retrieves the contents of a specific Firestore document.  
**Example**: *Get document "user123" from "users" collection*

---

### 11. Create Document  
**Capability**: `create_document`  
**Description**: Creates a new document in a specified Firestore collection.  
**Example**: *Add a document with name and age to "users"*

---

### 12. Update Document  
**Capability**: `update_document`  
**Description**: Updates fields in an existing Firestore document.  
**Example**: *Update age of "user123" in "users" to 31*

---

### 13. Delete Document  
**Capability**: `delete_document`  
**Description**: Deletes a document from Firestore.  
**Example**: *Delete "user123" from "users" collection*

---

### 14. Batch Write  
**Capability**: `batch_write`  
**Description**: Performs atomic batch operations: create, update, and delete across multiple documents.  
**Example**: *Create "user1", update "profile1", and delete "temp1" in a single transaction*

---


