package com.habdiallo.contribo.security;

import java.time.Duration;
import java.util.Arrays;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class SessionCookieService {

    public static final String SESSION_COOKIE = "__Host-contribo-session";
    public static final String LOCAL_SESSION_COOKIE = "contribo-session";
    public static final String CSRF_COOKIE = "XSRF-TOKEN";

    private final Duration maxAge;
    private final boolean secure;
    private final String sessionCookieName;

    public SessionCookieService(
            @Value("${security.jwt.expiration-seconds}") long expirationSeconds,
            @Value("${security.session-cookie.secure:true}") boolean secure) {
        this.maxAge = Duration.ofSeconds(SessionDurationPolicy.validate(expirationSeconds));
        this.secure = secure;
        this.sessionCookieName = secure ? SESSION_COOKIE : LOCAL_SESSION_COOKIE;
    }

    public String sessionCookieName() {
        return sessionCookieName;
    }

    public String readSession(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> sessionCookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    public String issue(String token) {
        return ResponseCookie.from(sessionCookieName, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build()
                .toString();
    }

    public String clear() {
        return ResponseCookie.from(sessionCookieName, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ZERO)
                .build()
                .toString();
    }
}
