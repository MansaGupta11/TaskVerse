export const isOverdue = (task) =>
  task.dueDate &&
  new Date(task.dueDate) < new Date() &&
  task.status !== 'DONE'
