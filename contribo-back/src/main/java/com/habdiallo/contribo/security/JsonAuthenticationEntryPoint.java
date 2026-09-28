package com.habdiallo.contribo.security;

import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.ErrorResponse;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecurityAuditLogger auditLogger;

    public JsonAuthenticationEntryPoint(SecurityAuditLogger auditLogger) {
        this.auditLogger = auditLogger;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        auditLogger.authorizationDenied(request.getRemoteAddr(), null);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), new ErrorResponse(
                ErrorCode.AUTHENTICATION_REQUIRED,
                "Une authentification valide est requise."));
    }
}
