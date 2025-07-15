package vn.hoidanit.jobhunter.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.hoidanit.jobhunter.domain.Job;
import vn.hoidanit.jobhunter.domain.Skill;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    
    // Fetch jobs với skills và company để tránh LazyInitializationException
    @Query("SELECT DISTINCT j FROM Job j LEFT JOIN FETCH j.skills LEFT JOIN FETCH j.company")
    List<Job> findAllWithSkillsAndCompany();
    
    // Method để lấy jobs theo danh sách skills (cho SubscriberService)
    @Query("SELECT DISTINCT j FROM Job j " +
           "LEFT JOIN FETCH j.skills s " +
           "LEFT JOIN FETCH j.company " +
           "WHERE s IN :skills AND j.active = true " +
           "ORDER BY j.createdAt DESC")
    List<Job> findBySkillsIn(@Param("skills") List<Skill> skills);
}