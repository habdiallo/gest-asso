package com.habdiallo.contribo.application.access;

public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException() {
        super("Vous n'êtes pas autorisé à effectuer cette action.");
    }
}
