export const mockAnalysis = {
  tecnica: {
    title: "Análise Técnica",
    content: "Sua estrutura facial apresenta uma proporção áurea de 1.618, com mandíbula definida e ângulos harmoniosos. A simetria facial está em 94%, indicando potencial para otimização estética premium."
  },
  harmonia: {
    title: "Harmonia Facial",
    content: "A harmonia entre seus traços faciais sugere um perfil elegante e autoritário. Recomendamos técnicas de contorno para realçar a definição mandibular e equilibrar as proporções."
  },
  plano: {
    title: "Plano de Evolução",
    parts: [
      {
        id: 1,
        title: "Parte 1: Avaliação Inicial",
        content: "Inicie com limpeza profunda e hidratação intensiva. Use produtos específicos para seu tipo de pele.",
        available: true
      },
      {
        id: 2,
        title: "Parte 2: Contorno e Definição",
        content: "Após 7 dias, implemente técnicas de contorno facial para realçar a mandíbula e ângulos faciais.",
        available: false,
        unlockDate: 7
      },
      {
        id: 3,
        title: "Parte 3: Manutenção Avançada",
        content: "Em 14 dias, adicione protocolos de rejuvenescimento com ativos premium.",
        available: false,
        unlockDate: 14
      },
      {
        id: 4,
        title: "Parte 4: Otimização Final",
        content: "Após 21 dias, complete com técnicas de harmonização total para resultado elite.",
        available: false,
        unlockDate: 21
      }
    ]
  }
};