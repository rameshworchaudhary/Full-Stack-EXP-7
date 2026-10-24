package com.secureapi.service;

import com.secureapi.dto.OAuthCredentialRequest;
import com.secureapi.dto.OAuthCredentialResponse;
import com.secureapi.entity.OAuthCredential;
import com.secureapi.repository.OAuthCredentialRepository;
import com.secureapi.security.AesGcmEncryptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Service @RequiredArgsConstructor
public class OAuthCredentialService {
    private final OAuthCredentialRepository repository;
    private final AesGcmEncryptionService encryption;
    @Transactional public OAuthCredentialResponse create(OAuthCredentialRequest request) {
        Instant now = Instant.now();
        OAuthCredential saved = repository.save(OAuthCredential.builder().provider(request.getProvider().trim()).accountIdentifier(request.getAccountIdentifier().trim())
                .encryptedAccessToken(encryption.encrypt(request.getAccessToken()))
                .encryptedRefreshToken(request.getRefreshToken() == null || request.getRefreshToken().isBlank() ? null : encryption.encrypt(request.getRefreshToken()))
                .createdAt(now).updatedAt(now).build());
        return response(saved);
    }
    @Transactional(readOnly = true) public List<OAuthCredentialResponse> list() { return repository.findAll().stream().map(OAuthCredentialService::response).toList(); }
    private static OAuthCredentialResponse response(OAuthCredential item) { return new OAuthCredentialResponse(item.getId(), item.getProvider(), item.getAccountIdentifier(), item.getCreatedAt(), item.getUpdatedAt()); }
}
