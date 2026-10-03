package com.habdiallo.contribo;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.habdiallo.contribo.security.SessionCookieService;

class SessionCookieServiceTest {

    @Test
    void issuesAThirtyMinuteSecureSessionCookie() {
        SessionCookieService service = new SessionCookieService(1_800);

        assertThat(service.issue("session-token"))
                .contains("Max-Age=1800")
                .contains("Path=/")
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Strict");
    }
}
