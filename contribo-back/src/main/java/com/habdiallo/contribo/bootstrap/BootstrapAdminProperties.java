package com.habdiallo.contribo.bootstrap;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "bootstrap.admin")
public class BootstrapAdminProperties {

    private boolean enabled;
    private String identifier = "admin";
    private String password;
    private String passwordFile;
    private String associationName = "Contribo";
    private String currency = "GNF";
    private String incomeCategoryLabel = "Membre";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPasswordFile() {
        return passwordFile;
    }

    public void setPasswordFile(String passwordFile) {
        this.passwordFile = passwordFile;
    }

    public String getAssociationName() {
        return associationName;
    }

    public void setAssociationName(String associationName) {
        this.associationName = associationName;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getIncomeCategoryLabel() {
        return incomeCategoryLabel;
    }

    public void setIncomeCategoryLabel(String incomeCategoryLabel) {
        this.incomeCategoryLabel = incomeCategoryLabel;
    }
}
