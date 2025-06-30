package vn.hoidanit.jobhunter.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.util.Resource;

import vn.hoidanit.jobhunter.domain.Company;
import vn.hoidanit.jobhunter.domain.dto.CompanyDTO;
import vn.hoidanit.jobhunter.domain.dto.ResultPaginationDTO;
import vn.hoidanit.jobhunter.repository.CompanyRepository;
import vn.hoidanit.jobhunter.util.error.ResourceNotFoundException;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company saveCompany(Company comp) {
        return this.companyRepository.save(comp);
    }

    public List<Company> getAllCompanies(Pageable pageable) {
        Page<Company> pageCompanies = this.companyRepository.findAll(pageable);
        return pageCompanies.getContent();
    }

    public Company getCompanyById(long id) {
        if (!this.companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company with id " + id + " not found");
        }
        return this.companyRepository.findOneById(id);
    }

    public void deleteCompany(long id) {
        if (!this.companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company with id " + id + " not found");
        }
        this.companyRepository.deleteById(id);
    }

    public Company updateById(long id, CompanyDTO compDTO) {
        Company com = this.getCompanyById(id);
        if (com == null) {
            throw new ResourceNotFoundException("Company with id " + id + " not found");
        }
        com.setAddress(compDTO.getAddress());
        com.setDescription(compDTO.getDescription());
        com.setName(compDTO.getName());
        com.setLogo(compDTO.getLogo());
        return this.companyRepository.save(com);
    }

    // convert sang Dto

    // lay du lieu loc o bang company, Pageable chua thong tin phan trang
    public ResultPaginationDTO fetchAllCompany(Specification<Company> spec, Pageable pageable) {
        Page<Company> pageCompanies = this.companyRepository.findAll(spec, pageable);
        ResultPaginationDTO result = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();

        meta.setPage(pageable.getPageNumber() + 1);// sotrang lay tu 0
        meta.setPageSize(pageable.getPageSize());
        meta.setTotal(pageCompanies.getTotalElements());
        meta.setPages(pageCompanies.getTotalPages()); // tongsotrang

        result.setMeta(meta);
        result.setResult(pageCompanies.getContent());
        return result;
    }
}
