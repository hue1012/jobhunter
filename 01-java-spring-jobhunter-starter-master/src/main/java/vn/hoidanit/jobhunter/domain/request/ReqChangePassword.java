package vn.hoidanit.jobhunter.domain.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqChangePassword {

    @NotBlank(message = "Không được để trống mật khẩu hiện tại")
    private String currentPassword;

    @NotBlank(message = "Vui lòng nhập mật khẩu mới")
    private String newPassword;

    @Override
    public String toString() {
        return "ReqChangePassword{" +
                "currentPasswordLength=" + (currentPassword != null ? currentPassword.length() : 0) +
                ", newPasswordLength=" + (newPassword != null ? newPassword.length() : 0) +
                '}';
    }
}