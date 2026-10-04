package com.habdiallo.contribo;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import com.habdiallo.contribo.security.SessionCookieService;

class SessionCookieServiceTest {

    @Test
    void issuesAThirtyMinuteSecureSessionCookie() {
        SessionCookieService service = new SessionCookieService(1_800, true);

        assertThat(service.issue("session-token"))
                .contains("__Host-contribo-session=session-token")
                .contains("Max-Age=1800")
                .contains("Path=/")
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Strict");
    }

    @Test
    void issuesAndReadsAnHttpLocalSessionCookieWithoutHostPrefix() {
        SessionCookieService service = new SessionCookieService(1_800, false);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("contribo-session", "session-token"));

        assertThat(service.sessionCookieName()).isEqualTo("contribo-session");
        assertThat(service.issue("session-token"))
                .contains("contribo-session=session-token")
                .doesNotContain("__Host-")
                .doesNotContain("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Strict");
        assertThat(service.readSession(request)).isEqualTo("session-token");
        assertThat(service.clear())
                .contains("contribo-session=")
                .doesNotContain("Secure")
                .contains("Max-Age=0");
    }
}
