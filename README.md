# book-rental-app
- The Book Rental app is a RESTful API service that allows users to rent books online. 
- It provides features such as user registration and login, searching for books, renting and returning them.
- The project is implemented using Node.js, Express.js and MongoDB.
- Custom error handling and logging (with a logs.log file output) are also provided.
- The chosen formatter is [standard.js](https://standardjs.com/), while the chosen linter is [eslint](https://www.npmjs.com/package/eslint).

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

#### Request
```
POST http://localhost:3000/auth/register
```

```json
{
  "username": "usernameForTest",
  "email": "usernameForTest@example.com",
  "password": "password",
  "tenantId": "bookstore1"
}
```

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"username\":\"user42\",\"email\":\"user42@example.com\",\"password\":\"user42_password\",\"tenantId\":\"user42_bookstore\"}" http://localhost:3000/auth/register
```
 
#### Response

```json
{"message":"User registered successfully","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI3OGU5NmU3NzkzYWE4NDFhZTUxZGYiLCJpYXQiOjE2ODk3NTExOTAsImV4cCI6MTY4OTgzNzU5MH0.LZAnNk4z1M5mWs8j9miwcNTPXNZ_SzZJeu8PUISFJTQ"}
```

### User login

#### Request
```
POST http://localhost:3000/auth/login
```

```json
{
  "email": "usernameForTest@example.com",
  "password": "password"
}
```

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\": \"user42@example.com\", \"password\": \"user42_password\"}"

```

#### Response

```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI3OGU5NmU3NzkzYWE4NDFhZTUxZGYiLCJpYXQiOjE2ODk3NTEyMTcsImV4cCI6MTY4OTgzNzYxN30.ToR2HxEPnK_2AgR8bKET7YyiupALlPcwPbrnJocmzKs"}
```

### Rent a book

#### Request

bookId is the id of the book you want to rent.
For example 64b7863efcd96b314d04d2a9.

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
curl -X POST http://localhost:3000/books/64b7863efcd96b314d04d2a9/rent -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI2NjcwMDRiZGI2ZmRkNzRmODIzOTAiLCJpYXQiOjE2ODk2NzY0NjUsImV4cCI6MTY4OTc2Mjg2NX0.piE0n1e59urEgo5Qx0w3mZv7IddvuzUYCvSkFyz9o6c' -d '{"title": "Book 1", "author": "Author 1", "quantity": 5, "bookstoreId": "bookstore1"}'
```

#### Response

Notice the decreased quantity from 5 to 4.

```json
{
    "_id": "64b7863efcd96b314d04d2a9",
    "title": "Book 1",
    "author": "Author 1",
    "quantity": 4,
    "bookstoreId": "bookstore1",
    "__v": 0
}
```

### Return a rented book

#### Request

bookId is the id of the book you want to return.
For example 64b7863efcd96b314d04d2a9.

```
POST http://localhost:3000/books/:bookId/return
```

```bash
curl -X POST http://localhost:3000/books/64b7863efcd96b314d04d2a9/return -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI2NjcwMDRiZGI2ZmRkNzRmODIzOTAiLCJpYXQiOjE2ODk2NzY0NjUsImV4cCI6MTY4OTc2Mjg2NX0.piE0n1e59urEgo5Qx0w3mZv7IddvuzUYCvSkFyz9o6c'
```

#### Response

Notice the increased quantity from 4 to 5.

```json
{
    "_id": "64b7863efcd96b314d04d2a9",
    "title": "Book 1",
    "author": "Author 1",
    "quantity": 5,
    "bookstoreId": "bookstore1",
    "__v": 0
}
```

### Search a book

#### Request

Use either title or author or both.

```
POST http://localhost:3000/books/search
```

```json
{
    "title": "Book 2",
    "author": "Author 2"
}
```

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI3OGU5NmU3NzkzYWE4NDFhZTUxZGYiLCJpYXQiOjE2ODk3NTEyMTcsImV4cCI6MTY4OTgzNzYxN30.ToR2HxEPnK_2AgR8bKET7YyiupALlPcwPbrnJocmzKs" -d "{\"title\":\"Book 2\",\"author\":\"Author 2\"}" http://localhost:3000/books/search

```

#### Response

```json
[
    {
        "_id": "64b7863efcd96b314d04d2aa",
        "title": "Book 2",
        "author": "Author 2",
        "quantity": 3,
        "bookstoreId": "bookstore2",
        "__v": 0
    }
]
```
## Project description
### System Architecture
The Book Rental app backend is implemented using Node.js and Express.js.
The backend communicates with a MongoDB database for storing book and user information. 
The server exposes a RESTful API that the client can interact with to perform various operations.

### Features description
- User Authentication and Authorization
This is implemented via JWT tokens. 
When a user registers, a JWT token is generated and returned to the client.
The client must then include this token in the Authorization header of all subsequent requests.
The server will then verify the token and allow or deny access to the requested resource.

- Books
Race conditions to prevent multiple users from renting the same book at the same time are handled by using MongoDB transactions.
Also atomic operations (such as findOneAndUpdate) could be used to ensure that the quantity of a book is updated correctly. 

- Rentals
Users cannot rent a book if all copies are rented out or rent more than one copy of the same book at the same time.
This has been achieved using another colleciton (Rentals) that keeps track of all the rentals.
In-memory caching could be used to improve performance and reduce the number of database queries.
Exploiting database indexes could also improve performance.
Moreover the Rentals collection could be partitioned by tenantId to improve scalability.
Finally Redis could be used to implement a distributed cache.

- Search
Users can search for a book based on its title or author or both.


