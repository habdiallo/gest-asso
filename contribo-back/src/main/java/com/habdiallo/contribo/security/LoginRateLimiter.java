package com.habdiallo.contribo.security;

import java.time.Clock;
import java.time.Duration;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class LoginRateLimiter {

    private final int ipLimit;
    private final int identifierLimit;
    private final Duration window;
    private final Clock clock;
    private final ConcurrentHashMap<String, WindowCounter> counters = new ConcurrentHashMap<>();
    private long lastPurgeAt;

    @Autowired
    public LoginRateLimiter(
            @Value("${security.rate-limit.login.ip-limit:10}") int ipLimit,
            @Value("${security.rate-limit.login.identifier-limit:5}") int identifierLimit,
            @Value("${security.rate-limit.login.window-seconds:60}") long windowSeconds) {
        this(ipLimit, identifierLimit, Duration.ofSeconds(windowSeconds), Clock.systemUTC());
    }

    LoginRateLimiter(int ipLimit, int identifierLimit, Duration window, Clock clock) {
        if (ipLimit < 1 || identifierLimit < 1 || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("Invalid login rate limit configuration");
        }
        this.ipLimit = ipLimit;
        this.identifierLimit = identifierLimit;
        this.window = window;
        this.clock = clock;
        this.lastPurgeAt = clock.millis();
    }

    public synchronized void check(String clientAddress, String identifier) {
        purgeExpiredCounters(clock.millis());
        String normalizedIdentifier = identifier == null
                ? "<missing>"
                : identifier.trim().toLowerCase(Locale.ROOT);
        checkCounter("ip:" + clientAddress, ipLimit);
        checkCounter("identifier:" + normalizedIdentifier, identifierLimit);
    }

    private void checkCounter(String key, int limit) {
        long now = clock.millis();
        WindowCounter counter = counters.compute(key, (ignored, current) -> {
            if (current == null || now - current.startedAt() >= window.toMillis()) {
                return new WindowCounter(now, new AtomicInteger(1));
            }
            current.count().incrementAndGet();
            return current;
        });
        if (counter.count().get() > limit) {
            throw new RateLimitExceededException();
        }
    }

    private void purgeExpiredCounters(long now) {
        if (now - lastPurgeAt < window.toMillis()) {
            return;
        }
        counters.entrySet().removeIf(entry -> now - entry.getValue().startedAt() >= window.toMillis());
        lastPurgeAt = now;
    }

    int counterCount() {
        return counters.size();
    }

    private record WindowCounter(long startedAt, AtomicInteger count) {
    }
}
