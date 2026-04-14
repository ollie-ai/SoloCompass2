export class SettingsPage {
  constructor(page) {
    this.page = page;
    
    // Tab navigation
    this.profileTab = page.getByRole('tab', { name: /profile/i }).or(page.getByRole('button', { name: /profile/i }));
    this.securityTab = page.getByRole('tab', { name: /security/i }).or(page.getByRole('button', { name: /security/i }));
    this.notificationsTab = page.getByRole('tab', { name: /notifications/i }).or(page.getByRole('button', { name: /notifications/i }));
    this.billingTab = page.getByRole('tab', { name: /billing/i }).or(page.getByRole('button', { name: /billing/i }));
    
    // Profile fields
    this.displayNameInput = page.getByLabel('Full Name').or(page.locator('input[name="name"]'));
    this.emailInput = page.locator('input[type="email"]');
    this.phoneInput = page.getByLabel('Phone Number').or(page.locator('input[name="phone"]'));
    this.homeCityInput = page.getByLabel('Home City').or(page.locator('input[name="homeCity"]'));
    this.bioInput = page.locator('textarea[name="bio"]');
    this.saveProfileBtn = page.getByRole('button', { name: /save changes/i }).or(page.getByRole('button', { name: /save profile/i }));
    
    // Sticky unsaved changes bar
    this.stickySaveBtn = page.locator('.fixed.bottom-0').getByRole('button', { name: /save changes/i });
    this.unsavedBar = page.getByText(/unsaved changes/i);
    
    // Security fields
    this.currentPasswordInput = page.getByLabel('Current Password').or(page.locator('input[name="currentPassword"]'));
    this.newPasswordInput = page.getByLabel('New Password').or(page.locator('input[name="newPassword"]'));
    this.confirmPasswordInput = page.getByLabel('Confirm Password').or(page.locator('input[name="confirmPassword"]'));
    this.changePasswordBtn = page.getByRole('button', { name: /change.*password|update.*password/i });
    this.logoutAllBtn = page.getByRole('button', { name: /logout.*all|signout.*all/i });
    
    // Notification toggles
    this.emailToggle = page.locator('label:has-text("Email")');
    this.pushToggle = page.locator('label:has-text("Push")');
    this.smsToggle = page.locator('label:has-text("SMS")');
    this.checkinToggle = page.locator('label:has-text("Check-in")');
    this.buddyToggle = page.locator('label:has-text("Buddy")');
    this.saveNotifBtn = page.getByRole('button', { name: /save.*preferences|update.*settings/i });
    
    // Travel DNA
    this.travelStyleCard = page.locator('text=Travel DNA');
    this.retakeQuizBtn = page.getByRole('button', { name: /retake.*quiz/i });
    
    // Buddy profile preview
    this.buddyProfilePreview = page.locator('text=Buddy Profile');
    this.editPublicBioBtn = page.getByRole('link', { name: /edit.*bio/i });
    
    // Toasts
    this.successToast = page.getByText(/saved successfully|updated successfully|success/i);
    this.errorToast = page.getByText(/error|failed|incorrect/i);
    
    // Account section
    this.cancelAccountBtn = page.getByRole('button', { name: /cancel.*account|delete.*account/i });
  }

  async goto(tab = 'profile') {
    await this.page.goto(`/settings?tab=${tab}`);
  }

  async updateProfileName(newName) {
    await this.displayNameInput.fill(newName);
  }

  async saveChanges() {
    if (await this.stickySaveBtn.isVisible()) {
      await this.stickySaveBtn.click();
    } else {
      await this.saveProfileBtn.click();
    }
  }

  async changePassword(currentPassword, newPassword) {
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.changePasswordBtn.click();
  }

  async toggleNotification(toggleName) {
    const toggle = this.page.locator(`label:has-text("${toggleName}")`);
    await toggle.click();
  }

  async clickRetakeQuiz() {
    await this.retakeQuizBtn.click();
  }

  async changeEmailToExisting() {
    await this.emailInput.fill('admin@solocompass.test');
    await this.saveProfileBtn.click();
    const errorMsg = this.page.locator('text=Email already in use');
    await expect(errorMsg).toBeVisible();
  }

  async clearNameAndSave() {
    await this.displayNameInput.fill('');
    await this.saveProfileBtn.click();
    const errorMsg = this.page.locator('text=Name is required');
    await expect(errorMsg).toBeVisible();
  }

  async exportData() {
    const exportBtn = this.page.getByRole('button', { name: /export.*data|download/i });
    await exportBtn.click();
  }

  async cancelAccountDeletion() {
    const deleteBtn = this.page.getByRole('button', { name: /delete.*account/i });
    await deleteBtn.click();
    const cancelBtn = this.page.getByRole('button', { name: /cancel|keep.*account/i });
    await cancelBtn.click();
  }

  async enableSMSWithoutPhone() {
    await this.smsToggle.click();
    const warningMsg = this.page.locator('text=Add phone number');
    await expect(warningMsg.or(this.page.locator('text=phone number required')).first()).toBeVisible();
  }
}
