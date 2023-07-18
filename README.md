# book-rental-app


## API endpoints


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