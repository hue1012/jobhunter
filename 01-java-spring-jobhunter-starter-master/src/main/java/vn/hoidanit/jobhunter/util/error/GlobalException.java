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

import vn.hoidanit.jobhunter.domain.CustomResponse;

@RestControllerAdvice
public class GlobalException {

    // xu ly exception cua username login khong ton tai va nhap sai thong tin login
    @ExceptionHandler(value = { UsernameNotFoundException.class,
            BadCredentialsException.class })
    public ResponseEntity<CustomResponse<Object>> handleLoginException(
            Exception ex) {
        CustomResponse<Object> res = new CustomResponse<Object>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError(ex.getMessage());
        res.setMessage("Loi");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    // method bắt mọi lỗi validation: với lỗi trả về MethodArgumentNotValidException
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
        cus.setError(ex.getMessage());
        cus.setMessage("Id khong ton tai-message");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cus);
    }

}