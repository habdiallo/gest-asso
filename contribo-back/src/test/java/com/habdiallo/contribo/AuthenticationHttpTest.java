package com.habdiallo.contribo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.habdiallo.contribo.security.JwtTokenService;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationHttpTest extends RsaIntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService tokenService;

    @Test
    void protectedCurrentUserRequiresBearerToken() throws Exception {
        mockMvc.perform(get("/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void protectedCurrentUserRejectsTokenSignedByAnotherKey() throws Exception {
        mockMvc.perform(get("/me")
                        .header("Authorization", "Bearer " + tokenSignedByAnotherKey(UUID.randomUUID())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void healthProbesArePublic() throws Exception {
        mockMvc.perform(get("/actuator/health/liveness"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/actuator/health/readiness"))
                .andExpect(status().isOk());
    }

    @Test
    void nonHealthActuatorEndpointsAreNotPublic() throws Exception {
        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicEndpointsIgnoreAnInvalidBearerToken() throws Exception {
        mockMvc.perform(get("/actuator/health/liveness")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/auth/login")
                        .header("Authorization", "Bearer invalid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"missing\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void csrfEndpointIssuesAReadableCsrfCookie() throws Exception {
        mockMvc.perform(get("/auth/csrf"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andExpect(cookie().path("XSRF-TOKEN", "/"))
                .andExpect(result -> org.assertj.core.api.Assertions.assertThat(
                        result.getResponse().getHeader("X-XSRF-TOKEN")).isNotBlank());
    }

    @Test
    void cookieSessionAcceptsTheRawAngularCsrfToken() throws Exception {
        MvcResult csrfResponse = mockMvc.perform(get("/auth/csrf")).andReturn();
        String csrfToken = csrfResponse.getResponse().getCookie("XSRF-TOKEN").getValue();
        String sessionToken = tokenService.issue(UUID.randomUUID());

        mockMvc.perform(post("/auth/logout")
                        .cookie(
                                new Cookie("XSRF-TOKEN", csrfToken),
                                new Cookie("__Host-contribo-session", sessionToken))
                        .header("X-XSRF-TOKEN", csrfToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/auth/logout")
                        .cookie(new Cookie("__Host-contribo-session", sessionToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void sameOriginCookieSessionDoesNotRequireReadableCsrfCookie() throws Exception {
        String sessionToken = tokenService.issue(UUID.randomUUID());

        mockMvc.perform(post("/auth/logout")
                        .cookie(new Cookie("__Host-contribo-session", sessionToken))
                        .header("Sec-Fetch-Site", "same-origin"))
                .andExpect(status().isNoContent());
    }

    @Test
    void invalidCredentialsUseContractErrorResponse() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"missing\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void invalidLoginPayloadUsesContractErrorResponse() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void loginIsRateLimitedByIdentifierAndReturns429() throws Exception {
        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(post("/auth/login")
                            .with(request -> {
                                request.setRemoteAddr("198.51.100.77");
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"identifier\":\"rate-limit-test\",\"password\":\"wrong\"}"))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/auth/login")
                        .with(request -> {
                            request.setRemoteAddr("198.51.100.77");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"rate-limit-test\",\"password\":\"wrong\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));
    }
}
