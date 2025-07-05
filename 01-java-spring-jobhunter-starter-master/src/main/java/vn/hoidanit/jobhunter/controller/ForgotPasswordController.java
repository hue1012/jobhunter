package vn.hoidanit.jobhunter.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import vn.hoidanit.jobhunter.service.ForgotPasswordService;
import vn.hoidanit.jobhunter.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/auth")
public class ForgotPasswordController {
    
    @Autowired
    private ForgotPasswordService forgotPasswordService;
    
    @PostMapping("/forgot-password")
    @ApiMessage("Gửi email khôi phục mật khẩu thành công")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        forgotPasswordService.sendResetPasswordEmail(request.getEmail());
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/reset-password/{token}")
    @ApiMessage("Kiểm tra token thành công")
    public ResponseEntity<ValidateTokenResponse> validateToken(@PathVariable String token) {
        String email = forgotPasswordService.validateResetToken(token);
        return ResponseEntity.ok(new ValidateTokenResponse(email));
    }
    
    @PostMapping("/reset-password")
    @ApiMessage("Đặt lại mật khẩu thành công")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        forgotPasswordService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}

// Request DTOs
class ForgotPasswordRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
    
    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }
}

class ResetPasswordRequest {
    @NotBlank(message = "Token không được để trống")
    private String token;
    
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String newPassword;
    
    public String getToken() { 
        return token; 
    }
    
    public void setToken(String token) { 
        this.token = token; 
    }
    
    public String getNewPassword() { 
        return newPassword; 
    }
    
    public void setNewPassword(String newPassword) { 
        this.newPassword = newPassword; 
    }
}

class ValidateTokenResponse {
    private String email;
    
    public ValidateTokenResponse(String email) { 
        this.email = email; 
    }
    
    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }
}
