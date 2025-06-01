package vn.hoidanit.jobhunter.service;

import java.util.List;

import org.springframework.stereotype.Service;

import vn.hoidanit.jobhunter.domain.User;
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

    public User getUserById(long id) {
        return this.userRepository.findOneById(id);
    }

    public List<User> getAllUser() {
        return this.userRepository.findAll();
    }

    public User getUserByUserName(String email) {
        return this.userRepository.findByEmail(email);
    }
}
