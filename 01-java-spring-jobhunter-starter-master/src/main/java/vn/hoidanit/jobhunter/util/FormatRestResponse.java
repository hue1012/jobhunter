package vn.hoidanit.jobhunter.util;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import jakarta.servlet.http.HttpServletResponse;
import vn.hoidanit.jobhunter.domain.CustomResponse;

@ControllerAdvice
public class FormatRestResponse implements ResponseBodyAdvice<Object> {

    // những api nào được ghi đè. Ở trường hợp này ta ghi đè mọi apiapi
    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        return true;
    }

    // thao tác trước khi gửi về response
    @Override
    @Nullable
    public Object beforeBodyWrite(@Nullable Object body, MethodParameter returnType, MediaType selectedContentType,
            Class selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {

        // lay statusCode
        HttpServletResponse servletResponse = ((ServletServerHttpResponse) response).getServletResponse();
        int status = servletResponse.getStatus();
        CustomResponse<Object> res = new CustomResponse<Object>();
        res.setStatusCode(status);
        // nếu data thuộc dạng String thì k thể chuyển sang json được, phải trả về data
        // luôn.
        // nhung truong hop nhu: delete,.. tra ve String, khong phai loi thi tra ve body
        // luon
        if (body instanceof String) {
            return body;
        }
        if (status >= 400) {
            return body;
        } else {
            res.setData(body);
            res.setMessage("Call api success");
        }
        return res;
    }

}
