package vn.hoidanit.jobhunter.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import vn.hoidanit.jobhunter.domain.User;
import vn.hoidanit.jobhunter.repository.UserRepository;
import vn.hoidanit.jobhunter.controller.IdInvalidException;

@Service
public class ForgotPasswordService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${frontend.url}")
    private String frontendUrl;
    
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int TOKEN_LENGTH = 32;
    
    public void sendResetPasswordEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IdInvalidException("Email không tồn tại trong hệ thống");
        }
        
        // Tạo reset token
        String resetToken = generateResetToken();
        Instant expiry = Instant.now().plusSeconds(3600); // 1 hour
        
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpires(expiry);
        userRepository.save(user);
        
        // Gửi email
        sendEmail(email, resetToken, user.getName());
    }
    
    public String validateResetToken(String token) {
        Optional<User> userOpt = userRepository.findByResetPasswordTokenAndResetPasswordExpiresAfter(
            token, Instant.now()
        );
        
        if (!userOpt.isPresent()) {
            throw new IdInvalidException("Token không hợp lệ hoặc đã hết hạn");
        }
        
        return userOpt.get().getEmail();
    }
    
    public void resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetPasswordTokenAndResetPasswordExpiresAfter(
            token, Instant.now()
        );
        
        if (!userOpt.isPresent()) {
            throw new IdInvalidException("Token không hợp lệ hoặc đã hết hạn");
        }
        
        User user = userOpt.get();
        
        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);
        userRepository.save(user);
    }
    
    private String generateResetToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder token = new StringBuilder(TOKEN_LENGTH);
        
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            token.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        
        return token.toString();
    }
    
    private void sendEmail(String to, String token, String userName) {
        try {
            String resetUrl = frontendUrl + "/auth/reset-password?token=" + token;
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("🔐 Khôi phục mật khẩu - JobHunter");
            
            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8faff;">
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Khôi Phục Mật Khẩu</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">JobHunter - Nền tảng tuyển dụng IT hàng đầu</p>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Xin chào <strong>%s</strong>,</p>
                        <p style="font-size: 16px; color: #555; line-height: 1.6;">
                            Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản JobHunter của mình. 
                            Hãy nhấn vào nút bên dưới để đặt lại mật khẩu.
                        </p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="%s" style="
                                background: linear-gradient(135deg, #667eea, #764ba2);
                                color: white;
                                padding: 15px 40px;
                                text-decoration: none;
                                border-radius: 25px;
                                font-weight: bold;
                                font-size: 16px;
                                display: inline-block;
                                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                                transition: all 0.3s ease;
                            ">
                                 Đặt Lại Mật Khẩu
                            </a>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <p style="font-size: 14px; color: #856404; margin: 0;">
                                ⚠️ <strong>Lưu ý quan trọng:</strong><br>
                                • Liên kết này sẽ hết hạn sau <strong>1 giờ</strong><br>
                                • Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này<br>
                                • Không chia sẻ liên kết này với bất kỳ ai
                            </p>
                        </div>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                            <p style="font-size: 14px; color: #777; margin: 0;">
                                Nếu bạn gặp vấn đề với nút trên, hãy copy và paste liên kết sau vào trình duyệt:<br>
                                <a href="%s" style="color: #667eea; word-break: break-all;">%s</a>
                            </p>
                        </div>
                        <div style="margin-top: 30px; text-align: center;">
                            <p style="font-size: 14px; color: #999; margin: 0;">
                                © 2024 JobHunter. Nền tảng tuyển dụng IT số 1 Việt Nam.
                            </p>
                        </div>
                    </div>
                </div>
                """.formatted(userName, resetUrl, resetUrl, resetUrl);
            
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }
}
