/* hum yaha ek higher order function create karenge kyu ki express direct 
   error handling ka kuch deta feature nahi deta tab hum log har jagah try-catch 
   block se sabko wrap nahi karte rehenge or direct business logic pe dhyan denge !!!!.
*/
//ye ek acha approch hai

const asyncHandler = (handleRequest) => {
    return (req, res, next) => {
        Promise
        .resolve(handleRequest(req, res, next))
        .catch((error) => next(error))
    }
}

export default asyncHandler;