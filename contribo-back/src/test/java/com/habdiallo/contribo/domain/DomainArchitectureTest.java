package com.habdiallo.contribo.domain;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;

import com.habdiallo.contribo.domain.access.UserRole;
import com.habdiallo.contribo.domain.member.MemberStatus;
import com.habdiallo.contribo.domain.shared.CurrencyCode;

class DomainArchitectureTest {

    @Test
    void domainSourcesDoNotDependOnFrameworksOrGeneratedContractTypes() throws IOException {
        try (Stream<Path> files = Files.walk(Path.of("src/main/java/com/habdiallo/contribo/domain"))) {
            files.filter(path -> path.toString().endsWith(".java")).forEach(path -> {
                try {
                    String source = Files.readString(path);
                    assertFalse(source.contains("import org.springframework"), path.toString());
                    assertFalse(source.contains("import jakarta."), path.toString());
                    assertFalse(source.contains("import com.habdiallo.contribo.api.generated"), path.toString());
                } catch (IOException exception) {
                    throw new IllegalStateException("Cannot read " + path, exception);
                }
            });
        }
    }

    @Test
    void domainValuesAcceptOnlyContractValues() {
        assertFalse(UserRole.fromValue("ADMINISTRATOR") == null);
        assertFalse(MemberStatus.fromValue("ACTIVE") == null);
        assertFalse(CurrencyCode.fromValue("GNF") == null);
        assertThrows(IllegalArgumentException.class, () -> UserRole.fromValue("UNKNOWN"));
        assertThrows(IllegalArgumentException.class, () -> MemberStatus.fromValue("UNKNOWN"));
        assertThrows(IllegalArgumentException.class, () -> CurrencyCode.fromValue("EUR"));
    }
}
