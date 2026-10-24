package com.secureapi.service;

import com.secureapi.dto.UserResponse;
import com.secureapi.dto.AdminUserUpdateRequest;
import com.secureapi.entity.User;
import com.secureapi.exception.ResourceNotFoundException;
import com.secureapi.repository.UserRepository;
import com.secureapi.repository.MarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final MarkRepository markRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        markRepository.deleteByStudentId(id);
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.findByUsername(request.getUsername()).filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new IllegalArgumentException("Username is already taken"); });
        userRepository.findByEmail(request.getEmail()).filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new IllegalArgumentException("Email is already registered"); });
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        return UserResponse.builder().id(user.getId()).username(user.getUsername())
                .email(user.getEmail()).role(user.getRole()).build();
    }
}
