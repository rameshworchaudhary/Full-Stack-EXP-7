package com.secureapi.service;

import com.secureapi.dto.AuthResponse;
import com.secureapi.dto.LoginRequest;
import com.secureapi.dto.RegisterRequest;
import com.secureapi.dto.UserResponse;
import com.secureapi.entity.Role;
import com.secureapi.entity.User;
import com.secureapi.exception.UserAlreadyExistsException;
import com.secureapi.repository.UserRepository;
import com.secureapi.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    @Value("${app.jwt.expiration-ms:900000}") private long accessTokenLifetimeMs;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email '" + request.getEmail() + "' is already registered");
        }

        Role requestedRole;
        try {
            requestedRole = request.getRole() == null || request.getRole().isBlank()
                    ? Role.USER : Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Role must be STUDENT or TEACHER");
        }
        if (requestedRole != Role.STUDENT && requestedRole != Role.TEACHER && requestedRole != Role.USER) {
            throw new IllegalArgumentException("Public registration is available for students and teachers only");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(requestedRole)
                .build();

        User savedUser = userRepository.save(user);

        return UserResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate credentials against Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return tokensFor(user, refreshTokenService.issue(user));
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshTokenService.Issued renewed = refreshTokenService.rotate(refreshToken);
        // The token service performs lookup and rotation; resolve user from the renewed token's record via a helper.
        return tokensFor(refreshTokenService.userFor(renewed.token()), renewed);
    }

    public void logout(String refreshToken) { refreshTokenService.revoke(refreshToken); }

    private AuthResponse tokensFor(User user, RefreshTokenService.Issued refresh) {
        String token = jwtTokenProvider.generateAccessToken(user.getUsername(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .accessToken(token)
                .refreshToken(refresh.token())
                .tokenType("Bearer")
                .expiresIn(accessTokenLifetimeMs / 1000)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}
