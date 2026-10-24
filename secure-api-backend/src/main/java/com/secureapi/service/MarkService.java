package com.secureapi.service;

import com.secureapi.dto.MarkRequest;
import com.secureapi.dto.MarkResponse;
import com.secureapi.entity.Mark;
import com.secureapi.entity.Role;
import com.secureapi.entity.User;
import com.secureapi.exception.ResourceNotFoundException;
import com.secureapi.repository.MarkRepository;
import com.secureapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class MarkService {
    private final MarkRepository markRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MarkResponse> getMarks(String username, boolean admin, boolean teacher) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Mark> marks = admin ? markRepository.findAllByOrderByIdDesc()
                : teacher ? markRepository.findByUploadedByOrderByIdDesc(username)
                : markRepository.findByStudentIdOrderByIdDesc(user.getId());
        return marks.stream().map(this::toResponse).toList();
    }

    @Transactional
    public MarkResponse create(MarkRequest request, String teacher) {
        if (request.getScore() > request.getMaxScore()) {
            throw new IllegalArgumentException("Score cannot be greater than maximum score");
        }
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (student.getRole() != Role.STUDENT && student.getRole() != Role.USER) {
            throw new IllegalArgumentException("Marks can only be assigned to a student");
        }
        Mark mark = Mark.builder().student(student).subject(request.getSubject().trim())
                .assessment(request.getAssessment().trim()).score(request.getScore())
                .maxScore(request.getMaxScore()).uploadedBy(teacher).build();
        return toResponse(markRepository.save(mark));
    }

    @Transactional
    public void delete(Long id) {
        Mark mark = markRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mark not found with id: " + id));
        markRepository.delete(mark);
    }

    private MarkResponse toResponse(Mark mark) {
        return MarkResponse.builder().id(mark.getId()).studentId(mark.getStudent().getId())
                .studentName(mark.getStudent().getUsername()).subject(mark.getSubject())
                .assessment(mark.getAssessment()).score(mark.getScore()).maxScore(mark.getMaxScore())
                .uploadedBy(mark.getUploadedBy()).build();
    }
}
