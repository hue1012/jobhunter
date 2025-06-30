package vn.hoidanit.jobhunter.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import vn.hoidanit.jobhunter.domain.User;
import vn.hoidanit.jobhunter.domain.dto.ResCreateUser;
import vn.hoidanit.jobhunter.domain.dto.ResUpdateUserDTO;
import vn.hoidanit.jobhunter.domain.dto.ResUserDTO;
import vn.hoidanit.jobhunter.domain.dto.ResultPaginationDTO;
import vn.hoidanit.jobhunter.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User handleSaveUser(User user) {
        return this.userRepository.save(user);
    }

    public void handleDeleteUser(long id) {
        this.userRepository.deleteById(id);
    }

    public List<User> getAllUser() {
        return this.userRepository.findAll();
    }

    public User getUserByUserName(String email) {
        return this.userRepository.findByEmail(email);
    }

    public boolean isEmailExist(String email) {
        // kiểm tra xem email đã tồn tại trong cơ sở dữ liệu hay chưa
        return this.userRepository.existsByEmail(email);
    }

    public User fetchUserById(long id) {
        // tìm kiếm người dùng theo id
        Optional<User> user = this.userRepository.findById(id);
        if (user.isPresent()) {
            return user.get();
        }
        return this.userRepository.findOneById(id);
    }

    public ResUserDTO convertToResUserDTO(User user) {
        ResUserDTO resUserDTO = new ResUserDTO();
        resUserDTO.setId(user.getId());
        resUserDTO.setEmail(user.getEmail());
        resUserDTO.setName(user.getName());
        resUserDTO.setAge(user.getAge());
        resUserDTO.setGender(user.getGender());
        resUserDTO.setAddress(user.getAddress());
        resUserDTO.setCreatedAt(user.getCreatedAt());
        return resUserDTO;
    }

    public ResCreateUser convertToResCreateUserDTO(User user) {
        ResCreateUser resCreateUser = new ResCreateUser();
        resCreateUser.setId(user.getId());
        resCreateUser.setEmail(user.getEmail());
        resCreateUser.setName(user.getName());
        resCreateUser.setAge(user.getAge());
        resCreateUser.setGender(user.getGender());
        resCreateUser.setAddress(user.getAddress());
        resCreateUser.setCreatedAt(user.getCreatedAt());
        return resCreateUser;
    }

    public User handleUpdateUser(User oldUser) {
        User user = this.fetchUserById(oldUser.getId());
        if (user != null) {
            // Cập nhật thông tin người dùng
            user.setName(oldUser.getName());
            user.setAge(oldUser.getAge());
            user.setGender(oldUser.getGender());
            user.setAddress(oldUser.getAddress());

            user = this.userRepository.save(user);
        }
        return user;
    }

    public ResUpdateUserDTO convertToResUpdateUserDTO(User user) {
        ResUpdateUserDTO resUpdateUserDTO = new ResUpdateUserDTO();
        resUpdateUserDTO.setId(user.getId());
        resUpdateUserDTO.setName(user.getName());
        resUpdateUserDTO.setAge(user.getAge());
        resUpdateUserDTO.setGender(user.getGender());
        resUpdateUserDTO.setAddress(user.getAddress());
        resUpdateUserDTO.setUpdatedAt(user.getUpdatedAt());
        return resUpdateUserDTO;
    }

    // pageable la 1 interface trong spring data, chua cac phuong thuc phan trang
    public ResultPaginationDTO fetchAllUser(Specification<User> spec, Pageable pageable) {
        // Dùng Spring Data JPA để lấy dữ liệu từ bảng company theo phân trang
        Page<User> pageUser = this.userRepository.findAll(spec, pageable);
        ResultPaginationDTO result = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();

        meta.setPage(pageable.getPageNumber() + 1); // getNumber() trả về số trang bắt đầu từ 0
        meta.setPageSize(pageable.getPageSize());
        meta.setTotal(pageUser.getTotalElements());
        meta.setPages(pageUser.getTotalPages());

        result.setMeta(meta);// gan thong tin phan trang

        // Chuyển đổi danh sách User sang danh sách ResUserDTO -> Bo thong tin nhay cam
        // paswpasw
        // Sử dụng Stream API để chuyển đổi từng User sang ResUserDTO
        List<ResUserDTO> resUserDTOs = pageUser.getContent().stream()
                .map(item -> new ResUserDTO(
                        item.getId(),
                        item.getName(),
                        item.getEmail(),
                        item.getAge(),
                        item.getGender(),
                        item.getAddress(),
                        item.getCreatedAt(),
                        item.getUpdatedAt()))
                .collect(Collectors.toList());
        // chuyen doi sang ResUserDTO
        result.setResult(resUserDTOs); // gan danh sach ket qua
        return result;

    }

    public void updateUserToken(String token, String email) {
        User currentUser = this.getUserByUserName(email);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    public User getUserByRefreshTokenAndEmail(String token, String email) {
        return this.userRepository.findByRefreshTokenAndEmail(token, email);
    }

}
