package com.habdiallo.contribo.security;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Resolves a client address without trusting arbitrary forwarding headers. */
@Component
public class ClientAddressResolver {

    private final boolean trustProxyHeaders;
    private final Set<String> trustedProxyAddresses;

    public ClientAddressResolver(
            @Value("${security.proxy.trust-headers:false}") boolean trustProxyHeaders,
            @Value("${security.proxy.trusted-addresses:}") String trustedProxyAddresses) {
        this.trustProxyHeaders = trustProxyHeaders;
        this.trustedProxyAddresses = Arrays.stream(trustedProxyAddresses.split(","))
                .map(String::trim)
                .filter(address -> !address.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    public String resolve(HttpServletRequest request) {
        String remoteAddress = request.getRemoteAddr();
        if (trustProxyHeaders && trustedProxyAddresses.contains(remoteAddress)) {
            String realIp = request.getHeader("X-Real-IP");
            if (realIp != null && !realIp.isBlank() && !realIp.contains(",")) {
                return realIp.trim();
            }
        }
        return remoteAddress == null || remoteAddress.isBlank() ? "unknown" : remoteAddress;
    }
}
