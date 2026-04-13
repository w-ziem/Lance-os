package com.wziem.lancebackend.config.auth;

import com.wziem.lancebackend.model.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByEmail(username.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new UsernameNotFoundException("User not found for email: " + username));

        return new AppUserDetails(user.getId(), user.getEmail());
    }
}

