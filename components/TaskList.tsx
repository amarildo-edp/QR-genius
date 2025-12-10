import React, { useState } from 'react';
import { Task, Technician, TaskPriority, TaskStatus } from '../types';
import { MapPin, Clock, ExternalLink, Pencil, Save, X, Briefcase, Download, CheckSquare, Square, Send, AlertTriangle, ArrowUpDown, Calendar, Search, CheckCircle, Hash } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  technicians: Technician[];
  activityTypes: string[];
  onUpdateTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, technicians, activityTypes, onUpdateTask }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [osSearchTerm, setOsSearchTerm] = useState('');

  // Conclusion Modal State
  const [concludingTaskId, setConcludingTaskId] = useState<string | null>(null);
  const [conclusionText, setConclusionText] = useState('');

  const getTechName = (id?: string) => {
    return technicians.find(t => t.id === id)?.name || 'Não atribuído';
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      case TaskPriority.CRITICAL: return 'bg-red-100 text-red-700 border-red-200';
      case TaskPriority.LOW: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const priorityWeight = {
    [TaskPriority.CRITICAL]: 4,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.LOW]: 1,
  };

  const getSortedTasks = () => {
    let filtered = tasks;
    
    // Filter by OS Number
    if (osSearchTerm) {
      filtered = tasks.filter(t => 
        t.orderNumber?.toLowerCase().includes(osSearchTerm.toLowerCase()) || 
        t.title.toLowerCase().includes(osSearchTerm.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'priority') {
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        if (weightA !== weightB) {
          return weightB - weightA; // Higher priority first
        }
      }
      // Default to date descending (newest first)
      return b.createdAt - a.createdAt;
    });
  };

  const sortedTasks = getSortedTasks();

  const handleEditClick = (task: Task) => {
    setEditingId(task.id);
    setEditForm({ ...task });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      const originalTask = tasks.find(t => t.id === editingId);
      if (originalTask) {
        const updatedTask = { ...originalTask, ...editForm } as Task;
        onUpdateTask(updatedTask);
      }
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleTaskSelection = (id: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTasks(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedTasks.size === sortedTasks.length && sortedTasks.length > 0) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(sortedTasks.map(t => t.id)));
    }
  };

  const handleBulkDispatchClick = () => {
    if (selectedTasks.size === 0) return;
    setShowDispatchModal(true);
  };

  const executeBulkDispatch = () => {
    setShowDispatchModal(false);

    let delay = 0;
    selectedTasks.forEach((id) => {
      const task = tasks.find(t => t.id === id);
      if (task && task.assignedTo && task.formattedMessage) {
        const tech = technicians.find(t => t.id === task.assignedTo);
        if (tech) {
          // Update Status
          const updatedTask = { ...task, status: TaskStatus.DISPATCHED };
          onUpdateTask(updatedTask);

          // Open WhatsApp
          setTimeout(() => {
            const whatsappUrl = `https://wa.me/${tech.phone}?text=${encodeURIComponent(task.formattedMessage!)}`;
            window.open(whatsappUrl, '_blank');
          }, delay);
          delay += 800; 
        }
      }
    });
    setSelectedTasks(new Set());
  };

  // Conclusion Logic
  const handleOpenConclusion = (task: Task) => {
    setConcludingTaskId(task.id);
    setConclusionText(task.conclusion || '');
  };

  const handleSaveConclusion = () => {
    if (concludingTaskId && conclusionText) {
      const task = tasks.find(t => t.id === concludingTaskId);
      if (task) {
        const updatedTask: Task = {
          ...task,
          status: TaskStatus.COMPLETED,
          conclusion: conclusionText,
          completedAt: Date.now()
        };
        onUpdateTask(updatedTask);
      }
      setConcludingTaskId(null);
      setConclusionText('');
    }
  };

  const getDispatchSummary = () => {
    const summary: Record<string, number> = {};
    let unassignedCount = 0;

    selectedTasks.forEach(id => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            if (task.assignedTo) {
                const techName = getTechName(task.assignedTo);
                summary[techName] = (summary[techName] || 0) + 1;
            } else {
                unassignedCount++;
            }
        }
    });

    return { summary, unassignedCount };
  };

  const handleExportCSV = () => {
    const headers = ['OS', 'Título', 'Atividade', 'Local', 'Prioridade', 'Status', 'Técnico', 'Data Criação', 'Conclusão', 'Data Conclusão'];
    const sanitize = (content: any) => {
      if (content === null || content === undefined) return '';
      return `"${content.toString().replace(/"/g, '""')}"`;
    };

    const rows = sortedTasks.map(task => {
      const techName = technicians.find(t => t.id === task.assignedTo)?.name || 'N/A';
      const date = new Date(task.createdAt).toLocaleString('pt-BR');
      const completedDate = task.completedAt ? new Date(task.completedAt).toLocaleString('pt-BR') : '';
      
      return [
        sanitize(task.orderNumber),
        sanitize(task.title),
        sanitize(task.activity),
        sanitize(task.location),
        sanitize(task.priority),
        sanitize(task.status),
        sanitize(techName),
        sanitize(date),
        sanitize(task.conclusion),
        sanitize(completedDate)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `despachos_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 relative">
        <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">Histórico de Despachos</h2>
                
                {/* Search Bar for OS */}
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Pesquisar Nº Ordem ou Título..."
                      value={osSearchTerm}
                      onChange={(e) => setOsSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    {selectedTasks.size > 0 && (
                      <button
                        onClick={handleBulkDispatchClick}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm animate-pulse whitespace-nowrap"
                      >
                        <Send size={16} /> Despachar ({selectedTasks.size})
                      </button>
                    )}

                    {tasks.length > 0 && (
                        <button 
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm whitespace-nowrap"
                            title="Baixar planilha CSV"
                        >
                            <Download size={16} /> CSV
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center text-sm">
                 <span className="text-slate-500 font-medium mr-2">Ordenar por:</span>
                 <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button 
                            onClick={() => setSortBy('date')}
                            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                sortBy === 'date' 
                                ? 'bg-white text-slate-800 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Calendar size={14} /> Recentes
                        </button>
                        <button 
                            onClick={() => setSortBy('priority')}
                            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                sortBy === 'priority' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <ArrowUpDown size={14} /> Prioridade
                        </button>
                </div>
                
                 <button 
                      onClick={toggleSelectAll}
                      className="ml-auto text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium whitespace-nowrap"
                  >
                      {selectedTasks.size === sortedTasks.length && sortedTasks.length > 0 ? (
                          <><CheckSquare size={16} className="text-indigo-600"/> Todos</>
                      ) : (
                          <><Square size={16} /> Selecionar Todos</>
                      )}
                  </button>
            </div>
        </div>

        {tasks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-slate-300 text-slate-500">
                Nenhuma ordem de serviço criada ainda.
            </div>
        ) : (
            <div className="grid gap-4">
                {sortedTasks.map(task => {
                    const isEditing = editingId === task.id;
                    const isSelected = selectedTasks.has(task.id);
                    const isCompleted = task.status === TaskStatus.COMPLETED;

                    if (isEditing) {
                        return (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-lg border-2 border-indigo-200 transition-all">
                                {/* Edit Mode Form */}
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={editForm.title || ''}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                                className="flex-1 font-bold text-slate-800 border-b border-slate-300 focus:border-indigo-500 outline-none pb-1"
                                                placeholder="Título"
                                            />
                                            <div className="flex gap-2">
                                              <button onClick={handleSaveEdit} className="p-2 text-green-600 bg-green-50 rounded hover:bg-green-100"><Save size={18} /></button>
                                              <button onClick={handleCancelEdit} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50"><X size={18} /></button>
                                            </div>
                                        </div>
                                         <div className="relative">
                                            <Briefcase size={14} className="absolute left-2 top-3 text-slate-400" />
                                            <select 
                                                value={editForm.activity || ''}
                                                onChange={(e) => handleChange('activity', e.target.value)}
                                                className="w-full pl-7 p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                                            >
                                                {activityTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="relative">
                                                <MapPin size={14} className="absolute left-2 top-3 text-slate-400" />
                                                <input 
                                                    type="text"
                                                    value={editForm.location || ''}
                                                    onChange={(e) => handleChange('location', e.target.value)}
                                                    className="w-full pl-7 p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                             <select 
                                                value={editForm.priority}
                                                onChange={(e) => handleChange('priority', e.target.value)}
                                                className="flex-1 p-2 text-sm border border-slate-300 rounded bg-white"
                                            >
                                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div 
                          key={task.id} 
                          className={`bg-white p-4 rounded-lg shadow-sm border transition-all group flex flex-col md:flex-row gap-3 ${isSelected ? 'border-indigo-400 bg-indigo-50/30' : isCompleted ? 'border-green-200 bg-green-50/10' : 'border-slate-200 hover:shadow-md'}`}
                        >
                            <div className="flex items-start gap-3 md:w-full">
                                <div className="pt-1">
                                  <button 
                                    onClick={() => toggleTaskSelection(task.id)}
                                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                                  >
                                    {isSelected ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                                  </button>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                              <span className="bg-slate-800 text-white text-xs font-mono px-2 py-0.5 rounded">
                                                {task.orderNumber}
                                              </span>
                                              <h3 className="font-bold text-slate-800">{task.title}</h3>
                                            </div>
                                            
                                            {task.activity && (
                                              <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1 mt-1">
                                                <Briefcase size={12} /> {task.activity}
                                              </p>
                                            )}
                                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin size={14} /> {task.location}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            
                                            {/* Status Badge */}
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                              task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700 border-green-200' :
                                              task.status === TaskStatus.DISPATCHED ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                              'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}>
                                              {task.status}
                                            </span>

                                            <button 
                                              onClick={() => handleEditClick(task)}
                                              className="p-1 text-slate-400 hover:text-indigo-600 transition-all rounded hover:bg-slate-100"
                                              title="Editar Atividade"
                                            >
                                              <Pencil size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-600 text-sm mb-3 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                                      {task.description}
                                    </p>
                                    
                                    {/* Conclusion Details if Completed */}
                                    {isCompleted && (
                                      <div className="mb-3 p-3 bg-green-50 border border-green-100 rounded-lg text-sm">
                                        <h4 className="font-bold text-green-800 flex items-center gap-1 mb-1">
                                          <CheckCircle size={14} /> Conclusão
                                        </h4>
                                        <p className="text-green-900">{task.conclusion}</p>
                                        <div className="text-xs text-green-700 mt-1">
                                          Finalizado em: {new Date(task.completedAt!).toLocaleString('pt-BR')} por {getTechName(task.assignedTo)}
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex flex-wrap justify-between items-center pt-3 border-t border-slate-100/50 gap-2">
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={14} /> Criado: {new Date(task.createdAt).toLocaleString('pt-BR')}
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                Técnico: {getTechName(task.assignedTo)}
                                            </span>
                                            
                                            {/* Action Buttons */}
                                            {task.assignedTo && !isCompleted && (
                                              <>
                                                <button
                                                  onClick={() => handleOpenConclusion(task)}
                                                  className="text-sm text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded border border-transparent hover:border-green-200 transition-colors flex items-center gap-1"
                                                >
                                                  <CheckCircle size={14} /> Concluir
                                                </button>

                                                <button
                                                  onClick={() => {
                                                    const tech = technicians.find(t => t.id === task.assignedTo);
                                                    if(tech) {
                                                      // Update to dispatched if pending
                                                      if(task.status === TaskStatus.PENDING) {
                                                        onUpdateTask({...task, status: TaskStatus.DISPATCHED});
                                                      }
                                                      const whatsappUrl = `https://wa.me/${tech.phone}?text=${encodeURIComponent(task.formattedMessage!)}`;
                                                      window.open(whatsappUrl, '_blank');
                                                    }
                                                  }}
                                                  className="text-slate-400 hover:text-green-600 p-1 hover:bg-green-50 rounded"
                                                  title="Enviar via WhatsApp"
                                                >
                                                  <Send size={16} />
                                                </button>
                                              </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* Dispatch Confirmation Modal */}
        {showDispatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
              <div className="p-6">
                <div className="flex items-center gap-3 text-amber-600 mb-4">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Confirmar Despacho em Massa</h3>
                </div>
                <p className="text-slate-600 mb-4">
                  Você selecionou <strong className="text-slate-900">{selectedTasks.size} Ordens de Serviço</strong>.
                  <br/>
                  Serão abertas janelas do WhatsApp Web para cada técnico.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4 max-h-48 overflow-y-auto">
                  <ul className="space-y-2 text-sm">
                    {Object.entries(getDispatchSummary().summary).map(([techName, count]) => (
                      <li key={techName} className="flex justify-between items-center text-slate-700">
                        <span>{techName}</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
                <button onClick={() => setShowDispatchModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
                <button onClick={executeBulkDispatch} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"><Send size={16} /> Enviar WhatsApp</button>
              </div>
            </div>
          </div>
        )}

        {/* Conclusion Modal - No changes needed here */}
        {concludingTaskId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-600"/> Concluir Ordem de Serviço
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Descreva o que foi realizado na OS <strong>{tasks.find(t => t.id === concludingTaskId)?.orderNumber}</strong>.
                </p>
                
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none h-32 resize-none text-sm"
                  placeholder="Ex: Trocado disjuntor principal, realizado testes de carga, sistema operando normalmente."
                  value={conclusionText}
                  onChange={(e) => setConclusionText(e.target.value)}
                />
              </div>
              <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  onClick={() => { setConcludingTaskId(null); setConclusionText(''); }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveConclusion}
                  disabled={!conclusionText.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Conclusão
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};