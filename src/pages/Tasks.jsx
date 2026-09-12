export default function Tasks({ ctx, user }) {
  const { data } = ctx;
  const tasks = data?.tasks || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Tasks</h1>
        <p className="text-[var(--text-muted)] mt-1">{tasks.length} tasks found</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="glass rounded-2xl p-5">
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{task.title}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">{task.description || 'No description'}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                task.status === 'completed' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-amber-500/10 text-amber-500'
              }`}>
                {task.status}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{task.priority}</span>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
            No tasks found. Create your first task to get started!
          </div>
        )}
      </div>
    </div>
  );
}