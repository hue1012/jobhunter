package vn.hoidanit.jobhunter.controller;

import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.hoidanit.jobhunter.domain.User;
import vn.hoidanit.jobhunter.domain.dto.ResCreateUser;
import vn.hoidanit.jobhunter.domain.dto.ResUpdateUserDTO;
import vn.hoidanit.jobhunter.domain.dto.ResUserDTO;
import vn.hoidanit.jobhunter.domain.dto.ResultPaginationDTO;
import vn.hoidanit.jobhunter.service.UserService;
import vn.hoidanit.jobhunter.util.annotation.ApiMessage;
import vn.hoidanit.jobhunter.util.error.IdValidationException;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
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
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1") // prefix cho tat ca cac api
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    @ApiMessage("create a new user")
    public ResponseEntity<ResCreateUser> getMethodName(@Valid @RequestBody User user) throws IdValidationException {
        // check email da ton tai chua
        Boolean isEmailExist = this.userService.isEmailExist(user.getEmail());
        if (isEmailExist) {
            throw new IdValidationException("Email" + user.getEmail() + "da ton tai");
        }
        String hashPass = this.passwordEncoder.encode(user.getPassword());
        user.setPassword(hashPass);
        User newUser = this.userService.handleSaveUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(this.userService.convertToResCreateUserDTO(newUser));
    }

    @DeleteMapping("/users/{id}")
    @ApiMessage("delete user by id")
    public ResponseEntity<String> deleteUser(@PathVariable("id") long id) throws IdValidationException {
        User user = this.userService.fetchUserById(id);
        if (user == null) {
            throw new IdValidationException("User với Id = " + id + "khong ton tai");
        }
        this.userService.handleDeleteUser(id);
        return ResponseEntity.status(HttpStatus.OK).body("delete success");// no_content: khong can tra ve gi
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

    @PutMapping("/users")
    @ApiMessage("update user")
    public ResponseEntity<ResUpdateUserDTO> updateUser(@RequestBody User user) throws IdValidationException {
        User oldUser = this.userService.handleUpdateUser(user);
        if (oldUser == null) {
            throw new IdValidationException("User với Id = " + user.getId() + "khong ton tai");
        }
        return ResponseEntity.ok(this.userService.convertToResUpdateUserDTO(oldUser));
    }
}
