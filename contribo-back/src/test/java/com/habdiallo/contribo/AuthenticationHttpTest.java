package com.habdiallo.contribo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationHttpTest extends RsaIntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void protectedCurrentUserRequiresBearerToken() throws Exception {
        mockMvc.perform(get("/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void protectedCurrentUserRejectsTokenSignedByAnotherKey() throws Exception {
        mockMvc.perform(get("/me")
                        .header("Authorization", "Bearer "
                                + tokenSignedByAnotherKey(UUID.randomUUID())))
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
}
