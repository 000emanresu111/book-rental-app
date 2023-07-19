# book-rental-app
The Book Rental app is a RESTful API service that allows users to rent books online. 
It provides features such as user registration and login, searching for book, renting and returining them.

## Setup
### 1) Clone the Repository
```bash
$ git clone https://github.com/000emanresu111/book-rental-app.git
```
### 2) Navigate into the folder
```bash
$ cd book-rental-app
```
### 3) Install dependencies
```bash
$ npm install
```

### 4) Start the app

#### 4.1) Locally
```bash
$ npm run start
```
This will run both the backend server on port 3000 and the MongoDB instance on port 27017.

```bash
> book-rental-app@1.0.0 start
> node app.js

[2023-07-19 08:38:20] INFO: Server listening on port 3000
[2023-07-19 08:38:20] INFO: Connected to MongoDB
```

#### 4.2) Using Docker
```bash
$ docker compose build
$ docker compose up
```

```bash
book-rental-app-app-1      | [2023-07-19 06:41:17] INFO: Server listening on port 3000
book-rental-app-app-1      | [2023-07-19 06:41:18] INFO: Connected to MongoDB
book-rental-app-app-1      | [2023-07-19 06:41:31] ERROR: User with this email already exists
book-rental-app-app-1      | [2023-07-19 06:41:31] INFO: POST /register - 400 (37ms)
```

### 5) Populate the database with some data
```bash
$ npm run initialize-db
```

```bash
> book-rental-app@1.0.0 initialize-db /
> node ./database/initializeDB.js

[2023-07-19 06:43:28] INFO: Connected to MongoDB
[2023-07-19 06:43:28] INFO: Collection is created!
[2023-07-19 06:43:28] INFO: Collection is created!
[2023-07-19 06:43:28] INFO: Collection is created!
[2023-07-19 06:43:28] INFO: Collection is created!
[2023-07-19 06:43:28] INFO: Users collection initialized
[2023-07-19 06:43:28] INFO: Book collection initialized
[2023-07-19 06:43:28] INFO: Bookstores collection initialized
[2023-07-19 06:43:28] INFO: MongoDB connection closed
```

### 6) Run tests
```bash
$ npm test
```

## API endpoints documentation
Once the app is up and running (locally or via Docker), you can access the API documentation and swagger at http://localhost:3000/doc.

## Usage example 
You can use the following examples to test the API endpoints.
You may perform the requests using a tool such as Postman or cURL, or alternatevely you can use the Swagger UI at http://localhost:3000/doc.

### Register a new user

```
POST http://localhost:3000/auth/register
```

```json
{
"username": "user42",
"email": "user42@example.com",
"password": "user42_password",
"tenantId": "user42_bookstore"
}
```

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"user42\",\"email\":\"user42@example.com\",\"password\":\"user42_password\",\"tenantId\":\"user42_bookstore\"}" http://localhost:3000/auth/register
```
 
#### Example response

```json
{"message":"User registered successfully","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI1MDJmZjMzMjZiZWY2NDI4NTE0YzQiLCJpYXQiOjE2ODk1ODQzODMsImV4cCI6MTY4OTU4Nzk4M30.-8K7plHJgBy3acJiXu9-S0G_P5IrPgyQlrFW9XtbPR8"}
```

### User login

```
POST http://localhost:3000/auth/login
```

```json
{
"email": "user42@example.com",
"password": "user42_password"
}
```

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\": \"user42@example.com\", \"password\": \"user42_password\"}"

```

#### Example response

```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI2NjcwMDRiZGI2ZmRkNzRmODIzOTAiLCJpYXQiOjE2ODk2NzY0NjUsImV4cCI6MTY4OTc2Mjg2NX0.piE0n1e59urEgo5Qx0w3mZv7IddvuzUYCvSkFyz9o6c"}
```

### Rent a book

```
POST http://localhost:3000/books/:bookId/rent
```

```json
{
    "title": "Book 1",
    "author": "Author 1",
    "quantity": 5,
    "bookstoreId": "bookstore1"
  }
```

```bash
curl -X POST http://localhost:3000/books/64b517ff0dad56bdcd2c2f3b/rent -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI2NjcwMDRiZGI2ZmRkNzRmODIzOTAiLCJpYXQiOjE2ODk2NzY0NjUsImV4cCI6MTY4OTc2Mjg2NX0.piE0n1e59urEgo5Qx0w3mZv7IddvuzUYCvSkFyz9o6c' -d '{"title": "Book 1", "author": "Author 1", "quantity": 5, "bookstoreId": "bookstore1"}'
```

#### Example response

```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI1MDJmZjMzMjZiZWY2NDI4NTE0YzQiLCJpYXQiOjE2ODk1ODQ3NTgsImV4cCI6MTY4OTU4ODM1OH0.BDXtbv3ZmBJWutfeyNpvzKaqindrlz7OWtVs67R9laA"}
```

## Project description
### System Architecture
The Book Rental app backend is implemented using Node.js and Express.js.
The backend communicates with a MongoDB database for storing book and user information. 
The server exposes a RESTful API that the client can interact with to perform various operations.

### Features description
- 1. User Authentication and Authorization
This is implemented via JWT tokens. 
When a user registers, a JWT token is generated and returned to the client.
The client must then include this token in the Authorization header of all subsequent requests.
The server will then verify the token and allow or deny access to the requested resource.

- 2. Books
Race conditions to prevent multiple users from renting the same book at the same time are handled by using MongoDB transactions.
Also atomic operations (such as findOneAndUpdate) could be used to ensure that the quantity of a book is updated correctly. 

- 3. Rentals
Users cannot rent a book if all copies are rented out or rent more than one copy of the same book at the same time.
This has been achieved using another colleciton (Rentals) that keeps track of all the rentals.
In-memory caching could be used to improve performance and reduce the number of database queries.
Exploiting database indexes could also improve performance.
Moreover the Rentals collection could be partitioned by tenantId to improve scalability.
Finally Redis could be used to implement a distributed cache.

- 4. Search
Users can search for a book based on its title or author.


