export type ContentFormat = "YouTube" | "Newsletter" | "Blog" | "Podcast";

export interface CuratedContent {
  name: string;
  fmt: ContentFormat;
  desc: string;
  themes: string[];
  url: string;
}

export const FORMAT_ORDER: ContentFormat[] = ["YouTube", "Newsletter", "Blog", "Podcast"];

export const FORMAT_META: Record<ContentFormat, { accent: string; tint: string; note: string }> = {
  YouTube: { accent: "oklch(0.5 0.17 292)", tint: "#f1ecfd", note: "vídeo, aulas e conversas longas" },
  Newsletter: { accent: "oklch(0.5 0.13 250)", tint: "#eaf0fb", note: "chega por e-mail, leitura semanal" },
  Blog: { accent: "oklch(0.52 0.12 60)", tint: "#faf1e6", note: "texto longo, técnico e opinativo" },
  Podcast: { accent: "oklch(0.48 0.12 165)", tint: "#e8f5ef", note: "áudio para ouvir no deslocamento" },
};

export const THEMES = ["programação", "carreira", "dados & IA", "design & produto", "infra & segurança", "notícias"];

export const CURATED_CONTENT: CuratedContent[] = [
  { name: "Filipe Deschamps", fmt: "YouTube", desc: "Projetos de programação construídos ao vivo, além de vídeos sobre carreira e mercado de tecnologia.", themes: ["programação", "carreira"], url: "https://www.youtube.com/@FilipeDeschamps" },
  { name: "Akitando", fmt: "YouTube", desc: "Fabio Akita explica engenharia de software, história da computação e como pensar sobre a profissão.", themes: ["programação", "carreira"], url: "https://www.youtube.com/@Akitando" },
  { name: "Rocketseat", fmt: "YouTube", desc: "Desenvolvimento web e mobile com React, Node e TypeScript, em aulas e projetos completos.", themes: ["programação"], url: "https://www.youtube.com/@rocketseat" },
  { name: "Curso em Vídeo", fmt: "YouTube", desc: "Gustavo Guanabara ensina lógica, Python, JavaScript e HTML do zero, com cursos gratuitos completos.", themes: ["programação"], url: "https://www.youtube.com/@CursoemVideo" },
  { name: "Erick Wendel", fmt: "YouTube", desc: "JavaScript e Node.js em profundidade: internals, performance e boas práticas de backend.", themes: ["programação"], url: "https://www.youtube.com/@ErickWendelTreinamentos" },
  { name: "Loiane Groner", fmt: "YouTube", desc: "Angular, Java e estruturas de dados, com séries longas e material de apoio aberto.", themes: ["programação"], url: "https://www.youtube.com/@loianegroner" },
  { name: "Fernanda Kipper", fmt: "YouTube", desc: "Programação, projetos de backend e dicas de carreira, por uma engenheira de software brasileira.", themes: ["programação", "carreira"], url: "https://www.youtube.com/@kipperdev" },
  { name: "Rafaella Ballerini", fmt: "YouTube", desc: "Front-end e primeiros passos na área, com foco em quem está começando ou mudando de carreira.", themes: ["carreira", "programação"], url: "https://www.youtube.com/@RafaellaBallerini" },
  { name: "Lucas Montano", fmt: "YouTube", desc: "Conversas sobre mercado de trabalho, entrevistas técnicas e vida de desenvolvedor dentro de grandes empresas.", themes: ["carreira"], url: "https://www.youtube.com/@LucasMontano" },
  { name: "Código Fonte TV", fmt: "YouTube", desc: "Notícias e panorama semanal do mundo da tecnologia, em formato curto e didático.", themes: ["notícias"], url: "https://www.youtube.com/@CodigoFonteTV" },
  { name: "Diolinux", fmt: "YouTube", desc: "Linux, software livre e sistemas operacionais, com testes e notícias do ecossistema.", themes: ["infra & segurança"], url: "https://www.youtube.com/@Diolinux" },
  { name: "Bóson Treinamentos", fmt: "YouTube", desc: "Redes, Linux e banco de dados em aulas técnicas na linha de certificações e fundamentos.", themes: ["infra & segurança"], url: "https://www.youtube.com/@bosontreinamentos" },
  { name: "Programação Dinâmica", fmt: "YouTube", desc: "Ciência de dados, algoritmos e matemática aplicada, sempre partindo da intuição antes do código.", themes: ["dados & IA", "programação"], url: "https://www.youtube.com/@ProgramacaoDinamica" },
  { name: "Téo Me Why", fmt: "YouTube", desc: "Ciência de dados ao vivo: projetos reais de machine learning e engenharia analítica, do início ao fim.", themes: ["dados & IA"], url: "https://www.youtube.com/@TeoMeWhy" },
  { name: "Peixe Babel", fmt: "YouTube", desc: "Mila Laranjeira e Vivi Mota fazem divulgação científica em computação: inteligência artificial, pesquisa e acessibilidade.", themes: ["dados & IA"], url: "https://www.youtube.com/@peixebabel" },

  { name: "Manual do Usuário", fmt: "Newsletter", desc: "Rodrigo Ghedin escreve sobre tecnologia de consumo, privacidade e o cotidiano digital brasileiro.", themes: ["notícias"], url: "https://manualdousuario.net/" },
  { name: "Núcleo Jornalismo", fmt: "Newsletter", desc: "Reportagem sobre plataformas, políticas digitais e o impacto da tecnologia na sociedade.", themes: ["notícias"], url: "https://nucleo.jor.br/" },
  { name: "curso.dev", fmt: "Newsletter", desc: "Filipe Deschamps envia notas sobre programação, produtividade e construção de produto.", themes: ["programação", "carreira"], url: "https://curso.dev/" },
  { name: "MIT Technology Review Brasil", fmt: "Newsletter", desc: "Edição brasileira com análises sobre IA, energia e biotecnologia traduzidas e contextualizadas.", themes: ["dados & IA", "notícias"], url: "https://mittechreview.com.br/" },

  { name: "Blog do Akita", fmt: "Blog", desc: "Textos longos de Fabio Akita sobre arquitetura, Ruby, comunidade e a cultura da engenharia.", themes: ["programação"], url: "https://www.akitaonrails.com/" },
  { name: "UX Collective BR", fmt: "Blog", desc: "Publicação brasileira sobre design de produto, pesquisa e processo, escrita por profissionais da área.", themes: ["design & produto"], url: "https://brasil.uxdesign.cc/" },
  { name: "Tecnoblog", fmt: "Blog", desc: "Análises de produtos, tutoriais e cobertura diária do mercado de tecnologia no Brasil.", themes: ["notícias"], url: "https://tecnoblog.net/" },

  { name: "Hipsters Ponto Tech", fmt: "Podcast", desc: "Conversas semanais sobre desenvolvimento, dados e carreira com convidados do mercado.", themes: ["programação", "carreira"], url: "https://hipsters.tech/" },
  { name: "Data Hackers", fmt: "Podcast", desc: "A comunidade brasileira de dados discute carreira, ferramentas e projetos de analytics e IA.", themes: ["dados & IA"], url: "https://datahackers.substack.com/" },
  { name: "Castálio Podcast", fmt: "Podcast", desc: "Entrevistas longas com desenvolvedores e pessoas de tecnologia sobre trajetória e ofício.", themes: ["carreira", "programação"], url: "https://castalio.info/" },
  { name: "Tecnocast", fmt: "Podcast", desc: "Podcast do Tecnoblog, com discussões aprofundadas sobre um tema de tecnologia por episódio.", themes: ["notícias"], url: "https://tecnoblog.net/tecnocast/" },
  { name: "Dev Sem Fronteiras", fmt: "Podcast", desc: "Histórias de brasileiros que trabalham em tecnologia fora do país, contadas em primeira pessoa.", themes: ["carreira"], url: "https://www.devsemfronteiras.tech/" },
];
