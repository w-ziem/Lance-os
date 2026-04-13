package com.wziem.lancebackend.config.jwt;


import com.wziem.lancebackend.config.auth.AppUserDetails;
import com.wziem.lancebackend.model.entity.User;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;


@Service
@AllArgsConstructor
public class JwtService {
    private static final String TOKEN_TYPE_CLAIM = "tokenType";
    private static final String ACCESS_TOKEN = "access";
    private static final String REFRESH_TOKEN = "refresh";
    private final JwtConfig jwtConfig;

    //refresh token is 7 days
    public String generateRefreshToken(User user) {
        return generateToken(user, jwtConfig.getRefreshExpiration(), REFRESH_TOKEN);
    }


    public String generateAccessToken(User user) {
        return generateToken(user, jwtConfig.getExpiration(), ACCESS_TOKEN);
    }

    private String generateToken(User user, long tokenExpirationTime, String tokenType) {
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + tokenExpirationTime))
                .signWith(jwtConfig.getSecretKey())
                .claim("email", user.getEmail())
                .claim("userId", user.getId())
                .claim("fullName", user.getFullName())
                .claim(TOKEN_TYPE_CLAIM, tokenType)
                // CONFIG add other claims here later - eg. provider
                .compact();
    }

    public Jwt parse(String token) {
        var claims = Jwts.parser().verifyWith(jwtConfig.getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return new Jwt(claims, jwtConfig.getSecretKey());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            Jwt jwt = parse(token);
            String email = jwt.getClaims().get("email", String.class);
            String tokenType = jwt.getClaims().get(TOKEN_TYPE_CLAIM, String.class);
            if (!ACCESS_TOKEN.equals(tokenType) || jwt.isExpired()) {
                return false;
            }

            if (userDetails instanceof AppUserDetails appUserDetails) {
                return email.equals(appUserDetails.getUsername()) && appUserDetails.getUserId().equals(jwt.getUserId());
            }

            return email.equals(userDetails.getUsername());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isRefreshTokenValid(String token, User user) {
        try {
            Jwt jwt = parse(token);
            String email = jwt.getClaims().get("email", String.class);
            String tokenType = jwt.getClaims().get(TOKEN_TYPE_CLAIM, String.class);
            return REFRESH_TOKEN.equals(tokenType)
                    && email.equals(user.getEmail())
                    && user.getId().equals(jwt.getUserId())
                    && !jwt.isExpired();
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUserEmail(String jwt) {
        return parse(jwt).getClaims().get("email", String.class);
    }
}

