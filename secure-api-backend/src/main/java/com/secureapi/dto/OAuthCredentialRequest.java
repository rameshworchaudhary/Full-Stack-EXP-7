package com.secureapi.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data public class OAuthCredentialRequest {
    @NotBlank @Size(max=80) private String provider;
    @NotBlank @Size(max=190) private String accountIdentifier;
    @NotBlank private String accessToken;
    private String refreshToken;
}
