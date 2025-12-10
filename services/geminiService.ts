import { Task, Technician } from "../types";

// Função agora é puramente local e determinística, sem IA
export const generateDispatchMessage = async (
  task: Partial<Task>,
  technician: Technician
): Promise<string> => {
  // Simulando uma promessa para manter compatibilidade com o componente, mas é instantâneo
  return new Promise((resolve) => {
    const message = `Olá ${technician.name},

Segue atividade do dia !

ID: ${task.title}

🛠️ ATIVIDADE: *${task.activity}*
Descrição: ${task.description || 'Sem descrição adicional.'}
📍 Local: ${task.location}
⚠️ Prioridade: *${task.priority}*

Por favor, confirme o recebimento desta mensagem assim que possível.

Atenção SEGURANÇA sempre em primeiro lugar.

Obrigado(a),
Despacho Inteligente.`;

    resolve(message);
  });
};