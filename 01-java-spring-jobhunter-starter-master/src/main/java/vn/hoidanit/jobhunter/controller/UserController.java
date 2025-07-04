package vn.hoidanit.jobhunter.controller;

import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.hoidanit.jobhunter.domain.Resume;
import vn.hoidanit.jobhunter.domain.User;
import vn.hoidanit.jobhunter.domain.response.ResCreateUserDTO;
import vn.hoidanit.jobhunter.domain.response.ResUpdateUserDTO;
import vn.hoidanit.jobhunter.domain.response.ResUserDTO;
import vn.hoidanit.jobhunter.domain.response.ResultPaginationDTO;
import vn.hoidanit.jobhunter.repository.ResumeRepository;
import vn.hoidanit.jobhunter.service.UserService;
import vn.hoidanit.jobhunter.util.SecurityUtil;
import vn.hoidanit.jobhunter.util.annotation.ApiMessage;
import vn.hoidanit.jobhunter.util.error.IdValidationException;
import vn.hoidanit.jobhunter.util.error.PermissionException;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/v1") // prefix cho tat ca cac api
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final ResumeRepository resumeRepository;

    public UserController(UserService userService, PasswordEncoder passwordEncoder, ResumeRepository resumeRepository) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.resumeRepository = resumeRepository;
    }

    @PostMapping("/users")
    @ApiMessage("create a new user")
    public ResponseEntity<ResCreateUserDTO> getMethodName(@Valid @RequestBody User user) throws IdValidationException {
        // check email da ton tai chua
        Boolean isEmailExist = this.userService.isEmailExist(user.getEmail());
        if (isEmailExist) {
            throw new IdValidationException("Email" + user.getEmail() + "da ton tai");
        }
        String hashPass = this.passwordEncoder.encode(user.getPassword());
        user.setPassword(hashPass);
        User newUser = this.userService.handleCreateUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(this.userService.convertToResCreateUserDTO(newUser));
    }

    @DeleteMapping("/users/{id}")
    @ApiMessage("delete user by id")
    public ResponseEntity<String> deleteUser(@PathVariable("id") long id) throws IdValidationException {
        User user = this.userService.fetchUserById(id);
        if (user == null) {
            throw new IdValidationException("User với Id = " + id + "khong ton tai");
        }

        List<Resume> resumes = resumeRepository.findByUserId(id);
        resumeRepository.deleteAll(resumes);

        this.userService.handleDeleteUser(id);
        return ResponseEntity.ok("Xóa user thành công");
    }

    @GetMapping("/users/{id}")
    @ApiMessage("get user by id")
    public ResponseEntity<ResUserDTO> getUserById(@PathVariable("id") long id) throws IdValidationException {
        User user = this.userService.fetchUserById(id);
        if (user == null) {
            throw new IdValidationException("User với Id = " + id + "khong ton tai");
        }
        // return ResponseEntity.status(HttpStatus.OK).body(user);
        return ResponseEntity.status(HttpStatus.OK).body(this.userService.convertToResUserDTO(user));
    }

    @GetMapping("/users")
    @ApiMessage("get all user")
    public ResponseEntity<ResultPaginationDTO> getAllUser(

            @Filter Specification<User> spec,
            Pageable pageable) {

        return ResponseEntity.ok(this.userService.fetchAllUser(spec, pageable));
    }

    @PutMapping("/users/{id}")
    @ApiMessage("update user")
    public ResponseEntity<ResUpdateUserDTO> updateUser(
            @PathVariable("id") long id,
            @RequestBody User user) throws IdValidationException {

        // 1. Lấy user đang đăng nhập
        String currentEmail = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (currentEmail == null) {
            throw new IdValidationException("Bạn chưa đăng nhập");
        }

        User currentUser = this.userService.getUserByUserName(currentEmail);

        // 2. So sánh id trong path với id người đang đăng nhập
        if (currentUser.getId() != id) {
            throw new IdValidationException("Bạn không được phép cập nhật người dùng khác");
        }

        // 3. Cập nhật
        user.setId(id); // giữ đúng id
        User oldUser = this.userService.handleUpdateUser(user);
        if (oldUser == null) {
            throw new IdValidationException("User với Id = " + id + " không tồn tại");
        }

        return ResponseEntity.ok(this.userService.convertToResUpdateUserDTO(oldUser));
    }

}
