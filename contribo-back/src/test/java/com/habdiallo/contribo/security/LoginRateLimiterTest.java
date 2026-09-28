package com.habdiallo.contribo.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class LoginRateLimiterTest {

    @Test
    void resetsCountersAfterTheConfiguredWindow() {
        MutableClock clock = new MutableClock();
        LoginRateLimiter limiter = new LoginRateLimiter(1, 1, Duration.ofMinutes(1), clock);

        limiter.check("198.51.100.10", "user@example.test");
        limiter.check("198.51.100.11", "other@example.test");
        assertThat(limiter.counterCount()).isEqualTo(4);
        assertThatThrownBy(() -> limiter.check("198.51.100.10", "user@example.test"))
                .isInstanceOf(RateLimitExceededException.class);

        clock.advance(Duration.ofMinutes(1));

        assertThatCode(() -> limiter.check("198.51.100.10", "user@example.test"))
                .doesNotThrowAnyException();
        assertThat(limiter.counterCount()).isEqualTo(2);
    }

    private static final class MutableClock extends Clock {
        private Instant instant = Instant.parse("2026-09-28T00:00:00Z");

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }

        void advance(Duration duration) {
            instant = instant.plus(duration);
        }
    }
}
