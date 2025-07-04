package vn.hoidanit.jobhunter.util.error;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import vn.hoidanit.jobhunter.domain.response.CustomResponse;

@RestControllerAdvice
public class GlobalException {

    // handle all exception
    @ExceptionHandler(Exception.class)
    public ResponseEntity<CustomResponse<Object>> handleAllException(Exception ex) {
        CustomResponse<Object> res = new CustomResponse<Object>();
        res.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
        res.setMessage(ex.getMessage());
        res.setError("Internal Server Error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
    }

    // Xử lý exception của username login không tồn tại và nhập sai thông tin login
    @ExceptionHandler(value = { UsernameNotFoundException.class, BadCredentialsException.class })
    public ResponseEntity<CustomResponse<Object>> handleLoginException(Exception ex) {
        CustomResponse<Object> res = new CustomResponse<Object>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError(ex.getMessage());
        res.setMessage("Loi");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    // Method bắt mọi lỗi validation: với lỗi trả về MethodArgumentNotValidException
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CustomResponse<Object>> validateError(MethodArgumentNotValidException ex) {
        BindingResult result = ex.getBindingResult();
        final List<FieldError> fieldErrors = result.getFieldErrors();

        CustomResponse<Object> res = new CustomResponse<>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError(ex.getBody().getDetail());

        List<String> errors = fieldErrors.stream().map(f -> f.getDefaultMessage()).collect(Collectors.toList());
        res.setMessage(errors.size() > 1 ? errors : errors.get(0));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    @ExceptionHandler(IdValidationException.class)
    public ResponseEntity<CustomResponse<Object>> handleIdException(IdValidationException ex) {
        CustomResponse<Object> cus = new CustomResponse<>();
        cus.setStatusCode(HttpStatus.BAD_REQUEST.value());
        cus.setMessage(ex.getMessage());
        cus.setError("Id khong ton tai-message");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cus);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<CustomResponse<Object>> handleFileUploadException(Exception ex) {
        CustomResponse<Object> res = new CustomResponse<Object>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setMessage(ex.getMessage());
        res.setError("LOI UPLOAD FILE");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    @ExceptionHandler(value = {
            PermissionException.class,
    })
    public ResponseEntity<CustomResponse<Object>> handlePermissionException(Exception ex) {
        CustomResponse<Object> res = new CustomResponse<Object>();
        res.setStatusCode(HttpStatus.FORBIDDEN.value());
        res.setMessage("Forbidden"); // da dang nhap khong co quyen
        res.setError(ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(res);
    }

}