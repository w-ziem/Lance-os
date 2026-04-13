package com.wziem.lancebackend.config.auth;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.auth.refresh-cookie")
@Data
public class RefreshCookieProperties {
    private String name = "refresh_token";
    private String path = "/auth";
    private long maxAgeSeconds = 604800;
    private boolean secure = false;
    private String sameSite = "Lax";
}

