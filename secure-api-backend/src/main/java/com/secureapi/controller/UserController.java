package com.secureapi.controller;

import com.secureapi.dto.UserResponse;
import com.secureapi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'USER', 'ADMIN')")
    public ResponseEntity<UserResponse> getProfile(Principal principal) {
        UserResponse profile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }
}
