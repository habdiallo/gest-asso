package com.habdiallo.contribo.api.rest;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Collections;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestBodyPresenceFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, jakarta.servlet.FilterChain filterChain)
            throws jakarta.servlet.ServletException, IOException {
        if (!"PATCH".equalsIgnoreCase(request.getMethod())
                || !request.getRequestURI().startsWith(request.getContextPath() + "/members/")) {
            filterChain.doFilter(request, response);
            return;
        }
        byte[] body = request.getInputStream().readAllBytes();
        request.setAttribute(RequestBodyPresence.ATTRIBUTE, fields(body));
        filterChain.doFilter(new CachedBodyRequest(request, body), response);
    }

    private Set<String> fields(byte[] body) {
        if (body.length == 0) {
            return Collections.emptySet();
        }
        try {
            JsonNode json = objectMapper.readTree(body);
            if (json == null || !json.isObject()) {
                return Collections.emptySet();
            }
            Set<String> fields = new HashSet<>();
            json.fieldNames().forEachRemaining(fields::add);
            return Set.copyOf(fields);
        } catch (IOException exception) {
            return Collections.emptySet();
        }
    }

    private static final class CachedBodyRequest extends HttpServletRequestWrapper {

        private final byte[] body;

        private CachedBodyRequest(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream input = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public int read() {
                    return input.read();
                }

                @Override
                public boolean isFinished() {
                    return input.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }
    }
}
