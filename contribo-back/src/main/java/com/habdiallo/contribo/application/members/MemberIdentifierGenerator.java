package com.habdiallo.contribo.application.members;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Locale;
import java.util.Random;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

/** Generates readable member login identifiers without coupling them to contact data. */
@Component
public class MemberIdentifierGenerator {

    private static final int CODE_BOUND = 10_000;
    private static final int MAX_PREFIX_LENGTH = 145;
    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern FIRST_NAME_SEPARATOR = Pattern.compile("[\\s\\-']+");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]");
    private static final Pattern NON_ALPHANUMERIC_OR_SPACE = Pattern.compile("[^a-z0-9 ]");

    private final Random random;

    public MemberIdentifierGenerator() {
        this(new java.security.SecureRandom());
    }

    MemberIdentifierGenerator(Random random) {
        this.random = random;
    }

    public String generate(String firstName, String lastName) {
        String prefix = prefix(firstName, lastName);
        return prefix + "-" + String.format(Locale.ROOT, "%04d", random.nextInt(CODE_BOUND));
    }

    static String prefix(String firstName, String lastName) {
        String normalizedFirstName = normalize(firstName);
        String initials = Arrays.stream(FIRST_NAME_SEPARATOR.split(normalizedFirstName.trim()))
                .filter(part -> !part.isBlank())
                .map(part -> part.substring(0, 1))
                .reduce("", String::concat);
        String normalizedLastName = NON_ALPHANUMERIC.matcher(normalize(lastName)).replaceAll("");
        String prefix = initials + normalizedLastName;
        if (prefix.isBlank()) {
            prefix = "member";
        }
        return prefix.substring(0, Math.min(prefix.length(), MAX_PREFIX_LENGTH));
    }

    private static String normalize(String value) {
        String decomposed = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD);
        String withoutDiacritics = DIACRITICS.matcher(decomposed).replaceAll("");
        return NON_ALPHANUMERIC_OR_SPACE.matcher(withoutDiacritics.toLowerCase(Locale.ROOT)
                .replace('-', ' ').replace('\'', ' ')).replaceAll(" ");
    }
}
