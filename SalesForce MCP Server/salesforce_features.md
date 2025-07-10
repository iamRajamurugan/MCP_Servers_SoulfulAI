# Salesforce MCP

***Let's just understand what is Salesforce?***

**Salesforce** is a cloud-based **Customer Relationship Management (CRM)** platform that empowers businesses across sales, service, marketing, and more.  

- Offers sales automation, service & support tools, marketing automation, analytics, and app development via AppExchange.  
- Enables secure data, metadata, and API-driven access—making it ideal to integrate with AI tools like MCP.

---

### How is Salesforce MCP Used?

- The **Salesforce MCP Server** acts as the **MCP Server** in the protocol stack; Claude (or another LLM) is the **client**, and the **host** is a desktop/web agent with MCP support.
- Through this stack, users can:
  - Use **natural language** to describe actions (e.g., “Add a Rating field to Account”)
  - The LLM issues MCP calls (e.g., `salesforce_manage_field`)
  - The server translates calls into Salesforce API requests (via `jsforce`, TypeScript SDKs)
  - Results and errors are returned in rich, human-readable form.

---

## MAIN FEATURES OF ***Salesforce MCP***



### 1. Smart Object Search  
**Capability**: `salesforce_search_objects`  
**Description**: Enables natural language-based searching of both standard and custom Salesforce objects using partial matches.  
**Example**: *Find objects related to Account*

---

### 2. Schema Inspection  
**Capability**: `salesforce_describe_object`  
**Description**: Provides detailed schema info including field definitions, data types, picklist values, and relationships of any Salesforce object.  
**Example**: *Show me all fields in the Account object*

---

### 3. Aggregate Queries  
**Capability**: `salesforce_aggregate_query`  
**Description**: Executes aggregate functions like COUNT, SUM, AVG, GROUP BY, and HAVING for analytical reports.  
**Example**: *Count opportunities by stage*

---

### 4. Data Manipulation (DML)  
**Capability**: `salesforce_dml_records`  
**Description**: Supports inserting, updating, deleting, and upserting Salesforce records using natural language.  
**Example**: *Update status of multiple accounts*

---

### 5. Custom Object & Field Management  
**Capability**: `salesforce_manage_object`, `salesforce_manage_field`  
**Description**: Enables creation and modification of custom objects and fields, including sharing settings and field relationships.  
**Example**: *Create a Customer Feedback object*

---

### 6. Cross-Object Search  
**Capability**: `salesforce_search_all`  
**Description**: Performs SOSL-based keyword searches across multiple Salesforce objects.  
**Example**: *Search for 'cloud' across Accounts and Opportunities*

---

### 7. Apex Code Management  
**Capability**: `salesforce_read_apex`, `salesforce_write_apex`, `salesforce_read_apex_trigger`, `salesforce_write_apex_trigger`  
**Description**: Lets users read, write, and manage Apex classes and triggers programmatically.  
**Example**: *Create a new Apex class for handling account operations*

---

### 8. Execute Anonymous Apex  
**Capability**: `salesforce_execute_anonymous`  
**Description**: Runs on-the-fly Apex code snippets without creating permanent classes, useful for quick logic execution or data updates.  
**Example**: *Execute Apex code to calculate account metrics*

---

### 9. Debug Log Management  
**Capability**: `salesforce_manage_debug_logs`  
**Description**: Enables and manages debug logs for specific users, including setting log levels and retrieving recent logs.  
**Example**: *Enable debug logs for user@example.com*

---
