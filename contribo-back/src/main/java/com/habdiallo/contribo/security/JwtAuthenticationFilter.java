package com.habdiallo.contribo.security;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService tokenService;
    private final SessionCookieService sessionCookieService;
    private final RevokedTokenRegistry revokedTokenRegistry;
    private final SecurityAuditLogger auditLogger;
    private final ClientAddressResolver clientAddressResolver;

    public JwtAuthenticationFilter(
            JwtTokenService tokenService,
            SessionCookieService sessionCookieService,
            RevokedTokenRegistry revokedTokenRegistry,
            SecurityAuditLogger auditLogger,
            ClientAddressResolver clientAddressResolver) {
        this.tokenService = tokenService;
        this.sessionCookieService = sessionCookieService;
        this.revokedTokenRegistry = revokedTokenRegistry;
        this.auditLogger = auditLogger;
        this.clientAddressResolver = clientAddressResolver;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String sessionToken = sessionCookieService.readSession(request);
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = sessionToken != null
                ? sessionToken
                : authorization != null && authorization.startsWith("Bearer ")
                        ? authorization.substring(7)
                        : null;
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (revokedTokenRegistry.isRevoked(token)) {
                    throw new InvalidTokenException(new IllegalArgumentException("Revoked token"));
                }
                UUID userId = tokenService.parseUserId(token);
                var authentication = new UsernamePasswordAuthenticationToken(userId, null, List.of());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (InvalidTokenException ignored) {
                SecurityContextHolder.clearContext();
                auditLogger.invalidToken(clientAddressResolver.resolve(request));
            }
        }
        filterChain.doFilter(request, response);
    }
}
