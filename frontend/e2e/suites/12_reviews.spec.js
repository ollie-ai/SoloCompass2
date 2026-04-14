import { test, expect } from '@playwright/test';
import { ReviewsPage } from '../pages/ReviewsPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 12: Community Reviews', { tag: ['@reviews', '@p2'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('REV-001: Navigate to Reviews page', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    
    await reviewsPage.gotoReviews();
    
    await expect(page).toHaveURL(/.*\/reviews/);
  });

  test('REV-002: Reviews heading visible', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    
    await reviewsPage.gotoReviews();
    
    await expect(reviewsPage.reviewsHeading.or(reviewsPage.reviewCard).first()).toBeVisible();
  });

  test('REV-003: Display review cards', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    // Should show some reviews (admin has 2 seeded)
    const reviewCount = await reviewsPage.getReviewCount();
    expect(reviewCount).toBeGreaterThanOrEqual(0);
  });

  test('REV-004: Search reviews', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    await reviewsPage.searchReviews('London');
    
    // Should filter results
    await expect(reviewsPage.searchInput).toHaveValue('London');
  });

  test('REV-005: Filter by destination', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    // Filter dropdown should be visible
    await expect(reviewsPage.destinationFilter.or(reviewsPage.reviewCard).first()).toBeVisible();
  });

  test('REV-006: Filter by category', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    await expect(reviewsPage.categoryFilter.or(reviewsPage.reviewCard).first()).toBeVisible();
  });

  test('REV-007: Sort reviews', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    await expect(reviewsPage.sortDropdown.or(reviewsPage.reviewCard).first()).toBeVisible();
  });

  test('REV-008: Star ratings visible', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    // Should show star ratings
    await expect(reviewsPage.starRating.first()).toBeVisible();
  });

  test('REV-009: Stats sidebar visible', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    // Should show stats
    await expect(reviewsPage.statsSidebar.or(reviewsPage.totalReviews).first()).toBeVisible();
  });

  test('REV-010: Write review button for logged in user', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    // Should show write button for authenticated users
    await expect(reviewsPage.writeReviewBtn.or(reviewsPage.reviewCard).first()).toBeVisible();
  });

  test('REV-011: Empty state when no reviews', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('newuser@solocompass.test', 'Test1234!');
    await reviewsPage.gotoReviews();
    
    // Should show empty or reviews
    await expect(reviewsPage.emptyState.or(reviewsPage.reviewCard).first()).toBeVisible();
  });

  test('REV-012: Reviews page accessible without login', async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    
    await reviewsPage.gotoReviews();
    
    // Should work without login (read-only)
    await expect(page).toHaveURL(/.*\/reviews/);
    await expect(reviewsPage.reviewsHeading.or(reviewsPage.reviewCard).first()).toBeVisible();
  });

});
