package com.secureapi.controller;

import com.secureapi.dto.UserResponse;
import com.secureapi.entity.Role;
import com.secureapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/teacher") @RequiredArgsConstructor
public class TeacherController {
    private final UserRepository userRepository;

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public List<UserResponse> students() {
        return userRepository.findAllByRole(Role.STUDENT).stream().map(user -> UserResponse.builder()
                .id(user.getId()).username(user.getUsername()).email(user.getEmail()).role(user.getRole()).build()).toList();
    }
}
