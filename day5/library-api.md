# Library Books REST API

Base URL: `https://api.example.com/v1`

The API manages a library's book collection. JSON request bodies use the `application/json` content type.

## Endpoints

- **List all books**
  - **Method:** `GET`
  - **Path:** `/books`
  - **Description:** Returns a list of books in the library.
  - **Success status:** `200 OK`

- **Get one book**
  - **Method:** `GET`
  - **Path:** `/books/{id}`
  - **Description:** Returns the book with the specified ID.
  - **Success status:** `200 OK`

- **Create a book**
  - **Method:** `POST`
  - **Path:** `/books`
  - **Description:** Adds a new book to the collection.
  - **Example request body:**
    ```json
    {
      "title": "Things Fall Apart",
      "author": "Chinua Achebe",
      "publishedYear": 1958,
      "isbn": "978-0385474542"
    }
    ```
  - **Success status:** `201 Created`

- **Update a book**
  - **Method:** `PUT`
  - **Path:** `/books/{id}`
  - **Description:** Replaces the details of an existing book.
  - **Example request body:**
    ```json
    {
      "title": "Things Fall Apart",
      "author": "Chinua Achebe",
      "publishedYear": 1958,
      "isbn": "978-0385474542"
    }
    ```
  - **Success status:** `200 OK`

- **Delete a book**
  - **Method:** `DELETE`
  - **Path:** `/books/{id}`
  - **Description:** Removes the specified book from the collection.
  - **Success status:** `204 No Content`

- **List books by author**
  - **Method:** `GET`
  - **Path:** `/books?author=Chinua%20Achebe`
  - **Description:** Returns books whose author matches the `author` query parameter.
  - **Example request:** `GET /books?author=Chinua%20Achebe`
  - **Success status:** `200 OK`

## Error responses

- **`400 Bad Request`** — The request is invalid, such as creating a book without the required `title` or `author` fields.
- **`404 Not Found`** — The requested book ID does not exist, for example `GET /books/99999`.
