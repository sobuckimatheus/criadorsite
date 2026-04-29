export type NicheReference = {
  id: string
  label: string
  keywords: string[]
  avgEngagementRate: number
  benchmarks: {
    micro: { followers: number; engagement: number }
    medio: { followers: number; engagement: number }
    macro: { followers: number; engagement: number }
  }
  bestPostingFrequency: string
  bestFormats: string[]
  bestHashtags: string[]
  contentPillars: string[]
  bioTips: string[]
}

export const NICHE_REFERENCES: NicheReference[] = [
  {
    id: 'saude_estetica',
    label: 'Saúde & Estética',
    keywords: ['estética', 'estetica', 'beleza', 'skin', 'skincare', 'depilação', 'micropigmentação', 'lashes', 'sobrancelha', 'spa', 'massagem', 'dermato', 'dermatologia'],
    avgEngagementRate: 4.2,
    benchmarks: {
      micro: { followers: 5000, engagement: 5.5 },
      medio: { followers: 30000, engagement: 3.8 },
      macro: { followers: 150000, engagement: 2.1 },
    },
    bestPostingFrequency: '5-7x por semana',
    bestFormats: ['Reels de antes/depois', 'Stories com enquetes', 'Carrossel de dicas', 'Lives de procedimentos'],
    bestHashtags: ['#estetica', '#beleza', '#skincare', '#tratamentofacial', '#autoestima', '#cuidadoscomapele'],
    contentPillars: ['Antes e depois', 'Educação sobre procedimentos', 'Depoimentos de clientes', 'Bastidores do estúdio', 'Dicas de autocuidado'],
    bioTips: ['Mencione sua especialidade principal', 'Adicione CTA para agendar', 'Use emojis que remetem a beleza ✨💆‍♀️', 'Inclua localização ou "atendo em [cidade]"'],
  },
  {
    id: 'odontologia',
    label: 'Odontologia',
    keywords: ['dentista', 'odonto', 'odontologia', 'ortodontia', 'implante', 'clareamento', 'sorriso', 'dente', 'invisalign', 'harmonização'],
    avgEngagementRate: 3.8,
    benchmarks: {
      micro: { followers: 3000, engagement: 4.5 },
      medio: { followers: 20000, engagement: 3.2 },
      macro: { followers: 100000, engagement: 1.9 },
    },
    bestPostingFrequency: '4-5x por semana',
    bestFormats: ['Reels de transformações', 'Carrossel educativo', 'Stories de bastidores', 'Depoimentos em vídeo'],
    bestHashtags: ['#dentista', '#odontologia', '#sorrisoliindo', '#clareamentodental', '#saúdebucal', '#implantedental'],
    contentPillars: ['Transformações do sorriso', 'Educação sobre saúde bucal', 'Procedimentos explicados', 'Mitos e verdades', 'Depoimentos reais'],
    bioTips: ['Mencione CRO e especialidade', 'Destaque seu diferencial (ex: "Especialista em sorriso gengival")', 'Link para agendamento online', 'Localização clara'],
  },
  {
    id: 'psicologia',
    label: 'Psicologia & Terapia',
    keywords: ['psicóloga', 'psicologa', 'psicólogo', 'psicologo', 'psicologia', 'terapia', 'terapeuta', 'saúde mental', 'saude mental', 'ansiedade', 'autoconhecimento'],
    avgEngagementRate: 5.1,
    benchmarks: {
      micro: { followers: 4000, engagement: 6.2 },
      medio: { followers: 25000, engagement: 4.3 },
      macro: { followers: 120000, engagement: 2.8 },
    },
    bestPostingFrequency: '4-6x por semana',
    bestFormats: ['Carrossel reflexivo', 'Reels curtos com frases', 'Stories com perguntas', 'Vídeos educativos'],
    bestHashtags: ['#psicologia', '#saudemental', '#terapia', '#autoconhecimento', '#ansiedade', '#bemestaremental'],
    contentPillars: ['Educação em saúde mental', 'Reflexões e frases', 'Dicas práticas de bem-estar', 'Desmistificação da terapia', 'Convite à reflexão'],
    bioTips: ['Mencione CRP', 'Defina seu público-alvo (ex: "Atendo adultos com ansiedade")', 'Consulta online/presencial', 'Mensagem acolhedora no bio'],
  },
  {
    id: 'direito',
    label: 'Direito & Advocacia',
    keywords: ['advogado', 'advogada', 'advocacia', 'direito', 'juridico', 'jurídico', 'oab', 'contrato', 'processo', 'tributário', 'trabalhista', 'família'],
    avgEngagementRate: 3.2,
    benchmarks: {
      micro: { followers: 2000, engagement: 4.0 },
      medio: { followers: 15000, engagement: 2.8 },
      macro: { followers: 80000, engagement: 1.6 },
    },
    bestPostingFrequency: '3-5x por semana',
    bestFormats: ['Carrossel com dicas legais', 'Reels "você sabia?', 'Stories de esclarecimento', 'Vídeos explicativos'],
    bestHashtags: ['#direito', '#advogado', '#dicas jurídicas', '#oab', '#direitobrasileiro', '#consultoriajuridica'],
    contentPillars: ['Dicas legais do dia a dia', 'Mitos sobre o direito', 'Casos hipotéticos', 'Novidades legislativas', 'Direitos do cidadão'],
    bioTips: ['Mencione OAB e área de atuação', 'Evite linguagem muito técnica', 'CTA para consulta inicial', 'Diferencie: "Defendo seus direitos em [área]"'],
  },
  {
    id: 'infoprodutos',
    label: 'Infoprodutos & Educação Online',
    keywords: ['curso', 'mentoria', 'treinamento', 'infoproduto', 'digital', 'online', 'ebook', 'afiliado', 'hotmart', 'kiwify', 'produtor digital'],
    avgEngagementRate: 4.8,
    benchmarks: {
      micro: { followers: 5000, engagement: 5.8 },
      medio: { followers: 50000, engagement: 3.9 },
      macro: { followers: 300000, engagement: 2.2 },
    },
    bestPostingFrequency: '7x por semana',
    bestFormats: ['Reels de valor', 'Carrossel com passo a passo', 'Stories de prova social', 'Lives de conteúdo'],
    bestHashtags: ['#marketingdigital', '#empreendedorismo', '#cursoonline', '#mentoria', '#rendaextra', '#negociodigital'],
    contentPillars: ['Conteúdo de valor gratuito', 'Prova social (alunos)', 'Bastidores do produto', 'Resultados e transformações', 'Lançamentos e ofertas'],
    bioTips: ['Resultado que entrega em números', 'Link direto para o produto', 'Número de alunos ou transformações', 'Proposta de valor clara em 1 linha'],
  },
  {
    id: 'arquitetura',
    label: 'Arquitetura & Design de Interiores',
    keywords: ['arquiteto', 'arquiteta', 'arquitetura', 'design de interiores', 'decoração', 'decoracao', 'projeto', 'reforma', 'interiores', 'paisagismo'],
    avgEngagementRate: 3.5,
    benchmarks: {
      micro: { followers: 3000, engagement: 4.2 },
      medio: { followers: 20000, engagement: 3.0 },
      macro: { followers: 100000, engagement: 1.8 },
    },
    bestPostingFrequency: '4-5x por semana',
    bestFormats: ['Carrossel de projetos', 'Reels de antes/depois', 'Stories do processo criativo', 'Vídeos de tour pelo espaço'],
    bestHashtags: ['#arquitetura', '#designdeinteriores', '#decoracao', '#interiores', '#reforma', '#projeto'],
    contentPillars: ['Portfolio de projetos', 'Antes e depois', 'Dicas de decoração', 'Processo criativo', 'Tendências'],
    bioTips: ['Mencione CAU e especialidade', 'Tipo de projeto (residencial/comercial)', 'Cidade de atuação', 'Portfolio no link'],
  },
  {
    id: 'barbearia',
    label: 'Barbearia & Cabeleireiro',
    keywords: ['barbearia', 'barbeiro', 'cabelo', 'cabeleireiro', 'cabeleireira', 'corte', 'barba', 'hairstylist', 'salão', 'salao', 'hair'],
    avgEngagementRate: 5.3,
    benchmarks: {
      micro: { followers: 3000, engagement: 6.5 },
      medio: { followers: 20000, engagement: 4.2 },
      macro: { followers: 100000, engagement: 2.5 },
    },
    bestPostingFrequency: '5-7x por semana',
    bestFormats: ['Reels de transformação', 'Before/after no carrossel', 'Stories de agenda', 'Vídeos do processo'],
    bestHashtags: ['#barbearia', '#barber', '#cabelo', '#haircut', '#barbershop', '#cabeleireiro'],
    contentPillars: ['Transformações e cortes', 'Técnicas e tendências', 'Bastidores da barbearia', 'Clientes satisfeitos', 'Promoções e agenda'],
    bioTips: ['Endereço ou bairro claro', 'Link para agendamento', 'Especialidade em destaque', 'Horários de funcionamento'],
  },
  {
    id: 'fitness_personal',
    label: 'Fitness & Personal Trainer',
    keywords: ['personal', 'fitness', 'academia', 'musculação', 'musculacao', 'treino', 'nutrição', 'nutricao', 'coach', 'emagrecimento', 'crossfit', 'pilates'],
    avgEngagementRate: 4.9,
    benchmarks: {
      micro: { followers: 5000, engagement: 5.8 },
      medio: { followers: 40000, engagement: 4.0 },
      macro: { followers: 200000, engagement: 2.3 },
    },
    bestPostingFrequency: '6-7x por semana',
    bestFormats: ['Reels de treino', 'Carrossel de dicas', 'Stories de motivação', 'Vídeos de transformação'],
    bestHashtags: ['#personal', '#fitness', '#treino', '#academia', '#emagrecimento', '#vidasaudavel'],
    contentPillars: ['Treinos e exercícios', 'Dicas de nutrição', 'Transformações', 'Motivação', 'Educação fitness'],
    bioTips: ['CREF em destaque', 'Especialidade (emagrecimento, hipertrofia)', 'Resultado que entrega', 'Atendimento online/presencial'],
  },
  {
    id: 'gastronomia',
    label: 'Gastronomia & Alimentação',
    keywords: ['chef', 'cozinheiro', 'gastronomia', 'restaurante', 'confeitaria', 'confeiteiro', 'food', 'culinária', 'culinaria', 'bolo', 'doce', 'salgado', 'buffet'],
    avgEngagementRate: 5.5,
    benchmarks: {
      micro: { followers: 3000, engagement: 6.8 },
      medio: { followers: 25000, engagement: 4.5 },
      macro: { followers: 150000, engagement: 2.7 },
    },
    bestPostingFrequency: '5-7x por semana',
    bestFormats: ['Reels de preparo', 'Fotos de pratos', 'Stories de bastidores', 'Carrossel de receitas'],
    bestHashtags: ['#gastronomia', '#comidaboa', '#chef', '#receita', '#foodphotography', '#culinaria'],
    contentPillars: ['Receitas e preparo', 'Apresentação de pratos', 'Bastidores da cozinha', 'Eventos e pedidos', 'Dicas culinárias'],
    bioTips: ['Tipo de especialidade culinária', 'Entregas/encomendas? Mencione', 'Localização', 'Link para cardápio ou pedidos'],
  },
  {
    id: 'moda_fashion',
    label: 'Moda & Fashion',
    keywords: ['moda', 'fashion', 'estilo', 'roupa', 'loja', 'boutique', 'looks', 'styling', 'stylist', 'tendência', 'tendencia'],
    avgEngagementRate: 4.3,
    benchmarks: {
      micro: { followers: 5000, engagement: 5.2 },
      medio: { followers: 50000, engagement: 3.5 },
      macro: { followers: 300000, engagement: 1.9 },
    },
    bestPostingFrequency: '6-7x por semana',
    bestFormats: ['Reels de looks', 'Carrossel de combinações', 'Stories com enquetes de estilo', 'Haul de produtos'],
    bestHashtags: ['#moda', '#fashion', '#ootd', '#estilo', '#looks', '#modabrasileira'],
    contentPillars: ['Looks do dia', 'Combinações e dicas', 'Tendências da temporada', 'Bastidores da loja', 'Promoções'],
    bioTips: ['Estilo ou nicho de moda', 'Envio nacional? Mencione', 'Link para loja ou catálogo', 'Tamanhos disponíveis se diferencial'],
  },
  {
    id: 'fotografia',
    label: 'Fotografia',
    keywords: ['fotógrafo', 'fotografo', 'fotógrafa', 'fotografa', 'fotografia', 'ensaio', 'casamento', 'newborn', 'foto', 'retratos'],
    avgEngagementRate: 4.6,
    benchmarks: {
      micro: { followers: 3000, engagement: 5.5 },
      medio: { followers: 20000, engagement: 3.8 },
      macro: { followers: 100000, engagement: 2.2 },
    },
    bestPostingFrequency: '4-5x por semana',
    bestFormats: ['Carrossel de ensaio', 'Reels de making of', 'Stories de bastidores', 'Antes/depois de edição'],
    bestHashtags: ['#fotografia', '#fotografo', '#ensaio', '#fotógrafo', '#fotografiabrasileira', '#retratos'],
    contentPillars: ['Portfolio de ensaios', 'Bastidores', 'Dicas fotográficas', 'Depoimentos de clientes', 'Processo criativo'],
    bioTips: ['Especialidade fotográfica', 'Cidade de atuação', 'Link para portfolio ou contato', 'Disponibilidade de agenda'],
  },
  {
    id: 'imobiliario',
    label: 'Imobiliário',
    keywords: ['imobiliária', 'imobiliaria', 'corretor', 'corretora', 'imóvel', 'imovel', 'apartamento', 'casa', 'aluguel', 'venda', 'creci'],
    avgEngagementRate: 2.9,
    benchmarks: {
      micro: { followers: 2000, engagement: 3.8 },
      medio: { followers: 15000, engagement: 2.5 },
      macro: { followers: 80000, engagement: 1.4 },
    },
    bestPostingFrequency: '4-6x por semana',
    bestFormats: ['Reels de tour pelo imóvel', 'Carrossel com fotos', 'Stories com disponibilidade', 'Vídeos de dicas de financiamento'],
    bestHashtags: ['#imobiliaria', '#corretor', '#imovel', '#apartamento', '#compracasa', '#mercadoimobiliario'],
    contentPillars: ['Tour por imóveis', 'Dicas de financiamento', 'Educação sobre compra/venda', 'Oportunidades', 'Mercado imobiliário'],
    bioTips: ['CRECI em destaque', 'Bairros/regiões de atuação', 'Especialidade (residencial/comercial)', 'WhatsApp para atendimento'],
  },
  {
    id: 'educacao',
    label: 'Educação & Ensino',
    keywords: ['professor', 'professora', 'escola', 'aula', 'ensino', 'educação', 'educacao', 'reforço', 'reforco', 'tutoria', 'pedagogia'],
    avgEngagementRate: 4.1,
    benchmarks: {
      micro: { followers: 3000, engagement: 5.0 },
      medio: { followers: 20000, engagement: 3.5 },
      macro: { followers: 100000, engagement: 2.0 },
    },
    bestPostingFrequency: '4-6x por semana',
    bestFormats: ['Carrossel educativo', 'Reels de "sabia que?"', 'Stories com dicas', 'Vídeo-aulas curtas'],
    bestHashtags: ['#educacao', '#professor', '#aprendizado', '#escola', '#dicas', '#conhecimento'],
    contentPillars: ['Conteúdo educativo', 'Dicas de estudo', 'Curiosidades da área', 'Histórias de sucesso de alunos', 'Metodologia'],
    bioTips: ['Área de ensino e nível', 'Aulas presenciais ou online', 'Resultado dos alunos', 'Link para inscrição'],
  },
  {
    id: 'pets',
    label: 'Pets & Animais',
    keywords: ['pet', 'veterinário', 'veterinario', 'cachorro', 'gato', 'animal', 'petshop', 'adestramento', 'banho e tosa', 'zootecnia'],
    avgEngagementRate: 6.2,
    benchmarks: {
      micro: { followers: 3000, engagement: 7.5 },
      medio: { followers: 25000, engagement: 5.0 },
      macro: { followers: 150000, engagement: 3.1 },
    },
    bestPostingFrequency: '6-7x por semana',
    bestFormats: ['Reels fofos', 'Carrossel de dicas', 'Stories de clientes e pets', 'Vídeos de procedimentos'],
    bestHashtags: ['#pet', '#cachorro', '#gato', '#veterinario', '#petlovers', '#petshop'],
    contentPillars: ['Fotos fofas de pets', 'Dicas de cuidados', 'Transformações após banho/tosa', 'Adoção', 'Educação sobre saúde animal'],
    bioTips: ['Serviços oferecidos', 'Localização', 'Atendimento domiciliar? Mencione', 'Link para agendamento'],
  },
  {
    id: 'tecnologia',
    label: 'Tecnologia & TI',
    keywords: ['ti', 'tecnologia', 'programação', 'programacao', 'desenvolvedor', 'developer', 'software', 'startup', 'app', 'sistema', 'suporte'],
    avgEngagementRate: 3.4,
    benchmarks: {
      micro: { followers: 2000, engagement: 4.2 },
      medio: { followers: 15000, engagement: 3.0 },
      macro: { followers: 80000, engagement: 1.7 },
    },
    bestPostingFrequency: '4-5x por semana',
    bestFormats: ['Carrossel técnico', 'Reels de "você sabia?"', 'Stories de projetos', 'Vídeos de demonstração'],
    bestHashtags: ['#tecnologia', '#programacao', '#developer', '#ti', '#software', '#tech'],
    contentPillars: ['Dicas tecnológicas', 'Portfólio de projetos', 'Educação em TI', 'Novidades do setor', 'Bastidores do trabalho'],
    bioTips: ['Stack ou especialidade técnica', 'Tipo de serviço', 'Portfolio no link', 'Atendimento para empresas ou pessoas físicas'],
  },
  {
    id: 'eventos',
    label: 'Eventos & Cerimonial',
    keywords: ['evento', 'casamento', 'festa', 'cerimonial', 'cerimonialista', 'decorador', 'decoração', 'buffet', 'dj', 'fotógrafo de eventos'],
    avgEngagementRate: 4.7,
    benchmarks: {
      micro: { followers: 3000, engagement: 5.8 },
      medio: { followers: 20000, engagement: 4.0 },
      macro: { followers: 100000, engagement: 2.3 },
    },
    bestPostingFrequency: '5-6x por semana',
    bestFormats: ['Reels de eventos', 'Carrossel de decoração', 'Stories de bastidores', 'Depoimentos de clientes'],
    bestHashtags: ['#eventos', '#casamento', '#decoracao', '#festa', '#cerimonial', '#wedding'],
    contentPillars: ['Registro de eventos', 'Decoração e detalhes', 'Bastidores da organização', 'Depoimentos', 'Inspirações'],
    bioTips: ['Tipo de evento especialidade', 'Cidade de atuação', 'Portfólio no link', 'WhatsApp para orçamento'],
  },
  {
    id: 'consultoria',
    label: 'Consultoria & Coaching',
    keywords: ['consultor', 'consultora', 'consultoria', 'coach', 'coaching', 'gestão', 'gestao', 'estratégia', 'estrategia', 'negócios', 'negocios', 'rh'],
    avgEngagementRate: 3.9,
    benchmarks: {
      micro: { followers: 3000, engagement: 4.8 },
      medio: { followers: 20000, engagement: 3.3 },
      macro: { followers: 100000, engagement: 2.0 },
    },
    bestPostingFrequency: '4-6x por semana',
    bestFormats: ['Carrossel de insights', 'Reels de dicas', 'Stories com perguntas', 'Lives de conteúdo'],
    bestHashtags: ['#consultoria', '#coaching', '#lideranca', '#gestao', '#empreendedorismo', '#negocios'],
    contentPillars: ['Insights de negócios', 'Cases de sucesso', 'Dicas práticas', 'Educação empresarial', 'Resultados de clientes'],
    bioTips: ['Resultado que entrega em números', 'Para quem atende', 'Experiência/formação', 'Link para diagnóstico gratuito'],
  },
  {
    id: 'saude_geral',
    label: 'Saúde & Medicina',
    keywords: ['médico', 'medico', 'médica', 'medica', 'saúde', 'saude', 'clinica', 'clínica', 'enfermeiro', 'nutricionista', 'fisioterapeuta', 'farmácia'],
    avgEngagementRate: 3.7,
    benchmarks: {
      micro: { followers: 3000, engagement: 4.5 },
      medio: { followers: 20000, engagement: 3.2 },
      macro: { followers: 100000, engagement: 1.8 },
    },
    bestPostingFrequency: '4-5x por semana',
    bestFormats: ['Carrossel educativo', 'Reels de desmistificação', 'Stories de dicas', 'Vídeos de orientação'],
    bestHashtags: ['#saude', '#medico', '#saudeebemestar', '#prevenção', '#clinica', '#medicina'],
    contentPillars: ['Educação em saúde', 'Prevenção de doenças', 'Mitos e verdades', 'Dicas de bem-estar', 'Orientações médicas'],
    bioTips: ['CRM e especialidade', 'Cidade de atendimento', 'Teleconsulta disponível?', 'Foco em prevenção vs tratamento'],
  },
]

export function detectNiche(profile: {
  biography?: string | null
  category?: string | null
  full_name?: string | null
  username?: string | null
}): NicheReference {
  const text = [
    profile.biography,
    profile.category,
    profile.full_name,
    profile.username,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  let bestMatch: NicheReference = NICHE_REFERENCES[0]
  let bestScore = 0

  for (const niche of NICHE_REFERENCES) {
    const score = niche.keywords.filter((kw) => text.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = niche
    }
  }

  return bestMatch
}
