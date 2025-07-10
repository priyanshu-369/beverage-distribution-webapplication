
class ApiResponse {
    //niche hum jo parameters lene wale hai vo define kanege
    constructor(statusCode, data, message){
        //yaha hum class properties(varibles) ko value assign karenge
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export default ApiResponse;