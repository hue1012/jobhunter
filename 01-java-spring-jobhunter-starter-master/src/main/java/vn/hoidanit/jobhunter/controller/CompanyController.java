package vn.hoidanit.jobhunter.controller;

import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hoidanit.jobhunter.domain.Company;
import vn.hoidanit.jobhunter.domain.CustomResponse;
import vn.hoidanit.jobhunter.service.CompanyService;
import vn.hoidanit.jobhunter.util.error.IdValidationException;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
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
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok().body(this.companyService.getAllCompanies());
    }

    @PutMapping("/companies")
    public ResponseEntity<Void> putMethodName(@Valid @RequestBody Company comp) {
        long id = comp.getId();
        Company com = this.companyService.getCompanyById(id);
        this.companyService.handleUpdateComp(comp, com);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompanyById(@PathVariable("id") long id) throws IdValidationException {
        if (this.companyService.getCompanyById(id) == null) {
            throw new IdValidationException("Id khong ton tai");
        }
        this.companyService.deleteCompany(id);
        return ResponseEntity.ok().body(null);

    }

}
