export class GeneratorHelper {
  /**
   * Generates a 6-digit timestamp suffix for entity uniqueness.
   */
  static getTimeSuffix(): string {
    return Date.now().toString().slice(-6);
  }

  /**
   * Generates a random alphanumeric string of a given length.
   */
  static getRandomString(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generates a unique folder name for safe parallel test runs.
   */
  static getUniqueFolderName(prefix = 'QA_Folder'): string {
    return `${prefix}_${this.getTimeSuffix()}_${this.getRandomString(4)}`;
  }

  /**
   * Generates a unique file name for safe parallel test runs.
   */
  static getUniqueFileName(prefix = 'QA_File', ext = 'pdf'): string {
    return `${prefix}_${this.getTimeSuffix()}_${this.getRandomString(4)}.${ext}`;
  }

  /**
   * Generates a unique test user email.
   */
  static getUniqueEmail(prefix = 'qa.user'): string {
    return `${prefix}_${this.getTimeSuffix()}_${this.getRandomString(4)}@test.vdr.com`;
  }
}
