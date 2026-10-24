package com.secureapi.dto;
import java.time.Instant;
public record OAuthCredentialResponse(Long id, String provider, String accountIdentifier, Instant createdAt, Instant updatedAt) { }
