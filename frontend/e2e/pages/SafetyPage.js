import { expect } from '@playwright/test';

class SafetyPage {
  constructor(page) {
    this.page = page;
    
    // Safety main sections
    this.quickCheckInBtn = page.getByRole('button', { name: /i'm safe|check.in/i });
    this.sosSlider = page.locator('[class*="sos-slider"], input[type="range"]');
    this.sosConfirmBtn = page.getByRole('button', { name: /confirm sos|send emergency|send alert/i });
    this.fakeCallBtn = page.getByRole('button', { name: /fake call|simulate call/i });
    
    // Emergency contacts
    this.contactsSection = page.getByRole('heading', { name: /emergency contacts/i }).or(page.getByText(/emergency contacts/i).first());
    this.addContactBtn = page.getByRole('button', { name: /add contact|new contact/i });
    this.contactCard = page.locator('[class*="contact"]').first();
    this.primaryBadge = page.getByText(/primary/i);
    
    // Scheduled check-ins
    this.scheduledSection = page.getByRole('heading', { name: /scheduled check.ins/i }).or(page.getByText(/scheduled check.ins/i).first());
    this.addScheduleBtn = page.getByRole('button', { name: /schedule|new check.in/i });
    this.scheduleCard = page.locator('[class*="schedule"]').first();
    this.intervalDropdown = page.locator('select[name="interval"]');
    
    // Check-in history
    this.historySection = page.getByRole('heading', { name: /check.in history/i }).or(page.getByText(/check.in history/i).first());
    this.historyItem = page.locator('[class*="history-item"], [class*="checkin"]').first();
    
    // Status indicators
    this.lastCheckIn = page.getByText(/last check.in/i);
    this.nextCheckIn = page.getByText(/next check.in/i);
    this.statusIndicator = page.locator('.safety-status').or(page.locator('[class*="status"]'));
    
    // Forms
    this.contactNameInput = page.getByLabel('Name');
    this.contactEmailInput = page.getByLabel('Email');
    this.contactPhoneInput = page.getByLabel('Phone');
    this.saveContactBtn = page.getByRole('button', { name: /save|add|create/i });
    
    // Empty states
    this.noContactsState = page.getByText(/no emergency contacts/i).or(page.getByText(/add your first contact/i));
    this.noScheduleState = page.getByText(/no scheduled check.ins/i);
  }

  async gotoSafety() {
    await this.page.goto('/safety');
  }

  async performQuickCheckIn() {
    await this.quickCheckInBtn.click();
  }

  async triggerSOS() {
    // The SOS range input is visually hidden; drive it via DOM events.
    const slider = this.page.locator('input[type="range"]').first();
    await expect(slider).toBeAttached();
    await slider.evaluate((el) => {
      el.value = '100';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await this.sosConfirmBtn.click();
  }

  async addEmergencyContact(name, email, phone) {
    await this.addContactBtn.click();
    await this.contactNameInput.fill(name);
    await this.contactEmailInput.fill(email);
    if (phone) await this.contactPhoneInput.fill(phone);
    await this.saveContactBtn.click();
  }

  async getContactCount() {
    return this.contactCard.count();
  }

  async getScheduleCount() {
    return this.scheduleCard.count();
  }

  async sendCheckIn() {
    await this.quickCheckInBtn.click();
  }

  async sendCheckInWithLocation(lat, lng) {
    await this.page.evaluate(([lat, lng]) => {
      navigator.geolocation.getCurrentPosition = (success) => {
        success({ coords: { latitude: lat, longitude: lng } });
      };
    }, [lat, lng]);
    await this.quickCheckInBtn.click();
  }

  async triggerSOSOffline() {
    await this.page.route('**/api/safety/sos', (route) => {
      route.abort('failed');
    });
    await this.triggerSOS();
    const errorMsg = this.page.locator('text=Cannot send SOS without internet');
    await expect(errorMsg).toBeVisible();
  }

  async scheduleCheckInInPast() {
    await this.addScheduleBtn.click();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const dateInput = this.page.locator('input[type="datetime-local"]');
    await dateInput.fill(pastDate.toISOString().slice(0, 16));
    await this.saveContactBtn.click();
  }

  async createRecurringScheduleWithInvalidTimes() {
    await this.addScheduleBtn.click();
    const startTime = this.page.locator('input[name="startTime"]');
    const endTime = this.page.locator('input[name="endTime"]');
    await startTime.fill('22:00');
    await endTime.fill('18:00');
    await this.saveContactBtn.click();
  }

  async triggerMissedCheckInEscalation() {
    await this.page.goto('/api/safety/checkin/escalate/test-checkin-id');
  }

  async sendImSafeFollowUp() {
    await this.quickCheckInBtn.click();
  }

  async triggerFakeCall() {
    await this.fakeCallBtn.click();
  }

  async triggerFakeCallAndNavigate() {
    await this.fakeCallBtn.click();
    await this.page.goto('/dashboard');
  }
}

export { SafetyPage };
