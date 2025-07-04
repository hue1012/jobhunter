package vn.hoidanit.jobhunter.domain.response;

//chỉ là custom phần body của responseEntity, giúp cho client dễ dàng đọc 
public class CustomResponse<T> {
    private int statusCode;
    private String error;
    // message co the la: String or ArrayList
    private Object message;
    private T data;

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Object getMessage() {
        return message;
    }

    public void setMessage(Object message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

}
