package com.habdiallo.contribo.domain.campaign;

import java.util.List;

import com.habdiallo.contribo.domain.common.PageMetadata;

public record DuePage(List<Due> items, PageMetadata page) {
}
