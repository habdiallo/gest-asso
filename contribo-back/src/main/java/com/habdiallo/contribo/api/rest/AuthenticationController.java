package com.habdiallo.contribo.api.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.web.csrf.CsrfToken;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.habdiallo.contribo.api.generated.model.LoginRequest;
import com.habdiallo.contribo.api.generated.model.LoginResponse;
import com.habdiallo.contribo.api.generated.model.ChangePasswordRequest;
import com.habdiallo.contribo.application.auth.AuthenticationService;
import com.habdiallo.contribo.application.access.CurrentUserId;
import com.habdiallo.contribo.security.ClientAddressResolver;
import com.habdiallo.contribo.security.LoginRateLimiter;
import com.habdiallo.contribo.security.RateLimitExceededException;
import com.habdiallo.contribo.security.RevokedTokenRegistry;
import com.habdiallo.contribo.security.SecurityAuditLogger;
import com.habdiallo.contribo.security.SessionCookieService;
import com.habdiallo.contribo.security.JwtTokenService;

@RestController
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final ClientAddressResolver clientAddressResolver;
    private final LoginRateLimiter loginRateLimiter;
    private final SessionCookieService sessionCookieService;
    private final JwtTokenService tokenService;
    private final RevokedTokenRegistry revokedTokenRegistry;
    private final SecurityAuditLogger auditLogger;

    public AuthenticationController(
            AuthenticationService authenticationService,
            ClientAddressResolver clientAddressResolver,
            LoginRateLimiter loginRateLimiter,
            SessionCookieService sessionCookieService,
            JwtTokenService tokenService,
            RevokedTokenRegistry revokedTokenRegistry,
            SecurityAuditLogger auditLogger) {
        this.authenticationService = authenticationService;
        this.clientAddressResolver = clientAddressResolver;
        this.loginRateLimiter = loginRateLimiter;
        this.sessionCookieService = sessionCookieService;
        this.tokenService = tokenService;
        this.revokedTokenRegistry = revokedTokenRegistry;
        this.auditLogger = auditLogger;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        String clientAddress = clientAddressResolver.resolve(request);
        try {
            loginRateLimiter.check(clientAddress, loginRequest.getIdentifier());
        } catch (RateLimitExceededException exception) {
            auditLogger.rateLimited(loginRequest.getIdentifier(), clientAddress);
            throw exception;
        }
        AuthenticationService.AuthenticatedSession session = authenticationService.login(
                loginRequest, clientAddress);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, sessionCookieService.issue(session.token()))
                .body(session.response());
    }

    @GetMapping("/auth/csrf")
    public ResponseEntity<Void> csrf(CsrfToken token) {
        token.getToken();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/password/change")
    public ResponseEntity<LoginResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
            HttpServletRequest request) {
        AuthenticationService.AuthenticatedSession session = authenticationService.changePassword(
                CurrentUserId.get(),
                changePasswordRequest.getCurrentPassword(),
                changePasswordRequest.getNewPassword(),
                isPasswordChangeOnly(request));
        revokeCurrentToken(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, sessionCookieService.issue(session.token()))
                .body(session.response());
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String token = sessionCookieService.readSession(request);
        if (token != null) {
            revokedTokenRegistry.revoke(token, tokenService.parseExpiration(token));
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .header(HttpHeaders.SET_COOKIE, sessionCookieService.clear())
                .build();
    }

    private void revokeCurrentToken(HttpServletRequest request) {
        String token = currentToken(request);
        if (token != null) {
            revokedTokenRegistry.revoke(token, tokenService.parseExpiration(token));
        }
    }

    private boolean isPasswordChangeOnly(HttpServletRequest request) {
        String token = currentToken(request);
        return token != null && tokenService.parsePasswordChangeOnly(token);
    }

    private String currentToken(HttpServletRequest request) {
        String token = sessionCookieService.readSession(request);
        if (token == null) {
            String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7);
            }
        }
        return token;
    }
}
