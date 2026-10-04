package com.habdiallo.contribo.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ClientAddressResolverTest {

    @Test
    void ignoresForwardingHeadersFromAnUntrustedClient() {
        ClientAddressResolver resolver = new ClientAddressResolver(false, "");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("198.51.100.10");
        request.addHeader("X-Real-IP", "203.0.113.10");
        request.addHeader("X-Forwarded-For", "203.0.113.11");

        assertThat(resolver.resolve(request)).isEqualTo("198.51.100.10");
    }

    @Test
    void acceptsOnlyTheRealIpHeaderFromAnExplicitlyTrustedProxy() {
        ClientAddressResolver resolver = new ClientAddressResolver(true, "10.0.0.2");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.2");
        request.addHeader("X-Real-IP", "203.0.113.10");
        request.addHeader("X-Forwarded-For", "203.0.113.11");

        assertThat(resolver.resolve(request)).isEqualTo("203.0.113.10");
    }

    @Test
    void acceptsTheRealIpHeaderFromAProxyInsideATrustedCidrRange() {
        ClientAddressResolver resolver = new ClientAddressResolver(true, "172.30.0.0/24, 10.0.0.2");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("172.30.0.57");
        request.addHeader("X-Real-IP", "203.0.113.10");

        assertThat(resolver.resolve(request)).isEqualTo("203.0.113.10");
    }

    @Test
    void ignoresTheRealIpHeaderFromAnAddressOutsideTheTrustedRanges() {
        ClientAddressResolver resolver = new ClientAddressResolver(true, "172.30.0.0/24");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("172.31.0.57");
        request.addHeader("X-Real-IP", "203.0.113.10");

        assertThat(resolver.resolve(request)).isEqualTo("172.31.0.57");
    }

    @Test
    void acceptsIpv6Ranges() {
        ClientAddressResolver resolver = new ClientAddressResolver(true, "fd00::/8");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("fd12::5");
        request.addHeader("X-Real-IP", "203.0.113.10");

        assertThat(resolver.resolve(request)).isEqualTo("203.0.113.10");
    }

    @Test
    void rejectsAnInvalidTrustedProxyEntryAtStartup() {
        assertThatThrownBy(() -> new ClientAddressResolver(true, "frontend"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("TRUSTED_PROXY_ADDRESSES")
                .hasMessageContaining("frontend");
        assertThatThrownBy(() -> new ClientAddressResolver(true, "172.30.0.0/99"))
                .isInstanceOf(IllegalStateException.class);
    }
}
