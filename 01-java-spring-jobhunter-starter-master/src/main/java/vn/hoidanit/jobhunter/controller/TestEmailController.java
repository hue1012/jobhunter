package vn.hoidanit.jobhunter.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/test")
public class TestEmailController {
    
    @Autowired
    private JavaMailSender emailSender;
    
    @GetMapping("/email")
    public ResponseEntity<String> testEmail(@RequestParam String to) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Test Email");
            message.setText("Đây là email test từ JobHunter application!");
            message.setFrom("doanthithuhue101203@gmail.com");
            
            emailSender.send(message);
            return ResponseEntity.ok("Email sent successfully to: " + to);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }
}
