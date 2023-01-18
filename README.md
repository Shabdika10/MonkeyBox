# MonkeyBox

## Products API 
### POST /createProduct
- Create a product document from request body.
- Upload product image to S3 bucket and save image public url in document.
- _Response format_
  - *On success* - It will return HTTP status 201. Also return the product document. The response should be a JSON object .
  - *On error* - It will return a suitable error message with a valid HTTP status code. The response should be a JSON object.

### GET /getAllProducts
- Returns all products in the collection that aren't deleted.

### GET /filterProduct
  - _Filters_
    - category (The key for this filter will be 'category')
    - name (The key for this filter will be 'title'). You should return all the products with name containing the substring recieved in this filter.

### PUT /updateData/:productId
- Updates a product by changing at least one or more than 1 field.
- Check if the productId exists (must have isDeleted false and is present in collection). If it doesn't, return an HTTP status 404 with a response .
- _Response format_
  - *On success* - It will return HTTP status 200. Also return the updated product document. The response should be a JSON object 
  - *On error* - It will return a suitable error message with a valid HTTP status code. The response should be a JSON object 

### DELETE /deleteProduct/:productId
- Deletes a product by product id if it's not already deleted
- _Response format_
  - *On success* - It will return HTTP status 200. The response should be a JSON object
  - *On error* - It will return a suitable error message with a valid HTTP status code. The response should be a JSON object
