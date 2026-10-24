package com.secureapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.secureapi.dto.LoginRequest;
import com.secureapi.dto.RegisterRequest;
import com.secureapi.security.JwtTokenProvider;
import com.secureapi.repository.OAuthCredentialRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthAndRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired private OAuthCredentialRepository oauthCredentialRepository;

    @Test
    public void testUserRegistrationSuccess() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("testuser1")
                .email("testuser1@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("testuser1"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    public void testUserLoginSuccess() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .username("john")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("john"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    public void testUnauthenticatedAccessToProtectedEndpointReturns401() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testUserAccessingUserProfileReturns200() throws Exception {
        String token = jwtTokenProvider.generateToken("john", com.secureapi.entity.Role.USER);

        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("john"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    public void testUserAccessingAdminEndpointReturns403() throws Exception {
        String token = jwtTokenProvider.generateToken("john", com.secureapi.entity.Role.USER);

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Access denied"));
    }

    @Test
    public void testAdminAccessingAdminEndpointReturns200() throws Exception {
        String token = jwtTokenProvider.generateToken("admin", com.secureapi.entity.Role.ADMIN);

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void refreshTokenRotatesAndLogoutRevokes() throws Exception {
        String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"john\",\"password\":\"password123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String refresh = objectMapper.readTree(login).get("refreshToken").asText();
        String renewed = mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("refreshToken", refresh))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String next = objectMapper.readTree(renewed).get("refreshToken").asText();
        mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("refreshToken", refresh))))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/logout").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("refreshToken", next))))
                .andExpect(status().isNoContent());
        mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("refreshToken", next))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void oauthCredentialsAreEncryptedAndNeverReturned() throws Exception {
        String admin = jwtTokenProvider.generateToken("admin", com.secureapi.entity.Role.ADMIN);
        String body = "{\"provider\":\"Example\",\"accountIdentifier\":\"account-1\",\"accessToken\":\"very-secret-access\",\"refreshToken\":\"very-secret-refresh\"}";
        mockMvc.perform(post("/api/admin/oauth-credentials").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("very-secret"))));
        var stored = oauthCredentialRepository.findAll().get(0);
        org.junit.jupiter.api.Assertions.assertNotEquals("very-secret-access", stored.getEncryptedAccessToken());
        mockMvc.perform(get("/api/admin/oauth-credentials").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("very-secret"))));
    }
}
