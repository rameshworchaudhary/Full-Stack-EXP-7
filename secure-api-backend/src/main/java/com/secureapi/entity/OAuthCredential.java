package com.secureapi.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "oauth_credentials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OAuthCredential {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String provider;
    @Column(name = "account_identifier", nullable = false, length = 190) private String accountIdentifier;
    @Column(name = "encrypted_access_token", nullable = false, columnDefinition = "TEXT") private String encryptedAccessToken;
    @Column(name = "encrypted_refresh_token", columnDefinition = "TEXT") private String encryptedRefreshToken;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
}
