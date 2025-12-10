import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, Technician } from '../types';
import { generateDispatchMessage } from '../services/geminiService';
import { Save, MapPin, AlertTriangle, FileText, Briefcase, Hash } from 'lucide-react';

interface TaskCreatorProps {
  technicians: Technician[];
  activityTypes: string[];
  onTaskCreate: (task: Task) => void;
}

export const TaskCreator: React.FC<TaskCreatorProps> = ({ technicians, activityTypes, onTaskCreate }) => {
  const [title, setTitle] = useState('');
  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assignedTechId, setAssignedTechId] = useState<string>('');
  
  const [previewMessage, setPreviewMessage] = useState('');

  // Set default activity when activityTypes changes or on init
  useEffect(() => {
    if (activityTypes.length > 0 && !activity) {
      setActivity(activityTypes[0]);
    }
  }, [activityTypes, activity]);

  const generateOrderNumber = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `OS-${datePart}-${randomPart}`;
  };

  const handleGeneratePreview = async () => {
    const tech = technicians.find(t => t.id === assignedTechId);
    if (!tech) {
      alert("Selecione um técnico primeiro.");
      return;
    }

    // Use a placeholder OS number for preview if one isn't saved yet
    const tempOS = generateOrderNumber(); 
    
    const msg = await generateDispatchMessage(
      { title: `${tempOS} - ${title}`, activity, description, location, priority },
      tech
    );
    setPreviewMessage(msg);
  };

  const handleSaveTaskOnly = () => {
    if (!title || !activity || !assignedTechId || !previewMessage) return;

    const orderNumber = generateOrderNumber();
    
    const newTask: Task = {
      id: Date.now().toString(),
      orderNumber,
      title,
      activity,
      description,
      location,
      priority,
      status: TaskStatus.PENDING, // Saved but not sent
      assignedTo: assignedTechId,
      formattedMessage: previewMessage.replace(/OS-\d{8}-\d{4}/, orderNumber), // Ensure message has correct OS
      createdAt: Date.now()
    };

    onTaskCreate(newTask);
    
    // Reset Form
    setTitle('');
    setActivity(activityTypes[0] || '');
    setDescription('');
    setLocation('');
    setPreviewMessage('');
    setAssignedTechId('');
    
    // Optional feedback
    alert(`Ordem de Serviço ${orderNumber} criada com sucesso! Vá para o Histórico para despachar.`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Hash className="text-blue-600" /> Nova Ordem de Serviço
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título / Assunto</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: Falha na Subestação ou Instalação Residencial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Atividade a Executar</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 text-slate-400" size={16} />
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-3 text-slate-400" size={16} />
                <select
                  className="w-full border border-slate-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                >
                  {Object.values(TaskPriority).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Rua, Bairro..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Detalhada</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
              placeholder="Detalhes técnicos, ferramentas necessárias..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Atribuir ao Técnico</label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              value={assignedTechId}
              onChange={(e) => setAssignedTechId(e.target.value)}
            >
              <option value="">Selecione um técnico...</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id} disabled={!tech.available}>
                  {tech.name} {!tech.available ? '(Indisponível)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleGeneratePreview}
            disabled={!title || !activity || !assignedTechId}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              !title || !activity || !assignedTechId 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
            }`}
          >
            1. Gerar Mensagem
          </button>
        </div>

        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex flex-col h-full">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText size={16} /> Pré-visualização da Mensagem
          </h3>
          
          <div className="flex-1 bg-white border border-slate-200 rounded-md p-4 font-mono text-sm text-slate-700 whitespace-pre-wrap overflow-y-auto shadow-inner">
            {previewMessage ? previewMessage : (
              <span className="text-slate-400 italic">
                A pré-visualização da mensagem formatada aparecerá aqui. <br/>
                O número da OS será gerado automaticamente ao salvar.
              </span>
            )}
          </div>

          <button
            onClick={handleSaveTaskOnly}
            disabled={!previewMessage}
            className={`mt-4 w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              !previewMessage
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200'
            }`}
          >
            <Save size={18} /> 2. Salvar Ordem de Serviço
          </button>
          <p className="text-xs text-center text-slate-500 mt-2">
            *O despacho para o WhatsApp é feito na aba "Histórico"
          </p>
        </div>
      </div>
    </div>
  );
};