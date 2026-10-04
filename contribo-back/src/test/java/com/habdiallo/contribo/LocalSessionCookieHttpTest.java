package com.habdiallo.contribo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import com.habdiallo.contribo.security.JwtTokenService;

@SpringBootTest(properties = "security.session-cookie.secure=false")
@AutoConfigureMockMvc
class LocalSessionCookieHttpTest extends RsaIntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService tokenService;

    @Test
    void localHttpSessionCookieAuthenticatesAndIsClearedOnLogout() throws Exception {
        String sessionToken = tokenService.issue(UUID.randomUUID());

        mockMvc.perform(post("/auth/logout")
                        .cookie(new Cookie("contribo-session", sessionToken))
                        .header("Sec-Fetch-Site", "same-origin"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().value("contribo-session", ""))
                .andExpect(cookie().maxAge("contribo-session", 0));
    }
}
