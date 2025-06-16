import { getDatabase } from '../config/database.js';

export async function addDemoTasks() {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    console.log('🎭 Adding demo tasks to database...');
    
    db.serialize(() => {
      // Check if demo tasks already exist
      db.get('SELECT COUNT(*) as count FROM programs', (err, row) => {
        if (err) {
          console.error('❌ Error checking existing programs:', err);
          reject(err);
          return;
        }
        
        if (row && row.count > 0) {
          console.log('✅ Demo tasks already exist, skipping...');
          resolve();
          return;
        }
        
        console.log('📝 Creating demo tasks...');
        
        // Demo tasks with various statuses
        const demoTasks = [
          {
            task_id: 1001,
            work_year: 2024,
            required_quarter: '2024-03-01',
            title: 'רכש מחשבים חדשים',
            description: 'רכש 50 מחשבים נייחים למשרדי החברה',
            requester_name: 'דוד כהן',
            division_name: 'טכנולוגיה',
            department_name: 'מערכות מידע',
            domain_name: 'ציוד מחשוב',
            estimated_amount: 250000,
            currency: 'ILS',
            supplier_list: 'דל, HP, לנובו',
            justification: 'החלפת ציוד ישן ושיפור ביצועים',
            planning_source: 'annual_planning',
            complexity: 2,
            status: 'Open',
            assigned_officer_name: 'שרה לוי',
            team_name: 'צוות מחשוב',
            planning_notes: 'לבדוק תאימות עם תוכנות קיימות',
            officer_notes: 'בתהליך איסוף הצעות מחיר'
          },
          {
            task_id: 1002,
            work_year: 2024,
            required_quarter: '2024-06-01',
            title: 'שירותי ניקיון למשרדים',
            description: 'חוזה שנתי לשירותי ניקיון',
            requester_name: 'רחל אברהם',
            division_name: 'משאבי אנוש',
            department_name: 'תפעול',
            domain_name: 'שירותים',
            estimated_amount: 120000,
            currency: 'ILS',
            supplier_list: 'חברת ניקיון א, חברת ניקיון ב',
            justification: 'שמירה על סביבת עבודה נקייה',
            planning_source: 'annual_planning',
            complexity: 1,
            status: 'Plan',
            assigned_officer_name: 'אבי כהן',
            team_name: 'צוות שירותים',
            planning_notes: 'לוודא כיסוי לכל הקומות',
            officer_notes: 'מחכה לאישור תקציב'
          },
          {
            task_id: 1003,
            work_year: 2024,
            required_quarter: '2024-04-01',
            title: 'פיתוח מערכת CRM',
            description: 'פיתוח מערכת ניהול לקוחות מותאמת',
            requester_name: 'יוסי לוי',
            division_name: 'מכירות',
            department_name: 'שיווק',
            domain_name: 'פיתוח תוכנה',
            estimated_amount: 500000,
            currency: 'ILS',
            supplier_list: 'חברת פיתוח א, חברת פיתוח ב',
            justification: 'שיפור ניהול לקוחות ומכירות',
            planning_source: 'unplanned',
            complexity: 3,
            status: 'In Progress',
            assigned_officer_name: 'מירי דוד',
            team_name: 'צוות טכנולוגי',
            planning_notes: 'פרויקט אסטרטגי חשוב',
            officer_notes: 'בשלב פיתוח ראשוני'
          },
          {
            task_id: 1004,
            work_year: 2024,
            required_quarter: '2024-02-01',
            title: 'ריהוט משרדי חדש',
            description: 'רכש שולחנות וכסאות למשרד החדש',
            requester_name: 'נועה גרין',
            division_name: 'תפעול',
            department_name: 'מתקנים',
            domain_name: 'ריהוט',
            estimated_amount: 80000,
            currency: 'ILS',
            supplier_list: 'איקאה, כתר פלסטיק',
            justification: 'הקמת משרד חדש',
            planning_source: 'carried_over',
            complexity: 1,
            status: 'Complete',
            assigned_officer_name: 'דני רוזן',
            team_name: 'צוות רכש כללי',
            planning_notes: 'לוודא התאמה לעיצוב המשרד',
            officer_notes: 'הושלם בהצלחה, הריהוט הותקן'
          },
          {
            task_id: 1005,
            work_year: 2024,
            required_quarter: '2024-01-01',
            title: 'שדרוג מערכת אבטחה',
            description: 'התקנת מצלמות אבטחה חדשות',
            requester_name: 'אמיר בן דוד',
            division_name: 'אבטחה',
            department_name: 'אבטחה פיזית',
            domain_name: 'מערכות אבטחה',
            estimated_amount: 150000,
            currency: 'ILS',
            supplier_list: 'חברת אבטחה מתקדמת',
            justification: 'שיפור רמת האבטחה במתקן',
            planning_source: 'annual_planning',
            complexity: 2,
            status: 'Done',
            assigned_officer_name: 'תמר כהן',
            team_name: 'צוות ביטחון',
            planning_notes: 'פרויקט קריטי לאבטחה',
            officer_notes: 'הושלם ונמסר לתפעול'
          },
          {
            task_id: 1006,
            work_year: 2024,
            required_quarter: '2024-05-01',
            title: 'רכש רכבי חברה',
            description: 'רכש 5 רכבי חברה חדשים',
            requester_name: 'גיל שמואל',
            division_name: 'תפעול',
            department_name: 'צי רכב',
            domain_name: 'רכבים',
            estimated_amount: 400000,
            currency: 'ILS',
            supplier_list: 'יונדאי, טויוטה, ניסאן',
            justification: 'החלפת רכבים ישנים',
            planning_source: 'annual_planning',
            complexity: 2,
            status: 'Freeze',
            assigned_officer_name: 'רון אלון',
            team_name: 'צוות רכש כללי',
            planning_notes: 'לבדוק אפשרויות ליסינג',
            officer_notes: 'הוקפא עקב חריגה בתקציב'
          },
          {
            task_id: 1007,
            work_year: 2024,
            required_quarter: '2024-07-01',
            title: 'שירותי ייעוץ משפטי',
            description: 'שירותי ייעוץ משפטי שנתיים',
            requester_name: 'עדי רוזנברג',
            division_name: 'משפטי',
            department_name: 'ייעוץ משפטי',
            domain_name: 'שירותים מקצועיים',
            estimated_amount: 200000,
            currency: 'ILS',
            supplier_list: 'משרד עורכי דין א, משרד עורכי דין ב',
            justification: 'ייעוץ משפטי שוטף',
            planning_source: 'unplanned',
            complexity: 2,
            status: 'Cancel',
            assigned_officer_name: 'לילך מור',
            team_name: 'צוות שירותים',
            planning_notes: 'לבדוק חלופות פנימיות',
            officer_notes: 'בוטל - נמצא פתרון פנימי'
          },
          {
            task_id: 1008,
            work_year: 2024,
            required_quarter: '2024-08-01',
            title: 'שדרוג תשתית רשת',
            description: 'שדרוג מתגי רשת ונתבים',
            requester_name: 'אלון טל',
            division_name: 'טכנולוגיה',
            department_name: 'תשתיות',
            domain_name: 'תקשורת',
            estimated_amount: 180000,
            currency: 'ILS',
            supplier_list: 'סיסקו, HP, ג\'וניפר',
            justification: 'שיפור מהירות ויציבות הרשת',
            planning_source: 'annual_planning',
            complexity: 3,
            status: 'In Progress',
            assigned_officer_name: 'יעל ברק',
            team_name: 'צוות טכנולוגי',
            planning_notes: 'לתאם עם צוות IT',
            officer_notes: 'בתהליך התקנה'
          }
        ];
        
        let tasksCreated = 0;
        demoTasks.forEach((task, index) => {
          db.run(
            `INSERT INTO programs 
             (task_id, work_year, required_quarter, title, description, requester_name, 
              division_name, department_name, domain_name, estimated_amount, currency, 
              supplier_list, justification, planning_source, complexity, status, 
              assigned_officer_name, team_name, planning_notes, officer_notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              task.task_id, task.work_year, task.required_quarter, task.title, 
              task.description, task.requester_name, task.division_name, 
              task.department_name, task.domain_name, task.estimated_amount, 
              task.currency, task.supplier_list, task.justification, 
              task.planning_source, task.complexity, task.status, 
              task.assigned_officer_name, task.team_name, task.planning_notes, 
              task.officer_notes
            ],
            function(err) {
              if (err) {
                console.error('❌ Error creating demo task:', task.task_id, err);
                reject(err);
                return;
              }
              
              console.log('✅ Created demo task:', task.task_id, '-', task.title);
              
              tasksCreated++;
              if (tasksCreated === demoTasks.length) {
                console.log('✅ All demo tasks created successfully!');
                console.log(`📊 Created ${tasksCreated} demo tasks with various statuses`);
                resolve();
              }
            }
          );
        });
      });
    });
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addDemoTasks()
    .then(() => {
      console.log('✅ Demo tasks added successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to add demo tasks:', error);
      process.exit(1);
    });
}