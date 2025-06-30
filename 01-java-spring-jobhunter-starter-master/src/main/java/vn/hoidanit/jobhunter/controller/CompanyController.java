package vn.hoidanit.jobhunter.controller;

import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.hoidanit.jobhunter.domain.Company;
import vn.hoidanit.jobhunter.domain.CustomResponse;
import vn.hoidanit.jobhunter.domain.dto.CompanyDTO;
import vn.hoidanit.jobhunter.domain.dto.ResultPaginationDTO;
import vn.hoidanit.jobhunter.service.CompanyService;
import vn.hoidanit.jobhunter.util.error.IdValidationException;

import java.lang.reflect.Parameter;
import java.util.List;
import java.util.Optional;

import org.hibernate.query.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/v1")
public class CompanyController {
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/companies")
    public ResponseEntity<Company> postMethodName(@Valid @RequestBody Company comp) {
        Company com = this.companyService.saveCompany(comp);
        return ResponseEntity.status(HttpStatus.CREATED).body(com);
    }

    @GetMapping("/companies")
    public ResponseEntity<ResultPaginationDTO> getAllCompanies(
            @Filter Specification<Company> spec,
            Pageable pageable) {

        return ResponseEntity.ok(this.companyService.fetchAllCompany(spec, pageable)); // nem qua sv
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<Company> putCompanyById(@PathVariable("id") long id, @RequestBody CompanyDTO compDTO) {
        return ResponseEntity.status(HttpStatus.OK).body(this.companyService.updateById(id, compDTO));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompanyById(@PathVariable("id") long id) throws IdValidationException {
        if (this.companyService.getCompanyById(id) == null) {
            throw new IdValidationException("Id khong ton tai");
        }
        this.companyService.deleteCompany(id);
        return ResponseEntity.ok().body(null);

    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable("id") long id) throws IdValidationException {
        Company com = this.companyService.getCompanyById(id);
        return ResponseEntity.ok().body(com);
    }

}
