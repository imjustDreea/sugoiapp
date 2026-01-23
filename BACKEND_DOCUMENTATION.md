# Backend Documentation

## Overview
This document provides comprehensive documentation for the backend of the SugoiApp project, including database designs, RESTful API endpoints, authentication mechanisms, and deployment processes.

## Table of Contents
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Deployment](#deployment)

## Database Design
The database for SugoiApp is designed to efficiently store user data, application data, and much more. It uses a relational database management system (RDBMS).

### Entities
1. **Users**: Stores user profiles and authentication details.
2. **Posts**: Stores application posts made by users.
3. **Comments**: Stores comments on user posts.

### Relationships
- **Users to Posts**: One-to-Many relationship.
- **Users to Comments**: One-to-Many relationship.
- **Posts to Comments**: One-to-Many relationship.

### Example ERD
```
[Users] 1 ---- n [Posts]
[Users] 1 ---- n [Comments]
[Posts] 1 ---- n [Comments]
```

## API Endpoints
The backend exposes a set of RESTful APIs for front-end and mobile interactions.

### User Endpoints
- **POST /api/users/register**: Register a new user.
- **POST /api/users/login**: Login an existing user.

### Post Endpoints
- **GET /api/posts**: Retrieve all posts.
- **POST /api/posts**: Create a new post.

### Comment Endpoints
- **GET /api/comments/{postId}**: Retrieve comments for a given post.
- **POST /api/comments**: Add a comment to a post.

## Authentication
SugoiApp uses JWT (JSON Web Token) for user authentication. The flow includes:
1. User login sends credentials to the server.
2. Server validates and responds with a token.
3. The token is used in subsequent requests.

## Deployment
The SugoiApp backend is deployed using Heroku. The deployment process involves:
1. Setting up the Heroku app.
2. Pushing the codebase to Heroku.
3. Configuring environment variables.

---

## Conclusion
This documentation aims to provide a solid foundation for developers working on the SugoiApp backend. Always refer to this document when new features are added or existing features are modified.