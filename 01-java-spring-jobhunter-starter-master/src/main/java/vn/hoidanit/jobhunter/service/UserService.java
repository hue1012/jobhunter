package vn.hoidanit.jobhunter.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import vn.hoidanit.jobhunter.domain.Company;
import vn.hoidanit.jobhunter.domain.Role;
import vn.hoidanit.jobhunter.domain.User;
import vn.hoidanit.jobhunter.domain.response.ResCreateUserDTO;
import vn.hoidanit.jobhunter.domain.response.ResUpdateUserDTO;
import vn.hoidanit.jobhunter.domain.response.ResUserDTO;
import vn.hoidanit.jobhunter.domain.response.ResultPaginationDTO;
import vn.hoidanit.jobhunter.repository.UserRepository;

@Service
public class UserService {

    private final CompanyService companyService;
    private final UserRepository userRepository;
    private final RoleService roleService;

    public UserService(UserRepository userRepository, CompanyService companyService, RoleService roleService) {
        this.userRepository = userRepository;
        this.companyService = companyService;
        this.roleService = roleService;
    }

    public User handleCreateUser(User user) {
        if (user.getCompany() != null) {
            Optional<Company> companyOptinal = this.companyService.findById(user.getCompany().getId());
            user.setCompany(companyOptinal.isPresent() ? companyOptinal.get() : null);
        }

        // check role
        if (user.getRole() != null) {
            Role r = this.roleService.fetchById(user.getRole().getId());
            user.setRole(r != null ? r : null);
        }

        return this.userRepository.save(user);
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
        ResUserDTO.CompanyUser com = new ResUserDTO.CompanyUser();
        ResUserDTO.RoleUser roleUser = new ResUserDTO.RoleUser();

        if (user.getCompany() != null) {
            com.setId(user.getCompany().getId()); // gan ve phan hoi
            com.setName(user.getCompany().getName());
            resUserDTO.setCompany(com);
        }
        if (user.getRole() != null) {
            roleUser.setId(user.getRole().getId()); // gan ve phan hoi
            roleUser.setName(user.getRole().getName());
            resUserDTO.setRole(roleUser);
        }

        resUserDTO.setId(user.getId());
        resUserDTO.setEmail(user.getEmail());
        resUserDTO.setName(user.getName());
        resUserDTO.setAge(user.getAge());
        resUserDTO.setGender(user.getGender());
        resUserDTO.setAddress(user.getAddress());
        resUserDTO.setCreatedAt(user.getCreatedAt());
        return resUserDTO;
    }

    public ResCreateUserDTO convertToResCreateUserDTO(User user) {
        ResCreateUserDTO resCreateUser = new ResCreateUserDTO();
        ResCreateUserDTO.CompanyUser com = new ResCreateUserDTO.CompanyUser();

        resCreateUser.setId(user.getId());
        resCreateUser.setEmail(user.getEmail());
        resCreateUser.setName(user.getName());
        resCreateUser.setAge(user.getAge());
        resCreateUser.setGender(user.getGender());
        resCreateUser.setAddress(user.getAddress());
        resCreateUser.setCreatedAt(user.getCreatedAt());

        if (user.getCompany() != null) {
            com.setId(user.getCompany().getId()); // gan ve phan hoi
            com.setName(user.getCompany().getName());
            resCreateUser.setCompany(com);
        }

        return resCreateUser;
    }

    public User handleUpdateUser(User reqUser) {
        User currentUser = this.fetchUserById(reqUser.getId());
        if (currentUser != null) {
            // Cập nhật thông tin người dùng
            currentUser.setName(reqUser.getName());
            currentUser.setAge(reqUser.getAge());
            currentUser.setGender(reqUser.getGender());
            currentUser.setAddress(reqUser.getAddress());

            // check company
            if (reqUser.getCompany() != null) {
                Optional<Company> companyOptinal = this.companyService.findById(reqUser.getCompany().getId());
                currentUser.setCompany(companyOptinal.isPresent() ? companyOptinal.get() : null);
            }

            // check role
            if (reqUser.getRole() != null) {
                Role r = this.roleService.fetchById(reqUser.getRole().getId());
                currentUser.setRole(r != null ? r : null);
            }
            // update
            currentUser = this.userRepository.save(currentUser);
        }
        return currentUser;
    }

    public ResUpdateUserDTO convertToResUpdateUserDTO(User user) {
        ResUpdateUserDTO resUpdateUserDTO = new ResUpdateUserDTO();
        ResUpdateUserDTO.CompanyUser com = new ResUpdateUserDTO.CompanyUser();

        if (user.getCompany() != null) {
            com.setId(user.getCompany().getId()); // gan ve phan hoi
            com.setName(user.getCompany().getName());
            resUpdateUserDTO.setCompany(com);
        }

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
                .map(item -> this.convertToResUserDTO(item)) // truyen tung ng dung rieng le
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
