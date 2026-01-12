
# YouTube Pro Studio - Blueprint & Documentation

זהו מדריך שכפול (Replication Guide) עבור אפליקציית ה-YouTube Pro Studio. האפליקציה תוכננה כ-Template ליצירת כלי AI מתקדמים המשלבים יצירה ויזואלית, ניתוח נתונים ועריכה גרפית, וכעת כוללת מערכת Backend מלאה מבוססת Supabase.

## 🚀 קונספט מרכזי: The Viral Feedback Loop
הייחודיות של המבנה הזה היא הסנכרון בין שני מודלי AI:
1. **מודל יוצר (Gemini 2.5 Flash Image):** מייצר תמונות על בסיס הנחיות טכניות.
2. **מודל מנתח (Gemini 3 Flash Preview):** מנתח את התוצאה ומייצר "הנחיה משופרת" (Optimized Prompt) שנועדה לתקן את חסרונות התמונה המקורית כדי להגיע לציון ויראליות גבוה מ-90%.

---

## 🛠 טכנולוגיות ליבה
*   **Frontend:** React (hooks, state management).
*   **Backend & Database:** Supabase (אימות משתמשים, מסד נתונים Postgres).
*   **Styling:** Tailwind CSS + Glassmorphism UI.
*   **Graphics Engine:** Fabric.js - לניהול שכבות, טקסטים ואלמנטים גרפיים על גבי הקנבס.
*   **AI Models:**
    *   `gemini-2.5-flash-image`: ליצירת תמונות מהירה וחסככונית.
    *   `gemini-3-flash-preview`: לניתוח ויראליות, הצעת סגנונות טקסט וכותרות.

---

## 📂 מבנה קבצים (Architecture)
*   **`schema.sql`**: קובץ ההגדרה של מסד הנתונים. מכיל את כל הפקודות ליצירת טבלת הפרויקטים והגדרות האבטחה.
*   **`services/supabaseClient.ts`**: מאתחל את החיבור ל-Supabase. **כאן יש להזין את מפתחות ה-API של הפרויקט שלך**.
*   **`services/authService.ts`**: מנהל את כל הלוגיקה של אימות משתמשים (הרשמה, כניסה, יציאה) מול Supabase.
*   **`services/projectService.ts`**: מנהל את פעולות ה-CRUD (יצירה, קריאה, עדכון, מחיקה) עבור פרויקטים של משתמשים במסד הנתונים.
*   **`services/geminiService.ts`**: המוח של ה-AI. כולל את כל הפניות ל-Gemini API, הנדסת הפרומפטים (Prompt Engineering) ומנגנון ה-Retry.
*   **`components/CanvasEditor.tsx`**: עורך ה-Canvas המבוסס על Fabric.js.
*   **`components/ProjectGalleryModal.tsx`**: ממשק המאפשר למשתמשים לטעון ולנהל את הפרויקטים השמורים שלהם.

---

## 🔑 התקנה וחיבור ל-SUPABASE
1.  **הקמת פרויקט ב-Supabase:**
    *   צור חשבון חינמי ב-[supabase.com](https://supabase.com).
    *   צור פרויקט חדש.
2.  **הגדרת מפתחות API:**
    *   בפרויקט ה-Supabase שלך, נווט אל `Project Settings` -> `API`.
    *   העתק את ה-**Project URL**.
    *   תחת "Project API keys", העתק את ה-**Publishable key**. זהו המפתח הציבורי שמתחיל בדרך כלל ב-`sb_publishable_...`.
    *   (לפרויקטים ישנים יותר, ייתכן שתצטרך למצוא את מפתח ה-`anon key` תחת הטאב "Legacy". הוא יתחיל באותיות `ey...`).
    *   הדבק את ה-URL ואת המפתח במקומות המתאימים בקובץ `services/supabaseClient.ts`.
3.  **הגדרת מפתח Gemini:**
    *   הגדר את מפתח ה-API של Gemini כ-Environment Variable. באפליקציה זו, הוא נקרא ישירות דרך `process.env.API_KEY`.
4.  **הקמת טבלת הפרויקטים (שלב חובה):**
    *   בפרויקט ה-Supabase שלך, נווט אל `SQL Editor`.
    *   לחץ על `+ New query`.
    *   פתח את הקובץ **`schema.sql`** שנמצא בפרויקט האפליקציה.
    *   **העתק את *כל* התוכן מהקובץ**, הדבק אותו בעורך ה-SQL של Supabase ולחץ על `RUN`.
    *   פעולה זו תיצור באופן מאובטח את הטבלה הנדרשת לשמירת הפרויקטים.

5.  **הפעלת האפליקציה:** לאחר הגדרת המפתחות והטבלה, האפליקציה מוכנה לשימוש. משתמשים חדשים יוכלו להירשם (ויצטרכו לאשר את המייל שלהם), והמידע שלהם יישמר ב-Supabase.

---
**YouTube Pro Studio - Created with Gemini 3 Pro Engineering.**