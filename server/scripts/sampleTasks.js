import Task from '../src/models/Task.js';

function currentWeekMonday() {
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function at(monday, dayOffset, hours, minutes = 0) {
  const date = new Date(monday);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function buildSampleTasks() {
  const m = currentWeekMonday();
  const task = (title, day, h, min, extra = {}) => ({
    title,
    dueDate: at(m, day, h, min),
    ...extra,
  });

  return [
    task('Prepare sprint demo', -6, 10, 0, { priority: 'High', status: 'Completed' }),
    task('Pay electricity bill', -4, 18, 0, { priority: 'Medium', status: 'Completed' }),
    task('Read "Atomic Habits" ch. 3', -2, 21, 0, { priority: 'Low' }),

    task('Finishing Wireframe', 0, 10, 0, {
      priority: 'High',
      description: 'Wireframes for the onboarding and home screens',
      endDate: at(m, 0, 12, 0),
    }),
    task('Meeting with team', 0, 15, 30, { priority: 'Medium', endDate: at(m, 0, 16, 30) }),
    task('Buy a cat food', 1, 9, 0, { priority: 'Low', status: 'Completed' }),
    task('Finishing daily commission', 1, 17, 0, { status: 'Completed' }),
    task('Doing Homework', 2, 19, 0, { priority: 'Medium', description: 'Maths exercises 4.1 – 4.6' }),
    task('Gym session', 3, 7, 0, { priority: 'Low' }),
    task('Review pull requests', 4, 11, 0, { priority: 'High' }),
    task('Plan weekend trip', 5, 12, 0, { description: 'Book the cabin and check the weather' }),

    task('Dentist appointment', 8, 16, 0, { priority: 'Medium' }),
    task('Quarterly report draft', 10, 10, 0, { priority: 'High' }),
  ];
}

export async function seedIfEmpty() {
  if ((await Task.estimatedDocumentCount()) > 0) return 0;
  const docs = await Task.insertMany(buildSampleTasks());
  return docs.length;
}
