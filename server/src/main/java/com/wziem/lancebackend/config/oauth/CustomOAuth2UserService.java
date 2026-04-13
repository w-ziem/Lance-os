package com.wziem.lancebackend.config.oauth;

import com.wziem.lancebackend.model.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import com.wziem.lancebackend.model.entity.User;

import java.util.Locale;


@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Get data from OAuth2 provider
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String normalizedEmail = email == null ? null : email.toLowerCase(Locale.ROOT);
        String resolvedName = (name == null || name.isBlank()) ? "OAuth2 User" : name;
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user_info"), "Missing email in OAuth2 response");
        }

        // Check if user exists in DB, if not create new user
        userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(normalizedEmail)
                                .fullName(resolvedName)
                                .build()
                ));

        return oAuth2User;
    }
}
