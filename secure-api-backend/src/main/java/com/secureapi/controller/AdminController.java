package com.secureapi.controller;

import com.secureapi.dto.UserResponse;
import com.secureapi.dto.AdminUserUpdateRequest;
import jakarta.validation.Valid;
import com.secureapi.service.AdminService;
import com.secureapi.service.OAuthCredentialService;
import com.secureapi.dto.OAuthCredentialRequest;
import com.secureapi.dto.OAuthCredentialResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OAuthCredentialService oauthCredentialService;

    @PostMapping("/oauth-credentials")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OAuthCredentialResponse> createOAuthCredential(@Valid @RequestBody OAuthCredentialRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(oauthCredentialService.create(request));
    }

    @GetMapping("/oauth-credentials")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OAuthCredentialResponse>> getOAuthCredentials() { return ResponseEntity.ok(oauthCredentialService.list()); }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }
}
