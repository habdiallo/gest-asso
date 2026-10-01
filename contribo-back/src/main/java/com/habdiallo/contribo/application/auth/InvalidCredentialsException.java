package com.habdiallo.contribo.application.auth;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Les identifiants sont invalides.");
    }
}
