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
curl -X POST -H "Content-Type: application/json" -d '{
  "username": "user42",
  "email": "user42@example.com",
  "password": "user42_password",
  "tenantId": "user42_bookstore"
}' http://localhost:3000/auth/register

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
"email": "newuser@example.com",
"password": "newpassword"
}
```

#### Example response

```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI1MDJmZjMzMjZiZWY2NDI4NTE0YzQiLCJpYXQiOjE2ODk1ODQ3NTgsImV4cCI6MTY4OTU4ODM1OH0.BDXtbv3ZmBJWutfeyNpvzKaqindrlz7OWtVs67R9laA"}
```

### User login

```
POST http://localhost:3000/auth/login
```

```json
{
"email": "newuser@example.com",
"password": "newpassword"
}
```

#### Example response

```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI1MDJmZjMzMjZiZWY2NDI4NTE0YzQiLCJpYXQiOjE2ODk1ODQ3NTgsImV4cCI6MTY4OTU4ODM1OH0.BDXtbv3ZmBJWutfeyNpvzKaqindrlz7OWtVs67R9laA"}
```