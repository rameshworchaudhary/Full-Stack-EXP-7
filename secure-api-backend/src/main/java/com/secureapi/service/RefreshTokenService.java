package com.secureapi.service;

import com.secureapi.entity.RefreshToken;
import com.secureapi.entity.User;
import com.secureapi.repository.RefreshTokenRepository;
import com.secureapi.exception.InvalidRefreshTokenException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository repository;
    private final long lifetimeMs;
    private final SecureRandom random = new SecureRandom();
    public RefreshTokenService(RefreshTokenRepository repository, @Value("${app.jwt.refresh-expiration-ms:604800000}") long lifetimeMs) { this.repository = repository; this.lifetimeMs = lifetimeMs; }
    @Transactional public Issued issue(User user) {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant now = Instant.now();
        repository.save(RefreshToken.builder().user(user).tokenHash(hash(raw)).createdAt(now).expiresAt(now.plusMillis(lifetimeMs)).revoked(false).build());
        return new Issued(raw, lifetimeMs);
    }
    @Transactional public Issued rotate(String raw) {
        RefreshToken old = repository.findByTokenHash(hash(raw)).orElseThrow(RefreshTokenService::invalid);
        if (old.isRevoked() || !old.getExpiresAt().isAfter(Instant.now())) throw invalid();
        old.setRevoked(true);
        Issued next = issue(old.getUser());
        RefreshToken replacement = repository.findByTokenHash(hash(next.token())).orElseThrow();
        old.setReplacedBy(replacement);
        repository.save(old);
        return next;
    }
    @Transactional public void revoke(String raw) {
        RefreshToken token = repository.findByTokenHash(hash(raw)).orElseThrow(RefreshTokenService::invalid);
        if (token.isRevoked() || !token.getExpiresAt().isAfter(Instant.now())) throw invalid();
        token.setRevoked(true);
        repository.save(token);
    }
    @Transactional(readOnly = true) public User userFor(String raw) {
        return repository.findByTokenHash(hash(raw)).map(RefreshToken::getUser).orElseThrow(RefreshTokenService::invalid);
    }
    private static String hash(String raw) {
        try { return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
    private static InvalidRefreshTokenException invalid() { return new InvalidRefreshTokenException(); }
    public record Issued(String token, long expiresIn) { }
}
