# Job Application Tracking API

## Objective

Develop an API using Node.js and its HTTP module to manage and track job applications. The API should allow CRUD operations for each job application record. Each record will contain details such as the Company Name, Recruiter Name, Position, Applied Date, and Application Status.

## Requirements

Each job application should have a unique id (UUID), company name, recruiter name, position, applied date (Month/Day/Year), and status ("Applied", "Not Selected", "Initial Call", "Technical Interview", "Final Round", "Offer").

## Endpoints to Implement

### GET /applications

Retrieve all job applications.

### POST /applications

Create a new job application.

### GET /applications/:applicationId

Retrieve a single job application by its ID.

### PATCH /applications/:applicationId

Update a job application's status by its ID.

### DELETE /applications/:applicationId

Delete a job application by its ID.
