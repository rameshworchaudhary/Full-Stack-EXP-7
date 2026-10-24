package com.secureapi.dto;

import com.secureapi.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    @NotBlank @Size(min = 3, max = 50) private String username;
    @NotBlank @Email private String email;
    @NotNull private Role role;
}
