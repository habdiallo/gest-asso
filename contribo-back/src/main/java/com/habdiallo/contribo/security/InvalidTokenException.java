package com.habdiallo.contribo.security;

public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(Throwable cause) {
        super("Le jeton d'accès est invalide.", cause);
    }
}
