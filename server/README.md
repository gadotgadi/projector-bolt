# Procurement Management System - Server

מערכת ניהול רכש - צד שרת

## התקנה והפעלה

### דרישות מערכת
- Node.js 16+ 
- npm או yarn

### התקנה
```bash
# התקנת תלויות
npm install

# יצירת קובץ הגדרות סביבה
cp .env.example .env

# עריכת קובץ ההגדרות לפי הצורך
nano .env

# אתחול מסד הנתונים
npm run init-db

# הזנת נתונים ראשוניים
npm run seed-db
```

### הפעלה
```bash
# הפעלה בסביבת פיתוח
npm run dev

# הפעלה בסביבת ייצור
npm start
```

## מבנה הפרויקט

```
server/
├── src/
│   ├── config/          # הגדרות מסד נתונים וקונפיגורציה
│   ├── middleware/      # middleware לאימות והרשאות
│   ├── routes/          # נתיבי API
│   ├── scripts/         # סקריפטים לאתחול ותחזוקה
│   └── server.js        # קובץ השרת הראשי
├── data/               # קבצי מסד נתונים
├── uploads/            # קבצים שהועלו
├── .env.example        # דוגמת קובץ הגדרות
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - התחברות למערכת
- `GET /api/auth/me` - קבלת פרטי המשתמש הנוכחי
- `POST /api/auth/change-password` - שינוי סיסמה

### Programs (משימות)
- `GET /api/programs` - קבלת רשימת משימות
- `GET /api/programs/:id` - קבלת משימה ספציפית
- `POST /api/programs` - יצירת משימה חדשה
- `PUT /api/programs/:id` - עדכון משימה
- `PUT /api/programs/:id/stations` - עדכון תחנות משימה

### Engagement Types (סוגי התקשרויות)
- `GET /api/engagement-types` - קבלת סוגי התקשרויות
- `POST /api/engagement-types` - יצירת סוג התקשרות חדש
- `PUT /api/engagement-types/:id/processes` - עדכון תהליכי סוג התקשרות
- `DELETE /api/engagement-types/:id` - מחיקת סוג התקשרות

### Activity Pool (פעילויות)
- `GET /api/activity-pool` - קבלת רשימת פעילויות
- `POST /api/activity-pool` - יצירת פעילות חדשה
- `PUT /api/activity-pool/:id` - עדכון פעילות
- `DELETE /api/activity-pool/:id` - מחיקת פעילות

### Workers (עובדים)
- `GET /api/workers` - קבלת רשימת עובדים
- `POST /api/workers` - יצירת עובד חדש
- `PUT /api/workers/:id` - עדכון עובד
- `DELETE /api/workers/:id` - מחיקת עובד

### System (הגדרות מערכת)
- `GET /api/system/divisions` - אגפים
- `GET /api/system/departments` - מחלקות
- `GET /api/system/procurement-teams` - צוותי רכש
- `GET /api/system/domains` - תחומי רכש

## אבטחה

המערכת כוללת:
- אימות JWT
- הצפנת סיסמאות עם bcrypt
- הגבלת קצב בקשות (Rate limiting)
- CORS מוגדר
- Helmet לאבטחת headers
- ולידציה של נתונים נכנסים

## משתמשים ברירת מחדל

לאחר הרצת `npm run seed-db`:
- **מנהל מערכת**: 9999 / 123456
- **מנהל רכש**: 1001 / 123456

## הגדרות סביבה

עריכת קובץ `.env`:
```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/procurement.db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:8080
```

## פיתוח

```bash
# הפעלה עם nodemon לפיתוח
npm run dev

# הרצת בדיקות
npm test

# אתחול מסד נתונים מחדש
npm run init-db && npm run seed-db
```

## פריסה לייצור

1. הגדרת משתני סביבה מתאימים
2. שינוי `NODE_ENV=production`
3. הגדרת `JWT_SECRET` חזק
4. הגדרת `ALLOWED_ORIGINS` לדומיין הייצור
5. הפעלה עם `npm start`

## תמיכה

לשאלות ותמיכה טכנית, פנה לצוות הפיתוח.