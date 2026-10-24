package com.secureapi.config;

import com.secureapi.entity.Role;
import com.secureapi.entity.User;
import com.secureapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Value;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    @Value("${app.seed-demo-users:false}") private boolean seedDemoUsers;
    @Value("${app.demo-admin-password:}") private String adminPassword;
    @Value("${app.demo-user-password:}") private String userPassword;

    @Override
    public void run(String... args) {
        migrateRoleColumn();
        if (!seedDemoUsers) return;
        // Seed ADMIN account if not existing
        if (!adminPassword.isBlank() && !userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Development ADMIN user seeded successfully");
        }

        // Seed default USER account if not existing
        if (!userPassword.isBlank() && !userRepository.existsByUsername("john")) {
            User john = User.builder()
                    .username("john")
                    .email("john@example.com")
                    .password(passwordEncoder.encode(userPassword))
                    .role(Role.USER)
                    .build();
            userRepository.save(john);
            log.info("Development USER user seeded successfully");
        }
    }

    private void migrateRoleColumn() {
        jdbcTemplate.execute((org.springframework.jdbc.core.ConnectionCallback<Void>) connection -> {
            if (connection.getMetaData().getDatabaseProductName().toLowerCase().contains("mysql")) {
                try (var statement = connection.createStatement()) {
                    statement.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL");
                }
            }
            return null;
        });
    }
}
