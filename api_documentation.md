# F.L.O Backend API Documentation

This documentation provides details for all available API endpoints in the F.L.O (Fastify Language-based Orchestration) backend, designed to help frontend developers integrate the services.

## Base URL
- **Development**: `http://localhost:3001`
- **Prefix**: `/api`

---

## Authentication
Most endpoints require authentication using a **Bearer Token**.

- **Header**: `Authorization: Bearer <your_access_token>`
- **Token Type**: JWT (JSON Web Token)

---

## [Auth Module] `/auth`

### 1. Register
- **URL**: `/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "accessToken": "ey...",
    "refreshToken": "ey...",
    "user": {
      "id": "ck...123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

### 2. Login
- **URL**: `/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "accessToken": "ey...",
    "refreshToken": "ey...",
    "user": {
      "id": "...",
      "name": "...",
      "email": "..."
    }
  }
  ```

### 3. Token Refresh
- **URL**: `/refresh`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "ey..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "accessToken": "ey..."
  }
  ```

### 4. Logout
- **URL**: `/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  { "message": "Logged out successfully" }
  ```

### 5. Current User Info
- **URL**: `/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

---

## [GitHub Module] `/github`

### 1. Connect GitHub Account
- **URL**: `/connect`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  { "username": "octocat" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "GitHub account connected successfully",
    "profile": { "githubLogin": "octocat", "avatarUrl": "..." }
  }
  ```

### 2. Get GitHub Profile
- **URL**: `/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "githubLogin": "octocat",
    "name": "The Octocat",
    "bio": "...",
    "publicRepos": 2,
    "repositories": [
      { "githubRepoId": 123, "name": "hello-world", "language": "JavaScript" }
    ]
  }
  ```

### 3. Get Repositories
- **URL**: `/repos`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**: (Same structure as `/profile` as it includes repositories)

### 4. Refresh GitHub Data
- **URL**: `/refresh`
- **Method**: `POST`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  { "message": "GitHub data refreshed" }
  ```

### 5. Disconnect GitHub
- **URL**: `/disconnect`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  { "message": "GitHub account disconnected" }
  ```

---

## [Profile Module] `/profile`

### 1. Get Profile
- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "id": "...",
    "name": "John Doe",
    "bio": "Software Engineer",
    "email": "...",
    "location": "New York",
    "website": "example.com",
    "github": "octocat",
    "twitter": "...",
    "linkedin": "..."
  }
  ```

### 2. Get Dashboard Summary
- **URL**: `/summary`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "user": { "id": "...", "name": "...", "email": "..." },
    "github": {
      "connected": true,
      "login": "octocat",
      "avatar": "...",
      "publicRepos": 20
    },
    "portfolio": {
      "id": "...",
      "skills": ["JavaScript", "Node.js"],
      "reposCount": 5,
      "template": "developer",
      "deployedUrl": "https://...",
      "customData": {
        "name": "...",
        "bio": "...",
        "email": "...",
        "location": "...",
        "website": "...",
        "github": "...",
        "twitter": "...",
        "linkedin": "..."
      }
    }
  }
  ```

### 3. Update Profile
- **URL**: `/`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body (Partial Update Allowed)**:
  ```json
  {
    "bio": "Senior Developer",
    "location": "San Francisco"
  }
  ```
- **Response (200 OK)**: Updated Profile Object (Prisma Portfolio model)
  ```json
  {
    "id": "...",
    "userId": "...",
    "customName": "John Doe",
    "customBio": "Senior Developer",
    "customEmail": "john@example.com",
    "customLocation": "San Francisco",
    "customWebsite": "...",
    "customGithub": "...",
    "customTwitter": "...",
    "customLinkedin": "...",
    "selectedRepoIds": [],
    "skills": [],
    "selectedTemplate": "minimal",
    "deployedUrl": null,
    "repoName": null,
    "customDomain": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

---

## [Portfolio Module] `/portfolio`

### 1. Get Portfolio Settings
- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "id": "...",
    "userId": "...",
    "selectedRepoIds": [123, 456],
    "skills": ["TypeScript", "Node.js"],
    "selectedTemplate": "developer",
    "customName": "...",
    "customBio": "...",
    "customEmail": "...",
    "customLocation": "...",
    "customWebsite": "...",
    "customGithub": "...",
    "customTwitter": "...",
    "customLinkedin": "...",
    "deployedUrl": "...",
    "repoName": "...",
    "customDomain": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

### 2. Update Selected Repositories
- **URL**: `/repos`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body**:
  ```json
  { "selectedRepoIds": [123, 456] }
  ```

### 3. Update Skills
- **URL**: `/skills`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body**:
  ```json
  { "skills": ["React", "Go", "Prisma"] }
  ```

### 4. Update Template
- **URL**: `/template`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body**:
  ```json
  { "selectedTemplate": "creative" } 
  ```
  *(Valid values: 'minimal', 'developer', 'creative')*

---

## [AI Module] `/ai`

### 1. Enhance Text
- **URL**: `/enhance`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "prompt": "Make it sound more professional",
    "context": {
      "field": "bio",
      "currentValue": "I write code and like pizza."
    }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "enhancedText": "A dedicated software developer with a passion for building robust solutions..."
  }
  ```

---

## [Deployment Module] `/deploy`

### 1. Deploy to GitHub Pages
- **URL**: `/github-pages`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "repoName": "my-portfolio-site",
    "customDomain": "example.com" (Optional)
  }
  ```
- **Response (202 Accepted)**:
  ```json
  {
    "message": "Deployment started",
    "deployedUrl": "https://octocat.github.io/my-portfolio-site",
    "repoUrl": "https://github.com/v1/octocat/my-portfolio-site"
  }
  ```

### 2. Get Deployment Status
- **URL**: `/status`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "status": "deployed",
    "message": "Deployment check not implemented"
  }
  ```

---

## [Common] System

### Health Check
- **URL**: `/health` (Base URL: `/api/health`)
- **Method**: `GET`
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "uptime": 123.45,
    "timestamp": "2026-03-17T..."
  }
  ```

---

## Error Responses
Consistent error structure for all endpoints:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Detail about the error..."
}
```
