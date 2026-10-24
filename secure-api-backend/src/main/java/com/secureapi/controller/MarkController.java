package com.secureapi.controller;

import com.secureapi.dto.MarkRequest;
import com.secureapi.dto.MarkResponse;
import com.secureapi.service.MarkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController @RequestMapping("/api/marks") @RequiredArgsConstructor
public class MarkController {
    private final MarkService markService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'USER', 'ADMIN')")
    public List<MarkResponse> getMarks(Principal principal, Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        boolean teacher = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_TEACHER"));
        return markService.getMarks(principal.getName(), admin, teacher);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<MarkResponse> addMark(@Valid @RequestBody MarkRequest request, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(markService.create(request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMark(@PathVariable Long id) {
        markService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
