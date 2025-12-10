import React from 'react';
import { Technician } from '../types';
import { User, CheckCircle, XCircle, MessageCircle, Pencil, Trash2 } from 'lucide-react';

interface TechnicianCardProps {
  tech: Technician;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (tech: Technician) => void;
}

export const TechnicianCard: React.FC<TechnicianCardProps> = ({ tech, onDelete, onToggleStatus, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md transition-shadow gap-4">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${tech.available ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
          <User size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{tech.name}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="font-mono bg-slate-100 px-1 rounded text-xs">{tech.phone}</span> 
            • {tech.specialty}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        <button 
          onClick={() => onToggleStatus(tech.id)}
          className={`text-sm px-3 py-1 rounded-full border flex items-center gap-1 ${
            tech.available 
              ? 'border-green-200 bg-green-50 text-green-700' 
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {tech.available ? <><CheckCircle size={14}/> Disp.</> : <><XCircle size={14}/> Indisp.</>}
        </button>
        
        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <a 
          href={`https://wa.me/${tech.phone}`}
          target="_blank"
          rel="noreferrer"
          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
          title="Testar WhatsApp"
        >
          <MessageCircle size={18} />
        </a>

        <button 
          onClick={() => onEdit(tech)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Editar Técnico"
        >
          <Pencil size={18} />
        </button>

        <button 
          onClick={() => onDelete(tech.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Excluir Técnico"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};