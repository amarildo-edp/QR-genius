import React, { useState } from 'react';
import { Technician, Task, DEFAULT_ACTIVITY_TYPES } from './types';
import { TechnicianCard } from './components/TechnicianCard';
import { TaskCreator } from './components/TaskCreator';
import { TaskList } from './components/TaskList';
import { Users, LayoutDashboard, PlusCircle, Settings, Trash2, Search, QrCode, UserPen } from 'lucide-react';

const INITIAL_TECHS: Technician[] = [
  { id: '1', name: 'João Silva', phone: '5511999990001', specialty: 'Redes e Fibra', available: true },
  { id: '2', name: 'Maria Souza', phone: '5511999990002', specialty: 'Elétrica', available: true },
  { id: '3', name: 'Carlos Oliveira', phone: '5511999990003', specialty: 'Refrigeração', available: false },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'technicians' | 'settings'>('dashboard');
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityTypes, setActivityTypes] = useState<string[]>(DEFAULT_ACTIVITY_TYPES);

  // Add/Edit technician modal state
  const [showTechForm, setShowTechForm] = useState(false);
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [techName, setTechName] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [techSpec, setTechSpec] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Search state for technicians
  const [searchTerm, setSearchTerm] = useState('');

  // Add activity state
  const [newActivityType, setNewActivityType] = useState('');

  const toggleTechStatus = (id: string) => {
    setTechnicians(prev => prev.map(t => 
      t.id === id ? { ...t, available: !t.available } : t
    ));
  };

  const handleCreateTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const resetTechForm = () => {
    setTechName('');
    setTechPhone('');
    setTechSpec('');
    setEditingTechId(null);
    setPhoneError('');
    setShowTechForm(false);
  };

  const handleEditTech = (tech: Technician) => {
    setEditingTechId(tech.id);
    setTechName(tech.name);
    setTechPhone(tech.phone);
    setTechSpec(tech.specialty);
    setShowTechForm(true);
    // Scroll to top of form if needed, handled by UI rendering
  };

  const handleSaveTech = () => {
    if (!techName || !techPhone) return;

    // Phone Validation (basic check for digits)
    const cleanPhone = techPhone.trim().replace(/[^0-9]/g, '');
    
    if (cleanPhone.length < 10) {
      setPhoneError('Mínimo de 10 dígitos (DDI + DDD + Número). Ex: 5511999999999');
      return;
    }

    setPhoneError(''); // Clear error if valid

    if (editingTechId) {
      // Update existing
      setTechnicians(prev => prev.map(t => 
        t.id === editingTechId 
          ? { ...t, name: techName, phone: cleanPhone, specialty: techSpec || 'Geral' } 
          : t
      ));
    } else {
      // Create new
      const newTech: Technician = {
        id: Date.now().toString(),
        name: techName,
        phone: cleanPhone,
        specialty: techSpec || 'Geral',
        available: true
      };
      setTechnicians([...technicians, newTech]);
    }

    resetTechForm();
  };

  const deleteTech = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este técnico?')) {
      setTechnicians(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddActivityType = () => {
    if (newActivityType && !activityTypes.includes(newActivityType)) {
      setActivityTypes([...activityTypes, newActivityType]);
      setNewActivityType('');
    }
  };

  const handleDeleteActivityType = (type: string) => {
    setActivityTypes(activityTypes.filter(t => t !== type));
  };

  // Filter logic
  const filteredTechnicians = technicians.filter(tech => 
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col md:fixed md:h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="mb-4 bg-white/95 rounded-lg p-3 w-fit shadow-lg shadow-black/20">
             <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/EDP_logo_2022.svg" alt="EDP" className="h-8" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Dispatch Quality
          </h1>
          <p className="text-xs text-slate-400 mt-1">Gestão Inteligente de Equipes</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            Despacho
          </button>
          
          <button
            onClick={() => setActiveTab('technicians')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'technicians' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users size={20} />
            Técnicos
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            Configurações
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800 flex items-center justify-center text-slate-500 gap-2">
          <QrCode size={16} />
          <span className="text-xs font-semibold">QR Genis EDP</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Despacho</h2>
              <p className="text-slate-500">Crie ordens de serviço e despache para sua equipe.</p>
            </header>

            <TaskCreator 
              technicians={technicians} 
              activityTypes={activityTypes}
              onTaskCreate={handleCreateTask} 
            />
            
            <TaskList 
              tasks={tasks} 
              technicians={technicians} 
              activityTypes={activityTypes}
              onUpdateTask={handleUpdateTask} 
            />
          </div>
        )}

        {activeTab === 'technicians' && (
          <div className="max-w-4xl mx-auto">
             <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Técnicos</h2>
                <p className="text-slate-500">Gerencie sua equipe de campo.</p>
              </div>
              
              <div className="flex w-full md:w-auto gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou especialidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <button 
                  onClick={() => {
                    resetTechForm();
                    setShowTechForm(!showTechForm);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
                >
                  <PlusCircle size={18} /> Novo Técnico
                </button>
              </div>
            </header>

            {showTechForm && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 animate-fade-in-down">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  {editingTechId ? <><UserPen size={20}/> Editar Técnico</> : <><PlusCircle size={20}/> Cadastrar Técnico</>}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-start">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva" 
                      className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={techName}
                      onChange={e => setTechName(e.target.value)}
                    />
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-slate-500 mb-1 block">WhatsApp (DDI + DDD + Num)</label>
                    <div className={`flex items-center border rounded overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 ${phoneError ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}>
                      <input 
                        type="text" 
                        placeholder="Ex: 5511999990000" 
                        className="flex-1 p-2 outline-none bg-transparent"
                        value={techPhone}
                        onChange={e => {
                          setTechPhone(e.target.value);
                          if (phoneError) setPhoneError('');
                        }}
                      />
                    </div>
                    {phoneError && <p className="text-red-500 text-xs mt-1 ml-1">{phoneError}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Especialidade</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Elétrica, Redes..." 
                      className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={techSpec}
                      onChange={e => setTechSpec(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={resetTechForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                  <button onClick={handleSaveTech} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    {editingTechId ? 'Atualizar Dados' : 'Salvar Técnico'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {filteredTechnicians.length > 0 ? (
                filteredTechnicians.map(tech => (
                  <TechnicianCard 
                    key={tech.id} 
                    tech={tech} 
                    onDelete={deleteTech}
                    onToggleStatus={toggleTechStatus}
                    onEdit={handleEditTech}
                  />
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-slate-300 text-slate-500">
                  Nenhum técnico encontrado com este termo.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Configurações</h2>
              <p className="text-slate-500">Personalize as opções do sistema.</p>
            </header>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Settings size={18} className="text-slate-500"/> Tipos de Atividades
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Gerencie a lista de atividades disponíveis para despacho.
                </p>
              </div>
              
              <div className="p-6">
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Nova atividade (ex: Poda de Árvore)" 
                    className="flex-1 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddActivityType()}
                  />
                  <button 
                    onClick={handleAddActivityType}
                    disabled={!newActivityType}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-2">
                  {activityTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg group hover:bg-white hover:shadow-sm transition-all">
                      <span className="text-slate-700 font-medium">{type}</span>
                      <button 
                        onClick={() => handleDeleteActivityType(type)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="Remover atividade"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {activityTypes.length === 0 && (
                    <p className="text-center text-slate-400 py-4 italic">Nenhuma atividade cadastrada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;