
import { GamificationState, Achievement, DailyChallenge, GamificationAction } from '../types';

const LEVELS = [
  { name: "Newcomer", points: 0 },
  { name: "Creator", points: 100 },
  { name: "Designer", points: 250 },
  { name: "Pro Designer", points: 500 },
  { name: "Thumbnail Artist", points: 1000 },
  { name: "Viral Virtuoso", points: 2000 },
  { name: "Clickbait King", points: 5000 },
  { name: "Thumbnail God", points: 10000 },
];

const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_blood', name: 'דם ראשון', description: 'צור את התמונה הראשונה שלך', points: 50, icon: '🩸' },
  { id: 'speed_demon', name: 'שד המהירות', description: 'צור תמונה בפחות מ-2 דקות', points: 100, icon: '⚡' },
  { id: 'viral_master', name: 'אמן ויראלי', description: 'השג ציון ויראליות של 99', points: 500, icon: '🏆' },
  { id: 'ten_thumbnails', name: 'יוצר סדרתי', description: 'צור 10 תמונות', points: 150, icon: '🔟' },
  { id: 'ai_collaborator', name: 'שותף AI', description: 'השתמש בשדרוג פרומפט', points: 25, icon: '✨' },
  { id: 'personal_touch', name: 'טאצ\' אישי', description: 'השתמש בדמות אישית', points: 75, icon: '👤' },
  { id: 'perfectionist', name: 'פרפקציוניסט', description: 'צור 5 תמונות עם ציון 90+', points: 250, icon: '🎯' },
];

const CHALLENGE_POOL: Omit<DailyChallenge, 'current' | 'isComplete' | 'id' | 'date'>[] = [
  { name: "Neon Master", description: "צור תמונה בסגנון ניאון", points: 150, goal: 1, action: 'USED_STYLE', meta: { style: 'cyberpunk' } },
  { name: "Speed Run", description: "צור 3 תמונות", points: 200, goal: 3, action: 'THUMBNAIL_CREATED' },
  { name: "Personalization", description: "השתמש בדמות אישית", points: 100, goal: 1, action: 'USED_PERSONAL_PHOTO' },
  { name: "Cinematic Touch", description: "צור 2 תמונות בסגנון קולנועי", points: 150, goal: 2, action: 'USED_STYLE', meta: { style: 'cinematic' } },
  { name: "AI Enhancer", description: "שדרג 3 פרומפטים", points: 100, goal: 3, action: 'PROMPT_EXPANDED' },
  { name: "High Scorer", description: "השג ציון ויראליות מעל 90", points: 250, goal: 1, action: 'ANALYSIS_HIGH_SCORE' },
];

class GamificationService {
  private state: GamificationState;
  private readonly STORAGE_KEY = 'gamification_state';

  constructor() {
    this.state = this.loadState();
    this.checkDailyReset();
  }

  private loadState(): GamificationState {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
    return this.getInitialState();
  }
  
  private getInitialState(): GamificationState {
     return {
        points: 0,
        level: 1,
        levelName: LEVELS[0].name,
        pointsForNextLevel: LEVELS[1].points,
        achievements: {},
        dailyStreak: { count: 0, lastActivityDate: null },
        stats: { thumbnailsCreated: 0, viralScores: 0, fastCreations: 0 },
        challenges: { date: new Date().toISOString().split('T')[0], list: [] },
     };
  }

  private saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    window.dispatchEvent(new CustomEvent('gamification-update'));
  }

  private checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.challenges.date !== today) {
        this.state.challenges = { date: today, list: this.generateDailyChallenges() };
    }
    this.saveState();
  }

  private generateDailyChallenges(): DailyChallenge[] {
    const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((challenge, i) => ({
      ...challenge,
      id: `${new Date().toISOString().split('T')[0]}-${i}`,
      current: 0,
      isComplete: false,
    }));
  }

  private addPoints(amount: number, reason: string) {
    this.state.points += amount;
    this.showToast(`+${amount} XP - ${reason}`, 'success', '⭐');
    this.checkLevelUp();
  }
  
  private checkLevelUp() {
    const nextLevelInfo = LEVELS[this.state.level];
    if (nextLevelInfo && this.state.points >= nextLevelInfo.points) {
      this.state.level++;
      this.state.levelName = nextLevelInfo.name;
      this.state.pointsForNextLevel = LEVELS[this.state.level]?.points || this.state.points;
      
      this.showToast(`עלית רמה! הגעת ל-${this.state.levelName}`, 'success', '🏆');
    }
  }

  private unlockAchievement(id: string) {
    if (!this.state.achievements[id]) {
      const achievement = ALL_ACHIEVEMENTS.find(a => a.id === id);
      if (achievement) {
        this.state.achievements[id] = true;
        this.addPoints(achievement.points, `הישג: ${achievement.name}`);
        this.showToast(`הישג נפתח: ${achievement.name}!`, 'success', achievement.icon);
      }
    }
  }

  public triggerAction(action: GamificationAction, data: any = {}) {
    this.state.challenges.list.forEach(challenge => {
      if (!challenge.isComplete && challenge.action === action) {
        challenge.current++;
        if (challenge.current >= challenge.goal) {
          challenge.isComplete = true;
          this.addPoints(challenge.points, `אתגר: ${challenge.name}`);
        }
      }
    });

    switch(action) {
      case 'THUMBNAIL_CREATED':
        this.addPoints(10, "תמונה נוצרה");
        this.state.stats.thumbnailsCreated++;
        if (this.state.stats.thumbnailsCreated === 1) this.unlockAchievement('first_blood');
        break;
      case 'PROMPT_EXPANDED':
        this.addPoints(5, "שדרוג פרומפט");
        break;
    }
    this.saveState();
  }

  public getState(): GamificationState {
    const fullAchievements = ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: !!this.state.achievements[a.id] }));
    return { ...this.state, fullAchievements } as any;
  }

  private showToast(message: string, type: 'success' | 'info', icon: string) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type, icon } }));
  }
}

export const gamificationService = new GamificationService();
