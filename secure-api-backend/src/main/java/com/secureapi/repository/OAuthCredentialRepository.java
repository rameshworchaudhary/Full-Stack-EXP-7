package com.secureapi.repository;

import com.secureapi.entity.OAuthCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OAuthCredentialRepository extends JpaRepository<OAuthCredential, Long> { }
