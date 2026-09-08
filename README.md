<img src="./public/favicon.svg" alt="Conecte-se Brasil" width="120" height="100" />

# Conecte-se Brasil

Este projeto tem por objetivo tentar - da melhor forma possível - compilar todos os eventos de tecnologia que nós temos nesse grande país chamado Brasil.

Nosso foco é fazer pontes: Você e um evento, que pode mudar sua carreira.

## Como contribuir

Todas as sugestões seguem o mesmo padrão: abra uma issue usando o formulário guiado correspondente. Um workflow automático valida os dados, adiciona a informação no arquivo certo, abre um Pull Request com a alteração e comenta na própria issue com o link do PR.

### Adicionando uma nova fonte (comunidade ou evento)

1. Vá até a aba **Issues** do repositório e clique em **New issue**.
2. Escolha o template **🔗 Adicionar fonte** e preencha os campos do formulário:
   - **Nome da comunidade ou evento**.
   - **URL da fonte** (não pode ser uma URL vinculada a uma data específica, como um link com ano, mês ou dia).
   - **Tipo de fonte**: `community` ou `event`.
   - **Frequência**: `monthly`, `yearly` ou `occasionally`.
3. Ao enviar a issue, o workflow adiciona a nova fonte em [`sources/communities.yaml`](./sources/communities.yaml), abre um Pull Request com a alteração e comenta na issue com o link do PR.
4. O PR passa pela pipeline de checagem, que valida se a URL informada está no ar antes de ser revisado e mergeado.

### Adicionando um novo evento

1. Vá até a aba **Issues** do repositório e clique em **New issue**.
2. Escolha o template **📅 Adicionar evento** e preencha os campos do formulário.
3. Ao enviar a issue, o workflow valida os dados, adiciona o evento em `data/events-<ano>.json`, abre um Pull Request com a alteração e comenta na issue com o link do PR.

### Adicionando um novo conteúdo (canal, newsletter, blog, podcast ou curso)

1. Vá até a aba **Issues** do repositório e clique em **New issue**.
2. Escolha o template **🎙️ Adicionar conteúdo** e preencha os campos do formulário:
   - **Seção de conteúdo**: `youtube`, `newsletter`, `blog`, `podcast` ou `curso`.
   - **Nome** do canal, newsletter, blog, podcast ou curso.
   - **Descrição curta**.
   - **Temas**, separados por vírgula.
   - **URL do conteúdo** (não pode ser uma URL vinculada a uma data específica, como um link com ano, mês ou dia).
3. Ao enviar a issue, o workflow adiciona o conteúdo em `sources/content.yaml`, abre um Pull Request com a alteração e comenta na issue com o link do PR.
