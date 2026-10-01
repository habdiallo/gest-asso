package com.habdiallo.contribo.security;

import jakarta.servlet.http.HttpServletRequest;

final class RequestPaths {

    private RequestPaths() {
    }

    /**
     * Chemin de la requête relatif au context-path applicatif (ex. {@code /auth/login}), quel que
     * soit le context-path configuré. Contrairement à {@link HttpServletRequest#getServletPath()},
     * reste fiable sous {@code MockMvc} (où le dispatch par motif de chemin peut laisser
     * {@code getServletPath()} vide) : calculé uniquement à partir de {@code getRequestURI()} et
     * {@code getContextPath()}, deux appels Servlet bruts non affectés par le dispatch de Spring MVC.
     */
    static String pathWithinApplication(HttpServletRequest request) {
        return request.getRequestURI().substring(request.getContextPath().length());
    }
}
