package com.habdiallo.contribo.security;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;

/** Resolves a client address without trusting arbitrary forwarding headers. */
@Component
public class ClientAddressResolver {

    /** IP literal (IPv4 or IPv6) with an optional CIDR prefix; hostnames are rejected. */
    private static final Pattern IP_OR_CIDR = Pattern.compile("[0-9A-Fa-f:.]+(/[0-9]{1,3})?");

    private final boolean trustProxyHeaders;
    private final List<IpAddressMatcher> trustedProxies;

    public ClientAddressResolver(
            @Value("${security.proxy.trust-headers:false}") boolean trustProxyHeaders,
            @Value("${security.proxy.trusted-addresses:}") String trustedProxyAddresses) {
        this.trustProxyHeaders = trustProxyHeaders;
        this.trustedProxies = Arrays.stream(trustedProxyAddresses.split(","))
                .map(String::trim)
                .filter(entry -> !entry.isBlank())
                .map(ClientAddressResolver::matcher)
                .toList();
    }

    public String resolve(HttpServletRequest request) {
        String remoteAddress = request.getRemoteAddr();
        if (trustProxyHeaders && isTrustedProxy(remoteAddress)) {
            String realIp = request.getHeader("X-Real-IP");
            if (realIp != null && !realIp.isBlank() && !realIp.contains(",")) {
                return realIp.trim();
            }
        }
        return remoteAddress == null || remoteAddress.isBlank() ? "unknown" : remoteAddress;
    }

    private boolean isTrustedProxy(String remoteAddress) {
        if (remoteAddress == null || remoteAddress.isBlank()) {
            return false;
        }
        return trustedProxies.stream().anyMatch(matcher -> matches(matcher, remoteAddress));
    }

    private static boolean matches(IpAddressMatcher matcher, String remoteAddress) {
        try {
            return matcher.matches(remoteAddress);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private static IpAddressMatcher matcher(String entry) {
        if (!IP_OR_CIDR.matcher(entry).matches()) {
            throw invalidEntry(entry, null);
        }
        try {
            return new IpAddressMatcher(entry);
        } catch (IllegalArgumentException exception) {
            throw invalidEntry(entry, exception);
        }
    }

    private static IllegalStateException invalidEntry(String entry, Exception cause) {
        return new IllegalStateException(
                "Entrée invalide dans TRUSTED_PROXY_ADDRESSES (adresse IP ou plage CIDR attendue) : " + entry, cause);
    }
}
