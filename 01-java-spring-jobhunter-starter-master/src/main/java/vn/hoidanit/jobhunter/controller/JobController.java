package vn.hoidanit.jobhunter.controller;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.hoidanit.jobhunter.domain.Job;
import vn.hoidanit.jobhunter.domain.User;
import vn.hoidanit.jobhunter.domain.response.ResCreateJobDTO;
import vn.hoidanit.jobhunter.domain.response.ResUpdateJobDTO;
import vn.hoidanit.jobhunter.domain.response.ResultPaginationDTO;
import vn.hoidanit.jobhunter.service.JobService;
import vn.hoidanit.jobhunter.service.UserService;
import vn.hoidanit.jobhunter.util.SecurityUtil;
import vn.hoidanit.jobhunter.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1")
public class JobController {
    private final JobService jobService;
    private final UserService userService;

    // JobService
    public JobController(JobService jobService, UserService userService) {
        this.jobService = jobService;
        this.userService = userService;
    }

    @PostMapping("/jobs")
    @ApiMessage("Create a job")
    public ResponseEntity<ResCreateJobDTO> create(@Valid @RequestBody Job job) {
        // Lấy thông tin user hiện tại
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        User currentUser = this.userService.getUserByUserName(email);
        
        // Tự động gán company của user hiện tại
        if (currentUser != null && currentUser.getCompany() != null) {
            job.setCompany(currentUser.getCompany());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.jobService.create(job));
    }

    @PutMapping("/jobs")
    @ApiMessage("Update a job")
    public ResponseEntity<ResUpdateJobDTO> update(@Valid @RequestBody Job job) throws IdInvalidException {
        Optional<Job> currentJobOpt = this.jobService.fetchJobById(job.getId());
        if (!currentJobOpt.isPresent()) {
            throw new IdInvalidException("Job not found");
        }
        
        Job currentJob = currentJobOpt.get();
        
        // Lấy thông tin user hiện tại
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        User currentUser = this.userService.getUserByUserName(email);
        
        // Kiểm tra user có quyền update job này không (phải cùng company)
        if (currentUser != null && currentUser.getCompany() != null) {
            if (currentJob.getCompany().getId() != currentUser.getCompany().getId()) {
                throw new IdInvalidException("Bạn không có quyền cập nhật job này");
            }
            // Đảm bảo company không bị thay đổi
            job.setCompany(currentUser.getCompany());
        }

        return ResponseEntity.ok()
                .body(this.jobService.update(job, currentJob));
    }

    @DeleteMapping("/jobs/{id}")
    @ApiMessage("Delete a job")
    public ResponseEntity<String> delete(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Job> currentJobOpt = this.jobService.fetchJobById(id);
        if (!currentJobOpt.isPresent()) {
            throw new IdInvalidException("Job not found");
        }
        
        Job currentJob = currentJobOpt.get();
        
        // Lấy thông tin user hiện tại
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        User currentUser = this.userService.getUserByUserName(email);
        
        // Kiểm tra user có quyền delete job này không (phải cùng company)
        if (currentUser != null && currentUser.getCompany() != null) {
            if (currentJob.getCompany().getId() != currentUser.getCompany().getId()) {
                throw new IdInvalidException("Bạn không có quyền xóa job này");
            }
        }

        this.jobService.delete(id);
        return ResponseEntity.ok("Delete successfully");
    }

    @GetMapping("/jobs/{id}")
    @ApiMessage("Get a job by id")
    public ResponseEntity<Job> getJob(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Job> currentJob = this.jobService.fetchJobById(id);
        if (!currentJob.isPresent()) {
            throw new IdInvalidException("Job not found");
        }

        return ResponseEntity.ok().body(currentJob.get());
    }

    @GetMapping("/jobs")
    @ApiMessage("Get job with pagination")
    public ResponseEntity<ResultPaginationDTO> getAllJob(
            @Filter Specification<Job> spec,
            Pageable pageable) {
            
        // Lấy thông tin user hiện tại
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        User currentUser = this.userService.getUserByUserName(email);
        
        // Nếu user không phải ADMIN, chỉ lấy jobs của company họ
        if (currentUser != null && currentUser.getCompany() != null) {
            // Tạo specification để lọc theo company
            Specification<Job> companySpec = (root, query, criteriaBuilder) -> 
                criteriaBuilder.equal(root.get("company").get("id"), currentUser.getCompany().getId());
            
            // Kết hợp với spec hiện tại
            spec = spec != null ? spec.and(companySpec) : companySpec;
        }

        return ResponseEntity.ok().body(this.jobService.fetchAll(spec, pageable));
    }

    @GetMapping("/jobs/all")
    @ApiMessage("Get all jobs without company filter for homepage")
    public ResponseEntity<ResultPaginationDTO> getAllJobsPublic(
            @Filter Specification<Job> spec,
            Pageable pageable) {
        
        // Không áp dụng filter theo company - trả về tất cả jobs cho trang chủ
        return ResponseEntity.ok(this.jobService.fetchAll(spec, pageable));
    }

    @GetMapping("/jobs/user/{userId}")
    @ApiMessage("Fetch jobs by user ID")
    public ResponseEntity<ResultPaginationDTO> getJobsByUserId(
            @PathVariable("userId") long userId,
            @Filter Specification<Job> spec,
            Pageable pageable) {
        
        // Lấy user theo ID
        User user = this.userService.fetchUserById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        // Tạo specification để lọc theo company của user
        Specification<Job> userCompanySpec = (root, query, criteriaBuilder) -> {
            if (user.getCompany() != null) {
                return criteriaBuilder.equal(root.get("company").get("id"), user.getCompany().getId());
            } else {
                // Nếu user không thuộc company nào, trả về empty result
                return criteriaBuilder.disjunction();
            }
        };
        
        // Kết hợp với spec hiện tại nếu có
        Specification<Job> finalSpec = spec != null ? spec.and(userCompanySpec) : userCompanySpec;
        
        return ResponseEntity.ok(this.jobService.fetchAll(finalSpec, pageable));
    }

    @GetMapping("/jobs/company/{companyId}")
    @ApiMessage("Fetch jobs by company ID")
    public ResponseEntity<ResultPaginationDTO> getJobsByCompanyId(
            @PathVariable("companyId") long companyId,
            @Filter Specification<Job> spec,
            Pageable pageable) {
        
        // Tạo specification để lọc theo company ID
        Specification<Job> companySpec = (root, query, criteriaBuilder) -> {
            return criteriaBuilder.equal(root.get("company").get("id"), companyId);
        };
        
        // Kết hợp với spec hiện tại nếu có
        Specification<Job> finalSpec = spec != null ? spec.and(companySpec) : companySpec;
        
        return ResponseEntity.ok(this.jobService.fetchAll(finalSpec, pageable));
    }

}
