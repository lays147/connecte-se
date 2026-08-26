# Conecte-se Brasil

Este projeto tem por objetivo tentar - da melhor forma possível - compilar todos os eventos de tecnologia que nós temos nesse grande país chamado Brasil.

Nosso foco é fazer pontes: Você e um evento, que pode mudar sua carreira.

## Como contribuir

### Adicionando uma nova fonte (comunidade ou evento)

Você pode sugerir uma nova comunidade ou evento sem precisar editar o YAML manualmente:

1. Vá até a aba **Actions** do repositório.
2. Selecione o workflow **Add Source**.
3. Clique em **Run workflow** e preencha os campos:
   - **name**: nome da comunidade ou evento.
   - **url**: URL da fonte (não pode ser uma URL vinculada a uma data específica, como um link com ano, mês ou dia).
   - **type**: `community` ou `event`.
   - **frequency**: `monthly`, `yearly` ou `occasionally`.
4. Ao rodar, o workflow adiciona a nova fonte em [`sources/communities.yaml`](./sources/communities.yaml) e abre automaticamente um Pull Request com a alteração.
5. O PR passa pela pipeline de checagem, que valida se a URL informada está no ar antes de ser revisado e mergeado.
