package com.secureapi.repository;

import com.secureapi.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentIdOrderByIdDesc(Long studentId);
    List<Mark> findAllByOrderByIdDesc();
    List<Mark> findByUploadedByOrderByIdDesc(String uploadedBy);
    void deleteByStudentId(Long studentId);
}
