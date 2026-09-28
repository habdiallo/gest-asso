package com.habdiallo.contribo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.core.convert.converter.Converter;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JsonAuthenticationEntryPoint jsonAuthenticationEntryPoint)
            throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/auth/login",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info")
                        .permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jsonAuthenticationEntryPoint))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationEntryPoint(jsonAuthenticationEntryPoint)
                        .bearerTokenResolver(publicEndpointAwareBearerTokenResolver())
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(uuidJwtAuthenticationConverter())));
        return http.build();
    }

    private BearerTokenResolver publicEndpointAwareBearerTokenResolver() {
        DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
        return request -> isPublicEndpoint(request) ? null : delegate.resolve(request);
    }

    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return path.equals("/auth/login")
                || path.equals("/actuator/info")
                || path.equals("/actuator/health")
                || path.startsWith("/actuator/health/");
    }

    private Converter<Jwt, ? extends AbstractAuthenticationToken> uuidJwtAuthenticationConverter() {
        return jwt -> {
            try {
                UUID userId = UUID.fromString(jwt.getSubject());
                return new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        userId, jwt, AuthorityUtils.NO_AUTHORITIES);
            } catch (IllegalArgumentException exception) {
                throw new BadCredentialsException("Le sujet UUID du jeton est invalide.", exception);
            }
        };
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
