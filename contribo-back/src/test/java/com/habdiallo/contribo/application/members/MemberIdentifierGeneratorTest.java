package com.habdiallo.contribo.application.members;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Random;

import org.junit.jupiter.api.Test;

class MemberIdentifierGeneratorTest {

    @Test
    void usesOneInitialPerFirstNamePartAndRemovesAccents() {
        MemberIdentifierGenerator generator = new MemberIdentifierGenerator(new Random(7));

        assertThat(generator.generate("Jean-Pierre", "Diallo")).matches("jpdiallo-\\d{4}");
        assertThat(generator.generate("Aïssatou Mariama", "Bah")).matches("ambah-\\d{4}");
    }

    @Test
    void doesNotDependOnPhoneOrAllowEmptyNamePrefix() {
        MemberIdentifierGenerator generator = new MemberIdentifierGenerator(new Random(7));

        assertThat(generator.generate("", "")).matches("member-\\d{4}");
    }
}
