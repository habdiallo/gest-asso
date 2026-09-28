package com.habdiallo.contribo.api.rest;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.habdiallo.contribo.api.generated.CatgoriesDeRevenuApi;
import com.habdiallo.contribo.api.generated.model.IncomeCategory;
import com.habdiallo.contribo.api.generated.model.IncomeCategoryRequest;
import com.habdiallo.contribo.application.access.CurrentUserId;
import com.habdiallo.contribo.application.categories.IncomeCategoryService;

@RestController
public class IncomeCategoryController implements CatgoriesDeRevenuApi {

    private final IncomeCategoryService categoryService;

    public IncomeCategoryController(IncomeCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Override
    public ResponseEntity<IncomeCategory> createIncomeCategory(IncomeCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.create(CurrentUserId.get(), request));
    }

    @Override
    public ResponseEntity<IncomeCategory> getIncomeCategory(UUID incomeCategoryId) {
        return ResponseEntity.ok(categoryService.get(CurrentUserId.get(), incomeCategoryId));
    }

    @Override
    public ResponseEntity<List<IncomeCategory>> listIncomeCategories() {
        return ResponseEntity.ok(categoryService.list(CurrentUserId.get()));
    }

    @Override
    public ResponseEntity<IncomeCategory> updateIncomeCategory(
            UUID incomeCategoryId, IncomeCategoryRequest request) {
        return ResponseEntity.ok(
                categoryService.update(CurrentUserId.get(), incomeCategoryId, request));
    }
}
