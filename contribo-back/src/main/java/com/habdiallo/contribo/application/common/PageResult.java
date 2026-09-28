package com.habdiallo.contribo.application.common;

import java.util.List;

public record PageResult<T>(List<T> items, int page, int size, long totalElements) {

    public int totalPages() {
        return totalElements == 0 ? 0 : (int) ((totalElements + size - 1) / size);
    }
}
