package com.wziem.lancebackend.config.auth;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.auth.code")
@Data
public class AuthCodeProperties {
    private int length = 6;
    private long ttlSeconds = 600;
}

