import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { tasksApi } from '../api/tasks.js';
import { useToast } from './ToastContext.jsx';
import TaskFormSheet from '../components/TaskFormSheet.jsx';
import TaskDetailSheet from '../components/TaskDetailSheet.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const TaskActionsContext = createContext(null);

export function TaskActionsProvider({ children }) {
  const showToast = useToast();
  const [version, setVersion] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const openCreate = useCallback((date) => setSheet({ mode: 'create', date }), []);
  const openEdit = useCallback((task) => setSheet({ mode: 'edit', task }), []);
  const openView = useCallback((task) => setSheet({ mode: 'view', task }), []);
  const requestDelete = useCallback((task) => setPendingDelete(task), []);

  const saveTask = useCallback(
    async (task, payload) => {
      const saved = task ? await tasksApi.update(task._id, payload) : await tasksApi.create(payload);
      showToast(task ? 'Changes saved' : 'Task created');
      refresh();
      return saved;
    },
    [showToast, refresh]
  );

  const deleteTask = useCallback(
    async (task) => {
      try {
        await tasksApi.remove(task._id);
        setSheet((s) => (s?.task?._id === task._id ? null : s));
        showToast('Task deleted');
        refresh();
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
    [showToast, refresh]
  );

  const setStatus = useCallback(
    async (task, status) => {
      try {
        const updated = await tasksApi.update(task._id, { status });
        setSheet((s) => (s?.task?._id === task._id ? { ...s, task: updated } : s));
        refresh();
        return updated;
      } catch (err) {
        showToast(err.message, 'error');
        throw err;
      }
    },
    [showToast, refresh]
  );

  const value = useMemo(
    () => ({ version, refresh, openCreate, openEdit, openView, requestDelete, deleteTask, setStatus }),
    [version, refresh, openCreate, openEdit, openView, requestDelete, deleteTask, setStatus]
  );

  const confirmDelete = async () => {
    const task = pendingDelete;
    setPendingDelete(null);
    await deleteTask(task);
  };

  return (
    <TaskActionsContext.Provider value={value}>
      {children}
      <TaskFormSheet
        open={sheet?.mode === 'create' || sheet?.mode === 'edit'}
        task={sheet?.mode === 'edit' ? sheet.task : null}
        defaultDate={sheet?.date}
        onClose={closeSheet}
        onSave={saveTask}
      />
      <TaskDetailSheet task={sheet?.mode === 'view' ? sheet.task : null} onClose={closeSheet} />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete task?"
        message={pendingDelete ? `“${pendingDelete.title}” will be permanently removed.` : ''}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </TaskActionsContext.Provider>
  );
}

export function useTaskActions() {
  const ctx = useContext(TaskActionsContext);
  if (!ctx) throw new Error('useTaskActions must be used inside <TaskActionsProvider>');
  return ctx;
}
