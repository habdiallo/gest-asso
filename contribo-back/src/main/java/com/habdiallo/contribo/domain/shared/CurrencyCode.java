package com.habdiallo.contribo.domain.shared;

/** Currency supported by the association domain. */
public enum CurrencyCode {
    GNF;

    public static CurrencyCode fromValue(String value) {
        for (CurrencyCode currency : values()) {
            if (currency.name().equals(value)) {
                return currency;
            }
        }
        throw new IllegalArgumentException("Unexpected currency '" + value + "'");
    }

    public String getValue() {
        return name();
    }
}
