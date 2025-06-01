package vn.hoidanit.jobhunter.domain.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginDTO {
    @NotBlank(message = "Khong duoc de trong truong usernam")
    private String username;
    @NotBlank(message = "Khong duoc de trong truong password")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
