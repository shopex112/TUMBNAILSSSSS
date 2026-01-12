
const STORAGE_KEY = 'yt_pro_studio_credits';
const STARTING_CREDITS = 10;

const COSTS = {
  generate: 5,
  title: 1,
  analyze: 2,
  autoDesign: 3,
};

class CreditService {
  constructor() {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      localStorage.setItem(STORAGE_KEY, STARTING_CREDITS.toString());
    }
  }

  private dispatchUpdate() {
    window.dispatchEvent(new CustomEvent('credit-update'));
  }

  public getCreditBalance(): number {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  }

  public getCost(action: keyof typeof COSTS): number {
    return COSTS[action];
  }

  public deductCredits(amount: number): void {
    const currentBalance = this.getCreditBalance();
    if (currentBalance < amount) {
      throw new Error("אין לך מספיק קרדיטים. לחץ כאן לרכישה.");
    }
    localStorage.setItem(STORAGE_KEY, (currentBalance - amount).toString());
    this.dispatchUpdate();
  }

  public addCredits(amount: number): void {
    const currentBalance = this.getCreditBalance();
    localStorage.setItem(STORAGE_KEY, (currentBalance + amount).toString());
    this.dispatchUpdate();
    this.showToast(`${amount} קרדיטים נוספו בהצלחה!`, 'success', '💎');
  }
  
  private showToast(message: string, type: 'success' | 'info', icon: string) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type, icon } }));
  }
}

export const creditService = new CreditService();
