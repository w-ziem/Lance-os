package com.wziem.lancebackend.config;

import com.wziem.lancebackend.config.auth.AppUserDetails;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SecurityUtils {

    public static UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No logged in user found in security context");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UUID userId) {
            return userId;
        }
        if (principal instanceof AppUserDetails appUserDetails) {
            return appUserDetails.getUserId();
        }

        throw new IllegalStateException("Unsupported principal type in security context: " + principal.getClass());
    }

    public static Authentication getCurrentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

}
