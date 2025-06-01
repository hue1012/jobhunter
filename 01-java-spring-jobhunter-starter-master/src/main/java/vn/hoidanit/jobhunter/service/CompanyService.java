package vn.hoidanit.jobhunter.service;

import java.util.List;

import org.springframework.stereotype.Service;

import vn.hoidanit.jobhunter.domain.Company;
import vn.hoidanit.jobhunter.repository.CompanyRepository;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company saveCompany(Company comp) {
        return this.companyRepository.save(comp);
    }

    public List<Company> getAllCompanies() {
        return this.companyRepository.findAll();
    }

    public Company getCompanyById(long id) {
        return this.companyRepository.findOneById(id);
    }

    public void deleteCompany(long id) {
        this.companyRepository.deleteById(id);
    }

    public void handleUpdateComp(Company comp, Company com) {
        if (com != null) {
            com.setName(comp.getName());
            com.setDescription(com.getDescription());
            com.setAddress(comp.getAddress());
            com.setLogo(comp.getLogo());
        }
        this.companyRepository.save(com);
    }
}
